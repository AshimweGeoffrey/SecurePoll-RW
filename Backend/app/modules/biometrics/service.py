"""Biometrics business logic."""
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime, timezone
from app.db.models.biometric import BiometricTemplate
from app.db.models.voter import Voter
from app.db.models.fraud import FraudCase, DuplicateMatch
from app.core.enums import Modality, AuditAction, ActorType, FraudType, RiskLevel, DuplicateStatus
from app.core.audit import write_audit
from app.core.config import settings
import uuid
import hashlib
import numpy as np


def get_template_for_voter(db: Session, voter_id: uuid.UUID) -> Optional[BiometricTemplate]:
    """Return the face biometric template for a voter, or None."""
    return db.execute(
        select(BiometricTemplate).where(
            BiometricTemplate.voter_id == voter_id,
            BiometricTemplate.modality == Modality.face,
        )
    ).scalar_one_or_none()


def list_templates(db: Session, skip: int = 0, limit: int = 50) -> tuple:
    """All templates paginated. Returns (items, total)."""
    total = db.execute(select(func.count(BiometricTemplate.id))).scalar() or 0
    items = db.execute(
        select(BiometricTemplate).offset(skip).limit(limit)
    ).scalars().all()
    return list(items), total


def delete_template(db: Session, template: BiometricTemplate, deleted_by_id: str) -> None:
    """Hard delete template, drop its FAISS vector, and write audit."""
    voter_ref = str(template.voter_id)
    # Remove the embedding from the 1:N index so a deleted voter can't still match.
    if template.faiss_id is not None:
        try:
            import ml.inference as inference
            inference.faiss_remove(template.faiss_id)
            inference.faiss_save()
        except Exception:
            pass
    write_audit(
        db,
        action=AuditAction.TEMPLATE_ACCESSED,
        actor_type=ActorType.user,
        actor_id=deleted_by_id,
        service="Biometrics",
        detail=f"Template deleted for voter: {voter_ref}",
    )
    db.delete(template)
    db.commit()


def run_dedup_scan(db: Session, voter: Voter, embedding: np.ndarray,
                   faiss_id: int, threshold: float) -> list:
    """Run 1:N dedup, create DuplicateMatch + FraudCase, return list of hit dicts.

    Searches FAISS for near-duplicate embeddings. For each hit above threshold
    (excluding self), creates a DuplicateMatch and FraudCase if not already existing.
    Returns list of dicts describing each hit.
    """
    import ml.inference as inference

    hits = []
    try:
        distances, indices = inference.faiss_search(embedding, k=10)
    except Exception:
        return hits

    for dist, idx in zip(distances, indices):
        if idx < 0 or int(idx) == faiss_id:
            continue
        if float(dist) < threshold:
            continue

        other_template = db.execute(
            select(BiometricTemplate).where(BiometricTemplate.faiss_id == int(idx))
        ).scalar_one_or_none()
        if not other_template or other_template.voter_id == voter.id:
            continue

        # Create DuplicateMatch
        match = DuplicateMatch(
            record_a_id=voter.id,
            record_b_id=other_template.voter_id,
            similarity=float(dist),
            status=DuplicateStatus.pending,
        )
        db.add(match)

        # Create FraudCase if not already existing
        case_id = f"FR-{hashlib.md5(f'{voter.id}{other_template.voter_id}'.encode()).hexdigest()[:6].upper()}"
        existing_case = db.execute(
            select(FraudCase).where(FraudCase.id == case_id)
        ).scalar_one_or_none()
        if not existing_case:
            case = FraudCase(
                id=case_id,
                type=FraudType.duplicate,
                title=f"Duplicate biometric: {voter.registration_ref}",
                risk_level=RiskLevel.critical if float(dist) >= 0.95 else RiskLevel.review,
                voter_id=voter.id,
                registration_ref=voter.registration_ref,
                detected_by="1:N de-duplication",
                face_score=float(dist),
                opened_at=datetime.now(timezone.utc),
                similarity=float(dist),
            )
            db.add(case)

        write_audit(
            db,
            action=AuditAction.RECORD_CREATED,
            actor_type=ActorType.system,
            service="Biometrics",
            detail=f"Dedup hit: {voter.registration_ref} sim={dist:.3f}",
        )

        hits.append({
            "faiss_id": int(idx),
            "voter_id": str(other_template.voter_id),
            "similarity": float(dist),
            "case_id": case_id,
        })

    if hits:
        db.commit()

    return hits


def enrollment_stats(db: Session) -> dict:
    """Return enrollment counts: total voters, enrolled, not_enrolled, by_modality."""
    from app.db.models.voter import Voter as VoterModel
    total_voters = db.execute(select(func.count(VoterModel.id))).scalar() or 0
    enrolled = db.execute(select(func.count(BiometricTemplate.id))).scalar() or 0
    not_enrolled = max(0, total_voters - enrolled)
    by_modality = {}
    for m in Modality:
        cnt = db.execute(
            select(func.count(BiometricTemplate.id)).where(BiometricTemplate.modality == m)
        ).scalar() or 0
        by_modality[m.value] = cnt
    enrollment_rate = round(enrolled / total_voters * 100, 2) if total_voters else 0.0
    return {
        "total_voters": total_voters,
        "enrolled": enrolled,
        "not_enrolled": not_enrolled,
        "enrollment_rate": enrollment_rate,
        "by_modality": by_modality,
    }


def re_enroll(
    db: Session,
    voter: Voter,
    template_blob: bytes,
    quality_score: float,
    liveness_passed: bool,
    faiss_id: int,
    actor_id: str,
) -> BiometricTemplate:
    """Replace the existing biometric template for a voter, writing a re-enrolment audit entry."""
    existing = db.execute(
        select(BiometricTemplate).where(
            BiometricTemplate.voter_id == voter.id,
            BiometricTemplate.modality == Modality.face,
        )
    ).scalar_one_or_none()

    if existing:
        db.delete(existing)
        db.flush()

    template = BiometricTemplate(
        voter_id=voter.id,
        modality=Modality.face,
        template_blob=template_blob,
        quality_score=quality_score,
        liveness_passed=liveness_passed,
        captured_at=datetime.now(timezone.utc),
        faiss_id=faiss_id,
    )
    db.add(template)
    write_audit(
        db,
        action=AuditAction.BIOMETRIC_RE_ENROLLED,
        actor_type=ActorType.user,
        actor_id=actor_id,
        service="Biometrics",
        detail=f"Re-enrolled face for voter: {voter.registration_ref}",
    )
    db.commit()
    db.refresh(template)
    return template
