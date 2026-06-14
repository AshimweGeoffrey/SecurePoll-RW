"""FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

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
| **Face recognition** | ArcFace 512-d cosine-similarity embeddings (InsightFace) |
| **Template encryption** | AES-256-GCM with a random 96-bit nonce per template |
| **1:N deduplication** | FAISS flat-L2 index searched at enrolment time |
| **Audit log integrity** | SHA-256 hash-chain — every entry hashes the previous entry's hash |
| **Double-vote prevention** | PostgreSQL `SELECT … FOR UPDATE` row-lock on vote cast |
| **MFA** | TOTP (RFC 6238) on admin accounts; partial JWT while pending |
| **RBAC** | Role table with fine-grained permission strings; district-scope filtering |

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
            "Face biometric enrolment using ArcFace 512-d embeddings with AES-256-GCM "
            "encryption at rest.  A 1:N FAISS deduplication scan runs automatically at "
            "enrolment and creates fraud cases when similarity exceeds the configured threshold."
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
    version="1.0.0",
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/health",
    tags=["system"],
    summary="Service health check",
    description="Returns `{\"status\": \"ok\"}` when the API is reachable.  No authentication required.",
    response_description="Service is healthy.",
)
async def health():
    return {"status": "ok", "service": "SecurePoll RW"}


# Routers
from app.modules.auth import router as auth_router
from app.modules.voters import router as voters_router
from app.modules.biometrics import router as biometrics_router
from app.modules.verification import router as verification_router
from app.modules.fraud import router as fraud_router
from app.modules.audit import router as audit_router
from app.modules.analytics import router as analytics_router

app.include_router(auth_router)
app.include_router(voters_router)
app.include_router(biometrics_router)
app.include_router(verification_router)
app.include_router(fraud_router)
app.include_router(audit_router)
app.include_router(analytics_router)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
