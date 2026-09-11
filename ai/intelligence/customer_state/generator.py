from typing import Dict, Any, List
from ai.intelligence.signals.detector import SignalDetector
from ai.intelligence.recommendations.ranker import RecommendationRanker

class CustomerStateGenerator:
    """Combines features, signals, and ethical rankings into CustomerState."""

    @staticmethod
    def generate(scenario_data: Dict[str, Any], features: Dict[str, Any]) -> Dict[str, Any]:
        signals = SignalDetector.detect(scenario_data, features)
        scenario_name = scenario_data.get("name", "normal")

        # Determine financial health
        if signals.get("stress_alert") or scenario_name == "financial-stress":
            health = "stress"
            state_type = "financial_stress"
        elif signals.get("medical_surge") or scenario_name == "life-change":
            health = "tight"
            state_type = "medical_event"
        elif signals.get("savings_trend") == "positive":
            health = "thriving"
            state_type = "surplus"
        else:
            health = "stable"
            state_type = "normal"

        recommendations = RecommendationRanker.rank(signals, health)

        return {
            "customer_id": scenario_data.get("customer_id", "cust_bharat_001"),
            "customer_name": "Rahul Sharma",
            "state_type": state_type,
            "financial_health": health,
            "signals": signals,
            "life_stage": ["early_career", "metro_commuter", "home_owner"],
            "balance": scenario_data.get("balance", {"available": 42680, "savings": 185000, "currency": "INR"}),
            "recommendations": recommendations,
        }
