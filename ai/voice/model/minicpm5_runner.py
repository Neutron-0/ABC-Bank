"""MiniCPM-5 Edge SLM Runner: On-Device Vernacular Voice & Intent Processing for Bharat Banking."""

from __future__ import annotations
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from ai.voice.model.neural_slm import (
    MiniCPM5ONNXModel,
    IndicEntityParser,
    NaturalSpeechVerbalizer
)


class MiniCPM5Config(BaseModel):
    model_name: str = "MiniCPM-V-2.6 / MiniCPM-4B-SLM"
    quantization: str = "INT4-AWQ / ONNX-Runtime"
    context_window: int = 4096
    ram_footprint_mb: int = 1850
    target_hardware: str = "On-Device Mobile NPU / Snapdragon 7+ / Apple Neural Engine"
    supported_languages: List[str] = ["en", "hi", "gu", "mr", "ta", "te"]


class MiniCPM5Runner:
    """Local edge SLM runner executing vernacular intent detection and privacy-preserved verbalization."""

    CONFIG = MiniCPM5Config()

    @classmethod
    def get_system_prompt(cls, language: str) -> str:
        """Returns zero-data-leakage system prompt instructing the SLM to only verbalize verified facts."""
        return (
            "You are Mitra, a compassionate, private, on-device vernacular banking intelligence assistant "
            "for ABC Bank (Bharat). You operate under strict DPDP Act 2023 guidelines. You do not invent loan "
            "terms or approve financial products. You answer in plain, conversational language using only the "
            "trusted banking facts supplied in structured context. Speak naturally in the user's dialect."
        )

    @classmethod
    def detect_language(cls, query: str) -> str:
        """Heuristically detects English, Hindi, or Gujarati script/phrases."""
        # Devanagari script range
        if re.search(r"[\u0900-\u097F]", query):
            return "hi"
        # Gujarati script range
        if re.search(r"[\u0A80-\u0AFF]", query):
            return "gu"
        # Common Gujarati Hinglish / transliterated markers
        if any(w in query.lower().split() for w in ["chhe", "kem", "su", "maru", "tamaru", "kyare", "aapjo"]):
            return "gu"
        # Common Hindi Hinglish / transliterated markers
        if any(w in query.lower().split() for w in ["mera", "meri", "kya", "hai", "karo", "kitna", "batao"]):
            return "hi"
        return "en"

    @classmethod
    def parse_intent(cls, spoken_query: Optional[str], preferred_lang: Optional[str] = None) -> Dict[str, Any]:
        """Parses vernacular spoken query into structured VoiceIntent conforming to contracts/voice-intent.schema.json using ONNX SLM."""
        clean_q = str(spoken_query or "").strip()

        # Normalize preferred language code (handles 'hi-IN', 'gu-IN', etc.)
        norm_lang = "en"
        if preferred_lang and isinstance(preferred_lang, str):
            prefix = preferred_lang.lower().strip().split("-")[0].split("_")[0]
            if prefix in ["hi", "hindi"]:
                norm_lang = "hi"
            elif prefix in ["gu", "gujarati"]:
                norm_lang = "gu"
            elif prefix in ["en", "english"]:
                norm_lang = "en"
            else:
                norm_lang = "en"
        else:
            norm_lang = cls.detect_language(clean_q)

        lang = norm_lang

        if not clean_q:
            return {
                "intent": "GENERAL_QUERY",
                "language": lang,
                "confidence": 0.70,
                "entities": {},
                "runtime_device": cls.CONFIG.target_hardware,
                "model_version": cls.CONFIG.model_name,
                "latency_ms": 0.1
            }

        # Genuine on-device neural forward pass via ONNX Runtime
        prediction = MiniCPM5ONNXModel.predict(clean_q)
        detected_intent = prediction["intent"]
        confidence = prediction["confidence"]
        latency_ms = prediction["latency_ms"]

        # Dynamic entity and spoken numeral extraction
        entities = IndicEntityParser.extract_entities(detected_intent, clean_q)

        return {
            "intent": detected_intent,
            "language": lang,
            "confidence": confidence,
            "entities": entities,
            "runtime_device": cls.CONFIG.target_hardware,
            "model_version": cls.CONFIG.model_name,
            "latency_ms": latency_ms,
            "probabilities": prediction.get("probabilities", {})
        }

    @classmethod
    def verbalize(
        cls,
        intent: str,
        trusted_data: Dict[str, Any],
        lang: str = "en",
        stress_level: str = "normal"
    ) -> str:
        """Verbalizes trusted backend facts into natural vernacular language with stress-adaptive empathy."""
        is_stressed = stress_level in ["stress", "tight"] or trusted_data.get("financial_health") in ["stress", "tight"]

        if intent == "CHECK_EMI":
            amt = trusted_data.get("amount", 16500)
            date = trusted_data.get("due_date", "16 September")
            is_loan_app = trusted_data.get("inquiry_type") == "loan_application" or trusted_data.get("action") == "loan_application"

            if is_stressed:
                if is_loan_app:
                    if lang == "gu":
                        return "આરબીઆઈ ફેર લેન્ડિંગ નિયમો મુજબ, તમારા હાલના ઋણ બોજને કારણે નવી લોન લેવા કરતાં કેશફ્લો સ્થિર કરવાની સલાહ આપવામાં આવે છે. શું તમે તમારા વર્તમાન ખર્ચની સમીક્ષા કરવા માંગો છો?"
                    elif lang == "hi":
                        return "आरबीआई निष्पक्ष ऋण दिशानिर्देशों के अनुसार, आपके वर्तमान ऋण दायित्वों को देखते हुए नया ऋण लेने के बजाय नकदी प्रवाह को स्थिर करना बेहतर होगा। क्या आप वर्तमान खर्चों की समीक्षा करना चाहते हैं?"
                    return "Under RBI fair lending guidelines and your active debt commitments, cash flow stabilization is recommended before taking new credit. Would you like to review your commitments?"

                if lang == "gu":
                    return f"તમારું હોમ લોન EMI ₹{amt:,} છે અને તે {date} એ ચૂકવવાનું છે. ચિંતા કરશો નહીં, અમે સુરક્ષિત કેશ ફ્લો વિકલ્પો તૈયાર રાખ્યા છે."
                elif lang == "hi":
                    return f"आपकी होम लोन ईएमआई ₹{amt:,} है जो {date} को देय है। घबराएं नहीं, हमने आपके खाते की सुरक्षा के लिए सहायता विकल्प तैयार रखे हैं।"
                return f"Your home loan EMI of ₹{amt:,} is scheduled for {date}. Don't worry, we have prepared flexible guidance to keep your score protected."

            if lang == "gu":
                return f"તમારું હોમ લોન EMI ₹{amt:,} છે અને તે {date} એ ચૂકવવાનું છે."
            elif lang == "hi":
                return f"आपकी होम लोन की ईएमआई ₹{amt:,} है और इसकी अंतिम तारीख {date} है।"
            return f"Your home loan EMI of ₹{amt:,} is scheduled for payment on {date}."

        elif intent == "PAY_BILL":
            biller = trusted_data.get("biller", "Tata Power Electricity")
            amt = trusted_data.get("amount", 1450)
            if lang == "gu":
                return f"તમારું {biller} નું બિલ ₹{amt:,} છે. શું હું 1-ટેપથી પેમેન્ટ કરું?"
            elif lang == "hi":
                return f"आपका {biller} का बिल ₹{amt:,} है। क्या आप 1-टैप से भुगतान करना चाहते हैं?"
            return f"Your {biller} bill of ₹{amt:,} is ready for payment. Proceed with 1-tap?"

        elif intent == "CHECK_BALANCE":
            bal = trusted_data.get("available", 42680)
            safe_spend = trusted_data.get("safe_to_spend_today")
            if safe_spend is not None and is_stressed:
                if lang == "gu":
                    return f"તમારા ખાતામાં ₹{bal:,} છે, અને આગામી હપ્તાઓને ધ્યાનમાં રાખીને સુરક્ષિત ખર્ચ મર્યાદા ₹{safe_spend:,} છે."
                elif lang == "hi":
                    return f"आपके खाते में ₹{bal:,} हैं। आगामी जिम्मेदारियों को देखते हुए आज खर्च करने के लिए सुरक्षित राशि ₹{safe_spend:,} है।"
                return f"Your balance is ₹{bal:,}. Factoring upcoming obligations, your safe-to-spend headroom today is ₹{safe_spend:,}."

            if lang == "gu":
                return f"તમારા ખાતામાં ઉપલબ્ધ બેલેન્સ ₹{bal:,} છે."
            elif lang == "hi":
                return f"आपके बचत खाते में उपलब्ध बैलेंस ₹{bal:,} है।"
            return f"Your available account balance is ₹{bal:,}."

        elif intent == "PAY_METRO":
            fare = trusted_data.get("amount", 40)
            if lang == "gu":
                return f"તમારી સવારની દૈનિક મેટ્રો ટિકિટ ₹{fare} છે. શું હું 1-ટેપથી પેમેન્ટ કરું?"
            elif lang == "hi":
                return f"आपकी दैनिक सुबह की मेट्रो यात्रा का किराया ₹{fare} है। क्या आप 1-टैप यूपीआई से भुगतान करना चाहते हैं?"
            return f"Your routine morning metro fare is ₹{fare}. Would you like to pay with 1-tap UPI?"

        elif intent == "MEDICAL_CLAIM_HELP":
            hosp = trusted_data.get("hospital", "Max Super Speciality Hospital")
            amt = trusted_data.get("amount", 48200)
            if lang == "gu":
                return f"{hosp} ના ₹{amt:,} ના બિલ માટે ક્લેમ ફાઇલિંગ સહાય શરૂ કરી છે."
            elif lang == "hi":
                return f"{hosp} के ₹{amt:,} के बिल के लिए स्वास्थ्य बीमा क्लेम सहायता शुरू कर दी गई है।"
            return f"Insurance claim reimbursement assistance has been prioritized for your ₹{amt:,} payment at {hosp}."

        elif intent == "REVIEW_COMMITMENTS":
            if lang == "gu":
                return "આ મહિનામાં તમારા ખર્ચ થોડા વધારે છે. અમે બિનજરૂરી સબસ્ક્રિપ્શન અટકાવવામાં મદદ કરી શકીએ છીએ."
            elif lang == "hi":
                return "इस महीने आपके वित्तीय दायित्व सामान्य से अधिक हैं। हमने आपके लिए गैर-जरूरी खर्चों को रोकने का विकल्प तैयार किया है।"
            return "Your commitments are higher than usual this cycle. We have prepared options to pause unused subscriptions."

        elif intent == "SAVE_SURPLUS":
            if lang == "gu":
                return "તમારી પાસે વધારાનું બેલેન્સ છે. તમે તેને 7.85% સ્માર્ટ એફડીમાં રોકી શકો છો."
            elif lang == "hi":
                return "आपके खाते में अधिशेष राशि है। आप इसे 7.85% स्मार्ट एफडी में सुरक्षित निवेश कर सकते हैं।"
            return "You have surplus funds above your routine buffer. You can earn 7.85% in an instant Smart FD."

        elif intent == "LOCK_CARD":
            if lang == "gu":
                return "તમારી સુરક્ષા માટે કાર્ડ તાત્કાલિક લોક કરવામાં આવ્યું છે."
            elif lang == "hi":
                return "आपकी सुरक्षा के लिए आपका डेबिट कार्ड तुरंत लॉक कर दिया गया है।"
            return "Your debit card has been instantly frozen for your security."

        # Default fallback
        if lang == "gu":
            return "હું તમારી વિનંતી સમજી ગયો છું. હું તમને કેવી રીતે મદદ કરી શકું?"
        elif lang == "hi":
            return "मैंने आपका अनुरोध प्राप्त कर लिया है। मैं आपकी क्या सहायता कर सकता हूँ?"
        return "I have received your banking request and am ready to assist."

    @classmethod
    def verbalize_spoken(
        cls,
        intent: str,
        entities: Dict[str, Any],
        lang: str = "en",
        stress_level: str = "normal"
    ) -> str:
        """Verbalizes into natural speech audio string where numbers are words and no special symbols exist."""
        return NaturalSpeechVerbalizer.verbalize_spoken(
            intent=intent,
            entities=entities,
            language=lang,
            stress_level=stress_level
        )
