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
    """Hard delete template and write audit."""
    voter_ref = str(template.voter_id)
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
