"""
Pluggable liveness / anti-spoof providers, selected by ``settings.liveness_backend``.

    LIVENESS_BACKEND=passive   image-quality passive check (default)
    LIVENESS_BACKEND=none      always returns live (disables anti-spoof)

`passive` is a deterministic, model-free capture-quality gate: it rejects blank /
uniform / severely-blurred / undecodable frames (common in trivially-faked or
broken captures) and reports a confidence in [0,1]. It is NOT a trained CNN
anti-spoof — a production deployment should plug a MiniFASNet / Silent-Face ONNX
model in here (the interface and the decision wiring are already in place).
"""
import io
import logging
from abc import ABC, abstractmethod
from typing import Tuple

import numpy as np

logger = logging.getLogger(__name__)


class LivenessProvider(ABC):
    name = "base"

    @abstractmethod
    def load(self) -> None: ...

    @abstractmethod
    def check(self, image_bytes: bytes) -> Tuple[str, float]:
        """Return ("live" | "spoof" | "failed", confidence in [0,1])."""


class NoneLiveness(LivenessProvider):
    name = "none"

    def load(self) -> None:
        logger.info("Liveness: disabled (always reports live)")

    def check(self, image_bytes: bytes) -> Tuple[str, float]:
        return ("live", 1.0)


class PassiveLiveness(LivenessProvider):
    """Model-free passive check based on capture sharpness and contrast."""
    name = "passive"

    # Tuned so genuine camera/photo captures pass and blank/blurred frames fail.
    MIN_CONTRAST = 12.0      # std-dev of luma; near-uniform frames fall below
    MIN_SHARPNESS = 20.0     # variance of Laplacian; severe blur falls below

    def load(self) -> None:
        logger.info("Liveness: passive image-quality anti-spoof active")

    def check(self, image_bytes: bytes) -> Tuple[str, float]:
        try:
            from PIL import Image
            gray = np.asarray(Image.open(io.BytesIO(image_bytes)).convert("L"), dtype=np.float32)
        except Exception:
            return ("failed", 0.0)
        if gray.size < 16:
            return ("failed", 0.0)

        contrast = float(gray.std())
        # variance of the Laplacian (focus measure) — compute without cv2 dependency
        lap = (gray[:-2, 1:-1] + gray[2:, 1:-1] + gray[1:-1, :-2] + gray[1:-1, 2:]
               - 4.0 * gray[1:-1, 1:-1])
        sharpness = float(lap.var()) if lap.size else 0.0

        sharp_score = min(1.0, sharpness / 150.0)
        contrast_score = min(1.0, contrast / 50.0)
        score = round(0.5 * sharp_score + 0.5 * contrast_score, 4)

        if contrast < self.MIN_CONTRAST or sharpness < self.MIN_SHARPNESS:
            return ("spoof", score)
        return ("live", max(score, 0.5))


def get_liveness_provider(name: str) -> LivenessProvider:
    key = (name or "passive").strip().lower()
    if key == "none":
        return NoneLiveness()
    if key == "passive":
        return PassiveLiveness()
    raise ValueError(f"Unknown LIVENESS_BACKEND '{name}' (expected 'passive' or 'none')")
