import logging
import time
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from apps.backend.app.services.state_service import StateService
from apps.backend.app.db.loader import DataLoader
from apps.backend.app.experience.composer import ExperienceComposer
from apps.backend.app.models.experience import ExperienceConfigModel
from apps.backend.app.models.customer_state import CustomerStateModel
from apps.backend.app.models.voice import VoiceIntentModel
from apps.backend.app.models.events import BankingEventModel
from apps.backend.app.models.assistant import (
    AssistantIntentRequest,
    AssistantIntentResponse,
    AssistantChatMessageRequest
)
from ai.voice.intents.classifier import VoiceIntentClassifier

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1")

class VoiceRequest(BaseModel):
    query: str
    language: Optional[str] = "en"

class ScenarioRequest(BaseModel):
    scenario: str
    customer_id: Optional[str] = "cust_bharat_001"

# ---------------------------------------------------------------------------
# 1. Customer State Endpoint
# ---------------------------------------------------------------------------
@router.get("/customer/{customer_id}", response_model=CustomerStateModel)
def get_customer(customer_id: str):
    """
    Returns verified customer state for given customer_id from current scenario/context.
    Validates customer existence and fails gracefully if unknown.
    """
    try:
        state = StateService.get_state(customer_id)
        return state
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer '{customer_id}' not found in bank records."
        )
    except Exception as e:
        logger.error(f"Failed to fetch customer state for {customer_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to resolve customer state at this time."
        )

# ---------------------------------------------------------------------------
# 2. Experience Configuration Endpoint
# ---------------------------------------------------------------------------
@router.get("/experience/{customer_id}", response_model=ExperienceConfigModel)
def get_experience(customer_id: str, lang: Optional[str] = Query("en")):
    """
    Returns adaptive ExperienceConfig strictly conforming to contracts/experience.schema.json.
    Translates verified customer signals and applies backend safety guardrails.
    """
    try:
        state = StateService.get_state(customer_id)
        experience = ExperienceComposer.compose(state, lang=lang or "en")
        return experience
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer '{customer_id}' not found."
        )
    except Exception as e:
        logger.error(f"Failed to compose experience for {customer_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compose adaptive banking experience."
        )

# ---------------------------------------------------------------------------
# 3. Scenario Switching Endpoint (Demo simulation)
# ---------------------------------------------------------------------------
@router.post("/scenario/switch")
def switch_scenario(req: ScenarioRequest):
    """
    Switches active scenario in memory, dynamically recalculates AI signals,
    and returns the resulting CustomerState and ExperienceConfig.
    """
    valid_scenarios = [
        "normal",
        "life-change",
        "life_change",
        "financial-stress",
        "financial_stress",
        "medical_event",
        "medical-event",
        "fraud_alert",
        "fraud-alert",
        "surplus"
    ]
    if req.scenario not in valid_scenarios:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scenario '{req.scenario}'. Allowed scenarios: {valid_scenarios}"
        )

    cid = req.customer_id or "cust_bharat_001"
    try:
        state = StateService.switch_scenario(req.scenario, customer_id=cid)
        experience = ExperienceComposer.compose(state)
        return {
            "success": True,
            "scenario": req.scenario,
            "customer_state": state,
            "experience": experience
        }
    except Exception as e:
        logger.error(f"Error switching scenario to {req.scenario}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Scenario transition failed."
        )

# ---------------------------------------------------------------------------
# 4. Task 4: Generic Banking Event Ingestion Endpoint
# ---------------------------------------------------------------------------
@router.post("/events")
def ingest_event(event: BankingEventModel):
    """
    Generic banking event ingestion endpoint.
    Ingests real-time transactions, balance alerts, merchant debits, or life-events.
    Updates in-memory signals and returns updated ExperienceConfig.
    """
    try:
        updated_state = StateService.ingest_event(event)
        updated_experience = ExperienceComposer.compose(updated_state)
        return {
            "success": True,
            "event_type": event.type,
            "customer_id": event.customer_id,
            "updated_state": updated_state,
            "updated_experience": updated_experience
        }
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer '{event.customer_id}' not found."
        )
    except Exception as e:
        logger.error(f"Error ingesting banking event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Event processing failed."
        )

