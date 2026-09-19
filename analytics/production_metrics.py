"""Production metrics from OBSERVED simulation data.

Input : data/processed/facility_sim_clean.csv  (the cleaned copy - never the raw file)
Output: data/processed/production_metrics.csv          (metric table)
        docs/production_metrics_report.md              (metrics report)

Rules this script follows:
  - Only metrics supported by existing columns are calculated.
  - Utilization / throughput / cycle time / defect rate / costs are NOT in the
    dataset, so they are explicitly reported as NOT CALCULABLE (never invented).
  - Queue results are OBSERVED SIMULATION OUTPUTS (facility_sim_clean.csv),
    not ANN predictions from model3.csv.
  - Bottleneck wording is "potential bottleneck" (an observed pattern),
    never a causal claim.

Usage (from the repo root):
    python analytics/production_metrics.py
"""

from datetime import datetime
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
CLEAN_FILE = ROOT / "data" / "processed" / "facility_sim_clean.csv"
METRICS_FILE = ROOT / "data" / "processed" / "production_metrics.csv"
REPORT_FILE = ROOT / "docs" / "production_metrics_report.md"

STATIONS = [
    "queue_c1s2", "queue_c1s4", "queue_c2s2", "queue_c2s4",
    "queue_c3s2", "queue_c3s3", "queue_c4s3", "queue_c4s4",
]
CELLS = ["wip_cell1", "wip_cell2", "wip_cell3", "wip_cell4"]

# Simple, documented heuristic: a station is flagged as a POTENTIAL bottleneck
# when its mean queue is more than 2x the median of all station mean queues.
# This is a tunable rule, not a law - it is stated in the report.
BOTTLENECK_FACTOR = 2.0


def fmt(x: float) -> str:
    """Format a number for the report (0 decimals, thousands separator)."""
    return f"{x:,.0f}"


def main() -> None:
    df = pd.read_csv(CLEAN_FILE)
    print(f"Loaded: {CLEAN_FILE.relative_to(ROOT)}  ({len(df):,} rows x {df.shape[1]} cols)")

    # ------------------------------------------------------------------
    # 1) Queue statistics per station (observed simulation outputs)
    # ------------------------------------------------------------------
    rows = []
    for st in STATIONS:
        s = df[st]
        rows.append({
            "variable": st,
            "kind": "station queue (observed)",
            "rows": len(s),
            "mean": s.mean(),
            "median": s.median(),
            "std": s.std(),
            "cv_pct": 100 * s.std() / s.mean(),   # variability: std as % of mean
            "min": s.min(),
            "p90": s.quantile(0.90),
            "p95": s.quantile(0.95),
            "max": s.max(),
            "zeros": int((s == 0).sum()),
        })
    q = pd.DataFrame(rows)

    # Relative congestion: each station's share of the total mean queue load,
    # and its rank (1 = longest average queue).
    total_mean = q["mean"].sum()
    q["congestion_share_pct"] = 100 * q["mean"] / total_mean
    q["congestion_rank"] = q["mean"].rank(ascending=False).astype(int)

    # Potential bottleneck flag (documented heuristic, see report).
    threshold = BOTTLENECK_FACTOR * q["mean"].median()
    q["potential_bottleneck"] = q["mean"] > threshold
    q["flag_rule"] = f"mean > {BOTTLENECK_FACTOR}x median of station means ({fmt(threshold)})"

    # ------------------------------------------------------------------
    # 2) WIP statistics per cell (observed simulation inputs)
    # ------------------------------------------------------------------
    wrows = []
    for c in CELLS:
        s = df[c]
        wrows.append({
            "variable": c,
            "kind": "cell WIP (observed input)",
            "rows": len(s),
            "mean": s.mean(),
            "median": s.median(),
            "std": s.std(),
            "cv_pct": 100 * s.std() / s.mean(),
            "min": s.min(),
            "p90": s.quantile(0.90),
            "p95": s.quantile(0.95),
            "max": s.max(),
            "zeros": int((s == 0).sum()),
        })
    w = pd.DataFrame(wrows)

    # Facility-level WIP: total work-in-process across the 4 cells per row.
    df["total_wip_tmp"] = df[CELLS].sum(axis=1)   # temporary column, not saved
    total_wip = {
        "variable": "total_wip (all 4 cells)",
        "kind": "facility WIP (observed input)",
        "rows": len(df),
        "mean": df["total_wip_tmp"].mean(),
        "median": df["total_wip_tmp"].median(),
        "std": df["total_wip_tmp"].std(),
        "cv_pct": 100 * df["total_wip_tmp"].std() / df["total_wip_tmp"].mean(),
        "min": df["total_wip_tmp"].min(),
        "p90": df["total_wip_tmp"].quantile(0.90),
        "p95": df["total_wip_tmp"].quantile(0.95),
        "max": df["total_wip_tmp"].max(),
        "zeros": int((df["total_wip_tmp"] == 0).sum()),
    }

    metrics = pd.concat([q, w, pd.DataFrame([total_wip])], ignore_index=True)
    metrics = metrics.round(2)
    METRICS_FILE.parent.mkdir(parents=True, exist_ok=True)
    metrics.to_csv(METRICS_FILE, index=False)

    # ------------------------------------------------------------------
    # 3) Console summary (ASCII only - Windows console safe)
    # ------------------------------------------------------------------
    print("\n=== QUEUE STATISTICS PER STATION (observed) ===")
    cols = ["variable", "mean", "median", "std", "cv_pct", "max", "congestion_share_pct", "congestion_rank", "potential_bottleneck"]
    print(q[cols].round(1).to_string(index=False))

    print("\n=== WIP STATISTICS PER CELL (observed) ===")
    print(w[["variable", "mean", "median", "std", "max"]].round(1).to_string(index=False))
    print(f"Total facility WIP: mean={fmt(total_wip['mean'])}, max={fmt(total_wip['max'])}")

    print("\n=== NOT CALCULABLE (fields do not exist in the dataset) ===")
    for m in ["Station utilization", "Throughput", "Cycle time", "Waiting time per part",
              "Downtime", "Production counts", "Defect rate / quality metrics",
              "Any economic metrics (cost, scrap, profit)"]:
        print(f"  - {m}: NOT CALCULABLE")

    print(f"\nMetrics table saved to: {METRICS_FILE.relative_to(ROOT)}")
    print(f"(Report writing is handled separately; see docs/production_metrics_report.md)")


if __name__ == "__main__":
    main()
