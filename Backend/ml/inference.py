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
_liveness = None
_face_model = None      # retained for backward-compat / test patch target
_liveness_model = None  # retained for backward-compat / test patch target
_faiss_index = None
_next_faiss_id = 0      # monotonic id allocator for the IDMap index


def new_index() -> "faiss.Index":
    """A fresh ID-mapped flat inner-product index (stable, removable ids)."""
    return faiss.IndexIDMap2(faiss.IndexFlatIP(512))


def _max_id(index) -> int:
    try:
        ids = faiss.vector_to_array(index.id_map)
        return int(ids.max()) if ids.size else -1
    except Exception:
        return -1


def load_models():
    """
    Load the configured inference backend, liveness provider, and FAISS index.

    Backends are selected by ``settings.ai_backend`` and ``settings.liveness_backend``.
    Runs once in the FastAPI lifespan event; not per-request.
    """
    global _backend, _liveness, _faiss_index, _next_faiss_id

    from ml.providers import get_backend, get_liveness_provider
    _backend = get_backend(settings.ai_backend)
    logger.info(f"Inference backend: {_backend.name}")
    _backend.load()

    _liveness = get_liveness_provider(settings.liveness_backend)
    _liveness.load()

    try:
        logger.info("Initializing FAISS index...")
        index_path = Path(settings.faiss_index_path)
        if index_path.exists():
            logger.info(f"Loading FAISS index from {index_path}")
            idx = faiss.read_index(str(index_path))
            if isinstance(idx, faiss.IndexIDMap2):
                _faiss_index = idx
            else:
                # Legacy positional index — start fresh; POST /ai/rebuild-index (or the
                # startup consistency check) repopulates it with stable ids.
                logger.warning("Legacy FAISS index (no id-map); starting empty — rebuild required.")
                _faiss_index = new_index()
        else:
            index_path.parent.mkdir(parents=True, exist_ok=True)
            _faiss_index = new_index()
        _next_faiss_id = _max_id(_faiss_index) + 1
        logger.info(f"FAISS index ready with {_faiss_index.ntotal} vectors (next id {_next_faiss_id})")
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
    """Passive liveness/anti-spoof via the configured provider. (status, confidence)."""
    if _liveness is None:
        return ("live", 1.0)
    return _liveness.check(image_bytes)


def faiss_search(embedding: np.ndarray, k: int = 5) -> Tuple[np.ndarray, np.ndarray]:
    """
    Search the FAISS index for nearest neighbors (1:N dedup).

    Returns: (distances, ids) — `ids` are the stable faiss_ids stored on templates.
    """
    if _faiss_index is None:
        raise RuntimeError("FAISS index not initialized")
    query = embedding.reshape(1, -1).astype(np.float32)
    distances, ids = _faiss_index.search(query, k)
    return distances[0], ids[0]


def faiss_add(embedding: np.ndarray, faiss_id: int = None) -> int:
    """Add an embedding under a stable id (auto-allocated if not given). Returns the id."""
    global _next_faiss_id
    if _faiss_index is None:
        raise RuntimeError("FAISS index not initialized")
    if faiss_id is None:
        faiss_id = _next_faiss_id
    _next_faiss_id = max(_next_faiss_id, int(faiss_id) + 1)
    emb2 = embedding.reshape(1, -1).astype(np.float32)
    _faiss_index.add_with_ids(emb2, np.array([int(faiss_id)], dtype=np.int64))
    return int(faiss_id)


def faiss_remove(faiss_id: int) -> int:
    """Remove a vector by its stable id. Returns the number of vectors removed."""
    if _faiss_index is None or faiss_id is None:
        return 0
    try:
        return int(_faiss_index.remove_ids(np.array([int(faiss_id)], dtype=np.int64)))
    except Exception as e:
        logger.warning(f"faiss_remove({faiss_id}) failed: {e}")
        return 0


def faiss_save():
    """Persist the FAISS index to disk."""
    if _faiss_index is None:
        return
    index_path = Path(settings.faiss_index_path)
    index_path.parent.mkdir(parents=True, exist_ok=True)
    faiss.write_index(_faiss_index, str(index_path))
    logger.info(f"FAISS index saved to {index_path}")
