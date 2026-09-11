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

if __name__ == "__main__":
    test_experience_composition()
