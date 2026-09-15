# Authentication and Authorization

This document outlines the authentication and authorization mechanisms for the ABC Bank system.

## Authentication Mechanisms

### 1. JWT Authentication (Backend)
- **Implementation**: Uses `python-jose` for generating and verifying HS256 JWT tokens (see `apps/backend/app/core/auth.py`).
- **Token Generation**: `create_access_token()` issues tokens with a default 24-hour expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- **Protected Routes**: Endpoints like `GET /auth/me` and other protected endpoints depend on `get_current_customer_claims()` which extracts and verifies the bearer token from the `Authorization` header.
- **Routes**: `POST /auth/register` for user creation, `POST /auth/login` to obtain the token.

### 2. PIN Authentication
- **Setup**: `POST /auth/pin/setup` utilizes PBKDF2-HMAC-SHA256 with 100,000 iterations and a 16-byte random salt generated via `secrets.token_hex(16)`.
- **Verify**: `POST /auth/pin/verify` uses `hmac.compare_digest` for a constant-time comparison to prevent timing attacks.
- **Brute Force Protection**: 5 failed attempts result in a 15-minute lockout.
- **Storage**: PIN data is stored in an in-memory dictionary `_customer_pins` containing `{hash, salt, failed_attempts, locked_until}`.

### 3. Biometric Authentication (Frontend)
- Utilizes `expo-local-authentication` for device biometrics.
- The `requestPaymentAuth()` function in the `customerStore` is triggered before sensitive operations.
- Falls back to PIN authentication if biometrics are unavailable or fail.

### 4. Card Security
- The `_card_controls` mechanism manages the `is_locked` state per customer.
- If a card is locked, `execute_payment` raises a `PermissionError` for ATM, POS, and Card categories.
- `POST /cards/controls` is used to update the lock status and limits.

## Authorization

- **JWT Claims**: The system relies on JWT tokens validated via `get_current_customer_claims()` for secure authorization to endpoints.
- **Transaction Gate**: The card lock acts as a transaction-level authorization gate.
- **Recommendation Gate**: The `SafetyPolicyFilter` acts as a recommendation-level authorization (e.g., blocking credit recommendations for users in a stressed financial state).

## Security Limitations

- **CORS**: Configured with `allow_origins=["*"]`, which is suitable only for development.
- **Ephemeral Storage**: PIN state is stored in-memory and will be lost upon application restart.
- **HTTPS Enforcement**: No HTTPS enforcement at the application level; relies entirely on external infrastructure.

## Diagrams

### JWT Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Service
    participant E as Protected Endpoint
    
    C->>A: POST /auth/register
    A-->>C: User created
    
    C->>A: POST /auth/login
    A->>A: Verify credentials
    A->>A: create_access_token() (HS256)
    A-->>C: Return JWT Token (24h expiry)
    
    C->>E: Request + Bearer JWT
    E->>E: get_current_customer_claims()
    E-->>C: Protected Data
```

### PIN Setup Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Service
    
    C->>A: POST /auth/pin/setup
    A->>A: Generate 16-byte salt (secrets.token_hex)
    A->>A: Hash PIN with PBKDF2-HMAC-SHA256 (100k iterations)
    A->>A: Store in _customer_pins in-memory
    A-->>C: Setup Successful
```

### PIN Verification with Rate Limiting

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Service
    
    C->>A: POST /auth/pin/verify
    A->>A: Check if locked_until > now
    alt Is Locked
        A-->>C: Error: 15-minute lockout
    else Not Locked
        A->>A: Constant-time comparison (hmac.compare_digest)
        alt Success
            A->>A: Reset failed_attempts
            A-->>C: Verification Successful
        else Failure
            A->>A: Increment failed_attempts
            alt failed_attempts >= 5
                A->>A: Set locked_until = now + 15 mins
            end
            A-->>C: Error: Invalid PIN
        end
    end
```

### Biometric Payment Flow

```mermaid
sequenceDiagram
    participant U as User
    participant CS as customerStore
    participant Bio as expo-local-authentication
    participant BE as Backend

    U->>CS: Initiates Payment
    CS->>Bio: requestPaymentAuth()
    Bio-->>U: Prompt Biometrics
    U->>Bio: Authenticate (Face/Fingerprint)
    Bio-->>CS: Success
    CS->>BE: Execute Payment
    BE-->>CS: Payment Response
    CS-->>U: Payment Result
```

### Card Security State

```mermaid
stateDiagram-v2
    [*] --> Unlocked
    Unlocked --> Locked : POST /cards/controls (lock)
    Locked --> Unlocked : POST /cards/controls (unlock)
    
    state Unlocked {
        [*] --> ProcessPayment
        ProcessPayment --> Success
    }
    
    state Locked {
        [*] --> RejectPayment
        RejectPayment --> PermissionError
    }
```

### Authorization Layers

```mermaid
flowchart TD
    Req["Request with customer_id"] --> CL["Card Lock Check (Transaction Gate)"]
    CL -->|Locked| Deny["Deny Action"]
    CL -->|Unlocked| SP["Safety Policy Filter (Recommendation Gate)"]
    SP -->|Blocked| Deny
    SP -->|Allowed| Exec["Execute Action"]
```
