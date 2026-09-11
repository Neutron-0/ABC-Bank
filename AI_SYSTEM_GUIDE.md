# 🧠 AI System Guide: ABC Bank (Adaptive Banking for Bharat)

> **FOR AI AGENTS & COLLABORATORS**: This document is the definitive single source of truth for the **ABC Bank** architecture. Read this file to understand the system mechanics, data contracts, AI pipelines, and mobile runtime without needing to reverse-engineer source code.

---

## 1. Executive Summary & Core Mandate

**ABC Bank** is an AI-powered, hyper-personalized mobile banking application engineered specifically for Bharat. Unlike conventional banking apps that display static dashboards of 40+ icons with an AI chatbot tacked onto the corner, **ABC Bank's UI re-architects itself dynamically based on customer state, life signals, transaction patterns, and cash flow health**.

### The Core Invariants
1. **Dynamic Composition**: The mobile client does not have hardcoded home screen layouts. The backend transmits an `ExperienceConfig` specifying prioritized modules, suppressed modules, hero cards, and quick actions.
2. **Ethical AI Guardrail (Non-Negotiable)**: When financial stress or debt burden is detected, the AI engine **strictly suppresses all loan promotions, credit card upsells, and overdraft nudges**. Instead, it surfaces emergency assistance, expense relief, and financial stability guidance.
3. **Vernacular & Multi-Modal**: First-class support for English (`en`), Hindi (`hi`), and Gujarati (`gu`), with voice intent classification that understands Hinglish and Gujarati colloquial expressions.
4. **Expo Go Compatible**: Runs out of the box on physical Android/iOS devices via Expo Go, with automatic LAN IP discovery and zero-latency offline fallback bundles for guaranteed judge demos.

---

## 2. Monorepo Ownership & Directory Blueprint

The repository is structured with hard ownership boundaries to enable parallel multi-agent development:

```text
d:/Vault/dau/
│
├── README.md                  # Project overview and quickstart
├── AI_SYSTEM_GUIDE.md         # THIS FILE: Master AI reference guide
├── contracts/                 # SHARED FROZEN CONTRACTS (JSON Schemas)
│   ├── customer-state.schema.json  # AI -> Backend contract
│   ├── experience.schema.json      # Backend -> Frontend UI contract
│   └── voice-intent.schema.json    # AI Voice -> Backend/UI contract
│
├── data/                      # SHARED GROUND TRUTH & SCENARIOS
│   ├── seed/
│   │   ├── customers.json          # Persona demographics & financial profile
│   │   └── transactions.json       # 90-day transaction history with tags
│   └── scenarios/
│       ├── normal.json             # Commuter habit (Metro 8:40 AM), positive cash flow
│       ├── life-change.json        # Unexpected medical shock (₹48,200 hospital bill)
│       └── financial-stress.json   # Critical EMI burden (DTI 0.62), loans suppressed
│
├── ai/                        # AI & DATA INTELLIGENCE (Ubaid)
│   ├── intelligence/
│   │   ├── features/extractor.py   # Computes burn rate, recurring habits, salary cycles
│   │   ├── signals/detector.py     # Detects commute habits, medical shocks, stress levels
│   │   ├── recommendations/ranker.py # Ethical ranker: suppresses loans in stress
│   │   ├── customer_state/generator.py # Generates JSON conforming to customer-state schema
│   │   └── run.py                  # CLI entrypoint: python ai/intelligence/run.py
│   └── voice/
│       ├── intents/handlers.py     # Intent dispatchers (PAY_METRO, CHECK_EMI, etc.)
│       ├── prompts/templates.py    # Vernacular reply templates (EN, HI, GU)
│       └── run_voice.py            # CLI entrypoint: python ai/voice/run_voice.py
│
├── apps/
│   ├── backend/               # FASTAPI EXPERIENCE API (Harsh)
│   │   ├── app/
│   │   │   ├── main.py             # FastAPI app with CORS & healthcheck
│   │   │   ├── api/routes.py       # REST endpoints: /experience, /customer, /scenario
│   │   │   ├── models/schemas.py   # Pydantic models mirroring contracts
│   │   │   ├── services/state_service.py # Loads scenarios & executes AI pipelines
│   │   │   └── experience/composer.py # Translates CustomerState -> ExperienceConfig
│   │   └── tests/
│   │       └── test_experience.py  # Automated contract verification tests
│   │
│   └── frontend/              # REACT NATIVE / EXPO APP (Lakshya)
│       ├── app.json                # Expo Go configuration (slug: abc-bank)
│       ├── App.tsx                 # Root entrypoint with Navigation & Theme
│       ├── src/
│       │   ├── api/experienceApi.ts# REST client with LAN auto-discovery
│       │   ├── state/customerStore.ts # Zustand/React state with OFFLINE_STATE_BUNDLES
│       │   ├── components/         # AdaptiveHeader, ContextCard, BottomNav, etc.
│       │   ├── features/           # Adaptive Home, Payments, Insights, Mitra AI
│       │   ├── i18n/               # Localization dictionaries (en, hi, gu)
│       │   ├── styles/theme.ts     # ABC Bank design tokens and colors
│       │   └── types/              # TypeScript interface definitions
│
├── docs/                      # ARCHITECTURAL DOCUMENTATION
│   ├── architecture.md        # One-way data flow diagram & design decisions
│   ├── api.md                 # REST API endpoints & payload specifications
│   └── demo-flow.md           # Live demonstration script for hackathon judges
│
└── scripts/                   # REPRODUCIBLE AUTOMATION SCRIPTS
    ├── seed-data.py           # Validates and initializes demo data
    ├── run-demo.sh            # Linux/macOS end-to-end verification script
    └── run-demo.ps1           # Windows PowerShell end-to-end verification script
```

