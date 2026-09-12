"""
Mitra Dialogue Manager: Multi-turn conversational voice & navigation assistant for Bharat Banking.
Handles vernacular queries (English, Hinglish, Hindi, Gujarati, Gujlish) with minimal follow-ups,
disambiguation (e.g. 'score' -> Credit Score?), and instant direct navigation (e.g. 'debit card').
Zero emojis, strict DPDP Act 2023 compliance.
"""

from __future__ import annotations
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class DialogueTurn(BaseModel):
    query: str
    language: str = "en"
    pending_clarification: Optional[str] = None
    session_id: Optional[str] = None


class NavigationTarget(BaseModel):
    type: str = "JOURNEY"  # "JOURNEY" or "TAB"
    target: str
    auto_navigate: bool = False
    action_label: Optional[str] = None


class DialogueResponse(BaseModel):
    intent: str
    language: str
    response_text: str
    pending_clarification: Optional[str] = None
    navigation: Optional[NavigationTarget] = None
    action_chips: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_prompts: List[str] = Field(default_factory=list)


class DialogueManager:
    """Multi-turn stateful dialogue manager for Mitra voice & chat interface."""

    # Language detection patterns
    _DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097F]")
    _GUJARATI_REGEX = re.compile(r"[\u0A80-\u0AFF]")

    _HINGLISH_KEYWORDS = {
        "mera", "meri", "mere", "kya", "hai", "karo", "kitna", "batao", "bhejo",
        "paise", "dekhna", "khol", "kholo", "chahiye", "haan", "ha", "nahi", "ruk"
    }

    _GUJLISH_KEYWORDS = {
        "maru", "mari", "maro", "su", "chhe", "kem", "tamaru", "kyare", "aapjo",
        "paisa", "joyie", "moklo", "jovo", "ha", "nathi"
    }

    # Affirmative and negative triggers
    _AFFIRMATIVE_REGEX = re.compile(
        r"(?i)\b(yes|yeah|yep|sure|ok|okay|haan|ha|sahi\s*hai|dikhao|kholo|check\s*karo|yes\s*please|bilkul|zaroor)\b"
        r"|(हाँ|हा|बिल्कुल|ज़रूर|हाँ दिखाओ)"
        r"|(હા|ચોક્કસ|હા બતાવો|ખોલો)"
    )

    _NEGATIVE_REGEX = re.compile(
        r"(?i)\b(no|nah|nope|nahi|na|cancel|mat\s*karo|rehne\s*do|nathi)\b"
        r"|(नहीं|ना|रद्द करो)"
        r"|(ના|નહીં|રદ કરો)"
    )

    # Direct credit score keywords (zero follow-up needed)
    _DIRECT_CREDIT_SCORE_REGEX = re.compile(
        r"(?i)\b(credit\s*score|cibil\s*score|experian\s*score|credit\s*report|check\s*my\s*credit\s*score)\b"
        r"|(क्रेडिट स्कोर|सिबिल स्कोर|क्रेडिट रिपोर्ट)"
        r"|(ક્રેડિટ સ્કોર|સિબિલ સ્કોર|ક્રેડિટ રિપોર્ટ)"
    )

    # Ambiguous keywords requiring minimal follow-up (tested when NOT direct credit score)
    _AMBIGUOUS_SCORE_REGEX = re.compile(
        r"(?i)\b(score|cibil|credit\s*rating|rating)\b"
        r"|(स्कोर|सिबिल|रेटिंग)"
        r"|(સ્કોર|સિબિલ)"
    )

    # Direct navigation keywords (zero follow-up needed)
    _DIRECT_DEBIT_CARD_REGEX = re.compile(
        r"(?i)\b(debit\s*card|atm\s*card|my\s*card|card\s*settings|lock\s*card|freeze\s*card|card\s*limit|atm|rupay|card\s*pin)\b"
        r"|(डेबिट कार्ड|एटीएम कार्ड|मेरा कार्ड|कार्ड ब्लॉक|कार्ड लॉक)"
        r"|(ડેબિટ કાર્ડ|એટીએમ કાર્ડ|મારું કાર્ડ|કાર્ડ બ્લોક|કાર્ડ લોક)"
    )

    _DIRECT_METRO_REGEX = re.compile(
        r"(?i)\b(metro|delhi\s*metro|noida\s*metro|metro\s*recharge|metro\s*card|smart\s*card|commute\s*pass)\b"
        r"|(मेट्रो|मेट्रो रिचार्ज|स्मार्ट कार्ड)"
        r"|(મેટ્રો|મેટ્રો રિચાર્જ|સ્માર્ટ કાર્ડ)"
    )

    _DIRECT_PAYMENTS_REGEX = re.compile(
        r"(?i)\b(send\s*money|transfer|pay\s*someone|upi|pay\s*bills|electricity\s*bill|mobile\s*recharge|paise\s*bhejo)\b"
        r"|(पैसे भेजो|ट्रांसफर|यूपीआई|बिल भरो|मोबाइल रिचार्ज)"
        r"|(પૈસા મોકલો|ટ્રાન્સફર|યુપીઆઈ|બિલ ભરો|મોબાઇલ રિચાર્જ)"
    )

    _DIRECT_ACTIVITY_REGEX = re.compile(
        r"(?i)\b(passbook|transactions|history|statement|recent\s*payments|kharcha|account\s*statement)\b"
        r"|(पासबुक|लेनदेन|हिसाब|स्टेटमेंट|खर्च)"
        r"|(પાસબુક|વ્યવહાર|સ્ટેટમેન્ટ|ખર્ચ)"
    )

    _DIRECT_SAVINGS_REGEX = re.compile(
        r"(?i)\b(fd|fixed\s*deposit|smart\s*fd|savings|invest|gold|mutual\s*funds|sip|surplus)\b"
        r"|(एफडी|बचत|निवेश|सोना|म्यूचुअल फंड|फिक्स्ड डिपॉजिट)"
        r"|(એફડી|બચત|રોકાણ|સોનું|મ્યુચ્યુઅલ ફંડ|ફિક્સ્ડ ડિપોઝિટ)"
    )

    _DIRECT_KYC_REGEX = re.compile(
        r"(?i)\b(kyc|video\s*kyc|aadhaar|pan\s*card|identity\s*verify|update\s*kyc)\b"
        r"|(केवाईसी|वीडियो केवाईसी|आधार|पैन कार्ड)"
        r"|(કેવાયસી|વિડિયો કેવાયસી|આધાર|પાન કાર્ડ)"
    )

    _DIRECT_LOAN_REGEX = re.compile(
        r"(?i)\b(loan|apply\s*loan|personal\s*loan|kcc|kisan\s*credit|working\s*capital|karz)\b"
        r"|(लोन|कर्ज|पर्सनल लोन|किसान क्रेडिट|ऋण)"
        r"|(લોન|ધિરાણ|પર્સનલ લોન|કિસાન ક્રેડિટ)"
    )

    _DIRECT_MEDICAL_REGEX = re.compile(
        r"(?i)\b(medical|hospital|claim|insurance|health\s*claim|doctor\s*bill|hospital\s*expense)\b"
        r"|(अस्पताल|दवा|इलाज|क्लेम|बीमा|स्वास्थ्य)"
        r"|(હોસ્પિટલ|દવા|સારવાર|ક્લેમ|વીમો|આરોગ્ય)"
    )

    _DIRECT_FRAUD_REGEX = re.compile(
        r"(?i)\b(fraud|stolen|unauthorized|freeze\s*account|scam|hack|suspicious\s*charge)\b"
        r"|(धोखा|फ्रॉड|खाता फ्रीज|चोरी|संदिग्ध लेन-देन)"
        r"|(ફ્રોડ|ખોવાઈ ગયું|ખાતું ફ્રીઝ|શંકાસ્પદ વ્યવહાર)"
    )

    _DIRECT_BUDGET_REGEX = re.compile(
        r"(?i)\b(budget|stress|tight|pause\s*subscription|emi\s*relief|restructure|financial\s*counselor)\b"
        r"|(बजट|तंग|खर्च कम|सब्सक्रिप्शन रोको|ईएमआई राहत)"
        r"|(બજેટ|ખેંચ|સબસ્ક્રિપ્શન અટકાવો|ઇએમઆઇ રાહત)"
    )

    _DIRECT_PROFILE_REGEX = re.compile(
        r"(?i)\b(profile|settings|change\s*language|personalization|privacy|consent|my\s*account)\b"
        r"|(प्रोफाइल|सेटिंग्स|भाषा बदलो|गोपनीयता|सहमति)"
        r"|(પ્રોફાઇલ|સેટિંગ્સ|ભાષા બદલો|ગોપનીયતા|સહમતિ)"
    )

    @classmethod
    def detect_language(cls, text: str, fallback_lang: str = "en") -> str:
        """Detects language code strictly as 'en', 'hi', or 'gu'."""
        if not text or not isinstance(text, str):
            return fallback_lang

        clean = text.strip()
        if cls._GUJARATI_REGEX.search(clean):
            return "gu"
        if cls._DEVANAGARI_REGEX.search(clean):
            return "hi"

        tokens = set(re.sub(r"[^\w\s]", "", clean.lower()).split())
        if tokens.intersection(cls._GUJLISH_KEYWORDS):
            return "gu"
        if tokens.intersection(cls._HINGLISH_KEYWORDS):
            return "hi"

        return fallback_lang if fallback_lang in ["hi", "gu"] else "en"

    @classmethod
    def process_turn(
        cls,
        query: str,
        language: str = "en",
        pending_clarification: Optional[str] = None
    ) -> DialogueResponse:
        if isinstance(query, DialogueTurn):
            language = query.language or language
            pending_clarification = query.pending_clarification or pending_clarification
            query = query.query

        q = (query or "").strip()
        detected_lang = cls.detect_language(q, fallback_lang=language)

        # ---------------------------------------------------------------------
        # PHASE 1: Handle Existing Pending Clarifications (Follow-up Turn)
        # ---------------------------------------------------------------------
        if pending_clarification == "CONFIRM_CREDIT_SCORE":
            if cls._AFFIRMATIVE_REGEX.search(q):
                # User confirmed: navigate directly to Credit Score
                if detected_lang == "hi":
                    resp_text = "जी हाँ, आपके क्रेडिट स्कोर (CIBIL) पेज पर ले जाया जा रहा है..."
                elif detected_lang == "gu":
                    resp_text = "ચોક્કસ, તમારા ક્રેડિટ સ્કોર (CIBIL) પેજ પર લઈ જઈ રહ્યા છીએ..."
                else:
                    resp_text = "Navigating to your Credit Score (CIBIL) dashboard now..."

                return DialogueResponse(
                    intent="NAVIGATE_CREDIT_SCORE",
                    language=detected_lang,
                    response_text=resp_text,
                    pending_clarification=None,
                    navigation=NavigationTarget(
                        type="JOURNEY",
                        target="credit_score",
                        auto_navigate=True,
                        action_label="Open Credit Score"
                    ),
                    action_chips=[
                        {"label": "View Credit Score", "action": "OPEN_JOURNEY", "payload": {"journeyId": "credit_score"}}
                    ],
                    suggested_prompts=["How to improve score?", "Check recent inquiries", "Debit Card"]
                )

            elif cls._NEGATIVE_REGEX.search(q):
                # User declined credit score
                if detected_lang == "hi":
                    resp_text = "समझा। आप डेबिट कार्ड, पासबुक, भुगतान या बचत के बारे में पूछ सकते हैं।"
                elif detected_lang == "gu":
                    resp_text = "સમજાયું. તમે ડેબિટ કાર્ડ, પાસબુક, ચુકવણી અથવા બચત વિશે પૂછી શકો છો."
                else:
                    resp_text = "Understood. What else can I help you find? You can ask about debit card, passbook, payments, or savings."

                return DialogueResponse(
                    intent="DECLINED_CLARIFICATION",
                    language=detected_lang,
                    response_text=resp_text,
                    pending_clarification=None,
                    navigation=None,
                    action_chips=[],
                    suggested_prompts=["Debit Card", "View Passbook", "Pay Bills", "Send Money"]
                )

        # ---------------------------------------------------------------------
        # PHASE 2: Check Direct Explicit Credit Score First (Zero follow-up)
        # ---------------------------------------------------------------------
        if cls._DIRECT_CREDIT_SCORE_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "आपके क्रेडिट स्कोर (CIBIL) पेज पर ले जाया जा रहा है..."
                chip_label = "क्रेडिट स्कोर देखें"
            elif detected_lang == "gu":
                resp_text = "તમારા ક્રેડિટ સ્કોર પેજ પર લઈ જઈ રહ્યા છીએ..."
                chip_label = "ક્રેડિટ સ્કોર જુઓ"
            else:
                resp_text = "Opening your Credit Score report..."
                chip_label = "View Credit Score"

            return DialogueResponse(
                intent="NAVIGATE_CREDIT_SCORE",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="JOURNEY",
                    target="credit_score",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_JOURNEY", "payload": {"journeyId": "credit_score"}}
                ],
                suggested_prompts=["Score Factors", "Refresh CIBIL", "Debit Card"]
            )

        # ---------------------------------------------------------------------
        # PHASE 3: Ambiguity Detection Requiring Minimal Clarification
        # ---------------------------------------------------------------------
        # Ambiguous "score" -> Ask: Credit score?
        if cls._AMBIGUOUS_SCORE_REGEX.search(q):
            if detected_lang == "hi":
                clarification_text = "क्या आप अपना क्रेडिट स्कोर (CIBIL) देखना चाहते हैं?"
                yes_chip = "हाँ, क्रेडिट स्कोर"
                no_chip = "नहीं"
            elif detected_lang == "gu":
                clarification_text = "શું તમે તમારો ક્રેડિટ સ્કોર (CIBIL) જોવા માંગો છો?"
                yes_chip = "હા, ક્રેડિટ સ્કોર"
                no_chip = "ના"
            else:
                clarification_text = "Do you mean your Credit Score (CIBIL)?"
                yes_chip = "Yes, Credit Score"
                no_chip = "No"

            return DialogueResponse(
                intent="CLARIFY_CREDIT_SCORE",
                language=detected_lang,
                response_text=clarification_text,
                pending_clarification="CONFIRM_CREDIT_SCORE",
                navigation=None,
                action_chips=[
                    {"label": yes_chip, "action": "CONFIRM_YES", "payload": {"journeyId": "credit_score"}},
                    {"label": no_chip, "action": "CONFIRM_NO", "payload": {}}
                ],
                suggested_prompts=[yes_chip, no_chip]
            )

        # ---------------------------------------------------------------------
        # PHASE 4: Direct Unambiguous Intents (Zero Follow-up Needed)
        # ---------------------------------------------------------------------

        # 1. Debit Card
        if cls._DIRECT_DEBIT_CARD_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "आपका डेबिट कार्ड प्रबंधन खोला जा रहा है..."
                chip_label = "डेबिट कार्ड खोलें"
            elif detected_lang == "gu":
                resp_text = "તમારું ડેબિટ કાર્ડ પેજ ખોલી રહ્યા છીએ..."
                chip_label = "ડેબિટ કાર્ડ ખોલો"
            else:
                resp_text = "Opening your Debit Card controls..."
                chip_label = "Open Debit Card"

            return DialogueResponse(
                intent="NAVIGATE_DEBIT_CARD",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="JOURNEY",
                    target="debit_card",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_JOURNEY", "payload": {"journeyId": "debit_card"}}
                ],
                suggested_prompts=["Lock Card", "Change ATM Limit", "Credit Score"]
            )

        # 2. Explicit Credit Score (e.g. "credit score", "cibil score")
        if cls._DIRECT_CREDIT_SCORE_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "आपके क्रेडिट स्कोर (CIBIL) पेज पर ले जाया जा रहा है..."
                chip_label = "क्रेडिट स्कोर देखें"
            elif detected_lang == "gu":
                resp_text = "તમારા ક્રેડિટ સ્કોર પેજ પર લઈ જઈ રહ્યા છીએ..."
                chip_label = "ક્રેડિટ સ્કોર જુઓ"
            else:
                resp_text = "Opening your Credit Score report..."
                chip_label = "View Credit Score"

            return DialogueResponse(
                intent="NAVIGATE_CREDIT_SCORE",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="JOURNEY",
                    target="credit_score",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_JOURNEY", "payload": {"journeyId": "credit_score"}}
                ],
                suggested_prompts=["Score Factors", "Refresh CIBIL", "Debit Card"]
            )

        # 3. Metro Quick Pay
        if cls._DIRECT_METRO_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "आपकी सुबह की ₹40 मेट्रो यात्रा तैयार है। 1-टैप से भुगतान करें।"
                chip_label = "₹40 मेट्रो भुगतान"
            elif detected_lang == "gu":
                resp_text = "તમારી સવારની ₹40 મેટ્રો યાત્રા તૈયાર છે. 1-ટેપથી ચુકવો."
                chip_label = "₹40 મેટ્રો ચુકવણી"
            else:
                resp_text = "Your morning Metro commute is ready for 1-tap UPI payment."
                chip_label = "Pay ₹40 Metro"

            return DialogueResponse(
                intent="PAY_METRO",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="TAB",
                    target="payments",
                    auto_navigate=False,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "INSTANT_PAY", "payload": {"amount": 40, "merchant": "Delhi Metro Smart Card"}}
                ],
                suggested_prompts=["Pay Metro ₹40", "View Commute Card", "Passbook"]
            )

        # 4. Payments & Money Transfer
        if cls._DIRECT_PAYMENTS_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "भुगतान और मनी ट्रांसफर स्क्रीन पर ले जाया जा रहा है..."
                chip_label = "भुगतान स्क्रीन"
            elif detected_lang == "gu":
                resp_text = "ચુકવણી અને મની ટ્રાન્સફર પેજ પર લઈ જઈ રહ્યા છીએ..."
                chip_label = "ચુકવણી પેજ"
            else:
                resp_text = "Opening Pay & Transfer screen..."
                chip_label = "Pay & Transfer"

            return DialogueResponse(
                intent="NAVIGATE_PAYMENTS",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="TAB",
                    target="payments",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_SCREEN", "payload": {"targetScreen": "Payments"}}
                ],
                suggested_prompts=["Send Money", "Pay Bills", "Metro Recharge"]
            )

        # 5. Activity & Passbook
        if cls._DIRECT_ACTIVITY_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "आपकी पासबुक और हालिया लेन-देन खोले जा रहे हैं..."
                chip_label = "पासबुक देखें"
            elif detected_lang == "gu":
                resp_text = "તમારી પાસબુક અને તાજેતરના વ્યવહારો ખોલી રહ્યા છીએ..."
                chip_label = "પાસબુક જુઓ"
            else:
                resp_text = "Opening your Passbook and Transaction statement..."
                chip_label = "View Passbook"

            return DialogueResponse(
                intent="NAVIGATE_ACTIVITY",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="TAB",
                    target="activity",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_SCREEN", "payload": {"targetScreen": "Activity"}}
                ],
                suggested_prompts=["This Month Outflow", "Download Statement", "Check Balance"]
            )

        # 6. Savings, FD & Wealth
        if cls._DIRECT_SAVINGS_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "आपकी अधिशेष बचत और 7.85% स्मार्ट एफडी योजना खोली जा रही है..."
                chip_label = "स्मार्ट एफडी योजना"
            elif detected_lang == "gu":
                resp_text = "તમારી બચત અને 7.85% સ્માર્ટ એફડી યોજના ખોલી રહ્યા છીએ..."
                chip_label = "સ્માર્ટ એફડી યોજના"
            else:
                resp_text = "Opening Surplus Savings and 7.85% Smart FD plans..."
                chip_label = "Explore Smart FD"

            return DialogueResponse(
                intent="NAVIGATE_SAVINGS",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="JOURNEY",
                    target="savings_invest",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_JOURNEY", "payload": {"journeyId": "savings_invest"}}
                ],
                suggested_prompts=["Auto-Sweep FD", "Digital Gold", "Wealth Screen"]
            )

        # 7. Digital KYC
        if cls._DIRECT_KYC_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "डिजिटल वीडियो केवाईसी सत्यापन डेस्क खोला जा रहा है..."
                chip_label = "केवाईसी सत्यापन"
            elif detected_lang == "gu":
                resp_text = "ડિજિટલ વિડિયો કેવાયસી ડેસ્ક ખોલી રહ્યા છીએ..."
                chip_label = "કેવાયસી ચકાસણી"
            else:
                resp_text = "Opening Digital Video KYC verification desk..."
                chip_label = "Start KYC"

            return DialogueResponse(
                intent="NAVIGATE_KYC",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="JOURNEY",
                    target="kyc",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_JOURNEY", "payload": {"journeyId": "kyc"}}
                ],
                suggested_prompts=["Aadhaar Verification", "Account Limits", "Profile"]
            )

        # 8. Medical Assistance
        if cls._DIRECT_MEDICAL_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "चिकित्सा आपातकालीन सहायता और क्लेम डेस्क खोला जा रहा है..."
                chip_label = "क्लेम सहायता"
            elif detected_lang == "gu":
                resp_text = "તબીબી સહાય અને ક્લેમ ડેસ્ક ખોલી રહ્યા છીએ..."
                chip_label = "ક્લેમ સહાય"
            else:
                resp_text = "Opening Medical Assistance and cashless reimbursement desk..."
                chip_label = "Claim Help"

            return DialogueResponse(
                intent="NAVIGATE_MEDICAL",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="JOURNEY",
                    target="medical_assistance",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_JOURNEY", "payload": {"journeyId": "medical_assistance"}}
                ],
                suggested_prompts=["Hospital Claim", "Tax Receipt 80D", "Emergency Fund"]
            )

        # 9. Fraud & Freeze
        if cls._DIRECT_FRAUD_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "सुरक्षा अलर्ट: बायोमेट्रिक सुरक्षा और कार्ड फ्रीज कंसोल खोला जा रहा है..."
                chip_label = "सुरक्षा फ्रीज"
            elif detected_lang == "gu":
                resp_text = "સુરક્ષા ચેતવણી: બાયોમેટ્રિક સુરક્ષા અને કાર્ડ ફ્રીઝ કન્સોલ ખોલી રહ્યા છીએ..."
                chip_label = "સુરક્ષા ફ્રીઝ"
            else:
                resp_text = "Security Alert: Opening Biometric Security and Card Freeze console..."
                chip_label = "Lock Card Now"

            return DialogueResponse(
                intent="NAVIGATE_FRAUD",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="JOURNEY",
                    target="fraud_alert",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_JOURNEY", "payload": {"journeyId": "fraud_alert"}}
                ],
                suggested_prompts=["Lock Card", "Dispute Charge", "Call Helpline"]
            )

        # 10. Budget & Stress
        if cls._DIRECT_BUDGET_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "बजट स्थिरीकरण और ईएमआई पुनर्गठन योजना खोली जा रही है..."
                chip_label = "बजट योजना"
            elif detected_lang == "gu":
                resp_text = "બજેટ સ્થિરીકરણ અને ઇએમઆઇ પુનર્ગઠન યોજના ખોલી રહ્યા છીએ..."
                chip_label = "બજેટ પ્લાન"
            else:
                resp_text = "Opening Budget Stabilization and EMI restructuring options..."
                chip_label = "Review Plan"

            return DialogueResponse(
                intent="NAVIGATE_BUDGET",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="JOURNEY",
                    target="financial_stress",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_JOURNEY", "payload": {"journeyId": "financial_stress"}}
                ],
                suggested_prompts=["Pause Subscriptions", "Upcoming EMIs", "Safe to Spend"]
            )

        # 11. Profile & Settings
        if cls._DIRECT_PROFILE_REGEX.search(q):
            if detected_lang == "hi":
                resp_text = "प्रोफाइल, भाषा और गोपनीयता सेटिंग्स खोली जा रही हैं..."
                chip_label = "प्रोफाइल सेटिंग्स"
            elif detected_lang == "gu":
                resp_text = "પ્રોફાઇલ, ભાષા અને ગોપનીયતા સેટિંગ્સ ખોલી રહ્યા છીએ..."
                chip_label = "પ્રોફાઇલ સેટિંગ્સ"
            else:
                resp_text = "Opening Profile, Language, and Privacy settings..."
                chip_label = "Profile & Settings"

            return DialogueResponse(
                intent="NAVIGATE_PROFILE",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=NavigationTarget(
                    type="TAB",
                    target="profile",
                    auto_navigate=True,
                    action_label=chip_label
                ),
                action_chips=[
                    {"label": chip_label, "action": "OPEN_SCREEN", "payload": {"targetScreen": "Profile"}}
                ],
                suggested_prompts=["Change Language", "Privacy Settings", "KYC Status"]
            )

        # ---------------------------------------------------------------------
        # PHASE 4: General Balance Check / Conversational Fallback
        # ---------------------------------------------------------------------
        if any(w in q.lower() for w in ["balance", "paisa", "kitna", "बैलेंस", "रुपया", "બેલેન્સ"]):
            if detected_lang == "hi":
                resp_text = "आपके बचत खाते में उपलब्ध बैलेंस ₹42,680 है। क्या आप पासबुक देखना चाहते हैं?"
            elif detected_lang == "gu":
                resp_text = "તમારા બચત ખાતામાં ઉપલબ્ધ બેલેન્સ ₹42,680 છે. શું તમે પાસબુક જોવા માંગો છો?"
            else:
                resp_text = "Your available savings balance is ₹42,680. Would you like to review recent transactions?"

            return DialogueResponse(
                intent="CHECK_BALANCE",
                language=detected_lang,
                response_text=resp_text,
                pending_clarification=None,
                navigation=None,
                action_chips=[
                    {"label": "View Passbook", "action": "OPEN_SCREEN", "payload": {"targetScreen": "Activity"}}
                ],
                suggested_prompts=["Debit Card", "Score", "Send Money", "Pay Metro"]
            )

        # Default conversational guidance
        if detected_lang == "hi":
            resp_text = f"मैंने समझा: '{q}'। आप 'क्रेडिट स्कोर', 'डेबिट कार्ड', 'मेट्रो रिचार्ज', या 'पासबुक' पूछ सकते हैं।"
        elif detected_lang == "gu":
            resp_text = f"મેં સમજ્યું: '{q}'। તમે 'ક્રેડિટ સ્કોર', 'ડેબિટ કાર્ડ', 'મેટ્રો રિચાર્જ', અથવા 'પાસબુક' પૂછી શકો છો."
        else:
            resp_text = f"I noted: '{q}'. Try asking for 'Score', 'Debit Card', 'Metro Recharge', or 'Passbook'."

        return DialogueResponse(
            intent="GENERAL_GUIDANCE",
            language=detected_lang,
            response_text=resp_text,
            pending_clarification=None,
            navigation=None,
            action_chips=[],
            suggested_prompts=["Debit Card", "Score", "Pay Metro", "Send Money"]
        )
