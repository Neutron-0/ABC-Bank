from typing import List, Dict, Any, Tuple
import logging
from apps.backend.app.models.customer_state import Recommendation

logger = logging.getLogger(__name__)

class SafetyPolicyFilter:
    """
    Backend Safety & Ethical Policy Layer.
    Acts as a non-negotiable deterministic safeguard between AI recommendations/signals and ExperienceConfig.
    Enforces anti-predatory lending suppression and customer protection during financial stress.
    """

    # Structured categories classified as debt/credit/lending
    DEBT_AND_CREDIT_CATEGORIES = {
        "credit",
        "loan",
        "personal_loan",
        "payday_advance",
        "credit_card",
        "overdraft",
        "micro_credit",
        "borrowing",
        "short_term_credit",
        "lending",
        "financing",
        "revolving_credit"
    }

    DISCRETIONARY_UPSELL_CATEGORIES = {
        "investment_upsell",
        "aggressive_investments",
        "discretionary_spend",
        "marketing",
        "luxury",
    }

    # Modules prioritized when customer is under financial stress
    STRESS_PRIORITY_MODULES = [
        "cashflow_advisory",
        "obligations_planner",
        "budget_guidance",
        "expense_analysis",
        "support",
    ]

    STRESS_DEPRIORITIZED_MODULES = [
        "personal_loans",
        "credit_cards",
        "overdraft",
        "investment_upsell",
        "discretionary_spend",
        "marketing",
    ]

    @classmethod
    def evaluate_financial_stress(cls, health: str, signals: Dict[str, Any]) -> bool:
        """
        Determines whether the customer is in financial stress based on:
        1. Explicit financial health status ("stress")
        2. Debt-to-income ratio > 0.40
        3. Explicit stress_alert flag
        4. Critical EMI burden combined with declining/negative savings
        """
        if health == "stress":
            return True

        dti = signals.get("debt_to_income_ratio", 0)
        if isinstance(dti, (int, float)) and dti > 0.40:
            return True

        if signals.get("stress_alert") is True:
            return True

        if signals.get("emi_stress_level") == "critical" or signals.get("emi_pressure") == "high":
            if signals.get("savings_trend") == "negative":
                return True

        return False

    @classmethod
    def is_predatory_or_debt_recommendation(cls, rec: Recommendation) -> bool:
        """
        Conservatively determines whether a recommendation is a debt, credit, or predatory product.
        Checks structured attributes first (is_debt_product, product_type, category).
        """
        # 1. Explicit boolean flag if declared by upstream model
        if rec.is_debt_product is True:
            return True

        # 2. Structured product_type check
        prod_type = (rec.product_type or "").lower().strip()
        if prod_type in {"loan", "credit", "credit_card", "overdraft", "payday"}:
            return True

        # 3. Category classification check
        cat = (rec.category or "").lower().strip()
        if cat in cls.DEBT_AND_CREDIT_CATEGORIES or cat in cls.DISCRETIONARY_UPSELL_CATEGORIES:
            return True

        # 4. Conservative identifier check
        rec_id = (rec.id or "").lower()
        if any(term in rec_id for term in ["loan", "credit", "overdraft", "payday"]):
            return True

        return False

    @classmethod
    def filter_recommendations(
        cls,
        recommendations: List[Recommendation],
        is_stress: bool
    ) -> List[Recommendation]:
        """
        Applies safety filter to recommendations.
        If customer is in financial stress, all debt/credit/predatory recommendations
        are strictly suppressed and their priority is set to 0.
        """
        filtered_recs: List[Recommendation] = []
        for rec in recommendations:
            if is_stress:
                if cls.is_predatory_or_debt_recommendation(rec):
                    rec.suppressed = True
                    rec.priority = 0
                    rec.reason = "Suppressed by Backend Safety Policy: Anti-predatory lending safeguard during financial stress."
                    logger.info(f"[SafetyPolicy] Suppressed predatory/credit recommendation: {rec.id}")

            filtered_recs.append(rec)

        return filtered_recs

    @classmethod
    def apply_module_policies(
        cls,
        priority_modules: List[str],
        deprioritized_modules: List[str],
        is_stress: bool
    ) -> Tuple[List[str], List[str]]:
        """
        Enforces module visibility safety rules.
        Ensures loan/credit modules are never in priority_modules during stress,
        and ensures support/advisory modules are included.
        """
        final_priority = list(priority_modules)
        final_deprioritized = list(deprioritized_modules)

        if is_stress:
            # Purge prohibited items from priority
            final_priority = [
                m for m in final_priority
                if m not in cls.STRESS_DEPRIORITIZED_MODULES
            ]

            # Ensure stress support modules are front and center
            for sm in cls.STRESS_PRIORITY_MODULES:
                if sm not in final_priority:
                    final_priority.append(sm)

            # Ensure prohibited modules are registered as deprioritized for auditability
            for dm in cls.STRESS_DEPRIORITIZED_MODULES:
                if dm not in final_deprioritized:
                    final_deprioritized.append(dm)

        return final_priority, final_deprioritized