---

## 3. The Three Universal Contracts

All components communicate through immutable JSON schemas in `contracts/`. No team or agent may modify these contracts without explicit multi-party coordination.

### Contract 1: `contracts/customer-state.schema.json`
* **Producer**: `ai/intelligence/`
* **Consumer**: `apps/backend/app/experience/composer.py`
* **Purpose**: Represents the full financial, behavioral, and psychological state of the user.

### Contract 2: `contracts/experience.schema.json`
* **Producer**: `apps/backend/app/experience/composer.py`
* **Consumer**: `apps/frontend/src/`
* **Purpose**: Instructs the mobile UI how to compose its screen in real-time.

### Contract 3: `contracts/voice-intent.schema.json`
* **Producer**: `ai/voice/run_voice.py`
* **Consumer**: `apps/backend/` and frontend `MitraChatScreen`
* **Purpose**: Normalized multi-lingual voice intents.

---

## 4. The 5 Real-World Adaptive Scenarios

The engine deterministically simulates 5 key life situations. An AI agent can trigger any scenario via REST (`POST /api/v1/scenario/switch`) or directly in the mobile UI's Prototype Lab.

| Scenario | Trigger Condition | Financial Health | UI Hero Element | Ethical Guardrail Effect |
| :--- | :--- | :--- | :--- | :--- |
| **`normal`** (Default) | Morning routine 8:40 AM, regular salary, healthy buffer | `thriving` (Score 84, DTI 0.18) | 1-Tap Metro QR/UPI card (₹40 Noida Sec 62) | Standard product exploration enabled |
| **`medical_event`** / `life-change` | Sudden ₹48,200 hospital transaction (Max Super Speciality) | `tighter_than_usual` (Score 72) | Medical claim filing & tax rebate (Section 80D) | Suppresses investment pitches; highlights health buffer |
| **`financial_stress`** | High EMI burden (DTI 0.62, commitments ₹32k), low balance | `stress` (Score 38) | Budget stabilization & flexible EMI repayment helper | **STRICT LOAN SUPPRESSION**: Loans, credit cards, OD offers completely removed |
| **`fraud_alert`** | Unrecognized midnight online transaction ₹35,000 | `stable` (Anomaly score 88) | Instant Biometric Freeze & Dispute Resolution card | All marketing suppressed; security banner locked to top |
| **`surplus`** | Surplus ₹62,000 after quarterly bonus / savings accumulation | `thriving` (Score 94) | Liquid Auto-Sweep & high-yield recurring deposit card | Surfaces passive wealth building without lock-ins |

---

## 5. Mobile Runtime & Expo Go Compatibility

### Host IP Auto-Resolution Architecture
When testing on a physical phone running Expo Go over local Wi-Fi, `localhost` points to the phone itself rather than your development machine. The app solves this automatically in `apps/frontend/src/services/api.ts`:
- Reads `EXPO_PUBLIC_API_URL` if explicitly set.
- Extracts host LAN IP dynamically from Expo Go bundler connection (`Constants.expoConfig?.hostUri`).
- Forms `http://<hostIp>:8000/api/v1`.

### Guaranteed Offline Resilience (`OFFLINE_STATE_BUNDLES`)
If the mobile device is disconnected from the local network, `apps/frontend/src/state/customerStore.ts` contains full offline mock bundles for all 5 scenarios. The app never crashes, hangs, or shows a blank screen.

### Testing the Mobile App
```bash
cd apps/frontend
npx expo start
```
Scan the displayed QR code using the **Expo Go app** on any Android or iOS device connected to the same Wi-Fi network.

---

## 6. Testing & Validation Commands

All AI agents must verify that tests pass before pushing any modifications:

```bash
# 1. Verify all frozen JSON schemas & seed data
python scripts/seed-data.py

# 2. Verify AI state generation for normal and stress states
python ai/intelligence/run.py --scenario normal
python ai/intelligence/run.py --scenario financial-stress

# 3. Verify multilingual voice intent classifier
python ai/voice/run_voice.py --query "Mera metro recharge karo" --lang hi

# 4. Verify backend experience composer & ethical suppression unit tests
python apps/backend/tests/test_experience.py

# 5. Verify TypeScript compiler (0 errors strictly required)
cd apps/frontend && npx tsc --noEmit
```

---

## 7. Ethical AI Decision Logic: How Loans Are Suppressed

The ethical recommendation ranker resides in `ai/intelligence/recommendations/ranker.py`:
- When debt-to-income exceeds 0.40 OR financial stress is high/critical:
- The ranker eliminates all loan products (`personal_loan`, `credit_card`, `payday_advance`).
- Replaces them with emergency liquidity buffers and financial stabilization advice.
- Complies with RBI fair-practice directives for digital lending.

---

## 8. Summary for Future AI Agents
* **Do NOT** bypass the JSON schemas in `contracts/`.
* **Do NOT** add hardcoded static card arrays in the React Native screens. All attention stacks must render from `currentExperience` or `customerStore`.
* **Do NOT** re-introduce personal loan recommendations into the `financial-stress` scenario.
* **DO** run `npx tsc --noEmit` and `python apps/backend/tests/test_experience.py` whenever touching code.
