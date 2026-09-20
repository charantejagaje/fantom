"""Core API: health + dataset registry endpoints."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from .. import schemas
from ..config import settings
from ..db import get_db
from ..services import dataset_registry, dataset_service
from ..services.ml_service import ml_status

router = APIRouter(tags=["core"])


@router.get("/health", response_model=schemas.HealthResponse)
def health(db: Session = Depends(get_db)):
    db_ok = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = "unavailable"
    ml = ml_status(Path(settings.ML_MODELS_DIR))
    ds_ok = (Path(settings.DATASET_PROCESSED_DIR) / "facility_sim_clean.csv").exists()
    return schemas.HealthResponse(
        status="ok" if (db_ok == "connected" and ds_ok) else "degraded",
        app=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        database=db_ok,
        dataset_loaded=ds_ok,
        ml_models_loaded=[m.name for m in ml.models if m.loaded],
        time=__import__("datetime").datetime.now(__import__("datetime").timezone.utc),
    )


@router.get("/dataset", response_model=list[schemas.DatasetOut])
def list_datasets(db: Session = Depends(get_db)):
    dataset_registry.sync_registry(db, Path(settings.DATASET_PROCESSED_DIR))
    return db.query(dataset_registry.models.Dataset).order_by(dataset_registry.models.Dataset.id).all()


@router.get("/dataset/{name}", response_model=schemas.DatasetDetail)
def dataset_detail(name: str, db: Session = Depends(get_db)):
    dataset_registry.sync_registry(db, Path(settings.DATASET_PROCESSED_DIR))
    ds = (
        db.query(dataset_registry.models.Dataset)
        .filter_by(name=name)
        .first()
    )
    if not ds:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"dataset not registered: {name}")
    return dataset_service.build_dataset_detail(
        name=ds.name,
        file_path=ds.file_path,
        kind=ds.kind,
        row_count=ds.row_count,
        column_count=ds.column_count,
        source=ds.source,
        status=ds.status,
        dataset_id=ds.id,
    )
