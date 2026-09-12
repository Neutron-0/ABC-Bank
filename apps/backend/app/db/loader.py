import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

from apps.backend.app.db.session import SessionLocal
from apps.backend.app.db.repositories.customer_repo import CustomerRepository
from apps.backend.app.db.repositories.transaction_repo import TransactionRepository

logger = logging.getLogger(__name__)

class DataLoader:
    """
    Primary Data Access Layer for ABC Bank.
    Reads customer records, accounts, and transaction logs directly from PostgreSQL.
    If PostgreSQL is offline or unconfigured, raises an operational error with actionable instructions.
    Legacy JSON scenarios are loaded from disk with clean normalization.
    """

    @classmethod
    def get_data_dir(cls) -> Path:
        return Path(__file__).resolve().parents[4] / "data"

    @classmethod
    def load_customers(cls) -> List[Dict[str, Any]]:
        """Loads all customer summaries from PostgreSQL."""
        try:
            with SessionLocal() as db:
                customers = CustomerRepository.get_all(db, limit=2000)
                result = []
                for c in customers:
                    summary = CustomerRepository.get_customer_summary(db, c.id)
                    if summary:
                        result.append(summary)
                if result:
                    return result
        except Exception as e:
            logger.error(
                f"[DataLoader] Failed to query customers from PostgreSQL: {e}. "
                "Ensure PostgreSQL is running and DATABASE_URL is properly configured."
            )
            raise RuntimeError(
                f"PostgreSQL database connection failed: {e}. "
                "Please ensure your PostgreSQL database is running (e.g. `docker compose up -d db` or local service) "
                "and DATABASE_URL is set in .env."
            ) from e
        return []

    @classmethod
    def load_customer(cls, customer_id: str) -> Optional[Dict[str, Any]]:
        """Loads single customer summary from PostgreSQL."""
        try:
            with SessionLocal() as db:
                return CustomerRepository.get_customer_summary(db, customer_id)
        except Exception as e:
            logger.error(f"[DataLoader] Failed to query customer '{customer_id}' from PostgreSQL: {e}")
            raise RuntimeError(
                f"PostgreSQL connection failed while fetching customer '{customer_id}': {e}"
            ) from e

    @classmethod
    def load_transactions(cls, customer_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Loads transactions for customer or all recent transactions from PostgreSQL."""
        try:
            with SessionLocal() as db:
                if customer_id:
                    txs = TransactionRepository.get_by_customer(db, customer_id, limit=500)
                else:
                    from sqlalchemy import select, desc
                    from apps.backend.app.db.models import Transaction
                    stmt = select(Transaction).order_by(desc(Transaction.timestamp)).limit(1000)
                    txs = list(db.scalars(stmt).all())
                return TransactionRepository.to_dict_list(txs)
        except Exception as e:
            logger.error(f"[DataLoader] Failed to query transactions from PostgreSQL: {e}")
            raise RuntimeError(
                f"PostgreSQL connection failed while fetching transactions: {e}"
            ) from e

    @classmethod
    def load_scenario(cls, scenario_name: str) -> Dict[str, Any]:
        """
        Loads scenario fixture data.
        Normalizes hyphenated and underscored names (e.g. fraud_alert <-> fraud-alert).
        """
        data_dir = cls.get_data_dir() / "scenarios"
        normalized = scenario_name.strip().lower()

        # Direct file check
        cand_1 = data_dir / f"{normalized}.json"
        if cand_1.exists():
            with open(cand_1, "r", encoding="utf-8-sig") as f:
                return json.load(f)

        # Hyphenated variation check
        cand_hyphen = data_dir / f"{normalized.replace('_', '-')}.json"
        if cand_hyphen.exists():
            with open(cand_hyphen, "r", encoding="utf-8-sig") as f:
                return json.load(f)

        # Underscore variation check
        cand_under = data_dir / f"{normalized.replace('-', '_')}.json"
        if cand_under.exists():
            with open(cand_under, "r", encoding="utf-8-sig") as f:
                return json.load(f)

        # Fallback to normal scenario fixture
        norm_path = data_dir / "normal.json"
        with open(norm_path, "r", encoding="utf-8-sig") as f:
            return json.load(f)
