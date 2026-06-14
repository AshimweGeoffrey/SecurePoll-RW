"""FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import logging
import ml.inference as inference
from app.modules.auth import router as auth_router
from app.modules.voters import router as voters_router
from app.modules.biometrics import router as biometrics_router
from app.modules.verification import router as verification_router
from app.modules.fraud import router as fraud_router
from app.modules.audit import router as audit_router
from app.modules.analytics import router as analytics_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown."""
    # Startup
    logger.info("Starting SecurePoll backend...")
    try:
        inference.load_models()
        logger.info("AI models loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load AI models: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down SecurePoll backend")
    try:
        inference.faiss_save()
        logger.info("FAISS index saved")
    except Exception as e:
        logger.warning(f"Error saving FAISS: {e}")


app = FastAPI(
    title="SecurePoll RW Backend",
    description="Biometric voter verification system",
    version="0.1.0",
    lifespan=lifespan,
)


# Health check
@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


# Include routers
app.include_router(auth_router)
app.include_router(voters_router)
app.include_router(biometrics_router)
app.include_router(verification_router)
app.include_router(fraud_router)
app.include_router(audit_router)
app.include_router(analytics_router)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
