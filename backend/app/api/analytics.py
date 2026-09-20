"""Analytics API: summary, production stats, bottlenecks, associations, anomalies."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status

from .. import schemas
from ..config import settings
from ..db import get_db
from ..services import analytics_service, anomaly_service, dataset_registry
from ..services.dataset_service import dataframe_for

router = APIRouter(tags=["analytics"])


def _processed_dir() -> Path:
    return Path(settings.DATASET_PROCESSED_DIR)


@router.get("/analytics", response_model=schemas.AnalyticsSummary)
def analytics_summary():
    """Full variable statistics from the observed dataset (queue + WIP)."""
    return analytics_service.analytics_summary(_processed_dir())


@router.get("/production", response_model=schemas.AnalyticsSummary)
def production():
    """Production view of the same observed statistics.

    Honest scope: the dataset supports queue/WIP statistics only. Utilization,
    throughput, cycle time, waiting time, and economic metrics do not exist in
    the source data and are reported as not available rather than invented.
    """
    return analytics_service.analytics_summary(_processed_dir())


@router.get("/bottlenecks", response_model=schemas.BottleneckResponse)
def bottlenecks():
    return analytics_service.bottlenecks(_processed_dir())


@router.get("/associations", response_model=schemas.AssociationResponse)
def associations():
    return analytics_service.associations(_processed_dir())


@router.get("/anomalies", response_model=schemas.AnomalyResponse)
def anomalies_get(threshold_z: float = 3.5, variable: str | None = None):
    try:
        return anomaly_service.detect_anomalies(_processed_dir(), variable, threshold_z)
    except KeyError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/anomalies", response_model=schemas.AnomalyResponse)
def anomalies_post(req: schemas.AnomalyRequest):
    try:
        return anomaly_service.detect_anomalies(_processed_dir(), req.variable, req.threshold_z)
    except KeyError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/variables/{variable}/values")
def variable_values(variable: str, limit: int = 5000):
    """Raw observed values of one variable (capped) for frontend charts."""
    df = analytics_service.observed_frame(_processed_dir())
    if variable not in df.columns:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"unknown variable: {variable}")
    vals = df[variable].head(limit)
    return {
        "variable": variable,
        "provenance": "observed-simulation",
        "count": int(len(vals)),
        "values": [float(v) for v in vals],
    }
