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
    pending_clarification: Optional[str] = None
    conversation_context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    intent: Optional[str] = None
    entities: Optional[Dict[str, Any]] = Field(default_factory=dict)
    on_device_latency_ms: Optional[float] = None

