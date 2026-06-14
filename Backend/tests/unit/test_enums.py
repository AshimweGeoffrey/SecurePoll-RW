"""Unit tests for application enums.

Enums have no external dependencies — these tests verify that values are stable
and that the enum members needed by API responses are all present.  If a value
is renamed or removed, these tests catch it before any integration test runs.
"""
import pytest

pytestmark = pytest.mark.unit


# ---------------------------------------------------------------------------
# VoterStatus
# ---------------------------------------------------------------------------

def test_voter_status_all_values():
    from app.core.enums import VoterStatus
    expected = {"registered", "voted", "flagged", "blocked", "archived"}
    actual = {m.value for m in VoterStatus}
    assert expected == actual


def test_voter_status_is_str_subclass():
    from app.core.enums import VoterStatus
    assert isinstance(VoterStatus.registered, str)
    assert VoterStatus.voted == "voted"


# ---------------------------------------------------------------------------
# VerifyResult
# ---------------------------------------------------------------------------

def test_verify_result_values():
    from app.core.enums import VerifyResult
    assert VerifyResult.approved.value == "approved"
    assert VerifyResult.rejected.value == "rejected"
    assert VerifyResult.manual_review.value == "manual_review"


def test_verify_result_has_three_members():
    from app.core.enums import VerifyResult
    assert len(list(VerifyResult)) == 3


# ---------------------------------------------------------------------------
# AuditAction
# ---------------------------------------------------------------------------

def test_audit_action_login_exists():
    from app.core.enums import AuditAction
    assert AuditAction.LOGIN.value == "LOGIN"


def test_audit_action_voter_verified_exists():
    from app.core.enums import AuditAction
    assert AuditAction.VOTER_VERIFIED.value == "VOTER_VERIFIED"


def test_audit_action_voter_voted_exists():
    from app.core.enums import AuditAction
    assert AuditAction.VOTER_VOTED.value == "VOTER_VOTED"


def test_audit_action_record_merged_exists():
    from app.core.enums import AuditAction
    assert AuditAction.RECORD_MERGED.value == "RECORD_MERGED"


# ---------------------------------------------------------------------------
# ActorType
# ---------------------------------------------------------------------------

def test_actor_type_values():
    from app.core.enums import ActorType
    expected = {"user", "officer", "system", "service"}
    actual = {m.value for m in ActorType}
    assert expected == actual


# ---------------------------------------------------------------------------
# Sex
# ---------------------------------------------------------------------------

def test_sex_values():
    from app.core.enums import Sex
    assert Sex.male.value == "male"
    assert Sex.female.value == "female"
    assert len(list(Sex)) == 2


# ---------------------------------------------------------------------------
# Liveness
# ---------------------------------------------------------------------------

def test_liveness_values():
    from app.core.enums import Liveness
    assert Liveness.live.value == "live"
    assert Liveness.spoof.value == "spoof"
    assert Liveness.failed.value == "failed"


# ---------------------------------------------------------------------------
# UserStatus
# ---------------------------------------------------------------------------

def test_user_status_values():
    from app.core.enums import UserStatus
    assert UserStatus.active.value == "active"
    assert UserStatus.suspended.value == "suspended"
    assert UserStatus.invitation_pending.value == "invitation_pending"


# ---------------------------------------------------------------------------
# Province
# ---------------------------------------------------------------------------

def test_province_kigali():
    from app.core.enums import Province
    assert Province.kigali.value == "Kigali City"


def test_province_has_five_members():
    from app.core.enums import Province
    assert len(list(Province)) == 5


# ---------------------------------------------------------------------------
# FraudType
# ---------------------------------------------------------------------------

def test_fraud_type_values():
    from app.core.enums import FraudType
    expected = {"Impersonation", "Duplicate", "Forgery", "Anomaly"}
    actual = {m.value for m in FraudType}
    assert expected == actual


# ---------------------------------------------------------------------------
# DuplicateStatus
# ---------------------------------------------------------------------------

def test_duplicate_status_values():
    from app.core.enums import DuplicateStatus
    assert DuplicateStatus.pending.value == "pending"
    assert DuplicateStatus.merged.value == "merged"
    assert DuplicateStatus.dismissed.value == "dismissed"


# ---------------------------------------------------------------------------
# CaseResolution
# ---------------------------------------------------------------------------

def test_case_resolution_values():
    from app.core.enums import CaseResolution
    expected = {"dismissed", "escalated", "merged", "blocked"}
    actual = {m.value for m in CaseResolution}
    assert expected == actual


# ---------------------------------------------------------------------------
# AnomalySeverity
# ---------------------------------------------------------------------------

def test_anomaly_severity_values():
    from app.core.enums import AnomalySeverity
    assert AnomalySeverity.critical.value == "critical"
    assert AnomalySeverity.warning.value == "warning"
    assert AnomalySeverity.info.value == "info"
