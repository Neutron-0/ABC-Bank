import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

root_dir = Path(__file__).resolve().parents[3]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from apps.backend.app.main import app
from apps.backend.app.services.state_service import StateService

client = TestClient(app)

def test_emi_grace_request():
    """Verify 10-day penalty-free EMI grace buffer under RBI guidelines."""
    cid = "cust_bharat_001"
    res = client.post("/api/v1/loans/grace", json={"customer_id": cid, "days": 10})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["grace_days"] == 10
    assert data["zero_penalty_guaranteed"] is True
    assert "new_due_date" in data

    # Verify customer state signals updated
    state = StateService.get_state(cid)
    assert state.signals.get("emi_grace_active") is True
    assert state.signals.get("upcoming_emi_deficit") == 0.0


def test_emi_split_request():
    """Verify splitting EMI into two 50% installments."""
    cid = "cust_bharat_001"
    res = client.post("/api/v1/loans/split", json={"customer_id": cid})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["half_emi"] > 0

    state = StateService.get_state(cid)
    assert state.signals.get("emi_split_active") is True


def test_deficit_sweep_for_emi():
    """Verify partial auto-sweep from deposit buffer to cover exact deficit."""
    cid = "cust_bharat_001"
    # Ensure savings balance exists
    state = StateService.get_state(cid)
    original_avail = state.balance.available
    original_savings = state.balance.savings

    res = client.post("/api/v1/loans/sweep-deficit", json={"customer_id": cid, "amount": 2500.0})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["swept_amount"] == 2500.0
    assert data["new_available_balance"] == original_avail + 2500.0
    assert data["remaining_savings_reserve"] == original_savings - 2500.0


def test_asba_ipo_lien_placement():
    """Verify SEBI UPI ASBA lien blocking on bank balance."""
    cid = "cust_bharat_001"
    res = client.post("/api/v1/investments/asba/bid", json={
        "customer_id": cid,
        "ipo_name": "Tata Tech Infra Ltd",
        "shares": 30,
        "amount": 15000.0,
        "upi_id": "rahul@okaxis"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["blocked_amount"] == 15000.0
    assert "ASBA/" in data["ref_id"]

    state = StateService.get_state(cid)
    assert state.signals.get("asba_lien_amount", 0.0) >= 15000.0


def test_dynamic_single_use_cvv_generation():
    """Verify generation of single-use 5-minute virtual dynamic CVV."""
    cid = "cust_bharat_001"
    res = client.post("/api/v1/cards/dynamic-cvv", json={"customer_id": cid, "card_id": "card_01"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["dynamic_cvv"]) == 3
    assert data["validity_seconds"] == 300


def test_cooling_off_cancellation():
    """Verify statutory 3-day cooling-off lookup cancellation without penalty."""
    cid = "cust_bharat_001"
    # First disburse loan
    disburse_res = client.post("/api/v1/loans/disburse", json={
        "customer_id": cid,
        "amount": 50000.0,
        "tenure_months": 12,
        "annual_rate": 10.5
    })
    assert disburse_res.status_code == 200
    contract_id = disburse_res.json()["contract_id"]

    # Now cancel under cooling-off
    cancel_res = client.post("/api/v1/loans/cooling-off-cancel", json={
        "customer_id": cid,
        "contract_id": contract_id
    })
    assert cancel_res.status_code == 200
    cancel_data = cancel_res.json()
    assert cancel_data["success"] is True
    assert cancel_data["penalty_charged"] == 0.0
    assert cancel_data["rbi_dlg_compliance"] is True


def test_insurance_plans_and_enrollment():
    """Verify statutory IRDAI health & term life insurance plans and 1-click enrollment."""
    cid = "cust_bharat_001"
    
    # 1. Fetch Plans
    plans_res = client.get(f"/api/v1/insurance/plans/{cid}")
    assert plans_res.status_code == 200
    plans_data = plans_res.json()
    assert "plans" in plans_data
    assert len(plans_data["plans"]) >= 2
    
    # 2. 1-Click Digital Enrollment
    enroll_res = client.post("/api/v1/insurance/enroll", json={
        "customer_id": cid,
        "plan_id": "arogya_sanjeevani_01",
        "sum_insured": 500000.0,
        "nominee_name": "Pooja Sharma",
        "nominee_relation": "Spouse"
    })
    assert enroll_res.status_code == 200
    enroll_data = enroll_res.json()
    assert enroll_data["success"] is True
    assert "POL/" in enroll_data["policy_number"]
    assert enroll_data["status"] == "ACTIVE_IN_FORCE"
    assert enroll_data["monthly_premium"] == 310.0

    state = StateService.get_state(cid)
    assert state.signals.get("has_active_health_cover") is True


def test_insurance_protection_assistant_turn():
    """Verify assistant intent turn answering insurance & protection queries."""
    cid = "cust_bharat_001"
    intent_res = client.post("/api/v1/assistant/intent", json={
        "customer_id": cid,
        "intent": "INSURANCE_PROTECTION",
        "language": "en",
        "entities": {}
    })
    assert intent_res.status_code == 200
    intent_data = intent_res.json()
    assert intent_data["success"] is True
    assert "Arogya Sanjeevani" in intent_data["data"]["health_cover"]
    assert "Section 80D" in intent_data["data"]["tax_benefits"]

    # Test chat endpoint
    chat_res = client.post("/api/v1/assistant/chat", json={
        "customer_id": cid,
        "query": "Tell me about ABC Bank insurance policies and health cover",
        "language": "en",
        "intent": "INSURANCE_PROTECTION",
        "entities": {}
    })
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert chat_data["success"] is True
    assert "Arogya Sanjeevani" in chat_data["reply"]["text"]