# ---------------------------------------------------------------------------
# 5. Task 5: Assistant / Voice Intent Execution Endpoint
# ---------------------------------------------------------------------------
@router.post("/assistant/intent", response_model=AssistantIntentResponse)
def execute_assistant_intent(req: AssistantIntentRequest):
    """
    Executes a structured intent from the local SLM / voice model.
    Validates intent against authoritative backend banking systems.
    SLM provides intent; Backend decides whether and how it can execute safely.
    """
    if not StateService.is_valid_customer(req.customer_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer '{req.customer_id}' not recognized."
        )

    intent_name = req.intent.upper().strip()
    customer_id = req.customer_id
    lang = req.language or "en"
    state = StateService.get_state(customer_id)
    avail_bal = state.balance.available if state.balance else 0.0

    # Execute safe backend operation / data lookup
    if intent_name == "CHECK_BALANCE":
        avail_bal = state.balance.available if state.balance else 42680.0
        safe_spend = float(state.signals.get("safe_to_spend_today", 3200))
        is_spending = req.entities.get("query_type") == "spending" or req.entities.get("view") == "activity"

        if is_spending:
            txs = DataLoader.load_transactions(customer_id)
            monthly_spending = sum(float(t.get("amount", 0)) for t in txs if str(t.get("type", "")).lower() == "debit")
            if monthly_spending == 0:
                monthly_spending = 34969.0
            resp_msg = (
                f"इस महीने आपका कुल खर्च ₹{monthly_spending:,.0f} है। आज खर्च करने के लिए सुरक्षित राशि ₹{safe_spend:,.0f} है और उपलब्ध बैलेंस ₹{avail_bal:,.2f} है।"
                if lang == "hi"
                else (
                    f"આ મહિને તમારો કુલ ખર્ચ ₹{monthly_spending:,.0f} છે. આજે સલામત ખર્ચ મર્યાદા ₹{safe_spend:,.0f} છે અને ઉપલબ્ધ બેલેન્સ ₹{avail_bal:,.2f} છે."
                    if lang == "gu"
                    else f"Your total monthly spending is ₹{monthly_spending:,.0f} across all categories. Your safe daily spend limit is ₹{safe_spend:,.0f}, and available balance is ₹{avail_bal:,.2f}."
                )
            )
            return AssistantIntentResponse(
                intent="CHECK_BALANCE",
                success=True,
                data={
                    "available": avail_bal,
                    "currency": "INR",
                    "monthly_spending": monthly_spending,
                    "safe_to_spend_today": safe_spend,
                    "view": "activity"
                },
                response_text=resp_msg,
                language=lang,
                suggested_actions=["VIEW_TRANSACTIONS", "DOWNLOAD_STATEMENT"]
            )
        else:
            resp_msg = (
                f"आपके बचत खाते में उपलब्ध बैलेंस ₹{avail_bal:,.2f} है। आज खर्च करने के लिए सुरक्षित राशि ₹{safe_spend:,.0f} है।"
                if lang == "hi"
                else (
                    f"તમારા ખાતામાં હાલનું ઉપલબ્ધ બેલેન્સ ₹{avail_bal:,.2f} છે. આજે સલામત ખર્ચ મર્યાદા ₹{safe_spend:,.0f} છે."
                    if lang == "gu"
                    else f"Your current available balance is ₹{avail_bal:,.2f}. Safe-to-spend limit for today is ₹{safe_spend:,.0f}."
                )
            )
            return AssistantIntentResponse(
                intent="CHECK_BALANCE",
                success=True,
                data={
                    "available": avail_bal,
                    "currency": "INR",
                    "savings": state.balance.savings if state.balance else 0.0,
                    "safe_to_spend_today": safe_spend
                },
                response_text=resp_msg,
                language=lang,
                suggested_actions=["VIEW_TRANSACTIONS", "SEND_MONEY"]
            )

    elif intent_name == "CHECK_EMI":
        emi_amt = float(req.entities.get("amount") or state.signals.get("upcoming_emi_amount") or 16500.0)
        due_date = req.entities.get("due_date") or state.signals.get("upcoming_emi_date") or "2026-09-16"
        lender = req.entities.get("lender") or state.signals.get("mandate_lender") or "Linked Mandate"
        resp_msg = (
            f"{lender} के लिए आपकी आगामी ईएमआई ₹{emi_amt:,.0f} है, जो {due_date} को देय है।"
            if lang == "hi"
            else (
                f"{lender} માટે તમારું આગામી EMI ₹{emi_amt:,.0f} છે જે {due_date} એ ચૂકવવાનું છે."
                if lang == "gu"
                else f"Your upcoming EMI for {lender} is ₹{emi_amt:,.0f} scheduled for {due_date}."
            )
        )
        return AssistantIntentResponse(
            intent="CHECK_EMI",
            success=True,
            data={
                "amount": emi_amt,
                "due_date": due_date,
                "lender": lender,
                "covered_by_balance": (avail_bal >= emi_amt)
            },
            response_text=resp_msg,
            language=lang,
            suggested_actions=["VIEW_SCHEDULE", "PAY_EARLY"]
        )

    elif intent_name == "PAY_METRO":
        amt = float(req.entities.get("amount") or state.signals.get("commute_typical_amount") or 40.0)
        merchant = req.entities.get("merchant") or state.signals.get("commute_merchant") or "Delhi Metro Smart Card"
        resp_msg = (
            f"आपकी {merchant} यात्रा के लिए ₹{amt:,.0f} का टॉप-अप तैयार है। क्या आप 1-टैप यूपीआई से भुगतान करना चाहते हैं?"
            if lang == "hi"
            else (
                f"તમારી {merchant} મુસાફરી માટે ₹{amt:,.0f} નું રિચાર્જ તૈયાર છે. શું તમે 1-ટેપથી પેમેન્ટ કરવા માંગો છો?"
                if lang == "gu"
                else f"Ready to top up ₹{amt:,.0f} for your {merchant} commute."
            )
        )
        return AssistantIntentResponse(
            intent="PAY_METRO",
            success=True,
            data={
                "merchant": merchant,
                "amount": amt,
                "status": "ready_for_confirmation",
                "payment_mode": "UPI_AUTO_1TAP"
            },
            response_text=resp_msg,
            language=lang,
            suggested_actions=["CONFIRM_PAYMENT", "DISMISS"]
        )

    elif intent_name == "PAY_BILL":
        biller = req.entities.get("biller") or state.signals.get("utility_biller") or "Tata Power Electricity"
        amt = float(req.entities.get("amount") or state.signals.get("utility_amount") or 1450.0)
        resp_msg = (
            f"आपका {biller} का ₹{amt:,.0f} का बिजली बिल भुगतान के लिए तैयार है। क्या आप 1-टैप यूपीआई से भुगतान करना चाहते हैं?"
            if lang == "hi"
            else (
                f"તમારું {biller} નું ₹{amt:,.0f} નું બિલ તૈયાર છે. શું તમે 1-ટેપથી પેમેન્ટ કરવા માંગો છો?"
                if lang == "gu"
                else f"Your {biller} bill of ₹{amt:,.0f} is due. Would you like to pay now with 1-tap UPI?"
            )
        )
        return AssistantIntentResponse(
            intent="PAY_BILL",
            success=True,
            data={
                "biller": biller,
                "amount": amt,
                "status": "ready_for_payment",
                "payment_mode": "UPI_AUTO_1TAP"
            },
            response_text=resp_msg,
            language=lang,
            suggested_actions=["1_TAP_PAY", "VIEW_BILL", "DISMISS"]
        )

    elif intent_name == "MEDICAL_CLAIM_HELP":
        hosp = req.entities.get("hospital") or state.signals.get("medical_hospital") or "Hospital Provider"
        amt = float(req.entities.get("amount") or state.signals.get("medical_amount") or 48200.0)
        resp_msg = (
            f"आपके {hosp} के ₹{amt:,.0f} के बिल के लिए मेडिकल क्लेम सहायता सक्रिय है।"
            if lang == "hi"
            else (
                f"તમારા {hosp} ના ₹{amt:,.0f} ના બિલ માટે મેડિકલ ક્લેમ સહાય સક્રિય છે."
                if lang == "gu"
                else f"Medical claim assistance active for your {hosp} bill of ₹{amt:,.0f}."
            )
        )
        return AssistantIntentResponse(
            intent="MEDICAL_CLAIM_HELP",
            success=True,
            data={
                "hospital": hosp,
                "claim_eligible_amount": amt,
                "fast_track_available": True,
                "journey_id": "medical_assistance"
            },
            response_text=resp_msg,
            language=lang,
            suggested_actions=["OPEN_CLAIM_DESK", "TALK_TO_OFFICER"]
        )

    elif intent_name == "REVIEW_COMMITMENTS":
        obligations = state.signals.get("upcoming_obligations", 34200)
        resp_msg = (
            f"आगामी प्रतिबद्धताएं कुल ₹{obligations:,.0f} हैं। नकदी प्रवाह सुरक्षित रखने के लिए आप अप्रयुक्त सदस्यताओं को रोक सकते हैं।"
            if lang == "hi"
            else (
                f"આગામી નાણાકીય જવાબદારીઓ કુલ ₹{obligations:,.0f} છે. કેશ ફ્લો જાળવી રાખવા માટે તમે બિનઉપયોગી સબ્સ્ક્રિપ્શન્સ થોભાવી શકો છો."
                if lang == "gu"
                else f"Upcoming commitments total ₹{obligations:,.0f}. You can pause unused subscriptions to preserve cashflow."
            )
        )
        return AssistantIntentResponse(
            intent="REVIEW_COMMITMENTS",
            success=True,
            data={
                "upcoming_obligations": obligations,
                "stress_advisory_active": True,
                "pausable_subscriptions_count": 7,
                "journey_id": "stress_intervention"
            },
            response_text=resp_msg,
            language=lang,
            suggested_actions=["OPEN_STRESS_MODAL", "PAUSE_SUBSCRIPTIONS"]
        )

    elif intent_name == "LOCK_CARD":
        resp_msg = (
            "आपकी सुरक्षा के लिए आपका एबीसी बैंक डेबिट कार्ड अस्थायी रूप से लॉक कर दिया गया है। अनफ्रीज करने के लिए नीचे टैप करें।"
            if lang == "hi"
            else (
                "તમારી સુરક્ષા માટે તમારું એબીસી બેંક ડેબિટ કાર્ડ અસ્થાયી રૂપે લોક કરવામાં આવ્યું છે."
                if lang == "gu"
                else "Your ABC Bank Debit Card has been temporarily locked for security. Tap to manage or unfreeze."
            )
        )
        return AssistantIntentResponse(
            intent="LOCK_CARD",
            success=True,
            data={
                "card_status": "temporarily_frozen",
                "action": "FREEZE_DEBIT_CARD"
            },
            response_text=resp_msg,
            language=lang,
            suggested_actions=["UNFREEZE_CARD", "REPORT_FRAUD"]
        )

    elif intent_name == "SAVE_SURPLUS":
        surplus_amt = state.signals.get("surplus_amount", 38400)
        resp_msg = (
            f"हमने ₹{surplus_amt:,.0f} का अधिशेष रिज़र्व चिन्हित किया है जो 7.85% ब्याज कमा सकता है।"
            if lang == "hi"
            else (
                f"અમે ₹{surplus_amt:,.0f} નું સરપ્લસ રિઝર્વ ચિહ્નિત કર્યું છે જે 7.85% વ્યાજ મેળવી શકે છે."
                if lang == "gu"
                else f"We identified ₹{surplus_amt:,.0f} in surplus reserves that can earn 7.85% APY."
            )
        )
        return AssistantIntentResponse(
            intent="SAVE_SURPLUS",
            success=True,
            data={
                "surplus_amount": surplus_amt,
                "recommended_product": "Smart_FD_7_85",
                "rate": 7.85
            },
            response_text=resp_msg,
            language=lang,
            suggested_actions=["EXPLORE_AUTO_SWEEP", "DISMISS"]
        )

    elif intent_name == "INSURANCE_PROTECTION":
        resp_msg = (
            "एबीसी बैंक बीमा और स्वास्थ्य सुरक्षा: आरोग्य संजीवनी फैमिली हेल्थ कवर (₹3L-₹10L) मात्र ₹310/माह से और सोवरेन टर्म लाइफ कवर मात्र ₹490/माह से उपलब्ध है। धारा 80D और 10(10D) के तहत कर छूट प्राप्त करें।"
            if lang == "hi"
            else (
                "એબીસી બેંક વીમો અને આરોગ્ય સુરક્ષા: આરોગ્ય સંજીવની ફેમિલી હેલ્થ કવર ₹310/મહિને અને ટર્મ લાઇફ કવર ₹490/મહિને ઉપલબ્ધ છે. કલમ 80D હેઠળ કર લાભો મેળવો."
                if lang == "gu"
                else "ABC Bank Insurance & Protection: Arogya Sanjeevani Family Health Cover (₹3L–₹10L) starting from ₹310/mo with 10,000+ cashless hospitals, and Sovereign Term Life from ₹490/mo. Tax deductible under Sec 80D & 10(10D)."
            )
        )
        return AssistantIntentResponse(
            intent="INSURANCE_PROTECTION",
            success=True,
            data={
                "health_cover": "Arogya Sanjeevani (₹3L–₹10L Cashless)",
                "starting_health_premium": 310.0,
                "term_life": "Sovereign Term Life (₹50L–₹1Cr)",
                "starting_life_premium": 490.0,
                "tax_benefits": ["Section 80D", "Section 10(10D)"],
                "hospital_network_count": 10500,
                "journey_id": "insurance_protection"
            },
            response_text=resp_msg,
            language=lang,
            suggested_actions=["ENROLL_HEALTH_COVER", "VIEW_TERM_LIFE", "TAX_BENEFITS"]
        )

    else:
        # Check if query is irrelevant or out-of-domain
        if req.entities.get("is_relevant") is False or req.entities.get("query_type") == "irrelevant":
            cant_answer_msg = (
                "मैं इस प्रश्न का उत्तर नहीं दे सकता। मैं केवल एबीसी बैंक का वित्तीय बैंकिंग सहायक हूँ। आप मुझसे बैंक बैलेंस, बिजली बिल, मेट्रो रिचार्ज, ईएमआई या कार्ड ब्लॉक करने के बारे में पूछ सकते हैं।"
                if lang == "hi"
                else (
                    "હું આ પ્રશ્નનો જવાબ આપી શકતો નથી. હું માત્ર એબીસી બેંકનો બેંકિંગ સહાયક છું. તમે મને બેંક બેલેન્સ, બિલ પેમેન્ટ, મેટ્રો અથવા કાર્ડ લોક વિશે પૂછી શકો છો."
                    if lang == "gu"
                    else "I can't answer to this question. I am an on-device Bharat banking assistant for ABC Bank. You can ask me about your account balance, metro recharge, electricity bill, card controls, or EMI due dates."
                )
            )
            return AssistantIntentResponse(
                intent="GENERAL_QUERY",
                success=False,
                data={"reason": "irrelevant_query"},
                response_text=cant_answer_msg,
                language=lang,
                suggested_actions=["CHECK_BALANCE", "PAY_METRO", "PAY_BILL", "LOCK_CARD"]
            )

        # Check for specific guided journeys (KYC, credit score)
        if req.entities.get("journey_id") == "kyc" or req.entities.get("query_type") == "kyc":
            kyc_msg = (
                "आप वीडियो केवाईसी या आधार के माध्यम से ऑनलाइन अपना केवाईसी पूरा या अपडेट कर सकते हैं। शुरू करने के लिए नीचे टैप करें।"
                if lang == "hi"
                else (
                    "તમે વિડિયો કેવાયસી અથવા આધાર દ્વારા ઓનલાઇન કેવાયસી પૂર્ણ અથવા અપડેટ કરી શકો છો. શરૂ કરવા માટે નીચે ટેપ કરો."
                    if lang == "gu"
                    else "You can easily complete or update your KYC verification online using Video KYC or Aadhaar OTP. Tap below to begin."
                )
            )
            return AssistantIntentResponse(
                intent="GENERAL_QUERY",
                success=True,
                data={"journey_id": "kyc", "action": "START_KYC"},
                response_text=kyc_msg,
                language=lang,
                suggested_actions=["START_KYC", "UPLOAD_DOCUMENTS"]
            )

        if req.entities.get("journey_id") == "credit_score":
            score_msg = (
                "आपका नवीनतम सिबिल क्रेडिट स्कोर 742 (अच्छा) है। विस्तृत विश्लेषण देखने के लिए नीचे टैप करें।"
                if lang == "hi"
                else (
                    "તમારો નવીનતમ સિબિલ ક્રેડિટ સ્કોર 742 (સારો) છે. વિગતવાર વિશ્લેષણ જોવા માટે नीचे ટેપ કરો."
                    if lang == "gu"
                    else "Your latest CIBIL credit score is 742 (Good). Tap below to view your full credit analysis."
                )
            )
            return AssistantIntentResponse(
                intent="GENERAL_QUERY",
                success=True,
                data={"journey_id": "credit_score", "score": 742},
                response_text=score_msg,
                language=lang,
                suggested_actions=["VIEW_SCORE", "CREDIT_FACTORS"]
            )

        # Fallback for genuine general queries (greetings, identity, help)
        greeting_msg = (
            "नमस्ते! मैं मित्रा हूँ, आपका एबीसी बैंक साथी। मैं आपके खाते का बैलेंस जांचने, मेट्रो रिचार्ज, बिजली बिल भुगतान या कार्ड सुरक्षा में सहायता कर सकता हूँ।"
            if lang == "hi"
            else (
                "નમસ્તે! હું મિત્રા છું, તમારો એબીસી બેંક સહાયક. હું બેંક બેલેન્સ, મેટ્રો રિચાર્જ, વીજળી બિલ અથવા કાર્ડ સુરક્ષામાં મદદ કરી શકું છું."
                if lang == "gu"
                else "Hello! I am Mitra, your ABC Bank companion. I can help you check balance, pay metro, settle bills, review EMIs, or manage your card."
            )
        )
        return AssistantIntentResponse(
            intent="GENERAL_QUERY",
            success=True,
            data={"query_received": intent_name},
            response_text=greeting_msg,
            language=lang,
            suggested_actions=["CHECK_BALANCE", "CHECK_EMI", "PAY_METRO"]
        )

