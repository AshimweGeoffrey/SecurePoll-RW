"""README for backend setup and deployment."""

# SecurePoll RW Backend

A biometric voter verification system built with FastAPI, PostgreSQL, and advanced AI/ML.

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/Geoffrey/SecurePoll-RW/Backend
pip install -e .
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Generate a strong secret (min 32 chars)
- `TEMPLATE_AES_KEY`: Generate a 32-byte hex key:
  ```python
  import secrets
  secrets.token_hex(32)  # Copy output to .env
  ```

### 3. Setup Database

Requires PostgreSQL 16+. Using Docker Compose:

```bash
docker-compose up -d db
```

Or use local Postgres:
```bash
createdb securepoll
```

### 4. Run Migrations

```bash
alembic upgrade head
```

### 5. Seed Sample Data (Optional)

```python
python scripts/seed.py
```

### 6. Start Development Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or using Docker Compose:

```bash
docker-compose up
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
