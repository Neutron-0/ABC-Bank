# ABC Bank - Project Context
Team Neutron / VZEYA (Harsh Solanki, Panchal Lakshya, Ubaid Khan) | HackOut'26 @ DA-IICT

> 🏆 **Selected in Top 12 Teams at HackOut'26 (DA-IICT)**  
> **Team Name:** VZEYA (Leader: Harsh Solanki) | **Demo / Project Name:** ABC Bank (Adaptive Banking for Bharat)

## HackOut'26 — Top 12 Selected Finalist Teams
📄 **[Download Official Shortlist PDF](assets/HackOut26_Top12_Shortlist.pdf)**

| # | Team Name | Team Leader Name |
|---|---|---|
| 1 | Zero Sum | Patel Vedant |
| 2 | Wowwsters | Kashyap Vadher |
| 3 | Outliers | Jeevesh Bodhani |
| 4 | Kinzz | Kinjal Rantanpara |
| 5 | Foxbat | Viraj Patel |
| 6 | ByteMe | Tanmay Kanani |
| 7 | Tech Titans | Dhruvil Prajapati |
| 8 | Tech Titans | Savaliya Saumil |
| 9 | Tatva | Shaurya Doshi |
| 10 | cosmiX | Vedant Bhatt |
| 11 | Ctrl Freaks | Aum Pethani |
| 12 | **VZEYA** *(Our Team)* | **Harsh Solanki** |

## HackOut Problem Statement
**AI-Powered Hyper-Personalized Banking for Bharat**
- **Target users:** Tier 2/3/4, rural, vernacular-first, non-tech-savvy users
- **Core thesis:** "Instead of asking customers to learn their bank, make the bank learn the customer."

## Product Vision
ABC Bank is NOT a conventional fixed banking dashboard. 
The customer's banking experience dynamically adapts based on:
- Transaction history
- Spending behaviour
- Recurring patterns
- Usage habits
- Life-stage signals
- Financial health
- Risk/fraud signals
- Current context
- Product relevance
- Language and interaction preference

The system personalizes what information the customer sees, which actions are prioritized, where actions appear, which modules are promoted/deprioritized, language, interaction modality, and contextual banking journeys. The UI is minimal, self-explanatory, and highly adaptive.

## Three-Pronged Architecture

*(For an in-depth breakdown, see [Architecture Overview](architecture/overview.md))*

1. **Backend Banking Intelligence**
   - Handles Customer 360, feature extraction, behavioural segmentation, life-stage inference, financial-health analysis, anomaly/fraud detection, recommendation scoring, next-best-action, explanation generation, and customer-state generation.
   - Built as a general-purpose signal system (NOT hardcoded examples).
   - Pipeline: Bank Data → Feature Extraction → Signals → Customer State → Decision → Experience Config → Adaptive UI.
2. **Adaptive Experience Engine**
   - The Backend produces a structured `ExperienceConfig`.
   - The Frontend receives it and renders predefined, safe UI components.
   - This strict separation is essential for predictability, explainability, testing, maintainability, parallelization, and safety.
3. **On-Device Bharat Voice Layer**
   - A local SLM (MiniCPM5 planned) handles voice interaction, local intent detection, vernacular understanding, and conversational navigation.
   - *Note:* The SLM is NOT the main financial decision-maker. The Backend AI understands the customer; the On-device AI understands how the customer wants to interact.

## Existing Banking Infrastructure Integration
ABC Bank is designed as an intelligence and experience layer OVER existing banking infrastructure.
Existing bank systems continue to handle accounts, balances, transactions, UPI, cards, loans, KYC, authentication, and core financial operations. Our system simply consumes secure APIs and data, adding intelligence and adaptive rendering on top.

## Privacy and Security Principles
- **Consent-first data usage:** No assumptions made about customer data without permission.
- **Data minimization:** Processing only what is required.
- **Explainability:** Every recommendation has a clear 'why'.
- **Auditability:** Transparent tracking of AI decision logs.
- **Algorithmic-bias awareness:** System aims to operate fairly across all demographics.
- **Anti-predatory nudging:** Protects the customer against over-borrowing or predatory loan tactics.
- **RBI/DPDP awareness:** Built with regulations in mind, though we do not claim full compliance for the scope of this hackathon.

## Responsible AI Principles
- **Customer benefit over upselling.**
- **Recommendation hierarchy:** Eligibility/Safety → Suitability/Affordability → Customer Need → Timing → Expected Benefit → Commercial.
- **Financial stress triggers:** When financial stress is detected, the system deprioritizes new borrowing offers and proactively surfaces upcoming payments, expense analysis, financial-health insights, budgeting guidance, and options for human support.
- **Ethical loan suppression:** No lending nudges when Debt-to-Income (DTI) > 0.40 or when significant stress is detected.

## Demo Concept
The demo showcases how the SAME generic engine seamlessly adapts to radically different customer signals.
- **Multiple scenarios:** normal workday, life-change event, financial stress, fraud alert, surplus capital.
- **Vernacular focus:** Voice interaction demo in Hindi/Gujarati.
- **Safety:** All data used in the demo is completely synthetic.

## Current Tech Stack
- **Backend:** Python, FastAPI, Pydantic
- **Frontend:** React Native, Expo (SDK 57), TypeScript, Zustand
- **AI:** Python (Scikit-Learn LogisticRegression, XGBoost, KMeans clustering, LinUCB bandit, MiniCPM-5 ONNX model, and Neural SLM)
- **Contracts:** JSON Schema (Draft-07)
- **Infrastructure:** Docker Compose for containerization
