import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parents[3]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from apps.backend.app.services.state_service import StateService
from apps.backend.app.experience.composer import ExperienceComposer

def test_experience_composition():
    # Test normal scenario
    StateService.switch_scenario("normal")
    state = StateService.get_state()
    exp = ExperienceComposer.compose(state)
    assert "metro" in exp.primary_actions
    assert exp.hero_card is not None
    assert "Metro" in exp.hero_card.title
    print("[PASS] Normal scenario experience test passed.")

    # Test financial stress scenario
    StateService.switch_scenario("financial-stress")
    state = StateService.get_state()
    exp = ExperienceComposer.compose(state)
    assert "review_commitments" in exp.primary_actions
    assert "personal_loans" in exp.deprioritized_modules
    print("[PASS] Financial stress ethical suppression test passed.")

def test_assistant_chat_dialogue_flows():
    from ai.voice.intents.classifier import VoiceIntentClassifier
    from ai.voice.dialogue.manager import DialogueManager, DialogueTurn

    # 1. Ambiguous query "score" triggers clarification
    resp1 = DialogueManager.process_turn(DialogueTurn(query="score", language="en"))
    assert "Credit Score (CIBIL)" in resp1.response_text
    assert resp1.pending_clarification == "CONFIRM_CREDIT_SCORE"
    assert resp1.navigation is None
    print("[PASS] Ambiguous 'score' clarification test passed.")

    # 2. Affirmative follow-up "yes" resolves clarification and navigates to Credit Score
    resp2 = DialogueManager.process_turn(
        DialogueTurn(query="yes", language="en", pending_clarification="CONFIRM_CREDIT_SCORE")
    )
    assert resp2.pending_clarification is None
    assert resp2.navigation is not None
    assert resp2.navigation.target == "credit_score"
    assert resp2.navigation.auto_navigate is True
    print("[PASS] Affirmative follow-up 'yes' -> credit_score auto-navigation passed.")

    # 3. Direct unambiguous query "debit card" navigates directly with ZERO follow-up
    resp3 = DialogueManager.process_turn(DialogueTurn(query="debit card", language="en"))
    assert resp3.pending_clarification is None
    assert resp3.navigation is not None
    assert resp3.navigation.target == "debit_card"
    assert resp3.navigation.auto_navigate is True
    print("[PASS] Direct 'debit card' zero follow-up auto-navigation passed.")

    # 4. Hindi ambiguous flow: "स्कोर" -> clarification -> "हाँ" -> credit score
    resp4 = DialogueManager.process_turn(DialogueTurn(query="स्कोर", language="hi"))
    assert "क्रेडिट स्कोर" in resp4.response_text
    assert resp4.pending_clarification == "CONFIRM_CREDIT_SCORE"

    resp5 = DialogueManager.process_turn(
        DialogueTurn(query="हाँ", language="hi", pending_clarification="CONFIRM_CREDIT_SCORE")
    )
    assert resp5.navigation is not None
    assert resp5.navigation.target == "credit_score"
    assert resp5.navigation.auto_navigate is True
    print("[PASS] Hindi Devanagari dialogue flow passed.")

    # 5. Gujarati direct debit card flow
    resp6 = DialogueManager.process_turn(DialogueTurn(query="ડેબિટ કાર્ડ", language="gu"))
    assert resp6.navigation is not None
    assert resp6.navigation.target == "debit_card"
    assert resp6.navigation.auto_navigate is True
    print("[PASS] Gujarati direct navigation passed.")

    # 6. Classifier integration with schema frozen contract
    c1 = VoiceIntentClassifier.classify("score", lang="en")
    assert c1["pending_clarification"] == "CONFIRM_CREDIT_SCORE"

    c2 = VoiceIntentClassifier.classify("yes", lang="en", pending_clarification="CONFIRM_CREDIT_SCORE")
    assert c2["navigation"]["target"] == "credit_score"
    assert c2["navigation"]["auto_navigate"] is True

    c3 = VoiceIntentClassifier.classify("debit card", lang="en")
    assert c3["navigation"]["target"] == "debit_card"
    assert c3["navigation"]["auto_navigate"] is True
    print("[PASS] VoiceIntentClassifier schema-compliant classification passed.")

if __name__ == "__main__":
    test_experience_composition()
    test_assistant_chat_dialogue_flows()

