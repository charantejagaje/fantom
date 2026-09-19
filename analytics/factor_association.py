"""Factor / root-cause ASSOCIATION analysis (Step 7).

Input : data/processed/facility_sim_clean.csv  (observed simulation data only)
Outputs (all in data/processed/):
  factor_association_marginal.csv     - one-WIP-at-a-time slopes (marginal view)
  factor_association_joint.csv        - share-based joint model per station (conditional view)
  multicollinearity_diagnostics.csv   - VIFs, correlations, condition numbers

METHOD (documented in docs/factor_association_report.md):
  1. Marginal: Pearson r + simple OLS slope for each (cell WIP -> station queue) pair.
  2. Diagnostics: WIP-WIP correlation matrix, VIF per WIP, condition numbers.
     The 4 WIP columns sum to a nearly constant facility total -> severe collinearity.
  3. Joint/conditional: reparametrize the 4 WIPs as
         total_wip   = wip_cell1+2+3+4          (facility load, varies little)
         share_cellN = wip_cellN / total_wip    (load redistribution; cell 1 = reference)
     and fit OLS:  queue ~ total_wip + share_cell2 + share_cell3 + share_cell4
     (mathematically the same information as the 4 raw WIPs, but well-conditioned).

RULES:
  - All results are ASSOCIATIONS. No causal claims. Coefficients are NOT effects.
  - No predictive ML model is trained (OLS here is a descriptive statistical method).
  - No utilization/throughput/cost/defect metrics (fields do not exist).

Usage (from the repo root):
    python analytics/factor_association.py
"""

from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats as sps

ROOT = Path(__file__).resolve().parents[1]
CLEAN_FILE = ROOT / "data" / "processed" / "facility_sim_clean.csv"
OUT_DIR = ROOT / "data" / "processed"

STATIONS = [
    "queue_c1s2", "queue_c1s4", "queue_c2s2", "queue_c2s4",
    "queue_c3s2", "queue_c3s3", "queue_c4s3", "queue_c4s4",
]
CELLS = ["wip_cell1", "wip_cell2", "wip_cell3", "wip_cell4"]
HOTSPOTS = ["queue_c1s2", "queue_c4s3"]  # from Step 6


def ols_table(y: np.ndarray, X: np.ndarray, names: list[str]) -> pd.DataFrame:
    """Plain OLS with intercept; returns coefficients, SEs, t, p, 95% CI.

    Standard textbook formulas (no ML training involved):
      beta   = (X'X)^-1 X'y
      sigma2 = RSS / (n - p)
      SE     = sqrt(diag(sigma2 * (X'X)^-1))
      t      = beta / SE ;  p from the t distribution with n-p degrees of freedom
    """
    n = len(y)
    p = X.shape[1]
    XtX_inv = np.linalg.inv(X.T @ X)
    beta = XtX_inv @ (X.T @ y)
    resid = y - X @ beta
    dof = n - p
    sigma2 = (resid @ resid) / dof
    se = np.sqrt(np.diag(XtX_inv) * sigma2)
    t_vals = beta / se
    p_vals = 2 * sps.t.sf(np.abs(t_vals), df=dof)
    ci_lo, ci_hi = beta - 1.96 * se, beta + 1.96 * se
    y_mean = y.mean()
    r2 = 1 - (resid @ resid) / (((y - y_mean) ** 2).sum())
    return pd.DataFrame({
        "term": names, "coef": beta, "std_error": se, "t_stat": t_vals,
        "p_value": p_vals, "ci95_low": ci_lo, "ci95_high": ci_hi, "r_squared": r2,
    })


def vif(values: pd.DataFrame) -> dict[str, float]:
    """VIF_j = 1 / (1 - R2_j), R2_j from regressing column j on the others."""
    out = {}
    for col in values.columns:
        others = [c for c in values.columns if c != col]
        X = np.column_stack([np.ones(len(values)), values[others].to_numpy()])
        y = values[col].to_numpy()
        beta, *_ = np.linalg.lstsq(X, y, rcond=None)
        resid = y - X @ beta
        r2 = 1 - (resid @ resid) / (((y - y.mean()) ** 2).sum())
        out[col] = 1.0 / (1.0 - r2) if r2 < 1 else np.inf
    return out


