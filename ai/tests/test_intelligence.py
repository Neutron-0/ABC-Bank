"""Automated verification suite for Ubaid Backend Customer Intelligence Engine."""

import sys
import json
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from jsonschema import validate

from ai.intelligence.features.normalizer import TransactionNormalizer
from ai.intelligence.features.extractor import FeatureExtractor
from ai.intelligence.signals.detector import SignalDetector
from ai.intelligence.recommendations.ranker import RecommendationRanker
from ai.intelligence.customer_state.builder import CustomerStateBuilder
from ai.intelligence import build_customer_state
SCHEMA_PATH = ROOT_DIR / "contracts" / "customer-state.schema.json"
FIXTURES_DIR = ROOT_DIR / "ai" / "tests" / "fixtures"


@pytest.fixture(scope="module")
def customer_state_schema():
    with open(SCHEMA_PATH, "r", encoding="utf-8-sig") as f:
        return json.load(f)


def test_transaction_normalizer():
    """Verify narrative cleaning and Indian banking merchant mapping."""
    raw_tx = {
        "id": "tx_test_01",
        "merchant": "UPI-REF-123456789012/DELHI METRO SMART CARD/UTIB0000123",
        "amount": "40.0",
        "category": "transport",
        "timestamp": "2026-09-11T08:38:00+05:30"
    }
    normalized = TransactionNormalizer.normalize(raw_tx)
    assert normalized["merchant"] == "Delhi Metro Smart Card"
    assert normalized["category"] == "transport"
    assert normalized["amount"] == 40.0
    assert normalized["type"] == "debit"
    assert normalized["hour"] == 8
    assert not normalized["is_weekend"]


def test_feature_extractor():
    """Verify statistical, spending, temporal, and trend feature calculation."""
    sample_txs = [
        {"merchant": "Delhi Metro Smart Card", "amount": 40.0, "type": "debit", "category": "transport", "timestamp": "2026-09-12T08:40:00+05:30"},
        {"merchant": "DMRC Metro Recharge", "amount": 40.0, "type": "debit", "category": "transport", "timestamp": "2026-09-11T08:42:00+05:30"},
        {"merchant": "Infosys Corporate Salary", "amount": 75000.0, "type": "credit", "category": "salary", "timestamp": "2026-09-01T09:00:00+05:30"},
        {"merchant": "HDFC Home Loan EMI", "amount": 16500.0, "type": "debit", "category": "emi", "timestamp": "2026-08-16T10:00:00+05:30"}
    ]
    features = FeatureExtractor.extract(sample_txs)
    assert features["metro_frequency_30d"] == 2
    assert features["commute_detected"] is True
    assert features["commute_time"] == "08:40 AM"
    assert features["dti_ratio"] == pytest.approx(16500.0 / 75000.0, 0.01)
    assert features["total_debit_volume"] == 16580.0
    assert features["total_credit_volume"] == 75000.0
    assert features["savings_momentum"] == "positive"


def test_signal_detector():
    """Verify composable signal evaluation across behavioral and lifecycle domains."""
    features = {
        "metro_frequency_30d": 12,
        "commute_detected": True,
        "commute_time": "08:40 AM",
        "commute_amount": 40,
        "commute_merchant": "Delhi Metro Smart Card",
        "dti_ratio": 0.22,
        "burn_rate": 30000,
        "savings_momentum": "positive",
        "odd_hours_count": 0
    }
    scenario_data = {
        "signals": {
            "metro_usage": "high",
            "savings_trend": "positive",
            "anomaly_score": 4
        }
    }
    signals = SignalDetector.detect(scenario_data, features)
    assert signals["commute_habit_detected"] is True
    assert signals["commute_typical_time"] == "08:40 AM"
    assert signals["savings_trend"] == "positive"
    assert signals["stress_alert"] is False


