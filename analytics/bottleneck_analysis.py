"""Bottleneck analysis on OBSERVED simulation data (Step 6).

Input : data/processed/facility_sim_clean.csv
Outputs (all in data/processed/):
  bottleneck_station_stats.csv   - per-station queue statistics + ranking + evidence
  wip_queue_associations.csv     - Pearson correlations WIP <-> queues (associations only)
  hotspot_conditional_stats.csv  - station queues under low vs high total WIP scenarios

Terminology rules:
  - flagged stations are called "potential bottlenecks" / "congestion hotspots"
  - correlations are reported as ASSOCIATIONS, never causation
  - no utilization/throughput/defect/cost metrics (fields do not exist)

Usage (from the repo root):
    python analytics/bottleneck_analysis.py
"""

import sys
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
CLEAN_FILE = ROOT / "data" / "processed" / "facility_sim_clean.csv"
OUT_DIR = ROOT / "data" / "processed"

STATIONS = [
    "queue_c1s2", "queue_c1s4", "queue_c2s2", "queue_c2s4",
    "queue_c3s2", "queue_c3s3", "queue_c4s3", "queue_c4s4",
]
CELLS = ["wip_cell1", "wip_cell2", "wip_cell3", "wip_cell4"]
EXPECTED = CELLS + STATIONS

BOTTLENECK_FACTOR = 2.0  # same documented heuristic as Step 5


def main() -> None:
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    df = pd.read_csv(CLEAN_FILE)
    print(f"Loaded {CLEAN_FILE.relative_to(ROOT)}: {len(df):,} rows")

    missing = [c for c in EXPECTED if c not in df.columns]
    if missing:
        print(f"STOP: expected columns missing: {missing}")
        sys.exit(1)
    queues = df[STATIONS]
    total_wip = df[CELLS].sum(axis=1)

    # ------------------------------------------------------------------
    # 1) Per-station statistics + congestion share + ranking
    # ------------------------------------------------------------------
    stats = pd.DataFrame({
        "mean": queues.mean(),
        "median": queues.median(),
        "std": queues.std(),
        "cv_pct": 100 * queues.std() / queues.mean(),
        "p90": queues.quantile(0.90),
        "p95": queues.quantile(0.95),
        "p99": queues.quantile(0.99),
        "max": queues.max(),
        "iqr": queues.quantile(0.75) - queues.quantile(0.25),
    })
    stats["congestion_share_pct"] = 100 * stats["mean"] / stats["mean"].sum()
    stats["congestion_rank"] = stats["mean"].rank(ascending=False).astype(int)

    # How often does each station hold the LONGEST queue within a single run?
    longest_counts = queues.idxmax(axis=1).value_counts()
    stats["pct_runs_longest_queue"] = (100 * longest_counts / len(df)).reindex(stats.index).fillna(0)

    # Flag potential bottlenecks (documented 2x-median heuristic from Step 5).
    threshold = BOTTLENECK_FACTOR * stats["mean"].median()
    stats["potential_bottleneck"] = stats["mean"] > threshold
    stats["flag_threshold"] = f"mean > {BOTTLENECK_FACTOR}x median of means ({threshold:,.0f})"
    stats = stats.sort_values("congestion_rank")
    stats.round(2).to_csv(OUT_DIR / "bottleneck_station_stats.csv")

    # ------------------------------------------------------------------
    # 2) Extreme congestion: low vs high total-WIP scenarios (association)
    # ------------------------------------------------------------------
    q25, q75 = total_wip.quantile(0.25), total_wip.quantile(0.75)
    low_mask = total_wip <= q25
    high_mask = total_wip >= q75
    cond_rows = []
    for st in STATIONS:
        cond_rows.append({
            "station": st,
            "mean_queue_low_wip_25pct": queues.loc[low_mask, st].mean(),
            "mean_queue_high_wip_25pct": queues.loc[high_mask, st].mean(),
            "increase_low_to_high_pct": 100 * (
                queues.loc[high_mask, st].mean() / queues.loc[low_mask, st].mean() - 1
            ),
            "p95_all_runs": stats.loc[st, "p95"],
            "max_all_runs": stats.loc[st, "max"],
        })
    cond = pd.DataFrame(cond_rows)
    cond.round(2).to_csv(OUT_DIR / "hotspot_conditional_stats.csv", index=False)

    # ------------------------------------------------------------------
    # 3) WIP-to-queue ASSOCIATIONS (Pearson r; not causation)
    # ------------------------------------------------------------------
    corr = pd.DataFrame(index=CELLS, columns=STATIONS, dtype=float)
    for c in CELLS:
        for st in STATIONS:
            corr.loc[c, st] = df[c].corr(df[st])
    corr.round(4).to_csv(OUT_DIR / "wip_queue_associations.csv")
    corr_t = corr.T  # stations as rows for printing

    # ------------------------------------------------------------------
    # 4) Console summary (ASCII only)
    # ------------------------------------------------------------------
    print("\n=== STATION RANKING (observed; rank 1 = longest mean queue) ===")
    show = ["mean", "median", "p95", "p99", "max", "cv_pct", "congestion_share_pct",
            "pct_runs_longest_queue", "potential_bottleneck"]
    print(stats[show].round(1).to_string())

    print("\n=== LOW vs HIGH TOTAL-WIP SCENARIOS (association, not causation) ===")
    print(f"low-WIP group: total_wip <= {q25:,.0f}  |  high-WIP group: total_wip >= {q75:,.0f}")
    print(cond.round(1).to_string(index=False))

    print("\n=== WIP-QUEUE PEARSON ASSOCIATIONS (r) ===")
    print(corr_t.round(3).to_string())

    print("\n=== FLAGGED POTENTIAL BOTTLENECKS ===")
    for st in stats.index[stats["potential_bottleneck"]]:
        r = stats.loc[st]
        print(f"  {st}: mean={r['mean']:,.0f} (rank {r['congestion_rank']}), "
              f"P95={r['p95']:,.0f}, max={r['max']:,.0f}, "
              f"share={r['congestion_share_pct']:.1f}%, "
              f"longest-queue in {r['pct_runs_longest_queue']:.1f}% of runs")

    print("\nSaved:")
    for f in ["bottleneck_station_stats.csv", "hotspot_conditional_stats.csv",
              "wip_queue_associations.csv"]:
        print(f"  - data/processed/{f}")


if __name__ == "__main__":
    main()
