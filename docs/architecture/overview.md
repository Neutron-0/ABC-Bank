# VZEYA / ABC Bank: Architecture Overview

The Bharat Adaptive Banking platform is an AI-powered personalization and experience layer that sits on top of legacy core banking systems. The platform is built around a Server-Driven UI (SDUI) philosophy and deterministic AI decision-making.

The system consists of three main components, independently owned:
- **Frontend** (Lakshya): React Native / Expo mobile app
- **Backend** (Harsh): FastAPI Python API server  
- **AI Engine** (Ubaid): Python ML/intelligence pipeline + on-device Voice SLM

## System Philosophy

- **Server-Driven UI (SDUI):** The AI determines the customer's reality, which the Backend synthesizes into an Experience Config. The Frontend acts as a "dumb renderer".
- **Strict Interface Contracts:** JSON Schema Draft-07 contracts decouple all three domains, ensuring strong boundaries and independent evolution.
- **Contract Files:**
  - `contracts/customer-state.schema.json` (AI → Backend)
  - `contracts/experience.schema.json` (Backend → Frontend)
  - `contracts/voice-intent.schema.json` (Voice → Backend)
- **Responsible AI:** Generative AI never makes financial decisions. All decisions are based on deterministic math (e.g., DTI > 0.40 strictly suppresses credit products).
- **Cryptographic Audit Trail:** A SHA-256 hash chain is maintained for every AI decision.

## Runtime Components

1. **PostgreSQL 16:** (Docker, port 5432) - Stores `customers`, `accounts`, `transactions`, `recurring_payments`, `customer_events`, `products`, `customer_products`, and `consent_preferences`.
2. **FastAPI Backend:** (port 8000) - REST API providing 15+ endpoints, experience composition, safety policy enforcement, and a behavioral engine.
3. **AI Intelligence Pipeline:** (Python) - Ingests 7 data sources (CBS, UPI, SMS, Bureau, BBPS, NCMC, KYC), extracts features, detects signals, generates customer state, and scores recommendations.
4. **React Native / Expo Mobile App:** Features an adaptive home screen, Mitra AI chat, payments, transactions, and profile.
5. **On-Device SLM (MiniCPM-5 INT4):** Runs locally on the user's phone for vernacular NLP (Hindi, Gujarati, Hinglish).

## Key Design Decisions

- **Dual AI Architecture:** Backend AI uses deterministic math for financial decisions, while the On-Device SLM (MiniCPM-5) is strictly used for vernacular NLP and never for financial decisions.
- **7 Bharat Archetypes:** Personalization is driven by archetypes such as `urban_commuter`, `rural_farmer`, etc.
- **Graceful Degradation:** Built-in resilience where DB offline triggers a JSON fallback, and a slow backend (>2.5s timeout) triggers offline edge processing.
- **Database Migrations:** Alembic is strictly used to manage migrations. Prisma is used ONLY for introspection and studio viewing.

---

## Architecture Diagrams

### 1. High-Level System Architecture

```mermaid
flowchart TD
    Users["Users"] --> App["Mobile App (React Native/Expo)"]
    
    subgraph "Frontend Domain"
        App
        SLM["On-Device SLM (MiniCPM-5 INT4)"]
        App <--> SLM
    end
    
    App -->|"REST API"| Backend["FastAPI Backend Server"]
    
    subgraph "Backend Domain"
        Backend
        ExpComp["Experience Composer"]
        Backend --> ExpComp
    end
    
    Backend <--> DB[("PostgreSQL 16")]
    
    subgraph "AI Domain"
        AIPipeline["AI Intelligence Pipeline"]
        StateGen["Customer State Generator"]
        AIPipeline --> StateGen
    end
    
    StateGen -->|"customer-state.json"| Backend
    External[/"7 Data Sources (CBS, UPI, SMS, etc.)"/] --> AIPipeline
```

### 2. Server-Driven UI Flow

```mermaid
flowchart LR
    AIEngine["AI Engine"] -->|"Determines Reality"| CState[/"contracts/customer-state.schema.json"/]
    CState --> Backend["Backend Experience Composer"]
    Backend -->|"Synthesizes"| ExpConfig[/"contracts/experience.schema.json"/]
    ExpConfig --> Frontend["Frontend Renderer"]
```

### 3. Data Pipeline Flow

```mermaid
flowchart TD
    DS[/"7 Data Sources (CBS, UPI, SMS, Bureau, BBPS, NCMC, KYC)"/] --> Harmonizer["Harmonizer (MD5 dedup)"]
    Harmonizer --> FE["Feature Extractor (50/30/20 spend analysis)"]
    FE --> SD["Signal Detector"]
    SD --> CSG["Customer State Generator (14-day batch + 0.16ms micro-trigger)"]
    CSG --> RS["Recommendation Scorer"]
    
    subgraph "Scoring Weights"
        Aff["30% Affordability"]
        Life["30% Lifecycle"]
        Urg["25% Urgency"]
        Arch["15% Archetype"]
    end
    RS --> Aff
    RS --> Life
    RS --> Urg
    RS --> Arch
    
    Aff --> CF["Compliance Filter (RBI DTI, DPDP)"]
    Life --> CF
    Urg --> CF
    Arch --> CF

    CF --> CL["Crypto Ledger (SHA-256)"]
    CL --> CState[/"customer-state.json"/]
    CState --> EC["Experience Composer (DO/KNOW/PLAN/CONSIDER)"]
    EC --> SPF["Safety Policy Filter"]
    SPF --> EConf[/"experience-config.json"/]
    EConf --> FR["Frontend Render"]
```

### 4. Runtime Deployment

```mermaid
flowchart TD
    subgraph "Mobile Device"
        App["Expo App (React Native)"]
        SLM["On-Device SLM (MiniCPM-5 INT4)"]
    end
    
    subgraph "Server Infrastructure"
        Backend["FastAPI Server (Port 8000)"]
        DB[("Docker PostgreSQL 16 (Port 5432)")]
    end
    
    App <-->|"HTTP/REST"| Backend
    Backend <-->|"SQL/TCP"| DB
```

### 5. Contract Boundaries

```mermaid
flowchart TD
    AI["AI Engine"] -->|"contracts/customer-state.schema.json"| Backend["FastAPI Backend"]
    Backend -->|"contracts/experience.schema.json"| Frontend["React Native App"]
    Voice["Voice Module / SLM"] -->|"contracts/voice-intent.schema.json"| Backend
```

### 6. Graceful Degradation

```mermaid
stateDiagram-v2
    [*] --> NormalOperation
    NormalOperation --> DB_Offline: DB connection fails
    DB_Offline --> JSON_Fallback: Use local JSON state
    
    NormalOperation --> Backend_Slow: Response > 2.5s
    Backend_Slow --> Edge_Processing: Process on device
```

### 7. Dual AI Architecture

```mermaid
flowchart LR
    subgraph "On-Device"
        SLM["MiniCPM-5 INT4"]
        NLP["Vernacular NLP (Hindi, Gujarati, Hinglish)"]
        SLM --> NLP
    end
    
    subgraph "Server"
        DetAI["Backend AI"]
        Math["Deterministic Math"]
        FinDec["Financial Decisions"]
        DetAI --> Math
        Math --> FinDec
    end
    
    On-Device -.-|"Strict Boundary: No Financial Decisions on SLM"| Server
```
