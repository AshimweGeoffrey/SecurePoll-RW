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

# ArcFace verification thresholds — calibrated on the LFW cross-session
# benchmark (genuine cosine ~0.63, impostor max ~0.20). See scripts/benchmark_lfw.py.
FACE_MATCH_THRESHOLD=0.30    # approve if confidence >= this
REVIEW_FLOOR=0.20            # manual review if confidence >= this
DEDUP_THRESHOLD=0.40         # flag duplicate if cosine similarity >= this

# Inference backend: "insightface" (real ArcFace) | "synthetic" (deterministic,
# no model download — for CI, demos, and offline testing).
AI_BACKEND=insightface

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
PUT  /biometrics/enroll              Re-enrol (replace existing template)
GET  /biometrics/templates           List all biometric templates
GET  /biometrics/quality/{voter_id}  Template quality score
GET  /biometrics/stats               Enrolment coverage stats
POST /biometrics/dedup-scan/{voter_id}  Run 1:N dedup scan for a voter
DELETE /biometrics/templates/{voter_id} Delete a template

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

# AI / model ops
GET  /ai/status                      Active backend, model + FAISS index health
GET  /ai/thresholds                  Current match/review/dedup thresholds
PUT  /ai/thresholds                  Update thresholds at runtime
POST /ai/rebuild-index               Rebuild FAISS index from stored templates
POST /ai/healthcheck                 Ping AI subsystem

# System
GET  /health                         Service health check
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

Test counts: **79 unit tests** + **215 integration tests** = **294 total**

### Live validation & biometric benchmarks

Beyond pytest, three scripts validate the running system and the face-recognition engine:

```bash
# Smoke-test every endpoint against a running server (~110 routes)
python3 scripts/smoke_test.py

# End-to-end biometric pipeline with real faces (enrol → verify → dedup → vote → audit)
AI_BACKEND=insightface python3 scripts/validate_pipeline.py

# Face-recognition accuracy on the LFW cross-session benchmark (ROC/AUC/EER)
AI_BACKEND=insightface python3 scripts/benchmark_lfw.py 1000
```

Measured on the standard LFW protocol (1,000 pairs): **ROC AUC 0.998, EER 0.90%, 99.6% accuracy** — the basis for the calibrated thresholds above.

### Inference backends

The face-embedding/liveness step is pluggable via `AI_BACKEND`:

| Backend | Use | Notes |
|---------|-----|-------|
| `insightface` | Production / real matching | ArcFace `buffalo_l`, 512-d, ~200 ms/face (CPU) |
| `synthetic` | CI, demos, offline dev | Deterministic embeddings from image bytes — no model download |

If 1:N dedup looks inactive after a restart, the FAISS index may be out of sync with the
database (startup logs a warning). Repair it with `POST /ai/rebuild-index`, which rebuilds
the index from the stored AES-encrypted embeddings.

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
| `FACE_MATCH_THRESHOLD` | No | `0.30` | Min confidence for `approved` result (calibrated on LFW) |
| `REVIEW_FLOOR` | No | `0.20` | Min confidence for `manual_review` result |
| `DEDUP_THRESHOLD` | No | `0.40` | Min similarity to flag as duplicate |
| `AI_BACKEND` | No | `insightface` | Inference backend: `insightface` or `synthetic` |
| `LIVENESS_BACKEND` | No | `passive` | Anti-spoof: `passive` (image-quality) or `none` |
| `FAISS_INDEX_PATH` | No | `ml/faiss/index.bin` | Path to FAISS index file |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins (restrict in prod) |
| `RATE_LIMIT_PER_MINUTE` | No | `60` | Per-IP request limit; `0` disables |
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
