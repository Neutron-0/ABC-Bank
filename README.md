# 🏛️ ABC Bank — Adaptive Banking for Bharat

AI-Powered Hyper-Personalized Mobile Banking Prototype for Bharat. Designed with **hard ownership boundaries**, **contracts-first architecture**, and **100% Expo Go compatibility**.

> **AI AGENTS**: Read [`AI_SYSTEM_GUIDE.md`](./AI_SYSTEM_GUIDE.md) for complete technical architecture, contracts, state machines, and execution instructions.

---

## 👥 Team Ownership Structure

```text
LAKSHYA
apps/frontend/**

HARSH
apps/backend/**

UBAID
ai/**

SHARED
contracts/**    ← Frozen JSON Schemas (Do not modify casually)
data/**         ← Seed files & Scenario definitions
docs/**         ← Architecture & API specifications
scripts/**      ← Automation & Demo runners
```

---

## 📁 Repository Layout

```text
.
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── .github/
│   └── CODEOWNERS                # Hard ownership declarations
│
├── apps/
│   ├── frontend/                 # LAKSHYA ONLY (React Native / Expo)
│   │   ├── src/
│   │   │   ├── components/       # AdaptiveHeader, BalanceHeader, ContextCard
│   │   │   ├── screens/          # Home, Payments, Activity, Insights, Mitra, Profile
│   │   │   ├── animations/       # Fluid layout & card transitions
│   │   │   ├── hooks/            # useExperience hook
│   │   │   ├── api/              # experienceApi client
│   │   │   ├── mock/
│   │   │   │   └── experience.json # Decoupled mock contract for zero-dependency UI dev
│   │   │   └── styles/           # Centralized Bharat fintech theme
│   │   └── package.json
│   │
│   └── backend/                  # HARSH ONLY (FastAPI / Python)
│       ├── app/
│       │   ├── api/              # REST routes (/experience, /customer, /scenario, /voice)
│       │   ├── services/         # StateService
│       │   ├── models/           # Pydantic models from contracts
│       │   ├── db/               # DataLoader for seeds and scenarios
│       │   ├── experience/       # ExperienceComposer (translates State -> UI config)
│       │   └── main.py           # FastAPI entrypoint
│       ├── tests/                # Contract verification tests
│       └── requirements.txt
│
├── ai/                            # UBAID ONLY (Python AI & Voice)
│   ├── intelligence/
│   │   ├── features/             # FeatureExtractor (transaction metrics)
│   │   ├── signals/              # SignalDetector (commute, medical, stress)
│   │   ├── customer_state/       # CustomerStateGenerator
│   │   ├── recommendations/      # Ethical RecommendationRanker (loan suppression)
│   │   ├── explanations/         # Explainer ("Why am I seeing this?")
│   │   └── run.py                # CLI runner: scenario -> customer-state.json
│   │
│   ├── voice/
│   │   ├── model/                # Voice model adapter
│   │   ├── inference/            # Intent classifier
│   │   ├── intents/              # Intent handlers (PAY_METRO, CHECK_EMI, etc.)
│   │   ├── prompts/              # Vernacular prompts (EN, HI, GU)
│   │   └── run_voice.py          # CLI runner: utterance -> voice-intent.json
│   │
│   └── requirements.txt
│
├── contracts/                     # SHARED FROZEN INTERFACES
│   ├── customer-state.schema.json # Ubaid -> Harsh contract
│   ├── experience.schema.json     # Harsh -> Lakshya contract
│   └── voice-intent.schema.json   # Ubaid -> Harsh contract
│
├── data/
│   ├── seed/
│   │   ├── customers.json
│   │   └── transactions.json
│   └── scenarios/
│       ├── normal.json           # Metro 8:40 AM habit, stable surplus
│       ├── life-change.json      # Large ₹48.2k hospital expense
│       └── financial-stress.json # High EMI burden, loans suppressed
│
├── docs/
│   ├── architecture.md           # Deep dive into one-way data flow
│   ├── api.md                    # FastAPI endpoints reference
│   └── demo-flow.md              # Judge presentation script & state walkthrough
│
└── scripts/
    ├── seed-data.py              # Data initialization script
    ├── run-demo.sh               # Bash demo execution script
    └── run-demo.ps1              # Windows PowerShell demo script
```

---

## 📜 The Core Contracts

1. **`contracts/customer-state.schema.json`**:
   - **Producer**: Ubaid (`ai/`)
   - **Consumer**: Harsh (`apps/backend/`)
   - Validates customer financial health, behavioral signals, and ethical recommendations.

2. **`contracts/experience.schema.json`**:
   - **Producer**: Harsh (`apps/backend/`)
   - **Consumer**: Lakshya (`apps/frontend/`)
   - Defines `primary_actions`, `priority_modules`, `deprioritized_modules`, and `hero_card`.

3. **`contracts/voice-intent.schema.json`**:
   - **Producer**: Ubaid (`ai/voice/`)
   - **Consumer**: Harsh (`apps/backend/`)
   - Handles multi-lingual voice requests (`PAY_METRO`, `CHECK_EMI`, `MEDICAL_CLAIM_HELP`).

---

## 🚦 How to Run

### 1. Run Data & Contract Validation
```bash
python scripts/seed-data.py
python ai/intelligence/run.py --scenario normal
python ai/intelligence/run.py --scenario financial-stress
python ai/voice/run_voice.py --query "मेरी मेट्रो का भुगतान करो" --lang hi
python apps/backend/tests/test_experience.py
```

### 2. Start Backend (Harsh)
```bash
uvicorn apps.backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`
- Experience Endpoint: `http://localhost:8000/api/v1/experience/cust_bharat_001`

### 3. Start Frontend Mobile App (Lakshya)
```bash
cd apps/frontend

# For Mobile Testing on Physical Phone (Expo Go)
npx expo start
# -> Scan the QR code using the Expo Go app on iOS/Android

# Or for Web Browser Testing
npm run web
```
