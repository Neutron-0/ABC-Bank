# Development Setup

Comprehensive development workflow documentation for the ABC Bank project.

## Prerequisites
- Python 3.11+
- Node.js 18+ (for Prisma tooling and frontend)
- Docker & Docker Compose (for PostgreSQL)
- Expo CLI (for frontend)
- Git

## Tool Chain

```mermaid
flowchart TD
    A[Node.js 18+] --> B(Expo CLI)
    A --> C(Prisma Studio)
    A --> D(Frontend React Native)
    E[Python 3.11+] --> F(FastAPI Backend)
    E --> G(AI Data Pipelines)
    E --> H(Alembic Migrations)
    I[Docker] --> J[(PostgreSQL 16)]
    J --> H
    J --> C
    F --> J
```

## Quick Start
1. Clone repository
2. Copy `.env.example` to `.env` and configure
3. Start PostgreSQL: `docker-compose up -d`
4. Install backend dependencies: `pip install -r apps/backend/requirements.txt` and `pip install -r ai/requirements.txt`
5. Run migrations: `cd apps/backend && alembic upgrade head`
6. Seed database: `python scripts/seed_database.py`
7. Start backend: `uvicorn apps.backend.app.main:app --reload --port 8000`
8. Install frontend: `cd apps/frontend && npm install`
9. Start frontend: `npx expo start`

### Development Setup Flow

```mermaid
flowchart TD
    A(Clone Repository) --> B("Copy .env.example -> .env")
    B --> C(docker-compose up -d)
    C --> D(pip install requirements)
    D --> E(alembic upgrade head)
    E --> F(python seed_database.py)
    F --> G(Start Backend: uvicorn)
    F --> H(npm install frontend)
    H --> I(Start Frontend: npx expo start)
```

## Environment Variables (from .env.example)

| Variable | Required | Description | Example | Used By | Sensitive |
|----------|----------|-------------|---------|---------|----------|
| DATABASE_URL | Yes | PostgreSQL connection string | postgresql://postgres:postgres@localhost:5432/abc_bank | Backend | Yes |
| EXPO_PUBLIC_API_URL | Yes | Backend API URL for mobile app | http://localhost:8000 | Frontend | No |
| AI_VERBOSITY | No | AI logging verbosity | 1 | AI Engine | No |
| DEFAULT_LANGUAGE | No | Default language (en/hi/gu) | en | Backend | No |
| MINICPM5_MODEL_PATH | No | Path to MiniCPM-5 ONNX model | ./assets/minicpm5_slm_v1.onnx | Voice AI | No |
| PRISMA_DB_URL | No | Prisma tunnel DB string (for studio) | postgresql://postgres:postgres@localhost:5433/abc_bank | Prisma | Yes |

## Docker Services
- `db`: postgres:16-alpine, port 5432, volume postgres_data, healthcheck pg_isready

## NPM Scripts (root package.json)
- `db:studio`: Opens Prisma Studio for visual DB inspection
- `db:introspect`: Pulls live DB schema into prisma/schema.prisma
- `db:validate`: Validates Prisma schema

## Scripts
- `scripts/run-demo.ps1` / `scripts/run-demo.sh`: Starts backend + frontend for demo
- `scripts/generate_seed_data.py`: Generates 1.2k mock customer profiles and 127k+ transactions
- `scripts/seed_database.py`: Bulk inserts seed data into PostgreSQL (batches of 10,000)
- `scripts/audit_and_verify_all.py`: 39-check validation suite across all AI pillars
- `scripts/export_onnx_meta.py`: Exports ONNX model metadata
- `scripts/test_ondevice_intent.js`: Tests on-device intent classification

## Team Ownership (.github/CODEOWNERS)
- `apps/frontend/` → @lakshya
- `apps/backend/` → @harsh
- `ai/` → @ubaid
- `contracts/` and `data/` → shared (requires consensus)

### Team Ownership Map

```mermaid
flowchart TD
    A[Lakshya] -->|Owns| B(apps/frontend/)
    C[Harsh] -->|Owns| D(apps/backend/)
    E[Ubaid] -->|Owns| F(ai/)
    A -->|Consensus| G(contracts/ & data/)
    C -->|Consensus| G
    E -->|Consensus| G
```

## Development Rules
- Team members must NOT edit other domains' folders
- Changes to `contracts/` require team consensus
- All changes must pass `scripts/audit_and_verify_all.py` before merge

## Testing
- Backend: `pytest` (in apps/backend/)
- AI: `pytest ai/tests/` (45 tests, ~0.39s)
- Audit: `python scripts/audit_and_verify_all.py` (39 checks)

## Debugging
- AI Inspector: http://localhost:8000/inspector
- Voice Inspector: http://localhost:8000/voice-inspector
- Prisma Studio: `npm run db:studio`
