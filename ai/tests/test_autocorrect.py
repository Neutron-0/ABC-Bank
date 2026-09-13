"""Unit tests for STT phonetic autocorrect and Hinglish intent normalization."""

import pytest
from ai.voice.intents.autocorrect import autocorrect_stt_text


def test_phonetic_card_and_cvv_correction():
    assert "card limit" in autocorrect_stt_text("cart limits").lower()
    assert "debit card" in autocorrect_stt_text("devi card block").lower()
    assert "CVV" in autocorrect_stt_text("what is my see vee vee")
    assert "virtual dynamic CVV" in autocorrect_stt_text("show virtual cvv")


def test_phonetic_cibil_and_statements():
    assert "CIBIL credit score" in autocorrect_stt_text("check my civil score")
    assert "bank statement" in autocorrect_stt_text("download bank statment").lower()
    assert "passbook" in autocorrect_stt_text("show pasbook").lower()


def test_hinglish_intent_mapping():
    assert "check account balance" in autocorrect_stt_text("mera balance batao").lower()
    assert "transfer money" in autocorrect_stt_text("paise bhejna hai").lower()
    assert "order chequebook" in autocorrect_stt_text("cheque book mangwani hai").lower()
    assert "apply for loan" in autocorrect_stt_text("loan lena hai").lower()


def test_acronym_capitalization():
    text = autocorrect_stt_text("check ifsc and upi for fastag")
    assert "IFSC" in text
    assert "UPI" in text
    assert "FASTag" in text


def test_insurance_and_cbdc_autocorrect():
    assert "insurance" in autocorrect_stt_text("apply for inshurance policy").lower()
    assert "mediclaim" in autocorrect_stt_text("submit medi claim bill").lower()
    assert "Digital Rupee e₹" in autocorrect_stt_text("transfer digital rupee")
    assert "ASBA IPO bid" in autocorrect_stt_text("place asba bidding")
    assert "IPO" in autocorrect_stt_text("check tata tech ipo allotment")
