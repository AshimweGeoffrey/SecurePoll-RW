"""
ML/AI inference facade.

Embedding and liveness are delegated to a pluggable backend (see ``ml.providers``)
chosen at startup by ``settings.ai_backend``.  FAISS 1:N indexing is backend-agnostic
and implemented here.  The module-level function names (``embed_face``,
``check_liveness``, ``faiss_*``) are the stable public surface used across the app
and patched by the test-suite, so they are preserved regardless of backend.
"""
import logging
from pathlib import Path
from typing import Optional, Tuple

import numpy as np
import faiss

from app.core.config import settings

logger = logging.getLogger(__name__)

# Globals (also patched by the test-suite — keep these names).
_backend = None
_face_model = None      # retained for backward-compat / test patch target
_liveness_model = None  # retained for backward-compat / test patch target
_faiss_index = None


def load_models():
    """
    Load the configured inference backend and the FAISS index at startup.

    Backend is selected by ``settings.ai_backend`` ("insightface" | "synthetic").
    Runs once in the FastAPI lifespan event; not per-request.
    """
    global _backend, _faiss_index

    from ml.providers import get_backend
    _backend = get_backend(settings.ai_backend)
    logger.info(f"Inference backend: {_backend.name}")
    _backend.load()

    try:
        logger.info("Initializing FAISS index...")
        index_path = Path(settings.faiss_index_path)
        if index_path.exists():
            logger.info(f"Loading FAISS index from {index_path}")
            _faiss_index = faiss.read_index(str(index_path))
        else:
            logger.info("Creating new FAISS IndexFlatIP (512-d)")
            index_path.parent.mkdir(parents=True, exist_ok=True)
            _faiss_index = faiss.IndexFlatIP(512)
        logger.info(f"FAISS index ready with {_faiss_index.ntotal} vectors")
    except Exception as e:
        logger.error(f"Failed to init FAISS: {e}")
        raise


def embed_face(image_bytes: bytes) -> np.ndarray:
    """
    Embed a face image to a 512-d L2-normalized vector via the active backend.

    Returns: (512,) float32 array
    Raises: ValueError if the image cannot be decoded or no face is detected.
    """
    if _backend is None:
        raise RuntimeError("Inference backend not loaded")
    return _backend.embed_face(image_bytes)


def check_liveness(image_bytes: bytes) -> Tuple[str, float]:
    """Check passive liveness via the active backend. Returns (status, confidence)."""
    if _backend is None:
        raise RuntimeError("Inference backend not loaded")
    return _backend.check_liveness(image_bytes)


def faiss_search(embedding: np.ndarray, k: int = 5) -> Tuple[np.ndarray, np.ndarray]:
    """
    Search the FAISS index for nearest neighbors (1:N dedup).

    Returns: (distances, indices) — each a (k,) array.
    """
    if _faiss_index is None:
        raise RuntimeError("FAISS index not initialized")
    query = embedding.reshape(1, -1).astype(np.float32)
    distances, indices = _faiss_index.search(query, k)
    return distances[0], indices[0]


def faiss_add(embedding: np.ndarray) -> int:
    """Add a new embedding to the FAISS index. Returns its row ID."""
    if _faiss_index is None:
        raise RuntimeError("FAISS index not initialized")
    embedding_2d = embedding.reshape(1, -1).astype(np.float32)
    faiss_id = _faiss_index.ntotal
    _faiss_index.add(embedding_2d)
    return faiss_id


def faiss_save():
    """Persist the FAISS index to disk."""
    if _faiss_index is None:
        return
    index_path = Path(settings.faiss_index_path)
    index_path.parent.mkdir(parents=True, exist_ok=True)
    faiss.write_index(_faiss_index, str(index_path))
    logger.info(f"FAISS index saved to {index_path}")
