"""Add drug classification history

Revision ID: 3b9a0a1a1a1a
Revises: 2af409918009
Create Date: 2026-06-04 11:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '3b9a0a1a1a1a'
down_revision = '2af409918009'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'drug_classification_history',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('input_data', sa.String(), nullable=False),
        sa.Column('smiles', sa.String(), nullable=False),
        sa.Column('predicted_class', sa.String(), nullable=False),
        sa.Column('confidence', sa.JSON(), nullable=False),
        sa.Column('note', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_drug_classification_history_created_at'), 'drug_classification_history', ['created_at'], unique=False)
    op.create_index(op.f('ix_drug_classification_history_id'), 'drug_classification_history', ['id'], unique=False)
    op.create_index(op.f('ix_drug_classification_history_user_id'), 'drug_classification_history', ['user_id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_drug_classification_history_user_id'), table_name='drug_classification_history')
    op.drop_index(op.f('ix_drug_classification_history_id'), table_name='drug_classification_history')
    op.drop_index(op.f('ix_drug_classification_history_created_at'), table_name='drug_classification_history')
    op.drop_table('drug_classification_history')
