"""Personalization package for Bharat Banking."""

from ai.intelligence.personalization.archetypes import ArchetypeClassifier, BharatArchetypeProfile, BHARAT_ARCHETYPES, ArchetypeId
from ai.intelligence.personalization.catalog import PRODUCT_CATALOG, BankingProduct
from ai.intelligence.personalization.compliance import ComplianceEngine, DecisionAuditRecord
from ai.intelligence.personalization.engine import PersonalizationEngine

__all__ = [
    "ArchetypeClassifier",
    "BharatArchetypeProfile",
    "BHARAT_ARCHETYPES",
    "ArchetypeId",
    "PRODUCT_CATALOG",
    "BankingProduct",
    "ComplianceEngine",
    "DecisionAuditRecord",
    "PersonalizationEngine",
]
