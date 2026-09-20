"""Live Data Evaluation API.

POST /api/v1/evaluation/upload   -> validate + store upload, return eval id + validation report
GET  /api/v1/evaluation/{id}/results -> run the platform analytics over the upload
GET  /api/v1/evaluation/{id}/preview -> first rows of the uploaded file

Separation guarantees (see services/evaluation_service.py):
- uploads are stored under data/uploads/ and never touch data/raw or
  data/processed; no retraining; no writes to ml/saved_models.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models
from ..services import evaluation_service as ev

router = APIRouter(tags=["evaluation"])


@router.post("/evaluation/upload")
async def upload_evaluation(file: UploadFile, db: Session = Depends(get_db)):
    """Validate + accept an evaluator CSV. Returns an evaluation id."""
    try:
        df, path, eval_id = ev.validate_and_load(file)
    except ev.ValidationRejected as e:
        raise HTTPException(e.status_code, detail=e.detail)

    # Register in the DB as an 'evaluation' dataset (separate kind; never 'observed').
    ds = models.Dataset(
        name=f"evaluation:{eval_id}",
        kind="evaluation_upload",
        file_path=str(path),
        row_count=int(len(df)),
        column_count=int(df.shape[1]),
        schema_json={c: str(df[c].dtype) for c in df.columns},
        source=f"evaluator upload: {file.filename}",
        status="uploaded",
    )
    db.add(ds)
    db.commit()

    return {
        "evaluation_id": eval_id,
        "stored_as": ds.name,
        "filename": file.filename,
        "size_bytes": len(path.read_bytes()),
        "records": int(len(df)),
        "features": int(df.shape[1]),
        "columns": [
            {"name": c, "dtype": str(df[c].dtype), "missing": int(df[c].isna().sum())}
            for c in df.columns
        ],
        "validation": "passed",
        "note": "Upload stored as evaluation data only; training data and models are untouched.",
    }


@router.get("/evaluation/{eval_id}/results")
def evaluation_results(eval_id: str):
    """Run the existing analytics/anomaly/simulation/ML pipeline on the upload."""
    return ev.analyze_upload(eval_id)


@router.get("/evaluation/{eval_id}/preview")
def evaluation_preview(eval_id: str, rows: int = 10):
    return {"evaluation_id": eval_id, "rows": ev.load_preview(eval_id, rows)}
