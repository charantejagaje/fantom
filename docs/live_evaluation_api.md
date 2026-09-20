# Live Data Evaluation — API Contract

Evaluator-uploaded CSVs are analyzed by the SAME pipeline that powers the
platform (statistics, bottleneck screen, robust-z anomalies, what-if slopes,
saved-model inference). Uploads are **evaluation/inference data only**.

## Data separation guarantees (enforced server-side)

| Never touched by evaluation | How it's enforced |
|---|---|
| `data/raw/*` (incl. `model3.csv`) | uploads stored under `data/uploads/<eval_id>.csv` |
| `data/processed/*` (training/clean datasets) | same; uploaded frames cached in memory under their own eval id |
| `ml/saved_models/*` | no retraining path exists in the service |
| registered canonical datasets | upload registered with `kind="evaluation_upload"` |
| application source code | uploads are data files only |

The upload endpoint also **rejects** (4xx, with reason): empty files, files
> 50 MB, non-parsable CSVs, CSVs with < 2 rows, and CSVs with no numeric
columns. Rejection never writes anything.

## Endpoints

### `POST /api/v1/evaluation/upload`
Multipart form field `file` (CSV).

**200**
```json
{
  "evaluation_id": "20260919T204643_431a1428",
  "stored_as": "evaluation:20260919T204643_431a1428",
  "filename": "model3.csv",
  "size_bytes": 514538,
  "records": 3000,
  "features": 12,
  "columns": [{ "name": "...", "dtype": "int64", "missing": 0 }],
  "validation": "passed",
  "note": "Upload stored as evaluation data only; training data and models are untouched."
}
```
**Errors:** `400` empty / not CSV extension · `413` too large · `422` unparsable, too few rows, or no numeric columns.

### `GET /api/v1/evaluation/{evaluation_id}/results`
Runs the pipeline. All results are computed from the upload.

Key fields (all under `results`):
- `records`, `feature_count` — counts from the file
- `throughput` / `utilization` / `cycle_time` — per-metric stats **if** a
  column with that name exists; otherwise the string
  `"Not available in uploaded dataset"`
- `waiting_queue` — queue-style stats: `columns`, `total_queue_mean`,
  `stations[]` (mean/std/p95/max/CV/congestion_share_pct/rank), the
  `bottleneck_rule`, and `potential_bottlenecks` (screen, never "proven causes")
- `bottleneck_indicators` — rule + flagged stations + terminology guardrail
- `anomalies` — robust z-score screen (same method as `/anomalies`), per
  variable: `flagged` count + example rows
- `ml_predictions` — `available: false` with a reason unless a real trained
  model exists in `ml/saved_models/` AND its declared feature columns are
  present in the upload; when available: provenance `model-predicted`,
  prediction counts + summary stats (never fabricated)
- `simulation` — if WIP-like inputs and queue-like outputs exist: a +5%
  demonstration what-if using the platform's marginal-slope method, labeled
  `simulated-estimate`; otherwise a reason string
- `not_available_metrics` — list of metrics the dataset does not support

**Errors:** `404` unknown evaluation id (upload first).

### `GET /api/v1/evaluation/{evaluation_id}/preview?rows=10`
First rows of the stored upload.

## Frontend

`frontend/src/features/live-evaluation/LiveEvaluationFeature.tsx`
- drag/browse upload → validation status card (id, records, features, columns)
- **Start analysis** → results view: metric slots (throughput/utilization/cycle
  time show the NA string when absent), queue table with bottleneck flags,
  anomaly counts, ML availability (honest reasons), simulation table with the
  simulated-estimate disclaimer, and the not-available metric list.

Reached from the platform sidebar: **Live Data Evaluation** (`/platform.html`).
