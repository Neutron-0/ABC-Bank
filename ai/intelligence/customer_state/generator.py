"""CustomerState generator interface bridging scenario inputs to CustomerStateBuilder."""

from __future__ import annotations
from typing import Dict, Any
from ai.intelligence.customer_state.builder import CustomerStateBuilder


class CustomerStateGenerator:
    """Combines features, signals, and ethical rankings into CustomerState."""

    @staticmethod
    def generate(scenario_data: Dict[str, Any], features: Dict[str, Any]) -> Dict[str, Any]:
        """Generates validated CustomerState dictionary conforming to contracts/customer-state.schema.json."""
        return CustomerStateBuilder.build(scenario_data, features)
