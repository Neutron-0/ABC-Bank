"""Comprehensive Unit Tests for Chronological Cash-Flow, Gig Income Recognition, and Ethical Voice Guardrails."""

import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from ai.intelligence.features.forecaster import PredictiveCashFlowEngine
from ai.intelligence.features.extractor import FeatureExtractor
from ai.intelligence.signals.detector import SignalDetector
from ai.voice.intents.classifier import VoiceIntentClassifier
from ai.voice.model.minicpm5_runner import MiniCPM5Runner


def test_chronological_cashflow_salary_before_emi_no_false_deficit():
    """Verify that when monthly salary arrives before scheduled EMI, NO false deficit is triggered."""
    transactions = [
        {"amount": 75000.0, "category": "salary", "type": "credit", "merchant": "Corporate Salary", "timestamp": "2026-01-01T09:00:00"},
        {"amount": 16500.0, "category": "emi", "type": "debit", "merchant": "HDFC Home Loan", "timestamp": "2026-01-05T10:00:00"}
    ]

    # Reference date is Jan 28: available balance is low (₹5,000) at end-of-month
    # Next salary arrives in 4 days (Feb 1, ₹75,000)
    # Next EMI is due in 8 days (Feb 5, ₹16,500)
    ref_date = datetime(2026, 1, 28, 10, 0, tzinfo=timezone.utc)
    forecast = PredictiveCashFlowEngine.forecast(
        available_balance=5000.0,
        monthly_income=75000.0,
        transactions=transactions,
        reference_date=ref_date
    )

    # In chronological simulation, salary (+75k) arrives on Feb 1 BEFORE the EMI (-16.5k) on Feb 5
    # Running balance never goes negative: 5,000 -> 80,000 -> 63,500
    assert forecast.deficit_predicted is False
    assert forecast.deficit_amount == 0.0
    assert forecast.upcoming_15d_obligations == 16500.0
    assert forecast.projected_next_income_date == "2026-02-01"


def test_chronological_cashflow_genuine_pre_salary_shortfall():
    """Verify that when an obligation hits before payday and exceeds balance, a deficit is correctly flagged."""
    transactions = [
        {"amount": 75000.0, "category": "salary", "type": "credit", "merchant": "Corporate Salary", "timestamp": "2026-01-25T09:00:00"},
        {"amount": 18000.0, "category": "bills", "type": "debit", "merchant": "Hospital Surgery Bill", "timestamp": "2026-01-14T10:00:00"}
    ]

    # Reference date is Jan 10: available balance is ₹5,000
    # Bill of ₹18,000 is due on Jan 14 (in 4 days)
    # Salary arrives on Jan 25 (in 15 days, AFTER the bill!)
    ref_date = datetime(2026, 1, 10, 10, 0, tzinfo=timezone.utc)
    forecast = PredictiveCashFlowEngine.forecast(
        available_balance=5000.0,
        monthly_income=75000.0,
        transactions=transactions,
        reference_date=ref_date
    )

    assert forecast.deficit_predicted is True
    assert forecast.deficit_date == "2026-01-14"
    assert forecast.deficit_amount == 13000.0  # 18,000 - 5,000


