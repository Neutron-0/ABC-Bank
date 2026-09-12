"""Risk, anomaly, and financial stress signal evaluation."""

from __future__ import annotations
from typing import Dict, Any


class RiskSignalDetector:
    """Evaluates behavioral anomalies, fraud alerts, and financial distress vulnerability."""

    @staticmethod
    def evaluate(scenario_signals: Dict[str, Any], features: Dict[str, Any], financial_signals: Dict[str, Any]) -> Dict[str, Any]:
        signals: Dict[str, Any] = {}

        # 1. Anomaly score evaluation
        anomaly_score = scenario_signals.get("anomaly_score")
        if anomaly_score is None:
            odd_cnt = features.get("odd_hours_count", 0)
            largest_cat = features.get("largest_debit_category", "")
            if odd_cnt > 0 and largest_cat in ["gaming", "international"]:
                anomaly_score = 88
            else:
                anomaly_score = 5
        signals["anomaly_score"] = int(anomaly_score)

        if anomaly_score > 80:
            signals["fraud_alert_detected"] = True
            signals["unusual_hour"] = scenario_signals.get("unusual_hour", True)
            signals["unfamiliar_merchant"] = scenario_signals.get("unfamiliar_merchant", "GlobalTech Gaming Dublin")
            signals["unusual_amount"] = scenario_signals.get("unusual_amount", 31800)
            signals["suppress_promotions"] = True
        else:
            signals["fraud_alert_detected"] = False

        # 2. Financial stress detection (high debt pressure + negative savings momentum)
        savings_trend = financial_signals.get("savings_trend", "neutral")
        emi_pressure = financial_signals.get("emi_pressure", "low")
        dti = financial_signals.get("debt_to_income_ratio", 0.0)

        is_stressed = (
            bool(scenario_signals.get("stress_alert", False))
            or (savings_trend == "negative" and emi_pressure == "high")
            or (dti > 0.45 and savings_trend == "negative")
        )

        signals["stress_alert"] = bool(is_stressed)
        if is_stressed:
            signals["suppress_promotions"] = True

        return signals
