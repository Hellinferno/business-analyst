"""Add refresh_token column to users table for server-side revocation

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-06 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("refresh_token", sa.String(512), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "refresh_token")
