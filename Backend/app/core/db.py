"""Database engine and session configuration."""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Create engine with connection pooling
# Pool kept modest: the DATABASE_URL points at Supabase's own connection pooler,
# so a large app-side pool just multiplies connections against the pooler quota.
# connect_timeout makes a saturated pooler fail fast instead of hanging a worker.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=5,
    pool_timeout=10,
    connect_args={"connect_timeout": 10},
    echo=settings.debug,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Dependency to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@event.listens_for(engine, "connect")
def set_postgres_options(dbapi_conn, connection_record):
    """Set PostgreSQL-specific options on connect."""
    cursor = dbapi_conn.cursor()
    cursor.execute("SET TIME ZONE 'UTC'")
    cursor.close()
