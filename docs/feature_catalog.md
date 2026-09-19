# Fantom Feature Catalog — facility_sim_full.csv

**Step 3 output.** This documents which columns we consider useful, what role each plays,
and which planned analytics each supports. It builds on the verified meanings in
`docs/assumptions_log.md` — no new assumptions are introduced here.

**Source file:** `data/raw/facility_sim_full.csv` — 605,620 rows × 12 columns,
no missing values, 4 fully duplicated rows, all columns integer counts, all columns vary
(no constants).

---

## 1. Feature roles at a glance

| Column | Role | Verified meaning |
|---|---|---|
| `wip_cell1` | **Input feature** | Work-in-process parts at cell 1 |
| `wip_cell2` | **Input feature** | Work-in-process parts at cell 2 |
| `wip_cell3` | **Input feature** | Work-in-process parts at cell 3 |
| `wip_cell4` | **Input feature** | Work-in-process parts at cell 4 |
| `queue_c1s2` | **Target (output)** | Queue length at cell 1 / station 2 |
| `queue_c1s4` | **Target (output)** | Queue length at cell 1 / station 4 |
| `queue_c2s2` | **Target (output)** | Queue length at cell 2 / station 2 |
| `queue_c2s4` | **Target (output)** | Queue length at cell 2 / station 4 |
| `queue_c3s2` | **Target (output)** | Queue length at cell 3 / station 2 |
| `queue_c3s3` | **Target (output)** | Queue length at cell 3 / station 3 |
| `queue_c4s3` | **Target (output)** | Queue length at cell 4 / station 3 |
| `queue_c4s4` | **Target (output)** | Queue length at cell 4 / station 4 |

## 2. Which analytics each feature supports

| Planned analytics (steps 5–9) | Supported by | How |
|---|---|---|
| **Queue analysis** (Step 5/6) | all 8 `queue_*` columns | Per-station mean/median/max/spread of parts waiting; ranking across stations |
| **Bottleneck detection** (Step 6) | all 8 `queue_*` columns | Stations with persistently high queue levels are **potential bottlenecks** — wording stays observational |
| **Factor / association analysis** (Step 7) | 4 `wip_*` inputs + 8 `queue_*` outputs | Correlation of each cell's WIP with each station's queue; reported as **association**, never causation |
| **What-if simulation** (Step 9) | 4 `wip_*` as inputs, any `queue_*` as output | Surrogate model predicts a station queue for hypothetical WIP levels; results labeled **simulated/estimated** |
| **Throughput / yield / defect / economic analytics** (Step 5/8) | — | **Not supported by this dataset** (no such fields exist — see assumptions log §6). Will activate only with organizer data |

## 3. Features NOT derived yet (deliberately)

- No engineered columns (ratios, totals, load shares) exist yet. Candidates for Step 4:
  - `total_wip` = sum of the 4 cell WIPs (simple facility load indicator)
  - `load_share_cellN` = `wip_cellN / total_wip` (relative loading)
  - per-cell WIP-to-own-station-queue ratios (context-dependent — needs care)
- None are created until Step 4, and each would be produced **into `data/processed/`**, never by modifying raw.

## 4. Modeling notes for later steps (recording facts found so far)

- Inputs live in a similar range (~7.5K–24K); outputs differ by an order of magnitude
  across stations — a plain linear model will likely struggle on the extremes; Step 4 will
  decide on scaling.
- `queue_c1s4` reached **0** at least once (the only queue with a zero) — physically plausible
  (empty queue), worth remembering when log-transforming later.
- 4 duplicate rows exist; Step 4's pipeline should drop them in the **processed** copy and
  record how many were dropped.

## 5. Summary

- **12 useful columns**: 4 inputs + 8 targets; nothing needs to be discarded.
- **Queue-based bottleneck + association + what-if** are fully supported by this dataset.
- **Quality/economic analytics remain data-gapped** — documented, not faked.

---
*Step 3 of 12. Next: Step 4 — safe preprocessing pipeline (works on a processed copy, raw untouched). Last updated: 2026-09-19.*
