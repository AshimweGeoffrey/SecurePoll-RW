"""AI/ML service."""
from typing import Optional
import ml.inference as inference
from app.core.config import settings


def rebuild_faiss_index(db) -> dict:
    """
    Rebuild the FAISS 1:N index from the stored (AES-encrypted) biometric templates.

    The original images are not kept, but the L2-normalized 512-d embeddings ARE
    persisted encrypted — so the index is fully reconstructable. This also REASSIGNS
    each template's faiss_id to its new position, repairing any drift between the
    in-memory index and the database (the usual cause of broken 1:N dedup after a
    restart, since the flat index is positional).
    """
    import numpy as np
    from sqlalchemy import select
    from app.db.models.biometric import BiometricTemplate
    from app.core.crypto import decrypt_template

    templates = db.execute(
        select(BiometricTemplate).order_by(BiometricTemplate.created_at, BiometricTemplate.id)
    ).scalars().all()

    # Preserve each template's existing faiss_id where it's valid (non-null, unique);
    # only null or colliding ids get reassigned. On a healthy index this means ZERO
    # DB writes — the rebuild just reconstructs the in-memory index from stored ids.
    existing = [t.faiss_id for t in templates if t.faiss_id is not None]
    next_id = (max(existing) + 1) if existing else 0

    index = inference.new_index()  # IndexIDMap2(IndexFlatIP) — stable, removable ids
    rebuilt, skipped = 0, 0
    used, id_updates = set(), []
    for t in templates:
        try:
            emb = np.frombuffer(decrypt_template(t.template_blob, b""), dtype=np.float32)
        except Exception:
            skipped += 1
            continue
        if emb.shape[0] != 512:
            skipped += 1
            continue
        fid = t.faiss_id
        if fid is None or fid in used:          # null or duplicate -> allocate fresh
            fid = next_id
            next_id += 1
            id_updates.append({"id": t.id, "faiss_id": fid})
        used.add(fid)
        index.add_with_ids(emb.reshape(1, -1).astype(np.float32),
                           np.array([int(fid)], dtype=np.int64))
        rebuilt += 1

    if id_updates:  # batched; empty on a healthy index
        db.bulk_update_mappings(BiometricTemplate, id_updates)
        db.commit()

    inference._faiss_index = index
    inference._next_faiss_id = next_id
    inference.faiss_save()
    return {"status": "rebuilt", "templates_indexed": rebuilt, "reassigned": len(id_updates),
            "skipped": skipped, "index_size": index.ntotal}


def index_consistency(db) -> dict:
    """Compare the in-memory FAISS vector count with the stored template count."""
    from sqlalchemy import select, func
    from app.db.models.biometric import BiometricTemplate
    template_count = db.execute(select(func.count(BiometricTemplate.id))).scalar() or 0
    try:
        index_size = inference._faiss_index.ntotal if inference._faiss_index else 0
    except AttributeError:
        index_size = 0
    return {"template_count": template_count, "index_size": index_size,
            "in_sync": template_count == index_size}


def get_model_status() -> dict:
    """Return model health status dict."""
    try:
        backend = inference._backend
    except AttributeError:
        backend = None
    model_loaded = backend is not None
    backend_name = backend.name if backend is not None else None

    try:
        faiss_index_size = inference._faiss_index.ntotal if inference._faiss_index else 0
    except AttributeError:
        faiss_index_size = 0

    return {
        "model_loaded": model_loaded,
        "backend": backend_name,
        "faiss_index_size": faiss_index_size,
        "face_match_threshold": settings.face_match_threshold,
        "review_floor": settings.review_floor,
        "dedup_threshold": settings.dedup_threshold,
        "faiss_index_path": settings.faiss_index_path,
    }


def get_thresholds() -> dict:
    """Return current threshold configuration from settings."""
    return {
        "face_match_threshold": settings.face_match_threshold,
        "review_floor": settings.review_floor,
        "dedup_threshold": settings.dedup_threshold,
    }


def update_thresholds(
    face_match_threshold: Optional[float] = None,
    review_floor: Optional[float] = None,
    dedup_threshold: Optional[float] = None,
) -> dict:
    """Update threshold values at runtime (in-process override via settings mutation).

    Changes take effect immediately but are not persisted — they reset on restart.
    To persist, update environment variables or the .env file.
    """
    if face_match_threshold is not None:
        settings.face_match_threshold = face_match_threshold
    if review_floor is not None:
        settings.review_floor = review_floor
    if dedup_threshold is not None:
        settings.dedup_threshold = dedup_threshold
    return get_thresholds()
