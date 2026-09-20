"""Pydantic request/response schemas (API contract).

Every response that carries analytics carries its data provenance so the
frontend can label observed vs model-predicted correctly.
"""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

Provenance = Literal["observed-simulation", "model-predicted", "simulated-estimate"]


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    app: str
    environment: str
    database: Literal["connected", "unavailable"]
    dataset_loaded: bool
    ml_models_loaded: list[str]
    time: datetime


# ---------- datasets ----------

class DatasetColumn(BaseModel):
    name: str
    dtype: str
    role: Literal["input", "output", "metadata"] = "metadata"
    missing: int = 0
    unique: int | None = None


class DatasetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    kind: str
    file_path: str
    row_count: int | None
    column_count: int | None
    source: str | None
    status: str


class DatasetDetail(DatasetOut):
    columns: list[DatasetColumn] = []
    preview_rows: list[dict[str, Any]] = []
    provenance: Provenance = "observed-simulation"


# ---------- analytics ----------

class VariableStats(BaseModel):
    variable: str
    count: int
    mean: float
    std: float
    min: float
    p25: float
    median: float
    p75: float
    p95: float
    max: float


class StationStats(BaseModel):
    station: str
    mean: float
    median: float
    std: float
    cv_pct: float
    p95: float
    max: float
    congestion_share_pct: float
    rank: int
    potential_bottleneck: bool


class WipTotals(BaseModel):
    total_wip_mean: float
    per_cell_means: dict[str, float]


class AnalyticsSummary(BaseModel):
    provenance: Provenance
    dataset: str
    row_count: int
    variables: list[VariableStats]
    wip_totals: WipTotals
    total_queue_mean: float
    bottleneck_rule: str
    potential_bottlenecks: list[str]
    not_available: list[str] = Field(
        default_factory=lambda: [
            "utilization", "throughput", "cycle time", "waiting time per part",
            "downtime", "production counts", "defect/quality metrics",
            "economic/cost metrics",
        ]
    )


class StationListResponse(BaseModel):
    provenance: Provenance
    dataset: str
    count: int
    stations: list[StationStats]


class BottleneckResponse(BaseModel):
    provenance: Provenance
    rule: str
    terminology: Literal[
        "potential bottleneck / congestion hotspot - NOT a proven root cause"
    ] = "potential bottleneck / congestion hotspot - NOT a proven root cause"
    potential_bottlenecks: list[str]
    stations: list[StationStats]


class AssociationRow(BaseModel):
    wip_variable: str
    station: str
    pearson_r: float
    slope: float
    p_value: float | None = None
    n: int


class AssociationResponse(BaseModel):
    provenance: Provenance
    disclaimer: Literal["association does not establish causation"] = (
        "association does not establish causation"
    )
    note: str
    rows: list[AssociationRow]
    diagnostic_note: str | None = None


# ---------- anomalies ----------

class AnomalyResponse(BaseModel):
    provenance: Provenance
    method: str
    disclaimer: str
    threshold_z: float
    total_points_scored: int
    anomalies_flagged: int
    by_variable: dict[str, list[dict[str, Any]]]


class AnomalyRequest(BaseModel):
    variable: str | None = Field(
        default=None, description="Queue/WIP variable; default scans all known variables"
    )
    threshold_z: float = Field(default=3.5, gt=0, le=10)


# ---------- simulation ----------

class SimulationRequest(BaseModel):
    wip_multipliers: dict[str, float] = Field(
        description="e.g. {'wip_cell2': 1.1} - multipliers applied to observed means"
    )
    label: str | None = None

    @property
    def is_empty(self) -> bool:
        return not self.wip_multipliers


class SimulationStationEstimate(BaseModel):
    station: str
    baseline_mean: float
    simulated_mean: float
    delta: float
    delta_pct: float


class SimulationResponse(BaseModel):
    provenance: Literal["simulated-estimate"] = "simulated-estimate"
    label: str
    scenario: dict[str, float]
    method: str
    disclaimer: str
    baseline_total_queue_mean: float
    simulated_total_queue_mean: float
    stations: list[SimulationStationEstimate]


# ---------- recommendations ----------

class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    body: str
    status: str
    created_at: datetime
    basis_json: dict | None


class RecommendationsResponse(BaseModel):
    advisory_only: Literal[True] = True
    generated_from: str
    items: list[RecommendationOut]


class RecommendationCreate(BaseModel):
    analysis_type: Literal["bottleneck", "association", "queue_stats"] = "bottleneck"
    title: str | None = None


# ---------- ML ----------

class ModelInfo(BaseModel):
    name: str
    path: str
    loaded: bool
    kind: str | None = None
    trained_on: str | None = None
    notes: str | None = None


class MLStatusResponse(BaseModel):
    registry_dir: str
    models: list[ModelInfo]
    integration_note: str


class MLPredictRequest(BaseModel):
    model_name: str
    features: dict[str, float]


class MLPredictResponse(BaseModel):
    model_name: str
    prediction: Any
    provenance: Literal["model-predicted"] = "model-predicted"
    disclaimer: str = "Output of a saved trained model; not an observed measurement."
