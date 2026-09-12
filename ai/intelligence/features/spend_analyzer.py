"""Granular Category Spend Telemetry & Budget Allocation Engine for Bharat Banking.

Breaks down spending across:
- Food & Dining (Swiggy, Zomato, cafes)
- Stocks & Investments (Zerodha, Groww, SIPs, mutual funds)
- Groceries & Quick-Commerce (Blinkit, Zepto, DMart)
- Entertainment & OTT (Netflix, Spotify, BookMyShow)
- Transport & Commute (Metro, Uber, Ola, fuel)
- Healthcare & Pharmacy (Apollo, 1mg, clinics)
- Bills & Utilities (Electricity, gas, broadband)
- EMI & Debt Servicing (Home loan, auto loan)
- Shopping & Lifestyle (Amazon, Flipkart, retail)

Computes 50/30/20 rule allocation, average ticket sizes, and discretionary leakage alerts.
"""

from __future__ import annotations
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CategorySpendItem(BaseModel):
    """Metrics for an individual spend category."""
    category: str
    display_name: str
    total_amount: float
    percentage_of_income: float
    percentage_of_total_spend: float
    transaction_count: int
    average_ticket_size: float
    status: str = "normal"  # normal, elevated, leakage_warning


class BudgetAllocation50_30_20(BaseModel):
    """50/30/20 Financial Wellness Rule Compliance."""
    needs_amount: float
    needs_percentage: float  # Benchmark: <= 50%
    wants_amount: float
    wants_percentage: float  # Benchmark: <= 30%
    savings_investments_amount: float
    savings_investments_percentage: float  # Benchmark: >= 20%
    rule_status: str  # optimal, wants_elevated, savings_lagging, debt_burdened


class GranularSpendProfile(BaseModel):
    """Comprehensive category spend breakdown and behavioral budget profile."""
    total_spend: float
    monthly_income: float
    categories: Dict[str, CategorySpendItem]
    allocation_50_30_20: BudgetAllocation50_30_20
    discretionary_leakage_alerts: List[str] = Field(default_factory=list)
    top_spend_category: str
    top_investment_vehicle: Optional[str] = None


