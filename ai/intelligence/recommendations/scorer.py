"""Recommendation scoring and dynamic priority calculation."""

from __future__ import annotations
from typing import Dict, Any, Optional


class RecommendationScorer:
    """Calculates prioritized scores and enforces anti-predatory suppression."""

    @staticmethod
    def score(action_def: Dict[str, Any], signals: Dict[str, Any], health: str) -> Optional[Dict[str, Any]]:
        action_id = action_def["id"]
        condition_fn = action_def.get("condition")

        # Check eligibility condition
        if condition_fn and not condition_fn(signals, health):
            return None

        # Check ethical suppression
        suppression_fn = action_def.get("ethical_suppression")
        is_suppressed = False
        if callable(suppression_fn):
            is_suppressed = bool(suppression_fn(signals, health))
        elif isinstance(suppression_fn, bool):
            is_suppressed = suppression_fn

        base_prio = action_def.get("base_priority", 50)
        title = action_def.get("title", "")
        category = action_def.get("category", "general")

        # Dynamic reason synthesis
        if action_id == "rec_fraud_guard":
            reason = "Anomalous early morning international charge at unfamiliar merchant."
            priority = 100
        elif action_id == "rec_medical_claim":
            med_amt = signals.get("medical_amount", 48200)
            reason = f"Detected ₹{int(med_amt):,} hospital debit. Claim assistance prioritized."
            priority = 95
        elif action_id == "rec_cashflow_guidance":
            reason = "Upcoming commitments are higher than available buffer. 1-tap subscription trimming offered."
            priority = 92
        elif action_id == "rec_personal_loan":
            if is_suppressed:
                reason = "Suppressed due to ethical anti-predatory guardrail: customer has elevated debt pressure."
                priority = 0
            else:
                reason = "Pre-approved based on prime credit score and regular salary credits."
                priority = base_prio
        elif action_id == "rec_commute_metro":
            typical_time = signals.get("commute_typical_time", "08:40 AM")
            reason = f"Routine {typical_time} weekday commute pattern detected."
            priority = 90
        elif action_id == "rec_smart_savings":
            if is_suppressed:
                reason = "Suppressed to preserve liquidity for near-term debt commitments."
                priority = 0
            else:
                reason = "Available balance is above historical 30-day baseline."
                priority = 85
        else:
            reason = "Surfaced based on account activity and cash-flow health."
            priority = base_prio

        if is_suppressed:
            priority = 0

        return {
            "id": action_id,
            "category": category,
            "title": title,
            "reason": reason,
            "priority": priority,
            "suppressed": is_suppressed,
        }
