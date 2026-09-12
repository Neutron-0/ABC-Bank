"""Lifecycle and contextual shock signal evaluation (medical shock, relocation, asset purchases)."""

from __future__ import annotations
from typing import Dict, Any, List


class LifecycleSignalDetector:
    """Detects life events, health shocks, and macro lifestyle transitions."""

    @staticmethod
    def evaluate(scenario_signals: Dict[str, Any], features: Dict[str, Any]) -> Dict[str, Any]:
        signals: Dict[str, Any] = {}

        # 1. Medical event detection
        is_medical = bool(scenario_signals.get("medical_event_detected"))
        hospital = scenario_signals.get("hospital")
        med_amt = scenario_signals.get("medical_amount")

        # Infer from transaction metrics if not explicitly in scenario
        if not is_medical:
            largest_cat = features.get("largest_debit_category", "")
            largest_merchant = features.get("largest_debit_merchant", "")
            largest_amt = features.get("largest_debit_amount", 0.0)
            if largest_cat == "healthcare" or "hospital" in largest_merchant.lower():
                is_medical = True
                hospital = largest_merchant
                med_amt = largest_amt

        if is_medical:
            signals["medical_surge"] = True
            signals["medical_event_detected"] = True
            signals["medical_hospital"] = hospital or "Max Super Speciality Hospital"
            signals["medical_amount"] = float(med_amt or 48200)
            signals["recurring_expense_change"] = "high"
        else:
            signals["medical_surge"] = False

        # 2. General life context transitions
        if scenario_signals.get("transport_change") == "medium":
            signals["transport_change"] = "medium"

        # 3. Dynamic life stage inference
        life_stages: List[str] = ["early_career"]
        if features.get("commute_detected") or scenario_signals.get("metro_usage") == "high":
            life_stages.append("metro_commuter")
        if features.get("emi_spend", 0.0) > 10000.0 or scenario_signals.get("emi_pressure") in ["medium", "high"]:
            life_stages.append("home_loan_borrower")
        if signals.get("medical_surge"):
            life_stages.append("caregiver_active")
        if features.get("savings_momentum") == "positive":
            life_stages.append("wealth_builder")

        signals["derived_life_stage"] = life_stages
        return signals
