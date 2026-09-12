# GitHub Repository Research: AI-Powered Hyper-Personalized Banking for Bharat

Research date: 11 September 2026

## Executive conclusion

There is no single open-source repository that cleanly covers the full challenge. The strongest implementation strategy is a composable stack:

1. Use **SBI Nexus** as the closest end-to-end product/UX reference.
2. Use **Banking Product Recommendation System** or **BankLLM** for recommendation logic and architecture.
3. Use **PayNey / Omoi SMS Parser / Forge** for Indian transaction ingestion and synthetic demo data.
4. Use **nxfive/ml-bank-anomaly-detection** or **Bank-GG** for anomaly/risk pipelines.
5. Use **AWS Indic Language Voicebot**, **IndicTrans2**, or **BharatRAG** for vernacular conversational capability.
6. Use **TSI DPDP Consent Management System** plus **Sahamati documentation** as the consent/Account Aggregator reference layer.

## Highest-value repositories

| Rank | Repository | Best use | Match |
|---|---|---|---|
| 1 | https://github.com/MohanSaiPandeti/SBI-nexus | Closest direct blueprint for the whole challenge | 10/10 |
| 2 | https://github.com/Pratishtha-Singh/Banking-Product-Recommendation-System | Product recommendation + segmentation + Streamlit demo | 9/10 |
| 3 | https://github.com/Omar-Karimov/BankLLM | LLM recommendation architecture | 8.5/10 |
| 4 | https://github.com/othzer/PayNey | Indian SMS/UPI transaction ingestion + analytics | 8.5/10 |
| 5 | https://github.com/Aonami-labs/Forge | Synthetic AA/ReBIT financial data for demos | 9/10 for data |
| 6 | https://github.com/nxfive/ml-bank-anomaly-detection | Production-style anomaly API/monitoring | 8.5/10 |
| 7 | https://github.com/pestechnology/Bank-GG | Indian bank statement parsing + money-flow fraud graph | 8.5/10 |
| 8 | https://github.com/aws-samples/sample-indic-language-voicebot | Real-time Indic speech pipeline | 8/10 |
| 9 | https://github.com/pradnyagundu/bharatrag | Indic-language RAG evaluation | 8/10 |
| 10 | https://github.com/tsi-coop/tsi-dpdp-cms | Consent management / DPDP architecture | 8/10 |
| 11 | https://github.com/Sahamati/documentation | AA ecosystem and ReBIT workflow reference | 9/10 for compliance/integration |
| 12 | https://github.com/abhirajsinha/omoi-sms-parser | Deterministic Indian bank/UPI SMS parsing | 8/10 |
| 13 | https://github.com/IshanJawale/VYOM-Union-Bank-of-India | Indian bank conversational/vernacular service flow ideas | 7.5/10 |
| 14 | https://github.com/pankaj0695/PRISM_iDEA_2.0_Hackathon | Explainable multi-signal fraud architecture | 7.5/10 |
| 15 | https://github.com/vphventures/banking-products-recommender | Collaborative-filtering-style banking recommendation concept | 7/10 |

## Why SBI Nexus matters

SBI Nexus is the closest match to the challenge language. Its README describes proactive understanding of spending, transaction history and financial goals, product recommendations, a financial health score, bill prediction, multilingual AI and proactive fraud awareness. Its stated stack is React + Spring Boot + PostgreSQL + Gemini, with a rule-based recommendation engine. It should be treated as a blueprint/reference, not assumed to be production-ready.

## Recommendation engine references

### Banking Product Recommendation System

This repository is especially useful because it explicitly combines customer profile and transactional data. It contains multi-label XGBoost product prediction, KMeans segmentation, a rule-based loan recommender using credit score/DTI/spending, and a credit-card subtype recommender. It also includes a Streamlit UI that exposes the pipeline from customer selection to recommendation rationale.

### BankLLM

