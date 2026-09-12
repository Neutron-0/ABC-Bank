"""Behavioral signal detection: Commuter routines, UPI velocity, and subscription loads."""

from __future__ import annotations
from typing import Dict, Any


class BehavioralSignalDetector:
    """Evaluates everyday habitual behavior such as commute patterns and digital payment reliance."""

    @staticmethod
    def evaluate(scenario_signals: Dict[str, Any], features: Dict[str, Any]) -> Dict[str, Any]:
        signals: Dict[str, Any] = {}

        # Commute habit detection
        metro_freq = features.get("metro_frequency_30d", 0)
        scenario_metro = scenario_signals.get("metro_usage") == "high"
        commute_cluster = features.get("commute_detected", False)

        if metro_freq >= 2 or scenario_metro or commute_cluster:
            signals["commute_habit_detected"] = True
            signals["metro_usage"] = "high"
            signals["commute_merchant"] = features.get("commute_merchant", "Delhi Metro Smart Card")
            signals["commute_typical_time"] = features.get("commute_time", scenario_signals.get("commute_time", "08:40 AM"))
            signals["commute_typical_amount"] = features.get("commute_amount", 40)
        else:
            signals["commute_habit_detected"] = False
            signals["metro_usage"] = scenario_signals.get("metro_usage", "low")

        # UPI velocity
        debit_cnt = features.get("transaction_metrics", {}).get("debit_tx_count", 0)
        if debit_cnt > 10 or scenario_signals.get("upi_usage") == "high":
            signals["upi_usage"] = "high"
            signals["digital_native_score"] = 0.92
        else:
            signals["upi_usage"] = scenario_signals.get("upi_usage", "medium")
            signals["digital_native_score"] = 0.65

        # Subscriptions
        active_subs = scenario_signals.get("active_subscriptions", 0)
        if active_subs > 3:
            signals["subscription_load"] = "high"
            signals["active_subscriptions"] = active_subs
        else:
            signals["subscription_load"] = "normal"
            signals["active_subscriptions"] = active_subs

        return signals
