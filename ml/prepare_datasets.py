"""Convert data/raw/3000Samplesv3.mat (Mendeley 10.17632/3rw227zxt7.2) to CSVs.

Outputs (all in data/raw/):
  facility_sim_full.csv  - 605,620 runs x (4 WIP predictors + 8 station queues)
  model1.csv             - 3,000 samples, 1 predictor -> 3 responses
  model2.csv             - 3,000 samples, per-machine predictors -> responses
  model3.csv             - 3,000 samples, 4 predictors -> 8 station answers

Column order of the 8 response columns in 'Responses' was verified to match
Responsec1s2 ... Responsec4s4 individually.

Usage:
    python ml/prepare_datasets.py
"""

from pathlib import Path

import numpy as np
import pandas as pd
import scipy.io as sio

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
MAT = RAW / "3000Samplesv3.mat"

# Verified ordering of the station-queue response columns.
STATIONS = ["c1s2", "c1s4", "c2s2", "c2s4", "c3s2", "c3s3", "c4s3", "c4s4"]


def load() -> dict:
    print(f"Loading {MAT} (~35 MB, may take a minute)...")
    return sio.loadmat(MAT)


def save(df: pd.DataFrame, name: str) -> None:
    out = RAW / name
    df.to_csv(out, index=False)
    print(f"  wrote {out.relative_to(ROOT)}  {df.shape}")


def main() -> None:
    m = load()

    # ---- Full simulation table: 4 WIP predictors -> 8 station queues ----
    pred = np.asarray(m["Predictors"])
    resp = np.asarray(m["Responses"])
    pred_cols = [f"wip_cell{i}" for i in range(1, 5)]
    resp_cols = [f"queue_{s}" for s in STATIONS]
    full = pd.DataFrame(np.hstack([pred, resp]), columns=pred_cols + resp_cols)
    save(full, "facility_sim_full.csv")

    # ---- Model 1: 1 predictor -> 3 responses ----
    m1 = pd.DataFrame(
        np.hstack([
            np.asarray(m["Model1Predictors"]),
            np.asarray(m["Model1Response"]),
        ]),
        columns=["predictor", "response_1", "response_2", "response_3"],
    )
    save(m1, "model1.csv")

    # ---- Model 2: per-machine predictors -> responses (assembly/drilling/milling) ----
    m2 = pd.DataFrame({
        "predictor_assembly": np.asarray(m["Model2PredictorAssembly"]).ravel(),
        "predictor_drilling_1": np.asarray(m["Model2PredictorDrilling"])[:, 0],
        "predictor_drilling_2": np.asarray(m["Model2PredictorDrilling"])[:, 1],
        "predictor_milling_1": np.asarray(m["Model2PredictorMilling"])[:, 0],
        "predictor_milling_2": np.asarray(m["Model2PredictorMilling"])[:, 1],
        "response_assembly": np.asarray(m["Model2ResponseAssembly"]).ravel(),
        "response_drilling": np.asarray(m["Model2ResponseDrilling"]).ravel(),
        "response_milling": np.asarray(m["Model2ResponseMilling"]).ravel(),
        "answer_assembly": np.asarray(m["Model2AnswerAssembly"]).ravel(),
        "answer_drilling": np.asarray(m["Model2AnswerDrilling"]).ravel(),
        "answer_milling": np.asarray(m["Model2AnswerMilling"]).ravel(),
    })
    save(m2, "model2.csv")

    # ---- Model 3: 4 predictors -> 8 station answers (ANN targets) ----
    m3_cols = {f"predictor_{i+1}": np.asarray(m["Model3Predictors"])[:, i] for i in range(4)}
    m3_cols.update({f"answer_{s}": np.asarray(m[f"Model3Answer{s}"]).ravel() for s in STATIONS})
    save(pd.DataFrame(m3_cols), "model3.csv")

    print("Done.")


if __name__ == "__main__":
    main()
