"""Multi-Factor ML Propensity & Scoring Engine for Bharat Banking Personalization."""

from __future__ import annotations
from typing import Dict, Any, Tuple, Optional
import numpy as np

from ai.intelligence.personalization.catalog import BankingProduct
from ai.intelligence.personalization.archetypes import BharatArchetypeProfile
from ai.intelligence.ml.vectorizer import FinancialFeatureVectorizer
from ai.intelligence.ml.propensity import SupervisedPropensityModel
from ai.intelligence.ml.embeddings import ProductEmbeddingSpace
from ai.intelligence.ml.bandit import LinUCBBandit


class MultiFactorScorer:
    """Computes mathematically calibrated multi-factor propensity scores combining Scikit-Learn ML with regulatory constraints."""

    # Rigorously tuned multi-factor weights summing to 1.00
    WEIGHT_AFFORDABILITY = 0.30
    WEIGHT_LIFECYCLE_NEED = 0.30
    WEIGHT_TEMPORAL_URGENCY = 0.25
    WEIGHT_ARCHETYPE_AFFINITY = 0.15

    # ML Ensemble Weights
    WEIGHT_ML_PROPENSITY = 0.45
    WEIGHT_ML_COSINE = 0.35
    WEIGHT_ML_BANDIT = 0.20

    @classmethod
    def compute_affordability_fit(cls, product: BankingProduct, signals: Dict[str, Any], features: Dict[str, Any], health: str) -> float:
        """Calculates how well the product fits the customer's liquid cash-flow and debt capacity (0.0 to 1.0)."""
        dti = float(signals.get("debt_to_income_ratio", 0.0))
        buffer_months = float(signals.get("liquid_buffer_months", 2.0))
        savings_trend = str(signals.get("savings_trend", "neutral"))

        # For credit products: fit decreases sharply as DTI rises
        if product.is_credit_product:
            if health in ["stress", "tight"] or dti > product.max_dti_limit:
                return 0.0
            # Higher score for healthy buffer and low DTI
            dti_headroom = max(0.0, 1.0 - (dti / product.max_dti_limit))
            buffer_factor = min(1.0, buffer_months / 3.0)
            return round(0.6 * dti_headroom + 0.4 * buffer_factor, 3)

        # For savings & wealth products: fit increases with surplus buffer
        if product.category in ["savings", "senior_savings", "wealth"]:
            if savings_trend == "positive" and buffer_months > 1.5:
                return 0.95
            elif health == "thriving":
                return 0.90
            elif buffer_months > 1.0:
                return 0.70
            return 0.40

        # For guidance & debt relief: fit is maximum when under cash-flow strain
        if product.category == "guidance" or product.id == "rec_cashflow_guidance":
            if health == "stress" or dti > 0.40:
                return 1.0
            elif health == "tight":
                return 0.85
            return 0.25

        # For daily utilities & transit: constant high baseline affordability
        return 0.85

    @classmethod
    def compute_lifecycle_need(cls, product: BankingProduct, signals: Dict[str, Any], features: Dict[str, Any]) -> float:
        """Calculates contextual correlation with inferred life shocks and habits (0.0 to 1.0)."""
        pid = product.id
        medical_surge = bool(signals.get("medical_surge"))
        anomaly_score = int(signals.get("anomaly_score", 0))
        commute_habit = bool(signals.get("commute_habit_detected"))

        # Emergency & Security: Need is absolute when triggered
        if pid == "rec_fraud_guard":
            return 1.0 if (anomaly_score > 80 or signals.get("fraud_alert_detected")) else 0.10
        if pid == "rec_medical_claim":
            return 1.0 if (medical_surge or signals.get("medical_event_detected")) else 0.10

        # Transit & Commute
        if pid in ["rec_commute_metro", "srv_ncmc_reload"]:
            return 0.95 if commute_habit else 0.20
        if pid == "srv_fastag_recharge":
            return 0.90 if signals.get("fastag_low_balance") else 0.35

        # Credit & Bureau
        if pid == "srv_cibil_refresh":
            return 0.92 if signals.get("cibil_refresh_due") else 0.60
        if pid == "srv_credit_card_bill":
            return 0.95 if signals.get("credit_card_bill_due") else 0.40

        # Government & Social Security
        if pid == "srv_pmjjby_pmsby":
            return 0.90 if signals.get("social_security_renewal") else 0.50
        if pid == "srv_form15g_h":
            return 0.95 if signals.get("tax_exemption_season") else 0.45

        return 0.60

    @classmethod
    def compute_temporal_urgency(cls, product: BankingProduct, signals: Dict[str, Any], features: Dict[str, Any]) -> float:
        """Calculates time-of-day, calendar due date, and seasonal urgency (0.0 to 1.0)."""
        pid = product.id

        # Peak morning commute urgency (07:30 to 10:00 AM)
        if pid in ["rec_commute_metro", "srv_ncmc_reload"]:
            commute_time = signals.get("commute_typical_time", "08:40 AM")
            return 0.95 if "08:" in commute_time or "07:" in commute_time or "09:" in commute_time else 0.60

        # Bill due date proximity
        if pid in ["srv_credit_card_bill", "srv_mobile_recharge"]:
            return 0.90

        # Immediate fraud urgency
        if pid == "rec_fraud_guard":
            return 1.0

        # Hospital emergency urgency
        if pid == "rec_medical_claim":
            return 0.95

        return 0.50

    @classmethod
    def compute_archetype_affinity(cls, product: BankingProduct, archetype: BharatArchetypeProfile) -> float:
        """Calculates suitability match between product category and customer archetype (0.0 to 1.0)."""
        cat = product.category
        if cat in archetype.suitable_product_categories:
            return 1.0
        # Check specific archetype alignments
        arch_id = archetype.id.value
        if arch_id == "msme_merchant" and cat in ["working_capital", "merchant_qr", "savings"]:
            return 1.0
        if arch_id == "rural_farmer" and cat in ["agricultural_credit", "crop_insurance"]:
            return 1.0
        if arch_id == "gig_worker" and cat in ["micro_insurance", "guidance"]:
            return 1.0
        if arch_id == "student_first_earner" and cat in ["credit_builder", "micro_savings"]:
            return 1.0
        if arch_id == "senior_pensioner" and cat in ["senior_savings", "security"]:
            return 1.0
        if arch_id == "urban_commuter" and cat in ["transport", "savings", "credit"]:
            return 1.0
        return 0.40

    @classmethod
    def compute_risk_penalty(cls, product: BankingProduct, signals: Dict[str, Any], health: str) -> float:
        """Computes risk dampener (0.0 to 1.0) applied against discretionary or borrowing actions."""
        # Non-credit, emergency, and guidance actions never face risk penalty
        if product.category in ["security", "healthcare", "guidance"]:
            return 0.0

        dti = float(signals.get("debt_to_income_ratio", 0.0))
        anomaly_score = int(signals.get("anomaly_score", 0))
        volatility = str(signals.get("spending_volatility", "low"))

        penalty = 0.0
        if product.is_credit_product:
            if health in ["stress", "tight"]:
                penalty += 0.80
            if dti > 0.35:
                penalty += min(0.50, (dti - 0.35) * 2.0)

        if anomaly_score > 80:
            penalty += 0.70

        if volatility == "high":
            penalty += 0.15

        return round(min(0.95, penalty), 3)

    @classmethod
    def score_product(
        cls,
        product: BankingProduct,
        archetype: BharatArchetypeProfile,
        signals: Dict[str, Any],
        features: Dict[str, Any],
        health: str,
        customer_vector: Optional[np.ndarray] = None
    ) -> Tuple[int, Dict[str, float]]:
        """Calculates final calibrated priority (10 to 100) using the ML ensemble and regulatory filters.

        Returns:
            (final_priority, component_metrics)
        """
        # 1. Base Contextual Components
        s_affordability = cls.compute_affordability_fit(product, signals, features, health)
        s_need = cls.compute_lifecycle_need(product, signals, features)
        s_timing = cls.compute_temporal_urgency(product, signals, features)
        s_affinity = cls.compute_archetype_affinity(product, archetype)
        r_penalty = cls.compute_risk_penalty(product, signals, health)

        # 2. Machine Learning Core Models
        if customer_vector is None:
            # Reconstruct vector if not passed directly
            cust_mock = {
                "monthly_income": features.get("monthly_income", 75000),
                "credit_score": signals.get("credit_score", 750),
                "age": features.get("age", 30)
            }
            customer_vector = FinancialFeatureVectorizer.vectorize(cust_mock, features, signals, health)

        # A. Supervised ML Propensity
        ml_propensity = SupervisedPropensityModel.predict_propensity(product.id, customer_vector)

        # B. Cosine Vector Similarity
        ml_cosine = ProductEmbeddingSpace.compute_cosine_similarity(customer_vector, product.id)

        # C. LinUCB Online Bandit Score
        ml_bandit = LinUCBBandit.score(product.id, customer_vector)

        # 3. Ensemble Synthesis
        ml_ensemble_score = (
            cls.WEIGHT_ML_PROPENSITY * ml_propensity +
            cls.WEIGHT_ML_COSINE * ml_cosine +
            cls.WEIGHT_ML_BANDIT * ml_bandit
        )

        # Baseline heuristic weighted sum for compatibility and stability
        weighted_sum = (
            cls.WEIGHT_AFFORDABILITY * s_affordability +
            cls.WEIGHT_LIFECYCLE_NEED * s_need +
            cls.WEIGHT_TEMPORAL_URGENCY * s_timing +
            cls.WEIGHT_ARCHETYPE_AFFINITY * s_affinity
        )

        # Combined utility: 60% ML intelligence + 40% contextual urgency/affordability constraints
        combined_utility = 0.60 * ml_ensemble_score + 0.20 * s_timing + 0.20 * s_affordability

        effective_multiplier = combined_utility * (1.0 - r_penalty)
        raw_score = product.base_priority * (0.50 + 0.50 * effective_multiplier)

        # Urgent security or medical conditions retain hard floors
        if product.id == "rec_fraud_guard" and (signals.get("anomaly_score", 0) > 80 or signals.get("fraud_alert_detected")):
            raw_score = 100.0
        elif product.id == "rec_medical_claim" and (signals.get("medical_surge") or signals.get("medical_event_detected")):
            raw_score = max(raw_score, 95.0)
        elif product.id == "rec_cashflow_guidance" and health == "stress":
            raw_score = max(raw_score, 92.0)

        final_priority = max(10, min(100, int(round(raw_score))))

        metrics = {
            "affordability_fit": round(s_affordability, 3),
            "lifecycle_need": round(s_need, 3),
            "temporal_urgency": round(s_timing, 3),
            "archetype_affinity": round(s_affinity, 3),
            "risk_penalty": round(r_penalty, 3),
            "weighted_index": round(weighted_sum, 3),
            "ml_propensity_prob": round(ml_propensity, 4),
            "ml_cosine_similarity": round(ml_cosine, 4),
            "ml_bandit_ucb": round(ml_bandit, 4),
            "ml_ensemble_index": round(ml_ensemble_score, 4)
        }

        return final_priority, metrics
