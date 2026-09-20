"""ML API: registry status + prediction against saved models (no fake results)."""

from pathlib import Path

from fastapi import APIRouter, HTTPException, status

from .. import schemas
from ..config import settings
from ..services import inference_service, ml_service

router = APIRouter(tags=["ml"])


@router.get("/ml", response_model=schemas.MLStatusResponse)
def ml_registry():
    return ml_service.ml_status(Path(settings.ML_MODELS_DIR))


@router.get("/ml/models")
def ml_model_cards():
    """Model cards for the shipped trained artifacts (metrics + limitations)."""
    cards = []
    if inference_service.available_models():
        cards.append(inference_service.surrogate_info())
        cards.append(inference_service.anomaly_info())
    return {"models": cards, "shared_pipeline": True}


@router.post("/ml/queue-surrogate/predict")
def ml_surrogate_predict(features: dict[str, float]):
    """Predict the 8 station queues from WIP inputs via the shared pipeline."""
    if not inference_service.available_models():
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="no trained models registered")
    try:
        return inference_service.surrogate_predict(features)
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/ml/anomaly/score")
def ml_anomaly_score(features: dict[str, float]):
    """Score a WIP input configuration with the saved IsolationForest."""
    if not inference_service.available_models():
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="no trained models registered")
    try:
        return inference_service.anomaly_score(features)
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/ml/predict", response_model=schemas.MLPredictResponse)
def ml_predict(req: schemas.MLPredictRequest):
    try:
        prediction = ml_service.predict(Path(settings.ML_MODELS_DIR), req.model_name, req.features)
    except LookupError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:  # bad artifact, shape mismatch, ...
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"prediction failed: {e}")
    return schemas.MLPredictResponse(model_name=req.model_name, prediction=prediction)
