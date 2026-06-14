"""ML/AI inference module - loads models at startup."""
import numpy as np
import faiss
import logging
from pathlib import Path
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

# Global model instances (loaded at startup)
_face_model = None
_liveness_model = None
_faiss_index = None


def load_models():
    """
    Load AI models at FastAPI startup.
    
    - Face embedding model (InsightFace ArcFace buffalo_l): 512-d embeddings
    - Liveness detection model (passive anti-spoof)
    - FAISS index (IndexFlatIP for 1:N dedup)
    
    Runs once in lifespan event; not per-request.
    """
    global _face_model, _liveness_model, _faiss_index
    
    try:
        logger.info("Loading InsightFace ArcFace model...")
        from insightface.app import FaceAnalysis
        _face_model = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        _face_model.prepare(ctx_id=-1)  # CPU mode
        logger.info("InsightFace model loaded")
    except Exception as e:
        logger.error(f"Failed to load face model: {e}")
        raise
    
    try:
        logger.info("Loading liveness detection model...")
        # Using a simple stub for now; can replace with actual model
        # e.g., Silent-Face or MiniFASNet from scipy-face or deepface
        _liveness_model = None  # Stub: will implement with real model
        logger.info("Liveness model initialized (stub)")
    except Exception as e:
        logger.warning(f"Could not load liveness model: {e}; using stub")
    
    try:
        logger.info("Initializing FAISS index...")
        # Create or load persisted FAISS index
        index_path = Path("ml/faiss/index.bin")
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
    Embed a face image to a 512-d L2-normalized vector.
    
    Uses InsightFace ArcFace model. Detects the largest face in the image,
    extracts the embedding, and returns L2-normalized vector (for cosine similarity).
    
    Returns: (512,) float32 array
    Raises: ValueError if no face detected
    """
    if _face_model is None:
        raise RuntimeError("Face model not loaded")
    
    # Convert bytes to PIL Image or numpy array
    from PIL import Image
    import io
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img_array = np.array(img)
    except Exception as e:
        raise ValueError(f"Could not decode image: {e}")
    
    # Detect faces
    faces = _face_model.get(img_array)
    
    if not faces:
        raise ValueError("No face detected in image")
    
    # Get the largest face (by area)
    largest_face = max(faces, key=lambda f: f.bbox[2] * f.bbox[3])
    
    # Extract embedding (already L2-normalized by InsightFace)
    embedding = largest_face.embedding
    
    return embedding


def check_liveness(image_bytes: bytes) -> Tuple[str, float]:
    """
    Check if the face in the image is live (passive anti-spoof).
    
    Returns: ("live"|"spoof"|"failed", confidence)
    
    For now, returns a stub; will integrate real anti-spoof model.
    """
    # Stub implementation: assume live for now
    # In production, use Silent-Face, MiniFASNet, or deepface anti-spoof
    return ("live", 0.95)


def faiss_search(embedding: np.ndarray, k: int = 5) -> Tuple[np.ndarray, np.ndarray]:
    """
    Search FAISS index for nearest neighbors (1:N dedup).
    
    Args:
        embedding: (512,) normalized embedding
        k: number of nearest neighbors to return
    
    Returns: (distances, indices)
        distances: (k,) array of cosine distances [0, 2]
        indices: (k,) array of FAISS row IDs
    """
    if _faiss_index is None:
        raise RuntimeError("FAISS index not initialized")
    
    # FAISS IndexFlatIP expects 2D input: (1, 512)
    query = embedding.reshape(1, -1).astype(np.float32)
    distances, indices = _faiss_index.search(query, k)
    
    return distances[0], indices[0]


def faiss_add(embedding: np.ndarray) -> int:
    """
    Add a new embedding to the FAISS index.
    
    Returns: the FAISS row ID (auto-incremented)
    """
    if _faiss_index is None:
        raise RuntimeError("FAISS index not initialized")
    
    # Add as (1, 512) array
    embedding_2d = embedding.reshape(1, -1).astype(np.float32)
    faiss_id = _faiss_index.ntotal
    _faiss_index.add(embedding_2d)
    
    return faiss_id


def faiss_save():
    """Persist the FAISS index to disk."""
    if _faiss_index is None:
        return
    
    index_path = Path("ml/faiss/index.bin")
    index_path.parent.mkdir(parents=True, exist_ok=True)
    faiss.write_index(_faiss_index, str(index_path))
    logger.info(f"FAISS index saved to {index_path}")
