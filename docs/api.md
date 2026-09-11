# Bharat Adaptive Banking API Reference

Base URL: `http://localhost:8000/api/v1`

## 1. Endpoints

### `GET /api/v1/customer/{customer_id}`
Returns customer profile, account balance, and current signals matching `contracts/customer-state.schema.json`.

### `GET /api/v1/experience/{customer_id}?lang={en|hi|gu}`
Returns adaptive UI configuration matching `contracts/experience.schema.json`:
- `primary_actions`: Immediate repeated or critical actions (e.g. `["metro", "upi", "fastag"]` or `["verify_charge", "freeze_card"]`).
- `priority_modules`: Prioritized modules for the home screen.
- `deprioritized_modules`: Modules suppressed (e.g. `["personal_loans"]` in financial stress).
- `hero_card`: Prominent adaptive card for the top attention slot.
- `context_cards`: Prioritized list of `ContextCards` with explainability reasons.

### `POST /api/v1/scenario/switch`
Body:
```json
{
  "scenario": "normal" | "life-change" | "financial-stress"
}
```
Switches active scenario in backend, recalculates AI signals, and returns new `ExperienceConfig`.

### `POST /api/v1/voice/intent`
Body:
```json
{
  "query": "मेरी मेट्रो का भुगतान करो",
  "language": "hi"
}
```
Returns `contracts/voice-intent.schema.json`:
```json
{
  "intent": "PAY_METRO",
  "language": "hi",
  "confidence": 0.94,
  "response_text": "आपकी दैनिक सुबह की मेट्रो यात्रा का किराया ₹40 है। क्या आप त्वरित यूपीआई रिचार्ज करना चाहते हैं?"
}
```
