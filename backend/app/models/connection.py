from __future__ import annotations

from datetime import datetime

from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.message import Message
    from app.models.user import User


class Connection(Base):
    __tablename__ = "connections"
    __table_args__ = (
        UniqueConstraint("requester_id", "recipient_id", name="uq_connection_pair"),
        CheckConstraint("requester_id != recipient_id", name="ck_connection_not_self"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    requester: Mapped[User] = relationship(foreign_keys=[requester_id], back_populates="connections_sent")
    recipient: Mapped[User] = relationship(foreign_keys=[recipient_id], back_populates="connections_received")
    messages: Mapped[list[Message]] = relationship(back_populates="connection", cascade="all, delete-orphan")
