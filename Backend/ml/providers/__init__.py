"""
Pluggable inference backends.

The face-embedding and liveness steps are abstracted behind ``InferenceBackend``
so the API can run against the real ArcFace model OR a deterministic synthetic
backend that needs no model download.  The backend is selected at startup by
``settings.ai_backend`` (env: ``AI_BACKEND``).

    AI_BACKEND=insightface   real ArcFace 512-d embeddings + (optional) liveness
    AI_BACKEND=synthetic     deterministic 512-d embeddings, assumes liveness

FAISS indexing is backend-agnostic and lives in ``ml.inference``.
"""
from ml.providers.base import InferenceBackend
from ml.providers.synthetic import SyntheticBackend

EMBEDDING_DIM = 512


def get_backend(name: str) -> InferenceBackend:
    """Return an InferenceBackend instance for the given name."""
    key = (name or "insightface").strip().lower()
    if key == "synthetic":
        return SyntheticBackend()
    if key == "insightface":
        # Imported lazily so the synthetic path never imports insightface/onnxruntime.
        from ml.providers.insightface_backend import InsightFaceBackend
        return InsightFaceBackend()
    raise ValueError(f"Unknown AI_BACKEND '{name}' (expected 'insightface' or 'synthetic')")