@pytest.mark.parametrize("fixture_file,expected_health,expected_state_type", [
    ("commuter_normal.json", "stable", "normal"),
    ("medical_emergency.json", "tight", "medical_event"),
    ("financial_stress.json", "stress", "financial_stress"),
    ("wealth_surplus.json", "thriving", "surplus"),
    ("fraud_anomaly.json", "stable", "fraud_alert")
])
def test_all_scenarios_contract_compliance(customer_state_schema, fixture_file, expected_health, expected_state_type):
    """Verify that all 5 canonical scenarios produce 100% contract-compliant CustomerState."""
    fixture_path = FIXTURES_DIR / fixture_file
    with open(fixture_path, "r", encoding="utf-8-sig") as f:
        scenario_data = json.load(f)

    transactions = scenario_data.get("transactions", [])
    customer_state = build_customer_state(scenario_data, transactions)

    # 1. JSON Schema Contract validation
    validate(instance=customer_state, schema=customer_state_schema)

    # 2. State & Health classification check
    assert customer_state["financial_health"] == expected_health
    assert customer_state["state_type"] == expected_state_type
    assert isinstance(customer_state["recommendations"], list)
    assert customer_state["balance"]["available"] > 0


def test_ethical_loan_suppression_under_stress():
    """Verify that under financial stress, loans are STRICTLY eliminated from active recommendations."""
    fixture_path = FIXTURES_DIR / "financial_stress.json"
    with open(fixture_path, "r", encoding="utf-8-sig") as f:
        scenario_data = json.load(f)

    transactions = scenario_data.get("transactions", [])
    customer_state = build_customer_state(scenario_data, transactions)

    active_rec_ids = [r["id"] for r in customer_state["recommendations"]]

    # Assert loan is NOT in active recommendations
    assert "rec_personal_loan" not in active_rec_ids, "CRITICAL: Personal loan must be suppressed during financial stress!"

    # Assert guidance is surfaced
    assert "rec_cashflow_guidance" in active_rec_ids, "Cash flow guidance must be prioritized under financial stress."


def test_performance_latency():
    """Verify that Customer Intelligence Engine computes state in under 15ms."""
    fixture_path = FIXTURES_DIR / "commuter_normal.json"
    with open(fixture_path, "r", encoding="utf-8-sig") as f:
        scenario_data = json.load(f)

    transactions = scenario_data.get("transactions", [])

    # Warm up
    _ = build_customer_state(scenario_data, transactions)

    # Measure
    start = time.perf_counter()
    iterations = 50
    for _ in range(iterations):
        _ = build_customer_state(scenario_data, transactions)
    avg_latency_ms = ((time.perf_counter() - start) / iterations) * 1000

    print(f"\n[BENCHMARK] Average latency: {avg_latency_ms:.3f}ms")
    assert avg_latency_ms < 15.0, f"Latency {avg_latency_ms}ms exceeds 15ms threshold!"


def test_multi_month_salary_averaging_dti_stability():
    """Verify that multiple salary credits are averaged rather than summed, preventing DTI distortion."""
    txs = [
        {"merchant": "Infosys Corporate Salary", "amount": 75000.0, "type": "credit", "category": "salary", "timestamp": "2026-07-01T09:00:00+05:30"},
        {"merchant": "Infosys Corporate Salary", "amount": 75000.0, "type": "credit", "category": "salary", "timestamp": "2026-08-01T09:00:00+05:30"},
        {"merchant": "Infosys Corporate Salary", "amount": 75000.0, "type": "credit", "category": "salary", "timestamp": "2026-09-01T09:00:00+05:30"},
        {"merchant": "HDFC Bank Home Loan", "amount": 16500.0, "type": "debit", "category": "emi", "timestamp": "2026-07-16T10:00:00+05:30", "is_recurring": True},
        {"merchant": "HDFC Bank Home Loan", "amount": 16500.0, "type": "debit", "category": "emi", "timestamp": "2026-08-16T10:00:00+05:30", "is_recurring": True},
        {"merchant": "HDFC Bank Home Loan", "amount": 16500.0, "type": "debit", "category": "emi", "timestamp": "2026-09-16T10:00:00+05:30", "is_recurring": True}
    ]
    features = FeatureExtractor.extract(txs)
    # Estimated monthly income must be ₹75,000, NOT ₹225,000
    assert features["spending_metrics"]["estimated_monthly_income"] == 75000.0
    # DTI ratio must be 16,500 / 75,000 = 0.22, NOT 0.073
    assert features["dti_ratio"] == pytest.approx(0.22, 0.01)


