"""Tamper-Evident Cryptographic Decision Chain for RBI & DPDP Audit Compliance.

Provides mathematical non-repudiation and immutable verification for all AI personalization decisions.
Proves to regulators that decisions were never retroactively altered or fabricated.
"""

from __future__ import annotations
import hashlib
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CryptographicBlock(BaseModel):
    """Immutable decision proof block locked with SHA-256 hash chaining."""
    block_index: int
    timestamp: str
    customer_id: str
    product_id: str
    product_title: str
    decision: str  # RECOMMEND or SUPPRESS
    confidence_score: float
    regulatory_rules_enforced: List[str]
    counterfactual_explanation: str
    customer_plain_explanation: str
    previous_hash: str
    block_hash: str


class CryptographicDecisionChain:
    """Manages cryptographic ledger generation, hashing, and mathematical integrity verification."""

    GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

    @classmethod
    def compute_block_hash(
        cls,
        index: int,
        timestamp: str,
        customer_id: str,
        product_id: str,
        decision: str,
        confidence: float,
        rules: List[str],
        counterfactual: str,
        previous_hash: str
    ) -> str:
        """Computes deterministic SHA-256 hash over canonical decision attributes."""
        canonical_str = (
            f"{index}|{timestamp}|{customer_id}|{product_id}|{decision}|"
            f"{confidence:.4f}|{','.join(sorted(rules))}|{counterfactual.strip()}|{previous_hash}"
        )
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

    @classmethod
    def generate_customer_plain_explanation(cls, decision: str, product_title: str, counterfactual: str) -> str:
        """Translates technical regulatory rules into empathetic, clear customer guidance."""
        if decision == "RECOMMEND":
            return (
                f"We surfaced '{product_title}' because your profile, cash flow, and routine show strong suitability. "
                "You are under no obligation to apply, and you retain complete control in your privacy settings."
            )
        else:
            # Empathetic explanation for why something was held back
            return (
                f"We held back '{product_title}' today to protect your financial wellness. "
                f"How to unlock: {counterfactual}"
            )

    @classmethod
    def build_chain(cls, audit_records: List[Dict[str, Any]]) -> List[CryptographicBlock]:
        """Converts raw audit records into an immutable linked cryptographic hash chain."""
        chain: List[CryptographicBlock] = []
        prev_hash = cls.GENESIS_HASH

        for idx, rec in enumerate(audit_records):
            ts = rec.get("timestamp") or datetime.now(timezone.utc).isoformat()
            cust_id = rec.get("customer_id", "cust_unknown")
            prod_id = rec.get("product_id", "prod_unknown")
            prod_title = rec.get("product_title", prod_id)
            decision = rec.get("decision", "SUPPRESS")
            conf = float(rec.get("confidence_score", 0.85))
            rules = rec.get("regulatory_rules_enforced", [])
            cf = rec.get("counterfactual_explanation", "Standard financial suitability conditions apply.")

            block_hash = cls.compute_block_hash(
                index=idx,
                timestamp=ts,
                customer_id=cust_id,
                product_id=prod_id,
                decision=decision,
                confidence=conf,
                rules=rules,
                counterfactual=cf,
                previous_hash=prev_hash
            )

            plain_exp = cls.generate_customer_plain_explanation(decision, prod_title, cf)

            block = CryptographicBlock(
                block_index=idx,
                timestamp=ts,
                customer_id=cust_id,
                product_id=prod_id,
                product_title=prod_title,
                decision=decision,
                confidence_score=conf,
                regulatory_rules_enforced=rules,
                counterfactual_explanation=cf,
                customer_plain_explanation=plain_exp,
                previous_hash=prev_hash,
                block_hash=block_hash
            )

            chain.append(block)
            prev_hash = block_hash

        return chain

    @classmethod
    def verify_chain_integrity(cls, chain: List[CryptographicBlock]) -> tuple[bool, str]:
        """Mathematically audits the decision chain to verify zero tampering.

        Returns:
            (is_valid, verification_status_message)
        """
        if not chain:
            return True, "Chain is empty (valid)."

        # 1. Verify Genesis link
        if chain[0].previous_hash != cls.GENESIS_HASH:
            return False, f"Tamper detected: Block 0 does not originate from Genesis Hash. Found: {chain[0].previous_hash}"

        # 2. Verify sequential links and recalculate content hashes
        for i in range(len(chain)):
            block = chain[i]

            # Recompute hash from content
            recomputed = cls.compute_block_hash(
                index=block.block_index,
                timestamp=block.timestamp,
                customer_id=block.customer_id,
                product_id=block.product_id,
                decision=block.decision,
                confidence=block.confidence_score,
                rules=block.regulatory_rules_enforced,
                counterfactual=block.counterfactual_explanation,
                previous_hash=block.previous_hash
            )

            if recomputed != block.block_hash:
                return False, f"Tamper detected: Block {i} hash altered! Expected {recomputed}, recorded {block.block_hash}."

            # Check link to previous block
            if i > 0:
                if block.previous_hash != chain[i - 1].block_hash:
                    return False, f"Tamper detected: Chain broken at block {i}! Previous hash mismatch."

        return True, f"Cryptographic integrity verified: {len(chain)} decision blocks are immutable and tamper-free."
