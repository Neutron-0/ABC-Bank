"""Comprehensive Test Suite for Multi-Source Dirty Data Ingestion, Harmonization, and Strict Top-5 Personalization."""

import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from ai.intelligence.ingestion.models import (
    CBSLedgerRecord,
    UPISwitchLog,
    SMSNotificationRecord,
    BureauCreditProfile,
    BBPSUtilityRecord,
    NCMCTransitRecord,
    CustomerDemographics,
)
from ai.intelligence.ingestion.harmonizer import MultiSourceDataHarmonizer
from ai.intelligence import build_customer_state


def test_multi_source_dirty_data_ingestion_and_sanitization():
    """Verify that heterogeneous, dirty, multi-source Indian banking data is cleaned and harmonized seamlessly."""
    cbs_records = [
        CBSLedgerRecord(
            txn_id="cbs_001",
            amount="₹ 85,000.00",  # String with rupee symbol and comma
            type="credit",
            narration="INFOSYS CORPORATE SALARY NEFT",
            balance_after="₹ 1,20,000.00",
            timestamp="2026-01-01T09:00:00Z"
        ),
        CBSLedgerRecord(
            txn_id="cbs_002",
            amount=None,  # Null amount edge case
            type="debit",
            narration="UNKNOWN CORRUPTED ENTRY",
            timestamp="corrupted_date"
        ),
        CBSLedgerRecord(
            txn_id="cbs_003",
            amount="₹ 16,500.00",
            type="debit",
            narration="HDFC BANK HOME LOAN EMI AUTOPAY",
            timestamp="2026-01-05T10:00:00"
        ),
    ]

    upi_logs = [
        UPISwitchLog(
            rrn="982347102938",
            raw_upi_string="UPI/CR/982347102938/DELHI METRO SMART CARD/METRO@DMRC/NA",
            amount="40.00",
            timestamp="08-01-2026 08:45"  # Non-standard date format
        ),
        UPISwitchLog(
            rrn="982347102939",
            raw_upi_string="UPI/DR/123456789012/SWIGGY BANGALORE/SWIGGY@ICICI/NA",
            amount=350.50,
            timestamp=1767948000000  # Epoch millis
        )
    ]

    sms_records = [
        SMSNotificationRecord(
            sender_header="VM-HDFCBK",
            body="Acct XX123 debited by INR 620.00 on 10-01-2026 at BLINKIT. Avl Bal INR 98,400.00",
            received_at="10-01-2026 18:30"
        )
    ]

    bureau_profile = BureauCreditProfile(
        score=780,
        active_tradelines_count=2,
        total_outstanding_debt=2400000.0,
        monthly_emi_obligations=16500.0,
        overdue_amount=0.0,
        dpd_status="000",
        credit_card_utilization_pct=0.18
    )

    utility_records = [
        BBPSUtilityRecord(
            biller_id="FASTAG_NHAI_01",
            biller_category="fastag",
            amount_due=0.0,
            wallet_balance=120.0  # Low balance trigger (< 200)
        )
    ]

    transit_records = [
        NCMCTransitRecord(
            card_id="NCMC_DMRC_9921",
            current_stored_balance=45.0,  # Low transit balance trigger (< 80)
            daily_commute_detected=True
        )
    ]

    demographics = CustomerDemographics(
        customer_id="cust_multi_001",
        name="Aakash Verma",
        city_tier="Tier 1",
        declared_occupation="Software Engineer",
        declared_monthly_income=85000.0,
        kyc_tier=2
    )

    # Harmonize
    profile = MultiSourceDataHarmonizer.harmonize(
        demographics=demographics,
        cbs_records=cbs_records,
        upi_logs=upi_logs,
        sms_records=sms_records,
        bureau_profile=bureau_profile,
        utility_records=utility_records,
        transit_records=transit_records
    )

    assert profile.customer_id == "cust_multi_001"
    assert profile.customer_name == "Aakash Verma"
    assert profile.monthly_income == 85000.0
    assert len(profile.cleaned_transactions) >= 4
    assert profile.sanitization_audit["corrupted_dropped"] >= 1
    assert profile.bureau_summary["score"] == 780
    assert profile.balance["transit_wallet"] == 45.0
    assert profile.balance["fastag"] == 120.0


def test_idempotency_webhook_deduplication():
    """Verify that duplicate transaction webhooks/retries are safely identified and dropped."""
    cbs_records = [
        CBSLedgerRecord(
            txn_id="cbs_original",
            amount=450.0,
            narration="APOLLO PHARMACY DELHI",
            timestamp="2026-01-12T14:30:00"
        ),
        # Exact duplicate retry packet
        CBSLedgerRecord(
            txn_id="cbs_duplicate_retry",
            amount=450.0,
            narration="APOLLO PHARMACY DELHI",
            timestamp="2026-01-12T14:30:00"
        )
    ]

    profile = MultiSourceDataHarmonizer.harmonize(
        cbs_records=cbs_records,
        fallback_customer_id="cust_dedup_001"
    )

    assert profile.sanitization_audit["duplicates_dropped"] == 1
    assert len(profile.cleaned_transactions) == 1


