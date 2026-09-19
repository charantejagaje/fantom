# Fantom Data Dictionary — Facility Simulation Dataset

**Source:** Rabaev, M., Pratama, H., & Chan, K. C. (2019). *Manufacturing Data Shared Facility — Discrete-Event Simulation* (Version 2). Mendeley Data. DOI: [10.17632/3rw227zxt7.2](https://doi.org/10.17632/3rw227zxt7.2)

**Licence:** CC BY 4.0 — share/copy/modify allowed with attribution. We converted the MATLAB `.mat` into flat CSVs (see `ml/prepare_datasets.py`), so cite the original authors and indicate modification.

**Domain:** discrete-event simulation (Arena) of a shared manufacturing facility with 4 production cells; each cell feeds shared stations. Predictors are work-in-process (WIP) levels per cell; responses are queue lengths at 8 cell/station combos.

---

## Files in `data/raw/`

| File | Contents |
|---|---|
| `3000Samplesv3.mat` | Original MATLAB file (34.8 MB) — source of truth |
| `facility_sim_full.csv` | 605,620 simulation runs × 12 columns (converted from `Predictors` + `Responses`) |
| `model1.csv` | 3,000 samples — 1 predictor → 3 responses (Model 1 ANN training set) |
| `model2.csv` | 3,000 samples — per-machine predictors/responses/answers (assembly, drilling, milling) |
| `model3.csv` | 3,000 samples — 4 predictors → 8 station answers (Model 3 ANN targets) |
| `matlab_models/` | Pre-trained MATLAB ANN scripts (`c1s2ANN.m` … `Model1ANN.m`) + training scripts |
| `Readme.txt` | Original dataset readme (describes the Arena `.doe` models and PDFs) |
| `Matlab_Models.zip` | Zipped MATLAB models (extracted to `matlab_models/`) |

## Column semantics — `facility_sim_full.csv`

### Predictors (inputs)

| Column | Unit | Range | Meaning |
|---|---|---|---|
| `wip_cell1` | parts | 8,251 – 21,299 | Work-in-process level of cell 1 |
| `wip_cell2` | parts | 8,049 – 23,940 | Work-in-process level of cell 2 |
| `wip_cell3` | parts | 7,454 – 23,693 | Work-in-process level of cell 3 |
| `wip_cell4` | parts | 8,005 – 23,182 | Work-in-process level of cell 4 |

Verified against `x1_step1.xoffset` (per-feature minima) in `c1s2ANN.m`, which match the column minima exactly.

### Responses (outputs)

Queue length (number of parts waiting) at station `sN` of cell `cM`:

| Column | Mean | Max | Note |
|---|---|---|---|
| `queue_c1s2` | 10,941 | 17,355 | Cell 1 / station 2 — heavily loaded |
| `queue_c1s4` | 3,973 | 10,114 | Most variable (σ ≈ 1,239) |
| `queue_c2s2` | 2,866 | 4,483 | |
| `queue_c2s4` | 4,588 | 6,762 | |
| `queue_c3s2` | 1,102 | 2,473 | Lightest loaded |
| `queue_c3s3` | 4,268 | 6,776 | |
| `queue_c4s3` | 10,616 | 16,917 | Cell 4 / station 3 — heavily loaded |
| `queue_c4s4` | 6,311 | 11,935 | |

**Column ordering was verified programmatically:** each column of the `Responses` matrix equals the corresponding `Responsec1s2` … `Responsec4s4` matrix exactly (checked with `np.array_equal` for all 8).

## Column semantics — model files

- **`model1.csv`**: `predictor` (single input, 431–10,811) → `response_1/2/3` (normalised 0–1 station responses; `answer_*` columns in the `.mat` are the trained ANN's outputs, kept in `model2.csv`).
- **`model2.csv`**: `predictor_assembly` (1), `predictor_drilling_1/2`, `predictor_milling_1/2` → `response_assembly/drilling/milling` (true), plus `answer_assembly/drilling/milling` (ANN predictions).
- **`model3.csv`**: `predictor_1..4` → `answer_c1s2 … answer_c4s4` (ANN answers for the 8 stations; the true responses are the `Responses` matrix in `facility_sim_full.csv`).

## How to use in Fantom

1. **Bottleneck story:** `c1s2` and `c4s3` carry ~2–3× the mean queue of other stations → natural "constraint station" narrative for the dashboard.
2. **Surrogate models:** train scikit-learn regressors (or the provided ANN weights ported to Python) to predict queue lengths from WIP levels → real-time what-if "add WIP to cell X" analysis.
3. **Root-cause demo:** regress each queue on all 4 WIP features to show which cell's loading drives which station's congestion.
4. **Gaps vs the hackathon problem statement:** no defect labels, no per-unit economics, no timestamps — if organizer data arrives, treat this as the fallback demo dataset.

## Reproduce

```bash
python ml/prepare_datasets.py
```
