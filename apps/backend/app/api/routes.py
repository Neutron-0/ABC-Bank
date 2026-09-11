from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any

from apps.backend.app.services.state_service import StateService
from apps.backend.app.experience.composer import ExperienceComposer
from apps.backend.app.models.experience import ExperienceConfigModel
from apps.backend.app.models.customer_state import CustomerStateModel
from apps.backend.app.models.voice import VoiceIntentModel
from ai.voice.intents.classifier import VoiceIntentClassifier

router = APIRouter(prefix="/api/v1")

class VoiceRequest(BaseModel):
    query: str
    language: Optional[str] = "en"

class ScenarioRequest(BaseModel):
    scenario: str

@router.get("/customer/{customer_id}", response_model=CustomerStateModel)
def get_customer(customer_id: str):
    state = StateService.get_state()
    return state

@router.get("/experience/{customer_id}", response_model=ExperienceConfigModel)
def get_experience(customer_id: str, lang: Optional[str] = Query("en")):
    state = StateService.get_state()
    experience = ExperienceComposer.compose(state, lang=lang or "en")
    return experience

@router.post("/scenario/switch")
def switch_scenario(req: ScenarioRequest):
    valid_scenarios = ["normal", "life-change", "financial-stress", "medical_event", "fraud_alert", "surplus"]
    if req.scenario not in valid_scenarios and req.scenario not in ["normal", "life-change", "financial-stress"]:
        raise HTTPException(status_code=400, detail=f"Invalid scenario. Allowed: {valid_scenarios}")

    state = StateService.switch_scenario(req.scenario)
    experience = ExperienceComposer.compose(state)
    return {
        "success": True,
        "scenario": req.scenario,
        "customer_state": state,
        "experience": experience
    }

@router.post("/voice/intent", response_model=VoiceIntentModel)
def voice_intent(req: VoiceRequest):
    intent_data = VoiceIntentClassifier.classify(req.query, req.language or "en")
    return VoiceIntentModel(**intent_data)