def test_temporal_features_noon_and_midnight_formatting():
    """Verify that noon (12 PM) and midnight (12 AM) format with standard 12-hour clock notation."""
    noon_txs = [
        {"merchant": "Delhi Metro Smart Card", "amount": 40.0, "type": "debit", "category": "transport", "timestamp": "2026-09-12T12:30:00+05:30"},
        {"merchant": "Delhi Metro Smart Card", "amount": 40.0, "type": "debit", "category": "transport", "timestamp": "2026-09-11T12:30:00+05:30"}
    ]
    features_noon = FeatureExtractor.extract(noon_txs)
    assert "12:30 PM" in features_noon["commute_time"]
    assert "00:" not in features_noon["commute_time"]

    midnight_txs = [
        {"merchant": "Delhi Metro Smart Card", "amount": 40.0, "type": "debit", "category": "transport", "timestamp": "2026-09-12T00:15:00+05:30"},
        {"merchant": "Delhi Metro Smart Card", "amount": 40.0, "type": "debit", "category": "transport", "timestamp": "2026-09-11T00:15:00+05:30"}
    ]
    features_midnight = FeatureExtractor.extract(midnight_txs)
    assert "12:15 AM" in features_midnight["commute_time"]
    assert "00:" not in features_midnight["commute_time"]


def test_normalizer_dirty_inputs_resilience():
    """Verify that dirty formatted amounts, None values, and Unix timestamps normalize cleanly."""
    dirty_tx = {
        "id": "tx_dirty_01",
        "merchant": "UPI-REF/Tata Power Electricity/POS-9988",
        "amount": "₹ 1,450.75",
        "category": "bills",
        "timestamp": 1726117200  # Unix epoch timestamp in seconds
    }
    normalized = TransactionNormalizer.normalize(dirty_tx)
    assert normalized["amount"] == 1450.75
    assert normalized["merchant"] == "Tata Power Electricity"
    assert normalized["category"] == "bills"
    assert normalized["type"] == "debit"
    assert normalized["datetime"].year >= 2024

    # Also test completely null transaction
    null_tx = {"id": "tx_null", "merchant": None, "amount": None}
    norm_null = TransactionNormalizer.normalize(null_tx)
    assert norm_null["merchant"] == "General Merchant"
    assert norm_null["amount"] == 0.0


def test_trend_features_recurring_emi_not_shock():
    """Verify that routine scheduled loan EMI is not flagged as an unexpected shock outlay."""
    txs = [
        {"merchant": "Corporate Salary Credit", "amount": 90000.0, "type": "credit", "category": "salary", "timestamp": "2026-09-01T09:00:00+05:30"},
        {"merchant": "HDFC Bank Home Loan", "amount": 32000.0, "type": "debit", "category": "emi", "is_recurring": True, "timestamp": "2026-09-05T10:00:00+05:30"}
    ]
    features = FeatureExtractor.extract(txs, profile={"accounts": {"available_balance": 80000.0}})
    # EMI is recurring, so large_outlay_detected must be False
    assert features["large_outlay_detected"] is False
    assert features["spending_volatility"] in ["low", "medium"]


def test_real_customer_profile_name_and_balance_resolution():
    """Verify that CustomerStateBuilder properly resolves real customer records like Pooja Patel."""
    customer_profile = {
        "id": "cust_bharat_002",
        "name": "Pooja Patel",
        "monthly_income": 95000,
        "accounts": {
            "available_balance": 84200,
            "savings_reserve": 210000
        },
        "signals": {
            "savings_trend": "positive"
        }
    }
    state = build_customer_state(customer_profile, [])
    assert state["customer_id"] == "cust_bharat_002"
    assert state["customer_name"] == "Pooja Patel"
    assert state["balance"]["available"] == 84200.0
    assert state["balance"]["savings"] == 210000.0
    assert state["financial_health"] == "thriving"
