# ABC Bank / VZEYA -- Adaptive Banking for Bharat

**AI-Powered Hyper-Personalized Banking Experience Layer** for HackOut'26 at DA-IICT.

> *"Instead of asking customers to learn their bank, make the bank learn the customer."*

ABC Bank (VZEYA) is an intelligence and experience layer that dynamically adapts the customer's mobile banking interface based on transaction history, cash-flow pulse, life-stage signals, risk indicators, and interaction preferences -- designed for Tier 1 to Tier 4, rural, and vernacular-first users across Bharat.

---

## Architecture at a Glance

```text
Bank Data -> Feature Extraction -> Signals -> Customer State -> Recommendations -> Experience Config -> Adaptive UI
```

Three interconnected systems:

| Layer | What it does | Tech |
|---|---|---|
| **Backend Intelligence** | Customer 360, signals, recommendations, experience orchestration | Python, FastAPI, Pydantic |
| **Adaptive Frontend** | Renders dynamic UI from ExperienceConfig | React Native, Expo (SDK 57), TypeScript, Zustand |
| **Voice Layer** | Vernacular intent detection & on-device SLM verbalizer (Hindi, Gujarati, English) | Python (MiniCPM-5 INT4 Edge SLM) |

---

## Repository Structure

```text
apps/frontend/    -> Lakshya (UI/UX, adaptive interface)
apps/backend/     -> Harsh   (API, experience orchestration)
ai/               -> Ubaid   (AI/ML, signals, recommendations, voice SLM)
contracts/        -> Shared  (frozen JSON Schema interfaces)
data/             -> Shared  (synthetic seed data & scenarios)
docs/             -> Shared  (documentation)
scripts/          -> Shared  (automation & demo runners)
```

---

## Team Ownership Structure

| Member | Role | Ownership |
|---|---|---|
| **Harsh Solanki** | Team Lead, Backend | apps/backend/, system architecture, integration |
| **Panchal Lakshya** | Frontend | apps/frontend/, adaptive UI, animations, voice UI |
| **Ubaid Khan** | AI/ML | ai/, feature extraction, signals, recommendations, voice SLM |

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Expo Go app on phone (for mobile testing)

### 1. Backend (Harsh)
```bash
pip install -r apps/backend/requirements.txt
uvicorn apps.backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

### 2. Frontend (Lakshya)
```bash
cd apps/frontend
npm install
npx expo start
```
Scan QR code with Expo Go on your phone.

### 3. AI Pipeline (Ubaid)
```bash
pip install -r ai/requirements.txt
python ai/intelligence/run.py --scenario normal
python ai/voice/run_voice.py --query "Pay Metro" --lang en
```

### 4. Full Validation Suite
```bash
# 1. Comprehensive AI Intelligence & Voice Test Suite (45 tests, 0.39s)
pytest ai/tests/ -v

# 2. Seed data & contract verification
python scripts/seed-data.py

# 3. AI scenario generations
python ai/intelligence/run.py --scenario normal
python ai/intelligence/run.py --scenario financial-stress

# 4. Multilingual voice intent classifier
python ai/voice/run_voice.py --query "Pay Metro" --lang en

# 5. Backend experience composer & safety policy tests
python apps/backend/tests/test_experience.py

