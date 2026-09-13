# ABC Bank / VZEYA — Adaptive Banking for Bharat

**AI-Powered Hyper-Personalized Banking Experience Layer** for HackOut'26 at DA-IICT.

> *"Instead of asking customers to learn their bank, make the bank learn the customer."*

ABC Bank (VZEYA) is an intelligence and experience layer that dynamically adapts a customer's mobile banking interface based on transaction history, cash-flow pulse, life-stage signals, risk indicators, and interaction preferences — designed for Tier 1 to Tier 4, rural, and vernacular-first users across Bharat.

---

## Table of Contents

- [Project Overview](#project-overview)
 - [What It Does](#what-it-does)
 - [The Problem It Solves](#the-problem-it-solves)
 - [Major Architectural Characteristics](#major-architectural-characteristics)
 - [Design Principles](#design-principles)
- [Complete System Architecture](#complete-system-architecture)
 - [High-Level System Architecture](#high-level-system-architecture)
 - [Server-Driven UI Architecture](#server-driven-ui-sdui-architecture)
 - [Complete Data Pipeline](#complete-data-pipeline-architecture)
 - [Runtime Deployment Architecture](#runtime-deployment-architecture)
 - [Contract Boundary Architecture](#contract-boundary-architecture)
 - [Dual AI Architecture](#dual-ai-architecture)
 - [Graceful Degradation Architecture](#graceful-degradation-architecture)
- [Feature Overview](#feature-overview)
 - [Feature Map Diagram](#feature-map-diagram)
 - [Feature Inventory](#feature-inventory-18-features)
- [Repository Structure](#repository-structure)
 - [Monorepo Dependency Diagram](#monorepo-dependency-diagram)
- [Team Ownership](#team-ownership)
- [Core Contracts](#core-contracts)
 - [Contract Flow Diagram](#contract-flow-diagram)
 - [Contract Schema Details](#contract-schema-details)
- [Technology Stack](#technology-stack)
- [Backend Architecture — Deep Dive](#backend-architecture--deep-dive)
 - [Backend Layer Architecture Diagram](#backend-layer-architecture-diagram)
 - [Request Lifecycle — Complete Sequence](#request-lifecycle--complete-sequence-diagram)
 - [All API Endpoints](#all-api-endpoints)
 - [Core Services Detail](#core-services-detail)
 - [State Resolution Flow](#state-resolution-flow)
 - [Experience Composition Flow](#experience-composition-flow)
 - [Safety Policy Filter Flow](#safety-policy-filter-flow)
 - [Payment Transfer — Complete Sequence](#payment-transfer--complete-sequence-diagram)
 - [Error Handling & Graceful Degradation](#error-handling--graceful-degradation)
- [Frontend Architecture — Deep Dive](#frontend-architecture--deep-dive)
 - [Frontend Architecture Diagram](#frontend-architecture-diagram)
 - [Screen Navigation State Diagram](#screen-navigation-state-diagram)
 - [Component Hierarchy Diagram](#component-hierarchy-diagram)
 - [Data Fetching & Offline Fallback Sequence](#data-fetching--offline-fallback-sequence)
 - [Payment Authentication Sequence](#payment-authentication-sequence)
 - [Adaptive Home Screen Flow](#adaptive-home-screen-flow)
 - [State Management Architecture](#state-management-architecture)
- [AI & Intelligence Engine — Deep Dive](#ai--intelligence-engine--deep-dive)
 - [Complete Intelligence Pipeline Diagram](#complete-intelligence-pipeline-diagram)
 - [7-Source Data Ingestion & Harmonization](#7-source-data-ingestion--harmonization-diagram)
 - [Recommendation Scoring Architecture](#recommendation-scoring-architecture)
 - [Ethical Compliance & Suppression Flow](#ethical-compliance--suppression-flow)
 - [Dual Cadence System](#dual-cadence-system-state-diagram)
 - [ML Model Architecture](#ml-model-architecture-diagram)
 - [Voice Processing Pipeline — Complete Sequence](#voice-processing-pipeline--complete-sequence)
 - [Zero-Leakage Voice Security Architecture](#zero-leakage-voice-security-architecture)
- [Database Architecture — Deep Dive](#database-architecture--deep-dive)
 - [Entity Relationship Diagram](#entity-relationship-diagram)
 - [Data Access Layer Architecture](#data-access-layer-architecture)
 - [Migration & Introspection Flow](#migration--introspection-flow)
 - [Seed Data Pipeline](#seed-data-pipeline)
- [Authentication & Security — Deep Dive](#authentication--security--deep-dive)
  - [End-to-End Authentication & MPIN Flow](#end-to-end-authentication--mpin-flow)
  - [DPDP Act 2023 & RBI Statutory Consent Architecture](#dpdp-act-2023--rbi-statutory-consent-architecture)
  - [PIN Authentication — Complete Lifecycle](#pin-authentication--complete-lifecycle)
  - [PIN Verification with Rate Limiting Sequence](#pin-verification-with-rate-limiting--complete-sequence)
  - [Biometric Payment Flow](#biometric-payment-flow--complete-sequence)
  - [Card Security State Machine](#card-security-state-machine)
  - [Multi-Layer Authorization Architecture](#multi-layer-authorization-architecture)
  - [Ethical AI Security Architecture](#ethical-ai-security-architecture)
  - [Known Security Limitations](#known-security-limitations)
- [Data Flow Architecture — Deep Dive](#data-flow-architecture--deep-dive)
 - [End-to-End Personalization Sequence](#end-to-end-personalization--complete-sequence)
 - [Transaction Processing Sequence](#transaction-processing--complete-sequence)
 - [Voice Intent Processing Sequence](#voice-intent-processing--complete-sequence)
 - [Scenario Switching Flow](#scenario-switching-flow)
 - [Attention Layer Priority System](#attention-layer-priority-system)
- [Testing Architecture](#testing-architecture)
 - [Test Architecture Diagram](#test-architecture-diagram)
 - [Audit Verification Pipeline](#audit-verification-pipeline)
- [Configuration Reference](#configuration-reference)
- [Quick Start](#quick-start)
- [Build & Deployment](#build--deployment)
 - [Current Deployment Architecture](#current-deployment-architecture)
 - [Database Migration Flow](#database-migration-flow)
- [Scripts & Tooling](#scripts--tooling)
- [Implementation Status](#implementation-status)
- [Key Principles](#key-principles)
- [Documentation Index](#documentation-index)

---

## Project Overview

### What It Does

VZEYA is not a standalone banking application. It is an **Intelligence and Experience Layer** designed to sit on top of existing core banking infrastructure. It transforms raw, disparate banking data from 7 sources (Core Banking, UPI, SMS, CIBIL Bureau, BBPS, NCMC Metro, KYC) into a dynamically personalized mobile experience that adapts in real-time to each customer's financial reality.

The system ingests transaction data, extracts 32 single-pass features, detects behavioral/financial/lifecycle signals, classifies customers into one of 7 Bharat archetypes, scores product recommendations using a weighted multi-factor utility formula, enforces RBI-compliant ethical guardrails (DTI cap at 0.40), logs every decision in a SHA-256 cryptographic audit chain, and dynamically composes the mobile UI through a Server-Driven UI architecture — all in sub-millisecond latency.

### The Problem It Solves

Traditional banking apps present the same static interface to every customer regardless of their financial situation. A customer in financial distress sees the same loan offers as a thriving saver. A daily metro commuter gets the same home screen as a rural farmer. VZEYA solves this by:

- **Dynamically adapting the UI** based on financial health (`thriving`, `stable`, `tight`, `stress`)
- **Suppressing predatory products** when a customer is financially vulnerable (DTI > 0.40)
- **Providing vernacular AI assistance** in Hindi, Gujarati, Hinglish, and English via on-device MiniCPM-5 SLM processing
- **Contextually surfacing relevant actions** based on behavioral patterns (commute times, dining habits, cinema visits)
- **Operating offline-first** with graceful degradation when connectivity is limited (2.5s timeout → edge processing)
- **Maintaining cryptographic audit trails** for every AI decision via SHA-256 hash chains
- **Enforcing ethical lending** by physically preventing credit product recommendations for customers in financial stress

### Major Architectural Characteristics

| Characteristic | Implementation | Impact |
|----------------|---------------|--------|
| **Server-Driven UI (SDUI)** | Backend dictates what the frontend renders via `ExperienceConfig` JSON | AI team can modify personalization without touching React Native code |
| **Deterministic AI** | All financial decisions use mathematical scoring (30% affordability + 30% lifecycle + 25% urgency + 15% archetype − risk penalty), never generative AI | Zero hallucination risk in financial decisions |
| **Contract-First Design** | JSON Schema Draft-07 contracts decouple AI, Backend, and Frontend | Independent evolution of all three domains |
| **Ethical AI Guardrails** | Hard-coded RBI DTI limits (>0.40 = suppress) and DPDP compliance baked into the engine | Predatory lending physically impossible |
| **Dual AI Architecture** | Backend deterministic math for decisions + On-device MiniCPM-5 INT4 SLM for vernacular NLP only | Clear separation of concerns; SLM never makes financial decisions |
| **Offline-First** | 2.5s timeout → edge ONNX processing on-device; DB offline → JSON seed fallback | App continues working without connectivity |
| **Cryptographic Auditability** | SHA-256 hash chain logs every AI decision and suppression for regulatory compliance | Tamper-proof audit trail for RBI compliance |
| **Dual Cadence Processing** | 14-day heavy macro batch + 0.162ms sub-millisecond micro-triggers | Real-time responsiveness with periodic deep analysis |

### Design Principles

- **Privacy-First UX**: Spending data operates as internal telemetry to calibrate protective services (auto-sweep FDs, tax savers, Safe-to-Spend buffer) — never displayed as an invasive lifestyle ledger
- **Strict Domain Ownership**: Each team member owns their domain; cross-domain edits are forbidden (enforced via CODEOWNERS)
- **No Hallucination Risk**: Generative AI (MiniCPM-5 SLM) handles only speech/language — never makes financial recommendations
- **Data Localization**: All processing complies with RBI Data Localization Circular (2018) and DPDP Act 2023
- **Zero Banking Data Leakage**: The on-device SLM never receives transaction history; it only verbalizes pre-computed trusted facts

---

## Complete System Architecture

### High-Level System Architecture

This diagram shows the complete runtime architecture — from end users through the mobile app, backend API, AI pipeline, database, and external data sources. Every component shown exists in the actual codebase.

```mermaid
flowchart TD
  subgraph Users["End Users"]
    U1["Tier 1-4 Urban Customers"]
    U2["Rural & Vernacular-First Users"]
    U3["Metro Commuters"]
  end

  subgraph MobileApp["React Native / Expo App (apps/frontend/)"]
    direction TB
    AppEntry["App.tsx → ThemeProvider → AppNavigator"]
    
    subgraph Screens["Feature Screens"]
      HomeScreen["AdaptiveHomeScreen\n(Dynamic Hero + Context Cards)"]
      ChatScreen["MitraChatScreen\n(Vernacular AI Chat)"]
      PayScreen["PaymentsScreen\n(Transfer + 1-Tap Pay)"]
      TxnScreen["TransactionsScreen\n(Combined Ledger)"]
      InsightScreen["InsightsScreen\n(Spending Analysis)"]
      ProfileScreen["ProfileScreen\n(Settings + KYC)"]
    end
    
    subgraph ClientServices["Client Services"]
      ZustandStore["Zustand Store\n(useCustomerStore)"]
      BankingAPI["BankingApi\n(fetch + 2.5s AbortController)"]
      EdgeEngine["MiniCPM5EdgeEngine\n(ONNX On-Device NLP)"]
      OnDeviceIntent["onDeviceIntentService\n(Rule-Based Fallback)"]
      i18n["i18n Module\n(EN / HI / GU)"]
      BiometricAuth["expo-local-authentication\n(Biometric + PIN)"]
    end
    
    AppEntry --> Screens
    Screens --> ZustandStore
    ZustandStore --> BankingAPI
    BankingAPI -.->|"Timeout 2.5s"| EdgeEngine
    ZustandStore --> OnDeviceIntent
  end

  subgraph BackendAPI["FastAPI Backend :8000 (apps/backend/)"]
    direction TB
    MainPy["main.py\n(CORS + Router Mount)"]
    
    subgraph APIRoutes["API Routes (routes.py) — 15+ Endpoints"]
      CustomerRoute["GET /customer/{id}"]
      ExperienceRoute["GET /experience/{id}"]
      PaymentRoute["POST /payments/transfer"]
      AuthRoute["POST /auth/pin/setup|verify"]
      CardRoute["GET|POST /cards/"]
      AssistantRoute["POST /assistant/intent|chat"]
      VoiceRoute["POST /voice/intent"]
      EventRoute["POST /events"]
      ScenarioRoute["POST /scenario/switch"]
    end
    
    subgraph Services["Service Layer"]
      StateService["StateService\n(Core Orchestrator)"]
      SafetyPolicy["SafetyPolicyFilter\n(Anti-Predatory Lending)"]
      BehaviorEngine["BehavioralEngine\n(Contextual Habits)"]
      ExpComposer["ExperienceComposer\n(State → UI Config)"]
    end
    
    subgraph DataAccess["Data Access Layer"]
      DataLoader["DataLoader\n(DB → JSON Fallback)"]
      CustomerRepo["CustomerRepository"]
      TxnRepo["TransactionRepository"]
      EventRepo["EventRepository"]
      ProductRepo["ProductRepository"]
    end
    
    MainPy --> APIRoutes
    APIRoutes --> Services
    Services --> DataAccess
    StateService --> ExpComposer
    ExpComposer --> SafetyPolicy
  end

  subgraph AIEngine["AI Intelligence Pipeline (ai/)"]
    direction TB
    
    subgraph Ingestion["Data Ingestion"]
      Harmonizer["harmonizer.py\n(MD5 Dedup + ISO Parse)"]
    end
    
    subgraph FeatureExt["Feature Extraction"]
      Extractor["extractor.py\n(50/30/20 Rule + 32 Metrics)"]
      SpendAnalyzer["spend_analyzer.py\n(9-Category Breakdown)"]
      Forecaster["forecaster.py\n(30-Day Runway)"]
    end
    
    subgraph SignalDet["Signal Detection"]
      BehavioralSig["behavioral.py\n(Commute, Dining, Cinema)"]
      FinancialSig["financial.py\n(DTI, Risk, Savings Decline)"]
      LifecycleSig["lifecycle.py\n(Medical, Marriage, Job Change)"]
    end
    
    subgraph Personalization["Personalization Engine"]
      StateGenerator["generator.py\n(Dual Cadence Controller)"]
      Scorer["scorer.py\n(Multi-Factor Utility)"]
      ComplianceFilter["compliance.py\n(RBI DTI + DPDP)"]
      CryptoLedger["cryptoledger.py\n(SHA-256 Chain)"]
    end
    
    subgraph MLModels["ML Subsystem"]
      Propensity["ONNX Propensity Model"]
      Clustering["KMeans Archetype Clustering"]
      Bandit["UCB Exploration Bandit"]
      Embeddings["Cosine Similarity Embeddings"]
    end
    
    Ingestion --> FeatureExt
    FeatureExt --> SignalDet
    SignalDet --> Personalization
    Personalization --> MLModels
  end

  subgraph VoiceAI["On-Device Voice SLM (ai/voice/)"]
    MiniCPM["MiniCPM-5 INT4\n(~1.85GB RAM)"]
    IntentClassifier["Intent Classifier\n(PAY_METRO, CHECK_EMI, etc.)"]
    IntentHandler["Intent Handlers"]
    DialogueManager["Dialogue State Manager"]
    ZeroLeakPrompts["Zero-Leakage System Prompts"]
    
    MiniCPM --> IntentClassifier
    IntentClassifier --> IntentHandler
    IntentHandler --> DialogueManager
  end

  subgraph DataLayer["Data Layer"]
    PostgreSQL[("PostgreSQL 16\n(Docker :5432)\n9 Tables")]
    SeedJSON["JSON Seed Data\n(1.2k Customers\n127k Transactions)"]
    ScenarioJSON["Scenario Overrides\n(normal, stress, medical,\nfraud, life-change)"]
  end

  subgraph ExternalData["7 External Data Sources"]
    CBS["Core Banking System"]
    UPI["UPI Transaction Logs"]
    AndroidSMS["Android SMS Parser"]
    CIBIL["CIBIL Credit Bureau"]
    BBPS["BBPS Bill Payments"]
    NCMC["NCMC Metro Card"]
    KYCDemo["KYC Demographics"]
  end

  Users -->|"Touch / Voice"| MobileApp
  MobileApp -->|"REST API (JSON)"| BackendAPI
  VoiceAI -->|"voice-intent.schema.json"| BackendAPI
  BackendAPI -->|"experience.schema.json"| MobileApp
  AIEngine -->|"customer-state.schema.json"| BackendAPI
  DataAccess --> PostgreSQL
  PostgreSQL -.->|"DB Offline Fallback"| SeedJSON
  ExternalData --> AIEngine
  StateService -->|"Triggers Pipeline"| AIEngine

  style Users fill:#e8f5e9
  style MobileApp fill:#e3f2fd
  style BackendAPI fill:#fff3e0
  style AIEngine fill:#f3e5f5
  style VoiceAI fill:#fce4ec
  style DataLayer fill:#e0f2f1
  style ExternalData fill:#f5f5f5
```

---

### Server-Driven UI (SDUI) Architecture

This is the core architectural pattern of VZEYA. The AI determines the customer's reality, the Backend synthesizes it into a UI specification, and the Frontend blindly renders whatever the Backend tells it to show. This means the AI team can completely change the user experience without modifying any React Native code.

```mermaid
flowchart LR
  subgraph AILayer["AI Layer (Ubaid)"]
    direction TB
    DataSources["7 Data Sources\n(CBS, UPI, SMS, CIBIL,\nBBPS, NCMC, KYC)"]
    Pipeline["Intelligence Pipeline\n(Harmonize → Extract →\nDetect → Score → Comply)"]
    CryptoLog["SHA-256 Crypto Ledger\n(Decision Audit Trail)"]
    CustomerState["CustomerState JSON\n• financial_health: stress\n• signals: [commute, emi_due]\n• recommendations: [\n {product: 'metro_pass',\n  suppressed: false},\n {product: 'personal_loan',\n  suppressed: true}\n]"]
    
    DataSources --> Pipeline --> CryptoLog --> CustomerState
  end

  subgraph BackendLayer["Backend Layer (Harsh)"]
    direction TB
    StateService2["StateService\n(Orchestrator)"]
    Composer["ExperienceComposer\n(Attention Layer Mapping)"]
    Safety["SafetyPolicyFilter\n(DTI > 0.40 → Suppress)"]
    BehavEngine2["BehavioralEngine\n(Time-Aware Context)"]
    ExperienceConfig["ExperienceConfig JSON\n• hero_card: 'EMI Due Tomorrow'\n• context_cards: [\n {layer: DO, title: 'Pay EMI'},\n {layer: KNOW, title: 'Spending Up 12%'},\n {layer: PLAN, title: 'SIP Investment'}\n]\n• primary_actions: ['Pay', 'Transfer']\n• deprioritized: ['Personal Loan']"]
    
    StateService2 --> Composer --> Safety --> ExperienceConfig
    BehavEngine2 --> Composer
  end

  subgraph FrontendLayer["Frontend Layer (Lakshya)"]
    direction TB
    AppNavigator["AppNavigator\n(Custom Zustand Router)"]
    AdaptiveHome["AdaptiveHomeScreen\n(Renders SDUI Config)"]
    HeroCard["Hero Card Component\n(Dynamic based on state)"]
    ContextCards["Context Card Stack\n(DO → KNOW → PLAN → CONSIDER)"]
    ActionBar["Primary Action Bar\n(Dynamic buttons)"]
    
    AppNavigator --> AdaptiveHome
    AdaptiveHome --> HeroCard
    AdaptiveHome --> ContextCards
    AdaptiveHome --> ActionBar
  end

  CustomerState -->|"contracts/customer-state.schema.json"| StateService2
  ExperienceConfig -->|"contracts/experience.schema.json"| AppNavigator

  style AILayer fill:#f3e5f5
  style BackendLayer fill:#fff3e0
  style FrontendLayer fill:#e3f2fd
```

---

### Complete Data Pipeline Architecture

This diagram traces how raw banking data from 7 distinct sources flows through the entire system — from ingestion through harmonization, feature extraction, signal detection, personalization, compliance, cryptographic logging, experience composition, safety filtering, and finally to the adaptive mobile UI.

```mermaid
flowchart TD
  subgraph Sources["7 Raw Data Sources"]
    CBS2["Core Banking\nSystem (CBS)"]
    UPI2["UPI Transaction\nLogs"]
    SMS2["Android SMS\nParser"]
    CIBIL2["CIBIL Credit\nBureau"]
    BBPS2["BBPS Bill\nPayments"]
    NCMC2["NCMC Metro\nCard Data"]
    KYC2["KYC/Demographics"]
  end

  subgraph Ingestion2["Data Ingestion (ai/intelligence/ingestion/)"]
    MD5["MD5 Deduplication\n(Idempotent Transaction IDs)"]
    ISOParse["ISO 8601 Date\nNormalization"]
    ConflictRes["Balance Conflict Resolution\n(balance_conflicts_resolved)"]
    InMemCache["O(1) In-Memory\nFeature Cache"]
  end

  subgraph Features2["Feature Extraction (ai/intelligence/features/)"]
    FiftyThirtyTwenty["50/30/20 Rule Analysis\n(Needs/Wants/Savings Split)"]
    NineCategories["9-Category Spend\nBreakdown"]
    ThirtyDayForecast["30-Day Cash Flow\nRunway Forecast"]
    ThirtyTwoMetrics["32 Single-Pass\nFeature Metrics"]
  end

  subgraph Signals2["Signal Detection (ai/intelligence/signals/)"]
    BehavSignals["Behavioral Signals\n(Commute Pattern, Dining,\nCinema, Weekend Habits)"]
    FinSignals["Financial Signals\n(DTI Ratio, EMI Pressure,\nSavings Decline, Risk Score)"]
    LifeSignals["Lifecycle Signals\n(Medical Emergency, Marriage,\nJob Change, Retirement)"]
  end

  subgraph StateGen2["Customer State (ai/intelligence/customer_state/)"]
    DualCadence["Dual Cadence Controller\n(14-day Macro + 0.162ms Micro)"]
    StateBuilder["Customer State Builder\n(financial_health Classification)"]
    HealthClass["Financial Health:\nthriving | stable | tight | stress"]
  end

  subgraph PersonalizationEng["Personalization (ai/intelligence/personalization/)"]
    MultiFactorScorer["Multi-Factor Utility Scorer\n30% Affordability\n30% Lifecycle Match\n25% Urgency\n15% Archetype Fit\n− Risk Penalty"]
    ArchetypeMatch["7 Bharat Archetypes\n(urban_commuter, rural_farmer,\nsalaried_professional, student,\nsmall_business_owner,\nretired_senior, gig_worker)"]
    RBICompliance["RBI Compliance Check\n(DTI > 0.40 → Suppress All Credit)"]
    DPDPCheck["DPDP Purpose Limitation\n(Data Protection Compliance)"]
    CryptoLedger2["SHA-256 Crypto Ledger\n(Tamper-Proof Decision Chain)"]
  end

  subgraph ExperienceComp["Experience Composition (apps/backend/)"]
    AttentionLayers["Attention Layer Classification\n• DO: Immediate (EMI Due)\n• KNOW: Awareness (Spend ↑12%)\n• PLAN: Future (SIP, Insurance)\n• CONSIDER: Low Priority"]
    HeroCardGen["Hero Card Generation\n(Most Urgent Item)"]
    SafetyPolicyFilter["Safety Policy Filter\n(Block Predatory Lending\nfor Stressed Customers)"]
    ModuleComposition["Dynamic Module\nComposition"]
  end

  subgraph UIRender["Adaptive UI Render"]
    AdaptiveUI["AdaptiveHomeScreen\n(Morphs Per State)"]
    NormalUI["Normal State:\nStandard Dashboard"]
    StressUI["Stress State:\nEmpathetic Hero Card\n+ Hidden Utility Widgets"]
    MedicalUI["Medical State:\nMedical Assistance\nProminent"]
  end

  Sources --> Ingestion2
  MD5 --> ISOParse --> ConflictRes --> InMemCache
  Ingestion2 --> Features2
  FiftyThirtyTwenty --> ThirtyTwoMetrics
  NineCategories --> ThirtyTwoMetrics
  ThirtyDayForecast --> ThirtyTwoMetrics
  Features2 --> Signals2
  Signals2 --> StateGen2
  DualCadence --> StateBuilder --> HealthClass
  StateGen2 --> PersonalizationEng
  MultiFactorScorer --> RBICompliance
  ArchetypeMatch --> MultiFactorScorer
  RBICompliance --> DPDPCheck --> CryptoLedger2
  PersonalizationEng -->|"customer-state.json"| ExperienceComp
  AttentionLayers --> HeroCardGen
  HeroCardGen --> SafetyPolicyFilter --> ModuleComposition
  ExperienceComp -->|"experience-config.json"| UIRender
  HealthClass -->|"stress"| StressUI
  HealthClass -->|"thriving/stable"| NormalUI
  HealthClass -->|"medical_event"| MedicalUI
```

---

### Runtime Deployment Architecture

```mermaid
flowchart TD
  subgraph DevMachine["Developer Machine"]
    VSCode["VS Code / IDE"]
    Git["Git Repository"]
  end

  subgraph DockerEnv["Docker Environment"]
    PostgresContainer["postgres:16-alpine\n Port 5432\n Volume: postgres_data\n Healthcheck: pg_isready"]
  end

  subgraph PythonRuntime["Python Runtime"]
    FastAPIServer["FastAPI + Uvicorn\nPort 8000\n• 15+ REST Endpoints\n• CORS Middleware\n• Inspector Dashboards"]
    AIPipeline["AI Intelligence Pipeline\n• Feature Extraction\n• Signal Detection\n• Personalization\n• Crypto Ledger"]
  end

  subgraph MobileRuntime["Mobile Runtime"]
    ExpoDevServer["Expo Dev Server\n(Metro Bundler)"]
    ExpoGoApp["Expo Go App\n(Physical Device)"]
    ONNXRuntime["ONNX Runtime\n(On-Device ML)"]
    MiniCPMRuntime["MiniCPM-5 INT4 SLM\n(~1.85GB RAM on NPU)"]
  end

  subgraph ProductionHint["Production (Referenced)"]
    AWSRDS["AWS RDS PostgreSQL\n(Tunnel via localhost:5433)"]
  end

  DevMachine --> DockerEnv
  DevMachine --> PythonRuntime
  DevMachine --> MobileRuntime
  FastAPIServer --> PostgresContainer
  FastAPIServer --> AIPipeline
  ExpoDevServer --> ExpoGoApp
  ExpoGoApp --> ONNXRuntime
  ExpoGoApp --> MiniCPMRuntime
  ExpoGoApp -->|"REST API"| FastAPIServer
  PostgresContainer -.->|"Production Tunnel"| AWSRDS
```

---

### Contract Boundary Architecture

The three JSON Schema contracts enforce strict boundaries between independently-developed components. Each contract is frozen — changes require consensus from all three team members.

```mermaid
flowchart TB
  subgraph AIBoundary["AI Domain (Ubaid)\nai/"]
    AIIngest["Data Ingestion\n(7 Sources)"]
    AIFeatures["Feature Extraction\n(32 Metrics)"]
    AISignals["Signal Detection"]
    AIPersonalize["Personalization Engine"]
    AICrypto["Crypto Ledger"]
    AIVoice["Voice SLM\n(MiniCPM-5)"]
  end

  subgraph Contract1["customer-state.schema.json"]
    CS["CustomerState\n• financial_health\n• signals[]\n• recommendations[]\n (each has suppressed flag)"]
  end

  subgraph Contract2["experience.schema.json"]
    EC["ExperienceConfig\n• hero_card\n• context_cards[]\n (DO/KNOW/PLAN/CONSIDER)\n• primary_actions[]\n• deprioritized_modules[]"]
  end

  subgraph Contract3["voice-intent.schema.json"]
    VI["VoiceIntent\n• intent (PAY_METRO, etc.)\n• language (en/hi/gu)\n• entities[]\n• response_text\n• confidence"]
  end

  subgraph BackendBoundary["Backend Domain (Harsh)\napps/backend/"]
    BEState["StateService"]
    BEComposer["ExperienceComposer"]
    BESafety["SafetyPolicyFilter"]
    BEBehavior["BehavioralEngine"]
    BEAuth["PIN Auth"]
    BEData["DataLoader + Repositories"]
  end

  subgraph FrontendBoundary["Frontend Domain (Lakshya)\napps/frontend/"]
    FENav["AppNavigator"]
    FEHome["AdaptiveHomeScreen"]
    FEChat["MitraChatScreen"]
    FEPay["PaymentsScreen"]
    FEStore["Zustand Store"]
  end

  AIPersonalize --> Contract1
  Contract1 --> BEState
  AICrypto --> Contract1
  
  BEComposer --> Contract2
  BESafety --> Contract2
  Contract2 --> FEStore
  
  AIVoice --> Contract3
  Contract3 --> BEState

  style Contract1 fill:#ffecb3,stroke:#ff8f00,stroke-width:3px
  style Contract2 fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
  style Contract3 fill:#bbdefb,stroke:#1565c0,stroke-width:3px
```

---

### Dual AI Architecture

A critical architectural decision: the system uses two completely separate AI systems with a hard boundary between them. The Backend AI makes all financial decisions using deterministic math. The On-Device SLM handles only natural language — it NEVER makes financial decisions and NEVER sees transaction data.

```mermaid
flowchart LR
  subgraph BackendAI["Backend Deterministic AI\n(Decision-Making Authority)"]
    direction TB
    MathScorer["Multi-Factor Utility Scorer\n(Pure Mathematics)"]
    DTICalc["DTI Ratio Calculator\n(Debt-to-Income)"]
    SpendCalc["50/30/20 Spend Analyzer"]
    CashFlow["30-Day Cash Flow Forecaster"]
    XGBoost["XGBoost Propensity"]
    KMeans["KMeans Archetype Clustering"]
    UCBBandit["UCB Exploration Bandit"]
    
    MathScorer --> DTICalc
    DTICalc --> SpendCalc
    SpendCalc --> CashFlow
  end

  subgraph HardBoundary["HARD BOUNDARY\n(No Financial Data Crosses)"]
    Wall["Zero Banking Data\nLeakage Policy"]
  end

  subgraph DeviceSLM["On-Device SLM\n(Language-Only Authority)"]
    direction TB
    MiniCPM2["MiniCPM-5 INT4\n(~1.85GB RAM on NPU)"]
    VernacularNLP["Vernacular NLP\n(Hindi/Gujarati/Hinglish/EN)"]
    IntentExtract["Intent Extraction\n(PAY_METRO, CHECK_EMI)"]
    ResponseVerb["Response Verbalization\n(Pre-Computed Facts Only)"]
    
    MiniCPM2 --> VernacularNLP
    VernacularNLP --> IntentExtract
    IntentExtract --> ResponseVerb
  end

  BackendAI -->|"Decisions,\nRecommendations,\nSuppressions"| HardBoundary
  HardBoundary -->|"Only: Trusted Facts\n(Balance, Due Date,\nStatus)"| DeviceSLM

  style HardBoundary fill:#ffcdd2,stroke:#c62828,stroke-width:4px
  style BackendAI fill:#e8f5e9
  style DeviceSLM fill:#e3f2fd
```

---

### Graceful Degradation Architecture

The system is designed to never fail completely. Multiple fallback layers ensure the app remains functional even when backend services or the database are unavailable.

```mermaid
stateDiagram-v2
  [*] --> Normal: App Starts

  state Normal {
    [*] --> LiveAPI: Backend Reachable
    LiveAPI --> DBOnline: PostgreSQL Healthy
    DBOnline --> AIPipeline: AI Pipeline Runs
    AIPipeline --> FullExperience: Complete SDUI Response
  }

  state BackendDegraded {
    [*] --> Timeout: 2.5s AbortController
    Timeout --> EdgeEngine: MiniCPM5EdgeEngine
    EdgeEngine --> OfflineState: Apply Cached/Default State
    OfflineState --> OfflineUI: Render Offline Bundle
  }

  state DatabaseDegraded {
    [*] --> DBOffline: PostgreSQL Unreachable
    DBOffline --> JSONFallback: DataLoader Detects Failure
    JSONFallback --> SeedCustomers: data/seed/customers.json
    JSONFallback --> SeedTransactions: data/seed/transactions.json
    JSONFallback --> ScenarioOverride: data/scenarios/*.json
  }

  state AIDegraded {
    [*] --> PipelineCrash: AI Pipeline Exception
    PipelineCrash --> SafeFallback: _create_safe_fallback_state
    SafeFallback --> GenericProfile: Generic Valid Customer Profile
  }

  Normal --> BackendDegraded: Network Timeout
  Normal --> DatabaseDegraded: DB Connection Failed
  Normal --> AIDegraded: Python Exception
  BackendDegraded --> Normal: Connectivity Restored
  DatabaseDegraded --> Normal: DB Restored
  AIDegraded --> Normal: Next Request Succeeds
```

---

## Feature Overview

### Feature Map Diagram

```mermaid
flowchart TD
  subgraph FrontendFeatures["Frontend Features"]
    F1["Adaptive Home Screen\n(Dynamic Dashboard)"]
    F2["Mitra AI Assistant\n(Voice + Chat)"]
    F3["1-Tap Payments\n(Biometric Auth)"]
    F4["Card Controls\n(Lock/Unlock/Limits)"]
    F5["Multilingual UI\n(EN/HI/GU)"]
    F6["Demo Scenario Switcher"]
    F7["SDUI Renderer\n(Dumb UI Layer)"]
    F8["Offline State Bundles"]
  end

  subgraph AIFeatures["AI Features"]
    A1["Ethical AI Personalization\n(Multi-Factor Scoring)"]
    A2["7 Bharat Archetypes"]
    A3["Financial Health Assessment\n(DTI/EMI/Savings)"]
    A4["Multi-Source Data Ingestion\n(7 Sources, MD5 Dedup)"]
    A5["Safe-to-Spend Analysis\n(50/30/20 + 30-Day Forecast)"]
    A6["Behavioral Context Engine\n(Time-Aware Suggestions)"]
    A7["Cryptographic Decision Ledger\n(SHA-256 Chain)"]
  end

  subgraph BackendFeatures["Backend Features"]
    B1["Experience Composer\n(SDUI Generation)"]
    B2["Safety Policy Filter\n(Anti-Predatory Lending)"]
    B3["PIN Authentication\n(PBKDF2-HMAC-SHA256)"]
    B4["Loan Disbursement\n(Max ₹1,50,000)"]
    B5["Inspector Dashboards\n(AI Debug Tools)"]
  end

  subgraph Tools["Developer Tools"]
    T1["AI Inspector Dashboard"]
    T2["Voice SLM Simulator"]
    T3["Prisma Studio"]
    T4["Audit Suite (39 Checks)"]
  end

  A1 --> B1
  A3 --> B2
  A4 --> A1
  A6 --> B1
  B1 --> F1
  B2 --> F1
  B3 --> F3
  A2 --> A1
  A7 --> A1
  F2 --> A5
```

### Feature Inventory (18 Features)

| # | Feature | What It Does | Implementation | APIs | Dependencies |
|---|---------|-------------|----------------|------|-------------|
| 1 | **Adaptive Home Screen** | Dashboard morphs based on financial state (normal/stress/medical/fraud) — different hero cards, context cards, and action modules per state | `apps/frontend/src/features/home/AdaptiveHomeScreen` | GET `/experience/{id}` | ExperienceComposer, SafetyPolicy |
| 2 | **Mitra AI Assistant** | Vernacular voice & chat supporting Hindi, Gujarati, Hinglish, English with structured action chips and navigation routing | `apps/frontend/src/features/assistant/MitraChatScreen`, `ai/voice/` | POST `/assistant/intent`, `/assistant/chat`, GET `/assistant/init` | MiniCPM-5 SLM, IntentClassifier |
| 3 | **Ethical AI Personalization** | Multi-factor scoring (30% affordability + 30% lifecycle + 25% urgency + 15% archetype − risk penalty) with mandatory suppression for stressed customers | `ai/intelligence/personalization/scorer.py`, `compliance.py`, `cryptoledger.py` | — | RBI DTI caps, DPDP compliance |
| 4 | **Server-Driven UI** | Backend generates complete UI specification; frontend is a dumb renderer | `apps/backend/app/experience/composer.py` | GET `/experience/{id}` | ExperienceConfig contract |
| 5 | **Bharat Archetypes** | 7 Indian-market customer archetypes (urban_commuter, rural_farmer, salaried_professional, small_business_owner, student, retired_senior, gig_worker) with 15% weight in recommendation scoring | `ai/intelligence/personalization/scorer.py` | — | KMeans clustering |
| 6 | **Multi-Source Data Ingestion** | Ingests and harmonizes 7 banking data sources (CBS, UPI, SMS, CIBIL, BBPS, NCMC, KYC) with MD5 deduplication, ISO date normalization, and conflict resolution | `ai/intelligence/ingestion/harmonizer.py` | — | In-memory feature cache |
| 7 | **Financial Health Assessment** | Classifies customers as thriving/stable/tight/stress based on DTI ratio, EMI pressure, declining savings, and 30-day runway forecast | `ai/intelligence/signals/financial.py`, `detector.py` | — | Feature extractor |
| 8 | **Behavioral Context Engine** | Detects habits (metro commute, dining, cinema) and provides time-aware suggestions (Mon-Fri 07:45-09:30 → commute prompt) | `apps/backend/app/services/behavior_engine.py` | — | datetime.now(), transactions |
| 9 | **1-Tap Payments** | Instant recurring mandate payments with biometric authentication — tap → biometric → animated checkmark → never leaves screen | `apps/frontend/src/state/customerStore.ts` | POST `/payments/transfer` | expo-local-authentication |
| 10 | **Card Controls** | Lock/unlock debit/credit cards and set ATM/POS/online limits; locked cards block payment execution | `apps/backend/app/api/routes.py` | GET `/cards/{id}`, POST `/cards/controls` | _card_controls state |
| 11 | **Loan Disbursement** | Instant credit up to ₹1,50,000 — credits balance and emits event for state refresh | `apps/backend/app/services/state_service.py` | POST `/loans/disburse` | SafetyPolicyFilter |
| 12 | **PIN Authentication** | Secure PIN with PBKDF2-HMAC-SHA256 (100k iterations), 16-byte random salt, constant-time `hmac.compare_digest`, and rate limiting (5 failures → 15-min lockout) | `apps/backend/app/services/state_service.py` | POST `/auth/pin/setup`, `/auth/pin/verify` | secrets, hmac |
| 13 | **Graceful Degradation** | Multi-layer fallback: backend timeout (2.5s) → edge ONNX processing; DB offline → JSON seed files; AI crash → safe fallback state | `apps/frontend/src/services/api.ts`, `apps/backend/app/db/loader.py` | — | Edge engine, seed data |
| 14 | **Demo & Scenario System** | Switch between pre-built scenarios (normal, surplus, financial_stress, medical_event, fraud_alert, life-change) to demonstrate personalization | `data/scenarios/*.json` | POST `/scenario/switch` | StateService memory flush |
| 15 | **Cryptographic Decision Ledger** | SHA-256 tamper-proof audit chain logging every AI recommendation and suppression decision for regulatory compliance | `ai/intelligence/personalization/cryptoledger.py` | — | hashlib SHA-256 |
| 16 | **Multilingual Support** | Full UI and voice support for English, Hindi, and Gujarati with dynamic language switching | `apps/frontend/src/i18n/` (en, hi, gu) | — | MiniCPM-5 for voice |
| 17 | **Safe-to-Spend Analysis** | 50/30/20 budgeting rule (Needs/Wants/Savings) applied to spending with 9-category breakdown and 30-day cash flow forecast | `ai/intelligence/features/spend_analyzer.py`, `extractor.py` | — | Feature extraction |
| 18 | **Inspector Dashboards** | Live browser tools for debugging: AI Inspector (personalization math, crypto chain, safe-to-spend dials) and Voice Inspector (SLM simulator) | `ai/inspector.html`, `ai/voice_inspector.html` | GET `/inspector`, `/voice-inspector` | — |

---

## Repository Structure

```text
dau/
├── apps/
│  ├── backend/            # FastAPI API server (Owner: Harsh)
│  │  ├── app/
│  │  │  ├── main.py         # FastAPI init, CORS middleware, router mount
│  │  │  ├── api/
│  │  │  │  └── routes.py      # All 15+ REST endpoints
│  │  │  ├── db/
│  │  │  │  ├── session.py     # SQLAlchemy engine (auto WSL IP detection)
│  │  │  │  ├── models.py      # ORM models (Customer, Account, Transaction, etc.)
│  │  │  │  ├── loader.py      # DataLoader (PostgreSQL → JSON fallback)
│  │  │  │  ├── alembic/      # Migration versions and env.py
│  │  │  │  └── repositories/
│  │  │  │    ├── customer_repo.py
│  │  │  │    ├── transaction_repo.py
│  │  │  │    └── event_and_product_repo.py
│  │  │  ├── experience/
│  │  │  │  └── composer.py     # ExperienceComposer (State → SDUI Config)
│  │  │  ├── models/         # Pydantic schemas
│  │  │  │  ├── customer_state.py  # CustomerStateModel, Balance, Recommendation
│  │  │  │  ├── experience.py    # ExperienceConfigModel, HeroCard, ContextCard
│  │  │  │  ├── assistant.py    # AssistantIntentRequest/Response
│  │  │  │  ├── events.py      # BankingEventModel
│  │  │  │  └── voice.py      # VoiceIntentModel (legacy)
│  │  │  └── services/
│  │  │    ├── state_service.py  # Core orchestrator (state, auth, payments, loans)
│  │  │    ├── safety_policy.py  # SafetyPolicyFilter (anti-predatory lending)
│  │  │    └── behavior_engine.py # BehavioralEngine (time-aware context)
│  │  └── requirements.txt      # FastAPI, SQLAlchemy, Alembic, Pydantic, etc.
│  └── frontend/            # React Native / Expo app (Owner: Lakshya)
│    ├── App.tsx           # Entry: ThemeProvider → AppNavigator → useEffect(fetch)
│    ├── src/
│    │  ├── components/       # Reusable UI primitives
│    │  │  ├── common/       # Shared components (buttons, cards, etc.)
│    │  │  ├── context/      # Context-aware card components
│    │  │  ├── payments/      # Payment-specific components
│    │  │  └── transactions/    # Transaction list components
│    │  ├── features/        # Screen-level feature modules
│    │  │  ├── assistant/     # MitraChatScreen (AI voice/chat)
│    │  │  ├── demo/       # PrototypeLabModal, ArchitectureFlowModal
│    │  │  ├── home/       # AdaptiveHomeScreen (SDUI renderer)
│    │  │  ├── insights/     # InsightsScreen (spending analytics)
│    │  │  ├── journeys/     # Modal flows (KYC, Insurance, Medical, etc.)
│    │  │  ├── more/       # MoreViewScreen (catalog)
│    │  │  ├── onboarding/    # OnboardingModal
│    │  │  ├── payments/     # PaymentsScreen
│    │  │  ├── profile/      # ProfileScreen
│    │  │  └── transactions/   # TransactionsScreen
│    │  ├── i18n/         # Localization: en.ts, hi.ts, gu.ts
│    │  ├── motion/        # Custom Animated API transitions & gestures
│    │  ├── navigation/      # AppNavigator.tsx (custom Zustand-driven router)
│    │  ├── services/       # BankingApi.ts + MiniCPM5EdgeEngine.ts
│    │  ├── state/        # customerStore.ts (monolithic Zustand store)
│    │  ├── theme/        # ThemeContext.tsx + tokens + colors + fonts
│    │  └── types/        # TypeScript interfaces (index.ts)
│    ├── assets/          # Icons, fonts, minicpm5_slm_v1.onnx
│    ├── app.json          # Expo configuration
│    └── package.json        # Dependencies
├── ai/                # AI/ML Intelligence Engine (Owner: Ubaid)
│  ├── intelligence/         # Backend AI pipeline
│  │  ├── ingestion/
│  │  │  ├── harmonizer.py     # 7-source harmonizer (MD5 dedup, ISO dates)
│  │  │  └── models.py      # Data source models
│  │  ├── features/
│  │  │  ├── extractor.py     # 50/30/20 rule, 32 single-pass metrics
│  │  │  ├── spend_analyzer.py   # 9-category spending breakdown
│  │  │  └── forecaster.py     # 30-day cash flow runway forecast
│  │  ├── signals/
│  │  │  ├── detector.py      # Signal classification orchestrator
│  │  │  ├── behavioral.py     # Commute, dining, cinema detection
│  │  │  ├── financial.py     # DTI, risk, declining savings
│  │  │  └── lifecycle.py     # Medical, marriage, job change detection
│  │  ├── customer_state/
│  │  │  ├── generator.py     # Dual cadence (14-day batch + 0.162ms micro)
│  │  │  ├── cadence.py      # Cadence control logic
│  │  │  └── schemas.py      # State schemas
│  │  ├── personalization/
│  │  │  ├── scorer.py       # Multi-factor utility (0.30+0.30+0.25+0.15−risk)
│  │  │  ├── compliance.py     # RBI DTI caps + DPDP limitations
│  │  │  └── cryptoledger.py    # SHA-256 tamper-proof decision chain
│  │  ├── recommendations/
│  │  │  ├── rules.py       # Recommendation business rules
│  │  │  └── scoring.py      # Offer ranking + ethical suppression
│  │  ├── explanations/       # Counterfactual explanations for transparency
│  │  └── ml/            # Machine Learning subsystem
│  │    ├── propensity/      # ONNX propensity model (ml_propensity_prob)
│  │    ├── embeddings/      # Cosine similarity embeddings
│  │    ├── clustering/      # KMeans archetype soft-clustering
│  │    └── bandit/        # UCB exploration/exploitation bandit
│  ├── voice/            # On-device SLM voice pipeline
│  │  ├── model/minicpm5_runner.py # MiniCPM-5 INT4 runner (~1.85GB, NPU)
│  │  ├── inference/        # End-to-end voice processing
│  │  ├── intents/
│  │  │  ├── classifier.py     # Intent classification
│  │  │  └── handlers.py      # Handlers (PAY_METRO, CHECK_EMI, etc.)
│  │  ├── prompts/         # Zero-leakage system prompts
│  │  └── dialogue/         # Dialogue state management
│  ├── tests/            # 45 tests, 0.39s total
│  ├── run.py            # Intelligence entrypoint
│  ├── run_voice.py         # Voice entrypoint
│  ├── inspector.html        # AI decision debugging dashboard
│  ├── voice_inspector.html     # SLM simulator dashboard
│  └── requirements.txt       # NumPy, SciPy, scikit-learn, ONNX Runtime
├── contracts/             # JSON Schema contracts (shared, frozen)
│  ├── customer-state.schema.json  # AI → Backend (financial_health, signals, recs)
│  ├── experience.schema.json    # Backend → Frontend (hero, cards, actions)
│  └── voice-intent.schema.json   # Voice → Backend (intent, lang, entities)
├── data/
│  ├── seed/             # customers.json (1.2k), transactions.json (127k+)
│  └── scenarios/          # normal.json, financial-stress.json, life-change.json
├── prisma/schema.prisma       # Introspection-only (9 models, not for migrations)
├── scripts/
│  ├── audit_and_verify_all.py    # 39-check validation suite (~540 lines)
│  ├── generate_seed_data.py     # Mock data generator (1.2k profiles, 127k txns)
│  ├── seed_database.py       # Bulk DB seeder (batches of 10,000)
│  ├── run-demo.ps1 / run-demo.sh  # Demo launcher scripts
│  ├── export_onnx_meta.py      # ONNX model metadata export
│  └── test_ondevice_intent.js    # On-device intent test (Node.js)
├── docs/               # Comprehensive documentation (13 files)
├── docker-compose.yml        # PostgreSQL 16 (Alpine)
├── alembic.ini            # Migration config → apps/backend/app/db/alembic
├── package.json           # Prisma tooling (db:studio, db:introspect)
├── .env.example           # Environment template
├── .github/CODEOWNERS        # Domain ownership enforcement
└── .gitignore            # Exclusion patterns
```

### Monorepo Dependency Diagram

```mermaid
flowchart TD
  subgraph SharedContracts["Shared Contracts (Frozen)"]
    CSSchema["customer-state.schema.json"]
    EXSchema["experience.schema.json"]
    VISchema["voice-intent.schema.json"]
  end

  subgraph SharedData["Shared Data"]
    SeedData["data/seed/\n(customers.json\ntransactions.json)"]
    Scenarios["data/scenarios/\n(normal, stress, medical,\nfraud, life-change)"]
  end

  subgraph Backend2["apps/backend/ (Harsh)"]
    BERoutes["routes.py"]
    BEServices["services/"]
    BEExperience["experience/"]
    BEDB["db/ + repositories/"]
  end

  subgraph Frontend2["apps/frontend/ (Lakshya)"]
    FEScreens["features/"]
    FEStore["state/customerStore.ts"]
    FEServices2["services/api.ts"]
    FEEdge["services/MiniCPM5EdgeEngine.ts"]
  end

  subgraph AIModule["ai/ (Ubaid)"]
    AIIntelligence["intelligence/"]
    AIVoice2["voice/"]
    AITests["tests/"]
    AIML["ml/"]
  end

  subgraph Scripts2["scripts/"]
    Audit["audit_and_verify_all.py"]
    Seeder["seed_database.py"]
    Generator["generate_seed_data.py"]
  end

  %% Dependencies
  AIIntelligence -->|"Python import"| Backend2
  AIVoice2 -->|"Python import"| Backend2
  CSSchema -->|"Validates"| Backend2
  EXSchema -->|"Validates"| Frontend2
  VISchema -->|"Validates"| Backend2
  SeedData -->|"Fallback data"| BEDB
  Scenarios -->|"Demo overrides"| BEServices
  FEServices2 -->|"HTTP REST"| BERoutes
  FEEdge -->|"Offline fallback"| FEStore
  Seeder -->|"Populates"| BEDB
  Audit -->|"Validates"| AIModule

  style SharedContracts fill:#ffecb3,stroke:#f57f17
  style SharedData fill:#e0f7fa,stroke:#00838f
```

---

## Team Ownership

| Member | Role | Domain Ownership |
|--------|------|-----------------|
| **Harsh Solanki** | Team Lead, Backend | `apps/backend/`, system architecture, integration |
| **Panchal Lakshya** | Frontend | `apps/frontend/`, adaptive UI, animations, voice UI |
| **Ubaid Khan** | AI/ML | `ai/`, feature extraction, signals, recommendations, voice SLM |

**Shared ownership**: `contracts/`, `data/`, `docs/`, `scripts/`

> Note: **Strict Rule**: Team members must NOT edit other domains' folders. Changes to `contracts/` require consensus from all three members. Enforced via [`.github/CODEOWNERS`](.github/CODEOWNERS).

---

## Core Contracts

### Contract Flow Diagram

```mermaid
flowchart LR
  subgraph Producer1["AI Engine"]
    AIOut["Customer State\nGenerator"]
  end

  subgraph Contract_CS["customer-state.schema.json\n(JSON Schema Draft-07)"]
    CSFields["• financial_health: thriving|stable|tight|stress\n• signals: [{type, confidence, source}]\n• recommendations: [{product_id, score,\n category, suppressed: bool,\n explanation}]"]
  end

  subgraph Producer2["Voice SLM"]
    VoiceOut["MiniCPM-5 Intent\nClassifier"]
  end

  subgraph Contract_VI["voice-intent.schema.json\n(JSON Schema Draft-07)"]
    VIFields["• intent: PAY_METRO|CHECK_EMI|...\n• language: en|hi|gu\n• entities: [{type, value}]\n• response_text: string\n• confidence: 0.0-1.0"]
  end

  subgraph Consumer1["Backend"]
    BEConsume["StateService\n+ ExperienceComposer"]
  end

  subgraph Contract_EX["experience.schema.json\n(JSON Schema Draft-07)"]
    EXFields["• hero_card: {title, subtitle, type, actions}\n• context_cards: [{layer: DO|KNOW|PLAN|CONSIDER,\n title, body, icon, actions}]\n• primary_actions: [{label, route}]\n• deprioritized_modules: [string]"]
  end

  subgraph Consumer2["Frontend"]
    FEConsume["Zustand Store →\nAdaptiveHomeScreen"]
  end

  AIOut -->|"Produces"| Contract_CS
  Contract_CS -->|"Consumed by"| BEConsume
  VoiceOut -->|"Produces"| Contract_VI
  Contract_VI -->|"Consumed by"| BEConsume
  BEConsume -->|"Produces"| Contract_EX
  Contract_EX -->|"Consumed by"| FEConsume

  style Contract_CS fill:#ffecb3,stroke:#ff8f00,stroke-width:3px
  style Contract_VI fill:#bbdefb,stroke:#1565c0,stroke-width:3px
  style Contract_EX fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
```

### Contract Schema Details

| Contract | File | Producer → Consumer | Key Fields |
|----------|------|---------------------|------------|
| **CustomerState** | [`customer-state.schema.json`](contracts/customer-state.schema.json) | AI → Backend | `financial_health` (thriving/stable/tight/stress), `signals[]`, `recommendations[]` (each with `suppressed` flag for ethical filtering) |
| **ExperienceConfig** | [`experience.schema.json`](contracts/experience.schema.json) | Backend → Frontend | `hero_card`, `context_cards[]` (organized by DO/KNOW/PLAN/CONSIDER attention layers), `primary_actions[]`, `deprioritized_modules[]` |
| **VoiceIntent** | [`voice-intent.schema.json`](contracts/voice-intent.schema.json) | Voice → Backend | `intent` (PAY_METRO, CHECK_EMI, LOCK_CARD, PAY_BILL), `language` (en/hi/gu), `entities[]`, `response_text`, `confidence` |

---

## Technology Stack

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| API Framework | FastAPI | ≥0.110.0 | Async REST API with auto-generated OpenAPI docs |
| ASGI Server | Uvicorn | ≥0.28.0 | High-performance Python web server |
| ORM | SQLAlchemy | ≥2.0.0 | Database abstraction with declarative models |
| Migrations | Alembic | ≥1.13.0 | Database schema version control |
| Validation | Pydantic | ≥2.0.0 | Request/response schema validation |
| Schema Validation | jsonschema | ≥4.0.0 | Contract schema validation (Draft-07) |
| HTTP Client | httpx | ≥0.27.0 | Async HTTP requests |
| DB Driver | psycopg (binary) | ≥3.1.0 | PostgreSQL adapter |
| Testing | pytest | ≥8.0.0 | Test framework |

### Frontend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React Native | 0.86.3 | Cross-platform mobile |
| Platform | Expo | ^57.0.22 | Managed workflow + build tooling |
| UI | React | 19.2.3 | Component rendering |
| State | Zustand | ^5.0.15 | Lightweight global state management |
| Icons | lucide-react-native | — | SVG icon library |
| ML Runtime | onnxruntime-react-native | — | On-device ML inference |
| Biometrics | expo-local-authentication | — | Fingerprint/FaceID authentication |
| Secure Storage | expo-secure-store | — | Encrypted key-value storage |

### AI Engine
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Validation | Pydantic | ≥2.0.0 | Data model validation |
| Numerics | NumPy | ≥1.26.0 | Array operations, feature computation |
| Statistics | SciPy | ≥1.12.0 | Statistical analysis |
| ML | scikit-learn | ≥1.4.0 | KMeans clustering, propensity |
| ML Runtime | ONNX Runtime | ≥1.20.0 | Model inference (<10ms latency) |
| Serialization | joblib | ≥1.3.0 | Model persistence |
| On-Device SLM | MiniCPM-5 INT4 | ~1.85GB RAM | Vernacular NLP on Snapdragon/Apple NPUs |

### Infrastructure
| Component | Technology | Configuration |
|-----------|-----------|--------------|
| Database | PostgreSQL 16 (Alpine) | Docker, port 5432, volume `postgres_data` |
| Containerization | Docker Compose | Single `db` service with `pg_isready` healthcheck |
| Schema Viewer | Prisma Studio | Introspection only (`prisma db pull`) |

---

## Backend Architecture — Deep Dive

### Backend Layer Architecture Diagram

```mermaid
flowchart TD
  subgraph EntryPoint["Entry Point"]
    MainPy2["main.py\n• FastAPI() init\n• CORSMiddleware (allow_origins=[*])\n• Router mount (/api/v1)\n• Static file serving\n (/inspector, /voice-inspector)"]
  end

  subgraph APILayer["API Layer (routes.py)"]
    CoreRoutes["Core Routes\n• GET /customer/{id}\n• GET /experience/{id}"]
    AuthRoutes["Auth Routes\n• POST /auth/pin/setup\n• POST /auth/pin/verify"]
    PayRoutes["Payment Routes\n• POST /payments/transfer\n• POST /loans/disburse"]
    CardRoutes["Card Routes\n• GET /cards/{id}\n• POST /cards/controls"]
    AssistantRoutes["Assistant Routes\n• GET /assistant/init\n• POST /assistant/chat\n• POST /assistant/intent"]
    EventRoutes["Event Routes\n• POST /events\n• POST /scenario/switch"]
  end

  subgraph ServiceLayer["Service Layer"]
    StateService2["StateService\n(Core Orchestrator)\n• get_state() → cache/DB/AI/fallback\n• switch_scenario() → flush + reload\n• ingest_event() → balance + signals\n• execute_payment() → lock + funds + ledger\n• disburse_loan() → max ₹1,50,000\n• set/verify_customer_pin()\n• submit_kyc(), submit_medical_claim()\n• pause_mandate(), request_emi_grace()\n• split_emi(), sweep_deficit_for_emi()"]
    SafetyPolicy2["SafetyPolicyFilter\n• evaluate_financial_stress()\n (DTI > 0.40 or EMI pressure)\n• filter_recommendations()\n (suppress loan/payday/credit)\n• apply_module_policies()\n (restrict loan module,\n prioritize cashflow advisory)"]
    BehaviorEngine2["BehavioralEngine\n• analyze_habits()\n (recurring txn → daily/weekly)\n• evaluate_current_relevance()\n (datetime.now() → contextual hints\n Mon-Fri 07:45-09:30 = commute)"]
  end

  subgraph ExperienceLayer["Experience Layer"]
    ExpComposer2["ExperienceComposer\n• compose(state, recommendations)\n → ExperienceConfigModel\n• _determine_layer(priority)\n → DO|KNOW|PLAN|CONSIDER\n• Build hero_card\n• Build context_cards[]\n• Compute primary_actions[]\n• Mark deprioritized_modules[]"]
  end

  subgraph DataLayer2["Data Access Layer"]
    DataLoader2["DataLoader\n• Try PostgreSQL via repos\n• Catch SQLAlchemy exceptions\n• Fallback to JSON files\n (data/seed/*.json,\n data/scenarios/*.json)"]
    Repos["Repositories\n• CustomerRepository\n (get_by_id, get_summary)\n• TransactionRepository\n (get_by_customer, get_by_account)\n• EventRepository\n• ProductRepository"]
    Session["session.py\n• SQLAlchemy Engine\n• Connection pooling\n• Auto WSL IPv4 detection\n (PowerShell Get-NetNeighbor)\n• Fallback to localhost"]
  end

  subgraph PydanticModels["Pydantic Schemas"]
    CustState["CustomerStateModel\n(customer_id, financial_health,\nbalances, signals, recommendations)"]
    ExpConfig["ExperienceConfigModel\n(hero_card, context_cards,\nprimary_actions, deprioritized)"]
    AssistModel["AssistantIntentRequest/Response"]
    EventModel["BankingEventModel"]
  end

  subgraph ExternalAI["External AI Pipeline"]
    AIExtractor["ai.intelligence.features.extractor"]
    AIGenerator["ai.intelligence.customer_state.generator"]
    AIClassifier["ai.voice.intents.classifier"]
  end

  EntryPoint --> APILayer
  APILayer --> ServiceLayer
  ServiceLayer --> ExperienceLayer
  ServiceLayer --> DataLayer2
  ExperienceLayer --> SafetyPolicy2
  DataLayer2 --> PostgreSQL2[("PostgreSQL 16")]
  DataLoader2 -.->|"Fallback"| JSONFiles["JSON Seed Files"]
  StateService2 -->|"Python import"| ExternalAI
```

### Request Lifecycle — Complete Sequence Diagram

This shows the exact execution path when a client requests `GET /experience/{customer_id}` — the most important endpoint that drives the entire adaptive UI:

```mermaid
sequenceDiagram
  participant Client as Mobile App
  participant CORS as CORS Middleware
  participant Router as routes.py
  participant State as StateService
  participant Cache as Memory Cache
  participant Loader as DataLoader
  participant Repo as Repository
  participant DB as PostgreSQL
  participant AI as AI Pipeline
  participant Extractor as Feature Extractor
  participant Generator as State Generator
  participant Composer as ExperienceComposer
  participant Safety as SafetyPolicyFilter
  participant Behavior as BehavioralEngine

  Client->>CORS: GET /api/v1/experience/cust_01
  CORS->>Router: Pass through (allow_origins=[*])
  Router->>State: get_state("cust_01")
  
  State->>Cache: Check memory cache
  alt Cache Hit
    Cache-->>State: Cached CustomerState
  else Cache Miss
    State->>Loader: load_customer_data("cust_01")
    Loader->>Repo: fetch_customer + transactions
    Repo->>DB: SQL SELECT queries
    alt DB Online
      DB-->>Repo: Result rows
      Repo-->>Loader: Domain objects
    else DB Offline
      Repo-->>Loader: SQLAlchemy Exception
      Loader->>Loader: Fallback to JSON
      Note over Loader: Reads data/seed/customers.json<br/>and data/seed/transactions.json
    end
    Loader-->>State: Raw customer data
    
    State->>AI: Trigger intelligence pipeline
    AI->>Extractor: extract_features(transactions)
    Note over Extractor: 50/30/20 Rule<br/>9-Category Breakdown<br/>30-Day Forecast<br/>32 Single-Pass Metrics
    Extractor-->>AI: Feature vector
    AI->>Generator: generate_state(features, signals)
    Note over Generator: Dual Cadence:<br/>14-day macro batch<br/>0.162ms micro-trigger
    alt Pipeline Success
      Generator-->>AI: CustomerState
      AI-->>State: Raw AI state
    else Pipeline Crash
      AI-->>State: Exception
      State->>State: _create_safe_fallback_state()
      Note over State: Generic valid profile<br/>for graceful degradation
    end
  end
  
  State->>Behavior: evaluate_current_relevance()
  Note over Behavior: Check datetime.now()<br/>Mon-Fri 07:45-09:30 = commute<br/>Sunday evening = dining
  Behavior-->>State: Contextual hints
  
  State->>Composer: compose(state, recommendations)
  Composer->>Composer: _determine_layer(priority)
  Note over Composer: Priority mapping:<br/>High → DO (Immediate)<br/>Medium → KNOW (Awareness)<br/>Low → PLAN (Future)<br/>Minimal → CONSIDER
  Composer->>Composer: Build hero_card
  Composer->>Composer: Build context_cards[]
  Composer->>Composer: Compute primary_actions[]
  
  Composer->>Safety: apply_policies(draft_config)
  Safety->>Safety: evaluate_financial_stress()
  Note over Safety: DTI > 0.40?<br/>Critical EMI pressure?<br/>Declining savings?
  alt Customer Stressed
    Safety->>Safety: filter_recommendations()
    Note over Safety: Suppress: loan, payday,<br/>credit, personal_loan<br/>Set suppressed=true, priority=0
    Safety->>Safety: apply_module_policies()
    Note over Safety: Restrict loan module<br/>Prioritize cashflow advisory
  end
  Safety-->>Composer: Safe ExperienceConfig
  
  Composer-->>State: ExperienceConfigModel
  State->>Cache: Store in memory
  State-->>Router: ExperienceConfigModel
  Router-->>CORS: 200 OK + JSON
  CORS-->>Client: ExperienceConfig payload
```

### All API Endpoints

**Base URL**: `http://localhost:8000` | **API Prefix**: `/api/v1`

| Category | Method | Endpoint | Purpose | Auth | Key Validation |
|----------|--------|----------|---------|------|---------------|
| **Root** | GET | `/health` | Health check | None | — |
| **Root** | GET | `/inspector` | AI decision dashboard (HTML) | None | — |
| **Root** | GET | `/voice-inspector` | SLM simulator dashboard (HTML) | None | — |
| **Core** | GET | `/api/v1/customer/{customer_id}` | Full customer state (health, signals, recs) | None | 404 if not found |
| **Core** | GET | `/api/v1/experience/{customer_id}` | SDUI experience config (hero, cards, actions) | None | 404 if not found |
| **Auth** | POST | `/api/v1/auth/pin/setup` | Cryptographic PIN creation | None | PIN format |
| **Auth** | POST | `/api/v1/auth/pin/verify` | PIN verification with rate limiting | None | 403 if locked, 5 attempts max |
| **Cards** | GET | `/api/v1/cards/{customer_id}` | Card states (is_locked, limits) | None | 404 if not found |
| **Cards** | POST | `/api/v1/cards/controls` | Update card lock/limits | None | Customer exists |
| **Txns** | GET | `/api/v1/transactions/{customer_id}` | Combined runtime + historic transactions | None | 404 if not found |
| **Pay** | POST | `/api/v1/payments/transfer` | Money transfer | Card lock check | 403 if locked, 400 if insufficient |
| **Loans** | POST | `/api/v1/loans/disburse` | Instant credit (max ₹1,50,000) | None | Amount bounds |
| **AI** | GET | `/api/v1/assistant/init` | Initialize Mitra chat (greeting by language) | None | language param (en/hi/gu) |
| **AI** | POST | `/api/v1/assistant/chat` | Conversational endpoint | None | Message body |
| **AI** | POST | `/api/v1/assistant/intent` | Structured intent execution (CHECK_BALANCE, etc.) | None | Intent + language |
| **Voice** | POST | `/api/v1/voice/intent` | Legacy voice classification | None | Voice data |
| **Events** | POST | `/api/v1/events` | Generic banking event ingestion | None | BankingEventModel |
| **Demo** | POST | `/api/v1/scenario/switch` | Switch demo scenario | None | scenario + customer_id |

### Core Services Detail

**StateService** (`apps/backend/app/services/state_service.py`) — The central orchestrator:
- `get_state()`: Memory cache → DataLoader → AI pipeline → safe fallback (never fails)
- `switch_scenario()`: Flush memory cache, switch target scenario context
- `ingest_event()`: Update balance mathematically, track metadata, embed recommendation overrides
- `execute_payment()`: Verify card unlocked → check funds → credit mock ledger → emit event
- `disburse_loan()`: Up to ₹1,50,000 instant credit → credit balance → emit event
- `set_customer_pin()` / `verify_customer_pin()`: PBKDF2-HMAC-SHA256 (100k iterations), constant-time comparison, rate limiting
- `submit_kyc()`: PAN regex `^[A-Z]{5}[0-9]{4}[A-Z]$`, Aadhaar regex `^\d{12}$`
- `submit_medical_claim()`, `pause_mandate()`, `request_emi_grace()`, `split_emi()`, `sweep_deficit_for_emi()`: Simulated banking operations

**SafetyPolicyFilter** (`apps/backend/app/services/safety_policy.py`) — Ethical guardrail:
- `evaluate_financial_stress()`: DTI > 0.40 OR critical EMI pressure → stressed
- `filter_recommendations()`: Iterates recommendations; any matching `{loan, payday, credit, personal_loan}` → `suppressed=true`, `priority=0`
- `apply_module_policies()`: Restricts loan module visibility, prioritizes cashflow advisory modules

**BehavioralEngine** (`apps/backend/app/services/behavior_engine.py`) — Time-aware context:
- `analyze_habits()`: Maps recurring transactions to daily/weekly behavioral schemas
- `evaluate_current_relevance()`: `datetime.now()` → Mon-Fri 07:45-09:30 = commute prompt, Sunday evening = dining suggestion

**ExperienceComposer** (`apps/backend/app/experience/composer.py`) — SDUI generator:
- `compose()`: CustomerState + AI recommendations → ExperienceConfigModel
- `_determine_layer()`: Priority integer → DO (immediate) | KNOW (awareness) | PLAN (future) | CONSIDER (low-priority)

### State Resolution Flow

```mermaid
flowchart TD
  Start(["get_state(customer_id)"]) --> CacheCheck{"Memory\nCache Hit?"}
  CacheCheck -->|"Yes"| ReturnCached["Return Cached State\n(O(1) Lookup)"]
  CacheCheck -->|"No"| LoadData["DataLoader.load_customer_data()"]
  
  LoadData --> DBCheck{"PostgreSQL\nReachable?"}
  DBCheck -->|"Yes"| QueryDB["Query via Repositories\n• CustomerRepo.get_by_id()\n• TransactionRepo.get_by_customer()\n• EventRepo.get_events()"]
  DBCheck -->|"No (Exception)"| JSONFallback["Read JSON Seed Files\n• data/seed/customers.json\n• data/seed/transactions.json\n• data/scenarios/*.json"]
  
  QueryDB --> RunAI["Run AI Intelligence Pipeline"]
  JSONFallback --> RunAI
  
  RunAI --> AICheck{"Pipeline\nSuccess?"}
  AICheck -->|"Yes"| BuildState["Build CustomerStateModel\n+ Apply Behavioral Engine"]
  AICheck -->|"No (Exception)"| SafeFallback["_create_safe_fallback_state()\n(Generic Valid Profile)"]
  
  BuildState --> CacheStore["Store in Memory Cache"]
  SafeFallback --> CacheStore
  CacheStore --> ReturnState(["Return CustomerStateModel"])
  ReturnCached --> ReturnState
```

### Experience Composition Flow

```mermaid
flowchart TD
  Input["CustomerStateModel\n+ AI Recommendations"] --> LayerClassify["Classify into\nAttention Layers"]
  
  LayerClassify --> DO["DO Layer\n(Priority ≥ 8)\n• Overdue EMI\n• Locked Card Alert\n• Fraud Warning"]
  LayerClassify --> KNOW["KNOW Layer\n(Priority 5-7)\n• Spending Up 12%\n• Balance Alert\n• Bill Due Soon"]
  LayerClassify --> PLAN["PLAN Layer\n(Priority 3-4)\n• SIP Investment\n• Insurance Renewal\n• Tax Planning"]
  LayerClassify --> CONSIDER["CONSIDER Layer\n(Priority 1-2)\n• Credit Card Upgrade\n• Savings Account\n• Minor Offers"]
  
  DO --> HeroCard["Generate Hero Card\n(Most Urgent DO Item)"]
  KNOW --> ContextCards["Build Context Cards[]"]
  PLAN --> ContextCards
  CONSIDER --> ContextCards
  
  HeroCard --> DraftConfig["Draft ExperienceConfig"]
  ContextCards --> DraftConfig
  
  DraftConfig --> SafetyCheck{"SafetyPolicyFilter\nStressed?"}
  SafetyCheck -->|"DTI > 0.40"| Suppress["Suppress Credit Products\n• Remove loan cards\n• Hide credit module\n• Add cashflow advisory"]
  SafetyCheck -->|"Healthy"| PassThrough["Pass Through\n(All Recommendations Visible)"]
  
  Suppress --> FinalConfig["Final ExperienceConfigModel"]
  PassThrough --> FinalConfig
  
  FinalConfig --> Output(["JSON Response to Frontend"])
```

### Safety Policy Filter Flow

```mermaid
flowchart TD
  Input2["Draft Recommendations\nfrom AI Engine"] --> StressEval{"evaluate_financial_stress()"}
  
  StressEval -->|"DTI > 0.40"| STRESSED["STRESSED"]
  StressEval -->|"Critical EMI Pressure"| STRESSED
  StressEval -->|"Declining Savings Trend"| STRESSED
  StressEval -->|"None of the Above"| HEALTHY["HEALTHY"]
  
  STRESSED --> FilterLoop["filter_recommendations()\nIterate All Recommendations"]
  
  FilterLoop --> CheckCategory{"Category Match?"}
  CheckCategory -->|"loan, payday,\ncredit, personal_loan,\ncredit_limit_increase"| SuppressRec["SET suppressed = true\nSET priority = 0\nADD explanation:\n'Suppressed due to\nfinancial stress'"]
  CheckCategory -->|"savings, insurance,\ncashflow, emergency_fund"| KeepRec["KEEP recommendation\n(May increase priority)"]
  
  SuppressRec --> ModulePolicies["apply_module_policies()"]
  KeepRec --> ModulePolicies
  
  HEALTHY --> ModulePolicies
  
  ModulePolicies --> RestrictLoan["Restrict Loan Module Display\n(if stressed)"]
  ModulePolicies --> PrioritizeCashflow["Prioritize Cashflow\nAdvisory Modules"]
  
  RestrictLoan --> SafeConfig["Safe Configuration\nOutput"]
  PrioritizeCashflow --> SafeConfig
```

### Payment Transfer — Complete Sequence Diagram

```mermaid
sequenceDiagram
  participant User as User
  participant Store as Zustand Store
  participant Bio as Biometrics
  participant API as BankingApi
  participant Routes as routes.py
  participant State as StateService
  participant Cards as _card_controls
  participant Balance as Balance Check
  participant Ledger as Mock Ledger
  participant Event as Event Emitter

  User->>Store: Tap "Pay Metro ₹40"
  Store->>Bio: requestPaymentAuth()
  Bio->>Bio: Device Biometrics / PIN
  alt Auth Failed
    Bio-->>Store: Authentication Failed
    Store-->>User: Show Error
  else Auth Success
    Bio-->>Store: Authenticated
    Store->>API: POST /payments/transfer
    API->>Routes: Route to handler
    Routes->>State: execute_payment(req)
    
    State->>Cards: Check is_locked
    alt Card Locked
      Cards-->>State: is_locked = true
      State-->>Routes: PermissionError
      Routes-->>API: 403 Forbidden
      API-->>Store: Error Response
      Store-->>User: "Card is locked"
    else Card Active
      Cards-->>State: is_locked = false
      State->>Balance: Check available >= amount
      alt Insufficient Funds
        Balance-->>State: Insufficient
        State-->>Routes: ValueError
        Routes-->>API: 400 Bad Request
        API-->>Store: Error Response
        Store-->>User: "Insufficient balance"
      else Funds Available
        Balance-->>State: Sufficient
        State->>Ledger: Generate TXN_UPI_... ID
        State->>Ledger: Prepend to _in_memory_transactions
        State->>State: Subtract from balance
        State->>Event: ingest_event(payment_event)
        Event-->>State: State refreshed
        State-->>Routes: Success + Updated Balance
        Routes-->>API: 200 OK
        API-->>Store: Update balance
        Store-->>User: Animated Checkmark
      end
    end
  end
```

### Error Handling & Graceful Degradation

| Error Condition | Detection | Response | Code |
|----------------|-----------|----------|------|
| Customer not found | `KeyError` in StateService | 404 Not Found | `HTTPException(404)` |
| Invalid input | `ValueError` / Pydantic validation | 400 Bad Request | `HTTPException(400)` |
| Card locked | `PermissionError` in execute_payment | 403 Forbidden | `HTTPException(403)` |
| PIN locked out | `failed_attempts >= 5` | 429 Rate Limited (15min) | `HTTPException(429)` |
| DB offline | `SQLAlchemy.exc` caught by DataLoader | Fallback to JSON seed files | 200 (degraded) |
| AI pipeline crash | `Exception` caught by StateService | `_create_safe_fallback_state()` | 200 (generic) |
| Insufficient funds | Balance check in execute_payment | 400 Bad Request | `HTTPException(400)` |

---

## Frontend Architecture — Deep Dive

### Frontend Architecture Diagram

```mermaid
flowchart TD
  subgraph Entry["App Entry"]
    AppTsx["App.tsx"]
    ThemeProvider["ThemeProvider\n(useAppTheme hook)"]
    Navigator["AppNavigator\n(Custom Zustand Router)"]
  end

  subgraph FeatureScreens["Feature Screens"]
    Home["AdaptiveHomeScreen\n(SDUI Renderer)"]
    Chat["MitraChatScreen\n(AI Assistant)"]
    Pay["PaymentsScreen\n(Transfer + 1-Tap)"]
    Txn["TransactionsScreen\n(Combined Ledger)"]
    Insight["InsightsScreen\n(Spending Analysis)"]
    Profile["ProfileScreen\n(Settings + KYC)"]
    More["MoreViewScreen\n(Feature Catalog)"]
  end

  subgraph JourneyModals["Journey Modals (Overlays)"]
    KYC["KycModal"]
    Insurance["InsuranceModal"]
    Medical["MedicalAssistanceModal"]
    CreditScore["CreditScoreModal"]
    Onboarding["OnboardingModal"]
    DemoLab["PrototypeLabModal"]
  end

  subgraph Components2["Reusable Components"]
    CommonComps["common/\n(AdaptiveHeader, BankingSmsToast,\nButtons, Cards, Loaders)"]
    ContextComps["context/\n(Context-Aware Card Components)"]
    PayComps["payments/\n(Payment UI Components)"]
    TxnComps["transactions/\n(Transaction List Components)"]
  end

  subgraph StateLayer["State Management"]
    ZustandStore2["useCustomerStore (Zustand)\n• activeTab, activeJourney\n• customerProfile, accountBalances\n• transactions, recommendations\n• isBalanceHidden, language\n• fetchStateAndContext()\n• requestPaymentAuth()\n• setActiveTab(), openJourney()"]
  end

  subgraph ServiceLayer2["Service Layer"]
    BankingApiClass["BankingApi (Static Class)\n• fetch + AbortController (2.5s)\n• getCustomerState()\n• getExperienceConfig()\n• executePayment()\n• verifyPin()"]
    EdgeEngineClass["MiniCPM5EdgeEngine\n• Rule-based NLP fallback\n• ONNX model inference\n• 0ms latency intent matching"]
    IntentService["onDeviceIntentService\n• PAY_METRO, CHECK_EMI\n• LOCK_CARD, PAY_BILL"]
  end

  subgraph ThemeSystem["Theme System"]
    ThemeContext["ThemeContext.tsx\n• useAppTheme() hook\n• Dynamic colors, radii, spacing\n• Typography tokens\n• Locale-aware adjustments"]
  end

  AppTsx --> ThemeProvider --> Navigator
  Navigator --> FeatureScreens
  Navigator --> JourneyModals
  FeatureScreens --> Components2
  FeatureScreens --> StateLayer
  JourneyModals --> StateLayer
  StateLayer --> ServiceLayer2
  BankingApiClass -.->|"Timeout"| EdgeEngineClass
  Components2 --> ThemeSystem
```

### Screen Navigation State Diagram

```mermaid
stateDiagram-v2
  [*] --> Home: App Launch + fetchStateAndContext()

  state TabBar {
    Home: AdaptiveHomeScreen
    Payments: PaymentsScreen
    Transactions: TransactionsScreen 
    Insights: InsightsScreen
    Profile: ProfileScreen
    More: MoreViewScreen
  }

  Home --> Payments: setActiveTab
  Home --> Transactions: setActiveTab
  Home --> Insights: setActiveTab
  Payments --> Home: setActiveTab
  Transactions --> Home: setActiveTab
  Profile --> Home: setActiveTab
  More --> Home: setActiveTab

  state JourneyOverlays {
    KYC_Modal: KycModal
    Insurance_Modal: InsuranceModal
    Medical_Modal: MedicalAssistanceModal
    Credit_Modal: CreditScoreModal
    Onboarding_Modal: OnboardingModal
    Demo_Modal: PrototypeLabModal
    Architecture_Modal: ArchitectureFlowModal
  }

  Home --> KYC_Modal: openJourney('kyc')
  Home --> Medical_Modal: openJourney('medical')
  Home --> Insurance_Modal: openJourney('insurance')
  More --> Demo_Modal: openJourney('demo')
  
  KYC_Modal --> Home: closeJourney()
  Medical_Modal --> Home: closeJourney()
  Insurance_Modal --> Home: closeJourney()
  Demo_Modal --> Home: closeJourney()

  note right of Home
    Custom Animated transitions:
    Cross-fades and directional 
    slides based on tab order index
  end note
```

### Data Fetching & Offline Fallback Sequence

```mermaid
sequenceDiagram
  participant App as App.tsx (useEffect)
  participant Store as Zustand Store
  participant API as BankingApi
  participant Backend as FastAPI Backend
  participant Edge as MiniCPM5EdgeEngine
  participant Cache as Offline State Bundle

  App->>Store: fetchStateAndContext()
  Store->>API: getExperienceConfig(customer_id)
  
  API->>API: Create AbortController (2500ms)
  API->>Backend: GET /api/v1/experience/{id}
  
  alt Backend Responds < 2.5s
    Backend-->>API: ExperienceConfig JSON
    API-->>Store: Live state + config
    Store->>Store: Update all reactive state
    Store-->>App: Re-render with live data
  else Backend Timeout (> 2.5s)
    API->>API: AbortController.abort()
    API-->>Store: null (timeout)
    Store->>Edge: Process locally
    Edge->>Edge: Rule-based NLP
    Edge->>Edge: ONNX model inference
    Edge-->>Store: Offline state
    Store-->>App: Re-render with offline data
  else Network Error
    API-->>Store: Exception caught
    Store->>Cache: Load cached scenario bundle
    Note over Cache: Deterministic offline bundles:<br/>normal, surplus, stress,<br/>medical, fraud
    Cache-->>Store: Scenario state
    Store-->>App: Re-render with cached data
  end

  Note over App,Cache: Pull-to-refresh on AdaptiveHomeScreen<br/>triggers the same fetchStateAndContext() flow
```

### Payment Authentication Sequence

```mermaid
sequenceDiagram
  participant User as User
  participant Home as AdaptiveHomeScreen
  participant Store as Zustand Store
  participant Auth as expo-local-authentication
  participant API as BankingApi
  participant Backend as FastAPI

  User->>Home: Tap recurring mandate<br/>("Metro ₹40")
  Home->>Store: requestPaymentAuth()
  
  Store->>Auth: authenticateAsync()
  Note over Auth: Device biometrics:<br/>FaceID / Fingerprint / PIN
  
  alt Biometrics Available
    Auth->>Auth: Biometric scan
    alt Success
      Auth-->>Store: {success: true}
    else Failed
      Auth-->>Store: {success: false}
      Store-->>Home: Show error toast
      Home-->>User: "Authentication failed"
    end
  else Biometrics Unavailable
    Auth-->>Store: Fallback to PIN
    Store->>API: POST /auth/pin/verify
    API->>Backend: Verify PIN
    Backend-->>API: Result
    API-->>Store: Auth result
  end
  
  Store->>API: POST /payments/transfer
  API->>Backend: Execute transfer
  Backend-->>API: 200 OK + Updated Balance
  API-->>Store: Update balance
  Store->>Store: Mark mandate as paid
  Store-->>Home: Trigger re-render
  Home-->>User: Animated checkmark<br/>(Never leaves screen)
```

### Adaptive Home Screen Flow

```mermaid
flowchart TD
  ExConfig["ExperienceConfig JSON\n(from Backend)"] --> ScenarioDetect{"Detect Current\nScenario State"}
  
  ScenarioDetect -->|"normal/surplus"| NormalFlow["Standard Dashboard"]
  ScenarioDetect -->|"financial_stress"| StressFlow["Empathetic Dashboard"]
  ScenarioDetect -->|"medical_event"| MedicalFlow["Medical Priority Dashboard"]
  ScenarioDetect -->|"fraud_alert"| FraudFlow["Security Alert Dashboard"]
  
  NormalFlow --> NormalHero["Hero Card:\nWelcome + Balance Overview"]
  NormalFlow --> NormalCards["Context Cards:\n• Spending Insights\n• Bill Reminders\n• Investment Tips"]
  NormalFlow --> NormalActions["Actions:\n• Pay • Transfer\n• Scan • More"]
  
  StressFlow --> StressHero["Hero Card:\nEmpathetic Support Message\n(No loan offers)"]
  StressFlow --> StressCards["Context Cards:\n• Cashflow Advisory\n• Emergency Fund Tips\n• Budget Optimization\n(Utility widgets HIDDEN)"]
  StressFlow --> StressActions["Actions:\n• Budget • Support\n(Loan button REMOVED)"]
  
  MedicalFlow --> MedHero["Hero Card:\nMedical Assistance\n(Prominent)"]
  MedicalFlow --> MedCards["Context Cards:\n• Insurance Claim Guide\n• Emergency Funds\n• Hospital Cashless Info"]
  
  FraudFlow --> FraudHero["Hero Card:\nSecurity Alert"]
  FraudFlow --> FraudCards["Context Cards:\n• Lock Card Immediately\n• Report Fraud\n• Transaction Review"]
```

### State Management Architecture

```mermaid
flowchart TD
  subgraph UserActions["User Actions"]
    Tap["Tap Button"]
    Pull["Pull to Refresh"]
    Navigate["Tab Navigation"]
    Modal["Open Journey"]
  end

  subgraph ZustandStore3["Zustand Store (useCustomerStore)"]
    direction TB
    TabState["activeTab: string"]
    JourneyState["activeJourney: string | null"]
    ProfileState["customerProfile: CustomerProfile"]
    BalanceState["accountBalances: AccountBalance[]"]
    TxnState["transactions: Transaction[]"]
    UIState["isBalanceHidden: boolean\nlanguage: en|hi|gu"]
  end

  subgraph Actions["Store Actions"]
    FetchAction["fetchStateAndContext()"]
    SetTab["setActiveTab(tab)"]
    OpenJourney["openJourney(id, payload)"]
    PayAuth["requestPaymentAuth()"]
    SwitchScenario2["switchScenario(scenario)"]
  end

  subgraph Effects["Side Effects"]
    APICall["BankingApi.getExperienceConfig()"]
    EdgeCall["MiniCPM5EdgeEngine.process()"]
    BiometricCall["expo-local-authentication"]
  end

  subgraph Rendering["Reactive Re-rendering"]
    HomeRender["AdaptiveHomeScreen"]
    ChatRender["MitraChatScreen"]
    PayRender["PaymentsScreen"]
  end

  UserActions --> Actions
  Actions --> ZustandStore3
  FetchAction --> Effects
  PayAuth --> BiometricCall
  APICall --> ZustandStore3
  EdgeCall --> ZustandStore3
  ZustandStore3 -->|"Reactive"| Rendering
```

---

## AI & Intelligence Engine — Deep Dive

### Complete Intelligence Pipeline Diagram

```mermaid
flowchart TD
  subgraph DataSources2["7 Raw Data Sources"]
    CBS3["Core Banking System\n(Balances, Account Info,\nFixed Deposits)"]
    UPI3["UPI Transaction Logs\n(P2P Transfers,\nMerchant Payments)"]
    SMS3["Android SMS Parser\n(Bank Notifications,\nOTP Confirmations)"]
    CIBIL3["CIBIL Credit Bureau\n(Credit Score,\nLoan History, DTI)"]
    BBPS3["BBPS Bill Payments\n(Utility Bills,\nSubscriptions)"]
    NCMC3["NCMC Metro Card\n(Commute Patterns,\nStation Data)"]
    KYC3["KYC Demographics\n(Age, Occupation,\nIncome, Location)"]
  end

  subgraph Harmonization["Data Harmonization (harmonizer.py)"]
    MD5Dedup["MD5 Deduplication\n(Idempotent Transaction IDs)"]
    ISODates["ISO 8601 Date Normalization\n(Unify timestamp formats)"]
    ConflictResolver["Balance Conflict Resolution\n(balance_conflicts_resolved algorithm)"]
    InMemoryCache["O(1) In-Memory Feature Cache"]
  end

  subgraph FeatureExtraction["Feature Extraction (features/)"]
    FiftyThirtyTwenty2["50/30/20 Rule Analyzer\n• Needs (50%): Rent, EMI, Utilities\n• Wants (30%): Dining, Shopping\n• Savings (20%): Investments, FDs"]
    NineCatBreakdown["9-Category Spend Breakdown\n• Housing • Transport • Food\n• Healthcare • Education • Shopping\n• Entertainment • Utilities • Other"]
    CashFlowForecast["30-Day Cash Flow Forecast\n(Runway prediction based on\nrecurring vs variable spend)"]
    ThirtyTwoMetrics2["32 Single-Pass Metrics\n(Computed in one transaction scan)"]
  end

  subgraph SignalDetection["Signal Detection (signals/)"]
    BehavioralDetector["Behavioral Signals\n• Metro commute (station patterns)\n• Dining habits (frequency + spend)\n• Cinema visits (periodic detection)\n• Weekend spending patterns"]
    FinancialDetector["Financial Signals\n• DTI Ratio calculation\n• EMI pressure (% of income)\n• Savings rate decline detection\n• Risk score computation"]
    LifecycleDetector["Lifecycle Signals\n• Medical emergency (large hospital txns)\n• Marriage (venue + jeweler + travel)\n• Job change (salary source change)\n• Retirement (pension deposits)"]
  end

  subgraph StateGeneration["Customer State Generation (customer_state/)"]
    CadenceController["Dual Cadence Controller\n• Macro: 14-day full recompute\n• Micro: 0.162ms event-driven trigger"]
    HealthClassifier["Financial Health Classifier\n• thriving: DTI < 0.20, savings ↑\n• stable: DTI 0.20-0.30, balanced\n• tight: DTI 0.30-0.40, limited margin\n• stress: DTI > 0.40, declining savings"]
    StateSchema["Customer State Schema\n(financial_health, signals[],\nrecommendations[])"]
  end

  subgraph RecommendationEngine["Recommendation Engine"]
    UtilityScorer["Multi-Factor Utility Scorer\nU = 0.30×A + 0.30×L + 0.25×Ur + 0.15×Ar − R\n• A = Affordability Score\n• L = Lifecycle Match Score\n• Ur = Urgency Score\n• Ar = Archetype Fit Score\n• R = Risk Penalty"]
    ArchetypeEngine["7 Bharat Archetypes\n• urban_commuter (metro patterns)\n• rural_farmer (seasonal income)\n• salaried_professional (stable salary)\n• small_business_owner (variable)\n• student (education spends)\n• retired_senior (pension)\n• gig_worker (irregular income)"]
    RankMapper["Rank Mapper (1-5 Scale)\n• Score > 0.8 → Rank 1\n• Score > 0.6 → Rank 2\n• Score > 0.4 → Rank 3\n• Score > 0.2 → Rank 4\n• Score ≤ 0.2 → Rank 5"]
  end

  subgraph ComplianceLayer["Compliance Layer"]
    RBICheck["RBI DTI Cap Check\n(DTI > 0.40 → Suppress All Credit)"]
    DPDPCheck2["DPDP Purpose Limitation\n(Only use data for stated purpose)"]
    CryptoLedger3["SHA-256 Crypto Ledger\n• Hash every decision\n• Hash every suppression\n• Chain to previous hash\n• Tamper-proof audit trail"]
    Explanations["Counterfactual Explanations\n(Plain-language cards:\n'This loan was suppressed\nbecause your DTI is 0.45')"]
  end

  DataSources2 --> Harmonization
  Harmonization --> FeatureExtraction
  FeatureExtraction --> SignalDetection
  SignalDetection --> StateGeneration
  StateGeneration --> RecommendationEngine
  ArchetypeEngine --> UtilityScorer
  UtilityScorer --> RankMapper
  RecommendationEngine --> ComplianceLayer
  RBICheck --> DPDPCheck2 --> CryptoLedger3
  CryptoLedger3 --> Explanations
  ComplianceLayer -->|"customer-state.json"| Output2(["To Backend ExperienceComposer"])
```

### Voice Processing Pipeline — Complete Sequence

```mermaid
sequenceDiagram
  participant User as User
  participant WebSpeech as Web Speech API /<br/>Native Fallback
  participant SLM as MiniCPM-5 INT4<br/>(On-Device, ~1.85GB RAM)
  participant Prompts as Zero-Leakage<br/>System Prompts
  participant Backend2 as FastAPI Backend
  participant TrustedFacts as Trusted Fact Store<br/>(Pre-Computed)

  User->>WebSpeech: "Mera khata balance<br/>kitna hai?"
  WebSpeech->>WebSpeech: Speech-to-Text
  WebSpeech->>SLM: Raw text (Hindi/Hinglish)
  
  SLM->>Prompts: Load system prompt
  Note over Prompts: Zero-Leakage Rules:<br/>1. Never reference transaction history<br/>2. Only verbalize pre-computed facts<br/>3. No financial advice generation<br/>4. No data in SLM context window
  
  SLM->>SLM: Parse intent + entities
  Note over SLM: Detected:<br/>intent: CHECK_BALANCE<br/>language: hi<br/>entities: []<br/>confidence: 0.94
  
  SLM-->>Backend2: VoiceIntent JSON
  Note over Backend2: {"intent": "CHECK_BALANCE",<br/>"language": "hi",<br/>"entities": [],<br/>"confidence": 0.94}
  
  Backend2->>TrustedFacts: Fetch authoritative data
  Note over TrustedFacts: Balance: ₹45,230<br/>(from database/cache,<br/>NOT from SLM)
  TrustedFacts-->>Backend2: Trusted fact packet
  
  Backend2-->>SLM: Pre-computed response data
  SLM->>SLM: Verbalize in Hindi
  SLM-->>User: "Aapka khata balance<br/>₹45,230 hai"
  
  Note over User,TrustedFacts: KEY SECURITY PROPERTY:<br/>SLM NEVER sees transaction history.<br/>It only verbalizes pre-computed<br/>trusted facts from the backend.
```

### Zero-Leakage Voice Security Architecture

```mermaid
flowchart LR
  subgraph Visible["Yes Data SLM CAN Access"]
    Intent["User's spoken intent\n(natural language text)"]
    TrustedFacts2["Pre-computed trusted facts\n• Current balance\n• Next EMI due date\n• Card lock status\n• Bill amounts"]
    Templates["Response templates\n(Localized strings)"]
  end

  subgraph Blocked["Data SLM CANNOT Access"]
    TxnHistory["Transaction history"]
    SpendingData["Spending patterns"]
    CreditScore["CIBIL credit score"]
    PersonalData["PAN / Aadhaar"]
    Recommendations2["AI recommendations"]
    FinancialHealth2["Financial health classification"]
    DTIRatio["DTI ratio"]
  end

  subgraph SLMProcess["MiniCPM-5 SLM Process"]
    Parse["1. Parse user utterance"]
    Classify["2. Classify intent"]
    Verbalize["3. Verbalize trusted fact"]
  end

  Visible -->|"Allowed"| SLMProcess
  Blocked -->|"BLOCKED by\nZero-Leakage Policy"| SLMProcess

  style Blocked fill:#ffcdd2,stroke:#c62828
  style Visible fill:#c8e6c9,stroke:#2e7d32
```

---

## Database Architecture — Deep Dive

### Entity Relationship Diagram

```mermaid
erDiagram
  customers ||--o{ accounts : "has (CASCADE)"
  customers ||--o{ recurring_payments : "has (CASCADE)"
  customers ||--o{ customer_events : "has (CASCADE)"
  customers ||--o{ customer_products : "has (CASCADE)"
  customers ||--o{ consent_preferences : "has (CASCADE)"
  accounts ||--o{ transactions : "contains (CASCADE)"
  products ||--o{ customer_products : "offered as (CASCADE)"

  customers {
    varchar64 customer_id PK "Primary Key"
    varchar first_name "Required"
    varchar last_name "Required"
    varchar email "Unique"
    varchar phone "Required"
    date date_of_birth "Required"
    varchar pan_number "Regex: A-Z5 0-9-4 A-Z"
    varchar aadhaar_number "Regex: 12 digits"
    varchar address_line1 "Required"
    varchar address_line2 "Optional"
    varchar city "Required"
    varchar state "Required"
    varchar pincode "Required"
    varchar kyc_status "pending/verified/rejected"
    varchar language_preference "en/hi/gu"
    varchar occupation "Required"
    decimal annual_income "Required"
    timestamp created_at "Auto"
    timestamp updated_at "Auto"
  }

  accounts {
    varchar account_id PK "Primary Key"
    varchar customer_id FK "Index: customer_id"
    varchar account_type "savings/current/fd"
    varchar account_number "Unique"
    varchar ifsc_code "Required"
    decimal balance "Required"
    varchar currency "INR default"
    varchar status "active/frozen/closed"
    timestamp opened_at "Required"
    timestamp updated_at "Auto"
  }

  transactions {
    varchar transaction_id PK "Primary Key"
    varchar account_id FK "Required"
    varchar customer_id "Index: customer_id + category"
    varchar type "credit/debit"
    decimal amount "Required"
    varchar currency "INR default"
    varchar category "food/transport/shopping/etc"
    varchar description "Required"
    varchar merchant_name "Optional"
    varchar reference_number "Unique"
    varchar status "completed/pending/failed"
    timestamp transaction_date "Index: customer_id + date"
    timestamp created_at "Auto"
  }

  recurring_payments {
    varchar payment_id PK "Primary Key"
    varchar customer_id FK "Index: customer_id"
    varchar account_id FK "Required"
    varchar payee_name "Required"
    decimal amount "Required"
    varchar frequency "daily/weekly/monthly"
    varchar category "Required"
    date next_due_date "Required"
    varchar status "active/paused/completed"
    boolean auto_pay "Default: false"
    timestamp created_at "Auto"
  }

  customer_events {
    varchar event_id PK "Primary Key"
    varchar customer_id FK "Index: customer_id + type"
    varchar event_type "Required"
    text event_data "JSON payload"
    varchar severity "info/warning/critical"
    varchar source "system/user/ai"
    timestamp created_at "Auto"
  }

  products {
    varchar product_id PK "Primary Key"
    varchar name "Required"
    varchar category "loan/insurance/investment"
    text description "Required"
    decimal interest_rate "Required"
    decimal min_amount "Required"
    decimal max_amount "Required"
    int tenure_months "Required"
    text eligibility_criteria "JSON"
    text features "JSON"
    varchar status "active/discontinued"
    timestamp created_at "Auto"
  }

  customer_products {
    varchar id PK "Primary Key"
    varchar customer_id FK "Index + Unique with product_id"
    varchar product_id FK "Required"
    varchar status "applied/approved/active/closed"
    timestamp applied_at "Required"
    timestamp approved_at "Optional"
    decimal disbursed_amount "Optional"
    decimal interest_rate "Optional"
    int tenure_months "Optional"
    decimal emi_amount "Optional"
    date next_emi_date "Optional"
  }

  consent_preferences {
    varchar consent_id PK "Primary Key"
    varchar customer_id FK "Index: customer_id"
    varchar consent_type "data_sharing/marketing/analytics"
    varchar status "granted/revoked"
    timestamp granted_at "Required"
    timestamp expires_at "Optional"
    text purpose "Required"
  }

  alembic_version {
    varchar32 version_num PK "Migration Version"
  }
```

### Data Access Layer Architecture

```mermaid
flowchart TD
  subgraph APILayerDB["API Layer"]
    Route["routes.py endpoint handler"]
  end

  subgraph ServiceLayerDB["Service Layer"]
    StateServiceDB["StateService"]
  end

  subgraph DataAccessDB["Data Access Layer"]
    DataLoaderDB["DataLoader\n(Primary Access Point)"]
    
    subgraph Repos["Repositories"]
      CustRepoDB["CustomerRepository\n• get_by_id()\n• get_customer_summary()"]
      TxnRepoDB["TransactionRepository\n• get_by_customer()\n• get_by_account()"]
      EvtRepoDB["EventRepository\n• get_events()"]
      ProdRepoDB["ProductRepository\n• get_products()"]
    end
  end

  subgraph ORMLayer["ORM Layer"]
    SQLAlchemy["SQLAlchemy 2.0\n(Declarative Models)"]
    SessionDB["session.py\n• Engine + Connection Pool\n• Auto WSL IPv4 detection\n (PowerShell Get-NetNeighbor)\n• Fallback: localhost"]
  end

  subgraph StorageDB["Storage"]
    PostgreSQLDB[("PostgreSQL 16\n(Docker :5432)\n9 Tables")]
    JSONSeedDB["JSON Seed Files\n(data/seed/)\n• customers.json (1.2k)\n• transactions.json (127k+)"]
    ScenarioFilesDB["Scenario Overrides\n(data/scenarios/)\n• normal.json\n• financial-stress.json\n• life-change.json"]
  end

  Route --> StateServiceDB
  StateServiceDB --> DataLoaderDB
  DataLoaderDB --> Repos
  Repos --> SQLAlchemy --> SessionDB
  SessionDB --> PostgreSQLDB
  
  DataLoaderDB -.->|"PostgreSQL Offline\n(Exception Caught)"| JSONSeedDB
  DataLoaderDB -.->|"Scenario Override"| ScenarioFilesDB
```

### Migration & Introspection Flow

```mermaid
flowchart LR
  subgraph Development["Development"]
    Dev["Developer writes\nmigration"]
  end

  subgraph AlembicMgr["Alembic Migration Manager"]
    AlembicEnv["alembic/env.py"]
    AlembicVer["alembic/versions/\n(Migration Files)"]
    AlembicIni["alembic.ini\n(Configuration)"]
  end

  subgraph Database3["PostgreSQL"]
    Schema["Live Database Schema\n(9 Tables)"]
    AlembicTable["alembic_version table\n(Tracks current version)"]
  end

  subgraph PrismaTool["Prisma (Read-Only)"]
    PrismaIntrospect["prisma db pull\n(Introspects live DB)"]
    PrismaSchema["prisma/schema.prisma\n(Generated schema file)"]
    PrismaStudio["Prisma Studio\n(Visual DB Browser)"]
  end

  Dev -->|"alembic revision"| AlembicVer
  AlembicVer -->|"alembic upgrade head"| Schema
  Schema --> AlembicTable
  Schema -->|"npm run db:introspect"| PrismaIntrospect
  PrismaIntrospect --> PrismaSchema
  PrismaSchema -->|"npm run db:studio"| PrismaStudio

  style PrismaTool fill:#e3f2fd
  style AlembicMgr fill:#fff3e0
```

### Seed Data Pipeline

```mermaid
flowchart TD
  Generator["scripts/generate_seed_data.py\n(~540 lines)"]
  Generator -->|"Generates"| CustJSON["data/seed/customers.json\n(1,200 Mock Profiles)"]
  Generator -->|"Generates"| TxnJSON["data/seed/transactions.json\n(127,000+ Transactions)"]
  
  Seeder["scripts/seed_database.py"]
  CustJSON --> Seeder
  TxnJSON --> Seeder
  
  Seeder -->|"SQLAlchemy\nbulk_insert_mappings\n(Batches of 10,000)"| DB2[("PostgreSQL 16")]
  
  Seeder -->|"Step 1"| Wipe["Wipe existing data\n(Clean slate)"]
  Seeder -->|"Step 2"| Reset["Reset schema\n(Recreate tables)"]
  Seeder -->|"Step 3"| Insert["Bulk insert\n(10k per batch)"]
  
  ScenarioFiles["data/scenarios/\n• normal.json\n• financial-stress.json\n• life-change.json"]
  ScenarioFiles -->|"Runtime Override"| StateService3["StateService\n(switch_scenario)"]
```

---

## Authentication & Security — Deep Dive

### End-to-End Authentication & MPIN Flow

VZEYA implements a banking-grade customer authentication flow combining mobile OTP verification, 4-digit MPIN credentials (or device biometrics), and statutory DPDP Act 2023 compliance agreements.

```mermaid
sequenceDiagram
  autonumber
  actor User as Customer / User
  participant UI as AuthScreen (React Native)
  participant Store as customerStore (Zustand)
  participant AuthAPI as Auth Service / Backend
  participant SMS as SMS OTP Gateway (Mock/Live)

  Note over User, UI: Stage 1: Phone Entry & KYC Identifier
  User->>UI: Inputs 10-digit mobile number (+91)
  UI->>SMS: Request SMS OTP challenge
  SMS-->>UI: OTP dispatched (e.g. 123456 / Dev auto-hint)

  Note over User, UI: Stage 2: OTP Verification
  User->>UI: Enters 6-digit numeric OTP
  UI->>UI: Validate OTP against challenge token

  Note over User, UI: Stage 3: MPIN Setup / Quick Login
  alt First-time Customer
    UI->>UI: Prompt 4-digit MPIN creation + confirmation
    UI->>AuthAPI: POST /auth/pin/setup (PBKDF2-HMAC-SHA256)
    AuthAPI-->>UI: PIN Hash & Salt persistent registration
  else Returning Customer
    UI->>UI: Prompt 4-digit MPIN or Biometric (Fingerprint/Face)
    UI->>AuthAPI: POST /auth/pin/verify (hmac.compare_digest)
    AuthAPI-->>UI: 200 OK (fail_count reset)
  end

  Note over User, UI: Stage 4: DPDP Act 2023 & RBI Statutory Consent
  alt New Account / Updated Compliance Scope
    UI->>User: Display DPDP Statutory Disclosures Modal
    Note over UI: Disclose Data Fiduciary, Purpose, Account Aggregator AA,<br/>Right to Revoke & Grievance DPO Contact
    User->>UI: Accepts statutory terms & grants consent
    UI->>Store: recordDPDPConsent(timestamp, version="2023.1")
  end

  Note over User, UI: Stage 5: Session Initialization
  UI->>Store: setAuthenticated(true, customerProfile)
  Store-->>UI: Hydrate active scenario & banking dashboard
  UI-->>User: Transition to Main Application Shell
```

#### Dual Authentication Architecture (Mobile OTP / MPIN & NetBanking JWT)

VZEYA supports two complementary authentication paths designed to accommodate both modern Bharat mobile banking and standard internet banking / developer evaluation:

1. **Bharat Mobile Banking (OTP + MPIN + Biometric)**:
   - Evaluator-friendly 1-tap OTP simulation (auto-hints verified code `482910` or `000000`).
   - Hardware-bound 6-digit MPIN validation with cryptographic PIN verify (`/auth/pin/verify`).
   - 1-tap evaluator persona presets (Salaried, Surplus, Tight Buffer, Medical Emergency, Fraud Alert).

2. **NetBanking / Session Token Architecture (JWT HS256)**:
   - Directly authenticates via `POST /api/v1/auth/login` accepting Email, Phone number, or Customer ID.
   - Authoritative HS256 JWT tokens generated with standard RFC 7519 claims (`sub`, `iat`, `exp`).
   - Client API SDK automatically attaches `Authorization: Bearer <token>` to all downstream banking requests.
   - New user registration via `POST /api/v1/auth/register` dynamically provisions customer records into the relational database and seed store.

### DPDP Act 2023 & RBI Statutory Consent Architecture

In compliance with the **Digital Personal Data Protection (DPDP) Act, 2023** and **RBI Master Direction on IT Governance, Risk and Controls**, VZEYA enforces strict transparency, consent gating, and revocation capabilities before any financial or behavioral data is processed.

#### Statutory Principles Enforced

| Dimension | DPDP 2023 Requirement | VZEYA Implementation |
|---|---|---|
| **Data Fiduciary Identity** | Clear disclosure of processing entity | Displayed as *VZEYA Intelligence Platform / ABC Bank Ltd.* |
| **Notice & Purpose Specification** | Purpose must be clearly stated in plain language | Explicitly itemizes Account Aggregator retrieval, contextual SDUI personalization, and fraud mitigation. |
| **Vernacular Accessibility** | Consent notices must be accessible in Schedule 8 languages | UI supports English, Hindi, and Gujarati consent summaries. |
| **Right to Withdraw Consent** | Data principal can withdraw consent as easily as giving it | Toggle available under `ProfileScreen -> Statutory Compliance & DPDP 2023` to immediately revoke processing rights. |
| **Data Minimization & Retention** | Retain data only as long as necessary for specified purpose | Session caches and AI telemetry strictly expire; no raw transaction payloads stored in AI agent logs. |
| **Grievance Redressal** | Mandatory designation of Data Protection Officer (DPO) | Statutory DPO contact (`dpo@vzeyabank.in`, Grievance Officer, Mumbai) accessible directly from the consent sheet. |

```mermaid
flowchart TD
  AppLaunch([App Launch]) --> CheckAuth{Authenticated?}
  CheckAuth -->|No| AuthGate[AuthScreen: Mobile + OTP + MPIN]
  AuthGate --> ConsentCheck{DPDP Consent Recorded?}
  ConsentCheck -->|No| ConsentModal[DPDP Statutory Consent Modal]
  ConsentModal --> UserAction{User Decision}
  UserAction -->|Reject / Exit| TerminateSession[Session Blocked / Guest Only]
  UserAction -->|Accept| RecordConsent[Store SHA-256 Consent Proof & Timestamp]
  RecordConsent --> UnlockVault[Unlock Full Banking SDUI & Accounts]
  ConsentCheck -->|Yes| UnlockVault
  UnlockVault --> InAppProfile[ProfileScreen: DPDP Management]
  InAppProfile --> RevokeAction{Revoke Consent?}
  RevokeAction -->|Yes| StripTelemetry[Anonymize Local Cache & Block Personalization]
```

### PIN Authentication — Complete Lifecycle

```mermaid
stateDiagram-v2
  [*] --> NoPIN: Customer Created

  state NoPIN {
    [*] --> AwaitSetup: No PIN Configured
  }

  NoPIN --> PINActive: POST /auth/pin/setup<br/>(PBKDF2-HMAC-SHA256, 100k iterations)

  state PINActive {
    [*] --> Ready: PIN Hash + Salt Stored
    Ready --> Verifying: POST /auth/pin/verify
    
    Verifying --> Success: hmac.compare_digest == True
    Verifying --> Failed: hmac.compare_digest == False
    
    Success --> Ready: Reset fail_count = 0
    Failed --> IncrementFails: fail_count++
    
    IncrementFails --> Ready: fail_count < 5
    IncrementFails --> Lockout: fail_count >= 5
  }

  state Lockout {
    [*] --> Frozen: locked_until = now + 15min
    Frozen --> Cooldown: 15 minutes elapsed
  }

  Lockout --> PINActive: Cooldown complete

  note right of PINActive
    Storage: In-memory dict
    _customer_pins = {
      customer_id: {
        hash: bytes,
        salt: hex(16),
        failed_attempts: int,
        locked_until: datetime | None
      }
    }
  end note
```

### PIN Verification with Rate Limiting — Complete Sequence

```mermaid
sequenceDiagram
  participant Client as Client
  participant Router as routes.py
  participant Auth as StateService
  participant Store as _customer_pins Dict
  participant Crypto as PBKDF2-HMAC-SHA256

  Client->>Router: POST /auth/pin/verify<br/>{customer_id, pin}
  Router->>Auth: verify_customer_pin(id, pin)
  
  Auth->>Store: Lookup customer_id
  alt No PIN Set
    Store-->>Auth: KeyError
    Auth-->>Router: 404 Not Found
    Router-->>Client: {"error": "PIN not configured"}
  else PIN Exists
    Store-->>Auth: {hash, salt, fails, locked_until}
    
    Auth->>Auth: Check locked_until
    alt Currently Locked
      Note over Auth: locked_until > datetime.now()
      Auth-->>Router: 429 Rate Limited
      Router-->>Client: {"error": "Account locked",<br/>"retry_after": "15 minutes"}
    else Not Locked
      Auth->>Crypto: PBKDF2(pin, salt, iterations=100000)
      Crypto-->>Auth: Computed hash
      
      Auth->>Auth: hmac.compare_digest(stored, computed)
      Note over Auth: Constant-time comparison<br/>(prevents timing attacks)
      
      alt Match
        Auth->>Store: Reset failed_attempts = 0
        Auth-->>Router: 200 Success
        Router-->>Client: {"verified": true}
      else No Match
        Auth->>Store: failed_attempts++
        
        alt failed_attempts >= 5
          Auth->>Store: locked_until = now + 15min
          Auth-->>Router: 429 Rate Limited
          Router-->>Client: {"error": "Too many attempts",<br/>"locked_for": "15 minutes"}
        else failed_attempts < 5
          Auth-->>Router: 401 Unauthorized
          Router-->>Client: {"error": "Invalid PIN",<br/>"attempts_remaining": N}
        end
      end
    end
  end
```

### Card Security State Machine

```mermaid
stateDiagram-v2
  [*] --> Unlocked: Default state

  state Unlocked {
    [*] --> Active
    Active: All payments allowed
    Active: ATM Yes POS Yes Online Yes
  }

  state Locked {
    [*] --> Blocked
    Blocked: Payment blocked
    Blocked: ATM No POS No Card No
  }

  Unlocked --> Locked: POST /cards/controls<br/>{is_locked: true}
  Locked --> Unlocked: POST /cards/controls<br/>{is_locked: false}

  Locked --> PaymentDenied: POST /payments/transfer<br/>(Category: ATM/POS/Card)
  PaymentDenied --> Locked: PermissionError → 403

  state PaymentDenied {
    [*] --> Denied
    Denied: "Card is locked" error
  }

  note right of Locked
    Card controls stored in
    _card_controls dict (in-memory)
    per customer_id with:
    • is_locked: bool
    • atmLimit: int
    • posLimit: int
    • onlineLimit: int
  end note
```

### Multi-Layer Authorization Architecture

```mermaid
flowchart TD
  Request["Incoming API Request"] --> Layer1{"Layer 1:\nCustomer ID\nExists?"}
  
  Layer1 -->|"No"| Reject404["404 Not Found"]
  Layer1 -->|"Yes"| Layer2{"Layer 2:\nPIN Locked Out?\n(Rate Limiting)"}
  
  Layer2 -->|"Locked (15min)"| Reject429["429 Rate Limited"]
  Layer2 -->|"Not Locked"| Layer3{"Layer 3:\nCard Locked?\n(For Payments)"}
  
  Layer3 -->|"Locked"| Reject403["403 Forbidden\n'Card is locked'"]
  Layer3 -->|"Active"| Layer4{"Layer 4:\nSufficient\nFunds?"}
  
  Layer4 -->|"Insufficient"| Reject400["400 Bad Request\n'Insufficient balance'"]
  Layer4 -->|"Sufficient"| Layer5{"Layer 5:\nSafety Policy\n(For Recommendations)"}
  
  Layer5 -->|"DTI > 0.40"| Suppress["Suppress Credit Products\n(suppressed = true)"]
  Layer5 -->|"Healthy"| Allow["Allow All Products"]
  
  Suppress --> Layer6["Layer 6:\nCrypto Ledger\n(Log Decision)"]
  Allow --> Layer6
  
  Layer6 --> Success["Yes Action Executed"]
```

### Ethical AI Security Architecture

```mermaid
flowchart TD
  AIRec["AI Recommendation\nGenerated"] --> DTICheck{"DTI Ratio\nCheck"}
  
  DTICheck -->|"DTI > 0.40"| BLOCK["BLOCK"]
  DTICheck -->|"DTI ≤ 0.40"| StressCheck{"Financial Health\nClassification"}
  
  StressCheck -->|"stress"| BLOCK
  StressCheck -->|"tight"| CAUTION["CAUTION\n(Flag but allow)"]
  StressCheck -->|"stable/thriving"| ALLOW["ALLOW"]
  
  BLOCK --> SuppressAll["Suppress ALL:\n• Personal loans\n• Payday advances\n• Credit limit increases\n• Credit card offers"]
  BLOCK --> ReplaceWith["Replace with:\n• Cashflow advisory\n• Emergency fund tips\n• Budget optimization\n• Auto-sweep FD suggestions"]
  
  SuppressAll --> CryptoLog["SHA-256 Crypto Ledger\nLog suppression with:\n• customer_id\n• product_id\n• reason: 'DTI 0.45 exceeds 0.40'\n• timestamp\n• hash_chain_link"]
  ReplaceWith --> CryptoLog
  
  CAUTION --> CryptoLog
  ALLOW --> CryptoLog
  
  CryptoLog --> Explanation["Counterfactual Explanation\n'This loan was not shown because\nyour debt-to-income ratio (0.45)\nexceeds the RBI guideline of 0.40'"]
  
  Explanation --> FinalOutput["Final Recommendation\nList (Filtered)"]
```

### Known Security Limitations

| Limitation | Current State | Risk Level | Production Fix Needed |
|-----------|--------------|------------|----------------------|
| CORS Policy | `allow_origins=["*"]` | High | Restrict to specific domains |
| API Authentication | No JWT/OAuth tokens; uses customer_id path params | High | Implement JWT bearer tokens |
| PIN Storage | In-memory dict (lost on restart) | Medium | Persist to encrypted database |
| HTTPS | Not enforced at app level | High | Add TLS termination |
| CSRF Protection | None | Medium | Add CSRF tokens for state-changing ops |
| Rate Limiting | Only on PIN verify (5 attempts) | Medium | Add global rate limiting |
| General Endpoint Auth | No authentication on most endpoints | High | Add auth middleware |

---

## Data Flow Architecture — Deep Dive

### End-to-End Personalization — Complete Sequence

```mermaid
sequenceDiagram
  participant DS as 7 Data Sources
  participant Harm as Harmonizer
  participant Feat as Feature Extractor
  participant Sig as Signal Detector
  participant State2 as State Generator
  participant Score as Recommendation Scorer
  participant Comply as Compliance Filter
  participant Crypto2 as Crypto Ledger
  participant Compose as Experience Composer
  participant Safe as Safety Policy Filter
  participant UI2 as Mobile App

  DS->>Harm: Raw banking data (CBS, UPI, SMS,<br/>CIBIL, BBPS, NCMC, KYC)
  Harm->>Harm: MD5 deduplication
  Harm->>Harm: ISO 8601 date normalization
  Harm->>Harm: Balance conflict resolution
  Harm->>Feat: Clean, deduplicated data
  
  Feat->>Feat: 50/30/20 rule analysis
  Feat->>Feat: 9-category spend breakdown
  Feat->>Feat: 30-day cash flow forecast
  Feat->>Feat: 32 single-pass metrics
  Feat->>Sig: Feature vector
  
  Sig->>Sig: Behavioral: commute, dining, cinema
  Sig->>Sig: Financial: DTI, EMI, savings decline
  Sig->>Sig: Lifecycle: medical, marriage, job
  Sig->>State2: Signal array
  
  State2->>State2: Dual cadence check
  Note over State2: Macro (14-day) or<br/>Micro (0.162ms trigger)?
  State2->>State2: Classify financial_health
  State2->>Score: CustomerState
  
  Score->>Score: Calculate utility per product
  Note over Score: U = 0.30×A + 0.30×L<br/>+ 0.25×Ur + 0.15×Ar − R
  Score->>Score: Rank 1-5 per recommendation
  Score->>Comply: Ranked recommendations
  
  Comply->>Comply: RBI DTI cap check (> 0.40?)
  Comply->>Comply: DPDP purpose limitation
  alt DTI > 0.40
    Comply->>Comply: Suppress all credit products
  end
  Comply->>Crypto2: Decision + suppression data
  Crypto2->>Crypto2: SHA-256 hash chain append
  Crypto2->>Compose: customer-state.json
  
  Compose->>Compose: Map to attention layers
  Note over Compose: DO → KNOW → PLAN → CONSIDER
  Compose->>Compose: Generate hero_card
  Compose->>Compose: Build context_cards[]
  Compose->>Safe: Draft ExperienceConfig
  
  Safe->>Safe: Re-verify stress indicators
  Safe->>Safe: Apply module policies
  Safe->>UI2: experience-config.json
  
  UI2->>UI2: Zustand store update
  UI2->>UI2: Adaptive re-render
```

### Attention Layer Priority System

```mermaid
flowchart TD
  subgraph DOLayer["DO Layer (Priority ≥ 8)\nImmediate Action Required"]
    DO1["Overdue EMI Payment"]
    DO2["Card Locked - Unlock Required"]
    DO3["Fraud Alert - Review Now"]
    DO4["Medical Emergency Support"]
    DO5["KYC Expiring Today"]
  end

  subgraph KNOWLayer["KNOW Layer (Priority 5-7)\nAwareness Items"]
    KNOW1["Spending Up 12% This Month"]
    KNOW2["Balance Below ₹5,000"]
    KNOW3["Bill Due in 3 Days"]
    KNOW4["Salary Credit Expected"]
    KNOW5["FD Maturity This Week"]
  end

  subgraph PLANLayer["PLAN Layer (Priority 3-4)\nFuture Planning"]
    PLAN1["SIP Investment Opportunity"]
    PLAN2["Insurance Renewal Due"]
    PLAN3["Tax-Saving FD Window"]
    PLAN4["Education Loan Planning"]
  end

  subgraph CONSIDERLayer["CONSIDER Layer (Priority 1-2)\nLow Priority Suggestions"]
    CONSIDER1["Credit Card Upgrade Available"]
    CONSIDER2["Savings Account Comparison"]
    CONSIDER3["Loyalty Reward Points"]
  end

  DOLayer -->|"Highest Priority\nHero Card Source"| HeroCard2["Hero Card\n(Most Urgent DO Item)"]
  KNOWLayer -->|"Context Cards"| ContextStack["Context Card Stack"]
  PLANLayer -->|"Context Cards"| ContextStack
  CONSIDERLayer -->|"May Be\nDeprioritized"| ContextStack
  
  HeroCard2 --> FinalUI["Final Adaptive UI"]
  ContextStack --> FinalUI

  style DOLayer fill:#ffcdd2,stroke:#c62828
  style KNOWLayer fill:#fff9c4,stroke:#f57f17
  style PLANLayer fill:#c8e6c9,stroke:#2e7d32
  style CONSIDERLayer fill:#e0e0e0,stroke:#616161
```

---

## Testing Architecture

### Test Architecture Diagram

```mermaid
flowchart TD
  subgraph AITests["AI Test Suite (ai/tests/)\n45 Tests, ~0.39s"]
    T1["test_massive_load.py\n10k transactions < 100ms"]
    T2["test_multi_source_ingestion.py\nSMS vs CBS conflict arbitration"]
    T3["test_personalization.py\nEthical loan suppression\nTop-1-to-5 ranking"]
    T4["test_cadence.py\nDual cadence timing"]
    T5["test_cryptoledger.py\nSHA-256 chain integrity"]
    T6["test_voice_slm.py\nVoice pipeline testing"]
  end

  subgraph AuditSuite["Audit Suite (scripts/)\n39 Checks, ~540 Lines"]
    A1["ONNX inference latency\n(< 10ms requirement)"]
    A2["Subword tokenizer\nvector integrity"]
    A3["XGBoost propensity\nextraction accuracy"]
    A4["KMeans archetype\nsoft-clustering validity"]
    A5["DTI loan suppression\n(< 0.40 threshold)"]
    A6["50/30/20 spend\nbreakdown accuracy"]
    A7["SHA-256 crypto ledger\nintegrity verification"]
    A8["Multi-turn vernacular\nchatbot routing"]
  end

  subgraph Gaps["Note: Test Gaps"]
    G1["No backend API tests"]
    G2["No frontend component tests"]
    G3["No E2E integration tests"]
    G4["No CI/CD pipeline"]
  end

  AITests -->|"pytest ai/tests/ -v"| Results["111 Tests Passing\n(45 unit + 39 audit + 27 integration)"]
  AuditSuite -->|"python scripts/audit_and_verify_all.py"| Results

  style Gaps fill:#fff3e0,stroke:#e65100
```

### Commands

```bash
# Run AI tests (45 tests, ~0.39s)
pytest ai/tests/ -v

# Run full audit suite (39 checks)
python scripts/audit_and_verify_all.py

# Test on-device intent classification
node scripts/test_ondevice_intent.js
```

---

## Configuration Reference

| Variable | Required | Description | Example | Used By | Sensitive |
|----------|----------|-------------|---------|---------|-----------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/abc_bank` | Backend | Yes |
| `EXPO_PUBLIC_API_URL` | Yes | Backend API URL for mobile app | `http://152.67.9.53/api/v1` (Cloud) / `http://localhost:8000/api/v1` (Local) | Frontend | No |
| `AI_VERBOSITY` | No | AI logging verbosity level | `1` | AI Engine | No |
| `DEFAULT_LANGUAGE` | No | Default language (en/hi/gu) | `en` | Backend | No |
| `MINICPM5_MODEL_PATH` | No | Path to MiniCPM-5 ONNX model | `./assets/minicpm5_slm_v1.onnx` | Voice AI | No |
| `PRISMA_DB_URL` | No | Prisma tunnel DB string (for Studio) | `postgresql://...@localhost:5433/abc_bank` | Prisma | Yes |

→ Full template: [`.env.example`](.env.example)

---

## Quick Start

### Prerequisites
- Python 3.11+ · Node.js 18+ · Docker & Docker Compose · Expo CLI

### Setup
```bash
# 1. Clone & configure
git clone <repository-url> && cd dau
cp .env.example .env # Edit with your config

# 2. Start database
docker-compose up -d

# 3. Backend
pip install -r apps/backend/requirements.txt
pip install -r ai/requirements.txt
cd apps/backend && alembic upgrade head && cd ../..
python scripts/seed_database.py # Optional: seed demo data
uvicorn apps.backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Frontend (new terminal)
cd apps/frontend && npm install && npx expo start

# 5. Validation
pytest ai/tests/ -v            # 45 tests
python scripts/audit_and_verify_all.py   # 39 checks
```

**Endpoints**: API Docs → `http://localhost:8000/docs` · Health → `/health` · AI Inspector → `/inspector` · Voice Inspector → `/voice-inspector`

→ Full setup guide: [docs/development/setup.md](docs/development/setup.md)

---

## Build & Deployment

### Current Deployment Architecture

```mermaid
flowchart TD
  subgraph DevEnv["Development Environment"]
    Dev2["Developer"]
    Code["Source Code\n(Git Repository)"]
  end

  subgraph LocalInfra["Local Infrastructure"]
    DockerDB["Docker Compose\n• postgres:16-alpine\n• Port 5432\n• Volume: postgres_data"]
    FastAPILocal["FastAPI + Uvicorn\n• Port 8000\n• --reload mode"]
    ExpoLocal["Expo Dev Server\n• Metro Bundler\n• QR Code → Expo Go"]
  end

  subgraph CloudInfra["Live Cloud Deployment (152.67.9.53)"]
    NginxCloud["Nginx Reverse Proxy\n• Port 80 (Public)\n• SSL Ready / Header Pass"]
    FastAPICloud["FastAPI + Uvicorn (abc-bank.service)\n• Port 8000 (Internal)\n• PBKDF2 & JWT Auth"]
    PostgresCloud[("PostgreSQL 14\n• Port 5432\n• Database: abc_bank")]
  end

  Dev2 --> Code
  Code --> DockerDB
  Code --> FastAPILocal
  Code --> ExpoLocal
  FastAPILocal --> DockerDB
  ExpoLocal -->|"API Requests (EXPO_PUBLIC_API_URL)"| NginxCloud
  NginxCloud -->|"proxy_pass 127.0.0.1:8000"| FastAPICloud
  FastAPICloud --> PostgresCloud
```

### Database Migration Flow

```mermaid
flowchart LR
  Dev3["Developer"] -->|"alembic revision\n--autogenerate"| Migration["New Migration File\n(alembic/versions/)"]
  Migration -->|"alembic upgrade head"| LiveDB[("PostgreSQL\n(Live Schema)")]
  LiveDB -->|"npm run db:introspect"| PrismaFile["prisma/schema.prisma\n(Updated)"]
  PrismaFile -->|"npm run db:studio"| Studio["Prisma Studio\n(Visual Browser)"]
```

---

## Scripts & Tooling

| Script | Purpose | Usage | Output |
|--------|---------|-------|--------|
| `scripts/audit_and_verify_all.py` | 39-check validation across all AI pillars (~540 lines) | `python scripts/audit_and_verify_all.py` | Pass/fail per check |
| `scripts/generate_seed_data.py` | Generate 1.2k mock customer profiles + 127k transactions | `python scripts/generate_seed_data.py` | JSON files in data/seed/ |
| `scripts/seed_database.py` | Bulk insert seed data into PostgreSQL (batches of 10,000) | `python scripts/seed_database.py` | Populated database |
| `scripts/run-demo.ps1` | Start backend + frontend for Windows demo | `.\scripts\run-demo.ps1` | Running servers |
| `scripts/run-demo.sh` | Start backend + frontend for Unix/macOS demo | `./scripts/run-demo.sh` | Running servers |
| `scripts/export_onnx_meta.py` | Export ONNX model metadata | `python scripts/export_onnx_meta.py` | Model metadata |
| `scripts/test_ondevice_intent.js` | Test on-device intent classification | `node scripts/test_ondevice_intent.js` | Intent results |

### NPM Scripts (root `package.json`)
| Script | Purpose |
|--------|---------|
| `npm run db:studio` | Open Prisma Studio for visual DB inspection |
| `npm run db:introspect` | Pull live DB schema into `prisma/schema.prisma` |
| `npm run db:validate` | Validate Prisma schema consistency |

---

## Implementation Status

| Component | Status | Owner | Details |
|-----------|--------|-------|---------|
| JSON Schema Contracts | Complete | Shared | Frozen schemas for state, experience, and voice |
| Seed Data & Scenarios | Complete | Shared | 5 comprehensive adaptive scenarios |
| Multi-Source Data Harmonizer | Production-Ready | Ubaid | 7 dirty feeds (CBS, UPI, SMS, CIBIL, BBPS, NCMC, KYC) |
| Vectorized Feature Extractor | Production-Ready | Ubaid | 32 single-pass metrics, cash-flow forecast, 50/30/20 |
| Multi-Factor Personalization | Production-Ready | Ubaid | Affordability/Lifecycle/Urgency/Archetype scoring |
| Dual-Cadence Processing | Production-Ready | Ubaid | 14-day batch + 0.162ms micro-triggers |
| Cryptographic Audit Ledger | Production-Ready | Ubaid | Immutable SHA-256 decision chain |
| Ethical AI Guardrail | Production-Ready | Ubaid | DTI > 0.40 loan suppression |
| Voice Intent & MiniCPM-5 SLM | Production-Ready | Ubaid | Hindi, Gujarati, English edge SLM |
| AI Test Suite | Verified | Ubaid | 45/45 tests passing (0.39s) |
| Backend API (FastAPI) | Implemented | Harsh | 15+ routes, CORS, health, scenarios |
| Experience Composer | Implemented | Harsh | SafetyPolicyFilter + dynamic composition |
| Frontend App (Expo SDK 57) | Complete | Lakshya | Dynamic attention stack, adaptive cards |
| Offline State Bundles | Complete | Lakshya | Instant offline resilience for all scenarios |

---

## Key Principles

- **Data Privacy & Localization**: Encrypted, local processing complying with RBI Data Localization Circular (2018) and DPDP Act 2023
- **Strict Architecture Decoupling**: MiniCPM-5 Voice SLM handles conversational speech queries only; personal recommendations are 100% deterministic and mathematical
- **Privacy-First UX**: Granular spending data operates strictly as internal telemetry to calibrate protective services, never displayed as an invasive lifestyle ledger
- **Ethical AI Shield**: When financial stress or high DTI is detected, loan offers are strictly eliminated and replaced by cash-flow stabilization support
- **No Hallucination Risk**: Generative AI never makes financial decisions — only deterministic math-based scoring

---

## Documentation Index

| Category | Document | Description |
|----------|----------|-------------|
| **Architecture** | [Architecture Overview](docs/architecture/overview.md) | High-level system architecture (7 diagrams) |
| **Architecture** | [Backend Architecture](docs/architecture/backend.md) | FastAPI services, routes, request lifecycle (7 diagrams) |
| **Architecture** | [Frontend Architecture](docs/architecture/frontend.md) | React Native/Expo, state management, navigation (7 diagrams) |
| **Architecture** | [AI Engine Architecture](docs/architecture/ai-engine.md) | Intelligence pipeline, voice SLM, ML models (8 diagrams) |
| **Architecture** | [Data Flow](docs/architecture/data-flow.md) | End-to-end data flows, contracts, attention layers (6 diagrams) |
| **Architecture** | [Authentication](docs/architecture/authentication.md) | PIN, biometrics, card security, limitations (5 diagrams) |
| **Reference** | [API Endpoints](docs/api/endpoints.md) | All 15+ endpoints with request/response details (5 diagrams) |
| **Reference** | [Database Schema](docs/database/schema.md) | 9 tables, ER diagram, migrations, seed data (4 diagrams) |
| **Reference** | [Security Overview](docs/security/overview.md) | Auth, ethical AI, compliance, limitations (4 diagrams) |
| **Reference** | [Feature Inventory](docs/features/overview.md) | 18 features with implementation details (6 diagrams) |
| **Operations** | [Development Setup](docs/development/setup.md) | Prerequisites, quick start, env vars, scripts (3 diagrams) |
| **Operations** | [Testing](docs/testing/overview.md) | Test suites, audit checks, coverage gaps (2 diagrams) |
| **Operations** | [Deployment](docs/deployment/overview.md) | Infrastructure, Docker, migrations (3 diagrams) |
| **Legacy** | [Personalization Guide](PERSONALIZATION_SYSTEM_GUIDE.md) | Hyper-personalization math formulas |
| **Legacy** | [Banking Taxonomy](BHARAT_BANKING_SERVICES_MASTER_TAXONOMY.md) | 55+ Indian banking services |
| **Legacy** | [AI System Guide](AI_SYSTEM_GUIDE.md) | AI agent architecture |
| **Legacy** | [Contracts](docs/CONTRACTS.md) | Interface contracts with payloads |
| **Legacy** | [Data Model](docs/DATA_MODEL.md) | Conceptual entities |
| **Legacy** | [Demo Flow](docs/DEMO_FLOW.md) | Hackathon demo script |

### Traceability Matrix

| Concept | Implementation | Documentation |
|---------|---------------|---------------|
| Authentication | `apps/backend/app/services/state_service.py` | [Authentication](docs/architecture/authentication.md) |
| Experience Composition | `apps/backend/app/experience/composer.py` | [Backend Architecture](docs/architecture/backend.md) |
| AI Personalization | `ai/intelligence/personalization/` | [AI Engine](docs/architecture/ai-engine.md) |
| Data Ingestion | `ai/intelligence/ingestion/harmonizer.py` | [Data Flow](docs/architecture/data-flow.md) |
| Safety Policy | `apps/backend/app/services/safety_policy.py` | [Security](docs/security/overview.md) |
| Crypto Ledger | `ai/intelligence/personalization/cryptoledger.py` | [Security](docs/security/overview.md) |
| State Management | `apps/frontend/src/state/customerStore.ts` | [Frontend Architecture](docs/architecture/frontend.md) |
| Voice Pipeline | `ai/voice/` | [AI Engine](docs/architecture/ai-engine.md) |
| Database Access | `apps/backend/app/db/` | [Database Schema](docs/database/schema.md) |
| API Routes | `apps/backend/app/api/routes.py` | [API Endpoints](docs/api/endpoints.md) |

---

*Built for HackOut'26 at DA-IICT by Harsh Solanki, Panchal Lakshya, and Ubaid Khan.*
