"""Shared model inference - the SINGLE wrapper every caller must use.

Both the platform /ml endpoints and the Live Data Evaluation feature go
through this service, guaranteeing the SAME preprocessing (declared feature
order from the model metadata) and the SAME trained artifacts.

No retraining happens here; artifacts are loaded read-only from
ml/saved_models/ (training lives in ml/train_queue_surrogate.py).
"""

from pathlib import Path

import joblib
import numpy as np

from ..config import settings

_cache: dict[str, tuple[object, dict]] = {}


def _load(name: str):
    """Load a saved model bundle once (read-only)."""
    if name in _cache:
        return _cache[name]
    path = Path(settings.ML_MODELS_DIR) / f"{name}.joblib"
    if not path.exists():
        raise LookupError(f"model artifact not found: {path}")
    bundle = joblib.load(path)
    model = bundle["model"]
    meta = bundle.get("meta", {})
    _cache[name] = (model, {"bundle": bundle, "meta": meta})
    return _cache[name]


def surrogate_info() -> dict:
    _, ctx = _load("queue_surrogate")
    meta = ctx["meta"]
    return {
        "model_type": meta.get("model_type"),
        "features": meta.get("features"),
        "targets": meta.get("targets"),
        "metrics_test_overall": meta.get("metrics_test_overall"),
        "trained_at": meta.get("trained_at"),
        "provenance": "model-predicted",
        "limitation": meta.get("limitation"),
    }


def surrogate_predict(features: dict[str, float]) -> dict:
    """Predict all 8 station queues from a WIP feature dict (declared order)."""
    _, ctx = _load("queue_surrogate")
    bundle = ctx["bundle"]
    feat_names = bundle["features"]
    targets = bundle["targets"]
    missing = [f for f in feat_names if f not in features]
    if missing:
        raise ValueError(f"missing features: {', '.join(missing)}")
    X = [[float(features[f]) for f in feat_names]]
    preds = bundle["model"].predict(X)[0]
    return {
        "provenance": "model-predicted",
        "model": "queue_surrogate",
        "predictions": {t: float(p) for t, p in zip(targets, preds)},
        "disclaimer": "Surrogate model estimates of station queues - not observed measurements.",
    }


def anomaly_info() -> dict:
    _, ctx = _load("input_anomaly_detector")
    meta = ctx["meta"]
    return {
        "model_type": meta.get("model_type"),
        "features": meta.get("features"),
        "evaluation": meta.get("evaluation"),
        "trained_at": meta.get("trained_at"),
        "provenance": "model-predicted",
        "limitation": meta.get("limitation"),
    }


def anomaly_score(features: dict[str, float]) -> dict:
    """Score one input configuration; returns decision_function + label."""
    _, ctx = _load("input_anomaly_detector")
    bundle = ctx["bundle"]
    feat_names = bundle["features"]
    missing = [f for f in feat_names if f not in features]
    if missing:
        raise ValueError(f"missing features: {', '.join(missing)}")
    X = [[float(features[f]) for f in feat_names]]
    label = bundle["model"].predict(X)[0]  # 1 normal, -1 flagged
    score = bundle["model"].decision_function(X)[0]
    return {
        "provenance": "model-predicted",
        "model": "input_anomaly_detector",
        "flagged": bool(label == -1),
        "score": float(score),
        "interpretation": "score < 0 means unusual input configuration vs training corpus",
        "limitation": "Flags unusual WIP input configurations, not defects.",
    }


def available_models() -> list[str]:
    out = []
    for name in ("queue_surrogate", "input_anomaly_detector"):
        if (Path(settings.ML_MODELS_DIR) / f"{name}.joblib").exists():
            out.append(name)
    return out
