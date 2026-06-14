"""People models: Field officers, admin users, roles, sessions."""
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models.base import Base, TimestampMixin, uuid_pk
from app.core.enums import UserStatus
import uuid


class FieldOfficer(Base, TimestampMixin):
    """Election field officer."""
    __tablename__ = "field_officers"
    
    id = uuid_pk()
    name: Mapped[str] = mapped_column(String)
    team: Mapped[str | None] = mapped_column(String)
    assigned_district_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("districts.id"))


class Role(Base, TimestampMixin):
    """Administrative role with permissions."""
    __tablename__ = "roles"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    permissions: Mapped[list[str]] = mapped_column(JSON, default=list)


class AdminUser(Base, TimestampMixin):
    """Administrative system user."""
    __tablename__ = "admin_users"
    
    id = uuid_pk()
    full_name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True)
    password_hash: Mapped[str] = mapped_column(String)
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id"))
    district_scope: Mapped[str] = mapped_column(String, default="National")
    status: Mapped[UserStatus] = mapped_column(Enum(UserStatus), default=UserStatus.invitation_pending)
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    totp_secret: Mapped[str | None] = mapped_column(String)
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    role: Mapped["Role"] = relationship()
    sessions: Mapped[list["Session"]] = relationship(back_populates="user")


class Session(Base, TimestampMixin):
    """User session tracking."""
    __tablename__ = "sessions"
    
    id = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("admin_users.id"))
    device: Mapped[str | None] = mapped_column(String)
    ip_address: Mapped[str | None] = mapped_column(String)
    location: Mapped[str | None] = mapped_column(String)
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    user: Mapped["AdminUser"] = relationship(back_populates="sessions")
