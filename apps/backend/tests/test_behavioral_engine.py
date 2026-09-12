import sys
import os
from pathlib import Path
from datetime import datetime, timezone
import pytest

# Ensure root directory is on sys.path
root_dir = Path(__file__).resolve().parents[3]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from apps.backend.app.services.behavior_engine import BehavioralEngine
from apps.backend.app.services.state_service import StateService
from apps.backend.app.services.safety_policy import SafetyPolicyFilter
from apps.backend.app.models.customer_state import Recommendation
from apps.backend.app.experience.composer import ExperienceComposer

def test_habit_pattern_detection():
    """Verify behavioral engine extracts dining, commute, and entertainment habits."""
    transactions = [
        # Sunday dinners
        {"timestamp": "2026-08-02T19:45:00Z", "category": "dining", "amount": 1200, "description": "Sunday Family Dinner"},
        {"timestamp": "2026-08-09T20:10:00Z", "category": "dining", "amount": 1400, "description": "Restaurant Dining"},
        {"timestamp": "2026-08-16T19:30:00Z", "category": "dining", "amount": 1150, "description": "Dinner with Friends"},
        {"timestamp": "2026-08-23T20:00:00Z", "category": "dining", "amount": 1350, "description": "Barbeque Nation"},
        # Morning commutes (Mon-Fri 08:00 - 10:00)
        {"timestamp": "2026-08-03T08:30:00Z", "category": "transport", "amount": 40, "description": "Metro Smart Card"},
        {"timestamp": "2026-08-04T08:25:00Z", "category": "transport", "amount": 40, "description": "Metro Smart Card"},
        {"timestamp": "2026-08-05T08:35:00Z", "category": "transport", "amount": 40, "description": "Metro Smart Card"},
        {"timestamp": "2026-08-06T08:40:00Z", "category": "transport", "amount": 40, "description": "Metro Smart Card"},
        {"timestamp": "2026-08-07T08:20:00Z", "category": "transport", "amount": 40, "description": "Metro Smart Card"},
        # Periodic cinema
        {"timestamp": "2026-08-01T17:00:00Z", "category": "entertainment", "amount": 650, "description": "PVR Cinemas"},
        {"timestamp": "2026-08-15T18:00:00Z", "category": "entertainment", "amount": 750, "description": "INOX Movies"},
        {"timestamp": "2026-08-29T16:30:00Z", "category": "entertainment", "amount": 600, "description": "BookMyShow Movies"},
    ]

    habits = BehavioralEngine.extract_habits(transactions)
    habit_names = [h["habit"] for h in habits]

    assert "weekly_sunday_dining" in habit_names
    assert "morning_commute" in habit_names
    assert "periodic_cinema" in habit_names

def test_time_aware_contextual_scoring():
    """Verify Sunday evening boosts dining habits and weekday morning boosts commute habits."""
    habits = [
        {"habit": "weekly_sunday_dining", "category": "dining", "confidence": 0.95},
        {"habit": "morning_commute", "category": "transport", "confidence": 0.92},
        {"habit": "periodic_cinema", "category": "entertainment", "confidence": 0.75},
    ]

    # Test 1: Sunday Evening at 19:30 UTC
    sunday_evening = datetime(2026, 9, 13, 19, 30, tzinfo=timezone.utc)  # Sunday
    scored_sunday = BehavioralEngine.get_context_relevance(habits, current_time=sunday_evening)
    assert len(scored_sunday) > 0
    top_habit_sunday = scored_sunday[0]
    assert top_habit_sunday["habit"] == "weekly_sunday_dining"
    assert top_habit_sunday["relevance_score"] > 1.5

    # Test 2: Tuesday Morning at 08:30 UTC
    tuesday_morning = datetime(2026, 9, 15, 8, 30, tzinfo=timezone.utc)  # Tuesday
    scored_tuesday = BehavioralEngine.get_context_relevance(habits, current_time=tuesday_morning)
    assert len(scored_tuesday) > 0
    top_habit_tuesday = scored_tuesday[0]
    assert top_habit_tuesday["habit"] == "morning_commute"
    assert top_habit_tuesday["relevance_score"] > 1.5

def test_composer_prioritizes_active_context():
    """Verify composer injects contextual prompt or boosts actions matching temporal habits."""
    from apps.backend.app.models.customer_state import CustomerStateModel, Balance

    state = CustomerStateModel(
        customer_id="cust_bharat_001",
        account_id="acc_bharat_001",
        scenario="normal",
        financial_health="stable",
        balance=Balance(available=25000.0, total=25000.0),
        signals={"habits": [
            {"habit": "weekly_sunday_dining", "category": "dining", "confidence": 0.95, "typical_spend": 1300}
        ]},
        recommendations=[
            Recommendation(id="rec_dining", type="dining_offer", title="Dining Rewards", description="5x points on weekend dinner", action_url="/rewards/dining", priority=1),
            Recommendation(id="rec_sip", type="sip_growth", title="Start an SIP", description="Invest 2000 monthly", action_url="/investments/sip", priority=2),
        ],
        obligations=[],
        recent_events=[]
    )

    # Sunday 20:00
    sunday_evening = datetime(2026, 9, 13, 20, 0, tzinfo=timezone.utc)
    exp = ExperienceComposer.compose(state, current_time=sunday_evening)

    # Check that dining recommendation is boosted or context card reflects dining
    assert exp.hero_card is not None
    assert len(exp.context_cards) > 0
    assert "dining" in exp.primary_actions or any(c.type == "dining" for c in exp.context_cards)
