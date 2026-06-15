"""
Synthetic inference backend — deterministic, no model download.

Produces a stable 512-d embedding derived from the SHA-256 of the image bytes,
so it behaves like a real embedder for pipeline purposes:

    * the same image always yields the same vector  → 1:1 verification and 1:N
      dedup collisions can be exercised end-to-end;
    * different images yield near-orthogonal vectors → distinct voters do not
      collide.

It validates that the bytes are a decodable image (so garbage input returns a
400, matching the real backend), but does NOT perform face detection or real
liveness — liveness always passes.  Use the ``insightface`` backend for any
security-meaningful evaluation.
"""
import hashlib
import io
import logging
from typing import Tuple

import numpy as np

from ml.providers.base import InferenceBackend

logger = logging.getLogger(__name__)

_DIM = 512


class SyntheticBackend(InferenceBackend):
    name = "synthetic"

    def load(self) -> None:
        logger.info("Synthetic inference backend active (no model loaded, deterministic embeddings)")

    def embed_face(self, image_bytes: bytes) -> np.ndarray:
        # Faithfully reject undecodable input the same way the real backend does.
        try:
            from PIL import Image
            Image.open(io.BytesIO(image_bytes)).verify()
        except Exception as e:
            raise ValueError(f"Could not decode image: {e}")

        seed = int.from_bytes(hashlib.sha256(image_bytes).digest()[:8], "big")
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(_DIM).astype(np.float32)
        norm = np.linalg.norm(vec)
        if norm == 0:
            raise ValueError("Degenerate embedding")
        return vec / norm

    def check_liveness(self, image_bytes: bytes) -> Tuple[str, float]:
        # Synthetic backend assumes a live capture; it does no anti-spoof.
        return ("live", 0.99)
