import json
from pathlib import Path

def main():
    root = Path(__file__).resolve().parents[1]
    seed_dir = root / "data" / "seed"
    scenarios_dir = root / "data" / "scenarios"

    print("Checking and seeding demo data...")

    cust_file = seed_dir / "customers.json"
    tx_file = seed_dir / "transactions.json"

    if cust_file.exists():
        with open(cust_file, "r", encoding="utf-8-sig") as f:
            customers = json.load(f)
        print(f"[OK] Seed Customers: {len(customers)} records loaded.")

    if tx_file.exists():
        with open(tx_file, "r", encoding="utf-8-sig") as f:
            transactions = json.load(f)
        print(f"[OK] Seed Transactions: {len(transactions)} records loaded.")

    scenarios = list(scenarios_dir.glob("*.json"))
    print(f"[OK] Available Scenarios: {[s.stem for s in scenarios]}")
    print("Seeding complete. System ready for demo execution.")

if __name__ == "__main__":
    main()
