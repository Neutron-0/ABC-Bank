"""Bharat Customer Archetypes: Demographic and psychographic personas representing diverse Indian banking users."""

from __future__ import annotations
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class ArchetypeId(str, Enum):
    URBAN_COMMUTER = "urban_commuter"
    MSME_MERCHANT = "msme_merchant"
    GIG_WORKER = "gig_worker"
    RURAL_FARMER = "rural_farmer"
    STUDENT_FIRST_EARNER = "student_first_earner"
    SENIOR_PENSIONER = "senior_pensioner"
    HOMEMAKER_SHG = "homemaker_shg"


class BharatArchetypeProfile(BaseModel):
    id: ArchetypeId
    name: str
    tier: str = Field(..., description="Geography tier (Tier 1, Tier 2/3, Tier 4 / Rural)")
    primary_language: str = Field(default="hi", description="Default vernacular language preference")
    typical_monthly_income: float
    description: str
    core_needs: List[str]
    suitable_product_categories: List[str]
    risk_factors: List[str]


BHARAT_ARCHETYPES: Dict[ArchetypeId, BharatArchetypeProfile] = {
    ArchetypeId.URBAN_COMMUTER: BharatArchetypeProfile(
        id=ArchetypeId.URBAN_COMMUTER,
        name="Urban Salaried Commuter (Rahul)",
        tier="Tier 1",
        primary_language="en",
        typical_monthly_income=75000.0,
        description="Salaried professional commuting via urban metro/transit with stable salary and home loan commitments.",
        core_needs=["Frictionless 1-tap metro transit payments", "Automated surplus wealth auto-sweep", "Tax saving (80C/80D)"],
        suitable_product_categories=["transport", "savings", "tax_saving", "investment", "credit"],
        risk_factors=["Lifestyle inflation", "Mid-career debt accumulation"]
    ),
    ArchetypeId.MSME_MERCHANT: BharatArchetypeProfile(
        id=ArchetypeId.MSME_MERCHANT,
        name="Tier-2/3 MSME Trader (Rajesh)",
        tier="Tier 2/3",
        primary_language="hi",
        typical_monthly_income=120000.0,
        description="Independent merchant or shop owner with daily UPI QR collections and supplier bulk IMPS outlays.",
        core_needs=["Daily working capital credit line", "Digital current account auto-sweep", "Vendor invoice payments"],
        suitable_product_categories=["working_capital", "savings", "current_account", "merchant_qr"],
        risk_factors=["Seasonal cashflow volatility", "High receivables delay"]
    ),
    ArchetypeId.GIG_WORKER: BharatArchetypeProfile(
        id=ArchetypeId.GIG_WORKER,
        name="Gig Economy Partner (Amit)",
        tier="Tier 1/2",
        primary_language="hi",
        typical_monthly_income=32000.0,
        description="Delivery or ride-hailing partner receiving irregular micro-credits with daily fuel and vehicle EMI expenses.",
        core_needs=["Daily sachet micro-accident insurance (₹10/day)", "Fuel cashback", "Emergency small-ticket liquidity buffer"],
        suitable_product_categories=["micro_insurance", "guidance", "fuel_rewards", "two_wheeler_support"],
        risk_factors=["Lack of social security", "Vulnerable to sudden vehicle breakdown or medical shocks"]
    ),
    ArchetypeId.RURAL_FARMER: BharatArchetypeProfile(
        id=ArchetypeId.RURAL_FARMER,
        name="Agriculturalist & Farmer (Ramesh)",
        tier="Tier 4 / Rural",
        primary_language="gu",
        typical_monthly_income=45000.0,
        description="Farmer receiving DBT credits (PM-KISAN) with seasonal agricultural harvest lumpsums and fertilizer costs.",
        core_needs=["Kisan Credit Card (KCC) limit optimization", "Crop weather insurance", "Vernacular voice-assisted banking"],
        suitable_product_categories=["agricultural_credit", "crop_insurance", "term_deposits", "voice_guidance"],
        risk_factors=["Monsoon dependency", "Lumpy seasonal income cycles"]
    ),
    ArchetypeId.STUDENT_FIRST_EARNER: BharatArchetypeProfile(
        id=ArchetypeId.STUDENT_FIRST_EARNER,
        name="Student & First-Time Earner (Priya)",
        tier="Tier 2",
        primary_language="en",
        typical_monthly_income=18000.0,
        description="Young adult with internship stipend or pocket allowance, digital native, high UPI micro-spend, zero credit history.",
        core_needs=["Credit score builder card", "Subscription tracking & leak detection", "Micro-investments (digital gold/round-ups)"],
        suitable_product_categories=["credit_builder", "micro_savings", "education_support", "entertainment_management"],
        risk_factors=["Impulse micro-spending", "Subscription traps"]
    ),
    ArchetypeId.SENIOR_PENSIONER: BharatArchetypeProfile(
        id=ArchetypeId.SENIOR_PENSIONER,
        name="Senior Citizen & Pensioner (Devendra)",
        tier="Tier 2/3",
        primary_language="gu",
        typical_monthly_income=48000.0,
        description="Retired individual with reliable 1st-of-month pension credit, regular pharmacy bills, and substantial fixed deposits.",
        core_needs=["Senior Citizen Savings Scheme (SCSS) high yield", "Fraud & anomaly safety shield", "Healthcare liquidity"],
        suitable_product_categories=["senior_savings", "security", "healthcare_support", "doorstep_banking"],
        risk_factors=["Target for digital fraud / cyber phishing", "Unexpected medical emergencies"]
    ),
    ArchetypeId.HOMEMAKER_SHG: BharatArchetypeProfile(
        id=ArchetypeId.HOMEMAKER_SHG,
        name="Homemaker & SHG Entrepreneur (Sunita)",
        tier="Tier 3/4",
        primary_language="hi",
        typical_monthly_income=22000.0,
        description="Homemaker running small tailoring/handicraft enterprise, member of women's Self-Help Group (SHG).",
        core_needs=["Micro-recurring deposit (₹500/month)", "Gold loan access", "Vernacular voice interface without complicated forms"],
        suitable_product_categories=["micro_savings", "gold_loan", "shg_credit", "voice_guidance"],
        risk_factors=["Low formal credit documentation", "Limited financial literacy"]
    )
}


