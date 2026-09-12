import sys
import os
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure root directory is on sys.path
root_dir = Path(__file__).resolve().parents[3]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from apps.backend.app.main import app
from apps.backend.app.services.state_service import StateService
from apps.backend.app.services.safety_policy import SafetyPolicyFilter
from apps.backend.app.experience.composer import ExperienceComposer
from apps.backend.app.models.customer_state import CustomerStateModel, Recommendation, Balance

client = TestClient(app)

# ===========================================================================
# 1. Customer State Boundary & Resilience Tests
# ===========================================================================
def test_valid_customer_state():
    """Verify customer state retrieval for known valid customer."""
    res = client.get("/api/v1/customer/cust_bharat_001")
    assert res.status_code == 200
    data = res.json()
    assert data["customer_id"] == "cust_bharat_001"
    assert "financial_health" in data
    assert "signals" in data
    assert data["balance"]["available"] >= 0

def test_invalid_customer_state():
    """Verify 404 is returned gracefully for unknown customer ID."""
    res = client.get("/api/v1/customer/unknown_nonexistent_999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_ai_fallback_resilience(monkeypatch):
    """Verify that if AI pipeline raises an error, backend returns safe fallback without crashing."""
    def broken_generate(*args, **kwargs):
        raise RuntimeError("Simulated AI cluster timeout")

    from ai.intelligence.customer_state.generator import CustomerStateGenerator
    monkeypatch.setattr(CustomerStateGenerator, "generate", broken_generate)

    # Invalidate cache
    StateService._in_memory_states.clear()
    state = StateService.get_state("cust_bharat_001", "normal")

    assert state.customer_id == "cust_bharat_001"
    assert state.signals.get("fallback_mode") is True
    assert state.financial_health == "stable"
    assert len(state.recommendations) > 0


# ===========================================================================
# 2. Task 9A: Generic Category Composition (Education)
# ===========================================================================
def test_generic_recommendation_composition_education():
    """
    Verify that an arbitrary recommendation category ('education')
    composes into valid ExperienceConfig without any education-specific backend branch.
    """
    synthetic_state = CustomerStateModel(
        customer_id="cust_bharat_001",
        customer_name="Test User",
        financial_health="stable",
        signals={"academic_quarter": "Q3"},
        balance=Balance(available=45000, savings=80000, currency="INR"),
        recommendations=[
            Recommendation(
                id="school_fee_due",
                category="education",
                title="School fee payment due soon",
                reason="Your recent cashflow suggests this payment is approaching",
                priority=88,
                action_label="Review payment",
                action_type="OPEN_PAYMENT_JOURNEY",
                journey_id="fee_planner",
                payload={"student_id": "STU_101"}
            )
        ]
    )

    exp = ExperienceComposer.compose(synthetic_state)
    assert exp.hero_card is not None
    assert exp.hero_card.title == "School fee payment due soon"
    assert exp.hero_card.action_label == "Review payment"
    assert exp.hero_card.action_type == "OPEN_PAYMENT_JOURNEY"

    assert len(exp.context_cards) == 1
    card = exp.context_cards[0]
    assert card.title == "School fee payment due soon"
    assert card.primary_action.label == "Review payment"
    assert card.primary_action.action_type == "OPEN_PAYMENT_JOURNEY"
    assert card.primary_action.journey_id == "fee_planner"
    assert card.primary_action.payload == {"student_id": "STU_101"}
    assert "open_payment_journey" in exp.primary_actions or "education" in exp.primary_actions


# ===========================================================================
# 3. Task 9B: Another Arbitrary Category (Agriculture / Farming)
# ===========================================================================
def test_generic_recommendation_composition_agriculture():
    """
    Verify that a rural/farming category ('agriculture') works completely seamlessly.
    """
    synthetic_state = CustomerStateModel(
        customer_id="cust_bharat_001",
        customer_name="Farmer User",
        financial_health="stable",
        signals={"season": "kharif_sowing"},
        balance=Balance(available=62000, savings=30000, currency="INR"),
        recommendations=[
            Recommendation(
                id="pm_kisan_subsidy_credit",
                category="agriculture",
                title="PM-Kisan Direct Benefit Received",
                reason="Direct subsidy installment credited to your account",
                priority=94,
                action_label="View Passbook",
                action_type="OPEN_PASSBOOK"
            )
        ]
    )

    exp = ExperienceComposer.compose(synthetic_state)
    assert exp.hero_card.title == "PM-Kisan Direct Benefit Received"
    assert exp.hero_card.action_label == "View Passbook"
    assert exp.hero_card.action_type == "OPEN_PASSBOOK"
    assert exp.context_cards[0].layer == "DO"


# ===========================================================================
# 4. Task 9C: Generic Event Ingestion (No Keyword Scraping in Backend)
# ===========================================================================
def test_generic_event_ingestion_arbitrary_transaction():
    """
    Verify generic event ingestion with arbitrary category='agriculture', merchant='IFFCO', amount=-3200.
    Ensures backend validates and adjusts accounting without needing domain keyword scrapers.
    """
    StateService.switch_scenario("normal")
    init_state = StateService.get_state("cust_bharat_001")
    initial_balance = init_state.balance.available

    event_payload = {
        "customer_id": "cust_bharat_001",
        "type": "transaction",
        "category": "agriculture",
        "amount": -3200.0,
        "merchant": "IFFCO Fertilizer Depot",
        "timestamp": "2026-09-12T10:00:00Z",
        "metadata": {
            "mcc": "5193",
            "invoice_no": "INV-7890"
        }
    }

    res = client.post("/api/v1/events", json=event_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["event_type"] == "transaction"
    assert data["updated_state"]["balance"]["available"] == pytest.approx(initial_balance - 3200.0, 0.1)
    assert data["updated_state"]["signals"]["last_event_category"] == "agriculture"
    assert data["updated_state"]["signals"]["event_invoice_no"] == "INV-7890"

def test_generic_event_ingestion_life_milestone():
    """Verify non-transactional generic event (e.g. relocation) is accepted cleanly."""
    event_payload = {
        "customer_id": "cust_bharat_001",
        "type": "life_event",
        "category": "relocation",
        "metadata": {
            "city_changed": True,
            "new_city": "Ahmedabad"
        }
    }
    res = client.post("/api/v1/events", json=event_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["updated_state"]["signals"]["event_new_city"] == "Ahmedabad"

def test_event_ingestion_invalid_customer():
    """Verify 404 on event for invalid customer."""
    event_payload = {
        "customer_id": "invalid_cust_999",
        "type": "transaction",
        "amount": -500.0
    }
    res = client.post("/api/v1/events", json=event_payload)
    assert res.status_code == 404


# ===========================================================================
# 5. Task 9D: Deterministic Ethical Safety Policy (Lending Suppression)
# ===========================================================================
def test_safety_policy_suppresses_arbitrary_debt_products():
    """
    Verify that ANY lending/credit recommendation is suppressed during financial stress,
    using structured fields (product_type, is_debt_product, category) rather than title scraping.
    """
    candidate_recs = [
        Recommendation(
            id="rec_instant_cash_advance",
            category="credit",
            product_type="payday",
            is_debt_product=True,
            title="Short-term Cash Advance",
            reason="Unethical borrowing suggestion during crisis",
            priority=98,
            suppressed=False
        ),
        Recommendation(
            id="rec_budget_relief",
            category="guidance",
            product_type="advisory",
            is_debt_product=False,
            title="Essential Spending Freeze Helper",
            reason="Pause non-essential subscriptions",
            priority=95,
            suppressed=False
        )
    ]

    filtered = SafetyPolicyFilter.filter_recommendations(candidate_recs, is_stress=True)
    debt_rec = next(r for r in filtered if r.id == "rec_instant_cash_advance")
    relief_rec = next(r for r in filtered if r.id == "rec_budget_relief")

    assert debt_rec.suppressed is True
    assert debt_rec.priority == 0
    assert "Safety Policy" in debt_rec.reason
    assert relief_rec.suppressed is False

def test_financial_stress_experience_enforces_safety():
    """
    Verify complete ExperienceConfig composition under financial stress:
    1. Deprioritizes lending modules.
    2. Does NOT promote credit or debt cards.
    """
    stressed_state = CustomerStateModel(
        customer_id="cust_bharat_001",
        customer_name="Stressed User",
        financial_health="stress",
        signals={"debt_to_income_ratio": 0.55, "stress_alert": True},
        balance=Balance(available=4500, savings=5000, currency="INR"),
        recommendations=[
            Recommendation(
                id="rec_preapproved_personal_loan",
                category="credit",
                is_debt_product=True,
                title="Instant Pre-Approved Personal Loan",
                priority=99
            ),
            Recommendation(
                id="rec_cashflow_aid",
                category="support",
                is_debt_product=False,
                title="Cash Flow Relief Counseling",
                priority=85
            )
        ]
    )

    exp = ExperienceComposer.compose(stressed_state)
    assert "personal_loans" in exp.deprioritized_modules
    assert "credit_cards" in exp.deprioritized_modules

    # Ensure no context card promotes debt
    for card in exp.context_cards:
        assert card.type != "credit"
        assert "loan" not in card.id.lower()


# ===========================================================================
# 6. Task 9E: Highest-Priority Recommendation Always Becomes Hero
# ===========================================================================
def test_highest_priority_recommendation_becomes_hero():
    """
    Verify that HeroCard is generically selected by priority,
    not by scenario name or hardcoded domain ladders.
    """
    state = CustomerStateModel(
        customer_id="cust_bharat_001",
        financial_health="stable",
        signals={},
        balance=Balance(available=50000, savings=50000, currency="INR"),
        recommendations=[
            Recommendation(
                id="rec_low",
                category="general",
                title="Low Priority Update",
                priority=30
            ),
            Recommendation(
                id="rec_high",
                category="custom_urgent",
                title="High Priority Urgent Notice",
                reason="Requires immediate customer awareness",
                priority=97,
                action_label="Acknowledge",
                action_type="ACKNOWLEDGE_EVENT"
            ),
            Recommendation(
                id="rec_medium",
                category="general",
                title="Medium Priority Update",
                priority=60
            )
        ]
    )

    exp = ExperienceComposer.compose(state)
    assert exp.hero_card.id == "hero_rec_high"
    assert exp.hero_card.title == "High Priority Urgent Notice"
    assert exp.hero_card.action_label == "Acknowledge"
    assert exp.hero_card.action_type == "ACKNOWLEDGE_EVENT"


# ===========================================================================
# 7. Task 9F: Declared Action Metadata Reaches ExperienceConfig
# ===========================================================================
def test_declared_action_metadata_preserved_in_experience():
    """
    Verify that action_label, action_type, journey_id, and payload
    reach both the HeroCard and ContextCardModel accurately.
    """
    state = CustomerStateModel(
        customer_id="cust_bharat_001",
        financial_health="stable",
        signals={},
        balance=Balance(available=20000, savings=10000, currency="INR"),
        recommendations=[
            Recommendation(
                id="rec_smart_utility",
                category="utility",
                title="Electricity Bill Auto-Pay Ready",
                reason="Due in 3 days",
                priority=91,
                action_label="Review payment",
                action_type="OPEN_PAYMENT_JOURNEY",
                journey_id="bill_desk",
                payload={"bill_id": "EB_9921", "amount": 1450}
            )
        ]
    )

    exp = ExperienceComposer.compose(state)
    assert exp.hero_card.action_label == "Review payment"
    assert exp.hero_card.action_type == "OPEN_PAYMENT_JOURNEY"

    card = exp.context_cards[0]
    assert card.primary_action.label == "Review payment"
    assert card.primary_action.action_type == "OPEN_PAYMENT_JOURNEY"
    assert card.primary_action.journey_id == "bill_desk"
    assert card.primary_action.payload == {"bill_id": "EB_9921", "amount": 1450}


# ===========================================================================
# 8. Task 9G: Unknown Future Category Fallback
# ===========================================================================
def test_unknown_future_category_fallback():
    """
    Verify that an unmapped, completely unknown category ('future_unknown_category')
    composes successfully with safe generic fallbacks and valid schema output.
    """
    state = CustomerStateModel(
        customer_id="cust_bharat_001",
        financial_health="stable",
        signals={},
        balance=Balance(available=15000, savings=5000, currency="INR"),
        recommendations=[
            Recommendation(
                id="rec_future_001",
                category="future_unknown_category",
                title="New Novel Banking Innovation",
                reason="Emerging service from open banking ecosystem",
                priority=65
                # No action metadata provided
            )
        ]
    )

    exp = ExperienceComposer.compose(state)
    assert exp.hero_card.title == "New Novel Banking Innovation"
    assert exp.hero_card.action_label == "View Details"
    assert exp.hero_card.action_type == "OPEN_DETAILS"

    card = exp.context_cards[0]
    assert card.type == "future_unknown_category"
    assert card.layer == "PLAN"  # Priority 65 maps to PLAN
    assert card.primary_action.label == "View Details"
    assert card.primary_action.action_type == "OPEN_DETAILS"


# ===========================================================================
# 9. Assistant & Voice Intent Execution Tests
# ===========================================================================
def test_assistant_intent_check_balance():
    """Verify backend executes CHECK_BALANCE against verified banking balances."""
    payload = {
        "customer_id": "cust_bharat_001",
        "intent": "CHECK_BALANCE",
        "language": "en"
    }
    res = client.post("/api/v1/assistant/intent", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "available" in data["data"]
    assert "available balance is" in data["response_text"]

def test_assistant_intent_unsupported_graceful_fallback():
    """Verify unknown or unmapped intent safely falls back to GENERAL_QUERY without crash."""
    payload = {
        "customer_id": "cust_bharat_001",
        "intent": "BOOK_FLIGHT_TICKET",
        "language": "en"
    }
    res = client.post("/api/v1/assistant/intent", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "GENERAL_QUERY"
    assert data["success"] is True

def test_assistant_intent_invalid_customer():
    """Verify 404 when assistant intent queries unknown customer."""
    payload = {
        "customer_id": "ghost_customer",
        "intent": "CHECK_BALANCE"
    }
    res = client.post("/api/v1/assistant/intent", json=payload)
    assert res.status_code == 404

def test_assistant_chat_endpoint_compatibility():
    """Verify interactive assistant chat endpoint for frontend MitraChatScreen."""
    payload = {
        "query": "मेरी आगामी ईएमआई कब है?",
        "language": "hi",
        "customer_id": "cust_bharat_001"
    }
    res = client.post("/api/v1/assistant/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "reply" in data
    assert "actionChips" in data["reply"]


# ===========================================================================
# 6. Seeded Data Quality & Multi-Customer Differentiation Tests
# ===========================================================================
def test_seed_data_loader_customers_and_transactions():
    """Verify seeded customer profiles and expanded transaction history."""
    from apps.backend.app.db.loader import DataLoader
    customers = DataLoader.load_customers()
    assert len(customers) >= 2
    c_ids = [c["id"] for c in customers]
    assert "cust_bharat_001" in c_ids
    assert "cust_bharat_002" in c_ids

    # Verify cust_bharat_001 transactions
    tx_001 = DataLoader.load_transactions("cust_bharat_001")
    assert len(tx_001) >= 20
    # Must contain recurring commute, salary, emi, bills, agriculture, education
    categories_001 = {t["category"] for t in tx_001}
    assert {"salary", "emi", "bills", "transport", "agriculture", "education"}.issubset(categories_001)

    # Verify cust_bharat_002 transactions (segregated, no fallback)
    tx_002 = DataLoader.load_transactions("cust_bharat_002")
    assert len(tx_002) >= 6
    for t in tx_002:
        assert t["customer_id"] == "cust_bharat_002"

def test_scenario_switch_surplus_and_fraud_alert():
    """Verify switching to surplus and fraud-alert scenarios."""
    # Surplus scenario
    res_surplus = client.post("/api/v1/scenario/switch", json={"scenario": "surplus", "customer_id": "cust_bharat_001"})
    assert res_surplus.status_code == 200
    data_surplus = res_surplus.json()
    assert data_surplus["success"] is True
    assert data_surplus["scenario"] == "surplus"
    assert data_surplus["customer_state"]["financial_health"] == "thriving"
    assert data_surplus["experience"]["hero_card"]["badge"] in ["Explore", "Priority", "Context", "Planning"]

    # Fraud alert scenario
    res_fraud = client.post("/api/v1/scenario/switch", json={"scenario": "fraud-alert", "customer_id": "cust_bharat_001"})
    assert res_fraud.status_code == 200
    data_fraud = res_fraud.json()
    assert data_fraud["success"] is True
    assert data_fraud["scenario"] == "fraud-alert"
    assert data_fraud["customer_state"]["signals"]["anomaly_score"] > 80
    assert "Unusual" in data_fraud["experience"]["hero_card"]["title"] or "Debit" in data_fraud["experience"]["hero_card"]["title"]

