# Production Metrics Report — Step 5

**Source:** `data/processed/facility_sim_clean.csv` — 605,616 rows (observed simulation
outputs after duplicate removal; raw file untouched). All values below are **observed
simulation data**, not ANN predictions.

**Generated:** 2026-09-19 · **Script:** `analytics/production_metrics.py` ·
**Machine-readable table:** `data/processed/production_metrics.csv`

---

## 1. Queue statistics by station

Formula: `mean`, `median`, `max`, `std` (spread) and `cv_pct = 100 x std / mean`
(coefficient of variation = variability relative to size) computed per `queue_*` column
over all 605,616 runs. Source columns: the 8 `queue_cNsM` columns (see
`docs/assumptions_log.md` for verified meanings).

| Station | Mean queue | Median | Max | Std | CV % | Congestion share* | Rank | Potential bottleneck |
|---|---|---|---|---|---|---|---|---|
| queue_c1s2 | 10,941 | 10,918 | 17,355 | 1,203 | 11.0 | 24.5% | 1 | **YES** |
| queue_c4s3 | 10,616 | 10,589 | 16,917 | 1,179 | 11.1 | 23.8% | 2 | **YES** |
| queue_c4s4 | 6,311 | 6,299 | 11,935 | 1,119 | 17.7 | 14.1% | 3 | no |
| queue_c2s4 | 4,588 | 4,581 | 6,762 | 459 | 10.0 | 10.3% | 4 | no |
| queue_c3s3 | 4,268 | 4,257 | 6,776 | 470 | 11.0 | 9.6% | 5 | no |
| queue_c1s4 | 3,973 | 3,946 | 10,114 | 1,239 | 31.2 | 8.9% | 6 | no |
| queue_c2s2 | 2,866 | 2,860 | 4,483 | 311 | 10.8 | 6.4% | 7 | no |
| queue_c3s2 | 1,102 | 1,093 | 2,473 | 246 | 22.3 | 2.5% | 8 | no |

\* *Congestion share = station mean queue / sum of all 8 station mean queues x 100
(a relative-congestion indicator, not a physical share).*

**Potential bottleneck rule (documented heuristic, tunable):**
`mean queue > 2.0 x median of the 8 station mean queues` (threshold = 5,487).
`queue_c1s2` and `queue_c4s3` exceed it. This is an **observed pattern** indicating
*potential* bottlenecks — the data cannot prove these stations are the root constraint,
and no causal claim is made.

## 2. Mean / maximum / variability — reading the table

- **Highest mean queue:** c1s2 (10,941 parts on average).
- **Highest observed maximum:** c1s2 (17,355 parts in one run).
- **Most variable (CV):** c1s4 (31.2%) — its queue swings the most relative to its size
  (it is also the only station that ever reached 0). c3s2 (22.3%) is small but swingy.
- **Least variable:** c2s4 (10.0%), c2s2 (10.8%).

## 3. WIP statistics by cell (observed inputs)

Formula: same statistics per `wip_cell*` column; `total_wip` = sum of the 4 cell WIPs
per run (computed in memory only; not saved as a dataset column).

| Variable | Mean | Median | Max | CV % |
|---|---|---|---|---|
| wip_cell1 | 14,698 | 14,675 | 21,299 | 10.9 |
| wip_cell2 | 14,909 | 14,875 | 23,940 | 11.2 |
| wip_cell3 | 14,884 | 14,846 | 23,693 | 11.1 |
| wip_cell4 | 14,872 | 14,834 | 23,182 | 11.2 |
| total_wip | 59,363 | — | 63,619 | — |

The four cells carry nearly identical average WIP (~14.7K–14.9K), so facility loading is
balanced at the input level; queue differences between stations therefore come from how
the facility routes/processes that work (structure of the simulation), not from uneven
input loading.

## 4. Station utilization

**NOT CALCULABLE.** No utilization, capacity, cycle-time, or service-rate fields exist in
the delivered dataset (documented in `docs/assumptions_log.md` section 6). Utilization
would require capacity or busy-time data that is absent. Queue *congestion share* is the
closest supported proxy and is reported above with its formula.

## 5. Metrics that could not be calculated, and why

| Metric | Reason |
|---|---|
| Station utilization | No busy-time/capacity fields |
| Throughput | No output-rate or completion-count fields |
| Cycle time / waiting time per part | No timing fields |
| Downtime | No downtime fields |
| Production counts / yield | No part-counter fields in this extract |
| Defect rate / quality metrics | No inspection or defect-label fields |
| Economic metrics (cost, scrap, profit) | No cost/price/margin fields |

None of these were estimated, invented, or proxied numerically.

## 6. Limitations

1. **Simulation, not factory floor:** values describe the Arena discrete-event model of a
   shared facility, not measured production.
2. **Runs are scenarios:** each row is one WIP scenario; no timestamps exist, so no
   time-series or shift analysis is possible.
3. **Bottleneck flag is a heuristic:** the 2x-median rule is transparent and tunable, not
   an industry standard; changing it changes the flags.
4. **Congestion share ignores station capacities:** with per-station capacity data, a
   utilization-style share would be more meaningful.
5. **No causality:** WIP-to-queue relationships are inputs/outputs of the same simulation;
   association analysis (Step 7) may quantify relations but cannot establish causation.
6. **Rounding:** table values rounded to whole parts (machines table keeps 2 decimals).

---
*Step 5 of 12. Next: Step 6 — bottleneck analysis (deeper queue/congestion study).*