def test_non_traditional_income_recognition_gig_worker():
    """Verify that weekly platform credits for gig delivery partners are correctly aggregated into monthly income."""
    # 4 weekly payouts of ₹8,000 each = ₹32,000 monthly income
    transactions = [
        {"amount": 8000.0, "category": "other", "type": "credit", "merchant": "Swiggy Rider Weekly Payout", "timestamp": "2026-09-07T18:00:00+05:30"},
        {"amount": 8000.0, "category": "other", "type": "credit", "merchant": "Swiggy Rider Weekly Payout", "timestamp": "2026-09-14T18:00:00+05:30"},
        {"amount": 8000.0, "category": "other", "type": "credit", "merchant": "Zomato Partner Payout", "timestamp": "2026-09-21T18:00:00+05:30"},
        {"amount": 8000.0, "category": "other", "type": "credit", "merchant": "Zomato Partner Payout", "timestamp": "2026-09-28T18:00:00+05:30"},
        {"amount": 6400.0, "category": "emi", "type": "debit", "merchant": "Bajaj Two Wheeler Loan", "is_recurring": True, "timestamp": "2026-09-10T10:00:00+05:30"},
        {"amount": 300.0, "category": "transport", "type": "debit", "merchant": "IOCL Petrol Pump", "timestamp": "2026-09-12T09:00:00+05:30"}
    ]

    features = FeatureExtractor.extract(transactions)
    # Total monthly income should be 32,000 (not 8,000 or defaulting to 75,000)
    assert features["spending_metrics"]["estimated_monthly_income"] == 32000.0
    # DTI should be 6,400 / 32,000 = 0.20
    assert features["dti_ratio"] == pytest.approx(0.20, 0.01)


def test_signal_detector_accounts_schema_resilience():
    """Verify that SignalDetector resolves available and savings balances from 'accounts' dictionary."""
    customer_data = {
        "customer_id": "cust_pooja_001",
        "customer_name": "Pooja Patel",
        "accounts": {
            "available_balance": 15000.0,
            "savings_reserve": 60000.0
        },
        "signals": {
            "savings_trend": "stable"
        }
    }
    features = {
        "burn_rate": 30000.0,
        "dti_ratio": 0.10,
        "spending_volatility": "low",
        "spending_metrics": {"estimated_monthly_income": 80000.0, "emi_spend": 8000.0}
    }

    signals = SignalDetector.detect(customer_data, features)
    # Liquid buffer must be 15,000 / 30,000 = 0.5 months (NOT 42,680 / 30,000 = 1.42)
    assert signals["liquid_buffer_months"] == 0.5
    assert signals["runway_days"] == 15
    # Emergency fund must be 60,000 / 30,000 = 2.0 months (NOT 185,000 / 30,000 = 6.2)
    assert signals["emergency_fund_months"] == 2.0


def test_multilingual_ethical_voice_loan_guardrail_under_stress():
    """Verify that asking for a loan while financially stressed triggers RBI fair-lending counseling across all languages."""
    # 1. English
    en_res = VoiceIntentClassifier.classify("I need an instant personal loan", lang="en", stress_level="stress")
    assert en_res["intent"] == "CHECK_EMI"
    assert en_res["entities"].get("inquiry_type") == "loan_application"
    assert "Under RBI fair lending guidelines" in en_res["response_text"]
    assert "REVIEW_COMMITMENTS" in en_res["suggested_actions"]
    assert "SPEAK_TO_COUNSELOR" in en_res["suggested_actions"]

    # 2. Hindi
    hi_res = VoiceIntentClassifier.classify("मुझे तुरंत नया लोन चाहिए", lang="hi", stress_level="stress")
    assert hi_res["intent"] == "CHECK_EMI"
    assert "आरबीआई निष्पक्ष ऋण दिशानिर्देशों के अनुसार" in hi_res["response_text"]
    assert "REVIEW_COMMITMENTS" in hi_res["suggested_actions"]

    # 3. Gujarati
    gu_res = VoiceIntentClassifier.classify("મને નવી લોન જોઈએ છે", lang="gu", stress_level="stress")
    assert gu_res["intent"] == "CHECK_EMI"
    assert "આરબીઆઈ ફેર લેન્ડિંગ નિયમો મુજબ" in gu_res["response_text"]
    assert "REVIEW_COMMITMENTS" in gu_res["suggested_actions"]

    # 4. Normal financial health: standard loan eligibility options offered
    norm_res = VoiceIntentClassifier.classify("I need a personal loan", lang="en", stress_level="normal")
    assert norm_res["intent"] == "CHECK_EMI"
    assert "EXPLORE_ELIGIBILITY" in norm_res["suggested_actions"]
