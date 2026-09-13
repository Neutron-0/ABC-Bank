# Database Schema and Architecture

This document provides exhaustive database documentation for the VZEYA / ABC Bank system.

## Database Technology
- **PostgreSQL 16 (Alpine)** running in Docker
- **Port**: 5432
- **Volume**: `postgres_data`
- **Health Check**: `pg_isready`

## Schema Management
- **Alembic** manages all database migrations. These are located at `apps/backend/app/db/alembic/`.
- **Prisma** is used ONLY for introspection (`prisma db pull`) and viewing the database via Prisma Studio. It is **NOT** used for migrations.
- The root `package.json` includes the following scripts (using `dotenv-cli`):
  - `db:studio`
  - `db:introspect`
  - `db:validate`

## Models

### 1. customers
- `customer_id` (PK, VarChar64)
- `first_name`
- `last_name`
- `email`
- `phone`
- `date_of_birth`
- `pan_number`
- `aadhaar_number`
- `address_line1`
- `address_line2`
- `city`
- `state`
- `pincode`
- `kyc_status`
- `language_preference`
- `occupation`
- `annual_income` (Decimal)
- `created_at`
- `updated_at`

### 2. accounts
- `account_id` (PK)
- `customer_id` (FK → customers CASCADE)
- `account_type`
- `account_number`
- `ifsc_code`
- `balance` (Decimal)
- `currency`
- `status`
- `opened_at`
- `updated_at`
- **Index**: `[customer_id]`

### 3. transactions
- `transaction_id` (PK)
- `account_id` (FK → accounts CASCADE)
- `customer_id`
- `type` (credit/debit)
- `amount` (Decimal)
- `currency`
- `category`
- `description`
- `merchant_name`
- `reference_number`
- `status`
- `transaction_date`
- `created_at`
- **Indexes**: `[customer_id, category]`, `[customer_id, transaction_date]`

### 4. recurring_payments
- `payment_id` (PK)
- `customer_id` (FK CASCADE)
- `account_id` (FK CASCADE)
- `payee_name`
- `amount` (Decimal)
- `frequency`
- `category`
- `next_due_date`
- `status`
- `auto_pay`
- `created_at`
- **Index**: `[customer_id]`

### 5. customer_events
- `event_id` (PK)
- `customer_id` (FK CASCADE)
- `event_type`
- `event_data` (Text)
- `severity`
- `source`
- `created_at`
- **Index**: `[customer_id, event_type]`

### 6. products
- `product_id` (PK)
- `name`
- `category`
- `description`
- `interest_rate` (Decimal)
- `min_amount` (Decimal)
- `max_amount` (Decimal)
- `tenure_months`
- `eligibility_criteria` (Text)
- `features` (Text)
- `status`
- `created_at`

### 7. customer_products
- `id` (PK)
- `customer_id` (FK CASCADE)
- `product_id` (FK CASCADE)
- `status`
- `applied_at`
- `approved_at`
- `disbursed_amount` (Decimal)
- `interest_rate` (Decimal)
- `tenure_months`
- `emi_amount` (Decimal)
- `next_emi_date`
- **Unique**: `[customer_id, product_id]`
- **Index**: `[customer_id]`

### 8. consent_preferences
- `consent_id` (PK)
- `customer_id` (FK CASCADE)
- `consent_type`
- `status`
- `granted_at`
- `expires_at`
- `purpose` (Text)
- **Index**: `[customer_id]`

### 9. alembic_version
- `version_num` (PK, VarChar32) - Alembic migration tracking

## Cascade Deletes
All foreign keys use `CASCADE` delete. Deleting a customer cascades to:
- accounts
- transactions
- recurring_payments
- customer_events
- customer_products
- consent_preferences

## Repository Pattern
The system employs the Repository pattern for database access:
- `customer_repo.py`: `get_by_id()`, `get_customer_summary()`
- `transaction_repo.py`: `get_by_customer()`, `get_by_account()`
- `event_and_product_repo.py`: Products, RecurringPayments, CustomerEvents

