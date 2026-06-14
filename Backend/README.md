"""README for backend setup and deployment."""

# SecurePoll RW Backend

A biometric voter verification system built with FastAPI, PostgreSQL, and advanced AI/ML.

## Quick Start

### Option A: Local PostgreSQL + Docker

```bash
cd /Users/Geoffrey/SecurePoll-RW/Backend
bash setup.sh                    # One-command setup
docker-compose up                # Start Postgres + API
```

### Option B: Supabase (Hosted PostgreSQL) ⭐ Recommended

**5-minute setup with zero local infrastructure:**

1. Create project at https://app.supabase.com
2. Copy database URI from Settings > Database > Connection String
3. Update `.env`: `DATABASE_URL=postgresql://postgres:password@host:6543/postgres?sslmode=require`
4. Run: `pip install -e .` && `alembic upgrade head` && `uvicorn app.main:app --reload`

👉 **Full guide**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | **Quick ref**: [SUPABASE_QUICK.md](./SUPABASE_QUICK.md)

### Manual Setup (Local)

#### 1. Install Dependencies

```bash
cd /Users/Geoffrey/SecurePoll-RW/Backend
pip install -e .
```

#### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL`: PostgreSQL connection string (local or Supabase)
- `JWT_SECRET`: Generate with `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
- `TEMPLATE_AES_KEY`: Generate with `python3 -c "import secrets; print(secrets.token_hex(32))"`

#### 3. Setup Database

**Local PostgreSQL 16+:**
```bash
docker-compose up -d db
# or: createdb securepoll
```

**Supabase:** Connection URL from dashboard

#### 4. Run Migrations

```bash
alembic upgrade head
```

#### 5. Seed Sample Data (Optional)

```bash
python scripts/seed.py
```

#### 6. Start Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
app/
  core/              # Config, security, DB, audit
  db/
    models/          # SQLAlchemy ORM
    migrations/      # Alembic schema versions
  schemas/           # Pydantic DTOs
  modules/           # Feature modules (routers + services)
    auth/
    voters/
    biometrics/
    verification/
    fraud/
    audit/
    analytics/
ml/
  inference.py       # AI model loading and inference
```

## Build Phases

### Phase 0: Scaffold ✅
- [x] FastAPI app, Postgres, Alembic
- [x] Core modules (config, db, security, crypto, audit, deps)
- [x] All ORM models
- [x] Enums and schemas

### Phase 1: Auth + Registry
- [ ] JWT + TOTP login
- [ ] Admin user/role/session management
- [ ] Voter CRUD, CSV import
- [ ] Seed 30 districts + stations

### Phase 2: AI Core (THESIS)
- [ ] ML inference (InsightFace, liveness, FAISS)
- [ ] Enrollment flow
- [ ] 1:1 verification + explainability JSON
- [ ] Integration tests

### Phase 3: Dedup + Fraud
- [ ] FAISS 1:N search
- [ ] DuplicateMatch creation
- [ ] FraudCase auto-generation
- [ ] Merge flow

### Phase 4: Audit Chain
- [ ] Hash-chain verification endpoint
- [ ] DB REVOKE hardening
- [ ] Chain tampering tests

### Phase 5: Vote Lock + Analytics
- [ ] Row-level locking for double-vote prevention
- [ ] Concurrency tests
- [ ] Turnout/verification aggregates

### Phase 6: Evaluation
- [ ] FAR/FRR on benchmark set (LFW)
- [ ] Latency profiling
- [ ] Thesis evaluation chapter

## Key Features

### Biometric Verification
- **Face Recognition**: InsightFace ArcFace (512-d embeddings)
- **Passive Liveness**: Anti-spoof detection
- **Explainability**: Confidence + reasoning JSON for each decision
- **Encryption**: AES-256-GCM templates at rest

### Fraud Detection
- **1:N Dedup**: FAISS cosine similarity search
- **Hash-Chained Audit**: Tamper-evident logging
- **Double-Vote Prevention**: Row-level database locks

### Security
- **JWT + TOTP**: 2FA for admin users
- **Encrypted Templates**: Biometric data never returned raw
- **Audit Trail**: Every mutation logged + chained
- **Database Hardening**: REVOKE UPDATE/DELETE on audit table

## Testing

```bash
# Run test suite
pytest

# Run with coverage
pytest --cov=app
```

## Deployment

### Docker

Build and run:

```bash
docker build -t securepoll-backend .
docker run -p 8000:8000 --env-file .env securepoll-backend
```

### Production Checklist

- [ ] Set secure `JWT_SECRET` and `TEMPLATE_AES_KEY`
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Enable database backups
- [ ] Use environment-specific config (no `.env` in git)
- [ ] Run `REVOKE UPDATE, DELETE ON audit_entries` as superuser
- [ ] Configure CORS per frontend domain
- [ ] Setup logging aggregation (CloudWatch, etc.)
- [ ] Enable HTTPS (reverse proxy)
- [ ] Rate limiting on auth endpoints

## Troubleshooting

### Database Connection Refused

Ensure Postgres is running:
```bash
docker-compose ps
```

### Migration Errors

Check if migration is in sync:
```bash
alembic current
alembic history
```

### AI Model Loading Fails

Ensure dependencies installed:
```bash
pip install insightface onnxruntime
```

### Template Encryption Errors

Check `TEMPLATE_AES_KEY` is exactly 64 hex characters (32 bytes):
```bash
echo $TEMPLATE_AES_KEY | wc -c  # Should be 65 (64 + newline)
```

## References

- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/20/)
- [Alembic](https://alembic.sqlalchemy.org/)
- [InsightFace](https://github.com/deepinsight/insightface)
- [FAISS](https://github.com/facebookresearch/faiss)
- [PostgreSQL](https://www.postgresql.org/docs/)

## License

Internal use only.
