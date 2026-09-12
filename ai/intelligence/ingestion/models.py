"""Pydantic Models for Multi-Source Dirty Data Ingestion and Harmonization.

Covers raw schemas from Indian Banking Ecosystem:
- Core Banking Ledger (CBS)
- UPI & NPCI Switch Logs
- SMS & Notification Scrapes
- Credit Bureau (CIBIL / Experian) Tradelines
- BBPS & Utility Aggregator Feeds
- NCMC Transit & Smart Card Readers
- Demographic & KYC Profiles
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CBSLedgerRecord(BaseModel):
    """Raw ledger record directly from Core Banking System (e.g. Finacle, BaNCS)."""
    txn_id: str
    account_number: Optional[str] = None
    amount: Any = 0.0  # Can be float, string, or None in dirty feeds
    type: Optional[str] = "debit"
    balance_after: Optional[Any] = None
    narration: Optional[str] = ""
    timestamp: Optional[Any] = None
    category: Optional[str] = None


class UPISwitchLog(BaseModel):
    """NPCI / UPI switch wire log with unstructured reference strings."""
    rrn: str = Field(description="Retrieval Reference Number (12 digits)")
    payer_vpa: Optional[str] = None
    payee_vpa: Optional[str] = None
    raw_upi_string: Optional[str] = None  # e.g., "UPI/CR/982347102938/DELHI METRO SMART CARD/METRO@DMRC/NA"
    amount: Any = 0.0
    timestamp: Optional[Any] = None
    status: str = "SUCCESS"


class SMSNotificationRecord(BaseModel):
    """Parsed Android SMS / notification feed from customer device."""
    sender_header: Optional[str] = None  # e.g., "VM-HDFCBK", "AXISBK", "SBIUPI"
    body: str
    received_at: Optional[Any] = None


class BureauCreditProfile(BaseModel):
    """Credit Bureau pull (CIBIL, Experian, CRIF High Mark)."""
    bureau_name: str = "CIBIL"
    score: Optional[int] = None  # 300 - 900
    active_tradelines_count: int = 0
    total_outstanding_debt: float = 0.0
    monthly_emi_obligations: float = 0.0
    overdue_amount: float = 0.0
    dpd_status: str = "000"  # Days past due: 000, 030, 060, etc.
    credit_card_utilization_pct: float = 0.0
    recent_inquiries_30d: int = 0


class BBPSUtilityRecord(BaseModel):
    """Bharat Bill Payment System (BBPS) aggregator notification."""
    biller_id: str
    biller_name: Optional[str] = None
    biller_category: str = "utilities"  # mobile_prepaid, electricity, fastag, lpg, water
    due_date: Optional[Any] = None
    validity_expiry_date: Optional[Any] = None
    amount_due: float = 0.0
    wallet_balance: Optional[float] = None


class NCMCTransitRecord(BaseModel):
    """National Common Mobility Card (NCMC) reader tap-in/out log."""
    card_id: str
    current_stored_balance: float = 0.0
    last_tap_station: Optional[str] = None
    last_tap_time: Optional[Any] = None
    daily_commute_detected: bool = False


class CustomerDemographics(BaseModel):
    """Socioeconomic, regional, and KYC context."""
    customer_id: str
    name: str
    age: Optional[int] = None
    city_tier: str = "Tier 1"  # Tier 1, Tier 2, Tier 3, Tier 4 / Rural
    declared_occupation: Optional[str] = None
    declared_monthly_income: Optional[float] = None
    kyc_tier: int = 2
    preferred_language: str = "en"


class UnifiedCustomerProfile(BaseModel):
    """Canonical, sanitized, deduplicated profile ready for feature extraction and personalization."""
    customer_id: str
    customer_name: str
    monthly_income: float = 0.0
    balance: Dict[str, Any] = Field(default_factory=lambda: {"available": 0.0, "savings": 0.0, "currency": "INR"})
    cleaned_transactions: List[Dict[str, Any]] = Field(default_factory=list)
    bureau_summary: Dict[str, Any] = Field(default_factory=dict)
    utility_alerts: List[Dict[str, Any]] = Field(default_factory=list)
    demographics: Dict[str, Any] = Field(default_factory=dict)
    sanitization_audit: Dict[str, Any] = Field(
        default_factory=lambda: {
            "total_raw_records": 0,
            "cleaned_records": 0,
            "duplicates_dropped": 0,
            "corrupted_dropped": 0,
            "balance_conflicts_resolved": 0
        }
    )
