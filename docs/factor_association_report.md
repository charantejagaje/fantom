# Factor / Root-Cause Association Report — Step 7

**Source:** `data/processed/facility_sim_clean.csv` (605,616 observed simulation runs).
**No ANN-predicted values used** (model3.csv excluded). **No predictive ML model trained**
(OLS here is a descriptive statistical method). **All Step 6 outputs preserved.**

**Script:** `analytics/factor_association.py` · **Generated:** 2026-09-19
**Machine-readable outputs:** `data/processed/factor_association_marginal.csv`,
`data/processed/factor_association_joint.csv`, `data/processed/multicollinearity_diagnostics.csv`

> **Core statement: every result below is an ASSOCIATION. None establishes causation.**
> Coefficients describe how variables co-move in this simulation dataset; they are NOT
> effects, and acting on them is not guaranteed to change outcomes.

---

## 1. Variables used

- **Outcomes (observed station queues):** `queue_c1s2`, `queue_c1s4`, `queue_c2s2`,
  `queue_c2s4`, `queue_c3s2`, `queue_c3s3`, `queue_c4s3`, `queue_c4s4`
  — hotspot focus per Step 6: **queue_c1s2**, **queue_c4s3**
- **Inputs (observed cell WIP):** `wip_cell1`, `wip_cell2`, `wip_cell3`, `wip_cell4`
- **In-memory derivations only (never written into a dataset):**
  `total_wip` = sum of the 4 WIPs; `share_cellN` = `wip_cellN / total_wip` (cell 1 = reference)
- **Not used:** model3.csv answers, model1/model2 files, any ANN output

## 2. Methodology

1. **Marginal association** — per pair (one WIP, one queue): Pearson r + simple OLS slope
   with SE, t, p, 95% CI. By construction these ignore the other three WIPs.
2. **Multicollinearity diagnostics** — pairwise WIP–WIP correlations, per-variable **VIF**
   (variance inflation factor) in both designs, and **column-standardized condition
   numbers** (raw-scale condition numbers are dominated by unit differences and are not
   meaningful).
3. **Conditional / joint association** — per station, OLS of the form
   `queue ~ total_wip + share_cell2 + share_cell3 + share_cell4` (cell 1 = reference).
   Interpretation of a share coefficient: *how the queue co-moves when facility load is
   redistributed toward that cell while total WIP is held fixed.* This span of regressors
   is mathematically equivalent to the 4 raw WIPs, but expressed in a well-conditioned,
   interpretable basis. Textbook OLS formulas (numpy + scipy t-distribution for p-values).
4. **Uncertainty** — standard errors, t-statistics, p-values, 95% CIs, R² per model.
   With n = 605,616, **statistical significance is nearly automatic** — magnitude and
   confidence bands matter more than p-values (see §7).

## 3. Multicollinearity diagnostics (findings)

| Check | Raw 4-WIP design | Reparametrized design |
|---|---|---|
| Pairwise WIP–WIP correlations | all **−0.304** | — (shares: mild) |
| VIF per variable | 2.0–3.0 | 1.00–1.55 |
| Condition number (standardized) | **3.2** | **2.1** |

**Honest correction of the Step 6 warning:** the WIP variables are only *moderately*
mutually associated (r = −0.304; VIF 2–3 — concern normally starts at 5–10). Collinearity
is **not** severe here. Why the marginal view still misleads is *composition*, not
collinearity: cells with a larger WIP share of a (nearly constant) facility total leave
less for the others, so one-at-a-time slopes mix "more work for cell N" with "less work
for everyone else." The share-based joint model separates exactly those two things.

## 4. Findings — queue_c1s2 (hotspot, rank 1)

**Marginal (misleading by construction):** `wip_cell2` r = +0.992; cell1/3/4 negative
(−0.19 to −0.34).

**Conditional (joint model, R² = 0.9949):**

| Term | Coef | 95% CI | p | Association reading |
|---|---|---|---|---|
| total_wip | +0.2045 | [0.2043, 0.2047] | <0.001 | +0.20 parts of queue per extra facility-WIP part |
| share_cell2 | **+44,075** | [44,066, 44,085] | <0.001 | strongly higher queue when load shifts toward cell 2 |
| share_cell3 | +4,842 | [4,832, 4,852] | <0.001 | mildly higher |
| share_cell4 | +62 | [52, 72] | <0.001 | negligible (CI near zero) |

