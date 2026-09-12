# 🏛️ VZEYA — Adaptive Banking for Bharat

**AI-Powered Hyper-Personalized Banking Experience Layer** for HackOut'26 at DA-IICT.

> *"Instead of asking customers to learn their bank, make the bank learn the customer."*

VZEYA is a banking intelligence and experience layer that dynamically adapts the customer's mobile banking interface based on transaction history, financial health, life-stage signals, risk indicators, and interaction preferences — designed for Tier 2/3/4, rural, and vernacular-first users across Bharat.

---

## 🧭 Architecture at a Glance

```text
Bank Data → Feature Extraction → Signals → Customer State → Recommendations → Experience Config → Adaptive UI
```

Three interconnected systems:

| Layer | What it does | Tech |
|---|---|---|
| **Backend Intelligence** | Customer 360, signals, recommendations, experience orchestration | Python, FastAPI, Pydantic |
| **Adaptive Frontend** | Renders dynamic UI from ExperienceConfig | React Native, Expo 52, TypeScript, Zustand |
| **Voice Layer** | Vernacular intent detection (Hindi, Gujarati, English) | Python (MiniCPM5 planned) |

---

## 📁 Repository Structure

```text
apps/frontend/    → Lakshya (UI/UX, adaptive interface)
apps/backend/     → Harsh   (API, experience orchestration)
ai/               → Ubaid   (AI/ML, signals, voice)
contracts/        → Shared  (frozen JSON Schema interfaces)
data/             → Shared  (synthetic seed data & scenarios)
docs/             → Shared  (documentation)
scripts/          → Shared  (automation & demo runners)
```

---

## 👥 Team

| Member | Role | Ownership |
|---|---|---|
| **Harsh Solanki** | Team Lead, Backend | `apps/backend/`, system architecture, integration |
| **Panchal Lakshya** | Frontend | `apps/frontend/`, adaptive UI, animations, voice UI |
| **Ubaid Khan** | AI/ML | `ai/`, feature extraction, signals, recommendations, voice SLM |

---

## 🚀 Quick Start

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

### 4. Full Validation
```bash
python scripts/seed-data.py
python ai/intelligence/run.py --scenario normal
python ai/intelligence/run.py --scenario financial-stress
python ai/voice/run_voice.py --query "Pay Metro" --lang en
python apps/backend/tests/test_experience.py
cd apps/frontend && npx tsc --noEmit
```

---

## 📜 Core Contracts

| Contract | Producer → Consumer | Schema |
|---|---|---|
| CustomerState | Ubaid (AI) → Harsh (Backend) | [`customer-state.schema.json`](contracts/customer-state.schema.json) |
| ExperienceConfig | Harsh (Backend) → Lakshya (Frontend) | [`experience.schema.json`](contracts/experience.schema.json) |
| VoiceIntent | Ubaid (Voice) → Harsh (Backend) | [`voice-intent.schema.json`](contracts/voice-intent.schema.json) |

---

## 📚 Documentation

| Document | Description |
|---|---|
| [PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) | Problem statement, product vision, target users, principles |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Full system architecture with Mermaid diagrams |
| [REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md) | Folder ownership, dependency rules, merge-conflict avoidance |
| [DEVELOPMENT_WORKFLOW.md](docs/DEVELOPMENT_WORKFLOW.md) | Git workflow, branches, commit conventions, PR rules |
| [CONTRACTS.md](docs/CONTRACTS.md) | Interface contracts with example payloads |
| [DATA_MODEL.md](docs/DATA_MODEL.md) | Conceptual entities and relationships |
| [AI_ARCHITECTURE.md](docs/AI_ARCHITECTURE.md) | AI/ML pipeline, voice SLM, ethical guardrails |
| [DEMO_FLOW.md](docs/DEMO_FLOW.md) | Hackathon demo presentation script |
| [api.md](docs/api.md) | REST API endpoint reference |
| [AI_SYSTEM_GUIDE.md](AI_SYSTEM_GUIDE.md) | Complete AI agent reference guide |

---

## 📊 Implementation Status

| Component | Status | Owner |
|---|---|---|
| JSON Schema Contracts | ✅ Complete | Shared |
| Seed Data & Scenarios | ✅ Complete (5 scenarios) | Shared |
| AI Feature Extraction | ✅ Implemented (rule-based) | Ubaid |
| AI Signal Detection | ✅ Implemented (rule-based) | Ubaid |
| AI Recommendation Ranking | ✅ Implemented (with ethical suppression) | Ubaid |
| Voice Intent Classification | ✅ Implemented (rule-based, 3 languages) | Ubaid |
| Backend API (FastAPI) | ✅ Implemented | Harsh |
| Experience Composer | ✅ Implemented | Harsh |
| Backend Tests | ✅ Basic contract tests | Harsh |
| Frontend App (Expo) | ✅ Full UI with 5 scenario states | Lakshya |
| Offline State Bundles | ✅ Complete for all scenarios | Lakshya |
| MiniCPM5 SLM Integration | 🔲 Not started | Ubaid |
| Real ML Models | 🔲 Not started | Ubaid |
| Authentication | 🔲 Not started | Harsh |
| Database Integration | 🔲 Not started (using JSON files) | Harsh |

---

## ⚠️ Important Notes

- All customer data is **synthetic** — no real banking data is used
- The voice SLM is currently **rule-based** — MiniCPM5 integration is planned
- This is an **intelligence layer** over existing banking infrastructure, not a replacement
- When financial stress is detected, **loan promotions are strictly suppressed** (ethical guardrail)
- We do **not** claim full RBI/DPDP compliance — we demonstrate awareness and design intent
