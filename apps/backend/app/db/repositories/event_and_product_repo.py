from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from apps.backend.app.db.models import CustomerEvent, Product, CustomerProduct, RecurringPayment

class EventRepository:
    """Encapsulates data-access operations for customer life events and milestones."""

    @staticmethod
    def get_by_customer(db: Session, customer_id: str, limit: int = 50) -> List[CustomerEvent]:
        stmt = select(CustomerEvent).where(CustomerEvent.customer_id == customer_id).order_by(desc(CustomerEvent.event_timestamp)).limit(limit)
        return list(db.scalars(stmt).all())

    @staticmethod
    def count_total(db: Session) -> int:
        from sqlalchemy import func
        return db.scalar(select(func.count(CustomerEvent.id))) or 0

class ProductRepository:
    """Encapsulates bank product catalogue and customer product holdings."""

    @staticmethod
    def get_all_products(db: Session) -> List[Product]:
        stmt = select(Product).order_by(Product.category, Product.name)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_customer_products(db: Session, customer_id: str) -> List[Product]:
        stmt = select(Product).join(CustomerProduct).where(CustomerProduct.customer_id == customer_id)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_recurring_payments(db: Session, customer_id: str) -> List[RecurringPayment]:
        stmt = select(RecurringPayment).where(RecurringPayment.customer_id == customer_id).order_by(RecurringPayment.due_day)
        return list(db.scalars(stmt).all())

    @staticmethod
    def count_products(db: Session) -> int:
        from sqlalchemy import func
        return db.scalar(select(func.count(Product.id))) or 0

    @staticmethod
    def count_customer_products(db: Session) -> int:
        from sqlalchemy import func
        return db.scalar(select(func.count(CustomerProduct.id))) or 0

    @staticmethod
    def count_recurring_payments(db: Session) -> int:
        from sqlalchemy import func
        return db.scalar(select(func.count(RecurringPayment.id))) or 0
