from sqlalchemy import create_engine

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
)

from .config import (
    DATABASE_URL,
)


# ============================================================
# ENGINE OPTIONS
# ============================================================

engine_options = {
    "pool_pre_ping": True
}


# SQLite requires this option.
# PostgreSQL and other databases do not.

if DATABASE_URL.startswith(
    "sqlite"
):

    engine_options[
        "connect_args"
    ] = {
        "check_same_thread":
            False
    }


# ============================================================
# DATABASE ENGINE
# ============================================================

engine = create_engine(
    DATABASE_URL,
    **engine_options
)


# ============================================================
# SESSION FACTORY
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ============================================================
# DECLARATIVE BASE
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()