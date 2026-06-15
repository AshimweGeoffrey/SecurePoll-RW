"""Inference backend interface."""
from abc import ABC, abstractmethod
from typing import Tuple
import numpy as np


class InferenceBackend(ABC):
    """
    A face-inference backend supplies the two model-dependent steps of the
    biometric pipeline: embedding and liveness.  FAISS indexing is handled
    separately and is backend-agnostic.
    """

    name: str = "base"

    @abstractmethod
    def load(self) -> None:
        """Load any models/weights. Called once at startup. May raise on failure."""

    @abstractmethod
    def embed_face(self, image_bytes: bytes) -> np.ndarray:
        """
        Return a (512,) float32 L2-normalized embedding for the largest face.

        Raises:
            ValueError: if the image cannot be decoded or no face is detected.
        """

    @abstractmethod
    def check_liveness(self, image_bytes: bytes) -> Tuple[str, float]:
        """Return ("live" | "spoof" | "failed", confidence in [0, 1])."""
