"""Recommendation service - advisory text generated ONLY from structured results.

Rules:
- Every sentence is traceable to a computed result (passed in as basis).
- Wording uses "associated with", "potential bottleneck", "observed pattern".
- Causal verbs are never used. No costs/defects are invented.
- Recommendations are stored in the DB for a human engineer to review.
"""

from sqlalchemy.orm import Session

from .. import models
from ..schemas import RecommendationCreate
from .analytics_service import bottlenecks, associations

ADVISORY_BANNER = (
    "Advisory only. Generated from structured analysis of observed simulation data. "
    "A human engineer decides; this system never controls machinery."
)


def generate_from_analysis(db: Session, processed_dir, req: RecommendationCreate):
    if req.analysis_type == "bottleneck":
        bl = bottlenecks(processed_dir)
        hotspots = bl.potential_bottlenecks
        if not hotspots:
            title = "No congestion hotspots detected under the current screen"
            body = (
                f"Rule applied: {bl.rule}. No station exceeded it in the observed data. "
                + ADVISORY_BANNER
            )
            basis = {"rule": bl.rule, "potential_bottlenecks": []}
        else:
            top = bl.stations[0]
            second = next(s for s in bl.stations if s.station != hotspots[0])
            title = f"Review congestion at {', '.join(h.split('queue_')[1].upper() for h in hotspots)}"
            body = (
                f"Observed pattern: {hotspots[0]} holds the highest mean queue "
                f"({top.mean:,.0f} parts, rank #{top.rank}, {top.congestion_share_pct:.1f}% of total "
                f"observed queue); {second.station} follows ({second.mean:,.0f}, rank #{second.rank}). "
                f"Rule: {bl.rule}. These are potential bottlenecks, not proven root causes. "
                "Suggested next step for an engineer: review upstream release rates and cell load "
                "shares feeding these stations, then verify on the floor."
                f" {ADVISORY_BANNER}"
            )
            basis = {
                "rule": bl.rule,
                "potential_bottlenecks": hotspots,
                "top_station": top.model_dump(),
                "second_station": second.model_dump(),
            }
    elif req.analysis_type == "association":
        assoc = associations(processed_dir)
        strong = sorted(assoc.rows, key=lambda r: abs(r.pearson_r), reverse=True)[:3]
        title = "Strongest WIP-queue associations to review"
        body = (
            "Observed associations (marginal Pearson r): "
            + "; ".join(f"{r.wip_variable} ~ {r.station} (r={r.pearson_r:.2f})" for r in strong)
            + ". Association does not establish causation; the joint share-based model in "
            "analytics/factor_association.py gives the conditional view. "
            + ADVISORY_BANNER
        )
        basis = {"rows": [r.model_dump() for r in strong]}
    else:  # queue_stats
        from .analytics_service import analytics_summary

        s = analytics_summary(processed_dir)
        top = s.variables[len(s.wip_totals["per_cell_means"])]
        title = "Queue distribution summary worth reviewing"
        body = (
            f"{top.variable}: mean {top.mean:,.0f}, P95 {top.p95:,.0f}, max {top.max:,.0f} across "
            f"{s.row_count:,} observed runs. Facility mean total queue {s.total_queue_mean:,.0f}. "
            + ADVISORY_BANNER
        )
        basis = {"top_variable": top.model_dump(), "total_queue_mean": s.total_queue_mean}

    rec = models.Recommendation(
        title=req.title or title,
        body=body,
        basis_json=basis,
        status="open",
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec
