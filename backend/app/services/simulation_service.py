"""What-if simulation service.

Scenario arithmetic over the observed dataset. Method (documented, simple):
- Baseline: observed mean queue per station.
- Effect: each WIP multiplier changes the corresponding cell's mean WIP; the
  station response uses the marginal association slope from the observed data
  (queue parts per +1 WIP part), applied additively and CAPPED to >= 0.
- Everything returned is labeled "simulated-estimate" - this is a planning
  heuristic, NOT a prediction of what the factory will do, and NOT causal.
"""

from ..schemas import (
    SimulationResponse,
    SimulationStationEstimate,
)
from .analytics_service import CELLS, STATIONS, observed_frame

METHOD = (
    "linear what-if: delta_station = slope(cell -> station) x delta_cell_mean_wip, "
    "summed over adjusted cells, floored at 0 (marginal-slope approximation)"
)
DISCLAIMER = (
    "Simulated estimate from marginal association slopes over observed simulation data. "
    "Not a causal prediction, not an observed measurement, and not a guarantee of any "
    "production outcome. For human decision support only."
)


def run_simulation(processed_dir, wip_multipliers: dict[str, float], label: str | None) -> SimulationResponse:
    df = observed_frame(processed_dir)

    unknown = [k for k in wip_multipliers if k not in CELLS]
    if unknown:
        raise KeyError(f"unknown WIP variable(s): {', '.join(unknown)}")

    cell_means = {c: float(df[c].mean()) for c in CELLS}
    station_means = {st: float(df[st].mean()) for st in STATIONS}

    # Marginal slopes (queue parts per +1 WIP part), computed from observed data.
    slopes = {
        (w, st): float(np_polyfit_slope(df[w], df[st]))
        for w in CELLS
        for st in STATIONS
    }

    deltas: dict[str, float] = {}
    for w, mult in wip_multipliers.items():
        new_mean = cell_means[w] * mult
        deltas[w] = new_mean - cell_means[w]

    estimates: list[SimulationStationEstimate] = []
    sim_total = 0.0
    base_total = 0.0
    for st in STATIONS:
        delta_st = sum(slopes[(w, st)] * d for w, d in deltas.items())
        sim_mean = max(0.0, station_means[st] + delta_st)
        base = station_means[st]
        base_total += base
        sim_total += sim_mean
        estimates.append(
            SimulationStationEstimate(
                station=st,
                baseline_mean=round(base, 1),
                simulated_mean=round(sim_mean, 1),
                delta=round(sim_mean - base, 1),
                delta_pct=round(100 * (sim_mean - base) / base, 1) if base else 0.0,
            )
        )

    return SimulationResponse(
        label=label or "what-if scenario",
        scenario={k: round(v, 3) for k, v in wip_multipliers.items()},
        method=METHOD,
        disclaimer=DISCLAIMER,
        baseline_total_queue_mean=round(base_total, 1),
        simulated_total_queue_mean=round(sim_total, 1),
        stations=estimates,
    )


def np_polyfit_slope(x, y) -> float:
    import numpy as np

    return float(np.polyfit(x, y, 1)[0])
