"""Comprehensive test suite for Bharat Voice Intelligence & MiniCPM-5 Edge SLM.

Completely isolated from the Personal Recommendation Engine.
Tests intent classification, vernacular verbalization (gu, hi, en),
BCP-47 language tag normalization, and dynamic entity amount extraction.
"""

import sys
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from jsonschema import validate
from ai.voice.model.minicpm5_runner import MiniCPM5Runner
from ai.voice.intents.classifier import VoiceIntentClassifier

VOICE_SCHEMA_PATH = ROOT_DIR / "contracts" / "voice-intent.schema.json"


def test_minicpm5_vernacular_voice_interaction():
    """Verify MiniCPM-5 intent classification and verbalization in Hindi, Gujarati, and English."""
    # 1. Gujarati EMI query
    gu_res = VoiceIntentClassifier.classify("Mara EMI nu payment kyare che?", lang="gu")
    assert gu_res["intent"] == "CHECK_EMI"
    assert gu_res["language"] == "gu"
    assert "EMI" in gu_res["response_text"]
    assert "16 September" in gu_res["response_text"]

    # 2. Hindi Metro recharge
    hi_res = VoiceIntentClassifier.classify("Mera metro recharge karo", lang="hi")
    assert hi_res["intent"] == "PAY_METRO"
    assert hi_res["language"] == "hi"
    assert "₹40" in hi_res["response_text"]

    # 3. English Card Lock
    en_res = VoiceIntentClassifier.classify("Lock my card immediately", lang="en")
    assert en_res["intent"] == "LOCK_CARD"
    assert en_res["language"] == "en"
    assert "frozen" in en_res["response_text"]


def test_pay_bill_voice_intent_and_verbalization_all_languages():
    """Verify PAY_BILL intent classification and verbalization across Hindi, Gujarati, and English."""
    with open(VOICE_SCHEMA_PATH, "r", encoding="utf-8-sig") as f:
        schema = json.load(f)

    # 1. Hindi electricity bill
    hi_res = VoiceIntentClassifier.classify("Bijli ka bill bharna hai", lang="hi")
    assert hi_res["intent"] == "PAY_BILL"
    assert hi_res["language"] == "hi"
    assert "बिल" in hi_res["response_text"]
    validate(instance=hi_res, schema=schema)

    # 2. Gujarati electricity bill
    gu_res = VoiceIntentClassifier.classify("Light nu bill bharvu che", lang="gu")
    assert gu_res["intent"] == "PAY_BILL"
    assert gu_res["language"] == "gu"
    assert "બિલ" in gu_res["response_text"]
    validate(instance=gu_res, schema=schema)

    # 3. English electricity bill
    en_res = VoiceIntentClassifier.classify("Pay my electricity bill", lang="en")
    assert en_res["intent"] == "PAY_BILL"
    assert en_res["language"] == "en"
    assert "Tata Power Electricity" in en_res["response_text"]
    assert "1_TAP_PAY" in en_res["suggested_actions"]
    validate(instance=en_res, schema=schema)


def test_bcp47_language_normalization():
    """Verify that BCP-47 language tags (hi-IN, gu-IN, etc.) normalize cleanly to schema enum values."""
    with open(VOICE_SCHEMA_PATH, "r", encoding="utf-8-sig") as f:
        schema = json.load(f)

    res_hi = VoiceIntentClassifier.classify("Mera balance kitna hai?", lang="hi-IN")
    assert res_hi["language"] == "hi"
    validate(instance=res_hi, schema=schema)

    res_gu = VoiceIntentClassifier.classify("Maro EMI kyare che?", lang="gu-IN")
    assert res_gu["language"] == "gu"
    validate(instance=res_gu, schema=schema)

    res_null = VoiceIntentClassifier.classify(None, lang=None)
    assert res_null["language"] == "en"
    assert res_null["intent"] == "GENERAL_QUERY"
    validate(instance=res_null, schema=schema)


def test_dynamic_entity_amount_extraction_from_voice():
    """Verify that spoken amounts in queries are extracted dynamically into intent entities."""
    # Custom metro amount
    metro_res = VoiceIntentClassifier.classify("Recharge metro for 120", lang="en")
    assert metro_res["intent"] == "PAY_METRO"
    assert metro_res["entities"]["amount"] == 120.0

    # Custom bill amount in Hindi
    bill_res = VoiceIntentClassifier.classify("₹2500 ka bijli bill pay karo", lang="hi")
    assert bill_res["intent"] == "PAY_BILL"
    assert bill_res["entities"]["amount"] == 2500.0


def test_voice_slm_isolated_from_recommendations():
    """Architectural invariant: MiniCPM-5 Voice Runner operates independently of recommendation pipelines."""
    # Voice intent classification needs only spoken text and language, zero recommendation inputs
    res = VoiceIntentClassifier.classify("Mera khata balance kitna hai?", lang="hi")
    assert "intent" in res
    assert "response_text" in res
    assert res["intent"] == "CHECK_BALANCE"
    # Verify no recommendation objects or credit scores are embedded in the prompt
    system_prompt = MiniCPM5Runner.get_system_prompt("hi")
    assert "recommend" not in system_prompt.lower()
    assert "cross-sell" not in system_prompt.lower()
