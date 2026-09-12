"""Predictive 30-Day Cash-Flow Forecaster and 'Safe-to-Spend' Engine for Bharat Banking.

Solves everyday financial anxiety for non-tech-savvy customers across Bharat:
- Forecasts 30-day forward obligation schedule based on historical debit cycles.
- Computes real-time 'Safe-to-Spend Today' liquidity dial.
- Proactively catches upcoming overdraft risks before cheques or EMIs bounce.
"""

from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class ObligationItem(BaseModel):
    """Predicted upcoming debit obligation."""
    merchant: str
    category: str
    amount: float
    predicted_due_date: str
    is_essential: bool = True  # emi/bills/rent = True; subscriptions/entertainment = False
    confidence: float = 0.90


class CashFlowForecast(BaseModel):
    """30-day forward cash-flow projection and safe-to-spend headroom."""
    current_available_balance: float
    safe_to_spend_today: float
    upcoming_15d_obligations: float
    upcoming_30d_obligations: float
    projected_next_income_date: Optional[str] = None
    projected_next_income_amount: float = 0.0
    liquidity_runway_days: int
    deficit_predicted: bool = False
    deficit_date: Optional[str] = None
    deficit_amount: float = 0.0
    upcoming_obligations: List[ObligationItem] = Field(default_factory=list)
    actionable_interventions: List[str] = Field(default_factory=list)


