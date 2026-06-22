"""
AI fault-tolerance stress test (DB-free).

Hammers the real InsightFace backend + passive liveness + FAISS ID-map with valid
faces AND malformed / adversarial inputs, asserting: no uncaught exceptions, all
embeddings well-formed (512-d, unit-norm), liveness always returns a valid verdict,
and the index round-trips. Run: AI_BACKEND=insightface python3 scripts/ai_faultcheck.py
"""
import os, sys, io, glob
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ["AI_BACKEND"] = "insightface"
os.environ.setdefault("LIVENESS_BACKEND", "passive")

import numpy as np
from PIL import Image
from app.core.config import settings
settings.ai_backend = "insightface"
settings.liveness_backend = "passive"
import tempfile
settings.faiss_index_path = os.path.join(tempfile.mkdtemp(), "fc.bin")
import ml.inference as inf

PASS, FAIL = [], []
def chk(name, ok, detail=""):
    (PASS if ok else FAIL).append(name)
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}" + (f" — {detail}" if detail else ""))


def jpeg(img):
    b = io.BytesIO(); img.convert("RGB").save(b, format="JPEG"); return b.getvalue()


def main():
    inf.load_models()
    F = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures")
    faces = sorted(glob.glob(os.path.join(F, "faces100", "id_*.jpg")))
    print(f"backend={inf._backend.name} liveness={inf._liveness.name} | {len(faces)} real faces\n")

    # 1) every real face embeds cleanly: 512-d, unit norm, finite
    ok_embed = 0
    for p in faces:
        try:
            e = inf.embed_face(open(p, "rb").read())
            if e.shape == (512,) and abs(float(np.linalg.norm(e)) - 1.0) < 1e-2 and np.isfinite(e).all():
                ok_embed += 1
        except Exception as ex:
            print(f"    embed error on {os.path.basename(p)}: {ex}")
    chk("all real faces embed cleanly (512-d, unit-norm, finite)", ok_embed == len(faces),
        f"{ok_embed}/{len(faces)}")

    # 2) liveness on real faces returns a valid verdict, never crashes
    verdicts = set()
    live_ok = True
    for p in faces:
        try:
            s, c = inf.check_liveness(open(p, "rb").read())
            verdicts.add(s)
            if s not in ("live", "spoof", "failed") or not (0.0 <= c <= 1.0):
                live_ok = False
        except Exception:
            live_ok = False
    chk("liveness returns valid verdicts on real faces", live_ok, f"verdicts={verdicts}")

    # 3) malformed / adversarial inputs degrade gracefully (raise ValueError or return a verdict)
    base = Image.open(faces[0]).convert("RGB")
    adversarial = {
        "empty_bytes": b"",
        "random_bytes": os.urandom(500),
        "truncated_jpeg": open(faces[0], "rb").read()[:200],
        "1x1_pixel": jpeg(Image.new("RGB", (1, 1), (255, 255, 255))),
        "all_black": jpeg(Image.new("RGB", (256, 256), (0, 0, 0))),
        "huge_4k": jpeg(base.resize((3840, 2160))),
        "grayscale": jpeg(base.convert("L").convert("RGB")),
        "rotated_90": jpeg(base.rotate(90, expand=True)),
        "png_format": (lambda: (lambda b: (base.save(b, format="PNG"), b.getvalue())[1])(io.BytesIO()))(),
    }
    embed_graceful = liveness_graceful = True
    for name, data in adversarial.items():
        try:
            inf.embed_face(data)  # may succeed (real face) or raise ValueError
        except ValueError:
            pass
        except Exception as ex:
            embed_graceful = False
            print(f"    embed crashed on {name}: {type(ex).__name__}: {ex}")
        try:
            s, c = inf.check_liveness(data)
            if s not in ("live", "spoof", "failed"):
                liveness_graceful = False
        except Exception as ex:
            liveness_graceful = False
            print(f"    liveness crashed on {name}: {type(ex).__name__}: {ex}")
    chk("embed_face handles all adversarial inputs without crashing", embed_graceful)
    chk("check_liveness handles all adversarial inputs without crashing", liveness_graceful)

    # 4) FAISS ID-map round-trip with real embeddings (add / search / remove)
    inf._faiss_index = inf.new_index(); inf._next_faiss_id = 0
    embs = [inf.embed_face(open(p, "rb").read()) for p in faces[:20]]
    ids = [inf.faiss_add(e) for e in embs]
    d, found = inf.faiss_search(embs[7], k=1)
    hit_ok = int(found[0]) == ids[7] and float(d[0]) > 0.99
    removed = inf.faiss_remove(ids[7])
    _, found2 = inf.faiss_search(embs[7], k=1)
    chk("FAISS add/search returns correct stable id", hit_ok, f"id={int(found[0])} score={float(d[0]):.3f}")
    chk("FAISS remove deletes the vector", removed == 1 and int(found2[0]) != ids[7])

    # 5) determinism — same image embeds identically (no nondeterministic drift)
    e1 = inf.embed_face(open(faces[0], "rb").read())
    e2 = inf.embed_face(open(faces[0], "rb").read())
    chk("embeddings are deterministic for identical input", float(e1 @ e2) > 0.9999)

    print("\n" + "=" * 60)
    print(f"  AI FAULT CHECK: {len(PASS)}/{len(PASS)+len(FAIL)} passed"
          + (f" — FAILED: {FAIL}" if FAIL else " — fault-free"))
    sys.exit(1 if FAIL else 0)


if __name__ == "__main__":
    main()
