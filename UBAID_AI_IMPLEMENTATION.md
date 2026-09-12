# VZEYA — Ubaid AI Implementation Brief

## Role

**Owner:** Ubaid Khan  
**Responsibility:** AI/ML + on-device SLM / voice intelligence

Your job is to build the intelligence layer that turns banking/customer data into **general reusable customer signals and customer state**, plus the **on-device vernacular voice interface**.

You are **not** responsible for the frontend, backend API orchestration, database, or arbitrary UI generation.

The core principle for the whole implementation is:

> **DATA → FEATURES → SIGNALS → CUSTOMER STATE → RECOMMENDATION → EXPERIENCE**

Do not build the AI around individual hardcoded life events such as `vehicle_purchase_detected`. Vehicle purchase is only one possible example of what the system may infer.

---

# 1. What You Are Building

You have two separate AI responsibilities.

## A. Backend Customer Intelligence

This is the heavier AI/ML layer.

It should analyze:

- transaction history
- spending categories
- merchant patterns
- frequency and recency
- salary/income patterns
- recurring payments
- EMI/loan behaviour
- savings trends
- investment activity
- other customer/profile signals supplied by the backend

and produce:

1. reusable features
2. behavioural/life-stage/financial signals
3. a structured customer state
4. recommendation candidates / next-best-actions
5. human-readable explanations for important decisions

## B. On-Device Voice Intelligence

Use a small local model such as **MiniCPM5** for the prototype.

Its job is **not** to approve loans or make financial decisions.

It should handle:

- voice-based navigation
- vernacular intent detection
- natural-language banking requests
- local/private conversational interaction
- converting trusted structured banking results into natural responses

Principle:

> **Backend AI understands the customer. The on-device AI understands how the customer wants to interact.**

---

# 2. Repo Ownership

You own **only** the following area:

```text
ai/
├── intelligence/
│   ├── features/
│   ├── signals/
│   ├── customer_state/
│   ├── recommendations/
│   └── explanations/
│
├── voice/
│   ├── model/
│   ├── inference/
│   ├── intents/
│   └── prompts/
│
└── requirements.txt
```

Shared interfaces live here:

```text
contracts/
├── customer-state.schema.json
├── experience.schema.json
└── voice-intent.schema.json
```

**Do not move AI implementation into `apps/backend/` or `apps/frontend/`.**

Harsh owns the backend and consumes your outputs.

Lakshya owns the frontend and consumes Harsh's `ExperienceConfig`.

---

# 3. Strict Boundaries

## You SHOULD touch

```text
ai/**
contracts/customer-state.schema.json
contracts/voice-intent.schema.json
```

## You SHOULD NOT touch unless the team explicitly agrees

```text
apps/frontend/**
apps/backend/**
data/**
contracts/experience.schema.json
```

Do not modify shared contracts casually. If the schema must change, tell Harsh first.

---

# 4. AI Architecture

Your complete pipeline should look like this:

```text
                  CUSTOMER DATA
                       │
                       ▼
                Feature Extraction
                       │
                       ▼
                  Signal Engine
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
          Behaviour  Life-stage Financial/Risk
             │         │         │
             └─────────┼─────────┘
                       ▼
                 CUSTOMER STATE
                       │
                       ▼
             Recommendation Engine
                       │
                       ▼
                Structured Output
                       │
                       ▼
                  Harsh Backend
                       │
                       ▼
              Adaptive Experience API
```

Separate pipeline:

```text
             USER VOICE
                  │
                  ▼
          Local speech processing
                  │
                  ▼
              MiniCPM5 SLM
                  │
                  ▼
           Structured VoiceIntent
                  │
                  ▼
             Harsh Backend
                  │
                  ▼
          Trusted banking result
                  │
                  ▼
              MiniCPM5 SLM
                  │
                  ▼
       Vernacular conversational response
```

---

# 5. General-Purpose Signal Engine

## Very important

Do **not** implement this as a set of unrelated detectors:

```python
if vehicle_purchase:
    show_fastag()
if metro_user:
    show_metro()
```

Instead, build a reusable feature/signal layer.

Example:

```text
raw transaction
    ↓
merchant/category normalization
    ↓
recency/frequency/amount features
    ↓
trend detection
    ↓
customer signal
```

The same pipeline can detect many different patterns without having to rewrite the system for each one.

---

# 6. Feature Extraction

Create reusable features from transactions and customer data.

Suggested feature groups:

## Transaction frequency

- transaction count by category
- transaction count by merchant
- average transactions per week/month
- recurring transaction frequency

## Monetary features

