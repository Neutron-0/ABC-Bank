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

def test_pin_setup_and_verification():
    """Verify cryptographic PIN setup and verification."""
    cid = "cust_bharat_001"

    # Setup PIN
    setup_res = client.post("/api/v1/auth/pin/setup", json={"customer_id": cid, "pin": "8492"})
    assert setup_res.status_code == 200
    assert setup_res.json()["success"] is True

    # Valid PIN verification
    verify_res = client.post("/api/v1/auth/pin/verify", json={"customer_id": cid, "pin": "8492"})
    assert verify_res.status_code == 200
    assert verify_res.json()["valid"] is True

    # Invalid PIN verification
    bad_res = client.post("/api/v1/auth/pin/verify", json={"customer_id": cid, "pin": "9999"})
    assert bad_res.status_code == 200
    assert bad_res.json()["valid"] is False
    assert bad_res.json()["failed_attempts"] == 1

def test_card_controls_persistence():
    """Verify card switch locking and limits persist."""
    cid = "cust_bharat_001"

    # Lock card
    lock_res = client.post("/api/v1/cards/controls", json={"customer_id": cid, "is_locked": True, "atmLimit": 25000})
    assert lock_res.status_code == 200
    assert lock_res.json()["controls"]["is_locked"] is True
    assert lock_res.json()["controls"]["atmLimit"] == 25000

    # Read back card controls
    get_res = client.get(f"/api/v1/cards/{cid}")
    assert get_res.status_code == 200
    assert get_res.json()["is_locked"] is True
    assert get_res.json()["atmLimit"] == 25000

    # Unlock card for subsequent tests
    unlock_res = client.post("/api/v1/cards/controls", json={"customer_id": cid, "is_locked": False})
    assert unlock_res.status_code == 200
    assert unlock_res.json()["controls"]["is_locked"] is False

def test_payment_transfer_and_ledger():
    """Verify authentic payment transfer, balance deduction, and ledger update."""
    cid = "cust_bharat_001"

    # Get baseline balance
    cust_res = client.get(f"/api/v1/customer/{cid}")
    assert cust_res.status_code == 200
    initial_avail = cust_res.json()["balance"]["available"]

    # Execute payment
    pay_res = client.post("/api/v1/payments/transfer", json={
        "customer_id": cid,
        "amount": 250.0,
        "merchant": "Delhi Metro Rail Corporation",
        "category": "transport",
        "description": "Smart Card Recharge"
    })
    assert pay_res.status_code == 200
    data = pay_res.json()
    assert data["success"] is True
    assert data["transaction"]["amount"] == 250.0
    assert data["balance"]["available"] == pytest.approx(initial_avail - 250.0, 0.01)

    # Verify transaction appears in ledger endpoint
    tx_res = client.get(f"/api/v1/transactions/{cid}")
    assert tx_res.status_code == 200
    txs = tx_res.json()["transactions"]
    assert any(t["id"] == data["transaction"]["id"] for t in txs)

def test_loan_disbursal():
    """Verify authentic loan origination and disbursal."""
    cid = "cust_bharat_001"

    # Disburse loan
    loan_res = client.post("/api/v1/loans/disburse", json={
        "customer_id": cid,
        "amount": 50000.0,
        "tenure_months": 12,
        "annual_rate": 10.5
    })
    assert loan_res.status_code == 200
    data = loan_res.json()
    assert data["success"] is True
    assert "contract_id" in data
    assert data["monthly_emi"] > 0
    assert data["disbursed_amount"] == 50000.0

def test_kyc_submission():
    """Verify authentic digital KYC submission and tier upgrade."""
    cid = "cust_bharat_001"

    # Invalid PAN format rejection
    bad_pan_res = client.post("/api/v1/kyc/submit", json={
        "customer_id": cid,
        "pan": "INVALID_PAN",
        "aadhaar": "987654321098"
    })
    assert bad_pan_res.status_code == 400

    # Valid submission
    kyc_res = client.post("/api/v1/kyc/submit", json={
        "customer_id": cid,
        "pan": "ABCDE1234F",
        "aadhaar": "987654321098",
        "latitude": 28.5355,
        "longitude": 77.3910,
        "selfie_verified": True
    })
    assert kyc_res.status_code == 200
    assert kyc_res.json()["kyc_tier"] == 3
    assert kyc_res.json()["status"] == "verified"
