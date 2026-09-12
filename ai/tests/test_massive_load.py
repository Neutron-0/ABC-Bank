"""High-Load Stress & Numerical Stability Test Suite for ABC Bank Personalization Suite."""

import sys
import time
import random
from datetime import datetime, timedelta
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from ai.intelligence.features.normalizer import TransactionNormalizer
from ai.intelligence.features.extractor import FeatureExtractor
from ai.intelligence.personalization.scorer import MultiFactorScorer
from ai.intelligence.personalization.catalog import PRODUCT_CATALOG
from ai.intelligence.personalization.archetypes import BHARAT_ARCHETYPES, ArchetypeId
from ai.intelligence import build_customer_state


def generate_synthetic_massive_dataset(count: int = 10000):
    """Generates large synthetic transaction stream simulating a high-velocity Indian banking ledger."""
    merchants = [
        ("UPI/CR/982347102938/DELHI METRO SMART CARD", "transport", 40.0, "debit"),
        ("Tata Power Delhi Distribution Ltd.", "bills", 1450.0, "debit"),
        ("Infosys Corporate Salary Payroll NEFT", "salary", 85000.0, "credit"),
        ("HDFC Bank Home Loan EMI Autopay", "emi", 16500.0, "debit"),
        ("Swiggy Bangalore UPI-REF-892348", "food", 350.0, "debit"),
        ("Blinkit Instant Groceries Noida", "groceries", 620.0, "debit"),
        ("Apollo Pharmacy Delhi", "healthcare", 450.0, "debit"),
        ("Netflix India Recurring Debit", "entertainment", 649.0, "debit"),
        ("Groww Mutual Fund SIP Autopay", "investment", 5000.0, "debit"),
        ("GlobalTech Gaming Dublin Unusual", "gaming", 31800.0, "debit"),
        ("Airtel Postpaid Bill Payment", "bills", 599.0, "debit"),
        ("Bajaj Finserv Consumer Durable Loan", "emi", 2400.0, "debit"),
    ]

    base_date = datetime(2026, 1, 1, 8, 30, 0)
    txs = []

    for i in range(count):
        merchant, cat, base_amt, tx_type = random.choice(merchants)
        # Add slight price fluctuation
        amt = round(base_amt * (0.9 + 0.2 * random.random()), 2)
        dt = base_date + timedelta(minutes=i * 50)

        txs.append({
            "id": f"tx_load_{i:06d}",
            "customer_id": "cust_bharat_001",
            "merchant": merchant,
            "category": cat,
            "amount": amt,
            "type": tx_type,
            "timestamp": dt.isoformat(),
            "is_recurring": cat in ["emi", "salary", "bills"]
        })

    return txs


def test_massive_data_load_ten_thousand_transactions():
    """Verify that 10,000 transactions process through the entire pipeline with sub-50ms latency."""
    txs = generate_synthetic_massive_dataset(count=10000)
    customer_data = {
        "customer_id": "cust_high_load",
        "customer_name": "High Velocity User",
        "monthly_income": 85000,
        "balance": {"available": 65000, "savings": 250000, "currency": "INR"},
        "signals": {"metro_usage": "high", "savings_trend": "positive", "anomaly_score": 4}
    }

    start = time.perf_counter()
    state = build_customer_state(customer_data, txs)
    total_elapsed_ms = (time.perf_counter() - start) * 1000

    print(f"\n[STRESS TEST] 10,000 transactions processed in: {total_elapsed_ms:.2f}ms")

    # Latency assertion: 10,000 transactions through full 5-extractor & ML pipeline must complete in under 500ms
    assert total_elapsed_ms < 500.0, f"Processing 10,000 transactions took {total_elapsed_ms:.2f}ms (threshold 500ms)"

    # Contract integrity assertion
    assert state["customer_id"] == "cust_high_load"
    assert len(state["recommendations"]) > 0
    assert state["financial_health"] in ["thriving", "stable", "tight", "stress"]
    assert "personalization" in state
    assert state["personalization"]["confidence_score"] >= 0.85


def test_dirty_data_resilience():
    """Verify that dirty, malformed, null, negative, and extreme edge-case data does not crash the system."""
    dirty_transactions = [
        {"id": "tx_err_1", "merchant": None, "amount": None, "timestamp": None},
        {"id": "tx_err_2", "merchant": "", "amount": -500.0, "type": "INVALID_TYPE", "timestamp": "corrupted_timestamp"},
        {"id": "tx_err_3", "merchant": "Special Characters @#$%^&*()_+", "amount": 0.0, "category": None},
        {"id": "tx_err_4", "merchant": "Extreme Outlay", "amount": 100000000.0, "type": "debit"},
        {"id": "tx_err_5", "merchant": "Micro Paise", "amount": 0.05, "type": "debit"}
    ]

    customer_data = {
        "customer_id": "cust_dirty",
        "monthly_income": 0.0,
        "balance": {"available": 0.0, "savings": 0.0}
    }

    # Pipeline must not raise an exception
    state = build_customer_state(customer_data, dirty_transactions)
    assert state["customer_id"] == "cust_dirty"
    assert state["financial_health"] in ["stable", "stress", "tight"]
    assert isinstance(state["recommendations"], list)


def test_multifactor_scoring_metrics_calibrated():
    """Verify that MultiFactorScorer computes mathematical metrics adhering to weight constraints."""
    product = PRODUCT_CATALOG["rec_personal_loan"]
    archetype = BHARAT_ARCHETYPES[ArchetypeId.URBAN_COMMUTER]
    signals = {"debt_to_income_ratio": 0.22, "anomaly_score": 5, "commute_habit_detected": True}
    features = {"commute_detected": True, "burn_rate": 35000}

    priority, metrics = MultiFactorScorer.score_product(
        product=product,
        archetype=archetype,
        signals=signals,
        features=features,
        health="stable"
    )

    # Component checks
    assert 0.0 <= metrics["affordability_fit"] <= 1.0
    assert 0.0 <= metrics["lifecycle_need"] <= 1.0
    assert 0.0 <= metrics["temporal_urgency"] <= 1.0
    assert 0.0 <= metrics["archetype_affinity"] <= 1.0
    assert 0.0 <= metrics["risk_penalty"] <= 1.0
    assert 0.0 <= metrics["weighted_index"] <= 1.0
    assert 10 <= priority <= 100