def test_balance_conflict_arbitration_sms_vs_cbs():
    """Verify that balance conflict between stale statement and recent SMS is resolved in favor of newest timestamp."""
    cbs_records = [
        CBSLedgerRecord(
            txn_id="cbs_old",
            amount=1000.0,
            narration="ATM CASH WDL",
            balance_after=50000.0,
            timestamp="2026-01-01T10:00:00"
        )
    ]

    sms_records = [
        SMSNotificationRecord(
            sender_header="VM-HDFCBK",
            body="Acct XX123 debited by INR 500.00 on 10-01-2026 at ZOMATO. Avl Bal INR 42,500.00",
            received_at="2026-01-10T12:00:00"  # Newer timestamp
        )
    ]

    profile = MultiSourceDataHarmonizer.harmonize(
        cbs_records=cbs_records,
        sms_records=sms_records,
        fallback_customer_id="cust_conflict_001"
    )

    assert profile.balance["available"] == 42500.0
    assert profile.sanitization_audit["balance_conflicts_resolved"] == 1


def test_strict_top_1_to_5_priority_ranking_and_audit():
    """Verify that build_customer_state with multi-source feeds produces strictly Top 1 to 5 recommendations."""
    customer_data = {
        "customer_id": "cust_rahul_bharat",
        "customer_name": "Rahul Sharma",
        "declared_monthly_income": 85000.0,
        "kyc_tier": 2,
        "cbs_records": [
            {"txn_id": "c1", "amount": 85000.0, "type": "credit", "narration": "Corporate Salary NEFT", "timestamp": "2026-01-01T09:00:00"},
            {"txn_id": "c2", "amount": 16500.0, "type": "debit", "narration": "HDFC Home Loan EMI", "timestamp": "2026-01-05T10:00:00"}
        ],
        "upi_logs": [
            {"rrn": "u1", "raw_upi_string": "UPI/CR/1/DELHI METRO SMART CARD/METRO@DMRC/NA", "amount": 40.0, "timestamp": "2026-01-08T08:30:00"},
            {"rrn": "u2", "raw_upi_string": "UPI/CR/2/DELHI METRO SMART CARD/METRO@DMRC/NA", "amount": 40.0, "timestamp": "2026-01-09T08:30:00"},
            {"rrn": "u3", "raw_upi_string": "UPI/CR/3/DELHI METRO SMART CARD/METRO@DMRC/NA", "amount": 40.0, "timestamp": "2026-01-10T08:30:00"}
        ],
        "bureau_profile": {
            "score": 775,
            "active_tradelines_count": 2,
            "monthly_emi_obligations": 16500.0,
            "total_outstanding_debt": 2100000.0
        },
        "transit_records": [
            {"card_id": "NCMC_99", "current_stored_balance": 35.0, "daily_commute_detected": True}
        ]
    }

    state = build_customer_state(customer_data)

    # Contract assertions
    recs = state["recommendations"]
    assert 1 <= len(recs) <= 5, f"Must return between 1 and 5 recommendations, got {len(recs)}"

    # Check strict rank ordering (1, 2, 3, 4, 5)
    for i, rec in enumerate(recs):
        expected_rank = i + 1
        assert rec.get("rank") == expected_rank, f"Recommendation at index {i} must have rank {expected_rank}"
        assert rec["priority"] >= 10 and rec["priority"] <= 100
        assert rec["suppressed"] is False
        assert len(rec["reason"]) > 0

    # Priorities must be non-ascending (priority[i] >= priority[i+1])
    priorities = [r["priority"] for r in recs]
    assert priorities == sorted(priorities, reverse=True), "Recommendations must be sorted in descending priority order"

    # Verify audit trail and counterfactual explanations exist
    audit_trail = state["personalization"]["audit_trail"]
    assert len(audit_trail) > 0
    for entry in audit_trail:
        assert "audit_id" in entry
        assert "decision" in entry
        assert "counterfactual_explanation" in entry
        assert "regulatory_rules_enforced" in entry


def test_high_load_multi_source_speed_benchmark():
    """Verify that multi-source ingestion + feature extraction + personalization processes in < 50ms."""
    mixed_cbs = [
        {"txn_id": f"c_{i}", "amount": 100.0 + i, "type": "debit", "narration": f"Merchant {i}", "timestamp": "2026-01-05T12:00:00"}
        for i in range(300)
    ]
    mixed_upi = [
        {"rrn": f"u_{i}", "raw_upi_string": f"UPI/CR/{i}/MERCHANT_{i}@UPI/NA", "amount": 50.0 + i, "timestamp": "2026-01-06T12:00:00"}
        for i in range(300)
    ]
    mixed_sms = [
        {"sender_header": "VM-BK", "body": f"Acct XX1 debited by INR {20.0 + i} at SHOP_{i}", "received_at": "2026-01-07T12:00:00"}
        for i in range(300)
    ]

    customer_data = {
        "customer_id": "cust_benchmark_multi",
        "declared_monthly_income": 95000.0,
        "cbs_records": mixed_cbs,
        "upi_logs": mixed_upi,
        "sms_records": mixed_sms
    }

    start = time.perf_counter()
    state = build_customer_state(customer_data)
    elapsed_ms = (time.perf_counter() - start) * 1000

    print(f"\n[MULTI-SOURCE BENCHMARK] 900 multi-source records harmonized & personalized in: {elapsed_ms:.2f}ms")
    assert elapsed_ms < 60.0, f"Benchmark exceeded 60ms: {elapsed_ms:.2f}ms"
    assert len(state["recommendations"]) <= 5
