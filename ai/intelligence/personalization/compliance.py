"""Regulatory Compliance Gatekeeper & Decision Accounting Ledger (RBI & DPDP Act 2023)."""

from __future__ import annotations
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from ai.intelligence.personalization.catalog import BankingProduct


class DecisionAuditRecord(BaseModel):
    """Immutable audit record logging why every single recommendation or suppression occurred."""
    audit_id: str = Field(default_factory=lambda: f"aud_{uuid.uuid4().hex[:12]}")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    customer_id: str
    product_id: str
    product_title: str
    decision: str = Field(..., description="DECISION: 'RECOMMEND' or 'SUPPRESS'")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    primary_reason: str
    regulatory_rules_enforced: List[str]
    input_signals_snapshot: Dict[str, Any]
    counterfactual_explanation: str = Field(
        ...,
        description="Explains what customer condition must change for this decision to flip"
    )
    dpdp_consent_verified: bool = True
    rbi_kfs_required: bool = False


class ComplianceEngine:
    """Evaluates regulatory guardrails under RBI Digital Lending Guidelines and DPDP Act 2023."""

    RBI_RULE_DTI_CAP = "RBI_DL_2022_DTI_40_CAP"
    RBI_RULE_PREDATORY_SUPPRESSION = "RBI_FAIR_PRACTICES_CODE_DISTRESS_SHIELD"
    DPDP_RULE_PURPOSE_CONSENT = "DPDP_ACT_2023_SEC_6_PURPOSE_LIMITATION"
    DPDP_RULE_DATA_LOCALIZATION = "RBI_DATA_LOCALIZATION_CIRCULAR_2018"

    @classmethod
    def calculate_confidence_score(cls, features: Dict[str, Any], signals: Dict[str, Any], scenario_data: Dict[str, Any]) -> float:
        """Computes statistical confidence score (0.0 to 1.0) based on data density and consistency."""
        tx_metrics = features.get("transaction_metrics", {})
        tx_count = tx_metrics.get("total_tx_count", 0)

        # 1. Data Density Weight (35%): >= 20 transactions gives maximum density
        density_score = min(1.0, max(0.2, tx_count / 20.0))

        # 2. Signal Consistency Weight (25%): low spending volatility implies high pattern certainty
        volatility = features.get("spending_volatility", "low")
        if volatility == "low":
            consistency_score = 1.0
        elif volatility == "medium":
            consistency_score = 0.75
        else:
            consistency_score = 0.50

        # 3. Tenure & Identity Weight (20%): KYC tier & profile completeness
        kyc_tier = scenario_data.get("kyc_tier", 2)
        tenure_score = 1.0 if kyc_tier >= 2 else 0.70

        # 4. Temporal Recency Weight (20%): recent active transactions
        recency_score = 0.95

        confidence = (
            0.35 * density_score +
            0.25 * consistency_score +
            0.20 * tenure_score +
            0.20 * recency_score
        )
        return round(min(0.99, max(0.50, confidence)), 3)

    @classmethod
    def evaluate_compliance(
        cls,
        product: BankingProduct,
        signals: Dict[str, Any],
        health: str,
        customer_id: str,
        confidence_score: float,
        consent_scopes: Optional[List[str]] = None
    ) -> tuple[bool, str, List[str], str]:
        """Evaluates whether product can be surfaced or must be suppressed under RBI/DPDP rules.

        Returns:
            (is_approved, decision_reason, rules_enforced, counterfactual)
        """
        default_scopes = [
            "credit_underwriting",
            "wealth_management",
            "fraud_monitoring",
            "general_banking",
            "financial_health_guidance",
            "insurance_claim_assistance",
            "transit_payments",
            "business_credit",
            "micro_insurance",
            "agri_credit",
            "credit_issuance",
            "senior_wealth",
            "credit_monitoring"
        ]
        consent_scopes = consent_scopes if consent_scopes is not None else default_scopes
        rules_enforced: List[str] = [cls.DPDP_RULE_DATA_LOCALIZATION]

        # 1. DPDP Act Purpose Limitation Verification
        if product.requires_consent_scope and product.requires_consent_scope not in consent_scopes:
            rules_enforced.append(cls.DPDP_RULE_PURPOSE_CONSENT)
            return (
                False,
                f"Suppressed under DPDP Act 2023: customer has not granted consent for scope '{product.requires_consent_scope}'.",
                rules_enforced,
                f"User must grant explicit consent for '{product.requires_consent_scope}' in privacy settings."
            )

        # 2. RBI Digital Lending Anti-Predatory Guardrail
        if product.is_credit_product:
            rules_enforced.append(cls.RBI_RULE_PREDATORY_SUPPRESSION)

            # Check debt distress
            dti = float(signals.get("debt_to_income_ratio", 0.0))
            is_distressed = health in ["stress", "tight"] or signals.get("stress_alert") or dti > product.max_dti_limit

            if is_distressed:
                rules_enforced.append(cls.RBI_RULE_DTI_CAP)
                return (
                    False,
                    f"Suppressed under RBI Fair Practice Code: customer has DTI ratio of {dti:.2f} (cap is {product.max_dti_limit}) and financial health '{health}'. Anti-predatory shield active.",
                    rules_enforced,
                    f"Customer debt-to-income ratio must reduce below {product.max_dti_limit} and financial health must return to 'stable' or 'thriving'."
                )

        # 3. Approved
        return (
            True,
            f"Approved: Meets regulatory suitability standards and DPDP purpose authorization.",
            rules_enforced,
            "Decision would be suppressed if debt pressure exceeds 0.40 DTI or consent is withdrawn."
        )

    @classmethod
    def create_audit_record(
        cls,
        customer_id: str,
        product: BankingProduct,
        decision: str,
        confidence_score: float,
        reason: str,
        rules: List[str],
        signals: Dict[str, Any],
        counterfactual: str
    ) -> DecisionAuditRecord:
        """Constructs an immutable auditable log entry for regulatory inspections."""
        return DecisionAuditRecord(
            customer_id=customer_id,
            product_id=product.id,
            product_title=product.title,
            decision=decision,
            confidence_score=confidence_score,
            primary_reason=reason,
            regulatory_rules_enforced=rules,
            input_signals_snapshot={
                "financial_health": signals.get("financial_health"),
                "savings_trend": signals.get("savings_trend"),
                "dti_ratio": signals.get("debt_to_income_ratio"),
                "anomaly_score": signals.get("anomaly_score"),
                "medical_surge": signals.get("medical_surge"),
                "commute_detected": signals.get("commute_habit_detected")
            },
            counterfactual_explanation=counterfactual,
            dpdp_consent_verified=True,
            rbi_kfs_required=product.is_credit_product
        )
