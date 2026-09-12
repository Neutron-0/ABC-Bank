"""Resilient Transaction Sanitizer & Merchant Normalizer for Indian Banking Context."""

from __future__ import annotations
import re
from datetime import datetime
from typing import Dict, Any, List, Optional


class TransactionNormalizer:
    """Normalizes raw banking transaction narratives, categories, and timestamps."""

    # Pre-compiled regex patterns for narrative cleaning
    _UPI_REF_REGEX = re.compile(r"(?i)\b(upi[-/]?ref[-:]?|rrn[-:]?|utr[-:]?|\d{12})\b")
    _IFSC_REGEX = re.compile(r"(?i)\b[A-Z]{4}0[A-Z0-9]{6}\b")
    _POS_TERMINAL_REGEX = re.compile(r"(?i)\b(pos[-_]?\d+|atm[-_]?\w+|\*pos|\*ecom)\b")
    _SPECIAL_CHARS_REGEX = re.compile(r"[^a-zA-Z0-9\s\-&/.]")

    # Canonical merchant dictionary rules
    _MERCHANT_MAP = [
        # Transit
        (re.compile(r"(?i)\b(metro|dmrc|nmrc|bmrc|delhi\s*metro|smart\s*card|metro\s*qr)\b"), "Delhi Metro Smart Card", "transport"),
        (re.compile(r"(?i)\b(uber|ola|rapido|blusmart)\b"), "Cab Commute", "transport"),
        (re.compile(r"(?i)\b(irctc|indian\s*railways)\b"), "IRCTC Train Booking", "transport"),
        (re.compile(r"(?i)\b(fastag|nhai|toll)\b"), "NHAI FASTag Recharge", "transport"),

        # Healthcare / Medical
        (re.compile(r"(?i)\b(hospital|max\s*super|apollo\s*hosp|fortis|medanta|aiims|dr\s*lal|pathlabs)\b"), "Max Super Speciality Hospital", "healthcare"),
        (re.compile(r"(?i)\b(pharmacy|chemist|apollo\s*pharm|medplus|netmeds|tata\s*1mg|pharmeasy)\b"), "Apollo Pharmacy", "healthcare"),

        # Loans & EMI
        (re.compile(r"(?i)\b(home\s*loan|hl\s*emi|hdfc\s*home|sbi\s*home)\b"), "HDFC Bank Home Loan", "emi"),
        (re.compile(r"(?i)\b(auto\s*loan|car\s*loan|bajaj\s*fin|tvs\s*credit)\b"), "Bajaj Finserv Auto Loan", "emi"),
        (re.compile(r"(?i)\b(personal\s*loan|pl\s*emi|credit\s*card\s*emi)\b"), "Personal Loan EMI", "emi"),

        # Salary & Professional Income
        (re.compile(r"(?i)\b(salary|payroll|corp\s*salary|infosys|tcs|wipro|tech\s*mahindra|accenture)\b"), "Corporate Salary Credit", "salary"),

        # Investments & Wealth
        (re.compile(r"(?i)\b(groww|zerodha|upstox|kuvera|mutual\s*fund|sip|uti\s*mf|hdfc\s*mf|nippon)\b"), "Groww Mutual Fund SIP", "investment"),
        (re.compile(r"(?i)\b(fixed\s*deposit|term\s*deposit|recurring\s*deposit|fd\s*booking)\b"), "Smart Term Deposit", "savings"),

        # Utilities & Telecom
        (re.compile(r"(?i)\b(electricity|tata\s*power|bses|bescom|uppcl|power\s*corp)\b"), "Tata Power Electricity", "bills"),
        (re.compile(r"(?i)\b(airtel|jio|vi\s*bill|vodafone|postpaid|broadband|act\s*fiber)\b"), "Airtel Fiber & Postpaid", "bills"),
        (re.compile(r"(?i)\b(gas\s*bill|indane|bharat\s*gas|adani\s*gas|igl)\b"), "Indane Gas Utility", "bills"),

        # Digital Subscriptions & Entertainment
        (re.compile(r"(?i)\b(netflix|prime\s*video|spotify|disney|hotstar|youtube\s*prem|apple\.com/bill)\b"), "Digital Subscription", "entertainment"),

        # Food & Grocery
        (re.compile(r"(?i)\b(swiggy|dineout)\b"), "Swiggy Food & Dining", "food"),
        (re.compile(r"(?i)\b(zomato|eats)\b"), "Zomato Food Delivery", "food"),
        (re.compile(r"(?i)\b(zepto)\b"), "Zepto Quick Commerce", "groceries"),
        (re.compile(r"(?i)\b(blinkit)\b"), "Blinkit Groceries", "groceries"),
        (re.compile(r"(?i)\b(instamart|bigbasket|dmart|reliance\s*retail)\b"), "Grocery & Essentials", "groceries"),

        # Fuel & Auto Spends
        (re.compile(r"(?i)\b(iocl|bpcl|hpcl|petrol|diesel|fuel|shell\s*petrol)\b"), "Fuel & Highway Station", "transport"),

        # Agriculture & Rural
        (re.compile(r"(?i)\b(fertilizer|iffco|kisan|seeds|tractor|krishi|apmc)\b"), "Agricultural Supplies & Seeds", "agriculture"),

        # Pension & Social Welfare
        (re.compile(r"(?i)\b(pension|treasury|epfo|pm-kisan|dbt\s*credit)\b"), "Government Pension Credit", "salary"),

        # Suspicious / High-Risk Gaming / International
        (re.compile(r"(?i)\b(globaltech|gaming\s*dublin|casino|betting|odd\s*hours\s*gaming)\b"), "GlobalTech Gaming Dublin", "gaming")
    ]

    # High-throughput resolution and narration caches for massive load handling
    _NARRATION_CACHE: Dict[str, str] = {}
    _RESOLVE_CACHE: Dict[str, Tuple[str, str]] = {}
    _UPI_VPA_REGEX = re.compile(r"(?i)@[a-zA-Z0-9.\-_]+")
    _BANKING_TAGS_REGEX = re.compile(r"(?i)\b(nach|ach|neft|rtgs|imps|bil/onl|ecom|pos|p2a|p2p|p2m|dr|cr)\b")

    @classmethod
    def clean_narration(cls, text: str) -> str:
        """Strips out reference IDs, banking codes, and returns sanitized merchant string."""
        if not text:
            return "General Transaction"
        if text in cls._NARRATION_CACHE:
            return cls._NARRATION_CACHE[text]

        s = cls._UPI_REF_REGEX.sub("", text)
        s = cls._IFSC_REGEX.sub("", s)
        s = cls._POS_TERMINAL_REGEX.sub("", s)
        s = cls._UPI_VPA_REGEX.sub("", s)
        s = cls._BANKING_TAGS_REGEX.sub("", s)
        s = cls._SPECIAL_CHARS_REGEX.sub(" ", s)
        cleaned = " ".join(s.split()).strip() or "General Transaction"
        if len(cls._NARRATION_CACHE) < 10000:
            cls._NARRATION_CACHE[text] = cleaned
        return cleaned

    @classmethod
    def resolve_merchant_and_category(cls, raw_merchant: str, raw_category: Optional[str] = None) -> Tuple[str, str]:
        """Maps narrative to canonical merchant name and primary spend category with O(1) cache."""
        cache_key = f"{raw_merchant}::{raw_category or ''}"
        if cache_key in cls._RESOLVE_CACHE:
            return cls._RESOLVE_CACHE[cache_key]

        narration = cls.clean_narration(raw_merchant)
        matched = False
        canonical_name = narration or "General Merchant"
        canonical_cat = raw_category or "other"

        for pattern, c_name, c_cat in cls._MERCHANT_MAP:
            if pattern.search(raw_merchant) or pattern.search(narration):
                canonical_name = c_name
                canonical_cat = raw_category if raw_category and raw_category not in ["other", "general"] else c_cat
                matched = True
                break

        res = (canonical_name, canonical_cat)
        if len(cls._RESOLVE_CACHE) < 10000:
            cls._RESOLVE_CACHE[cache_key] = res
        return res

    @classmethod
    def parse_timestamp(cls, ts_val: Any) -> datetime:
        """Robustly parses ISO, date strings, or Unix epoch timestamps into datetime objects with fast path."""
        if isinstance(ts_val, datetime):
            return ts_val
        if isinstance(ts_val, (int, float)):
            try:
                # Distinguish milliseconds (> 1e11) vs seconds
                val_sec = ts_val / 1000.0 if ts_val > 1e11 else float(ts_val)
                return datetime.fromtimestamp(val_sec)
            except Exception:
                return datetime.now()
        if not ts_val or not isinstance(ts_val, str):
            return datetime.now()
        clean_ts = ts_val.strip()
        try:
            # Fast path for ISO 8601 (covers 99.9% of modern bank APIs)
            return datetime.fromisoformat(clean_ts)
        except Exception:
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d-%m-%Y %H:%M:%S", "%d/%m/%Y"):
                try:
                    return datetime.strptime(clean_ts, fmt)
                except ValueError:
                    continue
        return datetime.now()

    @classmethod
    def normalize(cls, raw_tx: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes a single transaction dictionary into a clean canonical record."""
        raw_merchant_val = raw_tx.get("merchant") or raw_tx.get("narration") or "General Merchant"
        raw_merchant = str(raw_merchant_val).strip() if raw_merchant_val is not None else "General Merchant"
        if not raw_merchant or raw_merchant.lower() == "none":
            raw_merchant = "General Merchant"
        raw_cat = raw_tx.get("category")
        canonical_merchant, canonical_category = cls.resolve_merchant_and_category(raw_merchant, raw_cat)

        raw_amt = raw_tx.get("amount")
        amt = 0.0
        if raw_amt is not None:
            if isinstance(raw_amt, (int, float)):
                amt = abs(float(raw_amt))
            elif isinstance(raw_amt, str):
                # Clean currency symbols (₹, $, etc.), commas, spaces
                clean_amt = re.sub(r"[^\d.]", "", raw_amt)
                try:
                    amt = abs(float(clean_amt)) if clean_amt else 0.0
                except (ValueError, TypeError):
                    amt = 0.0

        tx_type = str(raw_tx.get("type") or "debit").lower().strip()
        if canonical_category == "salary" or "salary" in raw_merchant.lower():
            tx_type = "credit"
        elif tx_type not in ["credit", "debit"]:
            tx_type = "debit"

        dt = cls.parse_timestamp(raw_tx.get("timestamp") or raw_tx.get("date"))

        tx_id = raw_tx.get("id")
        tx_id_str = str(tx_id) if tx_id is not None else f"tx_{int(dt.timestamp() * 1000)}"

        return {
            "id": tx_id_str,
            "customer_id": str(raw_tx.get("customer_id", "cust_bharat_001")),
            "amount": amt,
            "type": tx_type,
            "category": canonical_category,
            "merchant": canonical_merchant,
            "raw_merchant": raw_merchant,
            "timestamp": dt.isoformat(),
            "datetime": dt,
            "hour": dt.hour,
            "weekday": dt.weekday(),  # 0=Monday, 6=Sunday
            "is_weekend": dt.weekday() >= 5,
            "is_recurring": bool(raw_tx.get("is_recurring", canonical_category in ["emi", "bills", "salary"]))
        }

    @classmethod
    def normalize_batch(cls, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalizes a batch of transactions and sorts chronologically."""
        if not transactions:
            return []
        normalized = [cls.normalize(tx) for tx in transactions]
        normalized.sort(key=lambda x: x["datetime"])
        return normalized
