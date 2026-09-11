from typing import Dict, Any, Optional
from apps.backend.app.db.loader import DataLoader
from apps.backend.app.models.customer_state import CustomerStateModel
from ai.intelligence.features.extractor import FeatureExtractor
from ai.intelligence.customer_state.generator import CustomerStateGenerator

class StateService:
    """Manages active customer state in backend."""
    _current_scenario: str = "normal"
    _overridden_state: Optional[CustomerStateModel] = None

    @classmethod
    def get_state(cls, scenario_name: Optional[str] = None) -> CustomerStateModel:
        name = scenario_name or cls._current_scenario
        scenario_data = DataLoader.load_scenario(name)
        transactions = DataLoader.load_transactions()
        features = FeatureExtractor.extract(transactions)
        raw_state = CustomerStateGenerator.generate(scenario_data, features)
        return CustomerStateModel(**raw_state)

    @classmethod
    def switch_scenario(cls, scenario_name: str) -> CustomerStateModel:
        cls._current_scenario = scenario_name
        return cls.get_state(scenario_name)

    @classmethod
    def get_current_scenario_name(cls) -> str:
        return cls._current_scenario
