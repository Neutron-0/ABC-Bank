"""Composable Signal Engine integrating behavioral, financial, lifecycle, and risk signals."""

from __future__ import annotations
from typing import Dict, Any
from ai.intelligence.signals.behavioral import BehavioralSignalDetector
from ai.intelligence.signals.financial import FinancialSignalDetector
from ai.intelligence.signals.lifecycle import LifecycleSignalDetector
from ai.intelligence.signals.risk import RiskSignalDetector


class SignalDetector:
    """Evaluates multi-dimensional features and scenario data into composable customer signals."""

    @classmethod
    def detect(cls, scenario_data: Dict[str, Any], features: Dict[str, Any]) -> Dict[str, Any]:
        scenario_signals = dict(scenario_data.get("signals", {}))
        balance = dict(scenario_data.get("balance", {"available": 42680, "savings": 185000, "currency": "INR"}))

        # 1. Behavioral Domain
        behavioral_signals = BehavioralSignalDetector.evaluate(scenario_signals, features)

        # 2. Financial Domain
        financial_signals = FinancialSignalDetector.evaluate(scenario_signals, features, balance)

        # 3. Lifecycle Domain
        lifecycle_signals = LifecycleSignalDetector.evaluate(scenario_signals, features)

        # 4. Risk Domain
        risk_signals = RiskSignalDetector.evaluate(scenario_signals, features, financial_signals)

        # Merge all signals with base scenario overrides
        unified_signals: Dict[str, Any] = {}
        unified_signals.update(scenario_signals)
        unified_signals.update(behavioral_signals)
        unified_signals.update(financial_signals)
        unified_signals.update(lifecycle_signals)
        unified_signals.update(risk_signals)

        # Canonical key enforcements for Harsh's Experience Composer
        if unified_signals.get("commute_habit_detected"):
            unified_signals["commute_merchant"] = unified_signals.get("commute_merchant", "Delhi Metro Smart Card")
            unified_signals["commute_typical_time"] = unified_signals.get("commute_typical_time", "08:40 AM")
            unified_signals["commute_typical_amount"] = unified_signals.get("commute_typical_amount", 40)

        if unified_signals.get("medical_surge"):
            unified_signals["medical_hospital"] = unified_signals.get("medical_hospital", "Max Super Speciality Hospital")
            unified_signals["medical_amount"] = unified_signals.get("medical_amount", 48200)

        return unified_signals
