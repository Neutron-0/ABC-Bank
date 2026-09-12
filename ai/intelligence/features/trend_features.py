"""Trend, trajectory drift, and volatility feature extraction."""

from __future__ import annotations
from typing import Dict, Any, List


class TrendFeatureExtractor:
    """Extracts trajectory momentum, volatility index, and large shock outlays."""

    @staticmethod
    def extract(transactions: List[Dict[str, Any]], available_balance: float = 42680.0) -> Dict[str, Any]:
        if not transactions:
            return {
                "savings_momentum": "neutral",
                "savings_momentum_score": 0.0,
                "spending_volatility": "low",
                "large_outlay_detected": False,
                "largest_debit_amount": 0.0,
                "largest_debit_merchant": "",
                "largest_debit_category": "",
            }

        debits = [tx for tx in transactions if tx.get("type") == "debit"]
        credits = [tx for tx in transactions if tx.get("type") == "credit"]

        total_debits = sum(float(tx.get("amount", 0.0)) for tx in debits)
        total_credits = sum(float(tx.get("amount", 0.0)) for tx in credits)

        net_flow = total_credits - total_debits
        if total_credits > 0:
            momentum_score = round(net_flow / total_credits, 4)
        else:
            momentum_score = -1.0 if total_debits > 0 else 0.0

        if momentum_score > 0.15:
            momentum = "positive"
        elif momentum_score < -0.15:
            momentum = "negative"
        else:
            momentum = "neutral"

        # Volatility & Large outlay detection
        largest_debit_amt = 0.0
        largest_debit_merchant = ""
        largest_debit_cat = ""
        largest_unexpected_amt = 0.0

        for tx in debits:
            amt = float(tx.get("amount", 0.0))
            cat = str(tx.get("category", "")).lower()
            is_rec = bool(tx.get("is_recurring", False))
            if amt > largest_debit_amt:
                largest_debit_amt = amt
                largest_debit_merchant = str(tx.get("merchant", ""))
                largest_debit_cat = cat

            # Track non-recurring, non-EMI outlays to avoid false-positive shocks on scheduled loans
            if not is_rec and cat not in ["emi", "investment", "salary"]:
                if amt > largest_unexpected_amt:
                    largest_unexpected_amt = amt

        # Large outlay flag if unexpected debit exceeds ₹25,000 or exceeds 60% of available balance
        large_outlay = largest_unexpected_amt >= 25000.0 or (available_balance > 0 and largest_unexpected_amt > 0.6 * available_balance)

        volatility = "low"
        if large_outlay or momentum_score < -0.3:
            volatility = "high"
        elif abs(momentum_score) > 0.15:
            volatility = "medium"

        return {
            "savings_momentum": momentum,
            "savings_momentum_score": momentum_score,
            "spending_volatility": volatility,
            "large_outlay_detected": large_outlay,
            "largest_debit_amount": round(largest_debit_amt, 2),
            "largest_debit_merchant": largest_debit_merchant,
            "largest_debit_category": largest_debit_cat,
        }
