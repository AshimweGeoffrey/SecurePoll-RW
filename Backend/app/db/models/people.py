"""People models: Field officers, admin users, roles, sessions."""
from typing import Optional, List
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models.base import Base, TimestampMixin, uuid_pk
from app.core.enums import UserStatus
import uuid


class FieldOfficer(Base, TimestampMixin):
    __tablename__ = "field_officers"

    id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String)
    team: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    assigned_district_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("districts.id"), nullable=True)


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    permissions: Mapped[List[str]] = mapped_column(JSON, default=list)


class AdminUser(Base, TimestampMixin):
    __tablename__ = "admin_users"

    id: Mapped[uuid.UUID] = uuid_pk()
    full_name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True)
    password_hash: Mapped[str] = mapped_column(String)
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id"))
    district_scope: Mapped[str] = mapped_column(String, default="National")
    status: Mapped[UserStatus] = mapped_column(Enum(UserStatus), default=UserStatus.invitation_pending)
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    totp_secret: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_active_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    role: Mapped["Role"] = relationship()
    sessions: Mapped[List["Session"]] = relationship(back_populates="user")


class Session(Base, TimestampMixin):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("admin_users.id"))
    device: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_active_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["AdminUser"] = relationship(back_populates="sessions")
