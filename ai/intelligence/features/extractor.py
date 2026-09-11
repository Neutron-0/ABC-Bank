from typing import List, Dict, Any

class FeatureExtractor:
    """Extracts behavioral and temporal features from customer transaction logs."""

    @staticmethod
    def extract(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        metro_count = 0
        utility_count = 0
        total_spend = 0.0
        categories: Dict[str, float] = {}

        for tx in transactions:
            amt = float(tx.get("amount", 0))
            cat = tx.get("category", "other")
            merchant = str(tx.get("merchant", "")).lower()

            if tx.get("type") == "debit":
                total_spend += amt
                categories[cat] = categories.get(cat, 0.0) + amt

            if "metro" in merchant:
                metro_count += 1
            if cat == "bills":
                utility_count += 1

        return {
            "total_debit_volume": total_spend,
            "metro_frequency_30d": metro_count,
            "utility_bill_count": utility_count,
            "top_categories": sorted(categories.items(), key=lambda x: x[1], reverse=True),
        }