- average spend
- median spend
- category spend share
- month-over-month change
- income-to-expense ratio
- EMI-to-income ratio

## Temporal features

- weekday vs weekend patterns
- salary-day patterns
- recent activity
- recurring due-date proximity

## Trend features

- spending increasing/decreasing
- savings increasing/decreasing
- debt pressure increasing/decreasing
- category behaviour drift

## Recurring features

- recurring bills
- recurring subscriptions
- recurring EMI
- recurring salary
- recurring merchant relationships

The objective is to expose **stable, reusable features** to the signal layer.

---

# 7. Signal Types

Signals should be generic and composable.

Possible categories:

## Behavioural

Examples:

```text
metro_usage = high
upi_usage = high
food_delivery_frequency = high
travel_frequency = high
subscription_load = medium
```

## Life-stage/contextual

Examples:

```text
new_salary_pattern
vehicle_related_activity
home_related_activity
education_related_activity
family_expense_growth
travel_context
```

These should represent model confidence/probability or a structured state, not absolute claims when evidence is weak.

## Financial health

Examples:

```text
income_stability = high
savings_trend = declining
debt_pressure = high
emi_pressure = medium
cashflow_volatility = high
```

## Risk

Examples:

```text
transaction_anomaly = elevated
behaviour_drift = elevated
missed_emi_risk = elevated
financial_stress = elevated
```

## Product relevance

Examples:

```text
investment_relevance = high
insurance_relevance = medium
savings_product_relevance = high
credit_relevance = low
```

These are **candidate relevance signals**, not autonomous approval decisions.

---

# 8. Customer State

The output of your intelligence pipeline should be a structured `CustomerState`.

Use the shared schema:

```text
contracts/customer-state.schema.json
```

Target shape:

```json
{
  "customer_id": "C001",
  "financial_health": "stable",
  "signals": {
    "transport": {
      "metro_frequency": "high"
    },
    "financial": {
      "income_stability": 0.92,
      "savings_trend": -0.18,
      "debt_pressure": 0.24
    }
  },
  "life_stage": [
    "employed",
    "urban_commuter"
  ],
  "risk_signals": [],
  "recommendations": []
}
```

Keep this structured and explainable.

Avoid returning a giant blob of unstructured LLM text.

---

# 9. Recommendation / Next-Best-Action

The recommendation engine should **not** simply maximize product sales.

Use a layered approach:

```text
Eligibility / safety
        ↓
Customer benefit / suitability
        ↓
Context + timing
        ↓
Relevance score
        ↓
Commercial score (only if appropriate)
```

For the hackathon, implement a hybrid of deterministic rules + lightweight scoring/ML.

You do NOT need to train a massive model.

The judges care much more about showing that the decision is:

- customer-specific
- explainable
- technically plausible
- beneficial rather than predatory

Example:

```text
healthy finances + investment behaviour
    → investment-related action can rank higher
```

versus:

```text
declining savings + increasing EMI pressure
    → new borrowing should be deprioritized
    → financial-health/support actions should rank higher
```

The model should therefore be able to produce both:

```text
recommended
```

and:

```text
deprioritized
```

signals.

---

# 10. Explainability

For each important recommendation or UI change, produce a compact structured explanation.

Example:

```json
{
  "action": "fastag",
  "score": 0.87,
  "reasons": [
    "high recent transport-related activity",
    "recent vehicle-related spending"
  ]
}
```

Another:

```json
{
  "action": "personal_loan",
  "decision": "deprioritize",
  "reasons": [
    "savings trend declining",
    "EMI pressure elevated"
  ]
}
```

Lakshya can display these explanations in the UI.

Do not rely on free-form LLM reasoning as the only explanation.

---

# 11. Demo Scenarios

The engine should support multiple scenarios without hardcoding a different detector for each.

At minimum, make the same pipeline capable of producing these different customer states:

## Scenario A — Everyday commuter

Signals:

- high metro activity
- high UPI activity
- stable income
- healthy savings

Potential outcome:

- Metro promoted
- UPI promoted
- routine financial summary

## Scenario B — Major life/context change

Signals can represent a recent large change in spending/merchant patterns.

Potential outcome:

- newly relevant actions appear
- old low-value actions move away
- contextual reminder/assistance appears

The change could represent vehicle, home, education, travel, family, etc. The engine should not depend on one specific event.

## Scenario C — Financial stress

Signals:

- declining savings
- higher discretionary spending
- higher EMI pressure
- missed/late payment

Potential outcome:

- financial health moves to top priority
- payment management is surfaced
- new borrowing is deprioritized
- supportive guidance becomes prominent