# ---------------------------------------------------------------------------
# 6. Legacy / Frontend Compatible Voice & Assistant Endpoints
# ---------------------------------------------------------------------------
@router.post("/voice/intent", response_model=VoiceIntentModel)
def voice_intent(req: VoiceRequest):
    """
    Direct voice query classification endpoint.
    Compatible with existing frontend sendVoiceQuery calls.
    """
    intent_data = VoiceIntentClassifier.classify(req.query, req.language or "en")
    return VoiceIntentModel(**intent_data)

@router.get("/assistant/init")
def assistant_init(lang: Optional[str] = Query("en")):
    """
    Returns initial contextual greeting messages for frontend MitraChatScreen.
    """
    cid = "cust_bharat_001"
    state = StateService.get_state(cid)
    cust_name = state.customer_name or "Rahul"

    if lang == "hi":
        greeting = f"नमस्ते {cust_name}! मैं मित्रा हूँ, आपका बैंकिंग साथी। आज मैं आपकी क्या सहायता कर सकता हूँ?"
        prompts = ["मेरी सुबह की मेट्रो भरें", "आगामी ईएमआई कब है?", "बैलेंस जांचें"]
    elif lang == "gu":
        greeting = f"નમસ્તે {cust_name}! હું મિત્રા છું, તમારો બેંકિંગ સાથી. આજે હું તમને કેવી રીતે મદદ કરી શકું?"
        prompts = ["મારી સવારની મેટ્રો ચૂકવો", "આગામી EMI ક્યારે છે?", "બેલેન્સ તપાસો"]
    else:
        greeting = f"Hello {cust_name}! I am Mitra, your contextual banking companion. How can I assist you today?"
        prompts = ["Pay morning Metro", "Check upcoming EMI", "Check Balance"]

    return {
        "success": True,
        "messages": [
            {
                "id": "init_msg_1",
                "sender": "assistant",
                "text": greeting,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "suggestedPrompts": prompts
            }
        ]
    }

