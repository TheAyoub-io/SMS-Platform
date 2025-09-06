"""Add indexes to liste_contacts table

Revision ID: e406c986d79e
Revises: 64f3934e4aa6
Create Date: 2025-09-05 23:52:22.710552

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e406c986d79e'
down_revision: Union[str, Sequence[str], None] = '64f3934e4aa6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index('ix_liste_contacts_id_liste', 'liste_contacts', ['id_liste'], unique=False)
    op.create_index('ix_liste_contacts_id_contact', 'liste_contacts', ['id_contact'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_liste_contacts_id_contact', table_name='liste_contacts')
    op.drop_index('ix_liste_contacts_id_liste', table_name='liste_contacts')
