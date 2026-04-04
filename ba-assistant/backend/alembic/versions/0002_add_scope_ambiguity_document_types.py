"""add scope_definition and ambiguity_report document types

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-01 00:00:00.000000
"""
import sqlalchemy as sa

from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # PostgreSQL requires ALTER TYPE to add enum values.
    # These are non-transactional in Postgres, so they run outside any implicit
    # transaction that Alembic manages.
    connection = op.get_bind()
    if connection.dialect.name == "postgresql":
        connection.execute(
            sa.text("ALTER TYPE documenttype ADD VALUE IF NOT EXISTS 'scope_definition'")
        )
        connection.execute(
            sa.text("ALTER TYPE documenttype ADD VALUE IF NOT EXISTS 'ambiguity_report'")
        )
    # SQLite (used in tests) stores enums as VARCHAR — no ALTER TYPE needed.


def downgrade() -> None:
    # Postgres does not support removing enum values without recreating the type.
    # Document this as a no-op; a manual recreation is required to roll back.
    pass
