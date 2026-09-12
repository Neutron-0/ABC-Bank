"""Financial health signal evaluation: savings trends, income stability, and debt pressure."""

from __future__ import annotations
from typing import Dict, Any


class FinancialSignalDetector:
    """Evaluates customer cash-flow stability, savings momentum, and debt burden."""

    @staticmethod
    def evaluate(scenario_signals: Dict[str, Any], features: Dict[str, Any], balance: Dict[str, Any]) -> Dict[str, Any]:
        signals: Dict[str, Any] = {}

        # 1. Savings trend evaluation
        trend_from_features = features.get("savings_momentum", "neutral")
        trend_from_scenario = scenario_signals.get("savings_trend")
        effective_trend = trend_from_scenario or trend_from_features
        signals["savings_trend"] = effective_trend

        # 2. Debt pressure and DTI
        dti = features.get("dti_ratio", 0.0)
        scenario_dti = scenario_signals.get("debt_to_income_ratio")
        effective_dti = scenario_dti if scenario_dti is not None else dti

        scenario_emi_pressure = scenario_signals.get("emi_pressure")
        if effective_dti > 0.45 or scenario_emi_pressure == "high":
            emi_pressure = "high"
        elif effective_dti > 0.25 or scenario_emi_pressure == "medium":
            emi_pressure = "medium"
        else:
            emi_pressure = "low"

        signals["emi_pressure"] = emi_pressure
        signals["debt_to_income_ratio"] = effective_dti

        # 3. Income stability
        inc_stability = scenario_signals.get("income_stability")
        if inc_stability is not None:
            signals["income_stability"] = float(inc_stability)
        else:
            # Derived from salary detection
            has_salary = features.get("spending_metrics", {}).get("estimated_monthly_income", 0) > 0
            signals["income_stability"] = 0.92 if has_salary else 0.55

        # 4. Spending volatility & obligations
        volatility = scenario_signals.get("spending_volatility") or features.get("spending_volatility", "low")
        signals["spending_volatility"] = volatility

        upcoming_obs = scenario_signals.get("upcoming_obligations")
        if upcoming_obs is None:
            upcoming_obs = features.get("spending_metrics", {}).get("emi_spend", 0.0) + 5000.0
        signals["upcoming_obligations"] = float(upcoming_obs)

        # 5. Liquid buffer & cash runway check
        avail = float(balance.get("available", 42680))
        savings_bal = float(balance.get("savings", 185000))
        burn = float(features.get("burn_rate", 30000))
        buffer_months = round(avail / burn, 2) if burn > 0 else 2.0
        runway_days = int(buffer_months * 30)
        signals["liquid_buffer_months"] = buffer_months
        signals["runway_days"] = runway_days
        signals["emergency_fund_months"] = round(savings_bal / burn, 1) if burn > 0 else 6.0

        est_income = float(features.get("spending_metrics", {}).get("estimated_monthly_income", 75000.0))
        signals["net_cash_flow_monthly"] = round(est_income - burn, 2)

        # 6. Multi-Factor Financial Resilience Scoring Model (0 to 100)
        # Pillar 1: Liquid Runway (25 pts)
        if buffer_months >= 3.0:
            runway_pts = 25.0
        elif buffer_months >= 1.5:
            runway_pts = 20.0
        elif buffer_months >= 0.75:
            runway_pts = 12.0
        elif buffer_months >= 0.3:
            runway_pts = 6.0
        else:
            runway_pts = 2.0

        # Pillar 2: Debt-to-Income Discipline (25 pts)
        if effective_dti <= 0.15:
            dti_pts = 25.0
        elif effective_dti <= 0.25:
            dti_pts = 20.0
        elif effective_dti <= 0.35:
            dti_pts = 14.0
        elif effective_dti <= 0.45:
            dti_pts = 7.0
        else:
            dti_pts = 0.0

        # Pillar 3: Emergency Fund & Savings Reserve (25 pts)
        ideal_emergency = burn * 6 if burn > 0 else 100000.0
        savings_ratio = round(savings_bal / ideal_emergency, 2) if ideal_emergency > 0 else 1.0
        if savings_ratio >= 1.0:
            savings_pts = 25.0
        elif savings_ratio >= 0.5:
            savings_pts = 18.0
        elif savings_ratio >= 0.2:
            savings_pts = 10.0
        else:
            savings_pts = 4.0

        # Pillar 4: Volatility & Trend Stability (25 pts)
        if volatility == "low":
            vol_pts = 22.0
        elif volatility == "medium":
            vol_pts = 14.0
        else:
            vol_pts = 5.0

        if effective_trend == "positive":
            vol_pts = min(25.0, vol_pts + 3.0)
        elif effective_trend == "negative":
            vol_pts = max(0.0, vol_pts - 4.0)

        health_score = int(round(runway_pts + dti_pts + savings_pts + vol_pts))
        signals["financial_health_score"] = max(5, min(100, health_score))

        return signals
