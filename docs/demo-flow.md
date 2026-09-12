# Hackathon Presentation & Demo Flow

## 1. The Core Demonstration

The objective is to prove that **the UI itself continuously changes because the customer's life changes**.

```
Scenario File (data/scenarios/*.json)
       ↓
AI Signal Detection (ai/intelligence/run.py)
       ↓
Customer State (contracts/customer-state.schema.json)
       ↓
Backend Experience Composer (apps/backend/app/experience/composer.py)
       ↓
Experience JSON (contracts/experience.schema.json)
       ↓
Adaptive UI (apps/frontend/)
```

---

## 2. Live Demo Steps for Judges

### Demo 1: Normal Workday (`normal.json`)
- **Signals**: Regular salary, 8:40 AM Metro habit, positive savings.
- **UI Focus**:
  - Hero Card: *"Your 8:40 AM Metro Commute — Pay ₹40 Again"*.
  - Attention Stack: Morning Metro, Monthly Spending on Track, EMI due in 4 days.
  - Ethical Check: Normal product offers (Smart FD @ 7.85%).

### Demo 2: Major Life Change / Medical Event (`life-change.json`)
- **Signals**: Large ₹48,200 hospital debit detected at Max Super Speciality.
- **UI Focus**:
  - Hero Card: *"Medical Reimbursement Assistance"*.
  - Sequence: **Empathy first** $\to$ Claim filing $\to$ Budget buffer check.
  - Ethical Check: Does **NOT** scream "Buy insurance immediately".

### Demo 3: Financial Stress (`financial-stress.json`)
- **Signals**: Liquid balance ₹7,850, upcoming obligations ₹34,200, debt-to-income ratio 58%.
- **UI Focus**:
  - Hero Card: *"Your monthly cash flow looks tighter than usual"*.
  - Attention Stack: Review commitments, 1-tap subscription trimming (pause ₹4,800/mo).
  - **CRITICAL ETHICAL CHECK**: Personal loans and credit cards are **COMPLETELY SUPPRESSED**. Zero predatory nudging.

### Demo 4: Trilingual Voice Assistant (Mitra)
- Test voice queries in English, Hindi, and Gujarati:
  - Hindi: *"मेरी मेट्रो का भुगतान करो"* $\to$ Instant ₹40 Metro recharge.
  - Gujarati: *"મારી આગામી EMI ક્યારે છે?"* $\to$ Home Loan EMI details.
