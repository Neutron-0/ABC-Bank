# ABC Bank — Database Development & Prisma Studio Guide

This guide explains how to connect to the ABC Bank PostgreSQL database and visually inspect it using **Prisma Studio**.

---

## 1. Core Architecture

```text
Application Runtime:
FastAPI (Python) → SQLAlchemy 2.x → PostgreSQL 12 (Ubuntu Remote / AWS RDS)
Migration Authority: Alembic (Python)

Visual Inspection & Database Admin:
Prisma Studio (Local Web UI) → SSH Tunnel (:5433) → PostgreSQL (:5432)
```

> **IMPORTANT**:
> - Alembic remains the sole migration authority for the backend schema.
> - Prisma is configured exclusively for introspection (`prisma db pull`) and database browsing (`prisma studio`).
> - Do **not** run `prisma migrate dev` or `prisma db push` against the production database.

---

## 2. Secure Connection via SSH Tunnel (No Public Port Exposure)

PostgreSQL is strictly bound to `127.0.0.1:5432` on the remote server (`152.67.9.53`). Port 5432 is **never** publicly opened.

To connect Prisma Studio locally, establish an encrypted SSH local port forward:

```bash
ssh -N -L 5433:127.0.0.1:5432 -i key.key ubuntu@152.67.9.53
```

This maps `127.0.0.1:5433` on your workstation securely to port `5432` on the remote server.

---

## 3. Configuring Local Prisma Environment

Set your local database URL to target the tunneled port using the dedicated `abc_bank` role (never the PostgreSQL superuser):

### Using a `.env` File (Recommended)
Create a `.env` file in the project root (this file is already in `.gitignore`):
```ini
DATABASE_URL="postgresql://abc_bank:<strong_password>@127.0.0.1:5433/abc_bank"
```
Both `dotenv-cli` and Prisma will automatically read `DATABASE_URL` from `.env`.

### Setting in Terminal Session Directly
- **PowerShell (Windows)**:
  ```powershell
  $env:DATABASE_URL = "postgresql://abc_bank:<strong_password>@127.0.0.1:5433/abc_bank"
  ```
- **Bash / Linux / macOS**:
  ```bash
  export DATABASE_URL="postgresql://abc_bank:<strong_password>@127.0.0.1:5433/abc_bank"
  ```

> **Security Note**: Never commit actual database passwords or `.env` to version control.

---

## 4. Starting Prisma Studio

Ensure:
1. The **SSH tunnel is running** (`ssh -N -L 5433:127.0.0.1:5432 -i key.key ubuntu@152.67.9.53`).
2. `DATABASE_URL` is set in `.env` or current terminal session.
3. Node client has been generated: `npx prisma generate` (installs `@prisma/client`).

Run:
```bash
npm run db:studio
```
or
```bash
npx prisma studio --port 5555
```

Prisma Studio will launch at:
👉 **`http://localhost:5555`**

> **Troubleshooting: "Prisma Client Error: Unable to run script" or "Environment variable not found: DATABASE_URL"**:
> - This happens if `prisma studio` was started without `DATABASE_URL` present in the environment or before running `npx prisma generate`.
> - Run `npx prisma generate` once so `@prisma/client` is generated in `node_modules`.
> - Ensure `DATABASE_URL` is in your `.env` file or environment pointing to `127.0.0.1:5433`.
> - Ensure your SSH tunnel is active and connected before browsing tables in the Studio UI.

---

## 5. Visualizing the Dataset

Prisma Studio gives full relational visibility into all 9 database tables:

| Table | Approximate Records | What to Inspect |
| :--- | :--- | :--- |
| **`customers`** | 1,200 | Demographics, 8 financial archetypes, credit scores, KYC tier, language preferences. |
| **`accounts`** | 1,384 | Savings, checking, fixed deposits, linked to customers. |
| **`transactions`** | 127,689 | 12-month longitudinal transaction stream: Sunday dinners, morning commute, salary cycles, cinema visits. |
| **`recurring_payments`** | 633 | Active NACH & auto-debit mandates (Home Loan EMIs, Mutual Fund SIPs). |
| **`customer_events`** | 139 | Harvest credits, medical emergencies, business expansions. |
| **`products`** | 10 | Complete banking product catalogue. |
| **`consent_preferences`** | 1,200 | Explicit customer consent and communication flags. |
| **`customer_products`** | 0 | Customer-product relationship subscriptions. |
| **`alembic_version`** | 1 | Python Alembic migration tracking revision. |

---

## 6. Updating the Prisma Schema (Introspection Only)

Whenever backend schema changes are migrated via Alembic:

```bash
# Pull new table definitions into prisma/schema.prisma
npm run db:introspect

# Validate Prisma schema
npm run db:validate
```
