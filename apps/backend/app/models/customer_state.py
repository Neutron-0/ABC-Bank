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
    # Task 4: Explicit action metadata (optional, backward compatible)
    action_label: Optional[str] = None
    action_type: Optional[str] = None
    journey_id: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    # Task 5: Structured ethical classification attributes (optional, backward compatible)
    product_type: Optional[str] = None
    risk_class: Optional[str] = None
    is_debt_product: Optional[bool] = None

class CustomerStateModel(BaseModel):
    customer_id: str
    customer_name: Optional[str] = "Rahul Sharma"
    state_type: Optional[str] = "normal"
    financial_health: str
    signals: Dict[str, Any]
    life_stage: Optional[List[str]] = Field(default_factory=list)
    balance: Optional[Balance] = None
    recommendations: Optional[List[Recommendation]] = Field(default_factory=list)
