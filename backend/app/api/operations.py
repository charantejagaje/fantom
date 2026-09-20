"""Operational alerts & worker issue reports.

Alerts are generated ONLY from real analytics screens (bottleneck flags over
the documented threshold, anomaly screen summaries) - never invented. The
refresh endpoint recomputes from the observed dataset and upserts active
alerts, deduplicated by (source, entity).

RBAC:
- GET /alerts           any authenticated role (workers see a mobile feed)
- POST /alerts/refresh  engineer+ (recomputes from the dataset)
- GET  /issues          worker: own reports; engineer+: all reports
- POST /issues          any authenticated user (workers report from the field)
- PATCH /issues/{id}    engineer+ (acknowledge / resolve)
"""

from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth_deps import get_current_user, require_role
from ..db import get_db
from ..models import Alert, IssueReport, User

router = APIRouter(tags=["operations"])


# ---------------- alerts ----------------

class AlertOut(BaseModel):
    id: int
    source: str
    entity: str
    severity: str
    title: str
    body: str
    evidence_json: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertsResponse(BaseModel):
    count: int
    alerts: list[AlertOut]


@router.get("/alerts", response_model=AlertsResponse)
def list_alerts(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alerts = db.scalars(
        select(Alert).where(Alert.is_active.is_(True)).order_by(Alert.created_at.desc()).limit(100)
    ).all()
    return AlertsResponse(count=len(alerts), alerts=[AlertOut.model_validate(a) for a in alerts])


@router.post("/alerts/refresh", response_model=AlertsResponse)
def refresh_alerts(
    engineer: User = Depends(require_role("engineer")),
    db: Session = Depends(get_db),
):
    """Recompute real-data alert screens and upsert (dedup by source+entity)."""
    from ..config import settings
    from ..services import analytics_service

    bn = analytics_service.bottlenecks(Path(settings.DATASET_PROCESSED_DIR))

    created = 0
    for st in bn.stations:
        if not st.potential_bottleneck:
            continue
        entity = st.station
        existing = db.scalar(select(Alert).where(Alert.source == "bottleneck_screen", Alert.entity == entity))
        evidence = {
            "mean_queue": st.mean,
            "p95_queue": st.p95,
            "max_queue": st.max,
            "congestion_share_pct": st.congestion_share_pct,
            "congestion_rank": st.rank,
            "rule": bn.rule,
            "dataset": bn.provenance,
        }
        title = f"Potential bottleneck: {entity.replace('queue_', '').upper()}"
        body = (
            f"Mean queue {st.mean:.0f} parts (rank #{st.rank}), "
            f"{st.congestion_share_pct:.1f}% of facility congestion. Rule: {bn.rule}. "
            "This is a potential bottleneck / congestion hotspot - NOT a proven root cause."
        )
        if existing is None:
            db.add(
                Alert(
                    source="bottleneck_screen",
                    entity=entity,
                    severity="warning",
                    title=title,
                    body=body,
                    evidence_json=evidence,
                )
            )
            created += 1
        else:
            existing.title = title
            existing.body = body
            existing.evidence_json = evidence
            existing.is_active = True
    db.commit()

    alerts = db.scalars(
        select(Alert).where(Alert.is_active.is_(True)).order_by(Alert.created_at.desc()).limit(100)
    ).all()
    return AlertsResponse(count=len(alerts), alerts=[AlertOut.model_validate(a) for a in alerts])


# ---------------- issues ----------------

class IssueCreate(BaseModel):
    message: str = Field(min_length=3, max_length=2000)
    station: str | None = Field(default=None, max_length=64)
    severity: str = Field(default="warning", pattern="^(info|warning|critical)$")


class IssueOut(BaseModel):
    id: int
    reporter_id: int | None
    station: str | None
    severity: str
    message: str
    status: str
    created_at: datetime
    resolved_at: datetime | None
    resolution_note: str | None

    model_config = {"from_attributes": True}


class IssuesResponse(BaseModel):
    count: int
    issues: list[IssueOut]


@router.get("/issues", response_model=IssuesResponse)
def list_issues(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role == "worker":
        issues = db.scalars(
            select(IssueReport).where(IssueReport.reporter_id == user.id).order_by(IssueReport.created_at.desc())
        ).all()
    else:  # engineer/owner see all
        issues = db.scalars(select(IssueReport).order_by(IssueReport.created_at.desc()).limit(200)).all()
    return IssuesResponse(count=len(issues), issues=[IssueOut.model_validate(i) for i in issues])


@router.post("/issues", response_model=IssueOut, status_code=status.HTTP_201_CREATED)
def create_issue(
    payload: IssueCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    issue = IssueReport(
        reporter_id=user.id,
        station=(payload.station or user.assigned_station),
        severity=payload.severity,
        message=payload.message.strip(),
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


class IssueUpdate(BaseModel):
    status: str = Field(pattern="^(open|acknowledged|resolved)$")
    resolution_note: str | None = Field(default=None, max_length=2000)


@router.patch("/issues/{issue_id}", response_model=IssueOut)
def update_issue(
    issue_id: int,
    payload: IssueUpdate,
    engineer: User = Depends(require_role("engineer")),
    db: Session = Depends(get_db),
):
    issue = db.get(IssueReport, issue_id)
    if issue is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Issue not found")
    issue.status = payload.status
    issue.resolution_note = payload.resolution_note
    if payload.status == "resolved":
        issue.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(issue)
    return issue
