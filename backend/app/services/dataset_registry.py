"""Dataset registry service.

Bridges the on-disk data files (never modified) and the database registry.
Known files are auto-registered on first run; roles are assigned from the
documented data dictionary only - no invented meanings.
"""

from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from .. import models

# Roles come from docs/data_dictionary.md (verified in earlier project steps).
# model3.csv answers are ANN predictions -> kind="model_predicted".
DATASET_CATALOG = {
    "facility_sim_clean.csv": {
        "kind": "observed",
        "source": "Rabaev, Pratama & Chan (2019), Mendeley Data 10.17632/3rw227zxt7.2 (CC BY 4.0); cleaned",
        "primary": True,
    },
    "facility_sim_full.csv": {
        "kind": "observed",
        "source": "Rabaev, Pratama & Chan (2019), Mendeley Data 10.17632/3rw227zxt7.2 (CC BY 4.0)",
        "primary": False,
    },
    "model3.csv": {
        "kind": "model_predicted",
        "source": "Same dataset package; ANN training extract (answers are model outputs)",
        "primary": False,
    },
}

INPUT_COLUMNS = {"wip_cell1", "wip_cell2", "wip_cell3", "wip_cell4", "predictor_1", "predictor_2", "predictor_3", "predictor_4"}


def _role_for(column: str) -> str:
    if column in INPUT_COLUMNS or column.startswith(("wip_", "predictor_")):
        return "input"
    if column.startswith(("queue_", "answer_")):
        return "output"
    return "metadata"


def load_dataframe(name: str, processed_dir: Path) -> pd.DataFrame:
    """Load a registered dataset by name (searched in processed then raw dir)."""
    for base in (processed_dir, processed_dir.parent / "raw"):
        p = base / name
        if p.exists():
            return pd.read_csv(p)
    raise FileNotFoundError(f"dataset file not found: {name}")


def sync_registry(db: Session, processed_dir: Path) -> list[models.Dataset]:
    """Register known dataset files in the DB if not already present."""
    registered: list[models.Dataset] = []
    for name, meta in DATASET_CATALOG.items():
        path = processed_dir / name
        if not path.exists():
            raw_alt = processed_dir.parent / "raw" / name
            if not raw_alt.exists():
                continue
            path = raw_alt
        existing = db.query(models.Dataset).filter_by(name=name).first()
        if existing:
            registered.append(existing)
            continue
        df = pd.read_csv(path, nrows=5)
        full_rows = None
        if meta["primary"]:
            # row count for the primary analysis dataset only (cheap enough once)
            full_rows = int(sum(1 for _ in open(path, encoding="utf-8")) - 1)
        ds = models.Dataset(
            name=name,
            kind=meta["kind"],
            file_path=str(path),
            row_count=full_rows,
            column_count=len(df.columns),
            schema_json={c: str(df[c].dtype) for c in df.columns},
            source=meta["source"],
            status="registered",
        )
        db.add(ds)
        db.flush()
        registered.append(ds)
    db.commit()
    return registered


def get_primary_dataset(db: Session) -> models.Dataset | None:
    return (
        db.query(models.Dataset)
        .filter_by(kind="observed", status="registered")
        .order_by(models.Dataset.id)
        .first()
    )
