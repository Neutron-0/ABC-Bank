"""add_password_to_customers

Revision ID: a1b2c3d4e5f6
Revises: 7f89f533039f
Create Date: 2026-09-13 10:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '7f89f533039f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Add password column with default 'password123' for existing seeded rows
    op.add_column(
        'customers',
        sa.Column('password', sa.String(length=128), nullable=True, server_default='password123')
    )

def downgrade() -> None:
    op.drop_column('customers', 'password')