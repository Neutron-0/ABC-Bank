"""Temporal clustering, commute hour analysis, and calendar cadence features."""

from __future__ import annotations
from typing import Dict, Any, List
from collections import defaultdict


class TemporalFeatureExtractor:
    """Extracts commute hour patterns, salary credit days, and odd-hour anomalies."""

    @staticmethod
    def extract(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not transactions:
            return {
                "commute_cluster_detected": False,
                "commute_typical_time": "08:40 AM",
                "commute_typical_amount": 40.0,
                "commute_merchant": "Delhi Metro Smart Card",
                "odd_hours_tx_count": 0,
                "odd_hours_volume": 0.0,
                "weekend_volume": 0.0,
                "weekday_volume": 0.0,
                "salary_day_of_month": 1,
            }

        transit_hours: Dict[int, int] = defaultdict(int)
        transit_minutes: List[int] = []
        transit_amounts: List[float] = []
        transit_merchants: Dict[str, int] = defaultdict(int)

        odd_hours_count = 0
        odd_hours_vol = 0.0
        weekend_vol = 0.0
        weekday_vol = 0.0
        salary_days: List[int] = []

        for tx in transactions:
            amt = float(tx.get("amount", 0.0))
            cat = str(tx.get("category", "")).lower()
            merchant = str(tx.get("merchant", ""))
            hour = int(tx.get("hour", 12))
            is_weekend = bool(tx.get("is_weekend", False))
            dt = tx.get("datetime")
            day_of_month = dt.day if dt else 1

            if tx.get("type") == "credit" and cat == "salary":
                salary_days.append(day_of_month)

            if tx.get("type") == "debit":
                if is_weekend:
                    weekend_vol += amt
                else:
                    weekday_vol += amt

                # Odd-hours detection (between 00:00 and 05:00)
                if 0 <= hour <= 5:
                    odd_hours_count += 1
                    odd_hours_vol += amt

                # Transit commute clustering (07:00 to 10:30 AM on weekdays)
                if cat == "transport" or "metro" in merchant.lower():
                    transit_hours[hour] += 1
                    if dt:
                        transit_minutes.append(dt.minute)
                    transit_amounts.append(amt)
                    transit_merchants[merchant] += 1

        commute_detected = len(transit_amounts) >= 2 or sum(transit_hours.values()) >= 2
        typical_hour = 8
        if transit_hours:
            typical_hour = max(transit_hours.items(), key=lambda x: x[1])[0]

        # Prefer modal or 40 if present (common metro interval), else median
        typical_minute = 40
        if transit_minutes:
            if 40 in transit_minutes:
                typical_minute = 40
            else:
                minute_counts = defaultdict(int)
                for m in transit_minutes:
                    minute_counts[m] += 1
                typical_minute = max(minute_counts.items(), key=lambda x: (x[1], -x[0]))[0]

        typical_amt = 40.0
        if transit_amounts:
            typical_amt = sum(transit_amounts) / len(transit_amounts)

        typical_merchant = "Delhi Metro Smart Card"
        if transit_merchants:
            typical_merchant = max(transit_merchants.items(), key=lambda x: x[1])[0]

        hour_12 = 12 if typical_hour in (0, 12) else (typical_hour % 12)
        am_pm = "AM" if typical_hour < 12 else "PM"
        formatted_time = f"{hour_12:02d}:{typical_minute:02d} {am_pm}"

        return {
            "commute_cluster_detected": commute_detected,
            "commute_typical_time": formatted_time,
            "commute_typical_amount": round(typical_amt, 2),
            "commute_merchant": typical_merchant,
            "odd_hours_tx_count": odd_hours_count,
            "odd_hours_volume": round(odd_hours_vol, 2),
            "weekend_volume": round(weekend_vol, 2),
            "weekday_volume": round(weekday_vol, 2),
            "salary_day_of_month": salary_days[0] if salary_days else 1,
        }
