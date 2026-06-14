"""Pydantic schemas for all models."""
from __future__ import annotations
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime, date
from uuid import UUID
from app.core.enums import (VoterStatus, Sex, Modality, VerifyResult, Liveness,
                            StationStatus, FraudType, RiskLevel, CaseResolution,
                            DuplicateStatus, AuditAction, ActorType, UserStatus, Province)
from typing import Optional, Any


# ============================================================================
# Geography Schemas
# ============================================================================

class DistrictBase(BaseModel):
    code: str
    name: str
    province: Province
    boundary_ref: Optional[str] = None


class DistrictCreate(DistrictBase):
    pass


class DistrictResponse(DistrictBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PollingStationBase(BaseModel):
    code: str
    name: str
    district_id: UUID
    lat: Optional[float] = None
    lon: Optional[float] = None
    opens_at: Optional[str] = None
    closes_at: Optional[str] = None
    status: StationStatus = StationStatus.not_open


class PollingStationCreate(PollingStationBase):
    pass


class PollingStationResponse(PollingStationBase):
    id: UUID
    registered_count: int
    verified_today: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Auth Schemas
# ============================================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MFARequest(BaseModel):
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    mfa_required: bool = False


# ============================================================================
# Admin User Schemas
# ============================================================================

class RoleBase(BaseModel):
    id: str
    name: str
    permissions: list[str] = []


class RoleResponse(RoleBase):
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AdminUserBase(BaseModel):
    full_name: str
    email: EmailStr
    role_id: str
    district_scope: str = "National"


class AdminUserCreate(AdminUserBase):
    password: str


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    district_scope: Optional[str] = None


class AdminUserResponse(AdminUserBase):
    id: UUID
    status: UserStatus
    mfa_enabled: bool
    last_active_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Voter Schemas
# ============================================================================

class VoterBase(BaseModel):
    voter_token: str
    registration_ref: str
    national_id: str
    first_name: str
    last_name: str
    sex: Sex
    date_of_birth: date
    phone: Optional[str] = None
    district_id: UUID
    polling_station_id: UUID
    roll_position: Optional[int] = None


class VoterCreate(VoterBase):
    pass


class VoterUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    roll_position: Optional[int] = None


class VoterResponse(VoterBase):
    id: UUID
    status: VoterStatus
    enrolled_at: Optional[datetime]
    enrolled_by_officer_id: Optional[UUID]
    enroll_lat: Optional[float]
    enroll_lon: Optional[float]
    data_quality_score: int
    last_activity_at: Optional[datetime]
    last_verified_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class VoterListResponse(BaseModel):
    total: int
    page: int
    size: int
    items: list[VoterResponse]


# ============================================================================
# Biometric Schemas
# ============================================================================

class EnrollmentRequest(BaseModel):
    voter_id: UUID
    face_image: bytes = Field(..., description="Base64-encoded face image")


class EnrollmentResponse(BaseModel):
    voter_id: UUID
    modality: Modality
    quality_score: float
    liveness_passed: bool
    captured_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Verification Schemas
# ============================================================================

class VerificationRequest(BaseModel):
    voter_token: str
    polling_station_id: UUID
    officer_id: UUID
    face_image: bytes = Field(..., description="Base64-encoded face image")


class VerificationResponse(BaseModel):
    id: UUID
    voter_id: Optional[UUID]
    result: VerifyResult
    confidence: float
    liveness: Liveness
    review_required: bool
    explanation: Optional[str]
    flags: list[str]
    decision: dict  # Explainability JSON (from AI module)
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class DecisionPanelJSON(BaseModel):
    """Explainability JSON returned by AI module."""
    decision: str
    confidence: float
    threshold: float
    breakdown: dict
    flags: list[str]
    explanation: str
    review_required: bool


class VoteRequest(BaseModel):
    voter_id: UUID
    officer_id: UUID
    polling_station_id: UUID


class VoteResponse(BaseModel):
    voter_id: UUID
    status: VoterStatus
    voted_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Fraud Schemas
# ============================================================================

class FraudCaseResponse(BaseModel):
    id: str
    type: FraudType
    title: str
    risk_level: RiskLevel
    score: Optional[str]
    verdict: Optional[str]
    voter_id: Optional[UUID]
    registration_ref: Optional[str]
    polling_station_id: Optional[UUID]
    detected_by: Optional[str]
    face_score: Optional[float]
    opened_at: Optional[datetime]
    resolved_at: Optional[datetime]
    resolution: Optional[CaseResolution]
    breakdown: list
    timeline: list
    assessment: dict
    duplicate_of_registration_ref: Optional[str]
    similarity: Optional[float]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class DuplicateMatchResponse(BaseModel):
    id: UUID
    record_a_id: UUID
    record_b_id: UUID
    similarity: float
    status: DuplicateStatus
    merged_into_id: Optional[UUID]
    resolved_by_user_id: Optional[UUID]
    resolved_at: Optional[datetime]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class MergeRequest(BaseModel):
    survivor_id: UUID


# ============================================================================
# Audit Schemas
# ============================================================================

class AuditEntryResponse(BaseModel):
    id: UUID
    sequence: int
    occurred_at: datetime
    action: AuditAction
    actor_type: ActorType
    actor_id: Optional[str]
    actor_role: Optional[str]
    service: Optional[str]
    polling_station_id: Optional[UUID]
    ip_address: Optional[str]
    geo: Optional[str]
    detail: Optional[str]
    change_diff: Optional[list]
    entry_hash: str
    prev_hash: str
    
    model_config = ConfigDict(from_attributes=True)


class ChainVerificationResponse(BaseModel):
    entries_walked: int
    breaks_found: int
    first_break_sequence: Optional[int]
    verified_at: str
    duration_ms: Optional[int] = None


# ============================================================================
# Analytics Schemas
# ============================================================================

class TurnoutStats(BaseModel):
    total_registered: int
    total_verified: int
    total_voted: int
    by_station: list[dict]


class VerificationStats(BaseModel):
    total_attempts: int
    approved: int
    manual_review: int
    rejected: int
    average_confidence: float
