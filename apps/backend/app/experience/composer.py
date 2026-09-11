from typing import Dict, Any, List
from apps.backend.app.models.customer_state import CustomerStateModel
from apps.backend.app.models.experience import (
    ExperienceConfigModel,
    ContextCardModel,
    CardAction,
    HeroCard
)

class ExperienceComposer:
    """Translates CustomerState into ExperienceConfig adhering to contracts/experience.schema.json."""

    @staticmethod
    def compose(state: CustomerStateModel, lang: str = "en") -> ExperienceConfigModel:
        signals = state.signals
        health = state.financial_health
        state_type = state.state_type or "normal"

        primary_actions = []
        secondary_actions = []
        priority_modules = []
        deprioritized_modules = []
        context_cards = []
        hero_card = None

        # ----------------------------------------------------
        # Scenario 1: FRAUD ALERT (Highest Priority)
        # ----------------------------------------------------
        if signals.get("anomaly_score", 0) > 80 or state_type == "fraud_alert":
            primary_actions = ["verify_charge", "freeze_card"]
            secondary_actions = ["call_fraud_desk"]
            priority_modules = ["security_intervention", "recent_activity"]
            deprioritized_modules = ["marketing", "loans", "investments"]

            hero_card = HeroCard(
                id="hero_fraud",
                title="Security Alert: ₹31,800 Debit",
                subtitle="Review charge from GlobalTech Gaming or freeze card",
                action_label="Review Now",
                action_type="OPEN_FRAUD_MODAL",
                badge="URGENT SAFETY",
                accent="#DC2626",
                why="High behavioral deviation detected at odd hours (02:14 AM)."
            )

            context_cards.append(ContextCardModel(
                id="card_fraud_guard",
                type="warning",
                layer="DO",
                priority=100,
                title="Unusual ₹31,800 Debit Detected",
                description="Spent at unfamiliar online merchant. Verify if this was you.",
                reason="Flagged by real-time anomaly detector.",
                primary_action=CardAction(label="Verify or Freeze", action_type="OPEN_FRAUD_MODAL"),
                dismissible=False,
                badge="Action Required",
                accent="#DC2626",
                why_details=["New merchant category", "Unusual hour (02:14 AM)", "IP location mismatch"]
            ))

        # ----------------------------------------------------
        # Scenario 2: FINANCIAL STRESS
        # ----------------------------------------------------
        elif health == "stress" or state_type == "financial_stress":
            primary_actions = ["review_commitments", "pause_subscriptions"]
            secondary_actions = ["speak_with_mitra", "view_cashflow"]
            priority_modules = ["cashflow_advisory", "obligations_planner"]
            # STRICT ETHICAL RULE: Suppress loan promotion
            deprioritized_modules = ["personal_loans", "credit_cards", "discretionary_spend"]

            hero_card = HeroCard(
                id="hero_stress",
                title="Cash Flow Guidance Active",
                subtitle="Upcoming obligations are higher this cycle. Review commitments safely.",
                action_label="Review Plan",
                action_type="OPEN_STRESS_MODAL",
                badge="CARE & GUIDANCE",
                accent="#D97706",
                why="Liquid reserve dropped to ~15 days due to emergency home repair debit."
            )

            context_cards.append(ContextCardModel(
                id="card_stress_advisory",
                type="assistance",
                layer="DO",
                priority=92,
                title="Monthly cash flow looks tighter than usual",
                description="Upcoming obligations total ₹34,200. Pause unused subscriptions to free liquidity.",
                reason="Ethical safeguard: loans are strictly suppressed during financial strain.",
                primary_action=CardAction(label="Review Commitments", action_type="OPEN_STRESS_MODAL"),
                dismissible=False,
                badge="Ethical Care",
                accent="#D97706",
                why_details=["Upcoming EMIs: ₹31,300", "Liquid balance: ₹7,850", "Zero predatory credit nudges"]
            ))

        # ----------------------------------------------------
        # Scenario 3: LARGE MEDICAL EVENT
        # ----------------------------------------------------
        elif signals.get("medical_surge") or state_type == "medical_event":
            primary_actions = ["claim_assistance", "hospital_receipts"]
            secondary_actions = ["cashflow_buffer", "ask_mitra"]
            priority_modules = ["medical_support", "emergency_fund"]
            deprioritized_modules = ["aggressive_investments"]

            hero_card = HeroCard(
                id="hero_medical",
                title="Hospital Bill Support Desk",
                subtitle="Max Super Speciality ₹48,200. Tap for cashless claim help.",
                action_label="Get Claim Help",
                action_type="OPEN_MEDICAL_MODAL",
                badge="REIMBURSEMENT READY",
                accent="#0284C7",
                why="Large non-routine inpatient medical expense detected."
            )

            context_cards.append(ContextCardModel(
                id="card_medical_reimburse",
                type="assistance",
                layer="DO",
                priority=95,
                title="Medical Reimbursement Assistance",
                description="Upload your hospital discharge bill for 1-click insurance filing.",
                reason="Empathy first: assistance prioritized before any protection options.",
                primary_action=CardAction(label="Start Claim Help", action_type="OPEN_MEDICAL_MODAL"),
                dismissible=True,
                badge="Care First",
                accent="#0284C7",
                why_details=["₹48,200 hospital transaction detected", "Cashless claim desk activated"]
            ))

        # ----------------------------------------------------
        # Scenario 4: NORMAL WORKDAY (Repeated Intent)
        # ----------------------------------------------------
        else:
            primary_actions = ["metro", "upi", "fastag"]
            secondary_actions = ["bill_pay", "send_money"]
            priority_modules = ["commute_habit", "upcoming_emi", "smart_savings"]
            deprioritized_modules = []

            hero_card = HeroCard(
                id="hero_metro",
                title="Your 8:40 AM Metro Commute",
                subtitle="Tap to instantly pay ₹40 with 1-click UPI auto-confirm",
                action_label="Pay ₹40",
                action_type="INSTANT_METRO_PAY",
                badge="ROUTINE HABIT",
                accent="#2563EB",
                why="Observed frequent weekday commute between 8:30 AM and 8:50 AM."
            )

            context_cards.append(ContextCardModel(
                id="card_morning_metro",
                type="action",
                layer="DO",
                priority=94,
                title="🚇 Your morning Metro",
                description="You usually make this payment around 8:40 AM for your weekday commute.",
                reason="Based on your repeated weekday commute pattern.",
                primary_action=CardAction(label="Pay ₹40 Again", action_type="INSTANT_METRO_PAY"),
                dismissible=True,
                badge="Usual Routine",
                accent="#2563EB",
                why_details=["22 trips this month", "Standard amount: ₹40", "1-tap biometric UPI"]
            ))

            context_cards.append(ContextCardModel(
                id="card_upcoming_emi",
                type="event",
                layer="KNOW",
                priority=74,
                title="Home Loan EMI in 4 days",
                description="₹16,500 will be auto-debited on Sep 16th. Your account has sufficient balance.",
                reason="Automated loan mandate schedule reminder.",
                primary_action=CardAction(label="View Mandate", action_type="VIEW_SCHEDULE"),
                dismissible=True,
                accent="#7C3AED",
                why_details=["HDFC Home Loan auto-debit", "Balance comfortably covers amount"]
            ))

        return ExperienceConfigModel(
            customer_id=state.customer_id,
            primary_actions=primary_actions,
            secondary_actions=secondary_actions,
            priority_modules=priority_modules,
            deprioritized_modules=deprioritized_modules,
            hero_card=hero_card,
            context_cards=context_cards,
            language=lang,
            interaction_mode="adaptive"
        )
