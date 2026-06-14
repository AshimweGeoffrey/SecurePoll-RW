"""Shared enums across the application."""
import enum


class VoterStatus(str, enum.Enum):
    registered = "registered"
    voted = "voted"
    flagged = "flagged"
    blocked = "blocked"
    archived = "archived"


class Sex(str, enum.Enum):
    male = "male"
    female = "female"


class Modality(str, enum.Enum):
    face = "face"
    fingerprint = "fingerprint"


class VerifyResult(str, enum.Enum):
    approved = "approved"
    manual_review = "manual_review"
    rejected = "rejected"


class Liveness(str, enum.Enum):
    live = "live"
    spoof = "spoof"
    failed = "failed"


class StationStatus(str, enum.Enum):
    online = "online"
    syncing = "syncing"
    not_open = "not_open"
    offline = "offline"


class FraudType(str, enum.Enum):
    impersonation = "Impersonation"
    duplicate = "Duplicate"
    forgery = "Forgery"
    anomaly = "Anomaly"


class RiskLevel(str, enum.Enum):
    critical = "critical"
    review = "review"


class CaseResolution(str, enum.Enum):
    dismissed = "dismissed"
    escalated = "escalated"
    merged = "merged"
    blocked = "blocked"


class DuplicateStatus(str, enum.Enum):
    pending = "pending"
    merged = "merged"
    dismissed = "dismissed"


class AuditAction(str, enum.Enum):
    VOTER_VERIFIED = "VOTER_VERIFIED"
    VOTER_VOTED = "VOTER_VOTED"
    TEMPLATE_ACCESSED = "TEMPLATE_ACCESSED"
    PERMISSION_CHANGED = "PERMISSION_CHANGED"
    LOGIN = "LOGIN"
    DATA_EXPORTED = "DATA_EXPORTED"
    RECORD_BLOCKED = "RECORD_BLOCKED"
    RECORD_CREATED = "RECORD_CREATED"
    BIOMETRIC_LINKED = "BIOMETRIC_LINKED"
    ADDRESS_UPDATED = "ADDRESS_UPDATED"
    STATUS_SYNCED = "STATUS_SYNCED"
    RECORD_MERGED = "RECORD_MERGED"
    RECORD_ARCHIVED = "RECORD_ARCHIVED"
    KEY_ROTATED = "KEY_ROTATED"
    HSM_HEALTHCHECK = "HSM_HEALTHCHECK"


class ActorType(str, enum.Enum):
    user = "user"
    officer = "officer"
    system = "system"
    service = "service"


class AnomalySeverity(str, enum.Enum):
    critical = "critical"
    warning = "warning"
    info = "info"


class UserStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    invitation_pending = "invitation_pending"


class Province(str, enum.Enum):
    kigali = "Kigali City"
    northern = "Northern"
    southern = "Southern"
    eastern = "Eastern"
    western = "Western"
