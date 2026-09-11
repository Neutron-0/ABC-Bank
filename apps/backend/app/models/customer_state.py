from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class Balance(BaseModel):
    available: float
    savings: Optional[float] = 0.0
    currency: Optional[str] = "INR"

class Recommendation(BaseModel):
    id: str
    category: Optional[str] = "general"
    title: str
    reason: Optional[str] = ""
    priority: int
    suppressed: Optional[bool] = False

class CustomerStateModel(BaseModel):
    customer_id: str
    customer_name: Optional[str] = "Rahul Sharma"
    state_type: Optional[str] = "normal"
    financial_health: str
    signals: Dict[str, Any]
    life_stage: Optional[List[str]] = Field(default_factory=list)
    balance: Optional[Balance] = None
    recommendations: Optional[List[Recommendation]] = Field(default_factory=list)
