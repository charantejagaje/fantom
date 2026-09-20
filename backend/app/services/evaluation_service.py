"""Live Data Evaluation service.

Evaluators upload a NEW manufacturing CSV; it is analyzed with the SAME
services that power the platform (analytics, anomalies, simulation, ML).

Hard separation rules (enforced here):
- Uploads are inference/evaluation data ONLY. They are stored under
  data/uploads/ with a random id and NEVER overwrite or modify:
    * data/raw/* (training/source datasets, model3.csv included)
    * the registered datasets table's canonical entries
    * ml/saved_models/* (no retraining, no model writes)
- Uploaded frames are cached in memory only (never merged into the
  observed-dataset caches used by the platform sections).

Validation gates (reject with 4xx and a reason, never guess):
  1. Non-empty CSV file with a text/csv-ish name/extension.
  2. Parses with pandas; has >= 1 numeric column and >= 2 rows.
  3. Cell count ceiling (memory guard) and single-file size cap.

Metric policy:
- Computed ONLY from columns the upload actually has. Everything the data
  cannot support is reported as "Not available in uploaded dataset".
- Queue-style analytics (means/CV/congestion/bottleneck screen) run when the
  upload contains queue_* or similar count columns; for arbitrary numeric
  columns the same transparent statistics are computed per column.
- Anomaly screening reuses the robust-z method from anomaly_service.
- ML predictions run ONLY if a trained model exists in ml/saved_models and
  the upload provides the model's declared feature columns; otherwise the
  result states why it is unavailable. No fake predictions, no retraining.
"""

import json
import secrets
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import HTTPException, UploadFile, status

from ..config import settings
from .analytics_service import BOTTLENECK_RULE, NOT_AVAILABLE
from .anomaly_service import _robust_z
from .ml_service import _scan as ml_scan
from .ml_service import predict as ml_predict

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB
MAX_UPLOAD_CELLS = 20_000_000        # ~20M cells guard
MIN_ROWS = 2

_uploads_cache: dict[str, pd.DataFrame] = {}

NA = "Not available in uploaded dataset"


class ValidationRejected(Exception):
    """Raised when an upload fails validation; carries the HTTP status."""

    def __init__(self, detail: str, status_code: int = status.HTTP_422_UNPROCESSABLE_ENTITY):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


# --------------------------- validation ---------------------------------

def _numeric_columns(df: pd.DataFrame) -> list[str]:
    return [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]


def validate_and_load(upload: UploadFile) -> tuple[pd.DataFrame, Path, str]:
    """Validate the uploaded file and load it into a DataFrame (cached by eval id)."""
    name = upload.filename or "upload.csv"
    if not name.lower().endswith((".csv", ".txt")):
        raise ValidationRejected("Only .csv (or .txt CSV) files are accepted.", 400)

    data = upload.file.read()
    if not data:
        raise ValidationRejected("The uploaded file is empty.", 400)
    if len(data) > MAX_UPLOAD_BYTES:
        raise ValidationRejected("File exceeds the 50 MB upload limit.", 413)

    try:
        text = data.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            text = data.decode("latin-1")
        except UnicodeDecodeError:
            raise ValidationRejected("File is not decodable text (CSV expected).", 400)

    from io import StringIO

    try:
        df = pd.read_csv(StringIO(text))
    except Exception as e:
        raise ValidationRejected(f"Not a parsable CSV: {e}", 400)

    if df.empty or len(df.columns) == 0:
        raise ValidationRejected("CSV contains no data columns.", 400)
    if len(df) < MIN_ROWS:
        raise ValidationRejected(f"CSV needs at least {MIN_ROWS} rows; got {len(df)}.", 400)

    num_cols = _numeric_columns(df)
    if not num_cols:
        raise ValidationRejected("CSV has no numeric columns to analyze.", 422)
    if df.shape[0] * df.shape[1] > MAX_UPLOAD_CELLS:
        raise ValidationRejected("CSV exceeds the maximum cell count (20M cells).", 413)

    # Persist under data/uploads with a random id (never touches raw/processed).
    upload_dir = Path(settings.DATASET_PROCESSED_DIR).parent / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    eval_id = f"{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}_{secrets.token_hex(4)}"
    path = upload_dir / f"{eval_id}.csv"
    path.write_bytes(data)

    _uploads_cache[eval_id] = df
    return df, path, eval_id


# --------------------------- analysis -----------------------------------

def _safe_stats(s: pd.Series) -> dict | None:
    s = s.dropna()
    if s.empty:
        return None
    q1 = float(np.percentile(s, 25))
    q3 = float(np.percentile(s, 75))
    return {
        "count": int(s.count()),
        "mean": float(s.mean()),
        "std": float(s.std()) if len(s) > 1 else 0.0,
        "min": float(s.min()),
        "p25": q1,
        "median": float(s.median()),
        "p75": q3,
        "p95": float(np.percentile(s, 95)),
        "max": float(s.max()),
        "cv_pct": float(100 * s.std() / s.mean()) if float(s.mean()) else None,
    }


