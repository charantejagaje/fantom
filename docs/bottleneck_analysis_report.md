# Bottleneck Analysis Report — Step 6

**Source:** `data/processed/facility_sim_clean.csv` (605,616 observed simulation runs;
raw data untouched; model3.csv ANN predictions NOT used here).
**Script:** `analytics/bottleneck_analysis.py` · **Generated:** 2026-09-19

**Machine-readable outputs:** `data/processed/bottleneck_station_stats.csv`,
`data/processed/hotspot_conditional_stats.csv`, `data/processed/wip_queue_associations.csv`

**Terminology:** stations are called **potential bottlenecks / congestion hotspots**.
Nothing here proves a definitive physical bottleneck, and no causal claims are made.

---

## 1. Station ranking (observed; rank 1 = longest mean queue)

| Rank | Station | Mean | Median | Std | CV % | P95 | P99 | Max | Congestion share | % of runs with longest queue | Potential bottleneck |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | queue_c1s2 | 10,941 | 10,918 | 1,203 | 11.0 | 12,963 | 13,845 | 17,355 | 24.5% | **57.0%** | **YES** |
| 2 | queue_c4s3 | 10,616 | 10,589 | 1,179 | 11.1 | 12,598 | 13,462 | 16,917 | 23.8% | **42.9%** | **YES** |
| 3 | queue_c4s4 | 6,311 | 6,299 | 1,119 | 17.7 | 8,168 | 8,960 | 11,935 | 14.1% | 0.1% | no |
| 4 | queue_c2s4 | 4,588 | 4,581 | 459 | 10.0 | 5,356 | 5,685 | 6,762 | 10.3% | 0.0% | no |
| 5 | queue_c3s3 | 4,268 | 4,257 | 470 | 11.0 | 5,058 | 5,401 | 6,776 | 9.6% | 0.0% | no |
| 6 | queue_c1s4 | 3,973 | 3,946 | 1,239 | 31.2 | 6,063 | 6,976 | 10,114 | 8.9% | 0.0% | no |
| 7 | queue_c2s2 | 2,866 | 2,860 | 311 | 10.8 | 3,387 | 3,613 | 4,483 | 6.4% | 0.0% | no |
| 8 | queue_c3s2 | 1,102 | 1,093 | 246 | 22.3 | 1,522 | 1,712 | 2,473 | 2.5% | 0.0% | no |

*Congestion share = station mean / sum of all 8 station means (relative indicator).
"% of runs with longest queue" = how often that station held the maximum queue within a
single simulation run (each run has exactly one longest-queue station, so shares sum to ~100%).*

## 2. Evidence for each potential bottleneck

**queue_c1s2 (cell 1, station 2)**
- Longest mean queue of all 8 stations (10,941 parts) and highest single-run peak (17,355)
- Held the facility's longest queue in **57.0% of all 605,616 runs**
- Together with c4s3, one of these two was the most congested station in **~99.9% of runs** —
  congestion is structural (present in virtually every scenario), not occasional

**queue_c4s3 (cell 4, station 3)**
- Second-longest mean queue (10,616) and near-identical P95/P99 profile to c1s2
- Held the longest queue in **42.9% of runs**
- Its average load is ~2.5x the median station load (flag rule: mean > 2x median of means = 5,487)

**Not flagged but worth watching:** `queue_c4s4` (mean 6,311, CV 17.7%) sits below the flag
threshold but above all remaining stations; `queue_c1s4` is the most volatile queue (CV 31.2%)
despite a moderate mean.

## 3. P95 / extreme congestion behavior

- P95 (the queue level exceeded in only 1 of 20 runs) for the two hotspots:
  c1s2 = 12,963 parts, c4s3 = 12,598 parts — i.e., typical congestion is severe and extreme
  congestion adds only ~20-30% on top (CV ~11%: queues are *consistently* high rather than
  spiky).
- By contrast, volatile stations like c1s4 have P95 (6,063) ~53% above their mean (3,973) —
  spiky rather than consistently loaded.
- Practical reading: c1s2/c4s3 congestion would be felt in almost every production scenario,
  while c1s4-type congestion appears mostly in unlucky runs.

## 4. Queue variability (CV = std / mean x 100)

- **Most stable high-load:** c1s2 (11.0%) and c4s3 (11.1%) — persistently loaded
- **Most volatile overall:** c1s4 (31.2%), then c3s2 (22.3%, small but swingy), c4s4 (17.7%)
- **Most stable overall:** c2s4 (10.0%), c2s2 (10.8%), c3s3 (11.0%)

## 5. WIP-to-queue associations (association ONLY — not causation)

Pearson r between each cell's WIP and each station queue (full matrix in
`wip_queue_associations.csv`). Strongest associations:

| Station queue | Cell WIP | r | Reading (association language) |
|---|---|---|---|
| queue_c3s3 | wip_cell3 | **1.000** | near-perfect positive co-movement |
| queue_c4s3 | wip_cell3 | **1.000** | near-perfect positive co-movement |
| queue_c2s2 | wip_cell2 | **0.993** | near-perfect positive co-movement |
| queue_c1s2 | wip_cell2 | **0.992** | near-perfect positive co-movement |
| queue_c4s4 | wip_cell3 | **−0.877** | strong negative co-movement |
| queue_c1s4 | wip_cell1 | **−0.778** | strong negative co-movement |

**Scenario check (low vs high total WIP, bottom/top quartile):** moving from low-WIP to
high-WIP scenarios raises mean queues only modestly — c2s4 +12.2%, c1s2 +6.1%, c4s3 +5.7%,
c3s2 −0.8% (essentially flat). **Hotspot congestion exists at every WIP level.**

⚠️ **Critical caution for Step 7:** the four WIP inputs sum to a nearly constant facility
total (mean 59,363; Q1–Q3 only 58,539–60,188). The WIP columns are therefore strongly
mutually negative — when one cell's WIP rises, the others fall. Single-column correlations
must not be read as independent effects (e.g., "wip_cell3 drives queue_c4s3" and
"wip_cell3 drives queue_c3s3" are entangled with every other cell falling). Step 7 must
address this (e.g., regression on all 4 jointly, or analyzing load *shares*), and results
stay associative.

## 6. Limitations

1. **Simulation data, not factory measurements** — findings describe the Arena model's behavior.
2. **No capacity/utilization fields** — queue length is a congestion *proxy*; a station with
   huge capacity might absorb a long queue without being the true constraint. The flag rule
   (2x median mean) is a transparent, tunable heuristic, not a standard.
3. **No steady-state or timing data** — queues are end-of-run/scenario snapshots; wait *times*
   cannot be derived.
4. **WIP collinearity** (near-constant total) limits interpretation of single-variable
   associations.
5. **No causal claims possible** from observational/simulation scenario data.
6. **Rounding** to whole parts in tables (CSVs keep 2 decimals).

## 7. Exact data columns used

- **Station queues (observed outputs):** `queue_c1s2`, `queue_c1s4`, `queue_c2s2`,
  `queue_c2s4`, `queue_c3s2`, `queue_c3s3`, `queue_c4s3`, `queue_c4s4`
- **Cell inputs (observed):** `wip_cell1`, `wip_cell2`, `wip_cell3`, `wip_cell4`
  (used for total_wip scenario grouping and association matrix)
- **Not used:** anything from `model3.csv` (ANN-predicted values), `model1.csv`, `model2.csv`
- **Derived in memory only:** `total_wip` = sum of the 4 WIP columns (never written back to a dataset)

---
*Step 6 of 12. Next: Step 7 - factor/root-cause association analysis (must handle WIP collinearity).*
