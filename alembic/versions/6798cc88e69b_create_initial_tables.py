"""Create initial tables

Revision ID: 6798cc88e69b
Revises:
Create Date: 2025-08-31 14:02:46.629007

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6798cc88e69b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'agents',
        sa.Column('id_agent', sa.Integer(), nullable=False),
        sa.Column('nom_agent', sa.String(length=100), nullable=False),
        sa.Column('identifiant', sa.String(length=100), nullable=False),
        sa.Column('mot_de_passe', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=True),
        sa.PrimaryKeyConstraint('id_agent'),
        sa.UniqueConstraint('identifiant'),
        sa.CheckConstraint("role IN ('admin', 'supervisor', 'agent')")
    )
    op.create_index(op.f('ix_agents_id_agent'), 'agents', ['id_agent'], unique=False)

    op.create_table(
        'message_templates',
        sa.Column('id_modele', sa.Integer(), nullable=False),
        sa.Column('nom_modele', sa.String(length=100), nullable=False),
        sa.Column('contenu_modele', sa.TEXT(), nullable=False),
        sa.Column('variables', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['agents.id_agent'], ),
        sa.PrimaryKeyConstraint('id_modele')
    )

    op.create_table(
        'campagnes',
        sa.Column('id_campagne', sa.Integer(), nullable=False),
        sa.Column('nom_campagne', sa.String(length=100), nullable=False),
        sa.Column('date_debut', sa.TIMESTAMP(), nullable=False),
        sa.Column('date_fin', sa.TIMESTAMP(), nullable=False),
        sa.Column('statut', sa.String(length=50), nullable=False),
        sa.Column('type_campagne', sa.String(length=50), nullable=False),
        sa.Column('id_agent', sa.Integer(), nullable=False),
        sa.Column('id_modele', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['id_agent'], ['agents.id_agent'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['id_modele'], ['message_templates.id_modele'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id_campagne'),
        sa.CheckConstraint("statut IN ('draft', 'scheduled', 'active', 'completed', 'paused')"),
        sa.CheckConstraint("type_campagne IN ('promotional', 'informational', 'follow_up')")
    )
    op.create_index(op.f('ix_campagnes_id_campagne'), 'campagnes', ['id_campagne'], unique=False)
    op.create_index(op.f('ix_campagnes_id_agent'), 'campagnes', ['id_agent'], unique=False)

    op.create_table(
        'contacts',
        sa.Column('id_contact', sa.Integer(), nullable=False),
        sa.Column('nom', sa.String(length=100), nullable=False),
        sa.Column('prenom', sa.String(length=100), nullable=False),
        sa.Column('numero_telephone', sa.String(length=20), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('statut_opt_in', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('segment', sa.String(length=100), nullable=True),
        sa.Column('zone_geographique', sa.String(length=100), nullable=True),
        sa.Column('type_client', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id_contact'),
        sa.UniqueConstraint('numero_telephone')
    )
    op.create_index(op.f('ix_contacts_numero_telephone'), 'contacts', ['numero_telephone'], unique=True)

    op.create_table(
        'mailing_lists',
        sa.Column('id_liste', sa.Integer(), nullable=False),
        sa.Column('nom_liste', sa.String(length=100), nullable=False),
        sa.Column('description', sa.TEXT(), nullable=True),
        sa.Column('id_campagne', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['id_campagne'], ['campagnes.id_campagne'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id_liste')
    )

    op.create_table(
        'liste_contacts',
        sa.Column('id_liste', sa.Integer(), nullable=False),
        sa.Column('id_contact', sa.Integer(), nullable=False),
        sa.Column('added_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['id_contact'], ['contacts.id_contact'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['id_liste'], ['mailing_lists.id_liste'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id_liste', 'id_contact')
    )

    op.create_table(
        'messages',
        sa.Column('id_message', sa.Integer(), nullable=False),
        sa.Column('contenu', sa.TEXT(), nullable=False),
        sa.Column('date_envoi', sa.TIMESTAMP(), nullable=False),
        sa.Column('statut_livraison', sa.String(length=50), nullable=False),
        sa.Column('identifiant_expediteur', sa.String(length=100), nullable=False),
        sa.Column('external_message_id', sa.String(length=255), nullable=True),
        sa.Column('error_message', sa.TEXT(), nullable=True),
        sa.Column('cost', sa.DECIMAL(10, 4), nullable=True),
        sa.Column('id_liste', sa.Integer(), nullable=False),
        sa.Column('id_contact', sa.Integer(), nullable=False),
        sa.Column('id_campagne', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['id_campagne'], ['campagnes.id_campagne'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['id_contact'], ['contacts.id_contact'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['id_liste'], ['mailing_lists.id_liste'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id_message'),
        sa.CheckConstraint("statut_livraison IN ('pending', 'sent', 'delivered', 'failed', 'bounced')")
    )
    op.create_index(op.f('ix_messages_date_envoi'), 'messages', ['date_envoi'], unique=False)
    op.create_index(op.f('ix_messages_statut_livraison'), 'messages', ['statut_livraison'], unique=False)
    op.create_index(op.f('ix_messages_id_campagne'), 'messages', ['id_campagne'], unique=False)


    op.create_table(
        'campaign_reports',
        sa.Column('id_rapport', sa.Integer(), nullable=False),
        sa.Column('total_sent', sa.Integer(), server_default=sa.text('0'), nullable=True),
        sa.Column('total_delivered', sa.Integer(), server_default=sa.text('0'), nullable=True),
        sa.Column('total_failed', sa.Integer(), server_default=sa.text('0'), nullable=True),
        sa.Column('taux_ouverture', sa.FLOAT(), server_default=sa.text('0'), nullable=True),
        sa.Column('taux_clics', sa.FLOAT(), server_default=sa.text('0'), nullable=True),
        sa.Column('taux_conversion', sa.FLOAT(), server_default=sa.text('0'), nullable=True),
        sa.Column('nombre_desabonnements', sa.Integer(), server_default=sa.text('0'), nullable=True),
        sa.Column('total_cost', sa.DECIMAL(10, 2), server_default=sa.text('0'), nullable=True),
        sa.Column('id_campagne', sa.Integer(), nullable=False),
        sa.Column('last_updated', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['id_campagne'], ['campagnes.id_campagne'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id_rapport'),
        sa.UniqueConstraint('id_campagne')
    )

    op.create_table(
        'activity_logs',
        sa.Column('id_log', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('table_affected', sa.String(length=50), nullable=True),
        sa.Column('record_id', sa.Integer(), nullable=True),
        sa.Column('old_values', sa.JSON(), nullable=True),
        sa.Column('new_values', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('timestamp', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['agents.id_agent'], ),
        sa.PrimaryKeyConstraint('id_log')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('activity_logs')
    op.drop_table('campaign_reports')
    op.drop_index(op.f('ix_messages_statut_livraison'), table_name='messages')
    op.drop_index(op.f('ix_messages_id_campagne'), table_name='messages')
    op.drop_index(op.f('ix_messages_date_envoi'), table_name='messages')
    op.drop_table('messages')
    op.drop_table('liste_contacts')
    op.drop_table('mailing_lists')
    op.drop_index(op.f('ix_contacts_numero_telephone'), table_name='contacts')
    op.drop_table('contacts')
    op.drop_index(op.f('ix_campagnes_id_campagne'), table_name='campagnes')
    op.drop_index(op.f('ix_campagnes_id_agent'), table_name='campagnes')
    op.drop_table('campagnes')
    op.drop_table('message_templates')
    op.drop_index(op.f('ix_agents_id_agent'), table_name='agents')
    op.drop_table('agents')
