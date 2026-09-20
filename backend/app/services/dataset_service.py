"""Dataset loading + detail payload assembly (pandas, read-only on disk)."""

from pathlib import Path

import pandas as pd
from fastapi import HTTPException, status

from ..schemas import DatasetColumn, DatasetDetail
from .dataset_registry import _role_for

_cache: dict[str, pd.DataFrame] = {}


def dataframe_for(file_path: str, mtime_cache: bool = True) -> pd.DataFrame:
    """Load a CSV with mtime-based caching (never writes to the file)."""
    p = Path(file_path)
    key = str(p)
    mtime = p.stat().st_mtime
    if mtime_cache and key in _cache:
        df, cached_mtime = _cache[key]
        if cached_mtime == mtime:
            return df
    df = pd.read_csv(p)
    _cache[key] = (df, mtime)
    return df


def build_dataset_detail(
    name: str,
    file_path: str,
    kind: str,
    row_count: int | None,
    column_count: int | None,
    source: str | None,
    status: str,
    dataset_id: int,
    max_preview: int = 20,
) -> DatasetDetail:
    try:
        df = dataframe_for(file_path)
    except FileNotFoundError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))

    columns = [
        DatasetColumn(
            name=c,
            dtype=str(df[c].dtype),
            role=_role_for(c),  # type: ignore[arg-type]
            missing=int(df[c].isna().sum()),
            unique=int(df[c].nunique()),
        )
        for c in df.columns
    ]
    return DatasetDetail(
        id=dataset_id,
        name=name,
        kind=kind,
        file_path=file_path,
        row_count=row_count if row_count is not None else int(len(df)),
        column_count=column_count if column_count is not None else int(df.shape[1]),
        source=source,
        status=status,
        columns=columns,
        preview_rows=df.head(max_preview).to_dict(orient="records"),
        provenance="model-predicted" if kind == "model_predicted" else "observed-simulation",
    )
