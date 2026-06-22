"""Unit tests for the verification decision logic (face_score + liveness -> result)."""
import pytest

pytestmark = pytest.mark.unit

from app.modules.verification import _build_decision
from app.core.enums import VerifyResult
from app.core.config import settings


def test_genuine_live_is_approved():
    result, conf, d = _build_decision(0.95, "live")
    assert result == VerifyResult.approved
    assert conf == pytest.approx(0.95)
    assert d["flags"] == []


def test_impostor_is_rejected():
    result, conf, d = _build_decision(0.10, "live")
    assert result == VerifyResult.rejected
    assert "LOW_FACE_SCORE" in d["flags"]


def test_borderline_is_manual_review():
    # between review_floor (0.20) and match (0.30)
    score = (settings.review_floor + settings.face_match_threshold) / 2
    result, _, _ = _build_decision(score, "live")
    assert result == VerifyResult.manual_review


def test_spoof_on_strong_face_is_never_approved():
    """A detected spoof must NOT auto-approve even with a perfect face match."""
    result, conf, d = _build_decision(0.99, "spoof")
    assert result != VerifyResult.approved
    assert result == VerifyResult.manual_review
    assert "LIVENESS_FAILED" in d["flags"]
    assert conf == pytest.approx(0.79)  # 0.99 - 0.20 penalty


def test_spoof_on_weak_face_is_rejected():
    result, _, d = _build_decision(0.15, "spoof")
    assert result == VerifyResult.rejected
    assert "LIVENESS_FAILED" in d["flags"]
