from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, ForeignKey, Index, Text, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from apps.backend.app.db.session import Base

class Customer(Base):
    """Normalized banking customer profile."""
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    city: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    tier: Mapped[str] = mapped_column(String(16), nullable=False, default="Tier 2", index=True)
    preferred_language: Mapped[str] = mapped_column(String(8), nullable=False, default="en")
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    password: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, default="password123")
    monthly_income: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    income_type: Mapped[str] = mapped_column(String(32), nullable=False, default="salaried")
    kyc_tier: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    credit_score: Mapped[int] = mapped_column(Integer, nullable=False, default=750)
    archetype: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    accounts: Mapped[List["Account"]] = relationship("Account", back_populates="customer", cascade="all, delete-orphan")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="customer", cascade="all, delete-orphan")
    recurring_payments: Mapped[List["RecurringPayment"]] = relationship("RecurringPayment", back_populates="customer", cascade="all, delete-orphan")
    events: Mapped[List["CustomerEvent"]] = relationship("CustomerEvent", back_populates="customer", cascade="all, delete-orphan")
    products: Mapped[List["CustomerProduct"]] = relationship("CustomerProduct", back_populates="customer", cascade="all, delete-orphan")
    consent: Mapped[Optional["ConsentPreference"]] = relationship("ConsentPreference", back_populates="customer", uselist=False, cascade="all, delete-orphan")

class Account(Base):
    """Customer bank accounts (savings, current, deposit, loan)."""
    __tablename__ = "accounts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    customer_id: Mapped[str] = mapped_column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    account_type: Mapped[str] = mapped_column(String(32), nullable=False, default="savings")
    account_number: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    balance: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    available_balance: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="INR")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="active")
    opened_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    customer: Mapped["Customer"] = relationship("Customer", back_populates="accounts")
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
    recurring_payments: Mapped[List["RecurringPayment"]] = relationship("RecurringPayment", back_populates="account")

class Transaction(Base):
    """Financial transactions ledger."""
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    customer_id: Mapped[str] = mapped_column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id: Mapped[str] = mapped_column(String(64), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    type: Mapped[str] = mapped_column(String(16), nullable=False)  # debit / credit
    category: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    merchant: Mapped[str] = mapped_column(String(128), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    payment_channel: Mapped[str] = mapped_column(String(32), nullable=False, default="upi")
    is_recurring: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    frequency: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    meta_info: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSON, nullable=True)

    # Relationships
    customer: Mapped["Customer"] = relationship("Customer", back_populates="transactions")
    account: Mapped["Account"] = relationship("Account", back_populates="transactions")

    __table_args__ = (
        Index("ix_tx_cust_time", "customer_id", "timestamp"),
        Index("ix_tx_cust_cat", "customer_id", "category"),
    )

class RecurringPayment(Base):
    """Recurring financial commitments and mandates (EMI, rent, SIP, utilities)."""
    __tablename__ = "recurring_payments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    customer_id: Mapped[str] = mapped_column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id: Mapped[str] = mapped_column(String(64), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    merchant: Mapped[str] = mapped_column(String(128), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    frequency: Mapped[str] = mapped_column(String(16), nullable=False, default="monthly")
    due_day: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="active")

    customer: Mapped["Customer"] = relationship("Customer", back_populates="recurring_payments")
    account: Mapped["Account"] = relationship("Account", back_populates="recurring_payments")

class Product(Base):
    """Bank product catalogue (savings, schemes, credit, deposits, investments)."""
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    interest_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="available")

    customer_products: Mapped[List["CustomerProduct"]] = relationship("CustomerProduct", back_populates="product")

class CustomerProduct(Base):
    """Customer-held banking products."""
    __tablename__ = "customer_products"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    customer_id: Mapped[str] = mapped_column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(String(64), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="active")
    acquired_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="products")
    product: Mapped["Product"] = relationship("Product", back_populates="customer_products")

class CustomerEvent(Base):
    """Generic customer life-stage, transaction, or administrative events."""
    __tablename__ = "customer_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    customer_id: Mapped[str] = mapped_column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(256), nullable=False)
    amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    event_timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    meta_info: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSON, nullable=True)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="events")

class ConsentPreference(Base):
    """Customer personalization, marketing, and communication consents."""
    __tablename__ = "consent_preferences"

    customer_id: Mapped[str] = mapped_column(String(64), ForeignKey("customers.id", ondelete="CASCADE"), primary_key=True)
    personalization_consent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    marketing_consent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    data_sharing_consent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    communication_channel: Mapped[str] = mapped_column(String(32), nullable=False, default="app_inbox")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="consent")
