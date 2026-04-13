"""size_sub_product id nullable

Revision ID: f3a1b2c4d5e6
Revises: dd92a850f360
Create Date: 2026-04-13 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3a1b2c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'dd92a850f360'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('size_sub_product') as batch_op:
        batch_op.alter_column('id',
                              existing_type=sa.Integer(),
                              nullable=True)


def downgrade() -> None:
    with op.batch_alter_table('size_sub_product') as batch_op:
        batch_op.alter_column('id',
                              existing_type=sa.Integer(),
                              nullable=False)
