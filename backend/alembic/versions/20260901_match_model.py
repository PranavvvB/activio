"""Add match table

Revision ID: 20260901_match_model
Revises: 20260831_initial_schema
Create Date: 2026-09-01 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260901_match_model"
down_revision = "20260831_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "matches",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("matched_user_id", sa.Integer(), nullable=False),
        sa.Column("activity_id", sa.Integer(), nullable=True),
        sa.Column("score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("explanation", sa.String(length=1000), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["activity_id"], ["activities.id"], name="fk_matches_activity_id_activities"),
        sa.ForeignKeyConstraint(["matched_user_id"], ["users.id"], name="fk_matches_matched_user_id_users"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_matches_user_id_users"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_matches_activity_id"), "matches", ["activity_id"], unique=False)
    op.create_index(op.f("ix_matches_id"), "matches", ["id"], unique=False)
    op.create_index(op.f("ix_matches_matched_user_id"), "matches", ["matched_user_id"], unique=False)
    op.create_index(op.f("ix_matches_user_id"), "matches", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_matches_user_id"), table_name="matches")
    op.drop_index(op.f("ix_matches_matched_user_id"), table_name="matches")
    op.drop_index(op.f("ix_matches_id"), table_name="matches")
    op.drop_index(op.f("ix_matches_activity_id"), table_name="matches")
    op.drop_table("matches")
