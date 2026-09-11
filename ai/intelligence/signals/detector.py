from typing import Dict, Any

class SignalDetector:
    """Evaluates raw features into actionable life-stage and behavioural signals."""

    @staticmethod
    def detect(scenario_data: Dict[str, Any], features: Dict[str, Any]) -> Dict[str, Any]:
        signals = dict(scenario_data.get("signals", {}))

        # Commute habit detection
        if features.get("metro_frequency_30d", 0) > 10 or signals.get("metro_usage") == "high":
            signals["commute_habit_detected"] = True
            signals["commute_merchant"] = "Delhi Metro Smart Card"
            signals["commute_typical_time"] = "08:40 AM"
            signals["commute_typical_amount"] = 40

        # Medical surge detection
        if signals.get("medical_event_detected") or signals.get("recurring_expense_change") == "high":
            signals["medical_surge"] = True
            signals["medical_hospital"] = signals.get("hospital", "Max Super Speciality Hospital")
            signals["medical_amount"] = signals.get("medical_amount", 48200)

        # Financial stress detection
        if signals.get("savings_trend") == "negative" or signals.get("emi_pressure") == "high":
            signals["stress_alert"] = True
            signals["suppress_promotions"] = True

        return signals
