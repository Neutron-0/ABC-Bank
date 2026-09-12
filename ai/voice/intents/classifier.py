"""Voice Intent Classifier combining MiniCPM-5 edge SLM and vernacular prompt dictionaries."""

from __future__ import annotations
from typing import Dict, Any, Optional
from ai.voice.model.minicpm5_runner import MiniCPM5Runner
from ai.voice.prompts.vernacular import VERNACULAR_PROMPTS


class VoiceIntentClassifier:
    """Classifies spoken/text vernacular queries into VoiceIntent contracts using MiniCPM-5 logic."""

    @classmethod
    def normalize_language_code(cls, lang: Optional[str]) -> str:
        """Normalizes language code strictly to 'en', 'hi', or 'gu' for schema compliance."""
        if not lang or not isinstance(lang, str):
            return "en"
        prefix = lang.lower().strip().split("-")[0].split("_")[0]
        if prefix in ["hi", "hindi"]:
            return "hi"
        if prefix in ["gu", "gujarati"]:
            return "gu"
        return "en"

    @classmethod
    def classify(cls, query: Optional[str], lang: str = "en") -> Dict[str, Any]:
        normalized_lang = cls.normalize_language_code(lang)
        parsed = MiniCPM5Runner.parse_intent(query, preferred_lang=normalized_lang)
        intent = parsed["intent"]
        resolved_lang = cls.normalize_language_code(parsed.get("language", normalized_lang))
        confidence = parsed["confidence"]
        entities = parsed["entities"]

        # Verbalize response using MiniCPM5Runner with fallback to prompt dictionary
        response_text = MiniCPM5Runner.verbalize(intent, entities, lang=resolved_lang)

        # Exhaustive domain-specific suggested actions
        suggested_actions = ["CONFIRM", "DISMISS", "DETAILS"]
        if intent == "LOCK_CARD":
            suggested_actions = ["UNFREEZE", "DISPUTE_CHARGE", "CALL_HELPLINE"]
        elif intent == "PAY_METRO":
            suggested_actions = ["1_TAP_PAY", "CHANGE_AMOUNT", "VIEW_PASS"]
        elif intent == "CHECK_EMI":
            suggested_actions = ["PAY_NOW", "SET_REMINDER", "VIEW_SCHEDULE"]
        elif intent == "PAY_BILL":
            suggested_actions = ["1_TAP_PAY", "VIEW_BILL", "CHANGE_ACCOUNT"]
        elif intent == "MEDICAL_CLAIM_HELP":
            suggested_actions = ["UPLOAD_DISCHARGE_SUMMARY", "VIEW_COVERAGE", "CALL_TPA"]
        elif intent == "SAVE_SURPLUS":
            suggested_actions = ["OPEN_SMART_FD", "EXPLORE_MUTUAL_FUNDS", "DISMISS"]
        elif intent == "REVIEW_COMMITMENTS":
            suggested_actions = ["PAUSE_SUBSCRIPTION", "VIEW_OBLIGATIONS", "DISMISS"]
        elif intent == "CHECK_BALANCE":
            suggested_actions = ["VIEW_TRANSACTIONS", "DOWNLOAD_STATEMENT", "DISMISS"]

        return {
            "intent": intent,
            "language": resolved_lang,
            "confidence": confidence,
            "entities": entities,
            "response_text": response_text,
            "suggested_actions": suggested_actions
        }
