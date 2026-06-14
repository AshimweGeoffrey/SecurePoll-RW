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


app = FastAPI(
    title="SecurePoll RW",
    description=(
        "Biometric voter verification system for Rwanda. "
        "Core: ArcFace 1:1 face match, FAISS 1:N dedup, hash-chained audit log, row-locked vote cast."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
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
