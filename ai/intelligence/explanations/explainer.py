"""Transparent explainability engine generating human and machine readable rationales."""

from __future__ import annotations
from typing import Dict, Any, List


class Explainer:
    """Generates natural language and structured explainability for UI actions and audits."""

    @staticmethod
    def explain(card_id: str, signals: Dict[str, Any]) -> str:
        """Returns concise natural-language justification for display cards."""
        cid = card_id.lower()
        if "fraud" in cid:
            merchant = signals.get("unfamiliar_merchant", "an unfamiliar merchant")
            return f"Surfaced because transaction timing and merchant ({merchant}) deviates significantly from your profile."
        if "medical" in cid or "hospital" in cid:
            med_amt = signals.get("medical_amount", 48200)
            return f"Surfaced because a non-routine hospital bill (₹{int(med_amt):,}) was debited. Empathy and claim filing are prioritized."
        if "cashflow" in cid or "stress" in cid or "commitments" in cid:
            obs = signals.get("upcoming_obligations", 34200)
            return f"Surfaced because upcoming obligations (₹{int(obs):,}) exceed liquid buffer. Credit offers are actively suppressed."
        if "commute" in cid or "metro" in cid:
            time = signals.get("commute_typical_time", "08:40 AM")
            merchant = signals.get("commute_merchant", "Delhi Metro Smart Card")
            return f"Surfaced because you make weekday {merchant} payments around {time}."
        if "savings" in cid or "fd" in cid or "surplus" in cid:
            return "Surfaced because your available cash buffer is well above historical monthly burn rate."
        return "Surfaced based on your current cash-flow health and recent account activity."

    @classmethod
    def explain_structured(cls, action_id: str, signals: Dict[str, Any], health: str = "stable") -> Dict[str, Any]:
        """Returns structured explainability record adhering to Ubaid AI Implementation Section 10."""
        aid = action_id.lower()
        if "fraud" in aid:
            return {
                "action": "fraud_security_lock",
                "score": 0.98,
                "decision": "prioritize",
                "reasons": [
                  "transaction timing (02:14 AM) deviates from baseline",
                  "unfamiliar gaming merchant outside domestic profile",
                  "high anomaly score (>80)"
                ]
            }
        if "medical" in aid:
            return {
                "action": "medical_claim_assistance",
                "score": 0.95,
                "decision": "prioritize",
                "reasons": [
                  "sudden non-routine healthcare outlay detected",
                  "hospital debit ₹48,200",
                  "insurance claim window active"
                ]
            }
        if "personal_loan" in aid or "credit" in aid:
            if health in ["stress", "tight"] or signals.get("stress_alert"):
                return {
                    "action": "personal_loan",
                    "decision": "deprioritize",
                    "reasons": [
                      "savings trend declining or negative",
                      "EMI pressure elevated (>0.40 DTI)",
                      "RBI fair-practice ethical guardrail active"
                    ]
                }
            return {
                "action": "personal_loan",
                "score": 0.70,
                "decision": "eligible",
                "reasons": [
                  "stable corporate salary credit",
                  "healthy credit score"
                ]
            }
        if "commute" in aid or "metro" in aid:
            return {
                "action": "fastag_metro_quickpay",
                "score": 0.90,
                "decision": "prioritize",
                "reasons": [
                  "high weekday transport activity detected",
                  "regular morning transit commute habit"
                ]
            }
        return {
            "action": action_id,
            "score": 0.80,
            "decision": "prioritize",
            "reasons": [
              "account activity and cash-flow health match eligibility"
            ]
        }
