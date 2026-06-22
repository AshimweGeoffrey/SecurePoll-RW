"""Unit tests: create-schemas validate enum fields (bad input -> 422, not 500)."""
import pytest
from pydantic import ValidationError

pytestmark = pytest.mark.unit

from app.schemas import FraudCaseCreate, AnomalyCreate
from app.core.enums import FraudType, RiskLevel, AnomalySeverity


def test_fraud_case_accepts_valid_enums():
    m = FraudCaseCreate(type="Duplicate", title="t", risk_level="critical")
    assert m.type == FraudType.duplicate
    assert m.risk_level == RiskLevel.critical


def test_fraud_case_rejects_bad_type():
    with pytest.raises(ValidationError):
        FraudCaseCreate(type="not-a-type", title="t", risk_level="critical")


def test_fraud_case_rejects_bad_risk_level():
    with pytest.raises(ValidationError):
        FraudCaseCreate(type="Duplicate", title="t", risk_level="meh")


def test_anomaly_accepts_valid_severity():
    m = AnomalyCreate(severity="critical", title="t")
    assert m.severity == AnomalySeverity.critical


def test_anomaly_rejects_bad_severity():
    with pytest.raises(ValidationError):
        AnomalyCreate(severity="low", title="t")  # "low" is not a valid severity