BankLLM uses FastAPI, Streamlit, MySQL, LangChain, LangServe and FAISS. It separates a data-analysis chain from a recommendation-specialist chain and retrieves similar customer profiles before producing product recommendations. This is a useful pattern for an explainable AI layer, but a banking production system should not let semantic similarity alone determine eligibility or pricing.

### Banking-products-recommender

This is a smaller proof of concept using collaborative-filtering/ALS-style recommendation based on behavior of similar clients. Its README explicitly notes that sparse transaction matrices are problematic and that rule-based heuristics improve reliability. That lesson is highly relevant for a hackathon prototype.

## Transaction intelligence / data layer

### PayNey

PayNey is unusually relevant to the Bharat context. It ingests Indian bank SMS and UPI notifications, parses them with deterministic regex and falls back to Gemini for ambiguous cases, de-duplicates by transaction identifiers, categorizes spending, tracks recurring transactions and produces financial analytics. It also has an Android capture app and PostgreSQL/Prisma backend.

### Omoi SMS Parser

A pure TypeScript, dependency-free on-device parser for Indian bank/UPI transaction SMS. It uses a DLT sender-id gate and deterministic grammar and represents money in integer paise. This is useful if the prototype needs a clean local ingestion component without cloud LLM calls.

### Forge

Forge generates seeded synthetic Indian bank-account statements conforming to the ReBIT Financial Information `deposit` schema used in the Account Aggregator ecosystem. It includes salary credits, UPI spend, recurring obligations, withdrawals, charges and bounces. This is probably the best source for building a repeatable demo dataset without using real customer data.

## Fraud / financial-stress / anomaly layer

### ml-bank-anomaly-detection

This repository is stronger than a basic notebook because it includes explicit preprocessing and feature engineering, Isolation Forest and LOF models, FastAPI serving, Streamlit frontend, monitoring, logging and Docker support. It is a good template for separating model execution from orchestration and exposing a risk-scoring API.

### Bank-GG / SENTINEL

SENTINEL parses Indian bank statements, normalizes transactions, builds money-flow graphs and applies hybrid risk scoring. The README shows rules for new recipients, amount deviation, time anomalies and other signals, plus an ML contribution/explanation layer. It is particularly useful for demonstrating graph-based fraud context rather than a single suspicious-transaction score.

### PRISM

PRISM demonstrates a much more elaborate explainable fraud stack: graph neural network, stacking ensemble, fund-flow detection, lifestyle-income drift and Dempster-Shafer evidence fusion. It also exposes SHAP-derived causal explanations. The codebase is framed around insider fraud, so it should be adapted rather than copied for customer financial-stress use cases.

## Vernacular / conversational banking

### AWS Indic Language Voicebot

This is a current, production-oriented prototype architecture for realtime multilingual voice. It uses Pipecat, WebSockets, FastAPI and a pluggable STT/TTS layer covering many Indic languages. It is useful for voice-first banking assistance and branch/contact-centre scenarios.

### IndicTrans2

IndicTrans2 is the core multilingual translation reference, supporting the scheduled Indic languages. It is better used as a translation component than as the full conversational intelligence layer.

### BharatRAG

BharatRAG focuses on evaluating retrieval quality in Indian languages, with metrics around context relevance, groundedness and answer relevance. This matters because a vernacular bank assistant should be evaluated separately from its English performance.

### VYOM – Union Bank of India

This repository demonstrates an India-specific banking-service assistant using speech-to-text, multilingual support, query classification, ticket routing and other bank-service capabilities. It is useful as a UX/flow reference for vernacular service journeys, even though it is not a direct match for personalized product recommendation.

## Compliance / consent / AA references

### TSI DPDP Consent Management System

Open-source consent management system designed around India's DPDP Act. Useful as a reference for consent lifecycle, Data Fiduciary/Data Principal relationships and consent-manager deployment modes.

### Sahamati documentation

