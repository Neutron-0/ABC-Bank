import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List

from apps.backend.app.db.loader import DataLoader
from apps.backend.app.models.customer_state import CustomerStateModel, Balance, Recommendation
from apps.backend.app.models.events import BankingEventModel

logger = logging.getLogger(__name__)

class StateService:
    """
    Manages active customer state in backend.
    Orchestrates synthetic bank data, AI intelligence pipeline execution,
    in-memory scenario switching, and dynamic event ingestion.

    Architectural Principle:
    AI understands the customer. Backend orchestrates, validates, and serves.
    StateService DOES NOT infer domain intelligence (e.g. medical surges, fraud scores,
    or commute routines) from merchant strings.
    """
    _current_scenario: str = "normal"
    _in_memory_states: Dict[str, CustomerStateModel] = {}
    _in_memory_events: Dict[str, List[BankingEventModel]] = {}

    @classmethod
    def get_known_customer_ids(cls) -> List[str]:
        """Returns list of all valid customer IDs known to the bank infrastructure."""
        customers = DataLoader.load_customers()
        return [c.get("id") for c in customers if c.get("id")]

    @classmethod
    def is_valid_customer(cls, customer_id: str) -> bool:
        """Validates if customer exists in the banking records."""
        known = cls.get_known_customer_ids()
        return customer_id in known or customer_id == "cust_bharat_001"

    @classmethod
    def _create_safe_fallback_state(cls, customer_id: str, scenario_name: str = "normal") -> CustomerStateModel:
        """
        Creates a resilient, contract-conforming fallback state if AI computation fails.
        Guarantees banking service continuity without crash.
        """
        customers = DataLoader.load_customers()
        cust_profile = next((c for c in customers if c.get("id") == customer_id), None)

        avail_bal = 10000.0
        sav_bal = 20000.0
        name = "Valued Customer"

        if cust_profile:
            name = cust_profile.get("name", name)
            accounts = cust_profile.get("accounts", {})
            if isinstance(accounts, dict):
                avail_bal = float(accounts.get("available_balance", avail_bal))
                sav_bal = float(accounts.get("savings_reserve", sav_bal))

        return CustomerStateModel(
            customer_id=customer_id,
            customer_name=name,
            state_type=scenario_name.replace("-", "_"),
            financial_health="stable",
            signals={
                "fallback_mode": True,
                "savings_trend": "positive",
                "anomaly_score": 0
            },
            life_stage=["early_career"],
            balance=Balance(available=avail_bal, savings=sav_bal, currency="INR"),
            recommendations=[
                Recommendation(
                    id="rec_fallback_guidance",
                    category="guidance",
                    title="Account Overview Ready",
                    reason="Standard bank account summary loaded in resilient mode.",
                    priority=50,
                    suppressed=False
                )
            ]
        )

    @classmethod
    def get_state(cls, customer_id: str = "cust_bharat_001", scenario_name: Optional[str] = None) -> CustomerStateModel:
        """
        Retrieves the verified CustomerStateModel for a customer.
        1. Checks in-memory session cache.
        2. Executes AI pipeline with DataLoader inputs.
        3. Falls back gracefully on error.
        """
        if not cls.is_valid_customer(customer_id):
            raise KeyError(f"Customer with ID '{customer_id}' not found in bank records.")

        target_scenario = scenario_name or cls._current_scenario

        # If we have an in-memory modified state for this customer, return it
        cache_key = f"{customer_id}_{target_scenario}"
        if cache_key in cls._in_memory_states:
            return cls._in_memory_states[cache_key]

        try:
            scenario_data = DataLoader.load_scenario(target_scenario)
            scenario_data["customer_id"] = customer_id

            transactions = DataLoader.load_transactions(customer_id)
            if not transactions:
                transactions = DataLoader.load_transactions()

            # Delegate feature extraction and state generation to AI module
            from ai.intelligence.features.extractor import FeatureExtractor
            from ai.intelligence.customer_state.generator import CustomerStateGenerator

            features = FeatureExtractor.extract(transactions)
            raw_state = CustomerStateGenerator.generate(scenario_data, features)

            # Extract longitudinal behavioral habits from transaction history
            from apps.backend.app.services.behavior_engine import BehavioralEngine
            habits = BehavioralEngine.analyze_habits(transactions)
            if "signals" not in raw_state or not isinstance(raw_state["signals"], dict):
                raw_state["signals"] = {}
            raw_state["signals"]["habits"] = habits

            # Validate against Pydantic model contract
            customer_state = CustomerStateModel(**raw_state)
            cls._in_memory_states[cache_key] = customer_state
            return customer_state

        except Exception as e:
            logger.warning(f"[StateService] AI pipeline execution failed or produced malformed data: {e}. Activating fallback.")
            fallback = cls._create_safe_fallback_state(customer_id, target_scenario)
            cls._in_memory_states[cache_key] = fallback
            return fallback

    @classmethod
    def switch_scenario(cls, scenario_name: str, customer_id: str = "cust_bharat_001") -> CustomerStateModel:
        """Switches active scenario and invalidates cache."""
        cls._current_scenario = scenario_name
        cache_key = f"{customer_id}_{scenario_name}"
        if cache_key in cls._in_memory_states:
            del cls._in_memory_states[cache_key]
        return cls.get_state(customer_id, scenario_name)

    @classmethod
    def get_current_scenario_name(cls) -> str:
        return cls._current_scenario

    @classmethod
    def ingest_event(cls, event: BankingEventModel) -> CustomerStateModel:
        """
        Ingests a generic banking event (transaction, income event, life milestone, or alert).
        The backend performs accounting / state updating (e.g. balance adjustments and event logging)
        and attaches the generic event metadata to signals.
        It DOES NOT hardcode scenario detection (e.g. keyword searches on merchants).
        """
        if not cls.is_valid_customer(event.customer_id):
            raise KeyError(f"Customer '{event.customer_id}' not found.")

        # 1. Record event in customer's in-memory event log
        if event.customer_id not in cls._in_memory_events:
            cls._in_memory_events[event.customer_id] = []
        cls._in_memory_events[event.customer_id].append(event)

        # 2. Get current state baseline
        current_state = cls.get_state(event.customer_id)

        # 3. Clone state structures
        signals = dict(current_state.signals)
        balance = current_state.balance or Balance(available=25000, savings=50000, currency="INR")
        recs = list(current_state.recommendations or [])

        # 4. Pure accounting balance adjustment if event carries a financial amount
        if event.amount is not None:
            balance.available = max(0.0, balance.available + event.amount)

        # 5. Generic event logging in signals (without merchant string scraping or hardcoded scores)
        signals["last_event_type"] = event.type
        signals["last_event_category"] = event.category
        if event.amount is not None:
            signals["last_event_amount"] = event.amount
        if event.merchant:
            signals["last_event_merchant"] = event.merchant

        # Incorporate any arbitrary event metadata directly into signals
        if event.metadata:
            for k, v in event.metadata.items():
                signals[f"event_{k}"] = v

        # 6. If the incoming event carries explicit recommendations or state overrides in metadata, apply them
        if event.metadata and "recommendation" in event.metadata:
            rec_meta = event.metadata["recommendation"]
            if isinstance(rec_meta, dict):
                recs.insert(0, Recommendation(**rec_meta))

        # Save mutated state in session cache
        updated_state = CustomerStateModel(
            customer_id=event.customer_id,
            customer_name=current_state.customer_name,
            state_type=current_state.state_type,
            financial_health=current_state.financial_health,
            signals=signals,
            life_stage=current_state.life_stage,
            balance=balance,
            recommendations=recs
        )

        cache_key = f"{event.customer_id}_{cls._current_scenario}"
        cls._in_memory_states[cache_key] = updated_state
        return updated_state