def main() -> None:
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    df = pd.read_csv(CLEAN_FILE)
    print(f"Loaded {CLEAN_FILE.relative_to(ROOT)}: {len(df):,} rows")

    # Working columns (in memory only - nothing is written back to datasets).
    total_wip = df[CELLS].sum(axis=1)
    share = {c: df[c] / total_wip for c in CELLS}

    # ==================================================================
    # 1) MARGINAL associations: one WIP at a time
    # ==================================================================
    rows = []
    for st in STATIONS:
        for c in CELLS:
            x = df[c].to_numpy()
            y = df[st].to_numpy()
            X = np.column_stack([np.ones_like(x), x])
            t = ols_table(y, X, ["intercept", c])
            rows.append({
                "station": st, "cell_wip": c,
                "pearson_r": df[c].corr(df[st]),
                "slope_per_part": t.loc[1, "coef"],
                "std_error": t.loc[1, "std_error"],
                "p_value": t.loc[1, "p_value"],
                "view": "marginal (one WIP at a time - confounded by collinearity)",
            })
    marginal = pd.DataFrame(rows)
    marginal.to_csv(OUT_DIR / "factor_association_marginal.csv", index=False)

    # ==================================================================
    # 2) MULTICOLLINEARITY DIAGNOSTICS
    # ==================================================================
    wip_corr = df[CELLS].corr()
    vifs = vif(df[CELLS])

    # Condition numbers on STANDARDIZED columns (z-scores, intercept untouched):
    # raw-scale condition numbers are dominated by unit differences (WIP ~15,000
    # vs intercept = 1) and are meaningless for collinearity assessment.
    def standardized_cond(X: np.ndarray) -> float:
        Xs = X.copy().astype(float)
        mu, sd = Xs.mean(axis=0), Xs.std(axis=0)
        nonzero = sd > 0
        Xs[:, nonzero] = (Xs[:, nonzero] - mu[nonzero]) / sd[nonzero]
        return np.linalg.cond(Xs)

    X_raw4 = np.column_stack([np.ones(len(df)), df[CELLS].to_numpy()])
    cond_raw = standardized_cond(X_raw4)
    # Reparametrized design: intercept + total_wip + 3 shares (cell1 = reference)
    X_joint = np.column_stack([
        np.ones(len(df)), total_wip.to_numpy(),
        share["wip_cell2"].to_numpy(), share["wip_cell3"].to_numpy(),
        share["wip_cell4"].to_numpy(),
    ])
    cond_joint = standardized_cond(X_joint)
    vif_joint = vif(pd.DataFrame({
        "total_wip": total_wip,
        "share_cell2": share["wip_cell2"],
        "share_cell3": share["wip_cell3"],
        "share_cell4": share["wip_cell4"],
    }))

    diag_rows = []
    for c in CELLS:
        diag_rows.append({"check": "VIF (raw 4-WIP design)", "variable": c, "value": vifs[c]})
    for c, v in vif_joint.items():
        diag_rows.append({"check": "VIF (reparametrized design)", "variable": c, "value": v})
    diag_rows.append({"check": "condition number (standardized, raw 4-WIP design)", "variable": "X (z-scores)", "value": cond_raw})
    diag_rows.append({"check": "condition number (standardized, reparametrized design)", "variable": "X (z-scores)", "value": cond_joint})
    diag_rows.append({"check": "total_wip mean", "variable": "total_wip", "value": total_wip.mean()})
    diag_rows.append({"check": "total_wip CV pct", "variable": "total_wip",
                      "value": 100 * total_wip.std() / total_wip.mean()})
    diag = pd.DataFrame(diag_rows)
    for c in CELLS:  # pairwise WIP-WIP correlations
        for c2 in CELLS:
            if CELLS.index(c) < CELLS.index(c2):
                diag_rows.append({"check": f"WIP-WIP corr {c} vs {c2}", "variable": "-",
                                  "value": df[c].corr(df[c2])})
    diag = pd.DataFrame(diag_rows)
    diag.to_csv(OUT_DIR / "multicollinearity_diagnostics.csv", index=False)

    # ==================================================================
    # 3) JOINT / CONDITIONAL associations (share-based model, per station)
    # ==================================================================
    jrows = []
    raw_hotspot_rows = []
    for st in STATIONS:
        y = df[st].to_numpy()
        t = ols_table(y, X_joint, ["intercept", "total_wip", "share_cell2",
                                   "share_cell3", "share_cell4"])
        t.insert(0, "station", st)
        t.insert(1, "view", "conditional (total_wip + load shares, cell1 = reference)")
        jrows.append(t)

        if st in HOTSPOTS:
            # ALSO fit the raw 4-WIP model for the hotspots, purely to DOCUMENT
            # how collinearity inflates standard errors (not used for conclusions).
            X_raw = np.column_stack([np.ones(len(df)), df[CELLS].to_numpy()])
            t_raw = ols_table(y, X_raw, ["intercept"] + CELLS)
            t_raw.insert(0, "station", st)
            t_raw.insert(1, "view", "raw 4-WIP model (documentation of SE inflation only)")
            raw_hotspot_rows.append(t_raw)

    joint = pd.concat(jrows, ignore_index=True)
    joint.to_csv(OUT_DIR / "factor_association_joint.csv", index=False)

    # ==================================================================
    # 4) Console summary (ASCII only)
    # ==================================================================
    print("\n=== MULTICOLLINEARITY DIAGNOSTICS ===")
    print(f"WIP-WIP pairwise correlations: {wip_corr.iloc[0,1]:.3f} ... "
          f"{wip_corr.to_numpy()[np.triu_indices(4,1)].min():.3f} (all negative)")
    print("VIF, raw 4-WIP design (huge = severe collinearity):")
    for c in CELLS:
        print(f"  {c}: {vifs[c]:,.0f}")
    print("VIF, reparametrized design (total_wip + 3 shares):")
    for c, v in vif_joint.items():
        print(f"  {c}: {v:,.2f}")
    print(f"Condition number (standardized): raw = {cond_raw:,.1f}  vs  reparametrized = {cond_joint:,.1f}")

    print("\n=== MARGINAL vs CONDITIONAL: the two HOTSPOT stations ===")
    for st in HOTSPOTS:
        print(f"\n--- {st} ---")
        m = marginal[marginal.station == st][["cell_wip", "pearson_r", "slope_per_part"]]
        print("marginal (one at a time):")
        print(m.round(4).to_string(index=False))
        jj = joint[(joint.station == st) & (joint.term != "intercept")]
        print("conditional (joint model):")
        print(jj[["term", "coef", "std_error", "p_value", "ci95_low", "ci95_high"]]
              .round(4).to_string(index=False))
        r2 = joint[(joint.station == st)]["r_squared"].iloc[0]
        print(f"joint model R-squared: {r2:.4f}")

    print("\n=== ALL STATIONS: strongest conditional associations (share terms, |t|>2) ===")
    sig = joint[(joint.term.str.startswith("share")) & (joint.p_value < 0.05)].copy()
    sig["abs_coef"] = sig["coef"].abs()
    top = sig.sort_values("abs_coef", ascending=False).head(10)
    print(top[["station", "term", "coef", "p_value"]].round(4).to_string(index=False))

    print("\nSaved:")
    for f in ["factor_association_marginal.csv", "factor_association_joint.csv",
              "multicollinearity_diagnostics.csv"]:
        print(f"  - data/processed/{f}")


if __name__ == "__main__":
    main()
