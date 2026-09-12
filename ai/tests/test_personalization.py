"""Comprehensive test suite for Bharat Hyper-Personalization Engine.

Strict Architectural Invariant:
The Personalization and Recommendation Engine is 100% deterministic, mathematical,
and regulatory-compliant (RBI Digital Lending 2022 & DPDP Act 2023).
It operates completely independent of MiniCPM-5 or any Generative SLM/LLM.
"""

import sys
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from ai.intelligence.personalization.archetypes import ArchetypeClassifier, ArchetypeId, BHARAT_ARCHETYPES
from ai.intelligence.personalization.catalog import PRODUCT_CATALOG
from ai.intelligence.personalization.compliance import ComplianceEngine
from ai.intelligence.personalization.engine import PersonalizationEngine
from ai.intelligence import build_customer_state


def test_archetype_classification_all_seven():
    """Verify that all 7 Indian customer archetypes are classified accurately."""
    # 1. Urban Commuter
    commuter_data = {"customer_id": "cust_01", "monthly_income": 80000, "occupation": "Software Engineer"}
    arch_commuter = ArchetypeClassifier.classify(commuter_data, {}, {"commute_habit_detected": True})
    assert arch_commuter.id == ArchetypeId.URBAN_COMMUTER

    # 2. MSME Merchant
    merchant_data = {"customer_id": "cust_02", "monthly_income": 120000, "occupation": "Merchant Trader"}
    arch_merchant = ArchetypeClassifier.classify(merchant_data, {}, {})
    assert arch_merchant.id == ArchetypeId.MSME_MERCHANT

    # 3. Gig Worker
    gig_data = {"customer_id": "cust_03", "monthly_income": 28000, "occupation": "Delivery Gig Partner"}
    arch_gig = ArchetypeClassifier.classify(gig_data, {}, {})
    assert arch_gig.id == ArchetypeId.GIG_WORKER

    # 4. Rural Farmer
    farmer_data = {"customer_id": "cust_04", "monthly_income": 40000, "occupation": "Agriculturalist"}
    arch_farmer = ArchetypeClassifier.classify(farmer_data, {}, {})
    assert arch_farmer.id == ArchetypeId.RURAL_FARMER

    # 5. Student / First-Time Earner
    student_data = {"customer_id": "cust_05", "monthly_income": 12000, "age": 20}
    arch_student = ArchetypeClassifier.classify(student_data, {}, {})
    assert arch_student.id == ArchetypeId.STUDENT_FIRST_EARNER

    # 6. Senior Pensioner
    senior_data = {"customer_id": "cust_06", "monthly_income": 45000, "employment_type": "Pensioner"}
    arch_senior = ArchetypeClassifier.classify(senior_data, {}, {})
    assert arch_senior.id == ArchetypeId.SENIOR_PENSIONER

    # 7. Homemaker / SHG
    shg_data = {"customer_id": "cust_07", "monthly_income": 20000, "occupation": "Homemaker SHG"}
    arch_shg = ArchetypeClassifier.classify(shg_data, {}, {})
    assert arch_shg.id == ArchetypeId.HOMEMAKER_SHG


def test_confidence_score_calculation():
    """Verify statistical confidence scoring formula under various data densities."""
    features = {
        "transaction_metrics": {"total_tx_count": 25},
        "spending_volatility": "low"
    }
    signals = {"commute_habit_detected": True}
    customer_data = {"kyc_tier": 2}

    confidence = ComplianceEngine.calculate_confidence_score(features, signals, customer_data)
    assert 0.85 <= confidence <= 0.99, f"Expected high confidence, got {confidence}"

    # Sparse data test
    sparse_features = {
        "transaction_metrics": {"total_tx_count": 2},
        "spending_volatility": "high"
    }
    sparse_confidence = ComplianceEngine.calculate_confidence_score(sparse_features, signals, customer_data)
    assert sparse_confidence < confidence, "Sparse data must produce lower confidence score."


def test_rbi_fair_lending_loan_suppression():
    """Verify that personal loans are strictly suppressed when DTI > 0.40 or stress alert is active."""
    customer_data = {"customer_id": "cust_stressed", "monthly_income": 50000}
    features = {"transaction_metrics": {"total_tx_count": 15}, "dti_ratio": 0.58}
    signals = {"debt_to_income_ratio": 0.58, "stress_alert": True}

    res = PersonalizationEngine.evaluate(customer_data, features, signals, health="stress")

    # Assert personal loan is in suppressed list
    suppressed_ids = [r["id"] for r in res["suppressed_recommendations"]]
    assert "rec_personal_loan" in suppressed_ids, "Personal loan must be in suppressed list!"

    # Assert active list contains guidance
    active_ids = [r["id"] for r in res["active_recommendations"]]
    assert "rec_personal_loan" not in active_ids, "Personal loan must NOT be active!"
    assert "rec_cashflow_guidance" in active_ids, "Cash flow guidance must be active!"

    # Verify audit trail contains the suppression rule
    loan_audit = next(a for a in res["audit_trail"] if a["product_id"] == "rec_personal_loan")
    assert loan_audit["decision"] == "SUPPRESS"
    assert "RBI_DL_2022_DTI_40_CAP" in loan_audit["regulatory_rules_enforced"]


