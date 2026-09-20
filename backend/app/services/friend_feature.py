"""FRIEND FEATURE SERVICE EXTENSION POINT
========================================

Implement your feature's data work here. Conventions:

- Import shared utilities instead of duplicating them:
    from ..db import get_db
    from ..config import settings
    from .dataset_service import dataframe_for
    from .analytics_service import STATIONS, CELLS, observed_frame
- Load data via the dataset registry; never copy raw CSVs into the DB.
- Label provenance on everything you return (observed vs model-predicted).
- No invented values: if a metric is not supported by the data, say so.
"""

def example_hook():
    """Delete me: shows the import style your code can use."""
    from .analytics_service import STATIONS  # noqa: F401

    return {"hint": "implement your feature logic in this module"}
