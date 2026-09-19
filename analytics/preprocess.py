"""Safe preprocessing pipeline for facility_sim_full.csv.

Rules this script follows (project data rules):
  - data/raw/ is ORIGINAL SOURCE DATA: opened read-only, never modified.
  - All cleaning output goes to data/processed/ as a NEW file.
  - Every action is logged to data/processed/preprocessing_log.txt.
  - Nothing is invented: we only remove exact duplicate rows.

Usage (from the repo root):
    python analytics/preprocess.py
"""

import sys
from datetime import datetime
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW_FILE = ROOT / "data" / "raw" / "facility_sim_full.csv"
OUT_DIR = ROOT / "data" / "processed"
CLEAN_FILE = OUT_DIR / "facility_sim_clean.csv"
LOG_FILE = OUT_DIR / "preprocessing_log.txt"

# The 12 verified columns (see docs/assumptions_log.md). If the raw file ever
# changes structure, we want the pipeline to STOP, not silently continue.
EXPECTED_COLUMNS = [
    "wip_cell1", "wip_cell2", "wip_cell3", "wip_cell4",
    "queue_c1s2", "queue_c1s4", "queue_c2s2", "queue_c2s4",
    "queue_c3s2", "queue_c3s3", "queue_c4s3", "queue_c4s4",
]


def main() -> None:
    lines: list[str] = []

    def log(msg: str) -> None:
        print(msg)
        lines.append(msg)

    log("=" * 70)
    log("PREPROCESSING LOG - facility_sim_full.csv")
    log(f"Started : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log(f"Input   : data/raw/facility_sim_full.csv  (READ-ONLY, never modified)")
    log(f"Output  : data/processed/facility_sim_clean.csv")
    log("=" * 70)

    # ---- [1] Load the raw file (pandas only reads it) ------------------------
    df = pd.read_csv(RAW_FILE)
    log(f"\n[1] Loaded raw file: {len(df)} rows x {df.shape[1]} columns")

    # ---- [2] Structure check: stop if columns are not what we documented ----
    unexpected = [c for c in df.columns if c not in EXPECTED_COLUMNS]
    missing = [c for c in EXPECTED_COLUMNS if c not in df.columns]
    if unexpected or missing:
        log(f"STOP: raw file structure changed!")
        log(f"  missing columns : {missing}")
        log(f"  unexpected cols : {unexpected}")
        log("  -> review docs/assumptions_log.md before proceeding.")
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        LOG_FILE.write_text("\n".join(lines), encoding="utf-8")
        sys.exit(1)
    log("[2] Structure check: all 12 expected columns present, no extras")

    # ---- [3] Missing values: expect 0 (Step 2 inspection). If not, stop. ----
    n_missing = int(df.isna().sum().sum())
    log(f"[3] Missing values: {n_missing}")
    if n_missing > 0:
        log("STOP: missing values found - cleaning them needs a human decision.")
        log("      (Imputing values without review would risk inventing data.)")
        LOG_FILE.write_text("\n".join(lines), encoding="utf-8")
        sys.exit(1)

    # ---- [4] Duplicates: drop exact copies, keep the first occurrence -------
    n_dup = int(df.duplicated().sum())
    df_clean = df.drop_duplicates(keep="first")
    log(f"[4] Duplicates dropped: {n_dup} (kept first occurrence of each)")
    log(f"    Rows before: {len(df)}  ->  rows after: {len(df_clean)}")

    # ---- [5] Sanity check: queue/WIP counts can never be negative -----------
    n_negative = int((df_clean < 0).sum().sum())
    log(f"[5] Negative values after cleaning: {n_negative} (expected 0)")
    if n_negative > 0:
        log("STOP: negative counts found — investigate before using the data.")
        LOG_FILE.write_text("\n".join(lines), encoding="utf-8")
        sys.exit(1)

    # ---- [6] Save the cleaned copy + the log --------------------------------
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    df_clean.to_csv(CLEAN_FILE, index=False)
    log(f"[6] Saved cleaned copy: {CLEAN_FILE.relative_to(ROOT)}")

    log("\n" + "-" * 70)
    log("SUMMARY")
    log(f"  raw rows in            : {len(df)}")
    log(f"  duplicates removed     : {n_dup}")
    log(f"  clean rows out         : {len(df_clean)}")
    log(f"  missing values         : {n_missing}")
    log(f"  raw file modified?     : NO - data/raw/ untouched")
    log(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    LOG_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"\nLog saved to: {LOG_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
