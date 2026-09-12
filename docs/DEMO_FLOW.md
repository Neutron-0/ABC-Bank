# Hackathon Demo Presentation Script

## Demo Objective
Prove the same generic engine reacts to different customer signals. NOT a hardcoded demo.

## Pre-Demo Setup
```bash
# Terminal 1 - Backend
cd apps/backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd apps/frontend
npx expo start
```

## Demo Script

| Section | Duration | Description |
|---------|----------|-------------|
| **Opening** | 30s | "Most banking apps show 40+ icons. We asked: what if the app learned YOU?" |
| **State 1: Normal Customer** | 2 min | metro commuter, healthy finances, hero card shows metro payment |
| **State 2: Life Change/Medical** | 2 min | ₹48,200 hospital bill, hero changes to medical assistance, empathy first |
| **State 3: Financial Stress** | 2 min | DTI 0.58, stress detected, LOANS COMPLETELY SUPPRESSED, care & guidance |
| **State 4: Fraud Alert** | 1 min | ₹31,800 at 2:14 AM, security alert, instant freeze |
| **State 5: Surplus** | 1 min | bonus credited, smart savings recommendations |
| **Voice Demo** | 2 min | Hindi, Gujarati, English examples |
| **Architecture Walkthrough** | 1 min | |

**Total Timing:** ~13 minutes

## Scenario Switching Commands
```bash
# Normal
curl -X POST http://localhost:8000/scenario/switch -H "Content-Type: application/json" -d '{"scenario": "normal"}'

# Medical
curl -X POST http://localhost:8000/scenario/switch -H "Content-Type: application/json" -d '{"scenario": "medical"}'

# Stress
curl -X POST http://localhost:8000/scenario/switch -H "Content-Type: application/json" -d '{"scenario": "stress"}'

# Fraud
curl -X POST http://localhost:8000/scenario/switch -H "Content-Type: application/json" -d '{"scenario": "fraud"}'

# Surplus
curl -X POST http://localhost:8000/scenario/switch -H "Content-Type: application/json" -d '{"scenario": "surplus"}'
```

**Note:** All data is synthetic.
