import os
import time
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
    _db_offline_until: float = 0.0

    @classmethod
    def _is_db_offline(cls) -> bool:
        return time.time() < cls._db_offline_until

    @classmethod
    def _mark_db_offline(cls, duration: float = 15.0) -> None:
        cls._db_offline_until = time.time() + duration

    @classmethod
    def get_data_dir(cls) -> Path:
        return Path(__file__).resolve().parents[4] / "data"

    @classmethod
    def load_customers(cls) -> List[Dict[str, Any]]:
        """Loads all customer summaries from PostgreSQL with fallback to seed data."""
        if not cls._is_db_offline():
            try:
                with SessionLocal() as db:
                    from sqlalchemy import select
                    from apps.backend.app.db.models import Account
                    customers = CustomerRepository.get_all(db, limit=2000)
                    accounts = list(db.scalars(select(Account)).all())
                    acc_by_cust: Dict[str, List[Account]] = {}
                    for a in accounts:
                        acc_by_cust.setdefault(a.customer_id, []).append(a)

                    result = []
                    for cust in customers:
                        accs = acc_by_cust.get(cust.id, [])
                        savings_acc = next((a for a in accs if a.account_type == "savings"), None)
                        avail_bal = savings_acc.available_balance if savings_acc else (accs[0].available_balance if accs else 0.0)
                        sav_reserve = savings_acc.balance if savings_acc else (accs[0].balance if accs else 0.0)
                        result.append({
                            "id": cust.id,
                            "name": cust.name,
                            "phone": cust.phone,
                            "email": cust.email,
                            "monthly_income": cust.monthly_income,
                            "kyc_tier": cust.kyc_tier,
                            "credit_score": cust.credit_score,
                            "language": cust.preferred_language,
                            "accounts": {
                                "savings": savings_acc.account_number if savings_acc else "SB-DEFAULT",
                                "available_balance": avail_bal,
                                "savings_reserve": sav_reserve
                            }
                        })
                    if result:
                        return result
            except Exception as e:
                cls._mark_db_offline()
                logger.warning(
                    f"[DataLoader] PostgreSQL unavailable ({e}). Falling back to seed JSON fixtures."
                )

        # Resilient fallback to local seed data
        seed_path = cls.get_data_dir() / "seed" / "customers.json"
        if seed_path.exists():
            with open(seed_path, "r", encoding="utf-8-sig") as f:
                return json.load(f)
        return []

    @classmethod
    def load_customer(cls, customer_id: str) -> Optional[Dict[str, Any]]:
        """Loads single customer summary from PostgreSQL with fallback to seed data."""
        if not cls._is_db_offline():
            try:
                with SessionLocal() as db:
                    summary = CustomerRepository.get_customer_summary(db, customer_id)
                    if summary:
                        return summary
            except Exception as e:
                cls._mark_db_offline()
                logger.warning(
                    f"[DataLoader] PostgreSQL unavailable ({e}) for customer '{customer_id}'. Falling back to seed JSON fixtures."
                )

        customers = cls.load_customers()
        for c in customers:
            if c.get("id") == customer_id:
                return c
        return None

    @classmethod
    def load_transactions(cls, customer_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Loads transactions for customer or all recent transactions from PostgreSQL with fallback to seed data."""
        if not cls._is_db_offline():
            try:
                with SessionLocal() as db:
                    if customer_id:
                        txs = TransactionRepository.get_by_customer(db, customer_id, limit=500)
                    else:
                        from sqlalchemy import select, desc
                        from apps.backend.app.db.models import Transaction
                        stmt = select(Transaction).order_by(desc(Transaction.timestamp)).limit(1000)
                        txs = list(db.scalars(stmt).all())
                    result = TransactionRepository.to_dict_list(txs)
                    if result:
                        return result
            except Exception as e:
                cls._mark_db_offline()
                logger.warning(
                    f"[DataLoader] PostgreSQL unavailable ({e}). Falling back to seed JSON fixtures."
                )

        # Resilient fallback to local seed data
        seed_path = cls.get_data_dir() / "seed" / "transactions.json"
        if seed_path.exists():
            with open(seed_path, "r", encoding="utf-8-sig") as f:
                tx_data = json.load(f)
                if customer_id:
                    return [t for t in tx_data if t.get("customer_id") == customer_id or t.get("user_id") == customer_id]
                return tx_data
        return []

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
