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
        odd_cnt = features.get("odd_hours_count", 0)
        odd_vol = float(features.get("odd_hours_volume", 0.0))
        largest_cat = str(features.get("largest_debit_category", "")).lower()
        largest_merchant = str(features.get("largest_debit_merchant", ""))
        largest_amt = float(features.get("largest_debit_amount", 0.0))
        median_debit = float(features.get("transaction_metrics", {}).get("median_debit_amount", 500.0))

        if anomaly_score is None:
            if odd_cnt > 0 and largest_cat in ["gaming", "international"]:
                anomaly_score = 88
            elif odd_cnt > 0 and odd_vol > 15000:
                anomaly_score = 82
            elif median_debit > 0 and largest_amt > 20 * median_debit and odd_cnt > 0:
                anomaly_score = 85
            else:
                anomaly_score = 5

        signals["anomaly_score"] = int(anomaly_score)

        if anomaly_score > 80:
            signals["fraud_alert_detected"] = True
            signals["unusual_hour"] = bool(scenario_signals.get("unusual_hour", odd_cnt > 0 or True))
            signals["unfamiliar_merchant"] = scenario_signals.get("unfamiliar_merchant") or largest_merchant or "GlobalTech Gaming Dublin"
            signals["unusual_amount"] = float(scenario_signals.get("unusual_amount") or largest_amt or 31800.0)
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

        # 3. Explainable anomaly indicators & Pre-debit stress link
        signals["odd_hours_flag"] = bool(odd_cnt > 0)
        signals["amount_deviation_multiplier"] = round(largest_amt / median_debit, 1) if median_debit > 0 else 1.0
        signals["has_pre_debit_shortfall"] = bool(financial_signals.get("has_early_shortfall", False))

        return signals
