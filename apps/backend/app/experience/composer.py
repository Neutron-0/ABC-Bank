from typing import Dict, Any, List, Optional
from apps.backend.app.models.customer_state import CustomerStateModel, Recommendation
from apps.backend.app.models.experience import (
    ExperienceConfigModel,
    ContextCardModel,
    CardAction,
    HeroCard
)
from apps.backend.app.services.safety_policy import SafetyPolicyFilter

class ExperienceComposer:
    """
    Experience Composer — Translates CustomerState into ExperienceConfig
    strictly adhering to contracts/experience.schema.json.

    Architecture Principles:
    - Purely recommendation & signal driven; NO hardcoded event/scenario ladders.
    - Operates on generic attention layers (DO, KNOW, PLAN, CONSIDER).
    - Derives HeroCard from the highest-priority active recommendation.
    - Derives primary actions from actionable recommendations or declared candidate actions.
    - Enforces Backend SafetyPolicyFilter (anti-predatory suppression during financial stress).
    - NEVER fabricates loans, merchants, or financial amounts.
    - Supports arbitrary future categories (e.g. education, agriculture, tax, small_business)
      without backend code changes.
    """

    # Attention layer heuristics based on priority & urgency
    @staticmethod
    def _determine_layer(priority: int, category: Optional[str] = None) -> str:
        """
        Maps a recommendation to an attention layer based on its priority weight.
        Priority >= 90: Urgent / Immediate action required -> 'DO'
        Priority >= 70: Timely contextual knowledge / awareness -> 'KNOW'
        Priority >= 50: Forward-looking budgeting / planning -> 'PLAN'
        Priority <  50: Optional discovery / growth -> 'CONSIDER'
        """
        if priority >= 90:
            return "DO"
        elif priority >= 70:
            return "KNOW"
        elif priority >= 50:
            return "PLAN"
        else:
            return "CONSIDER"

    @staticmethod
    def _determine_badge(layer: str, priority: int, suppressed: bool = False) -> str:
        if suppressed:
            return "Suppressed"
        if layer == "DO":
            return "Action Required" if priority >= 95 else "Priority"
        elif layer == "KNOW":
            return "Context"
        elif layer == "PLAN":
            return "Planning"
        else:
            return "Explore"

    @staticmethod
    def _determine_accent(category: Optional[str], layer: str) -> str:
        """Determines visual accent color based on layer/category palette."""
        cat = (category or "").lower()
        if cat in ["security", "fraud"]:
            return "#DC2626"
        if cat in ["guidance", "support"]:
            return "#D97706"
        if cat in ["healthcare", "medical"]:
            return "#0284C7"
        if cat in ["savings", "investment", "growth"]:
            return "#059669"
        if cat in ["transport", "commute"]:
            return "#2563EB"
        if cat in ["education", "learning"]:
            return "#4F46E5"
        if cat in ["agriculture", "rural"]:
            return "#16A34A"

        # Layer-based fallback palette
        if layer == "DO":
            return "#2563EB"
        elif layer == "KNOW":
            return "#6366F1"
        elif layer == "PLAN":
            return "#7C3AED"
        else:
            return "#64748B"

    @classmethod
    def compose(
        cls,
        state: CustomerStateModel,
        lang: str = "en",
        current_time: Optional[Any] = None
    ) -> ExperienceConfigModel:
        signals = state.signals or {}
        health = state.financial_health or "stable"
        raw_recommendations = list(state.recommendations or [])

        # Evaluate contextual habits if behavioral analysis is available in signals
        from apps.backend.app.services.behavior_engine import BehavioralEngine
        habits = signals.get("habits", {})
        ctx_time = current_time or signals.get("current_context_time")
        if habits:
            ctx_recs = BehavioralEngine.evaluate_current_relevance(habits, current_time=ctx_time)
            for cr in ctx_recs:
                raw_recommendations.append(Recommendation(**cr))

        # 1. Determine financial stress state
        is_stress = SafetyPolicyFilter.evaluate_financial_stress(health, signals)

        # 2. Filter recommendations via Backend Safety Policy (deterministic safeguard)
        safe_recommendations = SafetyPolicyFilter.filter_recommendations(
            raw_recommendations,
            is_stress=is_stress
        )

        # 3. Active recommendations sorted by priority descending
        active_recs = [r for r in safe_recommendations if not r.suppressed]
        active_recs.sort(key=lambda x: x.priority, reverse=True)

        # 4. Compose HeroCard from highest priority active recommendation
        hero_card = cls._build_hero_card(active_recs, signals, is_stress)

        # 5. Compose primary and secondary actions from active recommendations
        primary_actions, secondary_actions = cls._resolve_actions(active_recs, is_stress)

        # 6. Compose prioritized modules
        priority_modules, deprioritized_modules = cls._resolve_modules(active_recs, is_stress)

        # 7. Compose ContextCards from all safe active recommendations
        context_cards = cls._build_context_cards(active_recs, signals, is_stress)

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

    @classmethod
    def _build_hero_card(
        cls,
        active_recs: List[Recommendation],
        signals: Dict[str, Any],
        is_stress: bool
    ) -> HeroCard:
        """
        Generic HeroCard construction:
        Always elevates the highest-priority active recommendation to the hero slot.
        If no recommendations are present, provides a neutral status baseline.
        Does NOT hardcode branches for medical, fraud, metro, or surplus.
        """
        if active_recs:
            top_rec = active_recs[0]
            cat = top_rec.category or "general"
            layer = cls._determine_layer(top_rec.priority, cat)
            accent = cls._determine_accent(cat, layer)
            badge = cls._determine_badge(layer, top_rec.priority)

            # Extract declared action or provide generic fallback
            action_label = top_rec.action_label or "View Details"
            action_type = top_rec.action_type or "OPEN_DETAILS"

            return HeroCard(
                id=f"hero_{top_rec.id}",
                title=top_rec.title,
                subtitle=top_rec.reason or "Priority banking update based on your latest account signals.",
                action_label=action_label,
                action_type=action_type,
                badge=badge,
                accent=accent,
                why=top_rec.reason or f"Evaluated by AI ranking engine with priority {top_rec.priority}."
            )

        # Neutral fallback when no recommendations exist
        return HeroCard(
            id="hero_account_status",
            title="Account Overview",
            subtitle="Your accounts and payments are up to date with no urgent actions required.",
            action_label="View Insights",
            action_type="OPEN_SCREEN",
            badge="ACCOUNT STATUS",
            accent="#2563EB",
            why="Standard baseline account review."
        )

    @classmethod
    def _resolve_actions(
        cls,
        active_recs: List[Recommendation],
        is_stress: bool
    ) -> (List[str], List[str]):
        """
        Generic action resolver:
        Derives actions from declared recommendation metadata or candidate categories.
        """
        primary: List[str] = []
        secondary: List[str] = ["bill_pay", "send_money"]

        for rec in active_recs:
            # If recommendation declares an explicit action type or category action
            action_identifier = None
            if rec.action_type:
                action_identifier = rec.action_type.lower()
            elif rec.category:
                cat = rec.category.lower()
                if cat in ["transport", "commute"] or "metro" in (rec.id or "").lower():
                    action_identifier = "metro"
                else:
                    action_identifier = cat

            if action_identifier and action_identifier not in primary:
                primary.append(action_identifier)

            if len(primary) >= 4:
                break

        # If primary actions list is short, complement with neutral baseline actions
        if is_stress:
            if "review_commitments" not in primary:
                primary.append("review_commitments")
            if "pause_subscriptions" not in primary:
                primary.append("pause_subscriptions")
            secondary = ["speak_with_mitra", "view_cashflow", "support"]
        else:
            default_candidates = ["upi", "fastag", "pay_bills"]
            for cand in default_candidates:
                if cand not in primary and len(primary) < 3:
                    primary.append(cand)

        return primary[:4], secondary[:3]

    @classmethod
    def _resolve_modules(
        cls,
        active_recs: List[Recommendation],
        is_stress: bool
    ) -> (List[str], List[str]):
        """
        Derives active priority and deprioritized modules dynamically from recommendations,
        governed by the Backend Safety Policy.
        """
        base_priority: List[str] = []
        base_deprioritized: List[str] = []

        # Populate priority modules based on categories in active recommendations
        for rec in active_recs:
            mod_name = f"{rec.category}_module" if rec.category else "overview_module"
            if mod_name not in base_priority:
                base_priority.append(mod_name)

        if not base_priority:
            base_priority = ["account_overview", "recent_activity", "insights"]

        # Apply deterministic safety policy filter
        return SafetyPolicyFilter.apply_module_policies(
            priority_modules=base_priority,
            deprioritized_modules=base_deprioritized,
            is_stress=is_stress
        )

    @classmethod
    def _build_context_cards(
        cls,
        active_recs: List[Recommendation],
        signals: Dict[str, Any],
        is_stress: bool
    ) -> List[ContextCardModel]:
        """
        Translates safe recommendations into standardized ContextCardModel items.
        Does NOT inject fabricated cards.
        Handles arbitrary categories seamlessly with generic fallbacks.
        """
        cards: List[ContextCardModel] = []

        for rec in active_recs:
            cat = (rec.category or "general").lower()
            layer = cls._determine_layer(rec.priority, cat)
            accent = cls._determine_accent(cat, layer)
            badge = cls._determine_badge(layer, rec.priority)

            # Resolve primary action from recommendation metadata or safe generic fallback
            action_label = rec.action_label or "View Details"
            action_type = rec.action_type or "OPEN_DETAILS"
            journey_id = rec.journey_id
            payload = rec.payload

            primary_action = CardAction(
                label=action_label,
                action_type=action_type,
                journey_id=journey_id,
                payload=payload
            )

            clean_reason = rec.reason or "Based on verified customer transaction and account patterns"
            why_details = [clean_reason]

            card = ContextCardModel(
                id=f"card_{rec.id}",
                type=cat,
                layer=layer,
                priority=rec.priority,
                title=rec.title,
                description=rec.reason or "",
                reason=rec.reason or "Based on verified customer transaction and account patterns",
                primary_action=primary_action,
                dismissible=(layer != "DO"),
                badge=badge,
                accent=accent,
                why_details=why_details
            )
            cards.append(card)

        return cards