class SpendAnalyzer:
    """Analyzes and categorizes Indian banking transactions into fine-grained spend dimensions."""

    CATEGORY_PATTERNS = {
        "stocks_investments": (
            re.compile(r"(?i)\b(groww|zerodha|upstox|kuvera|angel\s*one|mutual\s*fund|sip|uti\s*mf|hdfc\s*mf|nippon|bse|nse|etf|gold\s*saving)\b"),
            "Stocks & Investments"
        ),
        "groceries": (
            re.compile(r"(?i)\b(blinkit|zepto|instamart|bigbasket|dmart|reliance\s*fresh|nature\s*basket|grocer|kirana|supermarket)\b"),
            "Groceries & Essentials"
        ),
        "food": (
            re.compile(r"(?i)\b(swiggy|zomato|eats|dineout|mcdonald|starbucks|domino|pizza|burger|chai|cafe|restaurant)\b"),
            "Food & Dining"
        ),
        "entertainment": (
            re.compile(r"(?i)\b(netflix|prime\s*video|spotify|disney|hotstar|youtube|bookmyshow|pvr|inox|gaming|steam|apple\.com/bill)\b"),
            "Entertainment & Subscriptions"
        ),
        "transport": (
            re.compile(r"(?i)\b(metro|dmrc|nmrc|bmrc|uber|ola|rapido|blusmart|fastag|nhai|toll|irctc|petrol|fuel|hpcl|bpcl|ioc)\b"),
            "Transport & Commute"
        ),
        "healthcare": (
            re.compile(r"(?i)\b(hospital|apollo|max\s*super|fortis|medanta|aiims|pharmacy|chemist|medplus|netmeds|tata\s*1mg|pharmeasy|clinic|pathlab)\b"),
            "Healthcare & Pharmacy"
        ),
        "bills_utilities": (
            re.compile(r"(?i)\b(electricity|tata\s*power|bses|bescom|uppcl|power|airtel|jio|vi\s*bill|broadband|water|gas|indane|adani\s*gas|igl)\b"),
            "Bills & Utilities"
        ),
        "emi_debt": (
            re.compile(r"(?i)\b(home\s*loan|hl\s*emi|auto\s*loan|car\s*loan|bajaj\s*fin|personal\s*loan|pl\s*emi|credit\s*card\s*bill|credit\s*card\s*emi)\b"),
            "EMI & Debt Servicing"
        ),
        "shopping": (
            re.compile(r"(?i)\b(amazon|flipkart|myntra|ajio|nykaa|zara|h&m|lifestyle|shoppers\s*stop|croma|reliance\s*digital)\b"),
            "Shopping & Lifestyle"
        )
    }

    _DEFAULT_CAT_MAP = {
        "investment": ("stocks_investments", "Stocks & Investments"),
        "savings": ("stocks_investments", "Stocks & Investments"),
        "groceries": ("groceries", "Groceries & Essentials"),
        "food": ("food", "Food & Dining"),
        "entertainment": ("entertainment", "Entertainment & Subscriptions"),
        "transport": ("transport", "Transport & Commute"),
        "healthcare": ("healthcare", "Healthcare & Pharmacy"),
        "bills": ("bills_utilities", "Bills & Utilities"),
        "emi": ("emi_debt", "EMI & Debt Servicing"),
        "gaming": ("entertainment", "Entertainment & Subscriptions"),
    }

    _CLASSIFY_CACHE: Dict[str, tuple[str, str]] = {}

    @classmethod
    def classify_category(cls, merchant: str, default_cat: Optional[str] = None) -> tuple[str, str]:
        """Maps merchant string to granular category and display name with O(1) fast path & caching."""
        cat_lower = str(default_cat or "").lower().strip()
        if cat_lower in cls._DEFAULT_CAT_MAP:
            return cls._DEFAULT_CAT_MAP[cat_lower]

        cache_key = f"{merchant}::{cat_lower}"
        if cache_key in cls._CLASSIFY_CACHE:
            return cls._CLASSIFY_CACHE[cache_key]

        m_str = str(merchant or "").strip()
        result = ("other", "Other Expenses")

        for cat_key, (pattern, disp_name) in cls.CATEGORY_PATTERNS.items():
            if pattern.search(m_str):
                result = (cat_key, disp_name)
                break

        if len(cls._CLASSIFY_CACHE) < 10000:
            cls._CLASSIFY_CACHE[cache_key] = result

        return result

    @classmethod
    def analyze(cls, transactions: List[Dict[str, Any]], monthly_income: float = 75000.0) -> GranularSpendProfile:
        """Executes full categorical spend analysis and computes 50/30/20 budget telemetry."""
        cat_totals: Dict[str, float] = {}
        cat_counts: Dict[str, int] = {}
        cat_display_names: Dict[str, str] = {}
        total_debit_volume = 0.0

        for tx in transactions:
            tx_type = str(tx.get("type", "debit")).lower()
            if tx_type != "debit":
                continue

            amt = abs(float(tx.get("amount", 0.0)))
            if amt <= 0:
                continue

            merchant = str(tx.get("merchant") or tx.get("narration") or "")
            default_cat = str(tx.get("category") or "")

            cat_key, disp_name = cls.classify_category(merchant, default_cat)

            cat_totals[cat_key] = cat_totals.get(cat_key, 0.0) + amt
            cat_counts[cat_key] = cat_counts.get(cat_key, 0) + 1
            cat_display_names[cat_key] = disp_name
            total_debit_volume += amt

        # Build category items
        category_items: Dict[str, CategorySpendItem] = {}
        leakage_alerts: List[str] = []
        eff_income = max(1000.0, monthly_income)

        for cat_key, total_amt in cat_totals.items():
            count = cat_counts[cat_key]
            avg_ticket = round(total_amt / count, 2) if count > 0 else 0.0
            pct_income = round((total_amt / eff_income) * 100, 1)
            pct_spend = round((total_amt / total_debit_volume) * 100, 1) if total_debit_volume > 0 else 0.0

            # Status and leakage flags
            status = "normal"
            if cat_key == "food" and pct_income > 15.0:
                status = "leakage_warning"
                leakage_alerts.append(f"Food delivery spends ({pct_income}%) exceed recommended 10% ceiling.")
            elif cat_key == "entertainment" and pct_income > 8.0:
                status = "leakage_warning"
                leakage_alerts.append(f"Subscriptions and entertainment ({pct_income}%) are higher than usual.")
            elif cat_key == "emi_debt" and pct_income > 40.0:
                status = "leakage_warning"
                leakage_alerts.append(f"Debt obligations ({pct_income}%) exceed RBI 40% prudence cap.")
            elif pct_income > 25.0:
                status = "elevated"

            category_items[cat_key] = CategorySpendItem(
                category=cat_key,
                display_name=cat_display_names[cat_key],
                total_amount=round(total_amt, 2),
                percentage_of_income=pct_income,
                percentage_of_total_spend=pct_spend,
                transaction_count=count,
                average_ticket_size=avg_ticket,
                status=status
            )

        # 50/30/20 Rule Aggregations
        needs_keys = ["groceries", "bills_utilities", "emi_debt", "healthcare", "transport"]
        wants_keys = ["food", "entertainment", "shopping", "other"]
        savings_keys = ["stocks_investments"]

        needs_amt = sum(cat_totals.get(k, 0.0) for k in needs_keys)
        wants_amt = sum(cat_totals.get(k, 0.0) for k in wants_keys)
        savings_amt = sum(cat_totals.get(k, 0.0) for k in savings_keys)

        needs_pct = round((needs_amt / eff_income) * 100, 1)
        wants_pct = round((wants_amt / eff_income) * 100, 1)
        savings_pct = round((savings_amt / eff_income) * 100, 1)

        rule_status = "optimal"
        if needs_pct > 65.0:
            rule_status = "debt_burdened"
        elif wants_pct > 35.0:
            rule_status = "wants_elevated"
        elif savings_pct < 10.0 and eff_income >= 40000:
            rule_status = "savings_lagging"

        alloc = BudgetAllocation50_30_20(
            needs_amount=round(needs_amt, 2),
            needs_percentage=needs_pct,
            wants_amount=round(wants_amt, 2),
            wants_percentage=wants_pct,
            savings_investments_amount=round(savings_amt, 2),
            savings_investments_percentage=savings_pct,
            rule_status=rule_status
        )

        top_cat = max(cat_totals, key=cat_totals.get) if cat_totals else "other"
        top_invest = "Mutual Fund SIP" if "stocks_investments" in cat_totals else None

        return GranularSpendProfile(
            total_spend=round(total_debit_volume, 2),
            monthly_income=monthly_income,
            categories=category_items,
            allocation_50_30_20=alloc,
            discretionary_leakage_alerts=leakage_alerts,
            top_spend_category=top_cat,
            top_investment_vehicle=top_invest
        )
