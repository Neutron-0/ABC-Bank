"""Recommendation rules and candidate catalog for ethical adaptive banking."""

from __future__ import annotations
from typing import Dict, Any, List


class RecommendationRules:
    """Catalog of adaptive recommendation actions, criteria, and ethical constraints."""

    CATALOG = {
        "rec_fraud_guard": {
            "id": "rec_fraud_guard",
            "category": "security",
            "title": "Unusual ₹31,800 Debit Detected",
            "base_priority": 100,
            "condition": lambda sig, health: sig.get("anomaly_score", 0) > 80 or sig.get("fraud_alert_detected"),
            "ethical_suppression": False
        },
        "rec_medical_claim": {
            "id": "rec_medical_claim",
            "category": "healthcare",
            "title": "Hospital Reimbursement & Bill Assistance",
            "base_priority": 95,
            "condition": lambda sig, health: bool(sig.get("medical_surge") or sig.get("medical_event_detected")),
            "ethical_suppression": False
        },
        "rec_cashflow_guidance": {
            "id": "rec_cashflow_guidance",
            "category": "guidance",
            "title": "Cash Flow Looks Tighter Than Usual",
            "base_priority": 92,
            "condition": lambda sig, health: health in ["stress", "tight"] or sig.get("stress_alert"),
            "ethical_suppression": False
        },
        "rec_personal_loan": {
            "id": "rec_personal_loan",
            "category": "credit",
            "title": "Pre-Approved Personal Loan",
            "base_priority": 70,
            "condition": lambda sig, health: True,
            # Suppressed if customer is in financial strain
            "ethical_suppression": lambda sig, health: (
                health in ["stress", "tight"]
                or sig.get("stress_alert")
                or sig.get("emi_pressure") == "high"
                or sig.get("debt_to_income_ratio", 0.0) > 0.40
            )
        },
        "rec_commute_metro": {
            "id": "rec_commute_metro",
            "category": "transport",
            "title": "Morning Metro Quick Pay",
            "base_priority": 90,
            "condition": lambda sig, health: sig.get("commute_habit_detected") and health != "stress",
            "ethical_suppression": False
        },
        "rec_smart_savings": {
            "id": "rec_smart_savings",
            "category": "savings",
            "title": "Put Surplus Cash into 7.85% Smart FD",
            "base_priority": 85,
            "condition": lambda sig, health: health == "thriving" or sig.get("savings_trend") == "positive",
            "ethical_suppression": lambda sig, health: health in ["stress", "tight"] or sig.get("stress_alert")
        }
    }
