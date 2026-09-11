# Monorepo Architecture & Team Ownership Boundaries

## 1. Hard Ownership Boundaries

To maximize parallel velocity during a high-stakes hackathon, **90% of files have exactly one owner**:

```
LAKSHYA
apps/frontend/**

HARSH
apps/backend/**

UBAID
ai/**

SHARED
contracts/**    ← Frozen JSON Schemas (Do not modify casually)
data/**         ← Seed files & Scenario definitions
docs/**         ← Documentation & Demo scripts
```

---

## 2. Dependency Direction: One-Way Only

```
                 contracts
                /    |    \
               /     |     \
              ↓      ↓      ↓
          FRONTEND  BACKEND   AI
                       ↑       |
                       └───────┘
```

1. **Ubaid (AI)** consumes customer data + scenarios and generates `customer-state.json` adhering to `contracts/customer-state.schema.json`.
2. **Harsh (Backend)** consumes `CustomerState` from Ubaid and translates it into `ExperienceConfig` adhering to `contracts/experience.schema.json`.
3. **Lakshya (Frontend)** consumes `ExperienceConfig` via API or the decoupled `apps/frontend/src/mock/experience.json`.

---

## 3. Decoupled Development Advantage

- **Lakshya** does not need Harsh's backend running to build the UI; he can develop against `apps/frontend/src/mock/experience.json`.
- **Ubaid** can run `python ai/intelligence/run.py --scenario normal` independently and verify the schema contract.
- **Harsh** can run unit tests in `apps/backend/tests/` independently and verify Pydantic models.