class ArchetypeClassifier:
    """Classifies customers into Bharat Archetypes using transaction patterns and profile indicators."""

    @classmethod
    def classify(cls, customer_data: Dict[str, Any], features: Dict[str, Any], signals: Dict[str, Any]) -> BharatArchetypeProfile:
        # Check explicit archetype override
        cust_id = str(customer_data.get("customer_id", ""))
        archetype_override = customer_data.get("archetype")
        if archetype_override and archetype_override in ArchetypeId._value2member_map_:
            return BHARAT_ARCHETYPES[ArchetypeId(archetype_override)]

        income = float(customer_data.get("monthly_income", 75000.0))
        age = int(customer_data.get("age", 30))
        tx_metrics = features.get("transaction_metrics", {})
        cat_counts = tx_metrics.get("category_counts", {})
        cat_volumes = tx_metrics.get("category_volumes", {})
        merch_freqs = tx_metrics.get("merchant_frequencies", {})
        total_debit = float(tx_metrics.get("total_debit_volume", 1.0))

        # 1. Senior Citizen / Pensioner: Pension narration, pharmacy dominance, high term deposits, age >= 60
        is_pension = "pension" in str(customer_data.get("employment_type", "")).lower()
        has_pension_tx = any("pension" in m.lower() for m in merch_freqs.keys())
        pharmacy_heavy = cat_volumes.get("healthcare", 0.0) > 0.20 * total_debit if total_debit > 0 else False
        if is_pension or signals.get("pension_credit") or "senior" in cust_id or age >= 60 or (has_pension_tx and pharmacy_heavy):
            return BHARAT_ARCHETYPES[ArchetypeId.SENIOR_PENSIONER]

        # 2. Rural Farmer: Agricultural inputs, PM-KISAN, fertilizer, seeds
        is_agri = "agri" in str(customer_data.get("occupation", "")).lower() or signals.get("kcc_holder")
        has_agri_tx = cat_counts.get("agriculture", 0) > 0 or any(k in str(merch_freqs).lower() for k in ["fertilizer", "kisan", "iffco", "seeds", "tractor", "apmc"])
        if is_agri or "farmer" in cust_id or has_agri_tx:
            return BHARAT_ARCHETYPES[ArchetypeId.RURAL_FARMER]

        # 3. MSME Merchant: High merchant QR credits, erratic cashflow, vendor supplier payments
        is_msme = "merchant" in str(customer_data.get("occupation", "")).lower() or customer_data.get("is_merchant")
        high_credit_frequency = tx_metrics.get("credit_tx_count", 0) >= 5 and tx_metrics.get("total_credit_volume", 0) >= 100000
        if is_msme or "merchant" in cust_id or high_credit_frequency:
            return BHARAT_ARCHETYPES[ArchetypeId.MSME_MERCHANT]

        # 4. Gig Worker: Micro credits from platforms, weekly fuel, two-wheeler loan
        is_gig = "gig" in str(customer_data.get("occupation", "")).lower() or "delivery" in str(customer_data.get("occupation", "")).lower()
        has_gig_platform = any(p in str(merch_freqs).lower() for p in ["rapido", "zomato", "swiggy", "uber", "ola", "zepto", "blinkit"])
        has_frequent_fuel = any("fuel" in m.lower() or "petrol" in m.lower() for m in merch_freqs.keys())
        if is_gig or "gig" in cust_id or (has_gig_platform and has_frequent_fuel):
            return BHARAT_ARCHETYPES[ArchetypeId.GIG_WORKER]

        # 5. Student / First-Time Earner: Low income (< 25k), young age, zero loan history, high food/entertainment
        is_student = "student" in str(customer_data.get("occupation", "")).lower() or "student" in cust_id
        is_young_low_income = (age < 23 and income < 25000)
        micro_spends_ratio = tx_metrics.get("avg_debit_amount", 1000.0) < 250.0 and tx_metrics.get("emi_tx_count", 0) == 0
        if is_student or is_young_low_income or (income < 20000 and micro_spends_ratio and age <= 25):
            return BHARAT_ARCHETYPES[ArchetypeId.STUDENT_FIRST_EARNER]

        # 6. Homemaker / SHG
        if "homemaker" in str(customer_data.get("occupation", "")).lower() or "shg" in cust_id:
            return BHARAT_ARCHETYPES[ArchetypeId.HOMEMAKER_SHG]

        # Default fallback: Urban Salaried Commuter
        return BHARAT_ARCHETYPES[ArchetypeId.URBAN_COMMUTER]
