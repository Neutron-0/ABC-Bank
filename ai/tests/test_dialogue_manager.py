"""Unit tests for Mitra Dialogue Manager & Multi-Turn Voice Navigation."""

import pytest
from ai.voice.dialogue.manager import DialogueManager


def test_ambiguous_score_triggers_clarification_english():
    turn = DialogueManager.process_turn("score", language="en")
    assert turn.intent == "CLARIFY_CREDIT_SCORE"
    assert turn.pending_clarification == "CONFIRM_CREDIT_SCORE"
    assert "Credit Score (CIBIL)" in turn.response_text
    assert turn.navigation is None
    assert len(turn.action_chips) == 2


def test_ambiguous_score_confirmed_navigates_to_credit_score():
    t1 = DialogueManager.process_turn("score", language="en")
    t2 = DialogueManager.process_turn("yes", language="en", pending_clarification=t1.pending_clarification)
    assert t2.intent == "NAVIGATE_CREDIT_SCORE"
    assert t2.pending_clarification is None
    assert t2.navigation is not None
    assert t2.navigation.type == "JOURNEY"
    assert t2.navigation.target == "credit_score"
    assert t2.navigation.auto_navigate is True


def test_ambiguous_score_declined_returns_helpful_guidance():
    t1 = DialogueManager.process_turn("score", language="en")
    t2 = DialogueManager.process_turn("no", language="en", pending_clarification=t1.pending_clarification)
    assert t2.intent == "DECLINED_CLARIFICATION"
    assert t2.navigation is None
    assert "debit card" in t2.response_text.lower()


def test_hinglish_mera_score_and_haan_confirmation():
    t1 = DialogueManager.process_turn("mera score kitna hai", language="en")
    assert t1.intent == "CLARIFY_CREDIT_SCORE"
    assert t1.language == "hi"

    t2 = DialogueManager.process_turn("haan", language="en", pending_clarification=t1.pending_clarification)
    assert t2.intent == "NAVIGATE_CREDIT_SCORE"
    assert t2.navigation.target == "credit_score"
    assert t2.navigation.auto_navigate is True


def test_hindi_devanagari_dialogue_flow():
    # Ambiguous Hindi query
    t1 = DialogueManager.process_turn("स्कोर", language="hi")
    assert t1.intent == "CLARIFY_CREDIT_SCORE"
    assert t1.language == "hi"
    assert t1.pending_clarification == "CONFIRM_CREDIT_SCORE"

    # Confirmation in Hindi
    t2 = DialogueManager.process_turn("हाँ", language="hi", pending_clarification=t1.pending_clarification)
    assert t2.intent == "NAVIGATE_CREDIT_SCORE"
    assert t2.language == "hi"
    assert t2.navigation.target == "credit_score"
    assert t2.navigation.auto_navigate is True


def test_gujarati_script_dialogue_flow():
    # Ambiguous Gujarati query
    t1 = DialogueManager.process_turn("સ્કોર", language="gu")
    assert t1.intent == "CLARIFY_CREDIT_SCORE"
    assert t1.language == "gu"

    # Confirmation in Gujarati
    t2 = DialogueManager.process_turn("હા", language="gu", pending_clarification=t1.pending_clarification)
    assert t2.intent == "NAVIGATE_CREDIT_SCORE"
    assert t2.language == "gu"
    assert t2.navigation.target == "credit_score"
    assert t2.navigation.auto_navigate is True


def test_direct_debit_card_navigates_instantly_without_followup():
    t = DialogueManager.process_turn("debit card", language="en")
    assert t.intent == "NAVIGATE_DEBIT_CARD"
    assert t.pending_clarification is None
    assert t.navigation is not None
    assert t.navigation.type == "JOURNEY"
    assert t.navigation.target == "debit_card"
    assert t.navigation.auto_navigate is True
    assert t.action_chips[0]["payload"]["journeyId"] == "debit_card"


def test_direct_hindi_debit_card():
    t = DialogueManager.process_turn("डेबिट कार्ड", language="hi")
    assert t.intent == "NAVIGATE_DEBIT_CARD"
    assert t.language == "hi"
    assert t.navigation.target == "debit_card"
    assert t.navigation.auto_navigate is True


def test_direct_gujarati_debit_card():
    t = DialogueManager.process_turn("ડેબિટ કાર્ડ", language="gu")
    assert t.intent == "NAVIGATE_DEBIT_CARD"
    assert t.language == "gu"
    assert t.navigation.target == "debit_card"
    assert t.navigation.auto_navigate is True


def test_direct_destinations_metro_payments_activity_kyc():
    # Metro
    m = DialogueManager.process_turn("metro recharge", language="en")
    assert m.intent == "PAY_METRO"

    # Payments
    p = DialogueManager.process_turn("send money to Rahul", language="en")
    assert p.intent == "NAVIGATE_PAYMENTS"
    assert p.navigation.target == "payments"

    # Passbook / Activity
    a = DialogueManager.process_turn("show my passbook", language="en")
    assert a.intent == "NAVIGATE_ACTIVITY"
    assert a.navigation.target == "activity"

    # KYC
    k = DialogueManager.process_turn("complete video kyc", language="en")
    assert k.intent == "NAVIGATE_KYC"
    assert k.navigation.target == "kyc"
