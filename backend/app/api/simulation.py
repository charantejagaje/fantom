"""Simulation API: what-if runs (stored in DB, labeled simulated-estimate)."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import settings
from ..db import get_db
from ..services import simulation_service

router = APIRouter(tags=["simulation"])


@router.post("/simulation", response_model=schemas.SimulationResponse)
def run_simulation(req: schemas.SimulationRequest, db: Session = Depends(get_db)):
    run = models.SimulationRun(scenario_json=req.wip_multipliers, status="pending")
    db.add(run)
    db.commit()
    db.refresh(run)
    try:
        result = simulation_service.run_simulation(
            Path(settings.DATASET_PROCESSED_DIR), req.wip_multipliers, req.label
        )
        run.status = "completed"
        run.result_json = result.model_dump()
        db.commit()
        return result
    except KeyError as e:
        run.status = "failed"
        run.result_json = {"error": str(e)}
        db.commit()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/simulation", response_model=list[schemas.SimulationRequest])
def recent_scenarios(db: Session = Depends(get_db)):
    """Recent what-if scenarios (registered scenarios only, no invented results)."""
    runs = (
        db.query(models.SimulationRun)
        .filter_by(status="completed")
        .order_by(models.SimulationRun.id.desc())
        .limit(20)
        .all()
    )
    return [schemas.SimulationRequest(wip_multipliers=r.scenario_json) for r in runs]
