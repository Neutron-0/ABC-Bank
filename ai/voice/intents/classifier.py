"""Voice Intent Classifier combining MiniCPM-5 edge SLM and vernacular prompt dictionaries."""

from __future__ import annotations
from typing import Dict, Any, Optional
from ai.voice.model.minicpm5_runner import MiniCPM5Runner
from ai.voice.prompts.vernacular import VERNACULAR_PROMPTS


from ai.voice.dialogue.manager import DialogueManager
from ai.voice.intents.autocorrect import autocorrect_stt_text


class VoiceIntentClassifier:
    """Classifies spoken/text vernacular queries into VoiceIntent contracts using MiniCPM-5 logic and DialogueManager."""

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
    def classify(
        cls,
        query: Optional[str],
        lang: str = "en",
        stress_level: str = "normal",
        pending_clarification: Optional[str] = None
    ) -> Dict[str, Any]:
        raw_q = str(query or "").strip()
        clean_q = autocorrect_stt_text(raw_q)
        if lang is None:
            normalized_lang = MiniCPM5Runner.detect_language(clean_q)
        else:
            normalized_lang = cls.normalize_language_code(lang)

        # Step 1: Check multi-turn DialogueManager for smart disambiguation & direct navigation
        dialogue_turn = DialogueManager.process_turn(
            clean_q,
            language=normalized_lang,
            pending_clarification=pending_clarification
        )

        parsed = MiniCPM5Runner.parse_intent(clean_q, preferred_lang=normalized_lang)
        entities = parsed["entities"]
        resolved_lang = cls.normalize_language_code(parsed.get("language", normalized_lang))

        # Check if query matches specific voice intents in MiniCPM-5 or DialogueManager
        is_direct_score = dialogue_turn.intent in ["CLARIFY_CREDIT_SCORE", "NAVIGATE_CREDIT_SCORE", "DECLINED_CLARIFICATION"]
        is_direct_card = dialogue_turn.intent == "NAVIGATE_DEBIT_CARD"

        if is_direct_score:
            intent = "GENERAL_QUERY"
            entities["is_relevant"] = True
            entities["journey_id"] = "credit_score"
            response_text = dialogue_turn.response_text
            confidence = 0.96
            resolved_lang = cls.normalize_language_code(dialogue_turn.language)
        elif is_direct_card and clean_q.lower() in ["debit card", "atm card", "डेबिट कार्ड", "ડેબિટ કાર્ડ"]:
            intent = "LOCK_CARD"
            entities["is_relevant"] = True
            response_text = dialogue_turn.response_text
            confidence = 0.96
            resolved_lang = cls.normalize_language_code(dialogue_turn.language)
        elif dialogue_turn.intent == "NAVIGATE_KYC":
            intent = "GENERAL_QUERY"
            entities["journey_id"] = "kyc"
            entities["is_relevant"] = True
            entities["query_type"] = "kyc"
            response_text = dialogue_turn.response_text
            confidence = 0.96
            resolved_lang = cls.normalize_language_code(dialogue_turn.language)
        elif dialogue_turn.intent == "NAVIGATE_ACTIVITY":
            intent = "CHECK_BALANCE"
            entities["view"] = "activity"
            entities["query_type"] = "spending"
            entities["is_relevant"] = True
            response_text = dialogue_turn.response_text
            confidence = 0.96
            resolved_lang = cls.normalize_language_code(dialogue_turn.language)
        elif dialogue_turn.intent == "NAVIGATE_MEDICAL":
            intent = "MEDICAL_CLAIM_HELP"
            entities["journey_id"] = "medical_assistance"
            entities["is_relevant"] = True
            response_text = dialogue_turn.response_text
            confidence = 0.96
            resolved_lang = cls.normalize_language_code(dialogue_turn.language)
        elif dialogue_turn.intent == "NAVIGATE_SAVINGS":
            intent = "SAVE_SURPLUS"
            entities["journey_id"] = "savings_invest"
            entities["is_relevant"] = True
            response_text = dialogue_turn.response_text
            confidence = 0.96
            resolved_lang = cls.normalize_language_code(dialogue_turn.language)
        else:
            intent = parsed["intent"]
            confidence = parsed["confidence"]
            resolved_lang = cls.normalize_language_code(parsed.get("language", normalized_lang))
            response_text = MiniCPM5Runner.verbalize(intent, entities, lang=resolved_lang, stress_level=stress_level)

        # Exhaustive domain-specific suggested actions
        suggested_actions = ["CONFIRM", "DISMISS", "DETAILS"]
        if intent == "LOCK_CARD":
            suggested_actions = ["UNFREEZE", "DISPUTE_CHARGE", "CALL_HELPLINE"]
        elif intent == "PAY_METRO":
            suggested_actions = ["1_TAP_PAY", "CHANGE_AMOUNT", "VIEW_PASS"]
        elif intent == "CHECK_EMI":
            if entities.get("inquiry_type") == "loan_application":
                if stress_level in ["stress", "tight"]:
                    suggested_actions = ["REVIEW_COMMITMENTS", "SPEAK_TO_COUNSELOR", "DISMISS"]
                else:
                    suggested_actions = ["EXPLORE_ELIGIBILITY", "VIEW_RATES", "DISMISS"]
            else:
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
            "suggested_actions": suggested_actions,
            "suggested_prompts": dialogue_turn.suggested_prompts or ["Debit Card", "Score", "Pay Metro", "Send Money"],
            "pending_clarification": dialogue_turn.pending_clarification,
            "navigation": dialogue_turn.navigation.model_dump() if dialogue_turn.navigation else None,
            "action_chips": dialogue_turn.action_chips
        }
