import os
import subprocess
import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session

logger = logging.getLogger(__name__)

def resolve_database_url() -> str:
    """
    Resolves authoritative PostgreSQL connection URL.
    1. Reads direct DATABASE_URL environment variable if set.
    2. Inspects Windows neighbor table for WSL IPv4 address (where native PostgreSQL runs).
    3. Falls back to localhost.
    """
    env_url = os.environ.get("DATABASE_URL")
    if env_url:
        return env_url

    try:
        cmd = ["powershell", "-NoProfile", "-Command", "(Get-NetNeighbor -InterfaceAlias '*WSL*' -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '172.*' -and $_.IPAddress -notlike '*.255' }).IPAddress"]
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=2)
        if proc.returncode == 0:
            lines = [l.strip() for l in proc.stdout.splitlines() if l.strip()]
            if lines:
                ip = lines[0]
                return f"postgresql+psycopg://abc_bank:AbcBank_Secure2026_KeyDB!@{ip}:5432/abc_bank"
    except Exception:
        pass

    return "postgresql+psycopg://abc_bank:AbcBank_Secure2026_KeyDB!@localhost:5432/abc_bank"

DATABASE_URL = resolve_database_url()

if not DATABASE_URL.startswith("postgresql"):
    raise ValueError(
        f"[DB Engine] Unsupported DATABASE_URL '{DATABASE_URL}'. "
        "ABC Bank requires a PostgreSQL database (e.g. postgresql+psycopg://user:pass@host:5432/dbname)."
    )

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args={"connect_timeout": 2},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