**Association summary:** c1s2's congestion co-moves with **cell 2's load share**
(with cell 1 as reference) and mildly with cell 3's. Cell 4's share is irrelevant to it.

## 5. Findings — queue_c4s3 (hotspot, rank 2)

**Marginal:** `wip_cell3` r = +1.000 (essentially deterministic); others ≈ −0.28/−0.29.

**Conditional (joint model, R² = 0.9996):**

| Term | Coef | 95% CI | p | Association reading |
|---|---|---|---|---|
| total_wip | +0.1799 | [0.1799, 0.1800] | <0.001 | +0.18 per facility-WIP part |
| share_cell3 | **+42,430** | [42,428, 42,433] | <0.001 | strongly higher queue when load shifts toward cell 3 |
| share_cell2 | +45 | [42, 47] | <0.001 | negligible |
| share_cell4 | **−84** | [−87, −81] | <0.001 | negligible in magnitude |

**Association summary:** c4s3's congestion co-moves almost entirely with **cell 3's load
share** — the tightest relationship in the dataset (R² = 0.9996).

## 6. Strongest associations (all 8 stations, share terms, all p < 0.001)

| Station | Load shifted toward | Coef (parts of queue per unit share shift) |
|---|---|---|
| queue_c1s4 | cell 4 | +49,431 |
| **queue_c1s2** | **cell 2** | **+44,075** |
| **queue_c4s3** | **cell 3** | **+42,430** |
| queue_c1s4 | cell 3 | +41,421 |
| queue_c4s4 | cell 3 | −37,094 |
| queue_c3s3 | cell 3 | +16,941 |

Direction pattern: each station's queue is dominated by **one** cell's load share
(c1s2↔cell2, c4s3↔cell3, c3s3↔cell3, c4s4↔cell3 negative, c1s4↔cell4), with facility-level
total WIP contributing a small uniform +0.18–0.20 per part. Big share coefficients reflect
shares being small (~0.25) — a +0.05 share shift is already a large operational change
(~3,000 parts of WIP re-routed), moving the associated queue by roughly coef × 0.05.

## 7. Uncertainty / significance

- All reported coefficients have p < 0.001 and extremely tight CIs — **a consequence of
  n = 605,616**, not of practical importance. CIs should be read for magnitude, not as
  hypothesis tests.
- Model fit is near-deterministic (R² = 0.995–1.000): the queue variables are smooth
  functions of the WIP scenario inputs in this simulation design — **not** noisy real-world
  measurements, another reason p-values carry little information here.
- Residual structure was not modeled; CIs assume the usual OLS conditions (see limitations).

## 8. Explicit statement on causation

**Association does not establish causation.** The data are simulation *scenarios*: WIP
vectors were set as inputs and queues were recorded as outputs. Although the simulation
structure makes "WIP drives queues" plausible, this dataset alone supports only statements
of the form "queue X is associated with load share Y." It does **not** support "changing
cell N's WIP will change queue X by Z parts," and it supports no claims about machines,
defects, costs, utilization, throughput, or downtime (those fields do not exist).

## 9. Limitations

1. Associations from one simulation model of one facility configuration; no external validity claimed.
2. No capacity/utilization/timing data — cannot relate load shares to service limits.
3. Share coefficients describe redistribution against cell 1 (reference); the cell-1
   contrast itself equals the negative sum of the other three and is not separately listed.
4. OLS CIs assume independent, homoscedastic errors; simulation outputs may violate this
   (no per-run variability metadata available to check).
5. p-values are uninformative at this sample size; magnitude/CIs are the informative part.
6. Hotspot *identification* came from Step 6 queue levels; nothing here proves any station
   is a physical bottleneck — only which load patterns its congestion co-moves with.

---
*Step 7 of 12. Next: Step 8 - production/economic impact analysis (requires fields this
dataset does not contain; will be documented as data-gapped unless organizer data arrives).*
