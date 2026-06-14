"""Base model classes and mixins."""
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, Enum as SAEnum, func
from datetime import datetime
import uuid


class Base(DeclarativeBase):
    pass


def uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(primary_key=True, default=uuid.uuid4)


def val_enum(enum_cls, **kwargs) -> SAEnum:
    """SQLAlchemy Enum that stores .value (not .name) in Postgres."""
    return SAEnum(enum_cls, values_callable=lambda e: [m.value for m in e], **kwargs)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
