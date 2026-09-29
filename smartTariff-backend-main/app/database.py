import os
import shutil
from pathlib import Path
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings


def get_database_url() -> str:
    db_url = settings.database_url
    if db_url.startswith("sqlite"):
        # On Vercel / serverless environments, filesystem is read-only except /tmp
        if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
            tmp_db = Path("/tmp/smarttariff.db")
            if not tmp_db.exists():
                source_db = Path(__file__).resolve().parent.parent / "smarttariff.db"
                if source_db.exists():
                    try:
                        shutil.copyfile(source_db, tmp_db)
                        print(f"📦 Initialized SQLite DB in /tmp from {source_db.name}")
                    except Exception as e:
                        print(f"⚠️ Could not copy source db: {e}")
            return f"sqlite:///{tmp_db}"
    return db_url


effective_db_url = get_database_url()

engine = create_engine(
    effective_db_url,
    connect_args={"check_same_thread": False} if effective_db_url.startswith("sqlite") else {},
    echo=False,
)


# SQLite PRAGMA configuration
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, _connection_record):
    try:
        cursor = dbapi_connection.cursor()
        if not (os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")):
            cursor.execute("PRAGMA journal_mode=WAL")
        else:
            cursor.execute("PRAGMA journal_mode=DELETE")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
    except Exception as e:
        print(f"⚠️ SQLite pragma notice: {e}")


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables if they don't exist."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"⚠️ Warning during table creation: {e}")
