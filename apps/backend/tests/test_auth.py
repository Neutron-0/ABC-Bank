import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

root_dir = Path(__file__).resolve().parents[3]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from apps.backend.app.main import app
from apps.backend.app.core.auth import verify_access_token

client = TestClient(app)

def test_login_seeded_account_rahul():
    """Verify login for seeded customer Rahul Sharma (cust_bharat_001)."""
    # 1. Login with email
    res = client.post("/api/v1/auth/login", json={
        "identifier": "rahul.sharma@bharatmail.in",
        "password": "password123"
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["customer_id"] == "cust_bharat_001"
    assert "access_token" in data
    token = data["access_token"]
    
    # Verify JWT validity
    claims = verify_access_token(token)
    assert claims["sub"] == "cust_bharat_001"

    # 2. Login with phone number
    res_phone = client.post("/api/v1/auth/login", json={
        "identifier": "+91 98765 43210",
        "password": "password123"
    })
    assert res_phone.status_code == 200
    assert res_phone.json()["customer_id"] == "cust_bharat_001"

    # 3. Login with customer ID
    res_id = client.post("/api/v1/auth/login", json={
        "identifier": "cust_bharat_001",
        "password": "password123"
    })
    assert res_id.status_code == 200
    assert res_id.json()["customer_id"] == "cust_bharat_001"

def test_login_seeded_account_pooja():
    """Verify login for seeded customer Pooja Patel (cust_bharat_002)."""
    res = client.post("/api/v1/auth/login", json={
        "identifier": "pooja.patel@bharatmail.in",
        "password": "password123"
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["customer_id"] == "cust_bharat_002"

def test_login_invalid_password():
    """Verify rejection when wrong plaintext password is provided."""
    res = client.post("/api/v1/auth/login", json={
        "identifier": "rahul.sharma@bharatmail.in",
        "password": "wrong_password_xyz"
    })
    assert res.status_code == 401
    assert "invalid password" in res.json()["detail"].lower()

def test_login_nonexistent_user():
    """Verify rejection for unknown user identifier."""
    res = client.post("/api/v1/auth/login", json={
        "identifier": "nonexistent_person_999@bharatmail.in",
        "password": "password123"
    })
    assert res.status_code == 404

def test_registration_and_protected_me_endpoint():
    """Verify registering a new customer, receiving JWT, and querying /auth/me."""
    import secrets
    rnd = secrets.token_hex(3)
    reg_payload = {
        "name": f"Aarav Patel {rnd}",
        "phone": f"+91 99999 {rnd}",
        "email": f"aarav_{rnd}@bharatmail.in",
        "password": "myPlainPassword2026",
        "monthly_income": 65000,
        "language": "hi",
        "city": "Ahmedabad",
        "state": "Gujarat"
    }

    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201, res.text
    reg_data = res.json()
    assert reg_data["success"] is True
    assert "access_token" in reg_data
    token = reg_data["access_token"]
    cust_id = reg_data["customer_id"]
    assert cust_id.startswith("cust_bharat_")

    # Login immediately with new user credentials
    login_res = client.post("/api/v1/auth/login", json={
        "identifier": reg_payload["email"],
        "password": "myPlainPassword2026"
    })
    assert login_res.status_code == 200
    assert login_res.json()["customer_id"] == cust_id

    # Call protected /auth/me endpoint with Bearer JWT
    me_res = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert me_res.status_code == 200, me_res.text
    me_data = me_res.json()
    assert me_data["authenticated"] is True
    assert me_data["customer_id"] == cust_id
    assert me_data["name"] == reg_payload["name"]

def test_protected_me_without_or_invalid_jwt():
    """Verify 401 without valid JWT."""
    # No auth header
    res_none = client.get("/api/v1/auth/me")
    assert res_none.status_code == 401

    # Fake/tampered auth header
    res_fake = client.get("/api/v1/auth/me", headers={
        "Authorization": "Bearer fake.jwt.signature"
    })
    assert res_fake.status_code == 401