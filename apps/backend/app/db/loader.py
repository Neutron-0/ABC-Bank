import json
from pathlib import Path
from typing import List, Dict, Any, Optional

class DataLoader:
    """Loads seed files and scenarios from shared data directory."""

    @classmethod
    def get_data_dir(cls) -> Path:
        return Path(__file__).resolve().parents[4] / "data"

    @classmethod
    def load_customers(cls) -> List[Dict[str, Any]]:
        path = cls.get_data_dir() / "seed" / "customers.json"
        if path.exists():
            with open(path, "r", encoding="utf-8-sig") as f:
                return json.load(f)
        return []

    @classmethod
    def load_transactions(cls, customer_id: Optional[str] = None) -> List[Dict[str, Any]]:
        path = cls.get_data_dir() / "seed" / "transactions.json"
        if path.exists():
            with open(path, "r", encoding="utf-8-sig") as f:
                txs = json.load(f)
                if customer_id:
                    return [t for t in txs if t.get("customer_id") == customer_id]
                return txs
        return []

    @classmethod
    def load_scenario(cls, scenario_name: str) -> Dict[str, Any]:
        path = cls.get_data_dir() / "scenarios" / f"{scenario_name}.json"
        if path.exists():
            with open(path, "r", encoding="utf-8-sig") as f:
                return json.load(f)
        # Fallback to normal
        norm_path = cls.get_data_dir() / "scenarios" / "normal.json"
        with open(norm_path, "r", encoding="utf-8-sig") as f:
            return json.load(f)
