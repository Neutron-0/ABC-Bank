# Utility Scripts Documentation

## 1. Overview
The ABC Bank repository includes a suite of powerful utility scripts under the `/scripts/` directory. These tools are critical for development, testing, local data generation, system auditing, and orchestrating demo flows. By providing deterministic seed data and comprehensive automated checks, they ensure the entire pipeline remains robust across the AI, Backend, and Frontend domains.

## 2. audit_and_verify_all.py
**Purpose**: A massive, comprehensive audit suite that validates the integrity and correctness of the entire system's logic and integrations.

**What it verifies**:
Runs 39 distinct checks organized into three major categories:
1. **AI Models**: Validates ONNX execution (MiniCPM5), Financial Feature Vectorization, KMeans Archetype clustering, Propensity scoring (XGBoost/LogReg wrappers), and LinUCB Bandit metrics.
2. **Recommendation Engine**: Tests the Multi-source Harmonizer, Predictive Cash Flow Engine, 50/30/20 Spend Analyzer, Signal Detection, the 19-Product Catalog rules, RBI/DPDP Compliance Engine, and the SHA-256 Cryptographic Ledger.
3. **Chatbot (Mitra)**: Validates Voice Intent Classification (EN/HI/GU), Dialogue Management, and backend API contract integrity.

**How to run**:
```bash
python scripts/audit_and_verify_all.py
```

## 3. generate_seed_data.py
**Purpose**: Deterministically generates a large, synthetic banking dataset customized for Indian demographics (ABC Bank).

**Features**:
- Generates 1,200+ realistic customer profiles distributed across Tier 1-3 cities (e.g., Ahmedabad, Surat, Mumbai, New Delhi).
- Uses a deterministic `RANDOM_SEED = 42` so tests are reproducible.
- Distributes users into archetypes (e.g., Urban Salaried, Rural Farmer).
- Generates 2,500+ accounts and 65,000+ coherent transactions spanning up to 12 months.
- Includes Indian-specific nuances like NCMC metro taps, Fastag recharges, BBPS utilities, and UPI transactions.

**How to run**:
Typically imported as a module by `seed_database.py`, but can be run directly or tested via standard Python imports.

## 4. seed_database.py
**Purpose**: The primary script to populate the local PostgreSQL database with the synthetic dataset generated above.

**Batch Insertion Strategy**:
- Connects to the DB via SQLAlchemy and ensures the schema is correctly migrated (`Base.metadata.create_all`).
- Wipes existing data (if `reset=True` is provided) to guarantee a clean slate.
- Uses `db.bulk_insert_mappings` to insert data highly efficiently.
- Transactions are inserted in optimized batches of 10,000 to prevent memory blowouts when writing 65k+ records.

**How to run**:
```bash
python scripts/seed_database.py
```

## 5. export_onnx_meta.py
**Purpose**: Extracts metadata and model weights from the Python-based AI subword tokenizer and model classes, and exports them to a JSON file.

**Details**:
- Pulls classes, embedding dimensions, centroids, and network weights (`w1`, `b1`, `w2`, `b2`) from `MiniCPM5ONNXModel` and `IndicSubwordTokenizer`.
- Serializes the exact model structure and saves it to `apps/frontend/assets/models/minicpm5_graph_meta.json`.
- This metadata file allows the frontend (React Native/Node.js) to replicate the AI's intent classification completely on-device without needing a backend server call.

**How to run**:
```bash
python scripts/export_onnx_meta.py
```

## 6. test_ondevice_intent.js
**Purpose**: A Node.js test script to validate the on-device inference logic using the exported ONNX metadata.

**Details**:
- Implements the exact same logic as the Python `MiniCPM5ONNXModel` natively in JavaScript.
- Handles Indic language detection (`hi`, `gu`, `en`) and parses Indian numeric words (e.g., 'chaalis', 'hazaar', 'लाख').
- Computes text embeddings using keyword centroids and executes the 2-layer neural network (hidden layer + logits) to classify the intent natively.
- Evaluates latency and confidence against test queries like "Mera balance kitna hai?" or "Pay chaalis rupaye for metro".

**How to run**:
```bash
node scripts/test_ondevice_intent.js
```

## 7. run-demo Scripts
**Purpose**: Orchestration scripts (`run-demo.ps1` for Windows PowerShell, `run-demo.sh` for Bash) used to validate and launch the backend for presentations.

**Details**:
- Validates AI Contracts and executes scenario simulations (`normal`, `financial-stress`).
- Invokes `run_voice.py` to ensure NLP features are active.
- Triggers pytest suite for experience contracts (`test_experience.py`).
- Finally, boots up the FastAPI backend via `uvicorn` on port 8000.

**How to run**:
```powershell
# Windows
.\scripts\run-demo.ps1

# Mac/Linux
./scripts/run-demo.sh
```

## 8. Quick Reference Table

| Script Name | Purpose | Command |
|-------------|---------|---------|
| `audit_and_verify_all.py` | Runs 39 exhaustive system checks | `python scripts/audit_and_verify_all.py` |
| `generate_seed_data.py` | Synthesizes 1200+ users & 65k txns | *(Imported module)* |
| `seed_database.py` | Batched PostgreSQL population | `python scripts/seed_database.py` |
| `export_onnx_meta.py` | Dumps ONNX weights to JSON | `python scripts/export_onnx_meta.py` |
| `test_ondevice_intent.js` | Tests JS neural network logic | `node scripts/test_ondevice_intent.js` |
| `run-demo.ps1` | Validates & starts Demo (Win) | `.\scripts\run-demo.ps1` |
| `run-demo.sh` | Validates & starts Demo (Unix) | `./scripts/run-demo.sh` |
