"""Create development test users (worker / engineer / owner).

Usage (from repo root):
    python backend/scripts/create_test_users.py

- Passwords come from the environment (TEST_USER_PASSWORD) or an interactive
  prompt - NEVER hardcoded in source.
- Dev convenience: accounts created here are marked email-verified directly in
  the LOCAL development database. Production accounts must always go through
  register + email verification; this script refuses to run in production.
"""

import getpass
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))  # backend/ (for `app`)

from app.config import settings  # noqa: E402
from app.db import SessionLocal, init_db  # noqa: E402
from app.models import User  # noqa: E402
from app.security import hash_password  # noqa: E402
from sqlalchemy import select  # noqa: E402


def main() -> None:
    if settings.is_production:
        print("REFUSING: this script must not run with ENVIRONMENT=production.")
        sys.exit(1)

    password = os.environ.get("TEST_USER_PASSWORD")
    if not password:
        password = getpass.getpass("Password for the three test accounts (min 8 chars): ")
    if len(password) < 8:
        print("Password too short (min 8).")
        sys.exit(1)

    accounts = [
        ("test.worker@fantom.dev", "Test Worker", "worker", "queue_c1s2"),
        ("test.engineer@fantom.dev", "Test Engineer", "engineer", None),
        ("test.owner@fantom.dev", "Test Owner", "owner", None),
    ]

    init_db()
    with SessionLocal() as db:
        for email, name, role, station in accounts:
            user = db.scalar(select(User).where(User.email == email))
            if user is None:
                user = User(email=email, full_name=name, role=role,
                            hashed_password=hash_password(password),
                            assigned_station=station, email_verified=True)
                db.add(user)
                print(f"created  {email}  ({role})")
            else:
                user.hashed_password = hash_password(password)
                user.role = role
                user.email_verified = True
                user.assigned_station = station
                print(f"reset    {email}  ({role})")
        db.commit()
    print("\nDevelopment accounts ready (marked verified for local testing only).")


if __name__ == "__main__":
    main()
