from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class AssistantIntentRequest(BaseModel):
    customer_id: str
    intent: str
    language: Optional[str] = "en"
    entities: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AssistantIntentResponse(BaseModel):
    intent: str
    success: bool
    data: Dict[str, Any] = Field(default_factory=dict)
    response_text: Optional[str] = ""
    language: str = "en"
    suggested_actions: Optional[List[str]] = Field(default_factory=list)

class AssistantChatMessageRequest(BaseModel):
    query: str
    language: Optional[str] = "en"
    customer_id: Optional[str] = "cust_bharat_001"
