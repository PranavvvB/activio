"""Add connection requests and messages.

Revision ID: 20260901_connections_messages
Revises: 20260901_match_model
"""

from alembic import op
import sqlalchemy as sa

revision = "20260901_connections_messages"
down_revision = "20260901_match_model"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "connections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("requester_id", sa.Integer(), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column(
            "status", sa.String(length=20), nullable=False, server_default="pending"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["requester_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("requester_id", "recipient_id", name="uq_connection_pair"),
        sa.CheckConstraint(
            "requester_id != recipient_id", name="ck_connection_not_self"
        ),
    )
    for column in ("id", "requester_id", "recipient_id", "status"):
        op.create_index(
            op.f("ix_connections_{0}".format(column)),
            "connections",
            [column],
            unique=False,
        )
    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("connection_id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["connection_id"], ["connections.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    for column in ("id", "connection_id", "sender_id"):
        op.create_index(
            op.f("ix_messages_{0}".format(column)), "messages", [column], unique=False
        )


def downgrade() -> None:
    for column in ("sender_id", "connection_id", "id"):
        op.drop_index(op.f("ix_messages_{0}".format(column)), table_name="messages")
    op.drop_table("messages")
    for column in ("status", "recipient_id", "requester_id", "id"):
        op.drop_index(
            op.f("ix_connections_{0}".format(column)), table_name="connections"
        )
    op.drop_table("connections")
