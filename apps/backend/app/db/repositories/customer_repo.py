from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select
from apps.backend.app.db.models import Customer, Account, ConsentPreference

class CustomerRepository:
    """Encapsulates data-access operations for banking customer profiles."""

    @staticmethod
    def get_by_id(db: Session, customer_id: str) -> Optional[Customer]:
        stmt = select(Customer).where(Customer.id == customer_id)
        return db.scalars(stmt).first()

    @staticmethod
    def get_customer_with_accounts(db: Session, customer_id: str) -> Optional[Customer]:
        """Fetches customer with accounts eagerly populated."""
        return CustomerRepository.get_by_id(db, customer_id)

    @staticmethod
    def get_all(db: Session, limit: int = 100, offset: int = 0) -> List[Customer]:
        stmt = select(Customer).order_by(Customer.id).limit(limit).offset(offset)
        return list(db.scalars(stmt).all())

    @staticmethod
    def count(db: Session) -> int:
        from sqlalchemy import func
        return db.scalar(select(func.count(Customer.id))) or 0

    @staticmethod
    def get_all_ids(db: Session) -> List[str]:
        stmt = select(Customer.id)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_customer_accounts(db: Session, customer_id: str) -> List[Account]:
        stmt = select(Account).where(Account.customer_id == customer_id).order_by(Account.opened_at)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_by_identifier(db: Session, identifier: str) -> Optional[Customer]:
        """Looks up customer by exact id, email, or phone."""
        clean = identifier.strip()
        stmt = select(Customer).where(
            (Customer.id == clean) |
            (Customer.email == clean) |
            (Customer.phone == clean)
        )
        return db.scalars(stmt).first()

    @staticmethod
    def create_customer(
        db: Session,
        customer_id: str,
        name: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        password: str = "password123",
        city: str = "Mumbai",
        state: str = "Maharashtra",
        preferred_language: str = "en",
        monthly_income: float = 50000.0,
        kyc_tier: int = 2,
        credit_score: int = 750,
        initial_balance: float = 25000.0
    ) -> Customer:
        """Creates a new customer with a linked primary savings account."""
        import uuid
        customer = Customer(
            id=customer_id,
            name=name,
            phone=phone,
            email=email,
            password=password,
            city=city,
            state=state,
            preferred_language=preferred_language,
            monthly_income=monthly_income,
            kyc_tier=kyc_tier,
            credit_score=credit_score
        )
        db.add(customer)

        account = Account(
            id=f"acc_{customer_id}_savings",
            customer_id=customer_id,
            account_type="savings",
            account_number=f"SB-{abs(hash(customer_id)) % 90000000 + 10000000}",
            balance=initial_balance,
            available_balance=initial_balance,
            currency="INR",
            status="active"
        )
        db.add(account)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def get_customer_summary(db: Session, customer_id: str) -> Optional[Dict[str, Any]]:
        cust = CustomerRepository.get_by_id(db, customer_id)
        if not cust:
            return None
        accounts = CustomerRepository.get_customer_accounts(db, customer_id)
        
        savings_acc = next((a for a in accounts if a.account_type == "savings"), None)
        avail_bal = savings_acc.available_balance if savings_acc else (accounts[0].available_balance if accounts else 0.0)
        sav_reserve = savings_acc.balance if savings_acc else (accounts[0].balance if accounts else 0.0)

        return {
            "id": cust.id,
            "name": cust.name,
            "phone": cust.phone,
            "email": cust.email,
            "password": cust.password or "password123",
            "monthly_income": cust.monthly_income,
            "kyc_tier": cust.kyc_tier,
            "credit_score": cust.credit_score,
            "language": cust.preferred_language,
            "accounts": {
                "savings": savings_acc.account_number if savings_acc else "SB-DEFAULT",
                "available_balance": avail_bal,
                "savings_reserve": sav_reserve
            }
        }
