from typing import List, Dict, Any

class RecommendationRanker:
    """Ranks recommendations with strict ethical constraints and anti-predatory loan suppression."""

    @staticmethod
    def rank(signals: Dict[str, Any], health: str) -> List[Dict[str, Any]]:
        recommendations = []

        # Urgent Fraud / Anomaly Protection
        if signals.get("anomaly_score", 0) > 80:
            recommendations.append({
                "id": "rec_fraud_guard",
                "category": "security",
                "title": "Unusual ₹31,800 Debit Detected",
                "reason": "Anomalous early morning international charge at unfamiliar merchant.",
                "priority": 100,
                "suppressed": False
            })

        # Large Medical Surge (Empathy first)
        if signals.get("medical_surge"):
            recommendations.append({
                "id": "rec_medical_claim",
                "category": "healthcare",
                "title": "Hospital Reimbursement & Bill Assistance",
                "reason": f"Detected ₹{signals.get('medical_amount', 48200):,} hospital debit. Claim assistance prioritized.",
                "priority": 95,
                "suppressed": False
            })

        # Financial Stress Guidance
        if health == "stress" or signals.get("stress_alert"):
            recommendations.append({
                "id": "rec_cashflow_guidance",
                "category": "guidance",
                "title": "Cash Flow Looks Tighter Than Usual",
                "reason": "Upcoming commitments are higher than available buffer. 1-tap subscription trimming offered.",
                "priority": 92,
                "suppressed": False
            })

            # ETHICAL RULE: SUPPRESS LOAN PROMOTIONS DURING FINANCIAL STRAIN
            recommendations.append({
                "id": "rec_personal_loan",
                "category": "credit",
                "title": "Pre-Approved Personal Loan",
                "reason": "Suppressed due to ethical anti-predatory guardrail.",
                "priority": 0,
                "suppressed": True
            })

        # Commute Shortcut
        if signals.get("commute_habit_detected") and health != "stress":
            recommendations.append({
                "id": "rec_commute_metro",
                "category": "transport",
                "title": "🚇 Morning Metro Quick Pay",
                "reason": "Routine 8:40 AM weekday commute pattern detected.",
                "priority": 90,
                "suppressed": False
            })

        # Surplus Growth
        if health == "thriving" or signals.get("savings_trend") == "positive":
            recommendations.append({
                "id": "rec_smart_savings",
                "category": "savings",
                "title": "Put Surplus Cash into 7.85% Smart FD",
                "reason": "Available balance is above historical 30-day baseline.",
                "priority": 85,
                "suppressed": False
            })

        # Sort by priority descending (excluding suppressed)
        active = [r for r in recommendations if not r.get("suppressed")]
        active.sort(key=lambda x: x["priority"], reverse=True)
        return active
