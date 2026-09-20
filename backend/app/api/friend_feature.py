"""FRIEND FEATURE EXTENSION POINT
================================

Your teammate can build their feature HERE without touching core files.

Contract rules:
1. Add service functions in ../services/friend_feature.py (data work goes there).
2. Add endpoints in this file; register any new router inside it (see bottom).
3. UI goes in frontend/src/features/friend-feature/ and renders inside the
   "Team Feature" navigation item (already wired).
4. Reuse core DB/ML/analytics services via imports; do not duplicate them.
5. Return schemas with provenance labels; never invent data.

This placeholder exposes ONLY a capability declaration - no fake functionality.
"""

from fastapi import APIRouter

router = APIRouter(
    prefix="/friend-feature",
    tags=["friend-feature"],
)


@router.get("/capabilities")
def capabilities():
    """Machine-readable capability list so the UI can adapt to what exists."""
    return {
        "feature": "friend-feature",
        "implemented": False,
        "capabilities": [],
        "notes": (
            "Extension point ready. Implement service functions in "
            "backend/app/services/friend_feature.py and endpoints here; the "
            "'Team Feature' UI section consumes this endpoint to decide what to show."
        ),
    }
