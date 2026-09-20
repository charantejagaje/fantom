# FANTOM — Roles & Permissions

Roles are stored on the `users` table (`worker` | `engineer` | `owner`) and
enforced **in the backend** on every request (JWT → DB lookup → role check).
The frontend navigation is role-aware, but hiding UI is only cosmetic:
changing URLs or replaying tokens cannot grant another role's capabilities.

## Role matrix (API level)

| Capability | Endpoint | worker | engineer | owner |
|---|---|---|---|---|
| Health | `GET /api/v1/health` | ✅ | ✅ | ✅ |
| Register / login / verify / reset | `POST /api/v1/auth/*` | public | public¹ | public¹ |
| Own profile | `GET /api/v1/auth/me` | ✅ | ✅ | ✅ |
| Dataset list/detail | `GET /api/v1/dataset*` | ✅ | ✅ | ✅ |
| Analytics/production/bottlenecks/associations | `GET /api/v1/analytics` etc. | ✅ (read) | ✅ | ✅ |
| Anomaly screens | `GET/POST /api/v1/anomalies` | ✅ (read) | ✅ | ✅ |
| Variable values | `GET /api/v1/variables/{v}/values` | ✅ | ✅ | ✅ |
| ML status & predict | `GET /api/v1/ml*`, `POST /api/v1/ml/predict` | ✅ (read) | ✅ | ✅ |
| What-if simulation | `GET/POST /api/v1/simulation` | ❌ 403 | ✅ | ✅ |
| Recommendations | `/api/v1/recommendations` | ❌ 403 | ✅ | ✅ |
| Live-data evaluation upload | `POST /api/v1/evaluation/upload` | ❌ 403 | ✅ | ✅ |
| Alerts feed | `GET /api/v1/alerts` | ✅ | ✅ | ✅ |
| Recompute alerts from dataset | `POST /api/v1/alerts/refresh` | ❌ 403 | ✅ | ✅ |
| Report an issue | `POST /api/v1/issues` | ✅ | ✅ | ✅ |
| Issues list (scope) | `GET /api/v1/issues` | own only | all | all |
| Update (ack/resolve) issue | `PATCH /api/v1/issues/{id}` | ❌ 403 | ✅ | ✅ |
| List users | `GET /api/v1/auth/users` | ❌ 403 | ❌ 403 | ✅ |
| Assign/invite role | `POST /api/v1/auth/users/promote` | ❌ 403 | ❌ 403 | ✅ |

¹ *Registration policy: `worker` is open. `engineer` requires a valid invite
code (`ENGINEER_INVITE_CODES` env). `owner` can NEVER self-register — an
existing owner must assign it via Users → Assign a role.*

## Frontend workspaces

| | WORKER (mobile-first PWA) | ENGINEER | OWNER |
|---|---|---|---|
| Entry | `/worker.html` (recommended), also `/platform.html` | `/platform.html` | `/platform.html` |
| Navigation | Home · Production · Alerts · Report Issue · Profile | Dashboard · Dataset · Production Analytics · Quality/ML · Bottlenecks · Anomalies · Simulation · Recommendations · Alerts · Issues · Live Data · Team Feature · Profile | Executive Dashboard · Production · Quality · Bottlenecks · Simulations · Recommendations · Alerts · Users · Team Feature · Profile |
| Sees financials | no (not in dataset anyway) | no (not in dataset) | economic panel honestly shows "Not available in current dataset" |
| Admin | none | ops (alerts refresh, issue triage, uploads) | user/role management + ops |

## Data visibility rules

- Workers see their station's observed queue stats and alerts — never owner
  economics or admin endpoints.
- Engineers get the full analytical toolset; no user administration.
- Owners get the executive view + user management; economics stay "not
  available" unless a dataset with cost columns is uploaded.
- Everything shown is labeled with provenance: `observed-simulation`,
  `model-predicted`, or `simulated-estimate`.
- Recommendations are advisory only — possible contributing factors, never
  proven causation; the system never controls machinery.
