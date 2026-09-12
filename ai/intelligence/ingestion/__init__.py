"""Ingestion and Harmonization module for multi-source Bharat banking data."""

from ai.intelligence.ingestion.models import (
    CBSLedgerRecord,
    UPISwitchLog,
    SMSNotificationRecord,
    BureauCreditProfile,
    BBPSUtilityRecord,
    NCMCTransitRecord,
    CustomerDemographics,
    UnifiedCustomerProfile,
)
from ai.intelligence.ingestion.harmonizer import MultiSourceDataHarmonizer

__all__ = [
    "CBSLedgerRecord",
    "UPISwitchLog",
    "SMSNotificationRecord",
    "BureauCreditProfile",
    "BBPSUtilityRecord",
    "NCMCTransitRecord",
    "CustomerDemographics",
    "UnifiedCustomerProfile",
    "MultiSourceDataHarmonizer",
]
