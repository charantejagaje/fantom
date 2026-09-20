# FANTOM — Deployment Guide

Full-stack, multi-role Industrial Decision Support System.
Frontend (React/Vite + nginx) → FastAPI → PostgreSQL → Analytics/ML over the
observed manufacturing dataset. No step requires Docker on end-user phones:
workers just open the URL and "Add to Home Screen".

---

## 1. Local development (no Docker)

```bash
# 1) Configure
cp .env.example .env            # dev defaults work out of the box

# 2) Backend (SQLite fallback; PostgreSQL optional)
pip install -r backend/requirements.txt
cd backend && python -m alembic upgrade head && cd ..
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8100

# 3) Frontend dev server (AI-Studio endpoints + Vite + API proxy)
cd frontend
npm install --legacy-peer-deps
npm run dev            # tsx server.ts on :3000
```

| URL | What |
|---|---|
| http://localhost:3000/ | AI-Studio role demo (legacy showcase) |
| http://localhost:3000/platform.html | Engineer/Owner platform (login) |
| http://localhost:3000/worker.html | Worker PWA (login) |
| http://localhost:3000/api/v1/docs | OpenAPI docs |
| data/outbox/*.eml | Dev emails (verification/reset links) |

Legacy analytics service (optional, used by the AI-Studio demo views):
`python backend/server.js`-equivalent → `node backend/server.js` (port 8000).

### Test users (development only)

```bash
# password via env or interactive prompt; marks accounts verified locally
TEST_USER_PASSWORD="LocalTest123!" python backend/scripts/create_test_users.py
# → test.worker@fantom.dev / test.engineer@fantom.dev / test.owner@fantom.dev
```

The script refuses to run with `ENVIRONMENT=production`. Real accounts must
register in the UI and complete email verification.

---

## 2. Docker (full local stack)

```bash
cp .env.example .env
# REQUIRED before `up`: set SECRET_KEY (backend refuses placeholder in prod image)
#   python -c "import secrets;print(secrets.token_urlsafe(48))"
docker compose up --build -d
docker compose ps
docker compose logs -f backend
docker compose down          # add -v to also drop PostgreSQL data
```

| URL | What |
|---|---|
| http://localhost:8080/ | AI-Studio app |
| http://localhost:8080/platform.html | Platform (all roles) |
| http://localhost:8080/worker.html | Worker PWA entry |
| http://localhost:8025/ | Mailpit inbox (dev email) |

Email in Docker defaults to Mailpit (`SMTP_HOST=mailpit`, port 1025).
Verification links use `APP_PUBLIC_URL` (default `http://localhost:8080`).

---

## 3. Production deployment

Requirements: a Linux host with Docker, DNS name, TLS certificate.

```bash
# .env (production)
ENVIRONMENT=production
SECRET_KEY=<64+ random chars>          # REQUIRED
DB_ENGINE=postgresql                   # compose already sets this for the container
DB_PASSWORD=<strong password>
APP_PUBLIC_URL=https://fantom.yourcompany.com
CORS_ORIGINS=https://fantom.yourcompany.com
REQUIRE_EMAIL_VERIFICATION=true
ENGINEER_INVITE_CODES=                 # empty: engineers are invited via UI
SMTP_HOST=smtp.yourprovider.com        # real SMTP for verification/reset mail
SMTP_PORT=587
SMTP_USER=apikey-xyz
SMTP_PASSWORD=<provider secret>
SMTP_FROM=fantom@yourcompany.com
SMTP_TLS=true
FRONTEND_PORT=8080                     # keep behind your reverse proxy/TLS
```

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend frontend
```

TLS: terminate at your edge (nginx/traefik/cloud LB) forwarding to
`FRONTEND_PORT`, or edit `frontend/nginx.conf` to add certbot certs. PWA
installation requires HTTPS (or localhost).

Production checklist:
- `SECRET_KEY` set, no placeholder (backend refuses to boot otherwise)
- real `DB_PASSWORD`; PostgreSQL volume backed up (`pg_data`)
- real SMTP verified: register a test account and receive the link
- `APP_PUBLIC_URL` matches the public HTTPS URL (links inside emails)
- CORS locked to the public origin

---

## 4. Database migrations

```bash
cd backend
python -m alembic current          # show applied revision
python -m alembic upgrade head     # apply (runs automatically in Docker? no —)
```

In Docker, tables are created via `init_db()` (create_all) at startup; for
strict migration control run `alembic upgrade head` inside the container:

```bash
docker compose exec backend sh -lc "cd /app && python -m alembic upgrade head"
```

Create a new migration after editing `backend/app/models.py`:

```bash
cd backend
python -m alembic revision --autogenerate -m "describe change"
python -m alembic upgrade head
```

Migrations live in `backend/alembic/versions/` and are part of the repo.

---

## 5. ML model deployment

Models live in `ml/saved_models/<name>.joblib` (+ optional `<name>.meta.json`).
The registry is scanned at startup; `/api/v1/ml` reports what is loaded.

Current shipped model (REAL, trained on data/raw/model3.csv):
- `queue_surrogate` — RandomForest multi-output, test R²=0.998,
  MAE≈85 (metrics in the .meta.json)
- `input_anomaly_detector` — input-space anomaly screen

Train/retrain:

```bash
python ml/train_queue_surrogate.py        # writes joblib + meta into ml/saved_models
```

Deploy a new version: copy `<name>.joblib` + `.meta.json` into
`ml/saved_models/` and restart the backend (bind-mounted read-only in Docker).
No fake predictions: `/api/v1/ml/predict` 404s for unknown/unloaded models and
the UI shows "MODEL NOT AVAILABLE" instead of numbers.

---

## 6. Mobile worker rollout (no Docker on phones)

1. Deploy the production stack (section 3) at an HTTPS URL.
2. Workers open `https://<your-domain>/worker.html` in any mobile browser.
3. Register (worker role is open), verify email, log in.
4. Install: Android/Chrome → ⋮ "Add to Home screen"; iPhone/Safari → Share →
   "Add to Home Screen". The app then runs standalone with an icon.
5. Assign stations: an owner uses Users → Assign a role, or workers pick up
   their station at registration (supervisor choice).

The service worker caches the shell only; production data always requires the
network — stale numbers are never shown offline (by design).

---

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| `401` everywhere in the UI | Session expired → log in again; check JWT `SECRET_KEY` unchanged since login |
| `403 Requires engineer role` | Expected RBAC; use an account with the right role |
| Verification email missing | Dev: check `data/outbox/` or Mailpit (:8025). Prod: check SMTP_* env + provider logs |
| Backend refuses to start (production) | `SECRET_KEY` is a placeholder — set a real one |
| `dataset_loaded: false` | `data/processed/facility_sim_clean.csv` missing at the mounted path |
| Simulation/anomalies slow | They compute over 605k rows per request (a few seconds) — normal |
| Mailpit not receiving | `SMTP_HOST=mailpit`, `SMTP_PORT=1025` on the backend service |
| PWA won't install | Must be HTTPS (or localhost), manifest + icons reachable at `/worker-manifest.json` |
| Frontend shows "Backend API is unreachable" | Start the FastAPI backend; check nginx proxy `/api/` → `backend:8000` |
| Reset DB locally | Delete `data/fantom_app.db` (dev) or `docker compose down -v` (Docker) |