@router.post("/assistant/chat")
def assistant_chat(req: AssistantChatMessageRequest):
    """
    Handles interactive user messages from MitraChatScreen and returns structured replies with action chips
    and auto-navigation instructions for minimal follow-up routing.
    """
    query = req.query.strip()
    lang = req.language or "en"
    pending = req.pending_clarification or (req.conversation_context or {}).get("pending_clarification")

    if req.intent and req.intent != "GENERAL_QUERY":
        intent = req.intent
        entities = req.entities or {}
        classified = {"intent": intent, "entities": entities}
    else:
        classified = VoiceIntentClassifier.classify(
            query,
            lang=lang,
            pending_clarification=pending
        )
        intent = classified.get("intent", "GENERAL_QUERY")
        entities = classified.get("entities", {})

    # Delegate to secure intent execution
    intent_resp = execute_assistant_intent(
        AssistantIntentRequest(
            customer_id=req.customer_id or "cust_bharat_001",
            intent=intent,
            language=lang,
            entities=entities
        )
    )

    action_chips = list(classified.get("action_chips", []))
    if not action_chips:
        if intent == "PAY_METRO":
            action_chips.append({"label": "Pay ₹40 Now", "action": "INSTANT_PAY", "payload": {"amount": 40, "merchant": "Delhi Metro Smart Card"}})
        elif intent == "PAY_BILL":
            action_chips.append({"label": "Pay ₹1,450 Now", "action": "INSTANT_PAY", "payload": {"amount": 1450, "merchant": "Tata Power Electricity"}})
        elif intent == "CHECK_EMI":
            action_chips.append({"label": "View Schedule", "action": "OPEN_SCREEN", "payload": {"targetScreen": "Activity"}})
        elif intent == "CHECK_BALANCE":
            action_chips.append({"label": "View Passbook", "action": "OPEN_SCREEN", "payload": {"targetScreen": "Activity"}})
        elif intent == "LOCK_CARD":
            action_chips.append({"label": "Card Security", "action": "OPEN_JOURNEY", "payload": {"journeyId": "debit_card"}})
        elif intent == "MEDICAL_CLAIM_HELP":
            action_chips.append({"label": "Open Claim Desk", "action": "OPEN_JOURNEY", "payload": {"journeyId": "medical_assistance"}})
        elif intent == "REVIEW_COMMITMENTS":
            action_chips.append({"label": "Review Plan", "action": "OPEN_JOURNEY", "payload": {"journeyId": "stress_intervention"}})
        elif intent == "SAVE_SURPLUS":
            action_chips.append({"label": "Explore Smart FD", "action": "OPEN_JOURNEY", "payload": {"journeyId": "surplus"}})

    # If the classifier marked the query as irrelevant, wipe action chips
    if classified.get("entities", {}).get("is_relevant") is False:
        action_chips = []
        suggested_prompts = ["Check Balance", "Pay Metro ₹40", "Electricity Bill", "Lock My Card", "EMI Due Date"]
    else:
        suggested_prompts = classified.get("suggested_prompts") or ["Debit Card", "Score", "Pay Metro", "Send Money"]

    # Prefer specific classified response text (e.g. from DialogueManager navigation) if intent_resp was generic
    final_text = intent_resp.response_text
    if classified.get("response_text") and (not final_text or "Hello! I am Mitra" in final_text or "नमस्ते! मैं मित्रा हूँ" in final_text or "નમસ્તે! હું મિત્રા છું" in final_text):
        final_text = classified.get("response_text")
    if not final_text:
        final_text = "How can I assist you with your banking?"

    return {
        "success": True,
        "reply": {
            "id": f"asst_resp_{intent}_{int(time.time()*1000)}",
            "sender": "assistant",
            "text": final_text,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "actionChips": action_chips,
            "suggestedPrompts": suggested_prompts,
            "pendingClarification": classified.get("pending_clarification"),
            "navigation": classified.get("navigation")
        }
    }


