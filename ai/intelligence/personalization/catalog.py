"""Comprehensive Product Catalog for Bharat Banking with Regulatory Eligibility Criteria."""

from __future__ import annotations
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class BankingProduct(BaseModel):
    id: str
    category: str
    title: str
    description: str
    customer_benefit: str
    bank_benefit: str
    regulatory_framework: str
    base_priority: int
    min_income: float = 0.0
    max_dti_limit: float = 0.40
    requires_consent_scope: str
    cooling_off_period_days: int = 3
    apr_indicative_percent: Optional[float] = None
    is_credit_product: bool = False


PRODUCT_CATALOG: Dict[str, BankingProduct] = {
    "rec_fraud_guard": BankingProduct(
        id="rec_fraud_guard",
        category="security",
        title="Unusual Transaction Security Lock",
        description="Instant biometric freeze and charge dispute assistance for detected out-of-pattern debits.",
        customer_benefit="Protects customer hard-earned savings from cyber fraud and unauthorized midnight debits.",
        bank_benefit="Eliminates chargeback liability and maintains high customer trust and zero fraud loss.",
        regulatory_framework="RBI Cyber Security Framework in Banks (2016) & Zero Liability Policy (2017)",
        base_priority=100,
        requires_consent_scope="fraud_monitoring"
    ),
    "rec_medical_claim": BankingProduct(
        id="rec_medical_claim",
        category="healthcare",
        title="Hospital Reimbursement & Bill Assistance",
        description="Instant health insurance claim filing and Section 80D tax rebate documentation assistance.",
        customer_benefit="Immediate empathetic liquidity and insurance reimbursement following unexpected hospitalization.",
        bank_benefit="Increases bancassurance engagement and retains primary account relationship during crisis.",
        regulatory_framework="IRDAI Health Insurance Regulations & RBI Customer Protection Directives",
        base_priority=95,
        requires_consent_scope="insurance_claim_assistance"
    ),
    "rec_cashflow_guidance": BankingProduct(
        id="rec_cashflow_guidance",
        category="guidance",
        title="Cash Flow & Debt Stabilization Assistance",
        description="1-tap subscription trimming and flexible EMI rescheduling helper for tight cash cycles.",
        customer_benefit="Prevents accidental missed payments, avoids penalty charges, and relieves debt distress.",
        bank_benefit="Dramatically reduces non-performing asset (NPA) rate and loan loss provisioning.",
        regulatory_framework="RBI Fair Practices Code for Lenders & Prudent Asset Quality Management",
        base_priority=92,
        requires_consent_scope="financial_health_guidance"
    ),
    "rec_commute_metro": BankingProduct(
        id="rec_commute_metro",
        category="transport",
        title="Morning Metro Quick Pay",
        description="1-tap contactless transit ticket and Smart Card auto-recharge for daily urban commute.",
        customer_benefit="Saves 15 minutes of station queue time every morning with zero friction.",
        bank_benefit="Captures daily high-velocity CASA transactional flow and enhances daily active app usage.",
        regulatory_framework="RBI Framework for Processing of e-Mandates & NCMC Guidelines",
        base_priority=90,
        requires_consent_scope="transit_payments"
    ),
    "rec_smart_savings": BankingProduct(
        id="rec_smart_savings",
        category="savings",
        title="Put Surplus Cash into 7.85% Smart FD",
        description="Automated liquid sweep into high-yield term deposit with zero-penalty instant withdrawal.",
        customer_benefit="Earns 7.85% interest on idle cash without sacrificing immediate liquidity.",
        bank_benefit="Builds sticky, low-cost retail term deposit book without broker commissions.",
        regulatory_framework="RBI Master Direction - Interest Rate on Deposits (2016)",
        base_priority=85,
        requires_consent_scope="wealth_management"
    ),
    "rec_personal_loan": BankingProduct(
        id="rec_personal_loan",
        category="credit",
        title="Pre-Approved Personal Loan",
        description="Instant paperless personal credit line disbursed directly to primary savings account.",
        customer_benefit="Instant transparent credit for planned lifestyle or family milestones with zero hidden fees.",
        bank_benefit="High-margin, prime retail asset yielding strong net interest margin (NIM).",
        regulatory_framework="RBI Guidelines on Digital Lending (2022) - Mandatory Key Fact Statement & APR Disclosure",
        base_priority=70,
        min_income=25000.0,
        max_dti_limit=0.40,
        requires_consent_scope="credit_underwriting",
        cooling_off_period_days=3,
        apr_indicative_percent=11.25,
        is_credit_product=True
    ),
    "rec_msme_credit_line": BankingProduct(
        id="rec_msme_credit_line",
        category="working_capital",
        title="MSME Merchant Instant Working Capital",
        description="Revolving daily overdraft line based on verified merchant QR transaction cash-flows.",
        customer_benefit="Never reject inventory or customer orders due to vendor payment delays.",
        bank_benefit="Captures merchant ecosystem deposits and generates recurring revolving credit fees.",
        regulatory_framework="RBI Priority Sector Lending (PSL) Targets for Micro & Small Enterprises",
        base_priority=82,
        min_income=40000.0,
        max_dti_limit=0.45,
        requires_consent_scope="business_credit",
        is_credit_product=True,
        apr_indicative_percent=12.50
    ),
    "rec_sachet_insurance": BankingProduct(
        id="rec_sachet_insurance",
        category="micro_insurance",
        title="₹10/Day Gig Partner Protection Cover",
        description="Micro-accident and hospitalization cover tailored for delivery and transit workers.",
        customer_benefit="Affordable daily safety net protecting family from loss of income during accidents.",
        bank_benefit="Expands financial inclusion footprint and earns steady fee commission.",
        regulatory_framework="IRDAI Micro-insurance Regulations & Social Security Framework",
        base_priority=78,
        requires_consent_scope="insurance_underwriting"
    ),
    "rec_kcc_topup": BankingProduct(
        id="rec_kcc_topup",
        category="agricultural_credit",
        title="Kisan Credit Card (KCC) Season Top-up",
        description="Pre-approved crop loan limit enhancement at 4% subsidized interest rate for sowing season.",
        customer_benefit="Guaranteed access to subsidized farm inputs without moneylender exploitation.",
        bank_benefit="Meets mandatory RBI agricultural Priority Sector Lending (PSL) requirements with low risk.",
        regulatory_framework="RBI Revised Kisan Credit Card Scheme & Interest Subvention Directives",
        base_priority=80,
        max_dti_limit=0.50,
        requires_consent_scope="agri_credit",
        is_credit_product=True,
        apr_indicative_percent=4.0
    ),
    "rec_credit_builder": BankingProduct(
        id="rec_credit_builder",
        category="credit_builder",
        title="FD-Backed Credit Builder Card",
        description="Secured credit card against small fixed deposit to establish prime CIBIL bureau score.",
        customer_benefit="Builds a strong credit footprint early without risk of falling into debt traps.",
        bank_benefit="Acquires Gen-Z customers with zero default risk (100% lien against deposit).",
        regulatory_framework="RBI Master Direction - Credit Card and Debit Card Issuance (2022)",
        base_priority=75,
        requires_consent_scope="credit_issuance"
    ),
    "rec_senior_scss": BankingProduct(
        id="rec_senior_scss",
        category="senior_savings",
        title="8.2% Senior Citizen Secure Deposit",
        description="High-yield government-backed deposit with guaranteed quarterly interest credit.",
        customer_benefit="Maximum inflation-beating yield with sovereign safety for post-retirement income.",
        bank_benefit="Secures ultra-sticky, long-term retail funding with high customer loyalty.",
        regulatory_framework="Government of India Senior Citizens Savings Scheme & RBI Guidelines",
        base_priority=84,
        requires_consent_scope="senior_wealth"
    ),
    "srv_ncmc_reload": BankingProduct(
        id="srv_ncmc_reload",
        category="transport",
        title="NCMC Metro Balance Threshold Auto-Load",
        description="Predictive top-up for National Common Mobility Card before morning commute when historical balance falls below ₹80.",
        customer_benefit="Zero queueing at ticketing counters; eliminates commuter penalty gate rejections.",
        bank_benefit="Captures daily high-velocity CASA transactional float and reinforces primary bank habit.",
        regulatory_framework="RBI NCMC Guidelines & e-Mandate Framework",
        base_priority=89,
        requires_consent_scope="transit_payments"
    ),
    "srv_cibil_refresh": BankingProduct(
        id="srv_cibil_refresh",
        category="credit_health",
        title="30-Day Free CIBIL Score Refresh & Analysis",
        description="Monthly bureau credit score pull with factor analysis, inquiry tracking, and score improvement roadmap.",
        customer_benefit="Early detection of identity theft inquiries and actionable guidance to improve CIBIL score.",
        bank_benefit="Continuous credit risk surveillance across all external bank obligations.",
        regulatory_framework="RBI Circular on Free Credit Reports to Individuals (2016)",
        base_priority=86,
        requires_consent_scope="credit_monitoring"
    ),
    "srv_credit_card_bill": BankingProduct(
        id="srv_credit_card_bill",
        category="credit_health",
        title="Credit Card Due Date & Total Due Optimizer",
        description="Proactive bill settlement helper comparing liquid balance against total due to avoid 42% APR revolving interest.",
        customer_benefit="Protects from compounding 42% interest and preserves prime credit score.",
        bank_benefit="Maintains low delinquency and offers profitable 3-month no-cost EMI conversion when cash is tight.",
        regulatory_framework="RBI Master Direction - Credit Card and Debit Card Issuance (2022)",
        base_priority=91,
        requires_consent_scope="credit_underwriting"
    ),
    "srv_fastag_recharge": BankingProduct(
        id="srv_fastag_recharge",
        category="transport",
        title="FASTag Low Balance Highway Shield",
        description="Predictive toll recharge when wallet drops below ₹200 ahead of weekend highway transit.",
        customer_benefit="Avoids toll plaza blacklisting and mandatory double toll cash penalty.",
        bank_benefit="Captures toll interchange float and driver lifestyle data.",
        regulatory_framework="NHAI National Electronic Toll Collection (NETC) Directives",
        base_priority=81,
        requires_consent_scope="transit_payments"
    ),
    "srv_mobile_recharge": BankingProduct(
        id="srv_mobile_recharge",
        category="utilities",
        title="Mobile Prepaid Validity Expiry Shield",
        description="1-tap recharge alert 48 hours prior to 28-day/84-day telecom validity expiration.",
        customer_benefit="Prevents incoming call suspension and uninterrupted 5G data continuity.",
        bank_benefit="High-frequency recurring monthly engagement touchpoint for Bharat users.",
        regulatory_framework="Bharat Bill Payment System (BBPS) Operating Guidelines",
        base_priority=79,
        requires_consent_scope="general_banking"
    ),
    "srv_form15g_h": BankingProduct(
        id="srv_form15g_h",
        category="tax_compliance",
        title="Form 15G / 15H TDS Zero-Tax Submission",
        description="Self-declaration submission before April 30th to prevent tax deduction on term deposit interest.",
        customer_benefit="Prevents unnecessary tax deduction on fixed deposit interest without needing ITR refund claims.",
        bank_benefit="Slashes branch footfall in April and dramatically increases senior citizen deposit retention.",
        regulatory_framework="Section 197A of Income Tax Act 1961 & CBDT Guidelines",
        base_priority=87,
        requires_consent_scope="wealth_management"
    ),
    "srv_positive_pay": BankingProduct(
        id="srv_positive_pay",
        category="security",
        title="Positive Pay System Cheque Confirmation",
        description="1-tap pre-confirmation of payee, date, and amount for issued cheques exceeding ₹50,000.",
        customer_benefit="Protects against fraudulent cheque alteration, tampering, and counterfeit clearing.",
        bank_benefit="Eliminates cheque fraud dispute liability under CTS clearing rules.",
        regulatory_framework="RBI Guidelines on Positive Pay System for CTS (2020)",
        base_priority=88,
        requires_consent_scope="general_banking"
    ),
    "srv_pmjjby_pmsby": BankingProduct(
        id="srv_pmjjby_pmsby",
        category="government_schemes",
        title="PMJJBY & PMSBY Annual Renewal Shield",
        description="Annual ₹456 auto-debit reminder before May 31st for ₹4 Lakh combined life and accidental cover.",
        customer_benefit="Guarantees uninterrupted sovereign social security cover for Bharat families.",
        bank_benefit="Fulfills national financial inclusion priority sector mandates with sticky rural loyalty.",
        regulatory_framework="Ministry of Finance Pradhan Mantri Jan Dhan Yojana & DBT Directives",
        base_priority=83,
        requires_consent_scope="insurance_underwriting"
    )
}
