"""Public facade for Ubaid Backend Customer Intelligence Engine."""

from __future__ import annotations
from typing import Dict, Any, List, Optional
from ai.intelligence.features.extractor import FeatureExtractor
from ai.intelligence.customer_state.builder import CustomerStateBuilder
from ai.intelligence.customer_state.models import CustomerStateModel
from ai.intelligence.explanations.explainer import Explainer
from ai.intelligence.ingestion.harmonizer import MultiSourceDataHarmonizer
from ai.intelligence.features.spend_analyzer import SpendAnalyzer
from ai.intelligence.customer_state.cadence import DualCadenceEngine
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


def build_customer_state(
    customer_data: Dict[str, Any],
    transactions: Optional[List[Dict[str, Any]]] = None,
    cbs_records: Optional[List[Any]] = None,
    upi_logs: Optional[List[Any]] = None,
    sms_records: Optional[List[Any]] = None,
    bureau_profile: Optional[Any] = None,
    utility_records: Optional[List[Any]] = None,
    transit_records: Optional[List[Any]] = None,
) -> Dict[str, Any]:
    """Single entry point for Harsh's backend to produce validated CustomerState.

    Supports both legacy transaction streams and raw multi-source dirty feeds
    (CBS ledgers, UPI wire logs, SMS notification dumps, CIBIL bureau, BBPS utilities, NCMC transit).

    Args:
        customer_data: Customer profile or scenario dictionary.
        transactions: Optional list of raw transaction logs.
        cbs_records: Optional list of Core Banking System records.
        upi_logs: Optional list of UPI/NPCI wire switch logs.
        sms_records: Optional list of SMS/notification scrape records.
        bureau_profile: Optional credit bureau (CIBIL) report.
        utility_records: Optional BBPS bill/utility records.
        transit_records: Optional NCMC transit tap records.

    Returns:
        JSON-serializable CustomerState dictionary matching contracts/customer-state.schema.json.
    """
    effective_data = dict(customer_data)
    has_multi_source = any([cbs_records, upi_logs, sms_records, bureau_profile, utility_records, transit_records]) or any(
        k in customer_data for k in ["cbs_records", "upi_logs", "sms_records", "bureau_profile", "utility_records", "transit_records"]
    )

    if has_multi_source:
        unified_profile = MultiSourceDataHarmonizer.harmonize(
            demographics=customer_data,
            cbs_records=cbs_records or customer_data.get("cbs_records"),
            upi_logs=upi_logs or customer_data.get("upi_logs"),
            sms_records=sms_records or customer_data.get("sms_records"),
            bureau_profile=bureau_profile or customer_data.get("bureau_profile"),
            utility_records=utility_records or customer_data.get("utility_records"),
            transit_records=transit_records or customer_data.get("transit_records"),
            fallback_customer_id=str(customer_data.get("customer_id") or "cust_bharat_001")
        )
        txs = unified_profile.cleaned_transactions
        effective_data["monthly_income"] = unified_profile.monthly_income
        effective_data["balance"] = unified_profile.balance
        effective_data["bureau_summary"] = unified_profile.bureau_summary
        effective_data["utility_alerts"] = unified_profile.utility_alerts
        effective_data["sanitization_audit"] = unified_profile.sanitization_audit

        # Map bureau DTI into signals
        if unified_profile.bureau_summary:
            signals_map = effective_data.setdefault("signals", {})
            if "bureau_dti" in unified_profile.bureau_summary:
                signals_map["debt_to_income_ratio"] = unified_profile.bureau_summary["bureau_dti"]
            if "score" in unified_profile.bureau_summary:
                effective_data["credit_score"] = unified_profile.bureau_summary["score"]

        # Map transit & FASTag micro-moment triggers
        transit_bal = unified_profile.balance.get("transit_wallet", 0.0)
        if 0.0 < transit_bal < 80.0:
            effective_data.setdefault("signals", {})["ncmc_low_balance"] = True
        fastag_bal = unified_profile.balance.get("fastag", 0.0)
        if 0.0 < fastag_bal < 200.0:
            effective_data.setdefault("signals", {})["fastag_low_balance"] = True
    else:
        txs = transactions or customer_data.get("transactions", [])

    features = FeatureExtractor.extract(txs, profile=effective_data)
    return CustomerStateBuilder.build(effective_data, features)


__all__ = [
    "build_customer_state",
    "FeatureExtractor",
    "CustomerStateBuilder",
    "CustomerStateModel",
    "Explainer",
    "MultiSourceDataHarmonizer",
    "CBSLedgerRecord",
    "UPISwitchLog",
    "SMSNotificationRecord",
    "BureauCreditProfile",
    "BBPSUtilityRecord",
    "NCMCTransitRecord",
    "CustomerDemographics",
    "UnifiedCustomerProfile",
    "SpendAnalyzer",
    "DualCadenceEngine",
]
