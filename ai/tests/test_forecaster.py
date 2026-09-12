"""Unit tests for Predictive 30-Day Cash-Flow Forecaster and 'Safe-to-Spend' Dial."""

import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from ai.intelligence.features.forecaster import PredictiveCashFlowEngine, CashFlowForecast


def test_predictive_cash_flow_normal_surplus():
    """Verify forward 15-day/30-day projection and safe-to-spend calculation in healthy cash-flow."""
    transactions = [
        {"amount": 85000.0, "category": "salary", "type": "credit", "merchant": "Corp Salary", "timestamp": "2026-01-01T09:00:00"},
        {"amount": 16500.0, "category": "emi", "type": "debit", "merchant": "HDFC Home Loan", "timestamp": "2026-01-16T10:00:00"},
        {"amount": 1450.0, "category": "bills", "type": "debit", "merchant": "Tata Power", "timestamp": "2026-01-20T11:00:00"},
        {"amount": 649.0, "category": "entertainment", "type": "debit", "merchant": "Netflix India", "timestamp": "2026-01-22T12:00:00"}
    ]

    ref_date = datetime(2026, 1, 10, 10, 0, tzinfo=timezone.utc)
    forecast = PredictiveCashFlowEngine.forecast(
        available_balance=45000.0,
        monthly_income=85000.0,
        transactions=transactions,
        reference_date=ref_date
    )

    assert isinstance(forecast, CashFlowForecast)
    assert forecast.current_available_balance == 45000.0
    # 16th is 6 days ahead (<=15d) -> 16500
    # 20th is 10 days ahead (<=15d) -> 1450
    # 22nd is 12 days ahead (<=15d) -> 649
    # Total 15d = 16500 + 1450 + 649 = 18599
    assert forecast.upcoming_15d_obligations == 18599.0
    # Emergency buffer is 5% of 85,000 = 4,250
    # Safe to spend = 45,000 - 18,599 - 4,250 = 22,151.0
    assert forecast.safe_to_spend_today == 22151.0
    assert forecast.deficit_predicted is False
    assert len(forecast.upcoming_obligations) == 3
    assert any("Healthy liquidity" in msg or "safe spending limit" in msg for msg in forecast.actionable_interventions)


def test_predictive_cash_flow_deficit_warning_and_subscription_pause():
    """Verify that when account has low balance and big EMI due, a deficit warning and subscription pause is emitted."""
    transactions = [
        {"amount": 16500.0, "category": "emi", "type": "debit", "merchant": "HDFC Home Loan", "timestamp": "2026-01-16T10:00:00"},
        {"amount": 649.0, "category": "entertainment", "type": "debit", "merchant": "Netflix India", "timestamp": "2026-01-14T12:00:00"},
        {"amount": 299.0, "category": "entertainment", "type": "debit", "merchant": "Spotify India", "timestamp": "2026-01-15T12:00:00"}
    ]

    ref_date = datetime(2026, 1, 12, 10, 0, tzinfo=timezone.utc)
    forecast = PredictiveCashFlowEngine.forecast(
        available_balance=5000.0,  # Only 5,000 in account!
        monthly_income=75000.0,
        transactions=transactions,
        reference_date=ref_date
    )

    assert forecast.deficit_predicted is True
    assert forecast.deficit_date is not None
    assert forecast.deficit_amount > 0.0
    assert forecast.safe_to_spend_today == 0.0

    # Verify actionable interventions suggest pausing non-essential subscriptions
    intervention_text = " ".join(forecast.actionable_interventions)
    assert "Projected shortfall" in intervention_text
    assert "Subscription Optimization" in intervention_text