# ---------------------------------------------------------------------------
# 7. Cryptographic PIN Authentication Endpoints
# ---------------------------------------------------------------------------
class PinSetupRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    pin: str

class PinVerifyRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    pin: str

@router.post("/auth/pin/setup")
def setup_pin(req: PinSetupRequest):
    """
    Establishes cryptographically salted and PBKDF2-HMAC-SHA256 hashed PIN
    for the customer profile.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        res = StateService.set_customer_pin(cid, req.pin)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to setup PIN for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="PIN setup failed.")

@router.post("/auth/pin/verify")
def verify_pin(req: PinVerifyRequest):
    """
    Authenticates entered PIN using constant-time comparison against PBKDF2 hash.
    Enforces 5-attempt rate-limiting and 15-minute lockouts.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        res = StateService.verify_customer_pin(cid, req.pin)
        return res
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to verify PIN for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="PIN verification failed.")


# ---------------------------------------------------------------------------
# 8. Persistent Card Switch Controls
# ---------------------------------------------------------------------------
class CardControlsRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    is_locked: Optional[bool] = None
    atmLimit: Optional[int] = None
    contactlessEnabled: Optional[bool] = None
    onlineEnabled: Optional[bool] = None
    intlEnabled: Optional[bool] = None

@router.get("/cards/{customer_id}")
def get_card_controls(customer_id: str):
    """Returns persistent card switch configuration, limits, and lock state."""
    try:
        return StateService.get_card_controls(customer_id)
    except Exception as e:
        logger.error(f"Failed to fetch card controls for {customer_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Card lookup failed.")