def _queue_like_columns(df: pd.DataFrame) -> list[str]:
    """Columns that look like station queues / counts (documented naming)."""
    qlike = [c for c in df.columns if c.startswith("queue_") or c.startswith("answer_")]
    return [c for c in qlike if pd.api.types.is_numeric_dtype(df[c])]


def _wip_like_columns(df: pd.DataFrame) -> list[str]:
    wlike = [c for c in df.columns if c.startswith(("wip_", "predictor_"))]
    return [c for c in wlike if pd.api.types.is_numeric_dtype(df[c])]


def analyze_upload(eval_id: str) -> dict:
    """Run the platform analytics over a previously validated upload."""
    df = _uploads_cache.get(eval_id)
    if df is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"unknown evaluation id: {eval_id}")

    num_cols = _numeric_columns(df)
    queue_cols = _queue_like_columns(df)
    wip_cols = _wip_like_columns(df)
    target_cols = queue_cols or num_cols  # queue-style framing when identifiable

    # ---------- core statistics ----------
    column_stats = {c: _safe_stats(df[c]) for c in num_cols}
    column_stats = {c: s for c, s in column_stats.items() if s is not None}

    # ---------- throughput / utilization / cycle time (honest availability) ----------
    def _has(*keys: str) -> bool:
        low = {c.lower() for c in df.columns}
        return any(any(k in c for c in low) for k in keys)

    throughput = NA
    utilization = NA
    cycle_time = NA
    if _has("throughput", "units_per_hour", "output_rate"):
        s = df[[c for c in df.columns if any(k in c.lower() for k in ("throughput", "units_per_hour", "output_rate"))][0]]
        st = _safe_stats(s)
        throughput = {"column": s.name, **(st or {})}
    if _has("utilization"):
        s = df[[c for c in df.columns if "utilization" in c.lower()][0]]
        st = _safe_stats(s)
        utilization = {"column": s.name, **(st or {})}
    if _has("cycle_time", "cycletime"):
        s = df[[c for c in df.columns if "cycle_time" in c.lower() or "cycletime" in c.lower()][0]]
        st = _safe_stats(s)
        cycle_time = {"column": s.name, **(st or {})}

    # ---------- queue / waiting information ----------
    waiting = NA
    if queue_cols:
        means = {c: float(df[c].mean()) for c in queue_cols}
        total_mean = float(sum(means.values()))
        threshold = float(np.median(list(means.values())) * 2.0)
        rank_order = sorted(queue_cols, key=lambda c: means[c], reverse=True)
        ranks = {c: i + 1 for i, c in enumerate(rank_order)}
        stations = []
        for c in queue_cols:
            st = column_stats[c]
            stations.append({
                "station": c,
                **st,
                "congestion_share_pct": float(100 * means[c] / total_mean) if total_mean else None,
                "rank": ranks[c],
                "potential_bottleneck": bool(means[c] > threshold),
            })
        waiting = {
            "framing": "queue columns detected; station-style congestion analysis applied",
            "columns": queue_cols,
            "total_queue_mean": total_mean,
            "stations": stations,
            "bottleneck_rule": BOTTLENECK_RULE,
            "potential_bottlenecks": [c for c in queue_cols if means[c] > threshold],
        }
    elif num_cols:
        waiting = {
            "framing": "no queue_* columns; per-column distribution stats shown below",
            "columns": num_cols,
            "stations": [
                {"station": c, **column_stats[c]} for c in num_cols if c in column_stats
            ],
            "bottleneck_rule": BOTTLENECK_RULE + " (not applicable without queue columns)",
            "potential_bottlenecks": [],
        }

    # ---------- bottleneck indicators ----------
    bottlenecks = (
        waiting.get("potential_bottlenecks") if isinstance(waiting, dict) else None
    ) or []

    # ---------- anomaly detection (same robust-z method as the platform) ----------
    anomalies = {"method": "robust z-score (median + 1.4826*MAD)", "by_variable": {}, "flagged_total": 0}
    for c in target_cols[:12]:
        z = _robust_z(df[c])
        idx = np.flatnonzero(np.abs(z) > 3.5)
        anomalies["by_variable"][c] = {
            "flagged": int(len(idx)),
            "examples": [
                {"row_index": int(i), "value": float(df[c].iloc[i]), "z": float(z[i])}
                for i in idx[:5]
            ],
        }
        anomalies["flagged_total"] += int(len(idx))

    # ---------- ML predictions: SAME saved pipeline via inference_service ----------
    # Uses the shared wrapper (declared feature order) - the identical artifacts
    # the platform /ml endpoints serve. No retraining on the upload, ever.
    from . import inference_service

    ml_results: dict = {
        "available": False,
        "reason": NA + " (no trained model registered in ml/saved_models)",
    }
    surrogate_features = [c for c in wip_cols if c in df.columns]
    # The surrogate was trained on predictor_1..4; accept uploads whose columns
    # include the exact declared feature set (wip_* aliases are NOT silently
    # renamed - the evaluator's column names must match the training features).
    ml_runs: list[dict] = []
    if inference_service.available_models():
        try:
            info = inference_service.surrogate_info()
            feats = info["features"]
            if all(f in df.columns for f in feats):
                preds = df[list(feats)].astype(float)
                model = inference_service._load("queue_surrogate")[1]["bundle"]["model"]
                out = model.predict(preds)
                runs = []
                for i, t in enumerate(info["targets"]):
                    runs.append({
                        "target": t,
                        "provenance": "model-predicted",
                        "n_predictions": int(len(out)),
                        "summary": _safe_stats(pd.Series(out[:, i])),
                        "first_values": [float(v) for v in out[:5, i]],
                    })
                ml_runs.append({"model": "queue_surrogate", "runs": runs})
                # anomaly screen on the same declared features (batched)
                detector = inference_service._load("input_anomaly_detector")[1]["bundle"]["model"]
                flagged = int((detector.predict(preds) == -1).sum())
                ml_runs.append({
                    "model": "input_anomaly_detector",
                    "runs": [{
                        "target": "input configuration",
                        "provenance": "model-predicted",
                        "n_predictions": int(len(preds)),
                        "summary": {"flagged_rows": int(flagged),
                                    "flagged_fraction_pct": round(100 * flagged / len(preds), 2)},
                        "limitation": inference_service.anomaly_info()["limitation"],
                    }],
                })
                ml_results = {"available": True, "pipeline": "shared inference_service (same artifacts as /api/v1/ml)", "runs": ml_runs}
            else:
                missing = [f for f in feats if f not in df.columns]
                ml_results = {
                    "available": False,
                    "reason": f"uploaded dataset lacks the model's declared feature columns: {', '.join(missing)}",
                }
        except Exception as e:
            ml_results = {"available": False, "reason": f"inference failed: {e}"}

    # ---------- simulation inputs/results (supported only with wip-style inputs) ----------
    simulation = NA
    if wip_cols and queue_cols:
        from .simulation_service import run_simulation
        try:
            base = {c: 1.05 for c in wip_cols[:1]}  # +5% on the first WIP-like input
            sim = run_simulation.__wrapped__ if hasattr(run_simulation, "__wrapped__") else None
            simulation = {
                "supported": True,
                "note": "demonstration scenario: +5% multiplier on " + wip_cols[0],
                "scenario": base,
                "result": _mini_simulation(df, wip_cols, queue_cols),
            }
        except Exception:
            simulation = NA
    else:
        simulation = {
            "supported": False,
            "reason": "what-if simulation needs WIP-style input columns and queue-style outputs",
        }

    return {
        "evaluation_id": eval_id,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "provenance": "evaluation-upload",
        "dataset_summary": {
            "records": int(len(df)),
            "features": int(df.shape[1]),
            "numeric_features": len(num_cols),
            "queue_like_columns": queue_cols,
            "wip_like_columns": wip_cols,
            "columns": [
                {"name": c, "dtype": str(df[c].dtype), "missing": int(df[c].isna().sum()),
                 "unique": int(df[c].nunique())}
                for c in df.columns
            ],
        },
        "results": {
            "records": int(len(df)),
            "feature_count": int(df.shape[1]),
            "throughput": throughput,
            "utilization": utilization,
            "cycle_time": cycle_time,
            "waiting_queue": waiting,
            "bottleneck_indicators": {
                "rule": BOTTLENECK_RULE,
                "potential_bottlenecks": bottlenecks,
                "terminology": "potential bottleneck / congestion hotspot - NOT a proven root cause",
            },
            "anomalies": anomalies,
            "ml_predictions": ml_results,
            "simulation": simulation,
            "not_available_metrics": NOT_AVAILABLE,
        },
    }


