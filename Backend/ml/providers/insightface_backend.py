"""
InsightFace inference backend — real ArcFace buffalo_l 512-d embeddings.

Liveness is currently a pass-through stub; swap in a passive anti-spoof model
(Silent-Face / MiniFASNet ONNX) at ``check_liveness`` to close the spoof gap.
"""
import io
import logging
from typing import Tuple

import numpy as np

from ml.providers.base import InferenceBackend

logger = logging.getLogger(__name__)


class InsightFaceBackend(InferenceBackend):
    name = "insightface"

    def __init__(self) -> None:
        self._face_model = None

    def load(self) -> None:
        logger.info("Loading InsightFace ArcFace model (buffalo_l, CPU)...")
        from insightface.app import FaceAnalysis
        self._face_model = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
        self._face_model.prepare(ctx_id=-1)  # CPU mode
        logger.info("InsightFace model loaded")

    def embed_face(self, image_bytes: bytes) -> np.ndarray:
        if self._face_model is None:
            raise RuntimeError("Face model not loaded")

        from PIL import Image
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img_array = np.array(img)
        except Exception as e:
            raise ValueError(f"Could not decode image: {e}")

        faces = self._face_model.get(img_array)
        if not faces:
            raise ValueError("No face detected in image")

        largest = max(faces, key=lambda f: f.bbox[2] * f.bbox[3])
        # InsightFace exposes BOTH a raw .embedding and an L2-normalized
        # .normed_embedding. FAISS IndexFlatIP computes inner product, which only
        # equals cosine similarity for unit vectors — so we MUST return the
        # normalized one, or every threshold comparison is meaningless.
        emb = getattr(largest, "normed_embedding", None)
        if emb is None:
            emb = largest.embedding
            norm = np.linalg.norm(emb)
            if norm > 0:
                emb = emb / norm
        return np.asarray(emb, dtype=np.float32)
