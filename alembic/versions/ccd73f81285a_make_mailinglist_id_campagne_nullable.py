"""Make MailingList.id_campagne nullable

Revision ID: ccd73f81285a
Revises: 6798cc88e69b
Create Date: 2025-09-01 11:16:59.276552

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ccd73f81285a'
down_revision: Union[str, Sequence[str], None] = '6798cc88e69b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('mailing_lists', 'id_campagne',
               existing_type=sa.INTEGER(),
               nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('mailing_lists', 'id_campagne',
               existing_type=sa.INTEGER(),
               nullable=False)
