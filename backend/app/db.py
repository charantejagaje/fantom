"""SQLAlchemy database layer.

Design rules:
- The application database stores *application* state (users, dataset
  registrations, analysis results, simulation runs, recommendations).
- The raw/processed observation CSVs are NOT duplicated into the database;
  they stay on disk as immutable data files and are read by the analytics
  services. Only derived, queryable results are persisted.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

engine = create_engine(
    settings.database_url,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: one session per request."""
    ensure_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


_initialized = False


def init_db() -> None:
    """Create tables (idempotent). Import models first so metadata is populated."""
    global _initialized
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _initialized = True


def ensure_db() -> None:
    """Lazy safety net: initialize once even if lifespan was skipped (e.g. tests)."""
    if not _initialized:
        init_db()
