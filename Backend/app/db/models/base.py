"""Base model classes and mixins."""
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, func
from datetime import datetime
import uuid


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""
    pass


def uuid_pk() -> Mapped[uuid.UUID]:
    """Generate a UUID primary key column."""
    return mapped_column(primary_key=True, default=uuid.uuid4)


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
