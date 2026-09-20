"""Anomaly detection service.

Transparent statistical screening (robust z-score) over the observed
simulation variables. This is a screen for review, not a verdict: flagged
points are "unusual vs the observed distribution", nothing more.
"""

import numpy as np
import pandas as pd

from ..schemas import AnomalyResponse
from .analytics_service import CELLS, STATIONS, observed_frame


def _robust_z(s: pd.Series) -> np.ndarray:
    med = float(s.median())
    mad = float((s - med).abs().median())
    if mad == 0:
        sd = float(s.std()) or 1.0
        return ((s - med) / (1.4826 * sd)).to_numpy()
    return ((s - med) / (1.4826 * mad)).to_numpy()


def detect_anomalies(processed_dir, variable: str | None, threshold_z: float) -> AnomalyResponse:
    df = observed_frame(processed_dir)
    targets = [variable] if variable else CELLS + STATIONS
    unknown = [t for t in targets if t not in df.columns]
    if unknown:
        raise KeyError(f"unknown variable(s): {', '.join(unknown)}")

    by_variable: dict[str, list[dict]] = {}
    total_flagged = 0
    for t in targets:
        z = _robust_z(df[t])
        idx = np.flatnonzero(np.abs(z) > threshold_z)
        total_flagged += len(idx)
        by_variable[t] = [
            {
                "row_index": int(i),
                "value": float(df[t].iloc[i]),
                "z": float(z[i]),
            }
            for i in idx[:50]  # cap payload; counts below are full
        ]

    return AnomalyResponse(
        provenance="observed-simulation",
        method="robust z-score (median + 1.4826*MAD)",
        disclaimer=(
            "Statistical screen over observed simulation runs. Flagged rows are unusual "
            "relative to the observed distribution - review triggers, not confirmed defects."
        ),
        threshold_z=threshold_z,
        total_points_scored=int(len(df) * len(targets)),
        anomalies_flagged=int(total_flagged),
        by_variable=by_variable,
    )
