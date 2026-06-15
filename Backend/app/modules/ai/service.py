"""AI/ML service."""
import ml.inference as inference
from app.core.config import settings


def get_model_status() -> dict:
    """Return model health status dict."""
    try:
        model_loaded = inference._face_model is not None
    except AttributeError:
        model_loaded = False

    try:
        faiss_index_size = inference._faiss_index.ntotal if inference._faiss_index else 0
    except AttributeError:
        faiss_index_size = 0

    return {
        "model_loaded": model_loaded,
        "faiss_index_size": faiss_index_size,
        "face_match_threshold": settings.face_match_threshold,
        "review_floor": settings.review_floor,
        "dedup_threshold": settings.dedup_threshold,
        "faiss_index_path": settings.faiss_index_path,
    }


def get_thresholds() -> dict:
    """Return current threshold configuration from settings."""
    return {
        "face_match_threshold": settings.face_match_threshold,
        "review_floor": settings.review_floor,
        "dedup_threshold": settings.dedup_threshold,
    }
