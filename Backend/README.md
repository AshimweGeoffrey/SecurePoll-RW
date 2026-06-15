# SecurePoll RW — Backend

Biometric voter-verification API for Rwanda's simulated National Electoral Commission.
Built as a Final Year Project demonstrating election-grade security engineering.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.104+ (async, OpenAPI auto-docs) |
| ORM | SQLAlchemy 2.0 (`Mapped[]` annotations) |
| Database | PostgreSQL (Supabase) |
| Face AI | InsightFace ArcFace 512-d embeddings |
| Search index | FAISS flat-L2 for 1:N deduplication |
| Template security | AES-256-GCM with per-template random nonce |
| Audit integrity | SHA-256 hash chain (tamper-evident log) |
| Auth | JWT (PyJWT) + TOTP 2FA (pyotp / RFC 6238) |
| RBAC | Custom role table with permission string arrays |

---

## Prerequisites

- Python 3.11+
- A PostgreSQL database (Supabase free tier works)
- `pip` or a virtual-env manager
- `cmake` + C++ build tools (required by InsightFace)
  - macOS: `brew install cmake`
  - Ubuntu: `sudo apt-get install cmake build-essential`

---

## Quick Start

### 1 — Clone and enter the Backend directory

```bash
git clone <repo-url>
cd SecurePoll-RW/Backend
```

### 2 — Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
```

### 3 — Install dependencies

```bash
pip install -e ".[dev]"          # dev extras: pytest, coverage, black
# production only:
pip install -e "."
```

### 4 — Configure environment variables

Create a `.env` file in the `Backend/` directory:

```env
# PostgreSQL connection string (Supabase pooler or local)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# JWT — at least 32 random characters
JWT_SECRET=change-me-to-a-long-random-secret-at-least-32-chars

# Token lifetime in minutes
ACCESS_TOKEN_MINUTES=30

# AES-256-GCM key for biometric template encryption (64 hex chars = 32 bytes)
# Generate: python3 -c "import os; print(os.urandom(32).hex())"
TEMPLATE_AES_KEY=0000000000000000000000000000000000000000000000000000000000000000

# ArcFace verification thresholds
FACE_MATCH_THRESHOLD=0.80    # approve if confidence >= this
REVIEW_FLOOR=0.60            # manual review if confidence >= this
DEDUP_THRESHOLD=0.85         # flag duplicate if cosine similarity >= this

# FAISS index (relative to Backend/)
FAISS_INDEX_PATH=ml/faiss/index.bin

DEBUG=False
```

### 5 — Seed the database

```bash
python3 scripts/seed.py
```

This creates all tables and populates them with:
- 30 districts, 60 polling stations
- 15 admin users with multiple roles
- 600 voters with encrypted biometric templates
- 400 verification attempts, 8 fraud cases, 5 duplicate matches, 6 anomaly signals
- 20 audit log entries with a clean SHA-256 hash chain

Default admin credentials after seeding:

| Email | Password | Role |
|-------|----------|------|
| `admin@securepoll.rw` | `SecurePassword123!` | Super Admin |
| `registrar@securepoll.rw` | `SecurePassword123!` | Registrar |
| `observer@securepoll.rw` | `SecurePassword123!` | Observer |

### 6 — Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# or
make run
```

The API is now available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

---

## Authentication

1. `POST /auth/login` with `{"email": "...", "password": "..."}` → receive JWT
2. If `mfa_required: true`, call `POST /auth/mfa` with `{"code": "123456"}` using the partial token
3. Include the full token as `Authorization: Bearer <token>` on all subsequent requests
4. In **Swagger UI**: click the **Authorize** button (🔒) at the top right and paste the token

---

## API Modules

