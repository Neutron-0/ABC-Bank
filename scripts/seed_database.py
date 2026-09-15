"""
Database Seeding Script for ABC Bank.
Connects to PostgreSQL, ensures schema is created and migrated,
generates the deterministic large dataset (1,200 customers, 127k+ transactions),
and bulk inserts in optimized batches.
"""
import sys
import time
import logging
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parents[1]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from sqlalchemy import delete, select, func
from apps.backend.app.db.session import engine, SessionLocal
from apps.backend.app.db.models import (
    Base, Customer, Account, Transaction, RecurringPayment,
    Product, CustomerProduct, CustomerEvent, ConsentPreference
)
from scripts.generate_seed_data import generate_full_synthetic_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def seed_database(reset: bool = True):
    start_time = time.time()
    logger.info(f"Connecting to database at {engine.url}...")

    # Ensure schema exists
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")

    logger.info("Generating deterministic synthetic banking dataset...")
    gen_start = time.time()
    data = generate_full_synthetic_dataset(num_customers=1200, history_months=12)
    logger.info(
        f"Generated {len(data['customers']):,} customers, "
        f"{len(data['accounts']):,} accounts, "
        f"{len(data['transactions']):,} transactions in {time.time() - gen_start:.2f}s"
    )

    with SessionLocal() as db:
        if reset:
            logger.info("Cleaning existing table records for fresh deterministic seed...")
            db.execute(delete(Transaction))
            db.execute(delete(RecurringPayment))
            db.execute(delete(CustomerEvent))
            db.execute(delete(CustomerProduct))
            db.execute(delete(ConsentPreference))
            db.execute(delete(Account))
            db.execute(delete(Product))
            db.execute(delete(Customer))
            db.commit()

        # 1. Insert Products
        logger.info("Inserting products catalogue...")
        db.bulk_insert_mappings(Product, data["products"])
        db.commit()

        # 2. Insert Customers
        logger.info("Inserting customer profiles...")
        db.bulk_insert_mappings(Customer, data["customers"])
        db.commit()

        # 3. Insert Accounts
        logger.info("Inserting customer accounts...")
        db.bulk_insert_mappings(Account, data["accounts"])
        db.commit()

        # 4. Insert Consent Preferences
        logger.info("Inserting customer consent preferences...")
        db.bulk_insert_mappings(ConsentPreference, data["consent_preferences"])
        db.commit()

        # 5. Insert Recurring Payments
        logger.info("Inserting recurring mandates...")
        if data["recurring_payments"]:
            db.bulk_insert_mappings(RecurringPayment, data["recurring_payments"])
            db.commit()

        # 6. Insert Customer Events
        logger.info("Inserting customer life events...")
        if data["customer_events"]:
            db.bulk_insert_mappings(CustomerEvent, data["customer_events"])
            db.commit()

        # 7. Insert Transactions in optimized batches of 10,000
        logger.info("Inserting transactions in optimized batches...")
        batch_size = 10000
        total_tx = len(data["transactions"])
        for i in range(0, total_tx, batch_size):
            batch = data["transactions"][i : i + batch_size]
            db.bulk_insert_mappings(Transaction, batch)
            db.commit()
            logger.info(f"  Committed transactions {min(i + batch_size, total_tx):,} / {total_tx:,}")

    # Validation
    with SessionLocal() as db:
        c_count = db.scalar(select(func.count(Customer.id)))
        a_count = db.scalar(select(func.count(Account.id)))
        t_count = db.scalar(select(func.count(Transaction.id)))
        r_count = db.scalar(select(func.count(RecurringPayment.id)))
        e_count = db.scalar(select(func.count(CustomerEvent.id)))
        p_count = db.scalar(select(func.count(Product.id)))

    elapsed = time.time() - start_time
    logger.info("=" * 60)
    logger.info("DATABASE SEEDING SUCCESSFULLY COMPLETED!")
    logger.info(f"  Total Duration:      {elapsed:.2f} seconds")
    logger.info(f"  Customers:           {c_count:,}")
    logger.info(f"  Accounts:            {a_count:,}")
    logger.info(f"  Transactions:        {t_count:,}")
    logger.info(f"  Recurring Mandates:  {r_count:,}")
    logger.info(f"  Customer Events:     {e_count:,}")
    logger.info(f"  Bank Products:       {p_count:,}")
    logger.info("=" * 60)

if __name__ == "__main__":
    seed_database()
