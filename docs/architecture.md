# VZEYA System Architecture

## Core Pipeline
```mermaid
flowchart TD
    A[Existing Bank Infrastructure] --> B[Data/APIs]
    B --> C["Feature Engine (ai/intelligence/features/)"]
    C --> D["Signal Engine (ai/intelligence/signals/)"]
    D --> E["Customer State Generator (ai/intelligence/customer_state/)"]
    E --> F["Recommendation/Decision Engine (ai/intelligence/recommendations/)"]
    F --> G["Experience Orchestrator (apps/backend/app/experience/)"]
    G --> H["Adaptive Frontend (apps/frontend/)"]
```

## Voice Pipeline
```mermaid
flowchart TD
    A[Voice Input] --> B["Speech Processing (MiniCPM5 planned)"]
    B --> C["Local SLM Intent Classification (ai/voice/intents/)"]
    C --> D[Structured VoiceIntent]
    D --> E[Backend API]
    E --> F[Trusted Banking Data]
    F --> G[Local Conversational Response]
```

## What Runs Where
- **Backend Server**: Feature extraction, signal detection, customer state, recommendations, experience composition, API routing
- **On-Device (planned)**: Voice capture, speech-to-text, SLM intent classification, conversational response
- **Frontend (mobile)**: UI rendering from ExperienceConfig, offline state bundles, scenario switching

## Dependency Direction
```mermaid
graph TD
    A["contracts/"] --> B[AI]
    A --> C[Backend]
    A --> D[Frontend]
    B -->|CustomerState| C
    C -->|ExperienceConfig| D
    E[Voice] -->|VoiceIntent| C
```

## Data Flow
```mermaid
flowchart TD
    A["data/scenarios/*.json + data/seed/*.json"] --> B[AI Pipeline]
    B --> C["customer-state.json"]
    C --> D[Backend Experience Composer]
    D --> E[ExperienceConfig]
    E --> F[Frontend Renderer]
```

## API Architecture
- FastAPI on port 8000
- Endpoints: `GET /customer/{id}`, `GET /experience/{id}`, `POST /scenario/switch`, `POST /voice/intent`
- CORS enabled, health check at `/health`

## Ethical AI Architecture
- Recommendation ranker has `SUPPRESSED_IN_STRESS` categories
- DTI > 0.40 or `stress_alert` triggers suppression
- Every recommendation has a `reason` field

## Contract-Driven Architecture
- Three JSON schemas are the system boundaries
- All domains validate against them
- Changes require multi-party coordination

## Current Limitations
- Voice SLM is rule-based (MiniCPM5 planned)
- No real bank API integration
- Single demo customer
- No auth layer
- No database (in-memory from JSON)
