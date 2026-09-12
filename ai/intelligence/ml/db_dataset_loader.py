"""Database-Driven Large-Scale Dataset Loader for Bharat Banking Recommendation Engine.

Queries normalized relational tables from PostgreSQL:
- customers (1,200)
- accounts (1,384)
- transactions (127,689)
- recurring_payments (633)
- customer_events (139)

Computes longitudinal behavioral signals and vectorizes each customer into continuous R^32.
Generates multi-task ground-truth target matrices for all 19 Bharat banking products.
"""

from __future__ import annotations
import os
import sys
import math
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import psycopg

ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ai.intelligence.personalization.archetypes import ArchetypeId
from ai.intelligence.personalization.catalog import PRODUCT_CATALOG
from ai.intelligence.ml.vectorizer import FinancialFeatureVectorizer


DEFAULT_DB_URL = "postgresql://abc_bank:AbcBank_Secure2026_KeyDB!@localhost:5433/abc_bank"


class DatabaseDatasetLoader:
    """Extracts, aggregates, and vectorizes real banking records from PostgreSQL database."""

    PRODUCT_KEYS: List[str] = [
        "rec_fraud_guard",
        "rec_medical_claim",
        "rec_cashflow_guidance",
        "rec_commute_metro",
        "rec_smart_savings",
        "rec_personal_loan",
        "rec_msme_credit_line",
        "rec_sachet_insurance",
        "rec_kcc_topup",
        "rec_credit_builder",
        "rec_senior_scss",
        "srv_ncmc_reload",
        "srv_cibil_refresh",
        "srv_credit_card_bill",
        "srv_fastag_recharge",
        "srv_mobile_recharge",
        "srv_form15g_h",
        "srv_positive_pay",
        "srv_pmjjby_pmsby"
    ]

    ARCHETYPE_MAP: Dict[str, ArchetypeId] = {
        "salaried_urban": ArchetypeId.URBAN_COMMUTER,
        "msme_business": ArchetypeId.MSME_MERCHANT,
        "student_starter": ArchetypeId.STUDENT_FIRST_EARNER,
        "farmer_agri": ArchetypeId.RURAL_FARMER,
        "salaried_tier2": ArchetypeId.URBAN_COMMUTER,
        "financial_stressed": ArchetypeId.GIG_WORKER,
        "fraud_target": ArchetypeId.URBAN_COMMUTER,
        "surplus_saver": ArchetypeId.SENIOR_PENSIONER
    }

    ARCHETYPE_ORDER: List[ArchetypeId] = [
        ArchetypeId.URBAN_COMMUTER,
        ArchetypeId.MSME_MERCHANT,
        ArchetypeId.GIG_WORKER,
        ArchetypeId.RURAL_FARMER,
        ArchetypeId.STUDENT_FIRST_EARNER,
        ArchetypeId.SENIOR_PENSIONER,
        ArchetypeId.HOMEMAKER_SHG
    ]

    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or os.environ.get("DATABASE_URL") or DEFAULT_DB_URL
        if self.db_url.startswith("postgresql+psycopg://"):
            self.db_url = self.db_url.replace("postgresql+psycopg://", "postgresql://")

    def load_dataset(self) -> Tuple[np.ndarray, np.ndarray, Dict[str, np.ndarray], List[Dict[str, Any]]]:
        """Queries full relational data, vectorizes 1,200 customers into R^32, and generates labels.

        Returns:
            X: Matrix of shape (N, 32) in float64
            y_archetypes: Archetype cluster index array of shape (N,) in int32
            y_labels: Dict mapping each product_id to binary label array of shape (N,) in int32
            customer_summaries: List of raw aggregated metadata dictionaries
        """
        conn = psycopg.connect(self.db_url)
        try:
            with conn.cursor() as cur:
                # 1. Fetch Customers
                cur.execute("""
                    SELECT id, name, age, occupation, city, state, tier,
                           preferred_language, monthly_income, income_type,
                           kyc_tier, credit_score, archetype
                    FROM customers
                    ORDER BY id ASC
                """)
                customers = cur.fetchall()

                # 2. Fetch Accounts
                cur.execute("""
                    SELECT customer_id, account_type, balance, available_balance
                    FROM accounts
                """)
                accounts_rows = cur.fetchall()

                # 3. Fetch Transactions
                cur.execute("""
                    SELECT customer_id, type, category, amount, payment_channel,
                           timestamp, is_recurring
                    FROM transactions
                """)
                transactions_rows = cur.fetchall()

                # 4. Fetch Recurring Payments
                cur.execute("""
                    SELECT customer_id, category, amount, frequency, status
                    FROM recurring_payments
                """)
                recurring_rows = cur.fetchall()

                # 5. Fetch Customer Events
                cur.execute("""
                    SELECT customer_id, event_type, amount, event_timestamp
                    FROM customer_events
                """)
                events_rows = cur.fetchall()
        finally:
            conn.close()

        # Build Lookups
        # Accounts by customer
        accounts_by_cust: Dict[str, Dict[str, float]] = {}
        for cust_id, acc_type, bal, avail_bal in accounts_rows:
            if cust_id not in accounts_by_cust:
                accounts_by_cust[cust_id] = {"available": 0.0, "savings": 0.0, "current": 0.0}
            accounts_by_cust[cust_id]["available"] += float(avail_bal or 0.0)
            if acc_type == "savings":
                accounts_by_cust[cust_id]["savings"] += float(bal or 0.0)
            elif acc_type == "current":
                accounts_by_cust[cust_id]["current"] += float(bal or 0.0)

        # Recurring by customer
        recurring_by_cust: Dict[str, Dict[str, Any]] = {}
        for cust_id, cat, amt, freq, status in recurring_rows:
            if cust_id not in recurring_by_cust:
                recurring_by_cust[cust_id] = {"total_emi": 0.0, "total_sip": 0.0, "count": 0}
            recurring_by_cust[cust_id]["count"] += 1
            if cat == "emi":
                recurring_by_cust[cust_id]["total_emi"] += float(amt or 0.0)
            elif cat == "savings":
                recurring_by_cust[cust_id]["total_sip"] += float(amt or 0.0)

        # Events by customer
        events_by_cust: Dict[str, List[Dict[str, Any]]] = {}
        for cust_id, event_type, amt, ts in events_rows:
            if cust_id not in events_by_cust:
                events_by_cust[cust_id] = []
            events_by_cust[cust_id].append({
                "event_type": event_type,
                "amount": float(amt or 0.0),
                "timestamp": ts
            })

        # Transactions aggregated by customer
        tx_by_cust: Dict[str, Dict[str, Any]] = {}
        for cust_id, tx_type, cat, amt, channel, ts, is_rec in transactions_rows:
            if cust_id not in tx_by_cust:
                tx_by_cust[cust_id] = {
                    "total_debit": 0.0,
                    "total_credit": 0.0,
                    "count": 0,
                    "categories": {},
                    "upi_count": 0,
                    "micro_count": 0,
                    "weekend_count": 0,
                    "odd_hours_count": 0,
                    "max_debit": 0.0,
                    "debit_amounts": []
                }
            agg = tx_by_cust[cust_id]
            agg["count"] += 1
            amt_flt = float(amt or 0.0)
            cat_str = str(cat or "miscellaneous").lower()

            if tx_type == "debit":
                agg["total_debit"] += amt_flt
                agg["debit_amounts"].append(amt_flt)
                agg["max_debit"] = max(agg["max_debit"], amt_flt)
                if amt_flt < 250.0:
                    agg["micro_count"] += 1
            else:
                agg["total_credit"] += amt_flt

            agg["categories"][cat_str] = agg["categories"].get(cat_str, 0.0) + amt_flt

            if "upi" in str(channel or "").lower():
                agg["upi_count"] += 1

            if ts:
                # Weekend: Sat (5) or Sun (6)
                if ts.weekday() in (5, 6):
                    agg["weekend_count"] += 1
                # Odd hours: between 23:00 and 05:00
                if ts.hour >= 23 or ts.hour < 5:
                    agg["odd_hours_count"] += 1

        # Construct feature vectors and ground truth labels
        x_vectors: List[np.ndarray] = []
        y_arch_list: List[int] = []
        customer_summaries: List[Dict[str, Any]] = []

        arch_to_idx = {arch: i for i, arch in enumerate(self.ARCHETYPE_ORDER)}

        for row in customers:
            (cid, name, age, occ, city, state, tier,
             pref_lang, monthly_inc, inc_type, kyc, credit_sc, db_archetype) = row

            monthly_income = float(monthly_inc or 50000.0)
            credit_score = int(credit_sc or 750)
            age = int(age or 35)

            acc_info = accounts_by_cust.get(cid, {"available": 25000.0, "savings": 50000.0, "current": 0.0})
            rec_info = recurring_by_cust.get(cid, {"total_emi": 0.0, "total_sip": 0.0, "count": 0})
            ev_list = events_by_cust.get(cid, [])
            tx_info = tx_by_cust.get(cid, {
                "total_debit": 0.0, "total_credit": 0.0, "count": 0,
                "categories": {}, "upi_count": 0, "micro_count": 0,
                "weekend_count": 0, "odd_hours_count": 0, "max_debit": 0.0,
                "debit_amounts": []
            })

            total_tx = max(1, tx_info["count"])
            total_debit = tx_info["total_debit"]
            avg_debit = np.mean(tx_info["debit_amounts"]) if tx_info["debit_amounts"] else 500.0

            # Compute features for FinancialFeatureVectorizer
            cat_vols = tx_info["categories"]
            transport_vol = cat_vols.get("transport", 0.0) + cat_vols.get("transit", 0.0)
            agri_vol = cat_vols.get("agriculture", 0.0)
            health_vol = cat_vols.get("healthcare", 0.0)
            sec_vol = cat_vols.get("security", 0.0)
            bills_vol = cat_vols.get("bills", 0.0) + cat_vols.get("utilities", 0.0)
            emi_vol = rec_info["total_emi"] + cat_vols.get("emi", 0.0)

            # Volatility & Anomaly Signals
            has_medical_event = any(e["event_type"] == "hospital_medical_surge" for e in ev_list)
            has_business_event = any(e["event_type"] == "business_expansion_inquiry" for e in ev_list)
            has_harvest_event = any(e["event_type"] == "agriculture_harvest_credit" for e in ev_list)
            has_security_tx = sec_vol > 0.0 or db_archetype == "fraud_target"

            anomaly_score = 95.0 if has_security_tx else (65.0 if has_medical_event else 0.0)

            spending_volatility = "low"
            if agri_vol > 0 or has_harvest_event or "farmer" in str(occ or "").lower():
                spending_volatility = "high"
            elif has_business_event or acc_info["current"] > 0:
                spending_volatility = "medium"

            burn_accel = 0.85 if has_medical_event else (0.50 if spending_volatility == "high" else 0.15)
            buffer_months = (acc_info["available"] + acc_info["savings"]) / max(1000.0, monthly_income)
            dti = emi_vol / max(1000.0, monthly_income)

            # Build inputs for vectorizer
            cust_dict = {
                "id": cid,
                "name": name,
                "age": age,
                "occupation": occ,
                "city": city,
                "tier": tier,
                "monthly_income": monthly_income,
                "credit_score": credit_score,
                "kyc_tier": kyc,
                "balance": {
                    "available": acc_info["available"],
                    "savings": acc_info["savings"]
                }
            }

            features_dict = {
                "transaction_metrics": {
                    "total_debit_volume": total_debit,
                    "total_credit_volume": tx_info["total_credit"],
                    "total_tx_count": total_tx,
                    "active_days": 365,
                    "category_volumes": cat_vols,
                    "avg_debit_amount": avg_debit,
                    "max_debit_amount": tx_info["max_debit"],
                    "upi_tx_count": tx_info["upi_count"],
                    "micro_tx_count": tx_info["micro_count"],
                    "weekend_tx_count": tx_info["weekend_count"],
                    "odd_hours_tx_count": tx_info["odd_hours_count"]
                },
                "savings_rate": max(0.0, min(1.0, (monthly_income - (total_debit / 12.0)) / max(1.0, monthly_income))),
                "dti_ratio": min(1.0, dti),
                "commute_detected": transport_vol > 1000.0 or (transport_vol / max(1.0, total_debit)) > 0.04
            }

            signals_dict = {
                "spending_volatility": spending_volatility,
                "anomaly_score": anomaly_score,
                "burn_acceleration": burn_accel,
                "liquid_buffer_months": buffer_months,
                "commute_habit_detected": transport_vol > 1000.0 or (transport_vol / max(1.0, total_debit)) > 0.04,
                "kcc_holder": agri_vol > 0 or has_harvest_event or "farmer" in str(occ or "").lower(),
                "debt_to_income_ratio": dti
            }

            vec = FinancialFeatureVectorizer.vectorize(
                customer_data=cust_dict,
                features=features_dict,
                signals=signals_dict,
                health="distressed" if dti > 0.50 else ("thriving" if buffer_months > 4.0 else "stable")
            )

            x_vectors.append(vec)

            # Map DB archetype to canonical archetype index
            canon_arch = self.ARCHETYPE_MAP.get(str(db_archetype or "").lower(), ArchetypeId.URBAN_COMMUTER)
            y_arch_list.append(arch_to_idx[canon_arch])

            customer_summaries.append({
                "customer_id": cid,
                "name": name,
                "db_archetype": db_archetype,
                "canonical_archetype": canon_arch.value,
                "vector": vec,
                "income": monthly_income,
                "credit_score": credit_score,
                "dti": dti,
                "has_security_tx": has_security_tx,
                "has_medical_event": has_medical_event,
                "has_harvest_event": has_harvest_event,
                "has_business_event": has_business_event
            })

        X = np.array(x_vectors, dtype=np.float64)
        y_archetypes = np.array(y_arch_list, dtype=np.int32)

        # Generate multi-task binary labels for all 19 products based on real attributes + features
        y_labels: Dict[str, np.ndarray] = {}

        # 1. Fraud Guard (security debits or odd hours anomaly)
        y_labels["rec_fraud_guard"] = np.array([
            1 if (s["has_security_tx"] or X[i, 15] > 0.60 or (X[i, 29] > 0.40 and X[i, 19] > 0.35)) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 2. Medical Claim (healthcare expenditure or hospitalization event)
        y_labels["rec_medical_claim"] = np.array([
            1 if (s["has_medical_event"] or X[i, 8] > 0.05 or (X[i, 2] > 0.60 and X[i, 31] < 0.40)) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 3. Cashflow Guidance (high DTI > 0.45 or deficit risk)
        y_labels["rec_cashflow_guidance"] = np.array([
            1 if (s["dti"] > 0.40 or X[i, 25] > 0.55 or X[i, 3] > 0.45) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 4. Commute Metro (transit ratio > 0.08 or periodic commute score)
        y_labels["rec_commute_metro"] = np.array([
            1 if (X[i, 14] > 0.60 or X[i, 9] > 0.06) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 5. Smart Savings (positive savings rate and liquid buffer)
        y_labels["rec_smart_savings"] = np.array([
            1 if (X[i, 4] > 0.35 and X[i, 5] > 0.20 and X[i, 31] > 0.40) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 6. Personal Loan (moderate DTI, prime credit score > 700)
        y_labels["rec_personal_loan"] = np.array([
            1 if (s["credit_score"] >= 720 and s["dti"] < 0.35 and X[i, 31] > 0.45) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 7. MSME Credit Line (business expansion event or merchant/vendor ratio)
        y_labels["rec_msme_credit_line"] = np.array([
            1 if (s["has_business_event"] or s["db_archetype"] == "msme_business" or X[i, 11] > 0.20) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 8. Sachet Insurance (micro-spends, gig worker or student/stressed)
        y_labels["rec_sachet_insurance"] = np.array([
            1 if (X[i, 18] > 0.40 or s["db_archetype"] in ("student_starter", "financial_stressed")) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 9. KCC Top-up (farmer agri or harvest event)
        y_labels["rec_kcc_topup"] = np.array([
            1 if (s["has_harvest_event"] or s["db_archetype"] == "farmer_agri" or X[i, 10] > 0.15) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 10. Student Credit Builder (young age < 25 or student starter)
        y_labels["rec_credit_builder"] = np.array([
            1 if (s["db_archetype"] == "student_starter" or (X[i, 27] < 0.15 and X[i, 20] < 0.65)) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 11. Senior Citizen SCSS (surplus saver or age > 55)
        y_labels["rec_senior_scss"] = np.array([
            1 if (s["db_archetype"] == "surplus_saver" or (X[i, 27] > 0.45 and X[i, 22] > 0.35)) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 12. NCMC Reload (high transit activity)
        y_labels["srv_ncmc_reload"] = np.array([
            1 if (X[i, 14] > 0.50 or X[i, 9] > 0.05) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 13. CIBIL Refresh (active debt obligations or tracking score)
        y_labels["srv_cibil_refresh"] = np.array([
            1 if (s["dti"] > 0.15 or X[i, 12] > 0.08 or s["credit_score"] < 750) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 14. Credit Card Bill (debt service ratio or salaried)
        y_labels["srv_credit_card_bill"] = np.array([
            1 if (X[i, 12] > 0.06 or (X[i, 24] > 0.60 and X[i, 6] > 0.20)) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 15. FASTag Recharge (weekend travel and transit ratio)
        y_labels["srv_fastag_recharge"] = np.array([
            1 if (X[i, 9] > 0.04 and X[i, 28] > 0.20 and s["income"] > 40000) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 16. Mobile Recharge (high digital adoption or micro-spends)
        y_labels["srv_mobile_recharge"] = np.array([
            1 if (X[i, 17] > 0.60 or X[i, 18] > 0.40) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 17. Form 15G/H (high deposit reserves or surplus saver)
        y_labels["srv_form15g_h"] = np.array([
            1 if (s["db_archetype"] == "surplus_saver" or (X[i, 22] > 0.40 and X[i, 27] > 0.35)) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 18. Positive Pay (MSME merchant or high debit concentration)
        y_labels["srv_positive_pay"] = np.array([
            1 if (s["db_archetype"] == "msme_business" or (X[i, 19] > 0.20 and X[i, 21] > 0.25)) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        # 19. PMJJBY / PMSBY (rural, farmer, gig worker, or modest income)
        y_labels["srv_pmjjby_pmsby"] = np.array([
            1 if (s["db_archetype"] in ("farmer_agri", "financial_stressed") or (X[i, 10] > 0.15 or X[i, 18] > 0.40)) else 0
            for i, s in enumerate(customer_summaries)
        ], dtype=np.int32)

        return X, y_archetypes, y_labels, customer_summaries
