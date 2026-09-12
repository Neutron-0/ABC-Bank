"""Continuous 32-Dimensional Financial Feature Vectorizer for Bharat Banking ML Engine."""

from __future__ import annotations
import math
from typing import Dict, Any, List, Optional
import numpy as np


class FinancialFeatureVectorizer:
    """Transforms raw financial streams, transaction matrices, and customer context into a normalized vector in R^32."""

    VECTOR_DIM: int = 32

    FEATURE_NAMES: List[str] = [
        "shannon_spend_entropy",
        "burn_velocity",
        "burn_acceleration",
        "dti_ratio",
        "liquid_buffer_months",
        "savings_rate",
        "discretionary_spend_ratio",
        "essential_spend_ratio",
        "healthcare_spend_ratio",
        "transit_commute_ratio",
        "agriculture_spend_ratio",
        "merchant_vendor_ratio",
        "debt_service_ratio",
        "education_spend_ratio",
        "periodic_transit_score",
        "anomaly_score_normalized",
        "spending_volatility",
        "digital_adoption_index",
        "micro_spend_ratio",
        "max_transaction_concentration",
        "credit_score_normalized",
        "balance_to_income_ratio",
        "reserve_ratio",
        "inflow_frequency_score",
        "inflow_regularity_score",
        "deficit_risk_score",
        "kyc_tier_normalized",
        "age_normalized",
        "weekend_spend_ratio",
        "odd_hours_spend_ratio",
        "bill_punctuality_score",
        "financial_health_score"
    ]

    @classmethod
    def compute_shannon_entropy(cls, category_volumes: Dict[str, float], total_debit: float) -> float:
        """Calculates Shannon Spending Entropy H(X) = -sum(p_i * log2(p_i)) across merchant categories."""
        if total_debit <= 0.0 or not category_volumes:
            return 0.0

        entropy = 0.0
        for volume in category_volumes.values():
            if volume > 0:
                p_i = volume / total_debit
                entropy -= p_i * math.log2(p_i)

        max_entropy = math.log2(max(2, len(category_volumes)))
        return float(np.clip(entropy / max_entropy, 0.0, 1.0)) if max_entropy > 0 else 0.0

    @classmethod
    def vectorize(
        cls,
        customer_data: Dict[str, Any],
        features: Optional[Dict[str, Any]] = None,
        signals: Optional[Dict[str, Any]] = None,
        health: str = "stable"
    ) -> np.ndarray:
        """Constructs an unabridged, sanitized feature vector x in R^32.

        Returns:
            np.ndarray of shape (32,) with dtype float64, guaranteed finite and normalized.
        """
        features = features or {}
        signals = signals or {}

        # 1. Base Financial Figures
        income = float(customer_data.get("monthly_income") or customer_data.get("declared_monthly_income") or 50000.0)
        income = max(1000.0, income)

        raw_bal = customer_data.get("balance") or {}
        raw_acc = customer_data.get("accounts") or {}
        if isinstance(raw_bal, dict) and "available" in raw_bal:
            avail_bal = float(raw_bal.get("available", 25000.0))
            savings_bal = float(raw_bal.get("savings", 50000.0))
        elif isinstance(raw_acc, dict) and "available_balance" in raw_acc:
            avail_bal = float(raw_acc.get("available_balance", 25000.0))
            savings_bal = float(raw_acc.get("savings_reserve", 50000.0))
        else:
            avail_bal = 25000.0
            savings_bal = 50000.0

        tx_metrics = features.get("transaction_metrics") or {}
        total_debit = float(tx_metrics.get("total_debit_volume", 0.0))
        total_tx_cnt = max(1, int(tx_metrics.get("total_tx_count", len(customer_data.get("transactions", [])))))

        cat_volumes = tx_metrics.get("category_volumes") or {}
        effective_debit = max(total_debit, 1.0)

        # 2. Extract Discrete Metrics
        # Feature 0: Shannon Spend Entropy
        shannon_entropy = cls.compute_shannon_entropy(cat_volumes, total_debit)

        # Feature 1: Burn Velocity (Daily Debit Rate / Normal Daily Rate)
        expected_daily_spend = income / 30.0
        actual_daily_spend = total_debit / max(1.0, float(tx_metrics.get("active_days", 30)))
        burn_velocity = float(np.clip(actual_daily_spend / max(1.0, expected_daily_spend), 0.0, 3.0) / 3.0)

        # Feature 2: Burn Acceleration (Second difference / change in burn)
        burn_acceleration = float(signals.get("burn_acceleration", 0.0))
        if burn_acceleration == 0.0:
            volatility_str = str(signals.get("spending_volatility", "low")).lower()
            if volatility_str == "high":
                burn_acceleration = 0.8
            elif volatility_str == "medium":
                burn_acceleration = 0.4
            else:
                burn_acceleration = 0.1
        burn_acc_norm = float(np.clip(burn_acceleration, 0.0, 1.0))

        # Feature 3: DTI Ratio
        dti = float(signals.get("debt_to_income_ratio", features.get("dti_ratio", 0.20)))
        dti_norm = float(np.clip(dti / 0.80, 0.0, 1.0))

        # Feature 4: Liquid Buffer Months
        buffer_months = float(signals.get("liquid_buffer_months", (avail_bal + savings_bal) / max(1.0, income)))
        buffer_norm = float(np.clip(buffer_months / 6.0, 0.0, 1.0))

        # Feature 5: Savings Rate
        savings_rate = float(features.get("savings_rate", 0.20))
        if savings_rate == 0.0 and income > 0:
            savings_rate = max(0.0, (income - total_debit) / income)
        savings_rate_norm = float(np.clip(savings_rate, 0.0, 1.0))

        # Category Ratios (6-13)
        discretionary_vol = (
            cat_volumes.get("shopping", 0.0) +
            cat_volumes.get("dining", 0.0) +
            cat_volumes.get("entertainment", 0.0)
        )
        essential_vol = (
            cat_volumes.get("groceries", 0.0) +
            cat_volumes.get("utilities", 0.0) +
            cat_volumes.get("healthcare", 0.0)
        )
        f_discretionary = float(np.clip(discretionary_vol / effective_debit, 0.0, 1.0))
        f_essential = float(np.clip(essential_vol / effective_debit, 0.0, 1.0))
        f_healthcare = float(np.clip(cat_volumes.get("healthcare", 0.0) / effective_debit, 0.0, 1.0))
        f_transit = float(np.clip((cat_volumes.get("transit", 0.0) + cat_volumes.get("transport", 0.0)) / effective_debit, 0.0, 1.0))
        f_agri = float(np.clip(cat_volumes.get("agriculture", 0.0) / effective_debit, 0.0, 1.0))
        f_merchant = float(np.clip((cat_volumes.get("business", 0.0) + cat_volumes.get("vendor", 0.0) + cat_volumes.get("supplier", 0.0)) / effective_debit, 0.0, 1.0))
        f_debt = float(np.clip((cat_volumes.get("loan", 0.0) + cat_volumes.get("emi", 0.0) + cat_volumes.get("credit_card", 0.0)) / effective_debit, 0.0, 1.0))
        f_edu = float(np.clip(cat_volumes.get("education", 0.0) / effective_debit, 0.0, 1.0))

        # Feature 14: Periodic Transit Score
        commute_detected = bool(signals.get("commute_habit_detected") or features.get("commute_detected") or f_transit > 0.08)
        periodic_transit = 0.95 if commute_detected else 0.15

        # Feature 15: Anomaly Score Normalized
        raw_anomaly = float(signals.get("anomaly_score", 0))
        anomaly_norm = float(np.clip(raw_anomaly / 100.0, 0.0, 1.0))

        # Feature 16: Spending Volatility
        volatility_str = str(signals.get("spending_volatility", "")).lower()
        if not volatility_str:
            if f_agri > 0.25 or signals.get("kcc_holder") or "farmer" in str(customer_data.get("occupation", "")).lower() or "agri" in str(customer_data.get("occupation", "")).lower():
                volatility_str = "high"
            else:
                volatility_str = "low"
        volatility_score = 0.85 if volatility_str == "high" else (0.45 if volatility_str == "medium" else 0.15)

        # Feature 17: Digital Adoption Index (UPI ratio)
        upi_cnt = float(tx_metrics.get("upi_tx_count", total_tx_cnt * 0.75))
        digital_adoption = float(np.clip(upi_cnt / max(1.0, float(total_tx_cnt)), 0.0, 1.0))

        # Feature 18: Micro-Spend Ratio (< Rs 250)
        micro_cnt = float(tx_metrics.get("micro_tx_count", 0))
        if micro_cnt == 0 and total_tx_cnt > 0:
            avg_amt = float(tx_metrics.get("avg_debit_amount", 500.0))
            micro_cnt = total_tx_cnt * 0.6 if avg_amt < 300.0 else total_tx_cnt * 0.2
        micro_ratio = float(np.clip(micro_cnt / max(1.0, float(total_tx_cnt)), 0.0, 1.0))

        # Feature 19: Max Transaction Concentration
        max_debit = float(tx_metrics.get("max_debit_amount", 0.0))
        concentration = float(np.clip(max_debit / effective_debit, 0.0, 1.0))

        # Feature 20: Credit Score Normalized (300 to 900 -> 0.0 to 1.0)
        raw_cibil = float(customer_data.get("credit_score") or signals.get("credit_score") or 720.0)
        cibil_norm = float(np.clip((raw_cibil - 300.0) / 600.0, 0.0, 1.0))

        # Feature 21: Balance to Income Ratio
        bal_income_ratio = float(np.clip(avail_bal / income, 0.0, 3.0) / 3.0)

        # Feature 22: Reserve Ratio (Savings / Liquid)
        reserve_ratio = float(np.clip(savings_bal / max(1.0, avail_bal), 0.0, 5.0) / 5.0)

        # Feature 23: Inflow Frequency Score
        credit_cnt = float(tx_metrics.get("credit_tx_count", 2))
        inflow_freq = float(np.clip(credit_cnt / 10.0, 0.0, 1.0))

        # Feature 24: Inflow Regularity Score
        has_corp_salary = any(k in str(customer_data).lower() for k in ["salary", "infosys", "tcs", "wipro", "tech mahindra", "accenture", "corp"])
        inflow_reg = 0.90 if has_corp_salary else 0.40

        # Feature 25: Deficit Risk Score
        deficit_flag = bool(signals.get("deficit_predicted") or signals.get("stress_alert") or health == "stress")
        deficit_risk = 0.95 if deficit_flag else (0.40 if health == "tight" else 0.05)

        # Feature 26: KYC Tier Normalized
        kyc_tier = float(customer_data.get("kyc_tier", 2))
        kyc_norm = float(np.clip(kyc_tier / 3.0, 0.0, 1.0))

        # Feature 27: Age Normalized (18 to 90 -> 0.0 to 1.0)
        age = float(customer_data.get("age", 30))
        age_norm = float(np.clip((age - 18.0) / 72.0, 0.0, 1.0))

        # Feature 28: Weekend Spend Ratio
        weekend_vol = float(tx_metrics.get("weekend_volume", 0.28 * effective_debit))
        weekend_ratio = float(np.clip(weekend_vol / effective_debit, 0.0, 1.0))

        # Feature 29: Odd Hours Spend Ratio
        odd_hours_vol = float(tx_metrics.get("odd_hours_volume", 0.05 * effective_debit))
        odd_hours_ratio = float(np.clip(odd_hours_vol / effective_debit, 0.0, 1.0))

        # Feature 30: Bill Punctuality Score
        punctuality = 0.95 if not signals.get("bill_overdue") else 0.20

        # Feature 31: Financial Health Indicator
        health_map = {"thriving": 1.0, "stable": 0.66, "tight": 0.33, "stress": 0.0}
        health_score = health_map.get(health.lower(), 0.66)

        # Assemble Vector
        raw_vector = [
            shannon_entropy,
            burn_velocity,
            burn_acc_norm,
            dti_norm,
            buffer_norm,
            savings_rate_norm,
            f_discretionary,
            f_essential,
            f_healthcare,
            f_transit,
            f_agri,
            f_merchant,
            f_debt,
            f_edu,
            periodic_transit,
            anomaly_norm,
            volatility_score,
            digital_adoption,
            micro_ratio,
            concentration,
            cibil_norm,
            bal_income_ratio,
            reserve_ratio,
            inflow_freq,
            inflow_reg,
            deficit_risk,
            kyc_norm,
            age_norm,
            weekend_ratio,
            odd_hours_ratio,
            punctuality,
            health_score
        ]

        # Convert to numpy array and sanitize
        vec = np.array(raw_vector, dtype=np.float64)
        vec = np.nan_to_num(vec, nan=0.0, posinf=1.0, neginf=0.0)
        return vec

    @classmethod
    def get_feature_dict(cls, vector: np.ndarray) -> Dict[str, float]:
        """Maps vector back to named dictionary for explainability and inspection."""
        return {name: float(round(vector[i], 4)) for i, name in enumerate(cls.FEATURE_NAMES)}
