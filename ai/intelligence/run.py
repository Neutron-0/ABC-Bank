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
from ai.intelligence.features.extractor import FeatureExtractor
from ai.intelligence.customer_state.generator import CustomerStateGenerator

def main():
    parser = argparse.ArgumentParser(description="Generate customer-state.json from scenario")
    parser.add_argument("--scenario", default="normal", help="Scenario name (normal, life-change, financial-stress)")
    parser.add_argument("--output", default="customer-state.json", help="Output path")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[2]
    scenario_path = root / "data" / "scenarios" / f"{args.scenario}.json"
    transactions_path = root / "data" / "seed" / "transactions.json"
    schema_path = root / "contracts" / "customer-state.schema.json"

    if not scenario_path.exists():
        print(f"Error: Scenario file {scenario_path} not found.")
        return

    with open(scenario_path, "r", encoding="utf-8-sig") as f:
        scenario_data = json.load(f)

    transactions = []
    if transactions_path.exists():
        with open(transactions_path, "r", encoding="utf-8-sig") as f:
            transactions = json.load(f)

    features = FeatureExtractor.extract(transactions)
    customer_state = CustomerStateGenerator.generate(scenario_data, features)

    # Validate contract
    with open(schema_path, "r", encoding="utf-8-sig") as f:
        schema = json.load(f)

    validate(instance=customer_state, schema=schema)
    print("[OK] Contract Validated: customer-state.schema.json passed.")

    out_path = Path(args.output)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(customer_state, f, indent=2)

    print(f"[OK] Successfully generated {out_path} for scenario '{args.scenario}'")
    print(f"     Health: {customer_state['financial_health']} | Recommendations: {len(customer_state['recommendations'])}")

if __name__ == "__main__":
    main()
