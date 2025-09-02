"""Add SMS queue and performance enhancements

Revision ID: 4135d03468b3
Revises: 6798cc88e69b
Create Date: 2025-09-02 22:42:37.229505

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4135d03468b3'
down_revision: Union[str, Sequence[str], None] = '6798cc88e69b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add SMS queue table and performance indexes"""

    # Create SMS queue table
    op.create_table(
        'sms_queue',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('campaign_id', sa.Integer(), nullable=False),
        sa.Column('contact_id', sa.Integer(), nullable=False),
        sa.Column('message_content', sa.TEXT(), nullable=False),
        sa.Column('scheduled_at', sa.TIMESTAMP(), nullable=False),
        sa.Column('status', sa.String(20), server_default='pending', nullable=False),
        sa.Column('attempts', sa.Integer(), server_default='0', nullable=False),
        sa.Column('error_message', sa.TEXT(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('processed_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['campaign_id'], ['campagnes.id_campagne'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['contact_id'], ['contacts.id_contact'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("status IN ('pending', 'processing', 'sent', 'failed')")
    )

    # Add performance indexes
    op.create_index('idx_sms_queue_status', 'sms_queue', ['status'])
    op.create_index('idx_sms_queue_scheduled', 'sms_queue', ['scheduled_at'])
    op.create_index('idx_sms_queue_campaign', 'sms_queue', ['campaign_id'])

    # Add contact indexes
    op.create_index('idx_contacts_segment', 'contacts', ['segment'])
    op.create_index('idx_contacts_zone', 'contacts', ['zone_geographique'])
    op.create_index('idx_contacts_opt_in', 'contacts', ['statut_opt_in'])

    # Add campaign indexes
    op.create_index('idx_campagnes_statut', 'campagnes', ['statut'])
    op.create_index('idx_campagnes_date_debut', 'campagnes', ['date_debut'])

    # Add message indexes
    op.create_index('idx_messages_campaign', 'messages', ['id_campagne'])
    op.create_index('idx_messages_status', 'messages', ['statut_livraison'])
    op.create_index('idx_messages_date', 'messages', ['date_envoi'])

    # Add activity log indexes
    op.create_index('idx_activity_logs_user', 'activity_logs', ['user_id'])
    op.create_index('idx_activity_logs_timestamp', 'activity_logs', ['timestamp'])


def downgrade() -> None:
    """Remove SMS queue and indexes"""
    # Drop all indexes
    op.drop_index('idx_activity_logs_timestamp', table_name='activity_logs')
    op.drop_index('idx_activity_logs_user', table_name='activity_logs')
    op.drop_index('idx_messages_date', table_name='messages')
    op.drop_index('idx_messages_status', table_name='messages')
    op.drop_index('idx_messages_campaign', table_name='messages')
    op.drop_index('idx_campagnes_date_debut', table_name='campagnes')
    op.drop_index('idx_campagnes_statut', table_name='campagnes')
    op.drop_index('idx_contacts_opt_in', table_name='contacts')
    op.drop_index('idx_contacts_zone', table_name='contacts')
    op.drop_index('idx_contacts_segment', table_name='contacts')
    op.drop_index('idx_sms_queue_campaign', table_name='sms_queue')
    op.drop_index('idx_sms_queue_scheduled', table_name='sms_queue')
    op.drop_index('idx_sms_queue_status', table_name='sms_queue')

    # Drop SMS queue table
    op.drop_table('sms_queue')
