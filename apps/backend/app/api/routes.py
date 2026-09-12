import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from apps.backend.app.services.state_service import StateService
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
        "financial-stress",
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
        return AssistantIntentResponse(
            intent="CHECK_BALANCE",
            success=True,
            data={
                "available": avail_bal,
                "currency": "INR",
                "savings": state.balance.savings if state.balance else 0.0
            },
            response_text=f"Your current available balance is ₹{avail_bal:,.2f}.",
            language=lang,
            suggested_actions=["VIEW_TRANSACTIONS", "SEND_MONEY"]
        )

    elif intent_name == "CHECK_EMI":
        emi_amt = float(req.entities.get("amount") or state.signals.get("upcoming_emi_amount") or 16500.0)
        due_date = req.entities.get("due_date") or state.signals.get("upcoming_emi_date") or "2026-09-16"
        lender = req.entities.get("lender") or state.signals.get("mandate_lender") or "Linked Mandate"
        return AssistantIntentResponse(
            intent="CHECK_EMI",
            success=True,
            data={
                "amount": emi_amt,
                "due_date": due_date,
                "lender": lender,
                "covered_by_balance": (avail_bal >= emi_amt)
            },
            response_text=f"Your upcoming EMI for {lender} is ₹{emi_amt:,.0f} scheduled for {due_date}.",
            language=lang,
            suggested_actions=["VIEW_SCHEDULE", "PAY_EARLY"]
        )

    elif intent_name == "PAY_METRO":
        amt = float(req.entities.get("amount") or state.signals.get("commute_typical_amount") or 40.0)
        merchant = req.entities.get("merchant") or state.signals.get("commute_merchant") or "Metro Transit"
        return AssistantIntentResponse(
            intent="PAY_METRO",
            success=True,
            data={
                "merchant": merchant,
                "amount": amt,
                "status": "ready_for_confirmation",
                "payment_mode": "UPI_AUTO_1TAP"
            },
            response_text=f"Ready to top up ₹{amt:,.0f} for your {merchant} commute.",
            language=lang,
            suggested_actions=["CONFIRM_PAYMENT", "DISMISS"]
        )

    elif intent_name == "MEDICAL_CLAIM_HELP":
        hosp = req.entities.get("hospital") or state.signals.get("medical_hospital") or "Hospital Provider"
        amt = float(req.entities.get("amount") or state.signals.get("medical_amount") or 48200.0)
        return AssistantIntentResponse(
            intent="MEDICAL_CLAIM_HELP",
            success=True,
            data={
                "hospital": hosp,
                "claim_eligible_amount": amt,
                "fast_track_available": True,
                "journey_id": "medical_assistance"
            },
            response_text=f"Medical claim assistance active for your {hosp} bill of ₹{amt:,.0f}.",
            language=lang,
            suggested_actions=["OPEN_CLAIM_DESK", "TALK_TO_OFFICER"]
        )

    elif intent_name == "REVIEW_COMMITMENTS":
        obligations = state.signals.get("upcoming_obligations", 34200)
        return AssistantIntentResponse(
            intent="REVIEW_COMMITMENTS",
            success=True,
            data={
                "upcoming_obligations": obligations,
                "stress_advisory_active": True,
                "pausable_subscriptions_count": 7,
                "journey_id": "stress_intervention"
            },
            response_text=f"Upcoming commitments total ₹{obligations:,.0f}. You can pause unused subscriptions to preserve cashflow.",
            language=lang,
            suggested_actions=["OPEN_STRESS_MODAL", "PAUSE_SUBSCRIPTIONS"]
        )

    elif intent_name == "LOCK_CARD":
        return AssistantIntentResponse(
            intent="LOCK_CARD",
            success=True,
            data={
                "card_status": "temporarily_frozen",
                "action": "FREEZE_DEBIT_CARD"
            },
            response_text="Your debit card has been temporarily locked for security. Tap to manage or unfreeze.",
            language=lang,
            suggested_actions=["UNFREEZE_CARD", "REPORT_FRAUD"]
        )

    elif intent_name == "SAVE_SURPLUS":
        surplus_amt = state.signals.get("surplus_amount", 38400)
        return AssistantIntentResponse(
            intent="SAVE_SURPLUS",
            success=True,
            data={
                "surplus_amount": surplus_amt,
                "recommended_product": "Smart_FD_7_85",
                "rate": 7.85
            },
            response_text=f"We identified ₹{surplus_amt:,.0f} in surplus reserves that can earn 7.85% APY.",
            language=lang,
            suggested_actions=["EXPLORE_AUTO_SWEEP", "DISMISS"]
        )

    else:
        # Fallback for general queries
        return AssistantIntentResponse(
            intent="GENERAL_QUERY",
            success=True,
            data={"query_received": intent_name},
            response_text="I am your Bharat adaptive banking companion. How can I assist with your accounts today?",
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
                "timestamp": "2026-09-12T08:00:00Z",
                "suggestedPrompts": prompts
            }
        ]
    }

@router.post("/assistant/chat")
def assistant_chat(req: AssistantChatMessageRequest):
    """
    Handles interactive user messages from MitraChatScreen and returns structured replies with action chips.
    """
    query = req.query.strip()
    lang = req.language or "en"
    classified = VoiceIntentClassifier.classify(query, lang)
    intent = classified.get("intent", "GENERAL_QUERY")

    # Delegate to secure intent execution
    intent_resp = execute_assistant_intent(
        AssistantIntentRequest(
            customer_id=req.customer_id or "cust_bharat_001",
            intent=intent,
            language=lang,
            entities=classified.get("entities", {})
        )
    )

    action_chips = []
    if intent == "PAY_METRO":
        action_chips.append({"label": "Pay ₹40 Now", "action": "INSTANT_PAY", "payload": {"amount": 40, "merchant": "Delhi Metro Smart Card"}})
    elif intent == "CHECK_EMI":
        action_chips.append({"label": "View Schedule", "action": "OPEN_SCREEN", "payload": {"targetScreen": "Activity"}})
    elif intent == "MEDICAL_CLAIM_HELP":
        action_chips.append({"label": "Open Claim Desk", "action": "OPEN_JOURNEY", "payload": {"journeyId": "medical_assistance"}})
    elif intent == "REVIEW_COMMITMENTS":
        action_chips.append({"label": "Review Plan", "action": "OPEN_JOURNEY", "payload": {"journeyId": "stress_intervention"}})

    return {
        "success": True,
        "reply": {
            "id": f"asst_resp_{intent}",
            "sender": "assistant",
            "text": intent_resp.response_text or classified.get("response_text", ""),
            "timestamp": "2026-09-12T08:00:01Z",
            "actionChips": action_chips,
            "suggestedPrompts": ["Check Balance", "What are my upcoming payments?"]
        }
    }
