"""Fantom FastAPI application entrypoint.

Run locally:   uvicorn backend.app.main:app --reload --port 8000
Run in Docker: see compose.yaml (uvicorn inside the backend container).
"""

import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import (
    analytics,
    auth,
    core,
    evaluation,
    friend_feature,
    ml,
    operations,
    recommendations,
    simulation,
)
from .config import settings
from .db import init_db

logging.basicConfig(level=settings.LOG_LEVEL if hasattr(settings, "LOG_LEVEL") else "INFO")
logger = logging.getLogger("fantom.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.is_production:
        weak = ("change_this", "your", "example", "placeholder", "")
        if settings.SECRET_KEY.lower().strip() in weak:
            raise RuntimeError(
                "Refusing to start in production with a placeholder SECRET_KEY. "
                "Set a strong SECRET_KEY in the environment."
            )
    init_db()
    logger.info("database initialized (%s)", settings.DB_ENGINE)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description=(
        "AI-powered Industrial Decision Support API for metal-component manufacturing. "
        "Serves analytics over the observed simulation dataset; advisory only - it never "
        "controls factory machinery."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["*"],
)

API = settings.API_V1_STR
from .auth_deps import get_current_user, require_role  # RBAC guards for routers

# Public: health + dataset listing (metadata only; no analytics payload).
app.include_router(core.router, prefix=API)
# Analytics/ML reads: any authenticated role (workers see station/production info).
app.include_router(analytics.router, prefix=API, dependencies=[Depends(get_current_user)])
app.include_router(ml.router, prefix=API, dependencies=[Depends(get_current_user)])
# Deeper tools: engineer and above only.
app.include_router(simulation.router, prefix=API, dependencies=[Depends(require_role("engineer"))])
app.include_router(recommendations.router, prefix=API, dependencies=[Depends(require_role("engineer"))])
app.include_router(evaluation.router, prefix=API, dependencies=[Depends(require_role("engineer"))])
app.include_router(friend_feature.router, prefix=API)  # friend's extension point
app.include_router(auth.router, prefix=API)  # auth endpoints manage their own RBAC
app.include_router(operations.router, prefix=API)  # alerts/issues guard per-route


@app.get("/")
def root():
    return {"app": settings.APP_NAME, "docs": "/docs", "api": API}