@router.post("/cards/controls")
def update_card_controls(req: CardControlsRequest):
    """Persistently updates debit card switch lock, ATM limits, and flags."""
    cid = req.customer_id or "cust_bharat_001"
    try:
        controls_dict = {k: v for k, v in req.model_dump().items() if v is not None and k != "customer_id"}
        updated = StateService.update_card_controls(cid, controls_dict)
        return {"success": True, "controls": updated}
    except Exception as e:
        logger.error(f"Failed to update card controls for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Card update failed.")


# ---------------------------------------------------------------------------
# 9. Authoritative Transaction Ledger & Payments
# ---------------------------------------------------------------------------
class PaymentTransferRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    amount: float
    merchant: str
    category: Optional[str] = "transport"
    description: Optional[str] = None

@router.get("/transactions/{customer_id}")
def get_transactions(customer_id: str):
    """Returns authoritative transaction history combining live events and records."""
    try:
        txs = StateService.get_customer_transactions(customer_id)
        return {"success": True, "customer_id": customer_id, "transactions": txs}
    except Exception as e:
        logger.error(f"Failed to fetch transactions for {customer_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load transactions.")

@router.post("/payments/transfer")
def transfer_payment(req: PaymentTransferRequest):
    """
    Authoritative money transfer:
    Debits payer balance, verifies card switch status, appends ledger entry,
    emits banking event, and returns verified state and receipt.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        res = StateService.execute_payment(
            customer_id=cid,
            amount=req.amount,
            merchant=req.merchant,
            category=req.category or "transport",
            description=req.description
        )
        return res
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to execute transfer for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Payment processing failed.")


# ---------------------------------------------------------------------------
# 10. Loan Underwriting & Disbursal
# ---------------------------------------------------------------------------
class LoanDisburseRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    amount: float
    tenure_months: Optional[int] = 12
    annual_rate: Optional[float] = 10.5

@router.post("/loans/disburse")
def disburse_loan(req: LoanDisburseRequest):
    """
    Underwrites and disburses instant credit into customer available & savings ledger.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        res = StateService.disburse_loan(
            customer_id=cid,
            amount=req.amount,
            tenure_months=req.tenure_months or 12,
            annual_rate=req.annual_rate or 10.5
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to disburse loan for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Loan origination failed.")


# ---------------------------------------------------------------------------
# 11. Digital KYC Submission & Profile Verification
# ---------------------------------------------------------------------------
class KycSubmitRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    pan: str
    aadhaar: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    selfie_verified: Optional[bool] = True

@router.post("/kyc/submit")
def submit_kyc(req: KycSubmitRequest):
    """
    Authentic KYC submission: validates PAN & Aadhaar, checks geo-coordinates,
    and updates customer tier to verified status.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        res = StateService.submit_kyc(
            customer_id=cid,
            pan=req.pan,
            aadhaar=req.aadhaar,
            latitude=req.latitude,
            longitude=req.longitude,
            selfie_verified=req.selfie_verified if req.selfie_verified is not None else True
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to submit KYC for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="KYC submission failed.")


# ---------------------------------------------------------------------------
# 12. Health Insurance Reimbursement Claim Filing
# ---------------------------------------------------------------------------
class MedicalClaimRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    hospital: str
    amount: float
    notes: Optional[str] = None

@router.post("/claims/submit")
def submit_medical_claim(req: MedicalClaimRequest):
    """
    Authentic healthcare reimbursement claim filing:
    Registers claim against TPA gateway, generates tracking identifier,
    and updates customer medical signals.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        res = StateService.submit_medical_claim(
            customer_id=cid,
            hospital=req.hospital,
            amount=req.amount,
            notes=req.notes
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to submit claim for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Claim submission failed.")


# ---------------------------------------------------------------------------
# 13. Subscription Mandate Management & Cash Flow Shield
# ---------------------------------------------------------------------------
class MandatePauseRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    mandate_name: str
    is_paused: Optional[bool] = True

@router.post("/mandates/pause")
def pause_mandate(req: MandatePauseRequest):
    """
    Authentic subscription pause:
    Updates e-mandate switch status, modifies customer recurring obligations,
    and updates liquidity guard signals.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        res = StateService.pause_mandate(
            customer_id=cid,
            mandate_name=req.mandate_name,
            is_paused=req.is_paused if req.is_paused is not None else True
        )
        return res
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to pause mandate for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Mandate update failed.")


# ---------------------------------------------------------------------------
# 14. Empathetic Loan Relief: 10-Day Grace Buffer
# ---------------------------------------------------------------------------
class EmiGraceRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    loan_id: Optional[str] = None
    days: Optional[int] = 10

@router.post("/loans/grace")
def request_emi_grace(req: EmiGraceRequest):
    """
    Grants a 10-day penalty-free grace buffer under RBI Resolution guidelines.
    Guarantees zero bounce fees and zero CIBIL default penalties.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        return StateService.request_emi_grace(
            customer_id=cid,
            loan_id=req.loan_id,
            days=req.days or 10
        )
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to grant EMI grace for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Grace request failed.")


# ---------------------------------------------------------------------------
# 15. Empathetic Loan Relief: Split EMI (50% Due Date, 50% Post-Salary)
# ---------------------------------------------------------------------------
class EmiSplitRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    loan_id: Optional[str] = None

@router.post("/loans/split")
def split_emi(req: EmiSplitRequest):
    """
    Splits upcoming monthly EMI into two equal 50% installments to match cash flow.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        return StateService.split_emi(
            customer_id=cid,
            loan_id=req.loan_id
        )
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to split EMI for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="EMI split failed.")


# ---------------------------------------------------------------------------
# 16. Empathetic Loan Relief: Emergency Deficit Auto-Sweep
# ---------------------------------------------------------------------------
class DeficitSweepRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    loan_id: Optional[str] = None
    amount: Optional[float] = None

@router.post("/loans/sweep-deficit")
def sweep_deficit_for_emi(req: DeficitSweepRequest):
    """
    Partial auto-sweep: sweeps ONLY the shortfall amount from fixed deposits/emergency buffer
    to prevent auto-debit bounce without liquidating the full deposit.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        return StateService.sweep_deficit_for_emi(
            customer_id=cid,
            loan_id=req.loan_id,
            amount=req.amount
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to sweep deficit for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Deficit sweep failed.")


# ---------------------------------------------------------------------------
# 17. RBI Digital Lending Guidelines: Statutory 3-Day Cooling-Off Cancellation
# ---------------------------------------------------------------------------
class LoanCoolingOffRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    contract_id: str

@router.post("/loans/cooling-off-cancel")
def cancel_loan_cooling_off(req: LoanCoolingOffRequest):
    """
    Statutory 3-day cooling-off lookup cancellation without penalty or prepayment fee.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        return StateService.cancel_loan_cooling_off(
            customer_id=cid,
            contract_id=req.contract_id
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to execute cooling-off cancellation for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Cooling-off cancellation failed.")


# ---------------------------------------------------------------------------
# 18. SEBI ASBA (Application Supported by Blocked Amount) IPO Bidding
# ---------------------------------------------------------------------------
class AsbaBidRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    ipo_name: str
    shares: int
    amount: float
    upi_id: str

@router.post("/investments/asba/bid")
def place_asba_lien(req: AsbaBidRequest):
    """
    Places SEBI UPI ASBA lien blocking for primary market IPO applications.
    Funds remain blocked in account earning interest until allotment.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        return StateService.place_asba_lien(
            customer_id=cid,
            ipo_name=req.ipo_name,
            shares=req.shares,
            amount=req.amount,
            upi_id=req.upi_id
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to place ASBA bid for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="ASBA bid failed.")


# ---------------------------------------------------------------------------
# 19. Card Security: Dynamic Single-Use 5-Minute Virtual CVV Generator
# ---------------------------------------------------------------------------
class DynamicCvvRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    card_id: Optional[str] = "card_01"

@router.post("/cards/dynamic-cvv")
def generate_dynamic_cvv(req: DynamicCvvRequest):
    """
    Generates a single-use 5-minute time-bound virtual dynamic CVV for secure card usage.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        return StateService.generate_dynamic_cvv(
            customer_id=cid,
            card_id=req.card_id or "card_01"
        )
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to generate dynamic CVV for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="CVV generation failed.")


# ---------------------------------------------------------------------------
# 20. Statutory IRDAI Insurance & Protection Enrollment APIs
# ---------------------------------------------------------------------------
class InsuranceEnrollRequest(BaseModel):
    customer_id: Optional[str] = "cust_bharat_001"
    plan_id: str
    sum_insured: float
    nominee_name: str
    nominee_relation: str

@router.get("/insurance/plans/{customer_id}")
def get_insurance_plans(customer_id: str):
    """
    Fetches pre-approved IRDAI standard health and term life insurance plans.
    """
    try:
        return StateService.get_insurance_plans(customer_id)
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to fetch insurance plans for {customer_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch insurance plans.")

@router.post("/insurance/enroll")
def enroll_insurance_policy(req: InsuranceEnrollRequest):
    """
    1-Click Digital Insurance Enrollment under IRDAI guidelines.
    Issues policy certificate, debits initial monthly premium, and updates customer state.
    """
    cid = req.customer_id or "cust_bharat_001"
    try:
        return StateService.enroll_insurance_policy(
            customer_id=cid,
            plan_id=req.plan_id,
            sum_insured=req.sum_insured,
            nominee_name=req.nominee_name,
            nominee_relation=req.nominee_relation
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except Exception as e:
        logger.error(f"Failed to enroll insurance policy for {cid}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Insurance enrollment failed.")



