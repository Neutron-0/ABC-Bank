from typing import Dict, Any

class Explainer:
    """Generates natural language explainability for UI actions."""

    @staticmethod
    def explain(card_id: str, signals: Dict[str, Any]) -> str:
        if "fraud" in card_id:
            return "Surfaced because transaction timing and merchant IP deviates significantly from your profile."
        if "medical" in card_id:
            return "Surfaced because a non-routine hospital bill was debited. Empathy and claim filing are prioritized."
        if "cashflow" in card_id:
            return "Surfaced because upcoming obligations exceed liquid balance. Credit offers are actively suppressed."
        if "commute" in card_id:
            return "Surfaced because you make weekday Metro payments around 8:40 AM."
        return "Surfaced based on your current cash-flow health and recent account activity."