| Tag | Endpoints | Purpose |
|-----|-----------|---------|
| `auth` | `/auth/*`, `/users/*`, `/roles/*`, `/sessions/*` | Login, MFA, user management, RBAC |
| `voters` | `/voters/*`, `/registry/health` | Voter registry CRUD, CSV import/export |
| `geography` | `/districts/*`, `/polling-stations/*` | Districts and polling station management |
| `officers` | `/officers/*` | Field officer management |
| `biometrics` | `/biometrics/*` | Face enrolment with ArcFace + 1:N dedup |
| `verification` | `/verifications/*`, `/votes` | Election-day 1:1 verify + vote casting |
| `fraud` | `/fraud/*`, `/duplicates/*`, `/anomalies/*` | Fraud cases, duplicates, anomaly signals |
| `audit` | `/audit/*` | Hash-chained audit log, chain verify, CSV export |
| `analytics` | `/analytics/*` | Turnout, demographics, verification stats |
| `keys` | `/keys/*` | AES encryption key registry |
| `ai` | `/ai/*` | AI model health, FAISS index status |

### Key Endpoints

```
# Auth
POST /auth/login                     Email + password login
POST /auth/token                     OAuth2 form login (Swagger Authorize button)
POST /auth/mfa                       Complete TOTP 2FA challenge
POST /auth/refresh                   Refresh JWT without re-login
POST /auth/change-password           Change own password
GET  /users                          List admin users
POST /users:invite                   Invite new admin user
POST /users/{id}:activate            Activate invitation-pending account
POST /users/{id}:suspend             Suspend account
POST /users/{id}:reset-mfa           Generate new TOTP secret

# Voter Registry
GET  /voters                         List voters (search, filter by status/district)
POST /voters                         Register new voter
GET  /voters/{id}                    Get voter by UUID
GET  /voters/by-token/{token}        Get voter by voter card token
PATCH /voters/{id}                   Update name/phone
POST /voters/{id}:block              Block voter
POST /voters/{id}:restore            Restore blocked/archived voter
GET  /voters:export                  Download registry CSV
POST /voters:import                  Bulk-upload voter CSV

# Geography
GET  /districts                      List all districts
POST /districts                      Create district
GET  /polling-stations               List polling stations
POST /polling-stations               Create polling station
POST /polling-stations/{id}:open     Open polling station (status=online)
POST /polling-stations/{id}:close    Close polling station (status=offline)

# Field Officers
GET  /officers                       List field officers
POST /officers                       Create officer
GET  /officers/{id}/stats            Officer verification statistics

# Biometrics
POST /biometrics/enroll              Enrol face (ArcFace + 1:N dedup)
GET  /biometrics/templates           List all biometric templates
GET  /biometrics/quality/{voter_id}  Template quality score

# Verification (public — no JWT required)
POST /verifications                  1:1 face verification (election day)
POST /votes                          Cast vote (double-vote protected)
GET  /verifications                  List verification attempts (admin)
POST /verifications/{id}:override    Override manual review decision

# Fraud
GET  /fraud/cases                    List fraud cases
POST /fraud/cases/{id}:dismiss       Dismiss case
POST /fraud/cases/{id}:escalate      Escalate case
GET  /duplicates                     List duplicate biometric matches
POST /duplicates/{id}:merge          Merge duplicate voters
GET  /anomalies                      List anomaly signals
POST /anomalies/{id}:acknowledge     Acknowledge anomaly
POST /anomalies/{id}:mute            Mute anomaly

# Audit
GET  /audit/entries                  Browse audit log (filter by action/actor/service)
GET  /audit/entries/{id}             Get single audit entry
POST /audit:verify-chain             Walk entire chain and report tampered rows
GET  /audit:export                   Download audit CSV

# Analytics
GET  /analytics/turnout              Real-time voter turnout
GET  /analytics/demographics         Demographic breakdown (sex, district)
GET  /analytics/verification         Verification performance metrics
GET  /analytics/live                 Combined live dashboard (turnout + verification + anomalies)

# System
GET  /health                         Service health check
GET  /ai/status                      AI model + FAISS index health
GET  /keys                           Encryption key registry
```

---

## Running Tests

```bash
# All tests (unit + integration)
make test

# Unit tests only — no database needed, runs in ~2 seconds
make test-unit

# Integration tests — needs .env with real DATABASE_URL
make test-integration

# Coverage HTML report (opens htmlcov/index.html)
make coverage
```

Test counts: **74 unit tests** + **215 integration tests** = **289 total**

---

## Project Structure

