from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class VoiceIntentModel(BaseModel):
    intent: str
    language: str = "en"
    confidence: Optional[float] = 0.95
    entities: Optional[Dict[str, Any]] = Field(default_factory=dict)
    response_text: Optional[str] = ""
    suggested_actions: Optional[List[str]] = Field(default_factory=list)
