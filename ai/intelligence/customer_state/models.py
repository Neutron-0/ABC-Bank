"""Domain models for CustomerState strictly conforming to contracts/customer-state.schema.json."""

from __future__ import annotations
from typing import Dict, Any, List, Optional
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class StateType(str, Enum):
    NORMAL = "normal"
    LIFE_CHANGE = "life_change"
    FINANCIAL_STRESS = "financial_stress"
    MEDICAL_EVENT = "medical_event"
    FRAUD_ALERT = "fraud_alert"
    SURPLUS = "surplus"


class FinancialHealth(str, Enum):
    THRIVING = "thriving"
    STABLE = "stable"
    TIGHT = "tight"
    STRESS = "stress"


class BalanceModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    available: float = Field(..., description="Liquid available balance in primary account")
    savings: Optional[float] = Field(default=0.0, description="Total savings and term deposit reserves")
    currency: str = Field(default="INR", description="Three-letter currency code")


class RecommendationItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., description="Unique recommendation action identifier")
    title: str = Field(..., description="User-facing action title")
    priority: int = Field(..., description="Priority score (0 to 100), higher means more urgent")
    rank: Optional[int] = Field(default=None, description="Explicit ranking order (1 to 5)")
    category: Optional[str] = Field(default="general", description="Action category (transport, healthcare, security, savings, credit, guidance)")
    reason: Optional[str] = Field(default="", description="Audit-ready explainability rationale")
    suppressed: bool = Field(default=False, description="Whether this action was deliberately suppressed by ethical guardrails")


class CustomerStateModel(BaseModel):
    model_config = ConfigDict(extra="allow")

    customer_id: str = Field(..., description="Unique identifier of customer")
    customer_name: Optional[str] = Field(default="Valued Customer", description="Full name of customer")
    state_type: Optional[StateType] = Field(default=StateType.NORMAL, description="Current detected macro state")
    financial_health: FinancialHealth = Field(..., description="Overall financial resilience score")
    signals: Dict[str, Any] = Field(default_factory=dict, description="Composable signals map across domains")
    life_stage: List[str] = Field(default_factory=list, description="Categorical customer life-stage tags")
    balance: Optional[BalanceModel] = Field(default=None, description="Current account balance summary")
    recommendations: List[RecommendationItem] = Field(default_factory=list, description="Ranked and ethical next-best actions")
