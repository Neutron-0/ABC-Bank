from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class BankingEventModel(BaseModel):
    """
    Generic banking event ingestion model.
    Supports transactions, account milestones, behavioral signals, preference shifts,
    or external integrations without requiring backend schema modifications.
    """
    customer_id: str
    type: str = Field(description="Event type e.g. transaction, income_event, life_event, preference_change, alert")
    category: Optional[str] = "general"
    amount: Optional[float] = None
    merchant: Optional[str] = None
    timestamp: Optional[str] = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
