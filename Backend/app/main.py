"""FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load AI models once at startup; save FAISS on shutdown."""
    logger.info("Starting SecurePoll RW backend...")
    try:
        import ml.inference as inference
        inference.load_models()
        logger.info("AI models loaded")
        # Warn if the FAISS index is out of sync with the stored templates — this
        # silently breaks 1:N dedup. Operator can repair via POST /ai/rebuild-index.
        try:
            from app.core.db import SessionLocal
            from app.modules.ai.service import index_consistency, rebuild_faiss_index
            with SessionLocal() as _db:
                cons = index_consistency(_db)
                if not cons["in_sync"]:
                    logger.warning(
                        f"FAISS index out of sync ({cons['index_size']} vectors vs "
                        f"{cons['template_count']} templates) — rebuilding from stored templates...")
                    res = rebuild_faiss_index(_db)
                    logger.info(f"FAISS index rebuilt: {res['templates_indexed']} templates indexed")
        except Exception as ce:
            logger.warning(f"FAISS auto-rebuild skipped ({ce}); POST /ai/rebuild-index to repair.")
    except Exception as e:
        logger.error(f"AI model load failed: {e} — continuing without AI (enroll/verify will fail)")

    yield

    logger.info("Shutting down SecurePoll RW backend")
    try:
        import ml.inference as inference
        inference.faiss_save()
    except Exception:
        pass


_DESCRIPTION = """\
## SecurePoll RW — Biometric Voter Verification System

**Thesis project** | National Electoral Commission of Rwanda (simulated) | 2024–2025

This REST API powers a full end-to-end biometric voter-verification pipeline designed
for deployment at polling stations across Rwanda.  It is the central backend for a
Final Year Project demonstrating election-grade security engineering.

---

### Core security features

| Feature | Detail |
|---------|--------|
| **Face recognition** | Pluggable ArcFace 512-d **L2-normalized** embeddings (InsightFace); `AI_BACKEND` selects `insightface` or a deterministic `synthetic` backend |
| **Liveness / anti-spoof** | Pluggable passive check (`LIVENESS_BACKEND=passive`) — a detected spoof cannot auto-approve |
| **Template encryption** | AES-256-GCM with a random 96-bit nonce per template |
| **1:N deduplication** | FAISS ID-mapped inner-product (cosine) index; stable ids, removable, rebuildable from the encrypted templates (`POST /ai/rebuild-index`) |
| **Audit log integrity** | SHA-256 hash-chain with per-entry flush + `pg_advisory_xact_lock` serialization (fork-proof) |
| **Double-vote prevention** | PostgreSQL `SELECT … FOR UPDATE` row-lock on vote cast |
| **MFA** | TOTP (RFC 6238) on admin accounts; partial JWT while pending |
| **Rate limiting** | Per-IP request throttling (`RATE_LIMIT_PER_MINUTE`) |
| **RBAC** | Role/permission model with a `require_role` authorization dependency |

Verification thresholds are calibrated on the LFW cross-session benchmark
(match `0.30` / review `0.20` / dedup `0.40`; ROC AUC ≈ 0.998) and are runtime-tunable
via `PUT /ai/thresholds`.

---

### Authentication

All endpoints except `POST /auth/login`, `POST /auth/token`, and `POST /verifications`
require a Bearer JWT in the `Authorization` header.

Use the **Authorize** button (🔒) above, or `POST /auth/token` (OAuth2 form) to obtain a token.
"""

