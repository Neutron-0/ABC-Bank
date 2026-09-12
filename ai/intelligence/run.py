"""CLI entrypoint for running the Customer Intelligence Engine and generating customer-state.json."""

from __future__ import annotations
import sys
import json
import time
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
from ai.intelligence import build_customer_state


def main():
    parser = argparse.ArgumentParser(description="Generate customer-state.json from scenario")
    parser.add_argument("--scenario", default="normal", help="Scenario name (normal, life-change, financial-stress, wealth_surplus, fraud_anomaly)")
    parser.add_argument("--output", default="customer-state.json", help="Output path")
    parser.add_argument("--benchmark", action="store_true", help="Run 100 iterations to measure latency")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[2]
    scenario_path = root / "data" / "scenarios" / f"{args.scenario}.json"

    # Fallback to test fixtures if not found in data/scenarios
    if not scenario_path.exists():
        scenario_path = root / "ai" / "tests" / "fixtures" / f"{args.scenario}.json"

    transactions_path = root / "data" / "seed" / "transactions.json"
    schema_path = root / "contracts" / "customer-state.schema.json"

    if not scenario_path.exists():
        print(f"Error: Scenario file {scenario_path} not found.")
        sys.exit(1)

    with open(scenario_path, "r", encoding="utf-8-sig") as f:
        scenario_data = json.load(f)

    transactions = scenario_data.get("transactions", [])
    if not transactions and transactions_path.exists():
        with open(transactions_path, "r", encoding="utf-8-sig") as f:
            transactions = json.load(f)

    # Benchmark or single run
    start_time = time.perf_counter()
    customer_state = build_customer_state(scenario_data, transactions)
    elapsed_ms = (time.perf_counter() - start_time) * 1000

    if args.benchmark:
        iterations = 100
        t0 = time.perf_counter()
        for _ in range(iterations):
            _ = build_customer_state(scenario_data, transactions)
        avg_ms = ((time.perf_counter() - t0) / iterations) * 1000
        print(f"[BENCHMARK] Average latency over {iterations} runs: {avg_ms:.2f}ms")

    # Validate against frozen JSON Schema contract
    with open(schema_path, "r", encoding="utf-8-sig") as f:
        schema = json.load(f)

    validate(instance=customer_state, schema=schema)
    print(f"[OK] Contract Validated: customer-state.schema.json passed ({elapsed_ms:.2f}ms).")

    out_path = Path(args.output)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(customer_state, f, indent=2)

    print(f"[OK] Successfully generated {out_path} for scenario '{args.scenario}'")
    print(f"     Health: {customer_state['financial_health']} | State Type: {customer_state.get('state_type')} | Recommendations: {len(customer_state['recommendations'])}")


if __name__ == "__main__":
    main()
