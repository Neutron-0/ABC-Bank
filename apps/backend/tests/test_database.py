import sys
import os
from pathlib import Path
import pytest
from sqlalchemy import select, func

# Ensure root directory is on sys.path
root_dir = Path(__file__).resolve().parents[3]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from apps.backend.app.db.session import SessionLocal, engine, DATABASE_URL
from apps.backend.app.db.models import (
    Customer, Account, Transaction, RecurringPayment,
    CustomerEvent, Product, ConsentPreference
)
from apps.backend.app.db.loader import DataLoader
from apps.backend.app.db.repositories.customer_repo import CustomerRepository
from apps.backend.app.db.repositories.transaction_repo import TransactionRepository

@pytest.mark.skipif(not DATABASE_URL, reason="PostgreSQL DATABASE_URL not set")
def test_database_counts_and_integrity():
    """Verify that PostgreSQL contains the large synthetic dataset with no orphan records."""
    with SessionLocal() as db:
        customer_count = db.scalar(select(func.count(Customer.id)))
        account_count = db.scalar(select(func.count(Account.id)))
        tx_count = db.scalar(select(func.count(Transaction.id)))
        product_count = db.scalar(select(func.count(Product.id)))

        assert customer_count >= 1200, f"Expected >= 1,200 customers, got {customer_count}"
        assert account_count >= 1200, f"Expected >= 1,200 accounts, got {account_count}"
        assert tx_count >= 60000, f"Expected >= 60,000 transactions, got {tx_count}"
        assert product_count >= 5, f"Expected >= 5 bank products, got {product_count}"

        # Verify demo customers exist
        bharat1 = db.scalar(select(Customer).where(Customer.id == "cust_bharat_001"))
        assert bharat1 is not None
        assert bharat1.name in ["Rahul Sharma", "Bharat Patel"]

        bharat2 = db.scalar(select(Customer).where(Customer.id == "cust_bharat_002"))
        assert bharat2 is not None

        # Verify referential integrity: no transactions with non-existent accounts
        orphans = db.scalar(
            select(func.count(Transaction.id))
            .outerjoin(Account, Transaction.account_id == Account.id)
            .where(Account.id.is_(None))
        )
        assert orphans == 0, f"Found {orphans} orphaned transactions"

@pytest.mark.skipif(not DATABASE_URL, reason="PostgreSQL DATABASE_URL not set")
def test_customer_repository_queries():
    """Verify repository methods retrieve customer profile and transactions correctly."""
    with SessionLocal() as db:
        cust = CustomerRepository.get_customer_with_accounts(db, "cust_bharat_001")
        assert cust is not None
        assert len(cust.accounts) > 0

        acc_id = cust.accounts[0].id
        txs = TransactionRepository.get_by_account(db, acc_id, limit=20)
        assert len(txs) > 0
        assert all(t.account_id == acc_id for t in txs)
