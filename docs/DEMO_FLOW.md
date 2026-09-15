# Hackathon Demo Presentation Script

## Demo Objective
Prove the same generic engine reacts to different customer signals. NOT a hardcoded demo. Show the adaptive, hyper-personalized nature of the ABC Bank platform.

## Pre-Flight Verification Checklist
Before the judges arrive, ensure the environment is pristine:
1. **Database Seeded**: Verify PostgreSQL is running and `python scripts/seed_database.py` has completed successfully.
2. **Backend Running**: Terminal 1 should show Uvicorn listening on port 8000.
3. **Frontend Connected**: Terminal 2 running Expo, physical device connected via Expo Go (same WiFi).
4. **Initial State**: Ensure the backend is in the 'normal' state. Check by hitting `curl -X GET http://localhost:8000/scenario/current`.

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
| **State 1: Normal Customer** | 2 min | Metro commuter, healthy finances. Hero card shows metro payment. |
| **State 2: Life Change/Medical** | 2 min | ₹48,200 hospital bill. Hero changes to medical assistance, empathy first. |
| **State 3: Financial Stress** | 2 min | DTI 0.58, stress detected. LOANS COMPLETELY SUPPRESSED, care & guidance. |
| **State 4: Fraud Alert** | 1 min | ₹31,800 at 2:14 AM. Security alert, instant freeze. |
| **State 5: Surplus** | 1 min | Bonus credited, smart savings recommendations. |
| **Voice Demo** | 2 min | Hindi, Gujarati, English examples on-device NLP. |
| **Architecture Walkthrough**| 1 min | 3-domain structure, schema contracts, ONNX model. |

**Total Timing:** ~13 minutes

### Detailed Scenario Walkthrough & Talking Points

#### State 1: Normal Customer
**Talking Point:** "Here is Rahul. The app knows it's 8:40 AM and he commutes from Noida Sec 62. Instead of digging for UPI, the app brings his routine to the surface."
**UI State:** 
- Hero Card: "Your 8:40 AM Metro Commute" with a 1-tap "Pay ₹40" button.
- Accent Color: Blue (`#2563EB`).
- Modules: Commute Habit, Upcoming EMI, Smart Savings.

#### State 2: Life Change/Medical
**Talking Point:** "A massive ₹48,200 transaction hits at a hospital. The engine instantly recalculates his state. Notice how the app transforms—it shifts from transactions to empathy."
**UI State:** 
- Hero Card: Medical Claim Assistance.
- Context Cards: Immediate access to health insurance details.
- Deprioritized: Discretionary spend offers are hidden.

#### State 3: Financial Stress
**Talking Point:** "Rahul's Debt-to-Income (DTI) ratio hits 0.58. The RBI Fair Practice Code triggers our anti-predatory shield. You won't see a single loan offer on this screen. Instead, we offer cash flow guidance."
**UI State:**
- Hero Card: "Cash Flow Guidance Active" with orange accent (`#D97706`).
- Modules: Cashflow Advisory, Obligations Planner.
- Suppressed: Personal Loans, Credit Cards entirely removed.

#### State 4: Fraud Alert
**Talking Point:** "An anomalous transaction occurs at 2:14 AM. The app enters lockdown mode."
**UI State:**
- Hero Card: Security Alert with red accent.
- Action: "Lock Card & Dispute" front and center.
- Entire UI locked down until the user resolves the alert.

#### State 5: Surplus
**Talking Point:** "Rahul gets his annual bonus. The app switches to wealth-building mode, suggesting optimal splits according to the 50/30/20 rule."
**UI State:**
- Hero Card: Smart Savings / FD Recommendations.
- Accent: Green.
- Modules: Investment portfolios, Wealth auto-sweep.

## Scenario Switching Commands

You can switch scenarios via the Terminal using `curl`, or dynamically inside the mobile app using the **PrototypeLabModal** (shake device or tap the developer icon to open).

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

## Troubleshooting

- **App not updating when scenario switches**: Hard refresh the Expo app (shake device -> Reload). Ensure the backend is returning 200 OK for the switch command.
- **Voice Intents Failing**: Ensure you exported the ONNX metadata properly (`python scripts/export_onnx_meta.py`). Check if Expo has microphone permissions.
- **Empty UI / Missing Data**: Check if `seed_database.py` was executed. The app relies on the `cust_bharat_001` customer profile.

**Note:** All data is synthetic.