# 6. Frontend TypeScript validation
cd apps/frontend && npx tsc --noEmit
```

---

## Core Contracts

| Contract | Producer -> Consumer | Schema |
|---|---|---|
| CustomerState | Ubaid (AI) -> Harsh (Backend) | [`customer-state.schema.json`](contracts/customer-state.schema.json) |
| ExperienceConfig | Harsh (Backend) -> Lakshya (Frontend) | [`experience.schema.json`](contracts/experience.schema.json) |
| VoiceIntent | Ubaid (Voice) -> Harsh (Backend) | [`voice-intent.schema.json`](contracts/voice-intent.schema.json) |

---

## Documentation

| Document | Description |
|---|---|
| [PERSONALIZATION_SYSTEM_GUIDE.md](PERSONALIZATION_SYSTEM_GUIDE.md) | Complete hyper-personalization guide, math formulas, DPDP & RBI compliance, dual-cadence, benchmarks |
| [BHARAT_BANKING_SERVICES_MASTER_TAXONOMY.md](BHARAT_BANKING_SERVICES_MASTER_TAXONOMY.md) | Comprehensive taxonomy of 55+ Indian banking services, triggers, and eligibility gates |
| [AI_SYSTEM_GUIDE.md](AI_SYSTEM_GUIDE.md) | Complete AI agent architecture and runtime guide |
| [PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) | Problem statement, product vision, target users, principles |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Full system architecture with Mermaid diagrams |
| [REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md) | Folder ownership, dependency rules, merge-conflict avoidance |
| [DEVELOPMENT_WORKFLOW.md](docs/DEVELOPMENT_WORKFLOW.md) | Git workflow, branches, commit conventions, PR rules |
| [CONTRACTS.md](docs/CONTRACTS.md) | Interface contracts with example payloads |
| [DATA_MODEL.md](docs/DATA_MODEL.md) | Conceptual entities and relationships |
| [AI_ARCHITECTURE.md](docs/AI_ARCHITECTURE.md) | AI/ML pipeline, voice SLM, ethical guardrails |
| [DEMO_FLOW.md](docs/DEMO_FLOW.md) | Hackathon demo presentation script |
| [api.md](docs/api.md) | REST API endpoint reference |

---

## Implementation Status

| Component | Status | Owner | Details |
|---|---|---|---|
| JSON Schema Contracts | Complete | Shared | Frozen schemas for state, experience, and voice |
| Seed Data & Scenarios | Complete | Shared | 5 comprehensive adaptive scenarios |
| Multi-Source Data Harmonizer | Production-Ready | Ubaid | Ingestion & sanitization for 7 dirty feeds (CBS, UPI, SMS, CIBIL, BBPS, NCMC, KYC) |
| Vectorized Feature Extractor | Production-Ready | Ubaid | 32 single-pass metrics, cash-flow forecast, 50/30/20 spend breakdown |
| Multi-Factor Personalization Engine | Production-Ready | Ubaid | Affordability (30%), Lifecycle (30%), Urgency (25%), Archetype (15%) - Risk |
| Dual-Cadence Processing | Production-Ready | Ubaid | 14-day heavy batch + sub-millisecond micro-triggers (0.162ms) |
| Cryptographic Audit Ledger | Production-Ready | Ubaid | Immutable SHA-256 decision chain & plain-language counterfactual cards |
| Ethical AI Guardrail | Production-Ready | Ubaid | Complete loan suppression under debt stress (DTI > 0.40) |
| Voice Intent & MiniCPM-5 SLM | Production-Ready | Ubaid | Isolated edge conversational interface (Hindi, Gujarati, English) |
| AI Automated Test Suite | Verified | Ubaid | 45 of 45 tests passing in 0.39s (`pytest ai/tests/ -v`) |
| Backend API (FastAPI) | Implemented | Harsh | REST routes, CORS, healthcheck, scenario switcher |
| Experience Composer | Implemented | Harsh | SafetyPolicyFilter & dynamic module composition |
| Frontend App (Expo SDK 57) | Complete | Lakshya | Dynamic attention stack, adaptive cards, fluid animations |
| Offline State Bundles | Complete | Lakshya | Instant offline resilience for all 5 scenarios |

---

## Key Principles

- **Data Privacy & Localization**: Encrypted, local processing complying with RBI Data Localization Circular (2018) and DPDP Act 2023.
- **Strict Architecture Decoupling**: MiniCPM-5 Voice SLM handles conversational speech queries only; personal recommendations are 100% deterministic and mathematical.
- **Privacy-First UX**: Granular spending data operates strictly as internal telemetry to calibrate protective services (auto-sweep FDs, tax savers, Safe-to-Spend buffer), and is never displayed as an invasive lifestyle ledger.
- **Ethical AI Shield**: When financial stress or high debt-to-income is detected, loan offers are strictly eliminated and replaced by cash-flow stabilization support.
