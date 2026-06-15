"""AI/ML service."""
from typing import Optional
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


def update_thresholds(
    face_match_threshold: Optional[float] = None,
    review_floor: Optional[float] = None,
    dedup_threshold: Optional[float] = None,
) -> dict:
    """Update threshold values at runtime (in-process override via settings mutation).

    Changes take effect immediately but are not persisted — they reset on restart.
    To persist, update environment variables or the .env file.
    """
    if face_match_threshold is not None:
        settings.face_match_threshold = face_match_threshold
    if review_floor is not None:
        settings.review_floor = review_floor
    if dedup_threshold is not None:
        settings.dedup_threshold = dedup_threshold
    return get_thresholds()
