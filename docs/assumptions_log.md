# Fantom Assumptions Log

**Purpose:** every belief we hold about the dataset is written here with its evidence and
confidence level. Nothing below is treated as fact unless marked **verified**.
Per project rules: we never assume a column's meaning without documentation, and we
never present correlation as causation.

**Dataset:** Rabaev, M., Pratama, H., & Chan, K. C. (2019). *Manufacturing Data Shared
Facility — Discrete-Event Simulation* (Version 2). Mendeley Data.
DOI: 10.17632/3rw227zxt7.2 — Licence: CC BY 4.0 (attribution required, modification indicated).

**Confidence levels used:** `verified` (checked against in-dataset evidence) /
`likely` (supported but not proven) / `assumed` (plausible, unconfirmed).

---

## 1. What the dataset is (about the whole system)

| # | Assumption | Confidence | Evidence |
|---|---|---|---|
| 1.1 | Data comes from a discrete-event simulation (Arena, v15) of a shared manufacturing facility, not from a real factory | **verified** | Dataset Readme.txt: "generated using Arena Simulation"; models described as `.doe` Arena files |
| 1.2 | The facility has 4 production cells; cell/station pairs like `c1s2` mean "cell 1, station 2" | **verified** | Readme.txt describes cells and stations; the 8 response names are `c1s2, c1s4, c2s2, c2s4, c3s2, c3s3, c4s3, c4s4` |
| 1.3 | Each row of `facility_sim_full.csv` is one simulation run / experiment observation with 4 inputs and 8 outputs | **verified** | `Predictors` (605,620 × 4) and `Responses` (605,620 × 8) matrices have matching row counts; column correspondence checked exactly with `np.array_equal` |
| 1.4 | `model1/2/3.csv` are ANN training extracts (3,000 samples each) derived from the simulation experiments | **verified** | Readme.txt: "Model X.csv resulting dataset file, was used to run an experiment"; the `Matlab Models/` zip contains one ANN per station (`c1s2ANN.m` etc.) trained on exactly these sizes |

## 2. Column meanings — `facility_sim_full.csv`

| Column | Believed meaning | Confidence | Evidence |
|---|---|---|---|
| `wip_cell1`…`wip_cell4` | Work-in-process level (number of parts) at cells 1–4, the model inputs | **verified** | ANN input normalization constants (`xoffset`) in `c1s2ANN.m` equal each column's observed minimum exactly (8251, 8049, 7454, 8005); input dimension is 4 in every ANN file |
| `queue_c1s2`…`queue_c4s4` | Number of parts waiting (queue length) at station sN of cell cM, the model outputs | **verified** | Each `Responses` column equals the corresponding `Responsec1s2…c4s4` matrix exactly; each ANN maps 4 inputs → 1 output matching one station; Readme describes "queue … features representing number of parts waiting to be processed" |
| — | Queue values are counts of parts (integers ≥ 0) | **verified** | All 8 columns are int64; observed minimum is 0 (c1s4) and 88 (c3s2) |

## 3. Column meanings — `model1.csv` (labels are generic, semantics assumed)

| Column | Believed meaning | Confidence | Evidence |
|---|---|---|---|
| `predictor` | Single model input (431–10,811 range), some workload/loading measure | **assumed** | Only name evidence; no official column documentation available to us |
| `response_1/2/3` | Three model outputs, normalized to 0–1 | **assumed** | Values bounded in [0, 1]; `Model1Response` used as ANN target in `Model1Script.m`. Which real quantity each response is (e.g., utilization vs queue ratio) is NOT documented in our files |

## 4. Column meanings — `model2.csv` (machine names documented, semantics partly assumed)

| Column | Believed meaning | Confidence | Evidence |
|---|---|---|---|
| `predictor_assembly`, `predictor_drilling_1/2`, `predictor_milling_1/2` | Inputs for the three machine types (drilling/milling have 2 inputs each) | **verified** (structure) | `Model2ScriptDrilling.m` uses `Model2PredictorDrilling` (2 columns); `Model2ANNDrilling.m` has 2 inputs. Machine names assembly/drilling/milling appear in the ANN/script filenames |
| `response_assembly/drilling/milling` | True simulation outputs per machine | **verified** (structure) | Used as ANN targets in the corresponding scripts |
| `answer_assembly/drilling/milling` | The pre-trained ANN's predictions (model output, not ground truth) | **verified** | `Model2Answer*` matrices; `Model1Answer` matches ANN outputs in `.mat` |
| What the response values physically measure | Unknown — possibly utilization or queue-derived metric | **assumed** | No documentation in Readme.txt; response_1 in model1 is bounded 0–1 like a utilization ratio, but this is NOT confirmed |

## 5. Column meanings — `model3.csv`

| Column | Believed meaning | Confidence | Evidence |
|---|---|---|---|
| `predictor_1`…`predictor_4` | Same 4 cell inputs as in the full dataset | **verified** | `Model3Predictors` is (3000 × 4) uint16; ANN files for c1s2…c4s4 take 4 inputs |
| `answer_c1s2`…`answer_c4s4` | ANN predictions of the 8 station queues (normalized) | **verified** (role) | `Model3Answer*` are (3000 × 1) floats 0–1, one per station ANN. Values are model outputs, NOT observed simulation results |

## 6. Known gaps (things the dataset does NOT contain)

Per project rules, we will not invent any of the following. If the hackathon organizers
provide real data containing them, these sections become available:

- **No defect labels / defect types / inspection results** → quality analytics limited to anomaly-style checks on observed values only.
- **No cycle times, waiting times, utilization percentages, downtime** (the Readme mentions "utilization" as a feature group of the fuller Model 3 variant, but that variant is not among the delivered files) → utilization-based bottleneck analysis not possible yet; queue-based analysis only.
- **No economic/cost fields** → economic impact analysis not supported by this data.
- **No timestamps or batch IDs** → no time-series or shift analysis.

## 7. Statistical observations recorded during inspection (facts, not causes)

- Duplicate fully-identical rows found: `facility_sim_full.csv` = 4 of 605,620 (0.0007%); model files = 0.
- No missing values in any of the 4 CSVs.
- Queue scale differs strongly across stations (means from ~1,102 at c3s2 to ~10,941 at c1s2) — this is an **observed pattern**, not a cause.

## 8. Open questions for the team / organizers

1. Can we obtain the Model 3 "utilization" variant CSV mentioned in Readme.txt? (Would unlock utilization-based bottleneck analysis.)
2. Will organizer data include defect labels and economics? (Determines whether Steps 5/8 apply.)
3. Confirm whether "response" values in model1/model2 are utilization-like ratios before using them in any labeled chart.

---
*Maintained by the analytics role. Update this file whenever a new assumption appears or an assumption is confirmed/refuted. Last updated: 2026-09-19.*