class PredictiveCashFlowEngine:
    """Calculates forward cash flow trajectory, upcoming obligations, and safe-to-spend balance."""

    @classmethod
    def forecast(
        cls,
        available_balance: float,
        monthly_income: float,
        transactions: List[Dict[str, Any]],
        reference_date: Optional[datetime] = None
    ) -> CashFlowForecast:
        """Projects 30-day forward cash-flow and computes safe-to-spend headroom.

        Args:
            available_balance: Current liquid balance in CASA account.
            monthly_income: Declared or inferred monthly income.
            transactions: Historical normalized transaction ledger.
            reference_date: Base datetime for forecasting (defaults to current UTC).
        """
        ref_dt = reference_date or datetime.now(timezone.utc)
        ref_day = ref_dt.day

        # 1. Identify recurring recurring transactions and their day-of-month cadence
        recurring_tracker: Dict[str, Dict[str, Any]] = {}
        salary_day = 1

        for tx in transactions:
            amt = abs(float(tx.get("amount", 0.0)))
            cat = str(tx.get("category", "")).lower()
            tx_type = str(tx.get("type", "debit")).lower()
            merchant = str(tx.get("merchant", "Merchant"))

            # Track salary credit day
            if tx_type == "credit" and (cat == "salary" or "salary" in merchant.lower()):
                dt_raw = tx.get("datetime") or tx.get("timestamp")
                if isinstance(dt_raw, datetime):
                    salary_day = dt_raw.day
                elif isinstance(dt_raw, str) and len(dt_raw) >= 10:
                    try:
                        salary_day = datetime.fromisoformat(dt_raw[:19]).day
                    except Exception:
                        salary_day = 1
                continue

            # Track recurring debits
            is_rec = tx.get("is_recurring") or cat in ["emi", "bills", "rent", "entertainment"]
            if tx_type == "debit" and is_rec and amt > 0:
                key = f"{cat}::{merchant}"
                dt_raw = tx.get("datetime") or tx.get("timestamp")
                tx_day = 5
                if isinstance(dt_raw, datetime):
                    tx_day = dt_raw.day
                elif isinstance(dt_raw, str) and len(dt_raw) >= 10:
                    try:
                        tx_day = datetime.fromisoformat(dt_raw[:19]).day
                    except Exception:
                        tx_day = 5

                if key not in recurring_tracker:
                    recurring_tracker[key] = {
                        "merchant": merchant,
                        "category": cat,
                        "amount": amt,
                        "day_of_month": tx_day,
                        "count": 1,
                        "is_essential": cat not in ["entertainment", "gaming"]
                    }
                else:
                    entry = recurring_tracker[key]
                    entry["amount"] = max(entry["amount"], amt)
                    entry["count"] += 1

        # 2. Build 30-Day Forward Obligation Calendar
        import calendar
        days_in_curr_month = calendar.monthrange(ref_dt.year, ref_dt.month)[1]

        upcoming_items: List[ObligationItem] = []
        tot_15d = 0.0
        tot_30d = 0.0

        for key, rec in recurring_tracker.items():
            due_dom = rec["day_of_month"]
            # Calculate days until this obligation occurs using real calendar month boundaries
            if due_dom >= ref_day:
                days_ahead = due_dom - ref_day
            else:
                days_ahead = (days_in_curr_month - ref_day) + due_dom

            if days_ahead <= 30:
                due_dt = ref_dt + timedelta(days=days_ahead)
                due_iso = due_dt.strftime("%Y-%m-%d")
                amt = rec["amount"]
                is_ess = rec["is_essential"]

                upcoming_items.append(ObligationItem(
                    merchant=rec["merchant"],
                    category=rec["category"],
                    amount=amt,
                    predicted_due_date=due_iso,
                    is_essential=is_ess,
                    confidence=0.92 if rec["count"] >= 2 else 0.78
                ))

                tot_30d += amt
                if days_ahead <= 15:
                    tot_15d += amt

        # Sort upcoming items by due date ascending
        upcoming_items.sort(key=lambda x: x.predicted_due_date)

        # 3. Predict Next Income Credit
        if salary_day >= ref_day:
            income_days_ahead = salary_day - ref_day
        else:
            income_days_ahead = (days_in_curr_month - ref_day) + salary_day
        next_income_dt = ref_dt + timedelta(days=income_days_ahead)
        next_income_iso = next_income_dt.strftime("%Y-%m-%d")
        next_income_amt = monthly_income if monthly_income > 0 else 50000.0

        # 4. Safe-to-Spend Calculation
        # Emergency reserve: 5% of monthly income or ₹2,000 baseline
        emergency_buffer = max(2000.0, monthly_income * 0.05) if monthly_income > 0 else 2000.0
        committed_15d = tot_15d
        safe_to_spend = max(0.0, round(available_balance - committed_15d - emergency_buffer, 2))

        # 5. Chronological Deficit / Cash-flow crunch trajectory simulation
        events: List[Dict[str, Any]] = []
        if next_income_amt > 0 and next_income_iso and income_days_ahead <= 30:
            events.append({
                "date": next_income_iso,
                "type": "income",
                "amount": next_income_amt,
                "description": "Projected Monthly Income"
            })
        for item in upcoming_items:
            events.append({
                "date": item.predicted_due_date,
                "type": "obligation",
                "amount": -item.amount,
                "description": item.merchant,
                "item": item
            })

        # Sort events chronologically. For identical dates, credit arrives before debit (start of business day)
        events.sort(key=lambda x: (x["date"], 0 if x["type"] == "income" else 1))

        running_balance = available_balance
        deficit_predicted = False
        deficit_date = None
        deficit_amount = 0.0

        for ev in events:
            running_balance += ev["amount"]
            if running_balance < 0 and not deficit_predicted:
                deficit_predicted = True
                deficit_date = ev["date"]
                deficit_amount = round(abs(running_balance), 2)

        # 6. Actionable Interventions & Empathetic Nudges
        interventions: List[str] = []
        if deficit_predicted:
            interventions.append(
                f"Projected shortfall of ₹{deficit_amount:,.2f} around {deficit_date}. Avoid non-essential discretionary spends."
            )
            # Find non-essential subscriptions that can be paused
            pausable = [it for it in upcoming_items if not it.is_essential]
            if pausable:
                total_pause_savings = sum(p.amount for p in pausable)
                interventions.append(
                    f"1-Tap Subscription Optimization: Pausing {len(pausable)} non-essential subscriptions saves ₹{total_pause_savings:,.2f}."
                )
            interventions.append(
                "Need assistance? Activate 1-tap Interest-Free Overdraft or convert upcoming bill to 3-month no-cost EMI."
            )
        elif safe_to_spend > 15000:
            interventions.append(
                f"Healthy liquidity: You have ₹{safe_to_spend:,.2f} safe to spend today. Consider moving ₹{round(safe_to_spend * 0.4):,.2f} into 7.85% Smart FD auto-sweep."
            )
        else:
            interventions.append(
                f"Your safe spending limit is ₹{safe_to_spend:,.2f} today after budgeting for upcoming ₹{tot_15d:,.2f} in 15-day obligations."
            )

        # 7. Runway estimation in days
        avg_daily_burn = (tot_30d / 30.0) if tot_30d > 0 else 500.0
        runway_days = int(available_balance / avg_daily_burn) if avg_daily_burn > 0 else 30

        return CashFlowForecast(
            current_available_balance=available_balance,
            safe_to_spend_today=safe_to_spend,
            upcoming_15d_obligations=round(tot_15d, 2),
            upcoming_30d_obligations=round(tot_30d, 2),
            projected_next_income_date=next_income_iso,
            projected_next_income_amount=next_income_amt,
            liquidity_runway_days=min(180, max(0, runway_days)),
            deficit_predicted=deficit_predicted,
            deficit_date=deficit_date,
            deficit_amount=deficit_amount,
            upcoming_obligations=upcoming_items,
            actionable_interventions=interventions
        )
