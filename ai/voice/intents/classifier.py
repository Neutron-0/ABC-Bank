import re
from typing import Dict, Any
from ai.voice.prompts.vernacular import VERNACULAR_PROMPTS

class VoiceIntentClassifier:
    """Classifies spoken/text vernacular queries into VoiceIntent contracts."""

    @staticmethod
    def classify(query: str, lang: str = "en") -> Dict[str, Any]:
        q = query.lower()

        if any(k in q for k in ["metro", "commute", "मेट्रो", "મેટ્રો"]):
            intent = "PAY_METRO"
            entities = {"merchant": "Delhi Metro Smart Card", "amount": 40}
        elif any(k in q for k in ["emi", "loan", "ईएमआई", "लोन", "હપ્તો"]):
            intent = "CHECK_EMI"
            entities = {"category": "home_loan", "amount": 16500}
        elif any(k in q for k in ["hospital", "medical", "claim", "अस्पताल", "दवा", "હોસ્પિટલ"]):
            intent = "MEDICAL_CLAIM_HELP"
            entities = {"hospital": "Max Super Speciality", "amount": 48200}
        elif any(k in q for k in ["stress", "tight", "commitment", "तंग", "बजट", "ખર્ચ"]):
            intent = "REVIEW_COMMITMENTS"
            entities = {"status": "tight_cash_flow"}
        elif any(k in q for k in ["save", "surplus", "fd", "बचत", "સરપ્લસ"]):
            intent = "SAVE_SURPLUS"
            entities = {"recommended_product": "Smart_FD_7_85"}
        elif any(k in q for k in ["lock", "freeze", "fraud", "चोरी", "कार्ड बंद"]):
            intent = "LOCK_CARD"
            entities = {"action": "freeze_debit_card"}
        else:
            intent = "GENERAL_QUERY"
            entities = {}

        prompt_dict = VERNACULAR_PROMPTS.get(intent, {})
        response_text = prompt_dict.get(lang, f"I received your request regarding {intent.lower().replace('_', ' ')}.")

        return {
            "intent": intent,
            "language": lang,
            "confidence": 0.94,
            "entities": entities,
            "response_text": response_text,
            "suggested_actions": ["CONFIRM", "DISMISS", "DETAILS"]
        }
