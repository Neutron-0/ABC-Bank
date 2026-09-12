"""Statistical and frequency feature extraction from normalized banking transactions."""

from __future__ import annotations
from typing import Dict, Any, List
from collections import defaultdict


class TransactionFeatureExtractor:
    """Computes frequency, volume, and category concentration features."""

    @staticmethod
    def extract(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not transactions:
            return {
                "total_tx_count": 0,
                "debit_tx_count": 0,
                "credit_tx_count": 0,
                "total_debit_volume": 0.0,
                "total_credit_volume": 0.0,
                "avg_debit_amount": 0.0,
                "median_debit_amount": 0.0,
                "category_counts": {},
                "category_volumes": {},
                "merchant_frequencies": {},
                "metro_frequency_30d": 0,
                "utility_bill_count": 0,
                "emi_tx_count": 0,
                "top_categories": [],
            }

        debit_amounts: List[float] = []
        credit_amounts: List[float] = []
        category_counts: Dict[str, int] = defaultdict(int)
        category_volumes: Dict[str, float] = defaultdict(float)
        merchant_frequencies: Dict[str, int] = defaultdict(int)

        metro_count = 0
        utility_count = 0
        emi_count = 0

        for tx in transactions:
            amt = float(tx.get("amount", 0.0))
            cat = str(tx.get("category", "other"))
            merchant = str(tx.get("merchant", ""))
            tx_type = tx.get("type", "debit")

            if tx_type == "debit":
                debit_amounts.append(amt)
                category_counts[cat] += 1
                category_volumes[cat] += amt
                merchant_frequencies[merchant] += 1

                if cat == "transport" or "metro" in merchant.lower():
                    metro_count += 1
                elif cat == "bills":
                    utility_count += 1
                elif cat == "emi":
                    emi_count += 1
            else:
                credit_amounts.append(amt)

        total_debits = sum(debit_amounts)
        total_credits = sum(credit_amounts)
        debit_cnt = len(debit_amounts)
        sorted_debits = sorted(debit_amounts)
        median_debit = sorted_debits[debit_cnt // 2] if debit_cnt > 0 else 0.0

        top_cats = sorted(category_volumes.items(), key=lambda x: x[1], reverse=True)

        return {
            "total_tx_count": len(transactions),
            "debit_tx_count": debit_cnt,
            "credit_tx_count": len(credit_amounts),
            "total_debit_volume": round(total_debits, 2),
            "total_credit_volume": round(total_credits, 2),
            "avg_debit_amount": round(total_debits / debit_cnt, 2) if debit_cnt > 0 else 0.0,
            "median_debit_amount": round(median_debit, 2),
            "category_counts": dict(category_counts),
            "category_volumes": dict(category_volumes),
            "merchant_frequencies": dict(merchant_frequencies),
            "metro_frequency_30d": metro_count,
            "utility_bill_count": utility_count,
            "emi_tx_count": emi_count,
            "top_categories": top_cats,
        }
