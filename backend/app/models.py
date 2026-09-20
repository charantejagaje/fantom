"""SQLAlchemy models.

Schema intent (production-shaped, minimal, extensible):
- users                -> auth-ready table for later real login work
- datasets             -> registered data files with row counts and status
- analysis_results     -> JSON results from analytics services (queue stats,
                          bottleneck screens, association studies)
- simulation_runs      -> what-if runs with their inputs and outputs
- recommendations      -> advisory outputs for a human engineer (never actions)
"""

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), default="worker")  # owner|engineer|worker
    hashed_password: Mapped[str | None] = mapped_column(String(255))  # bcrypt, never plaintext
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    assigned_station: Mapped[str | None] = mapped_column(String(64))  # worker: e.g. queue_c1s2
    invited_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    simulation_runs: Mapped[list["SimulationRun"]] = relationship(back_populates="user")


class UserToken(Base):
    """Single-use opaque tokens (email verification, password reset).

    Only the SHA-256 hash is stored; the raw token lives solely in the
    emailed link. Expired/used rows are deleted on use.
    """

    __tablename__ = "user_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    purpose: Mapped[str] = mapped_column(String(32), index=True)  # verify_email | reset_password
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    user: Mapped[User] = relationship()


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    kind: Mapped[str] = mapped_column(String(32))  # observed | model_predicted
    file_path: Mapped[str] = mapped_column(String(1024))
    row_count: Mapped[int | None] = mapped_column(Integer)
    column_count: Mapped[int | None] = mapped_column(Integer)
    schema_json: Mapped[dict | None] = mapped_column(JSON)  # column name -> dtype
    source: Mapped[str | None] = mapped_column(String(255))  # citation / origin
    status: Mapped[str] = mapped_column(String(32), default="registered")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    analysis_results: Mapped[list["AnalysisResult"]] = relationship(back_populates="dataset")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dataset_id: Mapped[int | None] = mapped_column(ForeignKey("datasets.id"), index=True)
    analysis_type: Mapped[str] = mapped_column(String(64), index=True)  # queue_stats|bottleneck|association|...
    params_json: Mapped[dict | None] = mapped_column(JSON)
    result_json: Mapped[dict] = mapped_column(JSON)
    produced_by: Mapped[str] = mapped_column(String(64))  # service/module that computed it
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    dataset: Mapped[Dataset | None] = relationship(back_populates="analysis_results")


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dataset_id: Mapped[int | None] = mapped_column(ForeignKey("datasets.id"), index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    scenario_json: Mapped[dict] = mapped_column(JSON)  # what was asked
    result_json: Mapped[dict | None] = mapped_column(JSON)  # what came back (nullable: pending)
    status: Mapped[str] = mapped_column(String(32), default="pending")  # pending|completed|failed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    user: Mapped[User | None] = relationship(back_populates="simulation_runs")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    analysis_result_id: Mapped[int | None] = mapped_column(ForeignKey("analysis_results.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)  # advisory text, evidence-linked
    basis_json: Mapped[dict | None] = mapped_column(JSON)  # the structured results behind it
    status: Mapped[str] = mapped_column(String(32), default="open")  # open|accepted|dismissed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Alert(Base):
    """Operational alert derived from REAL dataset screens (never invented).

    Generated by refreshing analytics screens (e.g. bottleneck flags above the
    documented threshold); deduplicated by (source, entity).
    """

    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source: Mapped[str] = mapped_column(String(64), index=True)  # bottleneck_screen | anomaly_screen | system
    entity: Mapped[str] = mapped_column(String(128), index=True)  # e.g. queue_c1s2
    severity: Mapped[str] = mapped_column(String(16), default="info")  # info|warning|critical
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)  # includes the evidence + rule used
    evidence_json: Mapped[dict | None] = mapped_column(JSON)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class IssueReport(Base):
    """Worker-reported issue (free text + optional station)."

    Status flow: open -> acknowledged -> resolved (by engineer/owner).
    """

    __tablename__ = "issue_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    reporter_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    station: Mapped[str | None] = mapped_column(String(64), index=True)
    severity: Mapped[str] = mapped_column(String(16), default="warning")  # info|warning|critical
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="open", index=True)  # open|acknowledged|resolved
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolution_note: Mapped[str | None] = mapped_column(Text)

    reporter: Mapped[User | None] = relationship()
