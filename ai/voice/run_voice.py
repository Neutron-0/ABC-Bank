import sys
import json
import argparse
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parents[2]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from jsonschema import validate
from ai.voice.intents.classifier import VoiceIntentClassifier

def main():
    parser = argparse.ArgumentParser(description="Classify query into voice-intent.json using on-device neural SLM")
    parser.add_argument("positional_query", nargs="?", default=None, help="Optional positional spoken utterance text")
    parser.add_argument("--query", default=None, help="Spoken utterance text")
    parser.add_argument("--lang", default=None, choices=["en", "hi", "gu"], help="Language code")
    parser.add_argument("--stress", default="normal", choices=["normal", "stress", "tight"], help="Simulated customer financial stress level")
    parser.add_argument("--output", default="voice-intent.json", help="Output path")
    args = parser.parse_args()

    effective_query = args.positional_query or args.query or "Pay Metro"
    schema_path = root_dir / "contracts" / "voice-intent.schema.json"

    intent_result = VoiceIntentClassifier.classify(effective_query, args.lang, stress_level=args.stress)

    with open(schema_path, "r", encoding="utf-8-sig") as f:
        schema = json.load(f)

    validate(instance=intent_result, schema=schema)
    print("[OK] Contract Validated: voice-intent.schema.json passed.")

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(intent_result, f, indent=2)

    print(f"[OK] Voice Intent generated: {intent_result['intent']} ({intent_result['language']})")
    print(f"     Response: {intent_result['response_text']}")

if __name__ == "__main__":
    main()
