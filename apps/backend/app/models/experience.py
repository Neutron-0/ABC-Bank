from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CardAction(BaseModel):
    label: str
    action_type: str
    target_screen: Optional[str] = None
    journey_id: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None

class ContextCardModel(BaseModel):
    id: str
    type: str
    layer: str  # DO, KNOW, PLAN, CONSIDER
    priority: int
    title: str
    description: str
    reason: str
    primary_action: CardAction
    secondary_action: Optional[CardAction] = None
    dismissible: Optional[bool] = True
    badge: Optional[str] = None
    accent: Optional[str] = None
    why_details: Optional[List[str]] = Field(default_factory=list)

class HeroCard(BaseModel):
    id: str
    title: str
    subtitle: str
    action_label: str
    action_type: str
    badge: Optional[str] = None
    accent: Optional[str] = None
    why: Optional[str] = None

class ExperienceConfigModel(BaseModel):
    customer_id: str
    primary_actions: List[str]
    secondary_actions: Optional[List[str]] = Field(default_factory=list)
    priority_modules: List[str]
    deprioritized_modules: Optional[List[str]] = Field(default_factory=list)
    hero_card: Optional[HeroCard] = None
    context_cards: Optional[List[ContextCardModel]] = Field(default_factory=list)
    language: Optional[str] = "en"
    interaction_mode: Optional[str] = "standard"
