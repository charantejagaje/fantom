"""Inspect any CSV in data/raw/ — read-only profiling, no cleaning or transformation.

Prints a sectioned report to the terminal and saves a copy to
data/processed/<csv_name>_inspection.txt.

Usage (from the repo root):
    python analytics/inspect_data.py                  -> defaults to model3.csv
    python analytics/inspect_data.py model1.csv       -> any file in data/raw/
    python analytics/inspect_data.py facility_sim_full.csv
"""

import sys
from datetime import datetime
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
REPORT_DIR = ROOT / "data" / "processed"

DEFAULT_FILE = "model3.csv"


def section(title: str, body: str) -> str:
    """Format one report section with clear separators."""
    line = "=" * 78
    return f"{line}\n{title}\n{line}\n{body}\n"


def build_report(df: pd.DataFrame, filename: str) -> str:
    parts = [
        section(
            "INSPECTION REPORT — data/raw/" + filename,
            f"Generated : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"Source    : {RAW_DIR / filename}\n"
            f"(Read-only inspection. The source file was not modified.)",
        ),
        section(
            "1. SHAPE",
            f"Number of rows   : {len(df)}\nNumber of columns: {df.shape[1]}",
        ),
        section(
            "2. COLUMN NAMES",
            "\n".join(f"  [{i}] {name}" for i, name in enumerate(df.columns)),
        ),
        section(
            "3. DATA TYPES (pandas)",
            df.dtypes.rename("dtype").to_string(),
        ),
        section(
            "4. MISSING VALUES PER COLUMN",
            df.isna().sum().rename("missing").to_string(),
        ),
        section(
            "5. UNIQUE VALUES PER COLUMN",
            df.nunique().rename("unique").to_string(),
        ),
        section(
            "6. FIRST 5 ROWS",
            df.head(5).to_string(),
        ),
        section(
            "8. DUPLICATE ROWS",
            "A duplicate row is a row that is 100% identical to an earlier row "
            "in every column.\nWe only COUNT them here — nothing is removed.\n\n"
            f"Total rows                          : {len(df)}\n"
            f"Fully duplicated rows (extra copies): {int(df.duplicated().sum())}\n"
            f"Unique rows (first occurrences kept): {int(len(df) - df.duplicated().sum())}",
        ),
    ]

    numeric = df.select_dtypes(include="number")
    if numeric.shape[1] > 0:
        parts.append(
            section(
                "7. DESCRIPTIVE STATISTICS (numeric columns)",
                numeric.describe().round(4).to_string(),
            )
        )
    else:
        parts.append(
            section("7. DESCRIPTIVE STATISTICS (numeric columns)", "No numeric columns found.")
        )

    return "\n".join(parts)


def main() -> None:
    # Which file? Optional first argument, e.g. `python analytics/inspect_data.py model1.csv`
    filename = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_FILE
    csv_path = RAW_DIR / filename

    if not csv_path.exists():
        print(f"ERROR: file not found: {csv_path}")
        print("Files available in data/raw/:")
        for f in sorted(RAW_DIR.glob("*.csv")):
            print(f"  - {f.name}")
        sys.exit(1)

    pd.set_option("display.max_columns", None)
    pd.set_option("display.width", 160)

    df = pd.read_csv(csv_path)
    report = build_report(df, filename)

    print(report)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report_path = REPORT_DIR / f"{Path(filename).stem}_inspection.txt"
    report_path.write_text(report, encoding="utf-8")
    print(f"Report saved to: {report_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