## Scenario D — Investment-oriented customer

Signals:

- stable income
- positive savings trend
- repeated investment transfers
- low debt pressure

Potential outcome:

- relevant investment/savings actions become prominent
- financial insights adapt accordingly

---

# 12. Do NOT Build Individual Event Detectors

Avoid this:

```python
class VehiclePurchaseDetector:
    ...

class MetroDetector:
    ...

class MarriageDetector:
    ...
```

unless a detector is genuinely a reusable part of a broader signal framework.

Prefer:

```text
TransactionNormalizer
        ↓
FeatureExtractor
        ↓
PatternDetector
        ↓
SignalRegistry
        ↓
CustomerStateBuilder
```

This architecture is much easier to expand during and after the hackathon.

---

# 13. On-Device SLM

## Objective

Use a local SLM such as MiniCPM5 for **voice-first, vernacular interaction**.

The model is not a bank decision engine.

It should turn natural speech into structured intents and turn trusted backend results into natural responses.

---

# 14. VoiceIntent Contract

Use:

```text
contracts/voice-intent.schema.json
```

Target format:

```json
{
  "intent": "CHECK_EMI",
  "language": "gu",
  "entities": {}
}
```

Possible intents for the MVP:

```text
CHECK_EMI
CHECK_BALANCE
PAY_BILL
NAVIGATE
EXPLAIN_RECOMMENDATION
SHOW_FINANCIAL_HEALTH
```

You only need 3–4 working intents for the live demo.

Prioritize:

1. `CHECK_EMI`
2. `EXPLAIN_RECOMMENDATION`
3. `PAY_BILL` or another simple banking action
4. `NAVIGATE`

---

# 15. Voice Flow

Example:

User:

> “Mara EMI nu payment kyare che?”

Device:

```text
voice
 ↓
local speech processing
 ↓
MiniCPM5
 ↓
{
  "intent": "CHECK_EMI",
  "language": "gu"
}
```

Send the structured intent to Harsh's backend.

Backend returns the trusted data, e.g.:

```json
{
  "amount": 12400,
  "due_date": "2026-09-16"
}
```

MiniCPM5 then produces a natural response in the user's language.

Example:

> “Tamāru EMI ₹12,400 chhe ane 16 September e due chhe.”

The exact wording can be adjusted during implementation.

---

# 16. Do Not Send Sensitive Raw Data to the SLM

The SLM should generally receive **minimal structured context**, not the customer's complete transaction history.

Good:

```json
{
  "intent": "EXPLAIN_RECOMMENDATION",
  "action": "fastag",
  "reasons": [
    "frequent transport activity",
    "recent vehicle-related activity"
  ]
}
```

Bad:

```json
{
  "entire_transaction_history": [...],
  "full_customer_profile": {...},
  "account_details": {...}
}
```

The backend remains the source of truth for financial facts.

The SLM is a private interaction layer.

---

# 17. Model Strategy for the Hackathon

Do not spend the entire hackathon training a foundation model.

Recommended approach:

```text
Deterministic preprocessing
        +
Lightweight ML / scoring
        +
Rules for safety
        +
SLM for language / intent / explanation
```

The prototype should demonstrate the architecture and customer value.

Model accuracy should be good enough for the controlled demo dataset.

Use synthetic data for the prototype rather than real customer financial data.

---

# 18. Implementation Order

Work in this order.

## Phase 1 — Contracts

1. Read and freeze `customer-state.schema.json`.
2. Read and freeze `voice-intent.schema.json`.
3. Do not change them casually.

## Phase 2 — Features

Implement:

```text
ai/intelligence/features/
```

Start with transaction normalization and reusable statistical features.

## Phase 3 — Signals

Implement:

```text
ai/intelligence/signals/
```

Generate behavioural, life-stage/context, financial-health and risk signals.

## Phase 4 — Customer State

Implement:

```text
ai/intelligence/customer_state/
```

Convert signals into the shared structured state.

## Phase 5 — Recommendations

Implement:

```text
ai/intelligence/recommendations/
```

Return ranked candidate actions + reasons + deprioritized actions.

## Phase 6 — Explanations

Implement:

```text
ai/intelligence/explanations/
```

Keep explanations structured and short.

## Phase 7 — Voice

Implement:

```text
ai/voice/model/
ai/voice/inference/
ai/voice/intents/
```

Get one vernacular end-to-end voice path working first.

## Phase 8 — Integration

Give Harsh a clean output from AI:

```text
CustomerState
```

and clean voice output:

```text
VoiceIntent
```

