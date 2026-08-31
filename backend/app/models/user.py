from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    profile: Mapped[UserProfile | None] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    activities: Mapped[list[UserActivity]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    availability: Mapped[list[Availability]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    matches_as_user: Mapped[list[Match]] = relationship(
        foreign_keys="Match.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    matches_as_matched_user: Mapped[list[Match]] = relationship(
        foreign_keys="Match.matched_user_id",
        back_populates="matched_user",
        cascade="all, delete-orphan",
    )