```
Backend/
├── app/
│   ├── core/
│   │   ├── audit.py          # SHA-256 hash-chained write_audit() + verify_chain()
│   │   ├── config.py         # pydantic-settings — loads .env via absolute path
│   │   ├── crypto.py         # AES-256-GCM biometric template encryption
│   │   ├── db.py             # SQLAlchemy engine + SessionLocal + get_db
│   │   ├── deps.py           # get_current_user dependency, require_role()
│   │   ├── enums.py          # All application enums
│   │   └── security.py       # bcrypt, JWT, TOTP utilities
│   ├── db/models/            # SQLAlchemy ORM models (one file per domain)
│   │   ├── audit.py          # AuditEntry (append-only, hash-chained)
│   │   ├── biometric.py      # BiometricTemplate, EncryptionKey
│   │   ├── fraud.py          # FraudCase, DuplicateMatch, AnomalySignal
│   │   ├── geography.py      # District, PollingStation
│   │   ├── people.py         # FieldOfficer, Role, AdminUser, Session
│   │   ├── verification.py   # VerificationAttempt
│   │   └── voter.py          # Voter
│   ├── modules/              # Feature modules (router __init__.py + service.py)
│   │   ├── ai/               # Model health, FAISS index status
│   │   ├── analytics/        # Turnout, demographics, verification stats
│   │   ├── audit/            # Audit log endpoints
│   │   ├── auth/             # Login, MFA, users, roles, sessions
│   │   ├── biometrics/       # Face enrolment, 1:N dedup
│   │   ├── fraud/            # Fraud cases, duplicates, anomalies
│   │   ├── geography/        # Districts, polling stations
│   │   ├── keys/             # AES key management
│   │   ├── officers/         # Field officer CRUD
│   │   ├── verification/     # 1:1 verify, vote casting
│   │   └── voters/           # Voter registry CRUD
│   ├── schemas/              # Pydantic request/response schemas
│   └── main.py               # FastAPI app, CORS, lifespan, router registration
├── ml/
│   └── inference.py          # InsightFace ArcFace + FAISS wrapper
├── scripts/
│   └── seed.py               # Full database seeding script
├── tests/
│   ├── unit/                 # Pure unit tests (no DB)
│   └── test_*.py             # Integration tests
├── conftest.py               # pytest shared fixtures
├── pyproject.toml            # Dependencies, pytest, coverage config
├── Makefile                  # Developer shortcuts
├── Dockerfile
└── docker-compose.yml
```

---

## Docker

```bash
# Build and start
docker-compose up --build

# Or standalone
docker build -t securepoll-backend .
docker run -p 8000:8000 --env-file .env securepoll-backend
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret (≥32 chars) |
| `JWT_ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_MINUTES` | No | `30` | Token lifetime |
| `TEMPLATE_AES_KEY` | Yes | — | 64 hex chars (32 bytes) for AES-256-GCM |
| `FACE_MATCH_THRESHOLD` | No | `0.80` | Min confidence for `approved` result |
| `REVIEW_FLOOR` | No | `0.60` | Min confidence for `manual_review` result |
| `DEDUP_THRESHOLD` | No | `0.85` | Min similarity to flag as duplicate |
| `FAISS_INDEX_PATH` | No | `ml/faiss/index.bin` | Path to FAISS index file |
| `DEBUG` | No | `False` | Enable verbose logging |

---

## Security Notes

- **Biometric templates** are never stored in plaintext. Each template is encrypted with AES-256-GCM using a fresh random 12-byte nonce. The encryption key lives in `TEMPLATE_AES_KEY`.
- **Audit log integrity** — every entry's SHA-256 hash includes the previous entry's hash. Any tampered row is detected by `POST /audit:verify-chain`.
- **Double-vote prevention** — `POST /votes` uses `SELECT … FOR UPDATE` to serialize concurrent requests for the same voter at the database level.
- **CORS** is permissive (`allow_origins=["*"]`) for development. Restrict to specific origins in production.
- **JWT tokens** are stateless — revoking requires client-side discard OR session revocation via `POST /sessions/{id}:revoke`.

---

## Contact

Geoffrey Ashimwe · ashimwegeoffrey@gmail.com