Do not make Harsh import random files from inside your implementation.

---

# 19. Suggested Internal Python Structure

A practical starting structure:

```text
ai/
├── intelligence/
│   ├── features/
│   │   ├── transaction_features.py
│   │   ├── spending_features.py
│   │   └── trend_features.py
│   │
│   ├── signals/
│   │   ├── behavioral.py
│   │   ├── financial.py
│   │   ├── lifecycle.py
│   │   └── risk.py
│   │
│   ├── customer_state/
│   │   ├── builder.py
│   │   └── models.py
│   │
│   ├── recommendations/
│   │   ├── scorer.py
│   │   ├── rules.py
│   │   └── engine.py
│   │
│   └── explanations/
│       └── generator.py
│
├── voice/
│   ├── model/
│   ├── inference/
│   │   └── runner.py
│   ├── intents/
│   │   ├── schema.py
│   │   ├── classifier.py
│   │   └── handlers.py
│   └── prompts/
│
└── requirements.txt
```

Keep the implementation modular but do not over-engineer it.

---

# 20. Interface to Harsh

Harsh should not call ten AI functions.

Expose one clean entry point for customer intelligence.

For example:

```python
from ai.intelligence import build_customer_state

state = build_customer_state(customer_data)
```

And one clean voice entry point:

```python
from ai.voice import parse_voice_intent

intent = parse_voice_intent(audio_or_transcript)
```

The exact implementation is up to you, but keep the external interface small.

---

# 21. Local Test Fixtures

Create small AI fixtures so Harsh can test without waiting for the entire bank backend.

For example:

```text
ai/tests/fixtures/
├── commuter.json
├── healthy_investor.json
├── life_change.json
└── financial_stress.json
```

Every fixture should produce a different `CustomerState`.

This is critical for proving that the engine generalizes.

---

# 22. Minimum Definition of Done

Your work is considered complete only when all of these are true:

### Customer intelligence

- [ ] Raw transactions can be converted to reusable features.
- [ ] Features produce multiple categories of signals.
- [ ] Signals produce a structured `CustomerState`.
- [ ] Different customer datasets produce meaningfully different states.
- [ ] Recommendations are ranked rather than hardcoded to one event.
- [ ] Deprioritization is supported, not just promotion.
- [ ] Important decisions have structured reasons.

### Voice

- [ ] MiniCPM5/local SLM or equivalent local model runs in the intended environment.
- [ ] At least one vernacular voice interaction works end-to-end.
- [ ] Voice produces a structured `VoiceIntent`.
- [ ] The backend, not the SLM, supplies trusted banking data.
- [ ] The SLM can verbalize the returned result in the relevant language.

### Integration

- [ ] Harsh can consume your `CustomerState` without importing internal AI modules.
- [ ] Harsh can consume `VoiceIntent` without knowing the model internals.
- [ ] No frontend code exists in `ai/`.
- [ ] No bank/business logic is duplicated inside the SLM.

---

# 23. What You Should NOT Spend Time On

Do not spend the hackathon window on:

- training a foundation model
- building a perfect fraud model
- 50 different voice intents
- production-grade model serving
- full banking eligibility engines
- real customer data
- complex MLOps
- Kubernetes
- distributed inference
- huge datasets
- elaborate RAG unless it is directly needed

Build a **convincing intelligence prototype**, not a production bank AI stack.

---

# 24. The Demo You Need to Enable

The final product demo should be able to show:

```text
Customer transaction data
        ↓
AI derives signals
        ↓
Customer state changes
        ↓
Harsh's Experience Engine changes the UI
        ↓
Lakshya's interface visibly adapts
        ↓
Customer asks a vernacular voice question
        ↓
MiniCPM5 understands locally
        ↓
Backend returns trusted information
        ↓
MiniCPM5 explains it naturally
```

The strongest moment is when the audience sees:

> **same application + different customer state = different banking experience**

and then hears a vernacular voice interaction without needing to navigate through a traditional banking menu.

---

# 25. Non-Negotiable Product Principle

Never let the AI become a generic “loan seller”.

The system should be able to conclude:

```text
“Recommend this.”
```

but also:

```text
“Do not recommend this right now.”
```

because customer benefit, suitability and financial health come before commercial opportunity.

That distinction is a major part of what makes VZEYA different.

---

# Final One-Line Goal

> **Build a reusable AI engine that can look at arbitrary customer banking behaviour, infer what is happening in that customer's financial life, produce an explainable customer state and next-best-action, and provide a private vernacular voice interface on the device — without hardcoding the experience around a handful of demo scenarios.**
