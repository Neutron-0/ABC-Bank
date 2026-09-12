from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from apps.backend.app.db.models import Transaction

class TransactionRepository:
    """Encapsulates data-access operations for customer transaction histories."""

    @staticmethod
    def get_by_customer(
        db: Session,
        customer_id: str,
        limit: Optional[int] = None,
        offset: int = 0,
        category: Optional[str] = None
    ) -> List[Transaction]:
        stmt = select(Transaction).where(Transaction.customer_id == customer_id)
        if category:
            stmt = stmt.where(Transaction.category == category)
        stmt = stmt.order_by(desc(Transaction.timestamp))
        if limit:
            stmt = stmt.limit(limit).offset(offset)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_by_account(
        db: Session,
        account_id: str,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[Transaction]:
        stmt = select(Transaction).where(Transaction.account_id == account_id).order_by(desc(Transaction.timestamp))
        if limit:
            stmt = stmt.limit(limit).offset(offset)
        return list(db.scalars(stmt).all())

    @staticmethod
    def count_by_customer(db: Session, customer_id: str) -> int:
        from sqlalchemy import func
        stmt = select(func.count(Transaction.id)).where(Transaction.customer_id == customer_id)
        return db.scalar(stmt) or 0

    @staticmethod
    def count_total(db: Session) -> int:
        from sqlalchemy import func
        return db.scalar(select(func.count(Transaction.id))) or 0

    @staticmethod
    def to_dict_list(transactions: List[Transaction]) -> List[Dict[str, Any]]:
        """Serializes Transaction models to JSON-serializable dictionaries compatible with existing schemas."""
        res = []
        for t in transactions:
            res.append({
                "id": t.id,
                "customer_id": t.customer_id,
                "amount": t.amount,
                "type": t.type,
                "category": t.category,
                "merchant": t.merchant,
                "timestamp": t.timestamp.isoformat() if isinstance(t.timestamp, datetime) else str(t.timestamp),
                "is_recurring": t.is_recurring,
                "frequency": t.frequency,
                "payment_channel": t.payment_channel,
                "location": t.location,
                "metadata": t.meta_info
            })
        return res
