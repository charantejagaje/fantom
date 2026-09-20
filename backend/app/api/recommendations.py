"""Recommendations API: advisory items generated from structured results only."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import settings
from ..db import get_db
from ..services import recommendation_service

router = APIRouter(tags=["recommendations"])


@router.get("/recommendations", response_model=schemas.RecommendationsResponse)
def list_recommendations(db: Session = Depends(get_db)):
    items = (
        db.query(models.Recommendation)
        .order_by(models.Recommendation.id.desc())
        .limit(50)
        .all()
    )
    return schemas.RecommendationsResponse(
        generated_from="structured analytics results stored in the application database",
        items=items,
    )


@router.post("/recommendations", response_model=schemas.RecommendationOut, status_code=status.HTTP_201_CREATED)
def create_recommendation(req: schemas.RecommendationCreate, db: Session = Depends(get_db)):
    """Generate one advisory recommendation from the chosen structured analysis."""
    return recommendation_service.generate_from_analysis(
        db, Path(settings.DATASET_PROCESSED_DIR), req
    )


@router.patch("/recommendations/{rec_id}", response_model=schemas.RecommendationOut)
def review_recommendation(rec_id: int, decision: str, db: Session = Depends(get_db)):
    """Human review: accept or dismiss. The system never acts on its own."""
    if decision not in ("accepted", "dismissed"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="decision must be 'accepted' or 'dismissed'")
    rec = db.get(models.Recommendation, rec_id)
    if not rec:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="recommendation not found")
    rec.status = decision
    db.commit()
    db.refresh(rec)
    return rec