## DataLoader Fallback
- Tries PostgreSQL via repositories.
- If offline, falls back to reading from `data/seed/customers.json` (1.2k profiles) and `data/seed/transactions.json` (longitudinal history).
- Scenario overrides are applied from `data/scenarios/` (e.g., `normal.json`, `financial-stress.json`, `life-change.json`).

## Seed Data
- `scripts/generate_seed_data.py`: Generates 1.2k mock customer profiles and 127k+ transactions.
- `scripts/seed_database.py`: Uses SQLAlchemy `bulk_insert_mappings` in batches of 10,000 for efficient ingestion.

## Connection Details
- `apps/backend/app/db/session.py`: SQLAlchemy connection with connection pool.
- Auto-detects WSL IPv4 via PowerShell `Get-NetNeighbor`, falls back to `localhost`.
- `DATABASE_URL` is sourced from `.env` (default: `postgresql://postgres:postgres@localhost:5432/abc_bank`).

---

## Diagrams

### 1. Entity Relationship Diagram

```mermaid
erDiagram
    customers ||--o{ accounts : "has"
    customers ||--o{ recurring_payments : "has"
    customers ||--o{ customer_events : "has"
    customers ||--o{ customer_products : "applies for"
    customers ||--o{ consent_preferences : "grants"
    accounts ||--o{ transactions : "contains"
    products ||--o{ customer_products : "linked to"

    customers {
        VarChar64 customer_id PK
        string first_name
        string last_name
        string email
        string phone
        string pan_number
        string aadhaar_number
    }

    accounts {
        uuid account_id PK
        VarChar64 customer_id FK
        string account_type
        string account_number
        Decimal balance
    }

    transactions {
        uuid transaction_id PK
        uuid account_id FK
        VarChar64 customer_id
        string type
        Decimal amount
    }

    recurring_payments {
        uuid payment_id PK
        VarChar64 customer_id FK
        uuid account_id FK
        string payee_name
        Decimal amount
    }

    customer_events {
        uuid event_id PK
        VarChar64 customer_id FK
        string event_type
        text event_data
    }

    products {
        uuid product_id PK
        string name
        string category
        Decimal interest_rate
    }

    customer_products {
        uuid id PK
        VarChar64 customer_id FK
        uuid product_id FK
        string status
        Decimal disbursed_amount
    }

    consent_preferences {
        uuid consent_id PK
        VarChar64 customer_id FK
        string consent_type
        string status
    }
    
    alembic_version {
        VarChar32 version_num PK
    }
```

### 2. Data Access Layer

```mermaid
flowchart TD
    API["API Layer"]
    Repo["Repository Layer"]
    SQLA["SQLAlchemy ORM"]
    PG[("PostgreSQL")]
    JSON[("JSON Fallback Files")]
    
    API --> Repo
    Repo -- "Online" --> SQLA
    SQLA --> PG
    Repo -- "Offline (Fallback)" --> JSON
```

### 3. Migration Flow

```mermaid
flowchart LR
    Alembic["Alembic Migration"]
    PG[("PostgreSQL")]
    PrismaIntro["Prisma Introspect"]
    PrismaSchema["schema.prisma"]
    
    Alembic -- "Applies changes to" --> PG
    PG -- "Read by" --> PrismaIntro
    PrismaIntro -- "Generates" --> PrismaSchema
```

### 4. Seed Data Pipeline

```mermaid
flowchart TD
    Gen["scripts/generate_seed_data.py"]
    JSON[("JSON Files")]
    Seed["scripts/seed_database.py"]
    PG[("PostgreSQL")]
    
    Gen -- "Generates mock data" --> JSON
    JSON -- "Read by" --> Seed
    Seed -- "bulk_insert_mappings (batch=10k)" --> PG
```
