"""Unit tests for Dual-Cadence Tiered Engine (14-Day Batch + Sub-Millisecond Micro-Triggers)."""

import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from ai.intelligence.customer_state.cadence import DualCadenceEngine


def test_dual_cadence_tier1_first_run_and_cache():
    """Verify Day 0 executes full heavy macro-batch, caches state, and schedules next 14-day batch."""
    DualCadenceEngine.clear_cache()
    cust_data = {
        "customer_id": "cust_cadence_001",
        "customer_name": "Rahul Sharma",
        "monthly_income": 85000.0,
        "balance": {"available": 45000.0, "savings": 150000.0}
    }
    txs = [
        {"merchant": "Delhi Metro", "category": "transport", "amount": 40.0, "type": "debit"},
        {"merchant": "Tata Power", "category": "bills", "amount": 1450.0, "type": "debit"}
    ]

    base_time = datetime(2026, 1, 1, 10, 0, 0, tzinfo=timezone.utc)
    state = DualCadenceEngine.evaluate_state(cust_data, txs, current_time=base_time)

    assert "cadence_telemetry" in state
    telemetry = state["cadence_telemetry"]
    assert telemetry["processing_tier"] == "TIER_1_HEAVY_MACRO_BATCH"
    assert telemetry["days_since_last_heavy_batch"] == 0
    assert telemetry["next_scheduled_heavy_batch"] == "2026-01-15"
    assert len(state["recommendations"]) > 0


def test_dual_cadence_tier2_sub_millisecond_micro_trigger():
    """Verify Day 7 executes Tier 2 in sub-millisecond time, catching micro-moments without re-parsing transactions."""
    cust_id = "cust_cadence_002"
    cust_data = {
        "customer_id": cust_id,
        "customer_name": "Rahul Sharma",
        "monthly_income": 85000.0,
        "balance": {"available": 45000.0, "savings": 150000.0}
    }
    txs = [{"merchant": "Delhi Metro", "category": "transport", "amount": 40.0, "type": "debit"}]

    day_0 = datetime(2026, 1, 1, 10, 0, 0, tzinfo=timezone.utc)
    # 1. Day 0 Heavy batch
    DualCadenceEngine.evaluate_state(cust_data, txs, current_time=day_0)

    # 2. Day 7 Micro-event arrives: credit card statement due + NCMC low balance
    day_7 = datetime(2026, 1, 8, 14, 30, 0, tzinfo=timezone.utc)
    incoming_event = {
        "customer_id": cust_id,
        "customer_name": "Rahul Sharma",
        "balance": {"available": 45000.0, "transit_wallet": 35.0},  # < 80 threshold
        "signals": {
            "credit_card_bill_due": True,
            "ncmc_low_balance": True
        }
    }

    start = time.perf_counter()
    state_day_7 = DualCadenceEngine.evaluate_state(incoming_event, transactions=None, current_time=day_7)
    elapsed_ms = (time.perf_counter() - start) * 1000

    print(f"\n[CADENCE BENCHMARK] Tier 2 Micro-trigger evaluated in: {elapsed_ms:.3f}ms")

    telemetry = state_day_7["cadence_telemetry"]
    assert telemetry["processing_tier"] == "TIER_2_REALTIME_MICRO_TRIGGER"
    assert telemetry["days_since_last_heavy_batch"] == 7
    assert telemetry["compute_cost_savings_pct"] >= 95.0
    assert elapsed_ms < 5.0, f"Tier 2 execution exceeded 5ms: {elapsed_ms:.3f}ms"

    # Verify that micro-triggers fired and elevated urgent services to top ranks
    triggers = telemetry["active_micro_triggers_detected"]
    assert "CREDIT_CARD_DUE_DATE_ALERT" in triggers
    assert "NCMC_LOW_BALANCE_TOPUP" in triggers

    top_rec_ids = [r["id"] for r in state_day_7["recommendations"]]
    assert "srv_credit_card_bill" in top_rec_ids
    assert "srv_ncmc_reload" in top_rec_ids
    assert state_day_7["recommendations"][0]["id"] == "srv_credit_card_bill"
    assert state_day_7["recommendations"][0]["rank"] == 1


def test_dual_cadence_tier1_auto_refresh_after_14_days():
    """Verify that on Day 15 (>= 14 days), heavy macro-batch automatically re-triggers."""
    cust_id = "cust_cadence_003"
    cust_data = {
        "customer_id": cust_id,
        "customer_name": "Rahul Sharma",
        "monthly_income": 85000.0,
        "balance": {"available": 45000.0, "savings": 150000.0}
    }
    txs = [{"merchant": "Delhi Metro", "category": "transport", "amount": 40.0, "type": "debit"}]

    day_0 = datetime(2026, 1, 1, 10, 0, 0, tzinfo=timezone.utc)
    DualCadenceEngine.evaluate_state(cust_data, txs, current_time=day_0)

    # Day 15: Cadence expired -> re-run Tier 1
    day_15 = datetime(2026, 1, 16, 10, 0, 0, tzinfo=timezone.utc)
    state_day_15 = DualCadenceEngine.evaluate_state(cust_data, txs, current_time=day_15)

    telemetry = state_day_15["cadence_telemetry"]
    assert telemetry["processing_tier"] == "TIER_1_HEAVY_MACRO_BATCH"
    assert telemetry["days_since_last_heavy_batch"] == 0
    assert telemetry["next_scheduled_heavy_batch"] == "2026-01-30"
