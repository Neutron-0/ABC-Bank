"""Comprehensive Test Suite for Genuine On-Device Neural SLM / NLU Engine.

Verifies:
1. On-device ONNX computational graph inference latency (< 15ms)
2. Calibrated softmax posterior probability distributions across 9 intent classes
3. Multilingual semantic coverage (English, Hindi Devanagari, Gujarati, Hinglish)
4. Spoken Indic numeral and entity extraction (AWS Indic Voicebot patterns)
5. Natural conversational speech verbalization with numbers as words and zero special characters
6. Stress-adaptive empathy adhering to RBI Fair Lending guidelines
"""

import sys
import json
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
from jsonschema import validate
from ai.voice.model.neural_slm import (
    MiniCPM5ONNXModel,
    IndicSubwordTokenizer,
    IndicEntityParser,
    NaturalSpeechVerbalizer
)
from ai.voice.model.minicpm5_runner import MiniCPM5Runner
from ai.voice.intents.classifier import VoiceIntentClassifier

VOICE_SCHEMA_PATH = ROOT_DIR / "contracts" / "voice-intent.schema.json"


def test_onnx_model_inference_latency_under_15ms():
    """Verify on-device ONNX neural forward pass executes in strictly under 15ms on CPU."""
    test_queries = [
        "Mera balance kitna hai?",
        "Mara EMI nu payment kyare che?",
        "Pay my electricity bill",
        "Lock my card immediately",
        "मेट्रो रिचार्ज करो"
    ]

    # Warmup session
    MiniCPM5ONNXModel.predict("hello")

    for q in test_queries:
        t0 = time.perf_counter()
        result = MiniCPM5ONNXModel.predict(q)
        latency_ms = (time.perf_counter() - t0) * 1000

        assert latency_ms < 15.0, f"Latency {latency_ms:.2f}ms exceeded 15ms SLA on query: {q}"
        assert result["latency_ms"] < 15.0
        assert result["confidence"] > 0.85
        assert result["intent"] in IndicSubwordTokenizer.INTENT_CLASSES


def test_multilingual_semantic_embedding_and_probability_distributions():
    """Verify posterior probabilities sum to 1.0 and accurately classify across Indic languages."""
    cases = [
        ("Mera balance kitna hai?", "CHECK_BALANCE"),
        ("Mara EMI nu payment kyare che?", "CHECK_EMI"),
        ("Mera metro recharge karo", "PAY_METRO"),
        ("Lock my card immediately", "LOCK_CARD"),
        ("Bijli ka bill bharna hai", "PAY_BILL"),
        ("Light nu bill bharvu che", "PAY_BILL"),
        ("Hospital admit claim assistance", "MEDICAL_CLAIM_HELP"),
        ("Financial stress tight budget help", "REVIEW_COMMITMENTS"),
        ("Invest surplus in smart fixed deposit", "SAVE_SURPLUS")
    ]

    for query, expected_intent in cases:
        pred = MiniCPM5ONNXModel.predict(query)
        assert pred["intent"] == expected_intent, f"Expected {expected_intent}, got {pred['intent']} for query: {query}"

        # Check valid probability distribution
        probs = pred["probabilities"]
        assert len(probs) == 9
        total_prob = sum(probs.values())
        assert abs(total_prob - 1.0) < 0.02, f"Probabilities do not sum to 1.0: {total_prob}"
        assert probs[expected_intent] >= 0.80, f"Confidence {probs[expected_intent]} is below 0.80 for {query}"


def test_spoken_indic_numeral_and_entity_extraction():
    """Verify Indic numerals, spoken words, and digit amounts are accurately parsed into numeric values."""
    test_cases = [
        ("Recharge metro for 120", 120.0),
        ("₹2500 ka bijli bill pay karo", 2500.0),
        ("Transfer aath lakh rupees", 800000.0),
        ("Pay chaalis rupaye for metro", 40.0),
        ("Payment of pachaas hazaar", 50000.0),
        ("દસ હજાર રૂપિયા", 10000.0),
        ("₹40 ticket", 40.0)
    ]

    for utterance, expected_amount in test_cases:
        amt = IndicEntityParser.extract_amount(utterance)
        assert amt == expected_amount, f"Expected {expected_amount}, parsed {amt} from '{utterance}'"


def test_natural_speech_verbalization_natural_numbers_no_special_chars():
    """Verify spoken verbalization expresses numbers as words without special characters for TTS output."""
    special_chars = ["₹", "$", "@", "#", "*", "_", "/", "\\", "{", "}"]

    # Test English
    en_speech = NaturalSpeechVerbalizer.verbalize_spoken(
        intent="PAY_METRO",
        entities={"amount": 40.0},
        language="en"
    )
    assert "forty rupees" in en_speech
    for char in special_chars:
        assert char not in en_speech, f"Special character '{char}' found in spoken text: {en_speech}"

    # Test Hindi
    hi_speech = NaturalSpeechVerbalizer.verbalize_spoken(
        intent="PAY_METRO",
        entities={"amount": 40.0},
        language="hi"
    )
    assert "चालीस रुपये" in hi_speech
    for char in special_chars:
        assert char not in hi_speech, f"Special character '{char}' found in spoken text: {hi_speech}"

    # Test Gujarati
    gu_speech = NaturalSpeechVerbalizer.verbalize_spoken(
        intent="PAY_METRO",
        entities={"amount": 40.0},
        language="gu"
    )
    assert "ચાલીસ રૂપિયા" in gu_speech
    for char in special_chars:
        assert char not in gu_speech, f"Special character '{char}' found in spoken text: {gu_speech}"


def test_stress_level_empathy_and_rbi_fair_lending():
    """Verify that user financial distress triggers cashflow counseling over new debt cross-selling."""
    # Stressed customer asking for personal loan
    stressed_res = VoiceIntentClassifier.classify(
        query="Apply for personal loan",
        lang="en",
        stress_level="stress"
    )
    assert stressed_res["intent"] == "CHECK_EMI"
    assert "stabiliz" in stressed_res["response_text"].lower() or "commitments" in stressed_res["response_text"].lower()
    assert "REVIEW_COMMITMENTS" in stressed_res["suggested_actions"]

    # Normal customer asking for loan
    normal_res = VoiceIntentClassifier.classify(
        query="Apply for personal loan",
        lang="en",
        stress_level="normal"
    )
    assert normal_res["intent"] == "CHECK_EMI"
    assert "EXPLORE_ELIGIBILITY" in normal_res["suggested_actions"]


def test_minicpm5_runner_full_contract_validation():
    """Verify MiniCPM5Runner output validates cleanly against voice-intent.schema.json."""
    with open(VOICE_SCHEMA_PATH, "r", encoding="utf-8-sig") as f:
        schema = json.load(f)

    queries = [
        ("Mera balance kitna hai?", "hi"),
        ("Maro EMI kyare che?", "gu"),
        ("Pay my electricity bill", "en"),
        ("Lock my card immediately", "en")
    ]

    for q, lang in queries:
        parsed = MiniCPM5Runner.parse_intent(q, preferred_lang=lang)
        assert parsed["confidence"] > 0.85
        assert "runtime_device" in parsed
        assert "latency_ms" in parsed
        assert parsed["latency_ms"] < 15.0

        # Run through VoiceIntentClassifier
        classified = VoiceIntentClassifier.classify(q, lang=lang)
        validate(instance=classified, schema=schema)