def _mini_simulation(df: pd.DataFrame, wip_cols: list[str], queue_cols: list[str]) -> dict:
    """Small what-if over the uploaded data (+5% on the first WIP-like column).

    Uses the same marginal-slope arithmetic as simulation_service, applied to
    the uploaded frame (never the training data).
    """
    w = wip_cols[0]
    slopes = {st: float(np.polyfit(df[w], df[st], 1)[0]) for st in queue_cols}
    delta_w = 0.05 * float(df[w].mean())
    est = []
    for st in queue_cols:
        d = slopes[st] * delta_w
        est.append({
            "station": st,
            "baseline_mean": round(float(df[st].mean()), 1),
            "simulated_mean": round(max(0.0, float(df[st].mean()) + d), 1),
            "delta": round(d, 1),
            "delta_pct": round(100 * d / float(df[st].mean()), 1) if float(df[st].mean()) else 0.0,
        })
    return {
        "method": "marginal-slope what-if on the uploaded data (same method as platform /simulation)",
        "disclaimer": "Simulated estimate - not causal, not an observed measurement.",
        "stations": est,
    }


def load_preview(eval_id: str, rows: int = 10) -> list[dict]:
    df = _uploads_cache.get(eval_id)
    if df is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"unknown evaluation id: {eval_id}")
    return df.head(rows).to_dict(orient="records")


def cleanup_cache(eval_id: str) -> None:
    _uploads_cache.pop(eval_id, None)
