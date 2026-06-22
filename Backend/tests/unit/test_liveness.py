"""Unit tests for the passive liveness / anti-spoof provider."""
import io
import pytest
import numpy as np
from PIL import Image

pytestmark = pytest.mark.unit

from ml.providers.liveness import PassiveLiveness, NoneLiveness, get_liveness_provider


def _jpeg(arr):
    buf = io.BytesIO()
    Image.fromarray(arr.astype("uint8"), "RGB").save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def test_provider_factory():
    assert isinstance(get_liveness_provider("passive"), PassiveLiveness)
    assert isinstance(get_liveness_provider("none"), NoneLiveness)
    with pytest.raises(ValueError):
        get_liveness_provider("bogus")


def test_none_always_live():
    assert NoneLiveness().check(b"anything") == ("live", 1.0)


def test_passive_rejects_undecodable():
    status, conf = PassiveLiveness().check(b"not-an-image")
    assert status == "failed"
    assert conf == 0.0


def test_passive_rejects_blank_uniform():
    blank = np.full((64, 64, 3), 20, dtype="uint8")  # near-uniform
    status, _ = PassiveLiveness().check(_jpeg(blank))
    assert status == "spoof"


def test_passive_accepts_textured_image():
    rng = np.random.default_rng(7)
    noisy = (rng.random((128, 128, 3)) * 255)  # high texture/contrast -> live
    status, conf = PassiveLiveness().check(_jpeg(noisy))
    assert status == "live"
    assert conf >= 0.5
