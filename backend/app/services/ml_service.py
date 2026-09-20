"""ML model integration point.

Loads *real* saved models from ml/saved_models/ when they exist. Until a
trained artifact is present, the API reports the registry as empty and
refuses to predict - we do not fabricate model outputs.

Supported formats for drop-in models:
- joblib files named  <name>.joblib  with an optional sidecar
  <name>.meta.json {"trained_on": "...", "features": [...], "notes": "..."}
- the object should expose .predict(X) (sklearn-style)
"""

import json
from pathlib import Path

import joblib

from ..schemas import MLStatusResponse, ModelInfo


class ModelEntry:
    def __init__(self, name: str, path: Path, model: object | None, meta: dict):
        self.name = name
        self.path = path
        self.model = model
        self.meta = meta


_registry: dict[str, ModelEntry] = {}
_scanned_dir: str | None = None


def _scan(models_dir: Path) -> None:
    global _scanned_dir
    key = str(models_dir)
    if _scanned_dir == key:
        return
    _registry.clear()
    if models_dir.exists():
        for p in sorted(models_dir.glob("*.joblib")):
            meta_path = p.with_suffix(".meta.json")
            meta = {}
            if meta_path.exists():
                try:
                    meta = json.loads(meta_path.read_text(encoding="utf-8"))
                except Exception:
                    meta = {}
            try:
                model = joblib.load(p)
            except Exception:
                model = None
            _registry[p.stem] = ModelEntry(p.stem, p, model, meta)
    _scanned_dir = key


def ml_status(models_dir: Path) -> MLStatusResponse:
    _scan(models_dir)
    models = [
        ModelInfo(
            name=e.name,
            path=str(e.path),
            loaded=e.model is not None,
            kind=e.meta.get("kind") or type(e.model).__name__ if e.model else e.meta.get("kind"),
            trained_on=e.meta.get("trained_on"),
            notes=e.meta.get("notes"),
        )
        for e in _registry.values()
    ]
    return MLStatusResponse(
        registry_dir=str(models_dir),
        models=models,
        integration_note=(
            "Drop a trained sklearn-style artifact (<name>.joblib + optional "
            "<name>.meta.json) into this directory; it is picked up without code "
            "changes. No placeholder models are shipped and no predictions are "
            "fabricated."
        ),
    )


def predict(models_dir: Path, model_name: str, features: dict[str, float]):
    _scan(models_dir)
    entry = _registry.get(model_name)
    if entry is None or entry.model is None:
        raise LookupError(
            f"model '{model_name}' is not available in the registry; "
            "train and save it to ml/saved_models first"
        )
    import pandas as pd

    # Artifacts may be either a bare sklearn-style model or a bundle
    # {"model": <estimator>, "features": [...], "targets": [...], ...}.
    obj = entry.model
    feature_names = entry.meta.get("features")
    if isinstance(obj, dict) and hasattr(obj.get("model"), "predict"):
        feature_names = obj.get("features") or feature_names
        obj = obj["model"]
    if feature_names:
        X = pd.DataFrame([[features.get(f) for f in feature_names]], columns=feature_names)
        if X.iloc[0].isna().any():
            missing = [f for f, v in zip(feature_names, X.iloc[0]) if v is None or pd.isna(v)]
            raise ValueError(f"missing features for {model_name}: {', '.join(missing)}")
    else:
        X = pd.DataFrame([features])
    pred = obj.predict(X)
    return pred.tolist()[0]
