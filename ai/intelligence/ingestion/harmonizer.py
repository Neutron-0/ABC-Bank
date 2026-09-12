"""Multi-Source Dirty Data Harmonization and Sanitization Engine for Bharat Banking.

Ingests, normalizes, deduplicates, and fuses disparate feeds:
- Core Banking Ledger (CBS)
- UPI Switch Logs (NPCI wire format)
- SMS / Device Notification Scrapes
- Credit Bureau (CIBIL / Experian)
- BBPS & Utility Aggregators
- NCMC Transit Card Readers
- Customer KYC & Demographics
"""

from __future__ import annotations
import re
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Union

from ai.intelligence.features.normalizer import TransactionNormalizer
from ai.intelligence.ingestion.models import (
    CBSLedgerRecord,
    UPISwitchLog,
    SMSNotificationRecord,
    BureauCreditProfile,
    BBPSUtilityRecord,
    NCMCTransitRecord,
    CustomerDemographics,
    UnifiedCustomerProfile,
)


class MultiSourceDataHarmonizer:
    """Enterprise-grade multi-source harmonizer designed for real-world messy Bharat banking data."""

    # Common Indian Bank SMS regex patterns
    SMS_DEBIT_PATTERN = re.compile(r"(?:debited by|spent|paid|sent)\s*(?:INR|Rs\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)", re.IGNORECASE)
    SMS_CREDIT_PATTERN = re.compile(r"(?:credited with|received|deposited)\s*(?:INR|Rs\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)", re.IGNORECASE)
    SMS_BAL_PATTERN = re.compile(r"(?:avl(?:[\s.]*bal|[\s.]*balance)?|balance(?:[\s:]*is)?)\s*(?:INR|Rs\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)", re.IGNORECASE)
    SMS_MERCHANT_PATTERN = re.compile(r"(?:at|to|info)\s+([A-Za-z0-9\s._\-]+?)(?:\.|\s+on|\s+ref|\s+avl|$)", re.IGNORECASE)

    @classmethod
    def parse_flexible_timestamp(cls, raw_ts: Any) -> str:
        """Parses heterogeneous datetimes (ISO-8601, Epoch millis/seconds, DD-MM-YYYY, DD/MM/YYYY)."""
        if not raw_ts:
            return datetime.now(timezone.utc).isoformat()

        if isinstance(raw_ts, (int, float)):
            # Distinguish seconds vs milliseconds
            if raw_ts > 1e11:
                return datetime.fromtimestamp(raw_ts / 1000.0, tz=timezone.utc).isoformat()
            return datetime.fromtimestamp(raw_ts, tz=timezone.utc).isoformat()

        ts_str = str(raw_ts).strip()
        if not ts_str:
            return datetime.now(timezone.utc).isoformat()

        # Try numeric string (epoch)
        if ts_str.isdigit():
            val = int(ts_str)
            if val > 1e11:
                return datetime.fromtimestamp(val / 1000.0, tz=timezone.utc).isoformat()
            return datetime.fromtimestamp(val, tz=timezone.utc).isoformat()

        formats = [
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%S.%f",
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%d %H:%M:%S",
            "%d-%m-%Y %H:%M:%S",
            "%d/%m/%Y %H:%M:%S",
            "%d-%m-%Y %H:%M",
            "%d/%m/%Y %H:%M",
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%Y-%m-%d"
        ]

        # Clean any trailing 'Z' or timezone offsets for basic parsing
        clean_ts = ts_str.replace("Z", "").split("+")[0]
        for fmt in formats:
            try:
                dt = datetime.strptime(clean_ts, fmt)
                return dt.replace(tzinfo=timezone.utc).isoformat()
            except ValueError:
                continue

        # Fallback to current time if unparseable
        return datetime.now(timezone.utc).isoformat()

    @classmethod
    def compute_idempotency_hash(cls, merchant: str, amount: float, tx_type: str, timestamp_str: str) -> str:
        """Computes deterministic MD5 signature to catch duplicate webhooks and retry packets."""
        # Truncate timestamp to day granularity to catch same-day duplicate retries
        date_prefix = timestamp_str[:10] if len(timestamp_str) >= 10 else timestamp_str
        payload = f"{merchant.lower().strip()}|{amount:.2f}|{tx_type}|{date_prefix}"
        return hashlib.md5(payload.encode("utf-8")).hexdigest()

    @classmethod
    def clean_amount(cls, raw_amount: Any) -> float:
        """Cleans dirty amount strings (e.g. '₹ 1,450.50', negative numbers, nulls)."""
        if raw_amount is None:
            return 0.0
        if isinstance(raw_amount, (int, float)):
            return abs(float(raw_amount))

        amt_str = str(raw_amount).replace("₹", "").replace("Rs.", "").replace(",", "").strip()
        try:
            val = float(amt_str)
            return abs(val)
        except (ValueError, TypeError):
            return 0.0

    @classmethod
    def parse_upi_wire_string(cls, raw_upi: str) -> tuple[str, str]:
        """Extracts merchant and category hints from messy UPI switch logs."""
        # e.g., "UPI/CR/982347102938/DELHI METRO SMART CARD/METRO@DMRC/NA"
        if not raw_upi:
            return "UPI Payment", "transfer"

        parts = [p.strip() for p in raw_upi.split("/") if p.strip()]
        merchant = "UPI Transaction"
        for part in parts:
            part_lower = part.lower()
            if any(k in part_lower for k in ["metro", "dmrc", "swiggy", "zomato", "blinkit", "netflix", "airtel", "apollo", "hdfc"]):
                merchant = part
                break
            elif "@" in part:
                # VPA handle
                handle = part.split("@")[0].replace(".", " ").title()
                merchant = f"UPI/{handle}"
            elif len(part) > 4 and not part.isdigit() and part not in ["UPI", "CR", "DR", "NA"]:
                merchant = part

        merchant, cat = TransactionNormalizer.resolve_merchant_and_category(merchant)
        return merchant, cat

    @classmethod
    def parse_sms_body(cls, body: str, received_at: Optional[str]) -> Optional[Dict[str, Any]]:
        """Extracts structured transaction and balance data from unstructured SMS string."""
        if not body:
            return None

        # Determine transaction type
        debit_match = cls.SMS_DEBIT_PATTERN.search(body)
        credit_match = cls.SMS_CREDIT_PATTERN.search(body)

        tx_type = "debit"
        amount = 0.0
        if debit_match:
            raw_amt = debit_match.group(1).replace(",", "")
            amount = float(raw_amt)
            tx_type = "debit"
        elif credit_match:
            raw_amt = credit_match.group(1).replace(",", "")
            amount = float(raw_amt)
            tx_type = "credit"
        else:
            return None

        # Extract balance if present
        balance_match = cls.SMS_BAL_PATTERN.search(body)
        balance = None
        if balance_match:
            try:
                balance = float(balance_match.group(1).replace(",", ""))
            except (ValueError, TypeError):
                balance = None

        # Extract merchant
        merchant = "Unknown Merchant"
        merchant_match = cls.SMS_MERCHANT_PATTERN.search(body)
        if merchant_match:
            candidate = merchant_match.group(1).strip()
            if len(candidate) > 2 and candidate.lower() not in ["inr", "rs", "your", "the"]:
                merchant = candidate

        merchant, category = TransactionNormalizer.resolve_merchant_and_category(merchant)
        ts = cls.parse_flexible_timestamp(received_at)

        return {
            "amount": amount,
            "type": tx_type,
            "merchant": merchant,
            "category": category,
            "timestamp": ts,
            "balance_after": balance,
            "source": "SMS"
        }

    @classmethod
    def harmonize(
        cls,
        demographics: Optional[Union[CustomerDemographics, Dict[str, Any]]] = None,
        cbs_records: Optional[List[Union[CBSLedgerRecord, Dict[str, Any]]]] = None,
        upi_logs: Optional[List[Union[UPISwitchLog, Dict[str, Any]]]] = None,
        sms_records: Optional[List[Union[SMSNotificationRecord, Dict[str, Any]]]] = None,
        bureau_profile: Optional[Union[BureauCreditProfile, Dict[str, Any]]] = None,
        utility_records: Optional[List[Union[BBPSUtilityRecord, Dict[str, Any]]]] = None,
        transit_records: Optional[List[Union[NCMCTransitRecord, Dict[str, Any]]]] = None,
        fallback_customer_id: str = "cust_bharat_001"
    ) -> UnifiedCustomerProfile:
        """Fuses all disparate Indian banking sources into a single canonical, sanitized profile."""
        total_raw_count = 0
        cleaned_transactions: List[Dict[str, Any]] = []
        seen_idempotency_hashes: set = set()
        duplicates_dropped = 0
        corrupted_dropped = 0
        balance_conflicts_resolved = 0

        # 1. Demographics & Base Profile Setup
        demo_dict: Dict[str, Any] = {}
        if isinstance(demographics, CustomerDemographics):
            demo_dict = demographics.model_dump()
        elif isinstance(demographics, dict):
            demo_dict = demographics
        else:
            demo_dict = {}

        cust_id = demo_dict.get("customer_id", fallback_customer_id)
        cust_name = demo_dict.get("name", "Bharat Customer")
        monthly_income = float(demo_dict.get("declared_monthly_income", 0.0) or 0.0)

        # Balances container
        available_balance = 0.0
        savings_balance = 0.0
        transit_wallet_balance = 0.0
        fastag_balance = 0.0
        last_cbs_balance_ts = ""

        # 2. Process Core Banking Ledger (CBS)
        if cbs_records:
            for rec in cbs_records:
                total_raw_count += 1
                r = rec.model_dump() if isinstance(rec, CBSLedgerRecord) else rec
                raw_amt = r.get("amount")
                amt = cls.clean_amount(raw_amt)
                if amt <= 0.0:
                    corrupted_dropped += 1
                    continue

                narration = str(r.get("narration") or "CBS Transaction")
                merchant, cat = TransactionNormalizer.resolve_merchant_and_category(narration, r.get("category"))
                tx_type = str(r.get("type") or "debit").lower()
                ts = cls.parse_flexible_timestamp(r.get("timestamp"))

                # Track latest balance
                if r.get("balance_after") is not None:
                    bal_val = cls.clean_amount(r.get("balance_after"))
                    if not last_cbs_balance_ts or ts >= last_cbs_balance_ts:
                        available_balance = bal_val
                        last_cbs_balance_ts = ts

                # Deduplication
                h = cls.compute_idempotency_hash(merchant, amt, tx_type, ts)
                if h in seen_idempotency_hashes:
                    duplicates_dropped += 1
                    continue
                seen_idempotency_hashes.add(h)

                cleaned_transactions.append({
                    "id": str(r.get("txn_id") or f"cbs_{total_raw_count}"),
                    "customer_id": cust_id,
                    "merchant": merchant,
                    "category": cat,
                    "amount": amt,
                    "type": tx_type,
                    "timestamp": ts,
                    "source": "CBS",
                    "is_recurring": cat in ["salary", "emi", "bills", "rent"]
                })

        # 3. Process UPI Switch Logs
        if upi_logs:
            for log in upi_logs:
                total_raw_count += 1
                l = log.model_dump() if isinstance(log, UPISwitchLog) else log
                raw_amt = l.get("amount")
                amt = cls.clean_amount(raw_amt)
                if amt <= 0.0:
                    corrupted_dropped += 1
                    continue

                raw_wire = l.get("raw_upi_string") or l.get("payee_vpa") or "UPI Transaction"
                merchant, cat = cls.parse_upi_wire_string(raw_wire)
                ts = cls.parse_flexible_timestamp(l.get("timestamp"))
                tx_type = "debit"

                h = cls.compute_idempotency_hash(merchant, amt, tx_type, ts)
                if h in seen_idempotency_hashes:
                    duplicates_dropped += 1
                    continue
                seen_idempotency_hashes.add(h)

                cleaned_transactions.append({
                    "id": str(l.get("rrn") or f"upi_{total_raw_count}"),
                    "customer_id": cust_id,
                    "merchant": merchant,
                    "category": cat,
                    "amount": amt,
                    "type": tx_type,
                    "timestamp": ts,
                    "source": "UPI",
                    "is_recurring": False
                })

        # 4. Process SMS / Notification Records
        if sms_records:
            for s in sms_records:
                total_raw_count += 1
                s_dict = s.model_dump() if isinstance(s, SMSNotificationRecord) else s
                parsed = cls.parse_sms_body(s_dict.get("body", ""), s_dict.get("received_at"))
                if not parsed or parsed["amount"] <= 0.0:
                    corrupted_dropped += 1
                    continue

                merchant = parsed["merchant"]
                amt = parsed["amount"]
                tx_type = parsed["type"]
                ts = parsed["timestamp"]

                # Handle Balance Conflict Arbitration
                sms_bal = parsed.get("balance_after")
                if sms_bal is not None:
                    if not last_cbs_balance_ts or ts > last_cbs_balance_ts:
                        # SMS reports more recent balance than old CBS statement
                        available_balance = sms_bal
                        balance_conflicts_resolved += 1

                h = cls.compute_idempotency_hash(merchant, amt, tx_type, ts)
                if h in seen_idempotency_hashes:
                    duplicates_dropped += 1
                    continue
                seen_idempotency_hashes.add(h)

                cleaned_transactions.append({
                    "id": f"sms_{total_raw_count}",
                    "customer_id": cust_id,
                    "merchant": merchant,
                    "category": parsed["category"],
                    "amount": amt,
                    "type": tx_type,
                    "timestamp": ts,
                    "source": "SMS",
                    "is_recurring": parsed["category"] in ["salary", "emi", "bills"]
                })

        # 5. Process Credit Bureau (CIBIL) Tradelines
        bureau_summary: Dict[str, Any] = {}
        if bureau_profile:
            b_dict = bureau_profile.model_dump() if isinstance(bureau_profile, BureauCreditProfile) else bureau_profile
            bureau_summary = {
                "score": b_dict.get("score", 750),
                "active_tradelines": b_dict.get("active_tradelines_count", 1),
                "total_debt": float(b_dict.get("total_outstanding_debt", 0.0)),
                "monthly_emi": float(b_dict.get("monthly_emi_obligations", 0.0)),
                "overdue_amount": float(b_dict.get("overdue_amount", 0.0)),
                "dpd_status": b_dict.get("dpd_status", "000"),
                "cc_utilization": float(b_dict.get("credit_card_utilization_pct", 0.25)),
                "recent_inquiries": b_dict.get("recent_inquiries_30d", 0)
            }
            # Calculate DTI if income is available
            if monthly_income > 0:
                bureau_summary["bureau_dti"] = round(bureau_summary["monthly_emi"] / monthly_income, 3)

        # 6. Process BBPS & Utility Feeds
        utility_alerts: List[Dict[str, Any]] = []
        if utility_records:
            for u in utility_records:
                total_raw_count += 1
                u_dict = u.model_dump() if isinstance(u, BBPSUtilityRecord) else u
                biller_cat = u_dict.get("biller_category", "utilities")

                if biller_cat == "fastag" and u_dict.get("wallet_balance") is not None:
                    fastag_balance = float(u_dict["wallet_balance"])

                utility_alerts.append({
                    "biller_id": u_dict.get("biller_id"),
                    "biller_name": u_dict.get("biller_name"),
                    "category": biller_cat,
                    "amount_due": float(u_dict.get("amount_due", 0.0)),
                    "due_date": u_dict.get("due_date"),
                    "validity_expiry": u_dict.get("validity_expiry_date"),
                    "wallet_balance": u_dict.get("wallet_balance")
                })

        # 7. Process NCMC Transit Tap Records
        transit_commute_detected = False
        if transit_records:
            for t in transit_records:
                total_raw_count += 1
                t_dict = t.model_dump() if isinstance(t, NCMCTransitRecord) else t
                if t_dict.get("current_stored_balance") is not None:
                    transit_wallet_balance = float(t_dict["current_stored_balance"])
                if t_dict.get("daily_commute_detected"):
                    transit_commute_detected = True

        # Sort cleaned transactions chronologically
        cleaned_transactions.sort(key=lambda x: x["timestamp"])

        # If monthly income not declared in demographics, infer from salary credits
        if monthly_income <= 0.0:
            salary_credits = [t["amount"] for t in cleaned_transactions if t["type"] == "credit" and t["category"] == "salary"]
            if salary_credits:
                monthly_income = sum(salary_credits) / len(salary_credits)
            else:
                # Default fallback for reasonable baseline
                monthly_income = 50000.0

        # Construct Canonical Unified Profile
        return UnifiedCustomerProfile(
            customer_id=cust_id,
            customer_name=cust_name,
            monthly_income=monthly_income,
            balance={
                "available": available_balance,
                "savings": savings_balance or (available_balance * 1.5),
                "transit_wallet": transit_wallet_balance,
                "fastag": fastag_balance,
                "currency": "INR"
            },
            cleaned_transactions=cleaned_transactions,
            bureau_summary=bureau_summary,
            utility_alerts=utility_alerts,
            demographics={
                **demo_dict,
                "transit_commute_detected": transit_commute_detected
            },
            sanitization_audit={
                "total_raw_records": total_raw_count,
                "cleaned_records": len(cleaned_transactions),
                "duplicates_dropped": duplicates_dropped,
                "corrupted_dropped": corrupted_dropped,
                "balance_conflicts_resolved": balance_conflicts_resolved
            }
        )
