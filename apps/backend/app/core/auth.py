import os
import json
import hmac
import hashlib
import base64
import time
from typing import Dict, Any, Optional
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = os.getenv("JWT_SECRET", "bharat_adaptive_banking_jwt_secret_key_2026")
JWT_ALGORITHM = "HS256"
DEFAULT_EXPIRATION_SECONDS = 7 * 24 * 3600  # 7 days

security_bearer = HTTPBearer(auto_error=False)

def _base64url_encode(data: bytes) -> str:
    """Encodes bytes into URL-safe base64 without padding."""
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

def _base64url_decode(data_str: str) -> bytes:
    """Decodes URL-safe base64 string handling missing padding."""
    rem = len(data_str) % 4
    if rem > 0:
        data_str += "=" * (4 - rem)
    return base64.urlsafe_b64decode(data_str.encode("utf-8"))

def create_access_token(payload: Dict[str, Any], expires_in: int = DEFAULT_EXPIRATION_SECONDS) -> str:
    """
    Creates an RFC 7519 compliant HS256 JWT access token.
    Standard claims:
      - sub: Customer ID
      - iat: Issued at timestamp
      - exp: Expiration timestamp
    """
    now = int(time.time())
    token_claims = {
        **payload,
        "iat": now,
        "exp": now + expires_in
    }
    header = {
        "alg": JWT_ALGORITHM,
        "typ": "JWT"
    }

    header_b64 = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _base64url_encode(json.dumps(token_claims, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")

    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_access_token(token: str) -> Dict[str, Any]:
    """
    Verifies token structure, signature and expiration.
    Returns the decoded token claims dictionary.
    Raises ValueError on invalid token or expired token.
    """
    parts = token.strip().split(".")
    if len(parts) != 3:
        raise ValueError("Malformed JWT token structure")

    header_b64, payload_b64, sig_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    expected_sig_b64 = _base64url_encode(expected_sig)

    if not hmac.compare_digest(sig_b64, expected_sig_b64):
        raise ValueError("Invalid JWT token signature")

    try:
        payload_json = _base64url_decode(payload_b64).decode("utf-8")
        claims = json.loads(payload_json)
    except Exception as e:
        raise ValueError(f"Invalid JWT token payload: {e}")

    now = int(time.time())
    if "exp" in claims and claims["exp"] < now:
        raise ValueError("JWT token has expired")

    return claims

def get_current_customer_claims(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> Dict[str, Any]:
    """FastAPI dependency to extract claims from Bearer token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    try:
        return verify_access_token(credentials.credentials)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(ve)}",
            headers={"WWW-Authenticate": "Bearer"}
        )