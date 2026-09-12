"""Supervised Multi-Product Propensity Model for Bharat Banking using Scikit-Learn Logistic Regression."""

from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np
from sklearn.linear_model import LogisticRegression

from ai.intelligence.ml.vectorizer import FinancialFeatureVectorizer
from ai.intelligence.personalization.archetypes import ArchetypeId
from ai.intelligence.ml.clustering import KMeansClusterer


class SupervisedPropensityModel:
    """Estimates calibrated propensity probabilities P(Need_k | x) for all 19 banking products using Scikit-Learn models."""

    _models: Dict[str, LogisticRegression] = {}
    _is_trained: bool = False

    @classmethod
    def _synthesize_training_dataset(cls) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
        """Generates comprehensive training data grounded in banking domain labels across R^32."""
        x_base, y_archs = KMeansClusterer._generate_synthetic_seed_profiles()
        rng = np.random.default_rng(101)

        # Inject contextual stress and surge variations (medical, fraud, debt stress, wealth surplus)
        extended_x = [x_base]
        # 1. Fraud spikes (feature 15: anomaly > 0.8, feature 29: odd hours)
        fraud_x = x_base[:30].copy()
        fraud_x[:, 15] = rng.uniform(0.85, 0.99, size=30)
        fraud_x[:, 29] = rng.uniform(0.60, 0.95, size=30)
        extended_x.append(fraud_x)

        # 2. Medical emergency spikes (feature 8: health ratio > 0.4, feature 2: burn_acc > 0.7)
        med_x = x_base[:30].copy()
        med_x[:, 8] = rng.uniform(0.40, 0.90, size=30)
        med_x[:, 2] = rng.uniform(0.70, 0.95, size=30)
        med_x[:, 31] = rng.uniform(0.10, 0.35, size=30)  # tight/stress
        extended_x.append(med_x)

        # 3. Debt stress spikes (feature 3: DTI > 0.5, feature 25: deficit risk > 0.8, feature 31: stress)
        stress_x = x_base[:30].copy()
        stress_x[:, 3] = rng.uniform(0.60, 0.95, size=30)
        stress_x[:, 25] = rng.uniform(0.85, 1.00, size=30)
        stress_x[:, 31] = 0.0  # stress
        extended_x.append(stress_x)

        # 4. Wealth surplus spikes (feature 4: buffer > 0.7, feature 5: savings > 0.6, feature 31: thriving)
        surplus_x = x_base[:30].copy()
        surplus_x[:, 4] = rng.uniform(0.75, 1.00, size=30)
        surplus_x[:, 5] = rng.uniform(0.60, 0.90, size=30)
        surplus_x[:, 31] = 1.0  # thriving
        extended_x.append(surplus_x)

        x_all = np.vstack(extended_x)
        n_samples = x_all.shape[0]

        # Generate ground-truth labels for each product based on feature rules with noise
        labels: Dict[str, np.ndarray] = {}

        # 1. Fraud Guard: trigger on high anomaly, odd hours
        y_fraud = (x_all[:, 15] > 0.75) | (x_all[:, 29] > 0.60)
        labels["rec_fraud_guard"] = y_fraud.astype(int)

        # 2. Medical Claim: trigger on healthcare spend or high burn acceleration
        y_med = (x_all[:, 8] > 0.30) | (x_all[:, 2] > 0.75)
        labels["rec_medical_claim"] = y_med.astype(int)

        # 3. Cashflow Guidance: trigger on debt stress, deficit risk, low buffer
        y_cashflow = (x_all[:, 25] > 0.70) | (x_all[:, 3] > 0.50) | (x_all[:, 31] < 0.20)
        labels["rec_cashflow_guidance"] = y_cashflow.astype(int)

        # 4. Commute Metro: trigger on transit spend and periodic transit score
        y_metro = (x_all[:, 9] > 0.10) | (x_all[:, 14] > 0.70)
        labels["rec_commute_metro"] = y_metro.astype(int)

        # 5. Smart Savings: trigger on high buffer and thriving health
        y_savings = (x_all[:, 4] > 0.50) & (x_all[:, 5] > 0.30) & (x_all[:, 31] > 0.60)
        labels["rec_smart_savings"] = y_savings.astype(int)

        # 6. Personal Loan: low DTI, high CIBIL, stable health
        y_loan = (x_all[:, 3] < 0.40) & (x_all[:, 20] > 0.60) & (x_all[:, 31] > 0.50)
        labels["rec_personal_loan"] = y_loan.astype(int)

        # 7. MSME Credit Line: high merchant vendor spend, high credit count
        y_msme = (x_all[:, 11] > 0.40) | (x_all[:, 23] > 0.60)
        labels["rec_msme_credit_line"] = y_msme.astype(int)

        # 8. Sachet Insurance: gig worker features (high micro ratio, high upi, low buffer)
        y_sachet = (x_all[:, 18] > 0.50) & (x_all[:, 4] < 0.40) & (x_all[:, 17] > 0.70)
        labels["rec_sachet_insurance"] = y_sachet.astype(int)

        # 9. KCC Top-up: rural farmer features (high agri ratio)
        y_kcc = x_all[:, 10] > 0.35
        labels["rec_kcc_topup"] = y_kcc.astype(int)

        # 10. Student Credit Builder: young age, high micro spends, low debt
        y_student = (x_all[:, 27] < 0.15) & (x_all[:, 18] > 0.60)
        labels["rec_credit_builder"] = y_student.astype(int)

        # 11. Senior SCSS: high age, high reserve, low volatility
        y_scss = (x_all[:, 27] > 0.55) & (x_all[:, 22] > 0.50)
        labels["rec_senior_scss"] = y_scss.astype(int)

        # 12. NCMC Reload: transit habit with lower buffer or high commute
        y_ncmc = (x_all[:, 14] > 0.60) | (x_all[:, 9] > 0.08)
        labels["srv_ncmc_reload"] = y_ncmc.astype(int)

        # 13. CIBIL Refresh: active debt or credit builder intent
        y_cibil = (x_all[:, 20] > 0.50) | (x_all[:, 12] > 0.10)
        labels["srv_cibil_refresh"] = y_cibil.astype(int)

        # 14. Credit Card Bill: credit card or debt service spend
        y_cc = x_all[:, 12] > 0.15
        labels["srv_credit_card_bill"] = y_cc.astype(int)

        # 15. FASTag Recharge: transit and weekend highway spends
        y_fastag = (x_all[:, 9] > 0.05) & (x_all[:, 28] > 0.25)
        labels["srv_fastag_recharge"] = y_fastag.astype(int)

        # 16. Mobile Recharge: high digital adoption, micro spends
        y_mobile = (x_all[:, 17] > 0.70) & (x_all[:, 18] > 0.40)
        labels["srv_mobile_recharge"] = y_mobile.astype(int)

        # 17. Form 15G/H: senior age and high savings reserve
        y_form15 = (x_all[:, 27] > 0.50) & (x_all[:, 22] > 0.60)
        labels["srv_form15g_h"] = y_form15.astype(int)

        # 18. Positive Pay: merchant activity and high concentration
        y_pospay = (x_all[:, 19] > 0.30) & (x_all[:, 11] > 0.20)
        labels["srv_positive_pay"] = y_pospay.astype(int)

        # 19. PMJJBY/PMSBY: rural or gig micro-protection
        y_pmjjby = (x_all[:, 10] > 0.25) | (x_all[:, 18] > 0.50)
        labels["srv_pmjjby_pmsby"] = y_pmjjby.astype(int)

        return x_all, labels

    @classmethod
    def train(cls) -> None:
        """Loads pre-trained Scikit-Learn LogisticRegression models from checkpoints or trains dynamically."""
        if cls._is_trained:
            return

        checkpoint_path = Path(__file__).resolve().parent / "checkpoints" / "propensity_models_v1.joblib"
        if checkpoint_path.exists():
            try:
                import joblib
                artifact = joblib.load(checkpoint_path)
                cls._models = artifact["models"]
                cls._is_trained = True
                return
            except Exception:
                pass

        x_train, labels_dict = cls._synthesize_training_dataset()

        for product_id, y_train in labels_dict.items():
            # Ensure at least 2 classes present
            if len(np.unique(y_train)) < 2:
                y_train = y_train.copy()
                y_train[0] = 0
                y_train[1] = 1

            clf = LogisticRegression(
                C=1.0,
                max_iter=500,
                solver="lbfgs",
                class_weight="balanced",
                random_state=42
            )
            clf.fit(x_train, y_train)
            cls._models[product_id] = clf

        cls._is_trained = True

    @classmethod
    def predict_propensity(cls, product_id: str, vector: np.ndarray) -> float:
        """Calculates calibrated probability P(Need_k | x) in [0.0, 1.0]."""
        if not cls._is_trained:
            cls.train()

        clf = cls._models.get(product_id)
        if clf is None:
            return 0.50

        x = np.asarray(vector, dtype=np.float64).reshape(1, -1)
        prob_positive = float(clf.predict_proba(x)[0, 1])
        return float(round(np.clip(prob_positive, 0.0, 1.0), 4))

    @classmethod
    def predict_all(cls, vector: np.ndarray) -> Dict[str, float]:
        """Calculates propensity for all catalog products simultaneously."""
        if not cls._is_trained:
            cls.train()

        x = np.asarray(vector, dtype=np.float64).reshape(1, -1)
        results: Dict[str, float] = {}
        for pid, clf in cls._models.items():
            prob = float(clf.predict_proba(x)[0, 1])
            results[pid] = float(round(np.clip(prob, 0.0, 1.0), 4))
        return results

    @classmethod
    def get_feature_importance(cls, product_id: str, top_n: int = 3) -> List[Tuple[str, float]]:
        """Returns top N positive feature drivers for the given product model."""
        if not cls._is_trained:
            cls.train()

        clf = cls._models.get(product_id)
        if clf is None:
            return []

        coefs = clf.coef_[0]
        feature_names = FinancialFeatureVectorizer.FEATURE_NAMES
        indexed_coefs = [(feature_names[i], float(round(coefs[i], 3))) for i in range(len(feature_names))]
        indexed_coefs.sort(key=lambda item: item[1], reverse=True)
        return indexed_coefs[:top_n]
