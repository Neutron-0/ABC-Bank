"""Unit tests for Cryptographic Tamper-Evident Decision Chain and Proof Integrity."""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from ai.intelligence.personalization.cryptoledger import CryptographicDecisionChain, CryptographicBlock


def test_cryptographic_chain_creation_and_integrity_verification():
    """Verify that decision chain builds sequential SHA-256 blocks with full mathematical integrity."""
    audit_records = [
        {
            "timestamp": "2026-01-12T10:00:00Z",
            "customer_id": "cust_001",
            "product_id": "rec_commute_metro",
            "product_title": "Morning Metro Quick Pay",
            "decision": "RECOMMEND",
            "confidence_score": 0.92,
            "regulatory_rules_enforced": ["RBI_DATA_LOCALIZATION_CIRCULAR_2018"],
            "counterfactual_explanation": "Decision would be suppressed if debt pressure exceeds 0.40 DTI."
        },
        {
            "timestamp": "2026-01-12T10:00:01Z",
            "customer_id": "cust_001",
            "product_id": "rec_personal_loan",
            "product_title": "Personal Loan",
            "decision": "SUPPRESS",
            "confidence_score": 0.92,
            "regulatory_rules_enforced": ["RBI_FAIR_PRACTICES_CODE_DISTRESS_SHIELD", "RBI_DL_2022_DTI_40_CAP"],
            "counterfactual_explanation": "DTI must reduce below 0.40 and health must return to stable."
        }
    ]

    chain = CryptographicDecisionChain.build_chain(audit_records)
    assert len(chain) == 2

    # Block 0 must link to Genesis Hash
    assert chain[0].previous_hash == CryptographicDecisionChain.GENESIS_HASH
    assert len(chain[0].block_hash) == 64  # SHA-256 hex length

    # Block 1 must link to Block 0's hash
    assert chain[1].previous_hash == chain[0].block_hash
    assert len(chain[1].block_hash) == 64

    # Verify mathematical integrity
    is_valid, msg = CryptographicDecisionChain.verify_chain_integrity(chain)
    assert is_valid is True
    assert "Cryptographic integrity verified" in msg


def test_tamper_detection_in_cryptographic_ledger():
    """Verify that tampering with any block attribute immediately breaks mathematical verification."""
    audit_records = [
        {
            "timestamp": "2026-01-12T10:00:00Z",
            "customer_id": "cust_001",
            "product_id": "rec_personal_loan",
            "product_title": "Personal Loan",
            "decision": "SUPPRESS",
            "confidence_score": 0.88,
            "regulatory_rules_enforced": ["RBI_DL_2022_DTI_40_CAP"],
            "counterfactual_explanation": "DTI must reduce below 0.40."
        }
    ]

    chain = CryptographicDecisionChain.build_chain(audit_records)
    assert CryptographicDecisionChain.verify_chain_integrity(chain)[0] is True

    # Malicious insider tampers with decision from SUPPRESS to RECOMMEND
    tampered_block = CryptographicBlock(
        block_index=chain[0].block_index,
        timestamp=chain[0].timestamp,
        customer_id=chain[0].customer_id,
        product_id=chain[0].product_id,
        product_title=chain[0].product_title,
        decision="RECOMMEND",  # TAMPERED!
        confidence_score=chain[0].confidence_score,
        regulatory_rules_enforced=chain[0].regulatory_rules_enforced,
        counterfactual_explanation=chain[0].counterfactual_explanation,
        customer_plain_explanation=chain[0].customer_plain_explanation,
        previous_hash=chain[0].previous_hash,
        block_hash=chain[0].block_hash  # Old hash kept to attempt forgery
    )

    tampered_chain = [tampered_block]
    is_valid, err_msg = CryptographicDecisionChain.verify_chain_integrity(tampered_chain)

    assert is_valid is False
    assert "Tamper detected" in err_msg
    assert "hash altered" in err_msg


def test_plain_language_customer_explanation_cards():
    """Verify that regulatory rules generate clear, empathetic plain-language cards for customers."""
    audit_records = [
        {
            "product_title": "Pre-Approved Loan",
            "decision": "SUPPRESS",
            "counterfactual_explanation": "Your debt-to-income ratio must reduce below 40%."
        }
    ]

    chain = CryptographicDecisionChain.build_chain(audit_records)
    card = chain[0].customer_plain_explanation

    assert "We held back 'Pre-Approved Loan' today to protect your financial wellness" in card
    assert "How to unlock: Your debt-to-income ratio must reduce below 40%" in card