_TAGS_METADATA = [
    {
        "name": "system",
        "description": "Health checks and server status.",
    },
    {
        "name": "geography",
        "description": (
            "Districts and polling station management — reference geography data "
            "used throughout the voter registry and verification pipeline."
        ),
    },
    {
        "name": "officers",
        "description": (
            "Field officer management.  Officers are assigned to districts and "
            "conduct biometric enrolment and election-day verification."
        ),
    },
    {
        "name": "keys",
        "description": (
            "AES-256-GCM encryption key registry.  Each key record tracks its "
            "current version for rotation auditing.  "
            "The `POST /keys/{id}:rotate` endpoint increments the version and writes "
            "a `KEY_ROTATED` audit entry.  `GET /keys/health` simulates an HSM health probe."
        ),
    },
    {
        "name": "ai",
        "description": (
            "AI/ML model health, FAISS index status, threshold tuning, and index rebuild.  "
            "`GET /ai/status` reports the active backend and FAISS size; `PUT /ai/thresholds` "
            "retunes match/review/dedup at runtime; `POST /ai/rebuild-index` reconstructs the "
            "1:N index from the encrypted templates (repairing any drift)."
        ),
    },
    {
        "name": "auth",
        "description": (
            "Authentication (JWT + TOTP 2FA), admin user management, RBAC roles, "
            "and session tracking.  "
            "Login flow: `POST /auth/login` → if `mfa_required`, `POST /auth/mfa` → full token."
        ),
    },
    {
        "name": "voters",
        "description": (
            "Voter registry: create, search, update status, bulk CSV import/export.  "
            "Voters progress through statuses: `registered → voted`; side paths `blocked`, "
            "`flagged`, `archived`."
        ),
    },
    {
        "name": "biometrics",
        "description": (
            "Face biometric enrolment using ArcFace 512-d L2-normalized embeddings with "
            "AES-256-GCM encryption at rest and a passive liveness check.  A 1:N FAISS "
            "deduplication scan runs automatically at enrolment and creates fraud cases when "
            "cosine similarity exceeds the configured dedup threshold."
        ),
    },
    {
        "name": "verification",
        "description": (
            "Election-day 1:1 face verification and double-vote-protected vote casting.  "
            "The verify endpoint is public (no JWT) — field officers call it directly.  "
            "Vote casting uses a PostgreSQL row-lock to prevent concurrent double-votes."
        ),
    },
    {
        "name": "fraud",
        "description": (
            "Fraud cases, 1:N biometric duplicate matches, and real-time anomaly signal "
            "management.  Cases are auto-created by the biometric enrolment pipeline; "
            "operators can dismiss, escalate, or merge duplicate voter records."
        ),
    },
    {
        "name": "audit",
        "description": (
            "Append-only SHA-256 hash-chained audit log.  Every write operation across "
            "the system produces an immutable audit entry.  The `POST /audit:verify-chain` "
            "endpoint walks the full chain and reports any tampered rows."
        ),
    },
    {
        "name": "analytics",
        "description": (
            "Real-time turnout statistics, demographic breakdown by sex and district, "
            "and verification performance metrics (approval rate, average confidence)."
        ),
    },
]

app = FastAPI(
    title="SecurePoll RW",
    description=_DESCRIPTION,
    version="1.1.0",
    contact={
        "name": "Geoffrey Ashimwe",
        "email": "ashimwegeoffrey@gmail.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=_TAGS_METADATA,
    lifespan=lifespan,
)

_cors_origins = settings.cors_origin_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    # Credentialed requests cannot use a wildcard origin per the CORS spec.
    allow_credentials=_cors_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global per-IP rate limiting (flood / brute-force protection). Disabled when
# RATE_LIMIT_PER_MINUTE <= 0 (tests set 0 so rapid suites aren't throttled).
if settings.rate_limit_per_minute > 0:
    try:
        from slowapi import Limiter, _rate_limit_exceeded_handler
        from slowapi.util import get_remote_address
        from slowapi.errors import RateLimitExceeded
        from slowapi.middleware import SlowAPIMiddleware

        limiter = Limiter(key_func=get_remote_address,
                          default_limits=[f"{settings.rate_limit_per_minute}/minute"])
        app.state.limiter = limiter
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
        app.add_middleware(SlowAPIMiddleware)
        logger.info(f"Rate limiting enabled: {settings.rate_limit_per_minute}/min per IP")
    except Exception as _e:
        logger.warning(f"slowapi unavailable ({_e}); rate limiting disabled")
else:
    logger.info("Rate limiting disabled (RATE_LIMIT_PER_MINUTE<=0)")


@app.get(
    "/health",
    tags=["system"],
    summary="Service health check",
    description="Returns `{\"status\": \"ok\"}` when the API is reachable.  No authentication required.",
    response_description="Service is healthy.",
)
async def health():
    return {"status": "ok", "service": "SecurePoll RW"}


# Routers — ordered by dependency (geography before voters before biometrics)
from app.modules.auth import router as auth_router
from app.modules.geography import router as geography_router
from app.modules.officers import router as officers_router
from app.modules.voters import router as voters_router
from app.modules.biometrics import router as biometrics_router
from app.modules.verification import router as verification_router
from app.modules.fraud import router as fraud_router
from app.modules.audit import router as audit_router
from app.modules.analytics import router as analytics_router
from app.modules.keys import router as keys_router
from app.modules.ai import router as ai_router

app.include_router(auth_router)
app.include_router(geography_router)
app.include_router(officers_router)
app.include_router(voters_router)
app.include_router(biometrics_router)
app.include_router(verification_router)
app.include_router(fraud_router)
app.include_router(audit_router)
app.include_router(analytics_router)
app.include_router(keys_router)
app.include_router(ai_router)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
