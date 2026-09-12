"""Unit tests for Granular Category Spend Analyzer and 50/30/20 Budget Telemetry."""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from ai.intelligence.features.spend_analyzer import SpendAnalyzer, GranularSpendProfile


def test_granular_category_spend_breakdown_comprehensive():
    """Verify that transactions are classified across food, stocks, groceries, entertainment, bills, and emi."""
    transactions = [
        {"merchant": "Swiggy Bangalore", "amount": 450.0, "type": "debit"},
        {"merchant": "Zomato Food Delivery", "amount": 350.0, "type": "debit"},
        {"merchant": "Blinkit Instant Groceries Noida", "amount": 820.0, "type": "debit"},
        {"merchant": "DMart Supermarket", "amount": 3400.0, "type": "debit"},
        {"merchant": "Groww Mutual Fund SIP Autopay", "amount": 5000.0, "type": "debit"},
        {"merchant": "Zerodha Broking Equities", "amount": 10000.0, "type": "debit"},
        {"merchant": "Netflix India Recurring Debit", "amount": 649.0, "type": "debit"},
        {"merchant": "Spotify India Music", "amount": 299.0, "type": "debit"},
        {"merchant": "Delhi Metro Smart Card Recharge", "amount": 40.0, "type": "debit"},
        {"merchant": "Tata Power Electricity Delhi", "amount": 1450.0, "type": "debit"},
        {"merchant": "Apollo Pharmacy Delhi", "amount": 680.0, "type": "debit"},
        {"merchant": "HDFC Bank Home Loan EMI Autopay", "amount": 16500.0, "type": "debit"}
    ]

    profile = SpendAnalyzer.analyze(transactions, monthly_income=85000.0)

    assert isinstance(profile, GranularSpendProfile)
    assert profile.total_spend == 39638.0
    assert profile.monthly_income == 85000.0

    cats = profile.categories
    # Check individual categories
    assert "food" in cats
    assert cats["food"].total_amount == 800.0
    assert cats["food"].transaction_count == 2
    assert cats["food"].average_ticket_size == 400.0

    assert "groceries" in cats
    assert cats["groceries"].total_amount == 4220.0

    assert "stocks_investments" in cats
    assert cats["stocks_investments"].total_amount == 15000.0
    assert cats["stocks_investments"].transaction_count == 2

    assert "entertainment" in cats
    assert cats["entertainment"].total_amount == 948.0

    assert "transport" in cats
    assert cats["transport"].total_amount == 40.0

    assert "bills_utilities" in cats
    assert cats["bills_utilities"].total_amount == 1450.0

    assert "healthcare" in cats
    assert cats["healthcare"].total_amount == 680.0

    assert "emi_debt" in cats
    assert cats["emi_debt"].total_amount == 16500.0

    # 50/30/20 Rule checks
    alloc = profile.allocation_50_30_20
    assert alloc.needs_amount == (4220.0 + 1450.0 + 16500.0 + 680.0 + 40.0)
    assert alloc.savings_investments_amount == 15000.0
    assert alloc.wants_amount == (800.0 + 948.0)
    assert alloc.savings_investments_percentage > 15.0


def test_discretionary_leakage_warning_detection():
    """Verify that excessive dining or entertainment spend triggers proactive leakage alerts."""
    transactions = [
        {"merchant": "Swiggy Fine Dining", "amount": 8500.0, "type": "debit"},
        {"merchant": "Zomato Gourmet", "amount": 6500.0, "type": "debit"},
        {"merchant": "Steam Gaming Dublin", "amount": 4200.0, "type": "debit"}
    ]

    # Monthly income 50,000 -> Food = 15,000 (30% of income, > 15% threshold)
    profile = SpendAnalyzer.analyze(transactions, monthly_income=50000.0)

    assert "food" in profile.categories
    assert profile.categories["food"].status == "leakage_warning"
    assert len(profile.discretionary_leakage_alerts) > 0
    assert any("Food delivery spends" in a for a in profile.discretionary_leakage_alerts)