This is the critical AA ecosystem reference. It includes AA/FIP/FIU API specifications, schemas, purpose definitions, consent workflow and ReBIT-oriented technical guidance.

## Suggested target architecture

```text
                    +-----------------------------+
                    | Customer / Assisted Channel |
                    | App | WhatsApp | IVR | Branch |
                    +-------------+---------------+
                                  |
                   intent + language + consent
                                  v
                    +-----------------------------+
                    |  Conversational Experience  |
                    | multilingual STT/TTS/RAG    |
                    +-------------+---------------+
                                  |
                                  v
+-------------------+   +-----------------------------+   +-------------------+
| Account Aggregator|-->| Customer 360 / Feature Store|<--| Core Banking / UPI|
| consented FI data |   | income, spend, EMI, goals  |   | cards, deposits    |
+-------------------+   +-------------+---------------+   +-------------------+
                                      |
                    +-----------------+------------------+
                    |                 |                  |
                    v                 v                  v
             Segmentation      Financial-health     Anomaly/risk
             + life stage      / affordability      + stress signals
                    |                 |                  |
                    +-----------------+------------------+
                                      v
                          +--------------------------+
                          | Decision / Recommendation|
                          | eligibility gates first  |
                          | need/value score second  |
                          | business score last      |
                          +------------+-------------+
                                       |
                 +---------------------+---------------------+
                 |                                           |
                 v                                           v
        Personalized next best action                Human / safety handoff
        product, advice, reminder,                  fraud review, hardship,
        education, journey shortcut                  customer support
```

## Key product principle

Do not build this as "an LLM that recommends loans." Build it as a decision system with three distinct layers:

1. **Eligibility / safety gates** — deterministic and policy-controlled.
2. **Customer-benefit ranking** — ML/rules that estimate fit, affordability, financial benefit and timing.
3. **Conversational explanation** — LLM only explains the decision, answers questions, and guides the customer through the journey.

This makes the system much easier to defend on explainability, auditability and anti-predatory-nudging grounds.

## Prototype path

For a strong hackathon prototype, the most efficient build is:

- UI/product reference: SBI Nexus
- Recommendation models: Banking Product Recommendation System
- Transaction input: Forge + Omoi/PayNey patterns
- Risk engine: nxfive + selected ideas from Bank-GG/PRISM
- Vernacular: AWS Indic Voicebot + IndicTrans2
- RAG/evaluation: BharatRAG
- Consent/AA story: TSI DPDP CMS + Sahamati

A demo should show one customer moving through a complete loop: consent -> data aggregation -> life-stage/financial-health inference -> recommendation -> vernacular explanation -> action -> proactive intervention when a stress/fraud signal appears.

## Compliance notes for the architecture

RBI's payment-system data rule requires payment-system data to be stored in India, subject to the stated cross-border exception for the foreign leg. The Account Aggregator model is consent-based; RBI describes AAs as sharing financial information only on clear customer instructions, and Sahamati/ReBIT provide technical standards and workflows. MeitY notified the DPDP Rules 2025 on 14 November 2025 and published a phased commencement schedule, so the prototype should implement consent, purpose limitation, deletion/retention controls and auditability from the beginning rather than treating them as a later add-on.

## Final shortlist to clone/inspect first

1. SBI Nexus
2. Banking Product Recommendation System
3. PayNey
4. Forge
5. ml-bank-anomaly-detection
6. Bank-GG
7. AWS sample-indic-language-voicebot
8. TSI DPDP CMS
9. Sahamati documentation
10. BharatRAG

## Important cautions

- Do not ship customer-facing loan recommendations directly from an LLM.
- Do not use synthetic fraud scores as if they were calibrated real-world probabilities.
- Do not copy SMS-permission architectures into a bank product without legal/product review; Account Aggregator is the cleaner bank-native story.
- Treat financial-stress detection as a customer-protection feature first and a cross-sell feature second.
- Never expose raw financial data to the LLM when structured features or redacted summaries are sufficient.
