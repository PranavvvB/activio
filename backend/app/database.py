from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import get_settings
from app.db.base import Base

settings = get_settings()

engine = create_engine(settings.sqlalchemy_database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, expire_on_commit=False
)


def create_db_tables() -> None:
    """Create database tables for future models.

    This helper is intentionally not invoked during app startup because the project
    requires Alembic-managed migrations for schema changes.
    """
    Base.metadata.create_all(bind=engine)