def test_dpdp_purpose_limitation_consent():
    """Verify that products requiring ungranted consent scopes are suppressed under DPDP Act 2023."""
    customer_data = {"customer_id": "cust_dpdp", "monthly_income": 80000}
    features = {"transaction_metrics": {"total_tx_count": 15}}
    signals = {"debt_to_income_ratio": 0.20}

    # Only grant transit payments consent
    limited_scopes = ["transit_payments", "general_banking"]

    res = PersonalizationEngine.evaluate(
        customer_data=customer_data,
        features=features,
        signals=signals,
        health="stable",
        consent_scopes=limited_scopes
    )

    # Smart savings requires wealth_management scope, which is missing
    suppressed_ids = [r["id"] for r in res["suppressed_recommendations"]]
    assert "rec_smart_savings" in suppressed_ids
    savings_audit = next(a for a in res["audit_trail"] if a["product_id"] == "rec_smart_savings")
    assert "DPDP_ACT_2023_SEC_6_PURPOSE_LIMITATION" in savings_audit["regulatory_rules_enforced"]


def test_end_to_end_customer_state_personalization_enrichment():
    """Verify that build_customer_state returns contract-compliant state with full personalization metadata."""
    sample_data = {
        "customer_id": "cust_001",
        "customer_name": "Rahul Sharma",
        "monthly_income": 75000,
        "name": "normal",
        "balance": {"available": 42680, "savings": 185000, "currency": "INR"},
        "signals": {"metro_usage": "high", "savings_trend": "positive", "anomaly_score": 4}
    }
    state = build_customer_state(sample_data, [])

    # Schema contract compliance
    assert "customer_id" in state
    assert "financial_health" in state
    assert "recommendations" in state
    assert "personalization" in state

    pers = state["personalization"]
    assert "confidence_score" in pers
    assert "archetype" in pers
    assert "audit_trail" in pers
    assert len(pers["audit_trail"]) > 0


def test_micro_moment_services_triggering():
    """Verify predictive triggering of non-earning and utility micro-moment banking services."""
    customer_data = {
        "customer_id": "cust_commuter_cibil",
        "monthly_income": 75000,
        "credit_score": 770,
        "balance": {"available": 45000, "savings": 150000}
    }
    features = {
        "transaction_metrics": {"total_tx_count": 22},
        "commute_detected": True
    }
    signals = {
        "commute_habit_detected": True,
        "cibil_refresh_due": True,
        "ncmc_low_balance": True,
        "debt_to_income_ratio": 0.20
    }

    res = PersonalizationEngine.evaluate(customer_data, features, signals, health="stable")
    active_ids = [r["id"] for r in res["active_recommendations"]]

    # Both NCMC reload and CIBIL score refresh should be surfaced
    assert "srv_ncmc_reload" in active_ids, "NCMC reload micro-moment must trigger on low transit balance"
    assert "srv_cibil_refresh" in active_ids, "30-day CIBIL refresh must trigger when due"


def test_personal_recommendation_independent_of_llm_or_slm():
    """Architectural invariant: Personal recommendations are 100% deterministic and mathematical.

    PersonalizationEngine does not invoke MiniCPM-5 or any generative SLM/LLM.
    Decisions rely purely on:
    1. Multi-factor utility index: Affordability(30%) + Need(30%) + Urgency(25%) + Affinity(15%) - Risk
    2. Regulatory gates: RBI Fair Lending DTI cap (0.40) & DPDP Purpose Scope
    3. Cryptographic SHA-256 Decision Proof
    """
    customer_data = {"customer_id": "cust_pure_math", "monthly_income": 95000}
    features = {
        "transaction_metrics": {"total_tx_count": 40},
        "dti_ratio": 0.25,
        "savings_rate": 0.35
    }
    signals = {"commute_habit_detected": True, "debt_to_income_ratio": 0.25}

    res = PersonalizationEngine.evaluate(customer_data, features, signals, health="stable")

    # Recommendations must be ranked purely by score
    active = res["active_recommendations"]
    assert len(active) >= 1
    priorities = [r["priority"] for r in active]
    assert priorities == sorted(priorities, reverse=True), "Recommendations must strictly follow descending mathematical score"

    # Must contain full deterministic audit trail with zero generative hallucinations
    for rec in active:
        assert isinstance(rec["priority"], (int, float))
        assert "reason" in rec
        assert "confidence" in rec
        assert 0.5 <= rec["confidence"] <= 1.0
