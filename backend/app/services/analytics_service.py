"""Analytics service - computes metrics from the OBSERVED simulation dataset.

Scope rules encoded here (mirrors docs/production_metrics_report.md):
- Only metrics supported by the actual columns are computed.
- Utilization/throughput/cycle-time/defect/cost metrics are NOT invented; the
  API reports them as not available.
- Bottleneck output uses the documented screen: mean queue > 2x median of the
  8 station mean queues, phrased as *potential* bottleneck.
- Associations are reported as associations, never causation.
"""

import numpy as np
import pandas as pd

from ..schemas import (
    AnalyticsSummary,
    AssociationResponse,
    AssociationRow,
    BottleneckResponse,
    StationStats,
    VariableStats,
)
from .dataset_service import dataframe_for

STATIONS = [
    "queue_c1s2", "queue_c1s4", "queue_c2s2", "queue_c2s4",
    "queue_c3s2", "queue_c3s3", "queue_c4s3", "queue_c4s4",
]
CELLS = ["wip_cell1", "wip_cell2", "wip_cell3", "wip_cell4"]

NOT_AVAILABLE = [
    "utilization", "throughput", "cycle time", "waiting time per part",
    "downtime", "production counts", "defect/quality metrics",
    "economic/cost metrics",
]
BOTTLENECK_RULE = "mean queue > 2.0 x median of the 8 station mean queues"

_cache: dict = {}


def observed_frame(processed_dir) -> pd.DataFrame:
    """The primary observed dataset: data/processed/facility_sim_clean.csv."""
    key = "primary"
    if key in _cache:
        return _cache[key]
    p = processed_dir / "facility_sim_clean.csv"
    df = pd.read_csv(p)
    _cache[key] = df
    return df


def _percentile(s: pd.Series, q: float) -> float:
    return float(np.percentile(s.to_numpy(), q))


def _variable_stats(df: pd.DataFrame, col: str) -> VariableStats:
    s = df[col]
    return VariableStats(
        variable=col,
        count=int(s.count()),
        mean=float(s.mean()),
        std=float(s.std()),
        min=float(s.min()),
        p25=_percentile(s, 25),
        median=float(s.median()),
        p75=_percentile(s, 75),
        p95=_percentile(s, 95),
        max=float(s.max()),
    )


def analytics_summary(processed_dir) -> AnalyticsSummary:
    df = observed_frame(processed_dir)
    variables = [_variable_stats(df, c) for c in CELLS + STATIONS]
    station_means = {st: float(df[st].mean()) for st in STATIONS}
    threshold = float(np.median(list(station_means.values())) * 2.0)
    hotspots = [st for st in STATIONS if station_means[st] > threshold]
    return AnalyticsSummary(
        provenance="observed-simulation",
        dataset="facility_sim_clean.csv",
        row_count=int(len(df)),
        variables=variables,
        wip_totals={
            "total_wip_mean": float(sum(float(df[c].mean()) for c in CELLS)),
            "per_cell_means": {c: float(df[c].mean()) for c in CELLS},
        },
        total_queue_mean=float(sum(station_means.values())),
        bottleneck_rule=BOTTLENECK_RULE,
        potential_bottlenecks=hotspots,
    )


def station_statistics(processed_dir) -> list[StationStats]:
    df = observed_frame(processed_dir)
    means = {st: float(df[st].mean()) for st in STATIONS}
    total_mean = sum(means.values())
    threshold = float(np.median(list(means.values())) * 2.0)
    rank_order = sorted(STATIONS, key=lambda st: means[st], reverse=True)
    ranks = {st: i + 1 for i, st in enumerate(rank_order)}
    out: list[StationStats] = []
    for st in STATIONS:
        s = df[st]
        out.append(
            StationStats(
                station=st,
                mean=means[st],
                median=float(s.median()),
                std=float(s.std()),
                cv_pct=float(100 * s.std() / s.mean()) if s.mean() else 0.0,
                p95=_percentile(s, 95),
                max=float(s.max()),
                congestion_share_pct=float(100 * means[st] / total_mean),
                rank=ranks[st],
                potential_bottleneck=bool(means[st] > threshold),
            )
        )
    return out


def bottlenecks(processed_dir) -> BottleneckResponse:
    stations = station_statistics(processed_dir)
    return BottleneckResponse(
        provenance="observed-simulation",
        rule=BOTTLENECK_RULE,
        potential_bottlenecks=[s.station for s in stations if s.potential_bottleneck],
        stations=stations,
    )


def associations(processed_dir) -> AssociationResponse:
    """Marginal WIP-queue associations (Step 7 style, honest and simple).

    Note: the full conditional/joint share-based model lives in
    analytics/factor_association.py; this service exposes the marginal
    screen for the API and points to the script for the joint view.
    """
    df = observed_frame(processed_dir)
    rows: list[AssociationRow] = []
    n = int(len(df))
    for w in CELLS:
        for st in STATIONS:
            r = float(df[w].corr(df[st]))
            slope = float(np.polyfit(df[w], df[st], 1)[0])
            rows.append(AssociationRow(wip_variable=w, station=st, pearson_r=r, slope=slope, n=n))
    return AssociationResponse(
        provenance="observed-simulation",
        note=(
            "Marginal Pearson associations between cell WIP inputs and station queues. "
            "The four WIP variables compose a near-constant facility total, so single-column "
            "coefficients must not be read as independent effects. "
            "Use analytics/factor_association.py (joint share-based OLS) for the conditional view."
        ),
        rows=rows,
        diagnostic_note="See docs/factor_association_report.md for VIF/condition-number diagnostics.",
    )
