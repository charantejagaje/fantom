"""auth columns for pre-existing databases (create_all legacy)

Revision ID: a1f7c3e92d40
Revises: dbf18f592b02
Create Date: 2026-09-20

For databases where Base.metadata.create_all() created tables BEFORE the
auth columns were added to the models (create_all does not ALTER existing
tables). Each column addition is attempted and skipped if already present,
so this migration is idempotent and safe on fresh databases too.
"""

from alembic import op
import sqlalchemy as sa

revision = "a1f7c3e92d40"
down_revision = "dbf18f592b02"
branch_labels = None
depends_on = None


def _has_column(table: str, column: str) -> bool:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    return column in [c["name"] for c in insp.get_columns(table)]


def upgrade() -> None:
    if not _has_column("users", "email_verified"):
        op.add_column("users", sa.Column("email_verified", sa.Boolean(), nullable=False,
                                         server_default=sa.false()))

    if not _has_column("users", "assigned_station"):
        op.add_column("users", sa.Column("assigned_station", sa.String(length=64), nullable=True))

    if not _has_column("users", "invited_by"):
        op.add_column("users", sa.Column("invited_by", sa.Integer(), nullable=True))
        try:
            op.create_foreign_key("fk_users_invited_by_users", "users", "users",
                                  ["invited_by"], ["id"])
        except Exception:
            pass  # already named/created

    # Backfill: treat every pre-existing user as verified (they existed before
    # email verification was introduced).
    op.execute("UPDATE users SET email_verified = true")


def downgrade() -> None:
    try:
        op.drop_constraint("fk_users_invited_by_users", "users", type_="foreignkey")
    except Exception:
        pass
    op.drop_column("users", "invited_by")
    op.drop_column("users", "assigned_station")
    op.drop_column("users", "email_verified")
