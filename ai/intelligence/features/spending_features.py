"""Spending patterns, burn rate, and discretionary vs essential ratios."""

from __future__ import annotations
from typing import Dict, Any, List


class SpendingFeatureExtractor:
    """Extracts burn rate, essential vs discretionary ratios, and DTI metrics."""

    _ESSENTIAL_CATEGORIES = {"bills", "groceries", "healthcare", "emi", "transport", "repairs", "education"}
    _DISCRETIONARY_CATEGORIES = {"food", "entertainment", "gaming", "shopping", "lifestyle", "travel"}

    @classmethod
    def extract(cls, transactions: List[Dict[str, Any]], profile_income: float = 75000.0) -> Dict[str, Any]:
        essential_spend = 0.0
        discretionary_spend = 0.0
        total_debit = 0.0
        emi_spend = 0.0
        medical_spend = 0.0
        salary_credits: List[float] = []

        for tx in transactions:
            amt = float(tx.get("amount", 0.0))
            cat = str(tx.get("category", "other")).lower()
            tx_type = tx.get("type", "debit")

            if tx_type == "credit":
                merch_text = (str(tx.get("merchant", "")) + " " + str(tx.get("raw_merchant", ""))).lower()
                is_income = (
                    cat in ["salary", "income", "gig_payout", "business_credit"]
                    or any(w in merch_text for w in [
                        "salary", "payroll", "corp salary", "payout", "rider", "partner", "captain",
                        "pm-kisan", "pension", "dbt", "stipend", "honorarium", "swiggy",
                        "zomato", "rapido", "uber", "ola", "zepto", "blinkit"
                    ])
                )
                if is_income:
                    salary_credits.append(amt)
            else:
                total_debit += amt
                if cat == "emi":
                    emi_spend += amt
                elif cat == "healthcare":
                    medical_spend += amt

                if cat in cls._ESSENTIAL_CATEGORIES:
                    essential_spend += amt
                elif cat in cls._DISCRETIONARY_CATEGORIES:
                    discretionary_spend += amt
                else:
                    essential_spend += amt * 0.5
                    discretionary_spend += amt * 0.5

        # Infer timeframe window for multi-month normalization
        dates = [tx.get("datetime") for tx in transactions if tx.get("datetime")]
        months_count = 1
        if len(dates) >= 2:
            span_days = max(1, (max(dates) - min(dates)).days)
            if span_days > 45:
                months_count = max(1, round(span_days / 30.0))

        if salary_credits:
            # If credits occur at high frequency (> 2 per month, e.g. weekly gig payouts), aggregate per month
            if len(salary_credits) > months_count * 2:
                effective_income = sum(salary_credits) / months_count
            else:
                effective_income = sum(salary_credits) / len(salary_credits)
        else:
            effective_income = profile_income
        monthly_emi = emi_spend / months_count
        monthly_burn = total_debit / months_count

        dti_ratio = round(monthly_emi / effective_income, 4) if effective_income > 0 else 0.0
        savings_margin = round((effective_income - monthly_burn) / effective_income, 4) if effective_income > 0 else 0.0
        discretionary_ratio = round(discretionary_spend / total_debit, 4) if total_debit > 0 else 0.0

        return {
            "monthly_burn_rate": round(monthly_burn, 2),
            "essential_spend": round(essential_spend / months_count, 2),
            "discretionary_spend": round(discretionary_spend / months_count, 2),
            "discretionary_ratio": discretionary_ratio,
            "emi_spend": round(monthly_emi, 2),
            "medical_spend": round(medical_spend, 2),
            "estimated_monthly_income": round(effective_income, 2),
            "debt_to_income_ratio": dti_ratio,
            "savings_margin_rate": savings_margin,
            "is_dti_critical": dti_ratio > 0.40,
        }
