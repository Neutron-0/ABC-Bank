"""Comprehensive Feature Extraction Engine uniting transaction, spending, temporal, and trend features."""

from __future__ import annotations
from typing import List, Dict, Any, Optional
from ai.intelligence.features.normalizer import TransactionNormalizer
from ai.intelligence.features.transaction_features import TransactionFeatureExtractor
from ai.intelligence.features.spending_features import SpendingFeatureExtractor
from ai.intelligence.features.temporal_features import TemporalFeatureExtractor
from ai.intelligence.features.trend_features import TrendFeatureExtractor
from ai.intelligence.features.spend_analyzer import SpendAnalyzer


class FeatureExtractor:
    """Extracts high-dimensional behavioral, temporal, and risk features from transaction logs."""

    @classmethod
    def extract(cls, transactions: List[Dict[str, Any]], profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Normalizes transactions and extracts comprehensive feature matrices in <3ms."""
        profile = profile or {}
        raw_income = profile.get("monthly_income")
        try:
            profile_income = float(raw_income) if raw_income is not None else 75000.0
        except (ValueError, TypeError):
            profile_income = 75000.0

        # Safely extract balance from either scenario 'balance' or customer 'accounts'
        available_balance = 42680.0
        bal_obj = profile.get("balance")
        acc_obj = profile.get("accounts")
        if isinstance(bal_obj, dict) and "available" in bal_obj:
            try:
                available_balance = float(bal_obj["available"])
            except (ValueError, TypeError):
                available_balance = 42680.0
        elif isinstance(acc_obj, dict) and "available_balance" in acc_obj:
            try:
                available_balance = float(acc_obj["available_balance"])
            except (ValueError, TypeError):
                available_balance = 42680.0

        # 1. Normalize all transactions
        normalized_txs = TransactionNormalizer.normalize_batch(transactions)

        # 2. Extract domain-specific features
        tx_features = TransactionFeatureExtractor.extract(normalized_txs)
        spending_features = SpendingFeatureExtractor.extract(normalized_txs, profile_income=profile_income)
        temporal_features = TemporalFeatureExtractor.extract(normalized_txs)
        trend_features = TrendFeatureExtractor.extract(normalized_txs, available_balance=available_balance)
        spend_profile = SpendAnalyzer.analyze(normalized_txs, monthly_income=profile_income)

        # 3. Compile unified feature profile
        combined_features: Dict[str, Any] = {
            # Backward-compatible baseline keys expected by existing callers
            "total_debit_volume": tx_features["total_debit_volume"],
            "total_credit_volume": tx_features["total_credit_volume"],
            "metro_frequency_30d": tx_features["metro_frequency_30d"],
            "utility_bill_count": tx_features["utility_bill_count"],
            "top_categories": tx_features["top_categories"],

            # Sub-matrices
            "transaction_metrics": tx_features,
            "spending_metrics": spending_features,
            "temporal_metrics": temporal_features,
            "trend_metrics": trend_features,
            "category_spend_profile": spend_profile.model_dump(mode="json"),
            "category_breakdown": {k: v.model_dump(mode="json") for k, v in spend_profile.categories.items()},
            "budget_allocation_50_30_20": spend_profile.allocation_50_30_20.model_dump(mode="json"),
            "discretionary_leakage_alerts": spend_profile.discretionary_leakage_alerts,

            # Direct scalar features for signal engines
            "dti_ratio": spending_features["debt_to_income_ratio"],
            "burn_rate": spending_features["monthly_burn_rate"],
            "savings_margin": spending_features["savings_margin_rate"],
            "discretionary_ratio": spending_features["discretionary_ratio"],
            "commute_detected": temporal_features["commute_cluster_detected"],
            "commute_time": temporal_features["commute_typical_time"],
            "commute_amount": temporal_features["commute_typical_amount"],
            "commute_merchant": temporal_features["commute_merchant"],
            "odd_hours_count": temporal_features["odd_hours_tx_count"],
            "odd_hours_volume": temporal_features["odd_hours_volume"],
            "savings_momentum": trend_features["savings_momentum"],
            "spending_volatility": trend_features["spending_volatility"],
            "large_outlay_detected": trend_features["large_outlay_detected"],
            "largest_debit_amount": trend_features["largest_debit_amount"],
            "largest_debit_merchant": trend_features["largest_debit_merchant"],
            "largest_debit_category": trend_features["largest_debit_category"],
        }

        return combined_features
