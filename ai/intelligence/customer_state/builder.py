"""CustomerState builder synthesizing features, signals, ethical rankings, and balances."""

from __future__ import annotations
from typing import Dict, Any, List, Optional
from ai.intelligence.signals.detector import SignalDetector
from ai.intelligence.customer_state.models import CustomerStateModel, FinancialHealth, StateType, BalanceModel
from ai.intelligence.features.forecaster import PredictiveCashFlowEngine
from ai.intelligence.personalization.cryptoledger import CryptographicDecisionChain


class CustomerStateBuilder:
    """Builds a validated CustomerState dictionary strictly conforming to contracts/customer-state.schema.json."""

    @classmethod
    def determine_financial_health(cls, signals: Dict[str, Any], scenario_name: str) -> str:
        """Deterministically evaluates health into thriving, stable, tight, or stress based on signals & context."""
        norm_name = scenario_name.lower().replace("_", "-")
        anomaly = signals.get("anomaly_score", 0)

        # 1. Fraud Alert retains stable baseline financial health while addressing security
        if norm_name in ["fraud-alert", "fraud-anomaly"] or anomaly > 80:
            return "stable"

        # 2. Debt strain / stress
        dti = float(signals.get("debt_to_income_ratio", 0.0))
        emi_pressure = signals.get("emi_pressure", "low")
        if norm_name == "financial-stress" or signals.get("stress_alert") or (dti > 0.45 and signals.get("savings_trend") == "negative"):
            return "stress"

        # 3. Medical surge / lifecycle shock
        if norm_name in ["life-change", "medical-event", "medical-emergency"] or signals.get("medical_surge"):
            return "tight"

        # 4. Wealth surplus
        if norm_name in ["surplus", "wealth-surplus"]:
            return "thriving"

        # 5. Normal commuter / general
        if norm_name in ["normal", "commuter-normal"]:
            return "stable"

        # 6. Comprehensive signal-driven evaluation for real production customer profiles
        if dti > 0.40 or emi_pressure == "high" or signals.get("savings_trend") == "negative":
            return "tight"
        if signals.get("savings_trend") == "positive" and dti < 0.25:
            return "thriving"

        return "stable"

    @classmethod
    def determine_state_type(cls, signals: Dict[str, Any], health: str, scenario_name: str) -> str:
        """Determines macro state type for UI layout composition."""
        norm_name = scenario_name.lower().replace("_", "-")
        if signals.get("anomaly_score", 0) > 80 or signals.get("fraud_alert_detected") or norm_name in ["fraud-alert", "fraud-anomaly"]:
            return "fraud_alert"
        if health == "stress" or norm_name == "financial-stress":
            return "financial_stress"
        if signals.get("medical_surge") or norm_name in ["life-change", "medical-event", "medical-emergency"]:
            return "medical_event"
        if health == "thriving" or norm_name in ["surplus", "wealth-surplus"]:
            return "surplus"
        return "normal"

    @classmethod
    def build(cls, scenario_data: Dict[str, Any], features: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesizes customer state, validates contract, and returns JSON-serializable dict."""
        scenario_name = scenario_data.get("name", "normal")
        signals = SignalDetector.detect(scenario_data, features)

        health = cls.determine_financial_health(signals, scenario_name)
        state_type = cls.determine_state_type(signals, health, scenario_name)

        # Dynamic life stage tags
        life_stages = scenario_data.get("life_stage") or signals.get("derived_life_stage") or ["early_career", "metro_commuter", "home_owner"]

        # Balance normalization supporting both scenario 'balance' and customer 'accounts'
        raw_bal = scenario_data.get("balance") or {}
        raw_acc = scenario_data.get("accounts") or {}
        if isinstance(raw_bal, dict) and "available" in raw_bal:
            available_bal = float(raw_bal.get("available", 42680.0))
            savings_bal = float(raw_bal.get("savings", 185000.0))
            currency = str(raw_bal.get("currency", "INR"))
        elif isinstance(raw_acc, dict) and "available_balance" in raw_acc:
            available_bal = float(raw_acc.get("available_balance", 42680.0))
            savings_bal = float(raw_acc.get("savings_reserve", 185000.0))
            currency = "INR"
        else:
            available_bal = 42680.0
            savings_bal = 185000.0
            currency = "INR"

        # High-dimensional Personalization Engine execution
        from ai.intelligence.personalization.engine import PersonalizationEngine
        personalization_result = PersonalizationEngine.evaluate(
            customer_data=scenario_data,
            features=features,
            signals=signals,
            health=health
        )

        recommendations = personalization_result.get("top_5_recommendations", personalization_result["active_recommendations"][:5])
        confidence_score = personalization_result["confidence_score"]
        archetype = personalization_result["archetype"]
        audit_trail = personalization_result["audit_trail"]

        # Compute forward cash-flow forecast & safe-to-spend headroom
        monthly_inc = float(scenario_data.get("monthly_income") or scenario_data.get("declared_monthly_income", 0.0) or 50000.0)
        raw_txs = scenario_data.get("transactions") or scenario_data.get("cleaned_transactions") or []
        cash_flow_forecast = PredictiveCashFlowEngine.forecast(
            available_balance=available_bal,
            monthly_income=monthly_inc,
            transactions=raw_txs
        )

        # Enrich signals with forward cash-flow intelligence
        signals["safe_to_spend_today"] = cash_flow_forecast.safe_to_spend_today
        signals["upcoming_15d_obligations"] = cash_flow_forecast.upcoming_15d_obligations
        signals["liquidity_runway_days"] = cash_flow_forecast.liquidity_runway_days
        signals["deficit_predicted"] = cash_flow_forecast.deficit_predicted
        if cash_flow_forecast.deficit_predicted:
            signals["deficit_date"] = cash_flow_forecast.deficit_date
            signals["deficit_amount"] = cash_flow_forecast.deficit_amount

        # Enrich signals with personalization indicators
        signals["confidence_score"] = confidence_score
        signals["bharat_archetype"] = archetype["id"]
        signals["bharat_archetype_name"] = archetype["name"]
        signals["total_audited_decisions"] = len(audit_trail)

        # Identity resolution (supports real customer records and scenarios)
        customer_id = str(scenario_data.get("customer_id") or scenario_data.get("id") or "cust_bharat_001")
        name_val = scenario_data.get("customer_name")
        if not name_val:
            cand = scenario_data.get("name")
            scenario_slugs = {
                "normal", "life-change", "financial-stress", "medical_event",
                "fraud_alert", "surplus", "wealth_surplus", "fraud_anomaly",
                "commuter_normal", "medical_emergency"
            }
            if cand and str(cand).lower() not in scenario_slugs:
                name_val = cand
        customer_name = str(name_val or "Rahul Sharma")

        # Construct dictionary adhering strictly to contracts/customer-state.schema.json
        state_dict: Dict[str, Any] = {
            "customer_id": customer_id,
            "customer_name": customer_name,
            "state_type": state_type,
            "financial_health": health,
            "signals": signals,
            "life_stage": life_stages,
            "balance": {
                "available": available_bal,
                "savings": savings_bal,
                "currency": currency,
            },
            "recommendations": recommendations,
        }

        # Enrich signals with category spend allocation
        if "budget_allocation_50_30_20" in features:
            signals["budget_allocation_50_30_20"] = features["budget_allocation_50_30_20"]

        # Validate with Pydantic domain model for runtime safety
        validated_model = CustomerStateModel(**state_dict)
        state_out = validated_model.model_dump(mode="json")

        # Build tamper-evident cryptographic decision chain (RBI & DPDP non-repudiation)
        crypto_chain = CryptographicDecisionChain.build_chain(audit_trail)
        _, verification_msg = CryptographicDecisionChain.verify_chain_integrity(crypto_chain)

        # Attach rich personalization metadata for auditability
        state_out["cash_flow_forecast"] = cash_flow_forecast.model_dump(mode="json")
        if "category_spend_profile" in features:
            state_out["spend_profile"] = features["category_spend_profile"]

        state_out["personalization"] = {
            "confidence_score": confidence_score,
            "archetype": archetype,
            "top_5_recommendations": recommendations,
            "all_active_recommendations": personalization_result["active_recommendations"],
            "suppressed_recommendations": personalization_result["suppressed_recommendations"],
            "audit_trail": audit_trail,
            "cryptographic_ledger": [b.model_dump(mode="json") for b in crypto_chain],
            "cryptographic_verification": verification_msg,
            "why_not_transparency_cards": [b.customer_plain_explanation for b in crypto_chain if b.decision == "SUPPRESS"],
            "compliance_summary": personalization_result["compliance_summary"]
        }
        if "sanitization_audit" in scenario_data:
            state_out["personalization"]["sanitization_audit"] = scenario_data["sanitization_audit"]

        return state_out
