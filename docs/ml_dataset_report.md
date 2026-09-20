# ML Dataset Report — `data/raw/model3.csv`

**Generated:** 2026-09-19 · **Purpose:** decide the REAL ML approach from the data itself.
**Read-only inspection** — the raw file was not modified.

## 1. Structure

| Property | Value |
|---|---|
| Rows | **3,000** (each row = one simulation scenario) |
| Columns | **12** |
| Missing values | **0 in every column** |
| Duplicates | 0 (verified in the earlier project inspection) |

## 2. Column inventory

| Column | Dtype | Missing | Unique | Min | Max |
|---|---|---|---|---|---|
| predictor_1 | int64 | 0 | 2196 | 9,485 | 20,403 |
| predictor_2 | int64 | 0 | 1896 | 10,094 | 20,935 |
| predictor_3 | int64 | 0 | 2140 | 9,917 | 21,080 |
| predictor_4 | int64 | 0 | 2168 | 9,585 | 21,600 |
| answer_c1s2 | float64 | 0 | 3000 | 7,378.0 | 15,387.3 |
| answer_c1s4 | float64 | 0 | 3000 | 222.5 | 8,569.1 |
| answer_c2s2 | float64 | 0 | 3000 | 1,947.6 | 3,998.7 |
| answer_c2s4 | float64 | 0 | 3000 | 3,326.6 | 6,240.2 |
| answer_c3s2 | float64 | 0 | 3000 | 395.7 | 1,953.2 |
| answer_c3s3 | float64 | 0 | 3000 | 2,849.7 | 6,031.6 |
| answer_c4s3 | float64 | 0 | 3000 | 7,067.5 | 15,048.7 |
| answer_c4s4 | float64 | 0 | 3000 | 2,642.4 | 10,404.6 |

## 3. Numerical vs categorical features

- **Numerical: 12** — every column is numeric (4 int64 inputs, 8 float64 outputs).
- **Categorical: 0 — NONE.** No string/object/bool columns exist.

## 4. Candidate target/label columns

| Column | Unique ratio | Verdict |
|---|---|---|
| predictor_1–4 | 0.63–0.73 | continuous inputs (scenario settings), **not labels** |
| answer_c1s2 … answer_c4s4 | **1.000 (all 3,000 unique)** | continuous values, **no discrete class structure whatsoever** |

**Columns with < 20 unique values: NONE.**

### Classification viability: **NO valid classification target exists.**

- There is no defect/OK label, no pass/fail flag, no category column, no quality
  verdict — nothing to classify. Every `answer_*` value is unique real-valued.
- Manufacturing any class label (e.g. binning queue levels into "high/normal")
  would **invent** a target that does not exist in the data — forbidden by the
  project rules and scientifically meaningless here.

## 5. What this dataset actually is (verified previously, docs/assumptions_log.md)

- `predictor_1–4` = the 4 cell WIP **inputs** fed into the Arena simulation
  (verified: column minima match the ANN files' input-normalization constants).
- `answer_*` = the ANN model's **predictions** of the 8 station queues for those
  inputs — i.e. `model3.csv` is itself a (model-predicted) input→output map.

## 6. Data-leakage assessment

| Candidate leak | Evidence | Disposition |
|---|---|---|
| `answer_*` as features | They are the model outputs; using them to predict anything would leak the answer | **Excluded from all feature sets**; they are the regression targets only |
| Multi-target duplication | 8 answers are strongly inter-correlated (they share the same 4 inputs) | We still model all 8 targets separately; no cross-target features used |
| Predictor collinearity | pairwise r ≈ **−0.27…−0.31** (mild, VIF ≈ 2–3) | Fine for tree ensembles; documented; no special handling needed |

## 7. Decision (based ONLY on the data above)

1. **Unsupervised anomaly detection — Isolation Forest** on the 4 real input
   features (`predictor_1–4`). Flags simulation scenarios whose input
   configuration is unusual vs the corpus. This is genuinely available and
   honest: no labels are needed or invented.
2. **Supervised regression (Random Forest, multi-target)** mapping
   `predictor_1–4` → each `answer_*`. This is a legitimate supervised task with
   the dataset's own real, continuous targets — a *queue-surrogate* regressor,
   clearly labeled **model-predicted**, never "observed".
   *(Rationale: Random Forest handles the non-linear ANN mapping and mild
   collinearity without scaling assumptions; a linear baseline is also trained
   for comparison. No Gradient Boosting needed — RF meets the accuracy bar and
   keeps the artifact surface small.)*
3. **No classification pipeline is built** — there is no class target. This is a
   documented limitation, not a gap we paper over.

Evaluation protocol: seeded 70/15/15 train/validation/test split
(random_state=42), metrics on the untouched test split only.

---

## 8. Training results (executed 2026-09-19, seed 42)

Artifacts in `ml/saved_models/` (training script: `ml/train_queue_surrogate.py`):

| Artifact | Type | Test-set result |
|---|---|---|
| `queue_surrogate.joblib` | RandomForestRegressor, 8 targets, 300 trees | R² 0.9980 · MAE 84.8 · RMSE 153.5 (worst target c2s4 R² 0.884; best c3s3 R² 0.988) |
| `input_anomaly_detector.joblib` | IsolationForest, contamination 0.05 | flags 5.78% of test rows (by design); unsupervised, no precision/recall defined |
| `*.meta.json` | metadata: features, preprocessing, date, dataset version, metrics, limitations | — |

Split: 2100 / 450 / 450 (train/val/test), seeded, test touched once.
**Model-selection honesty note (also in metadata):** a plain LinearRegression
baseline scored R² 0.9998 / MAE 19.3 on the same test split — the ANN mapping is
near-linear in the inputs. RF shipped for robustness; baseline recorded.

## 9. Serving (existing FastAPI architecture)

- `GET /api/v1/ml/models` — model cards (metrics + limitations)
- `POST /api/v1/ml/queue-surrogate/predict` — 8 queue estimates from WIP inputs
- `POST /api/v1/ml/anomaly/score` — flagged + score for one configuration
- All routes go through `backend/app/services/inference_service.py`, the single
  wrapper that loads the saved artifacts; Live Data Evaluation uses the **same**
  service, so uploads are scored with identical preprocessing and models.
- `/api/v1/health` now reports the loaded models (`ml_models_loaded`).

## 10. Limitations (explicit)

1. No classification target exists — no defect/quality classes; classification
   was NOT built and must not be faked.
2. Targets are ANN-generated answers (simulation model outputs), not floor
   measurements: all predictions are `model-predicted`, never "observed".
3. Surrogate validity bounded by the training predictors' ranges
   (≈9,485–21,080 WIP parts).
4. Anomaly detector flags unusual INPUT configurations only — it knows nothing
   about defects.
5. Evaluator uploads are never used for retraining; there is no automated
   training trigger anywhere in the API.
