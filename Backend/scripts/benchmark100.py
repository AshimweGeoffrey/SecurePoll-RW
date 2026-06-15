"""
100-image biometric benchmark on the real InsightFace backend.

Layout: 50 distinct identities (tests/fixtures/faces100/id_XX.jpg), each given one
realistic capture variant (brightness/contrast/blur/rotate/flip/crop/recompress)
-> 100 images total.

Measures:
  * genuine scores   = cos(original_i, variant_i)            (same person)
  * impostor scores  = cos(original_i, original_j), i<j      (different people)
  * TAR / FAR at the system thresholds (review 0.60, match 0.80, dedup 0.85)
  * Equal Error Rate (EER) and its threshold
  * FAISS 1:N rank-1 identification accuracy (variant -> correct identity)
  * embedding latency, face-detection failures

Run:  AI_BACKEND=insightface python3 scripts/benchmark100.py
"""
import os, sys, io, time, json, glob
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ["AI_BACKEND"] = "insightface"

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

from app.core.config import settings
settings.ai_backend = "insightface"
import tempfile
settings.faiss_index_path = os.path.join(tempfile.mkdtemp(), "bench.bin")
import ml.inference as inf

FACES = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures", "faces100")
REVIEW, MATCH, DEDUP = settings.review_floor, settings.face_match_threshold, settings.dedup_threshold


def jpeg_bytes(im, q=92):
    b = io.BytesIO(); im.convert("RGB").save(b, format="JPEG", quality=q); return b.getvalue()


def make_variant(im, kind):
    w, h = im.size
    if kind == "bright":   return ImageEnhance.Brightness(im).enhance(1.30)
    if kind == "dark":     return ImageEnhance.Brightness(im).enhance(0.72)
    if kind == "contrast": return ImageEnhance.Contrast(im).enhance(1.4)
    if kind == "blur":     return im.filter(ImageFilter.GaussianBlur(2.2))
    if kind == "rotate":   return im.rotate(7, expand=False)
    if kind == "flip":     return im.transpose(Image.FLIP_LEFT_RIGHT)
    if kind == "crop":     return im.crop((int(w*.10), int(h*.10), int(w*.90), int(h*.90))).resize((w, h))
    if kind == "recompress": return im  # handled via low jpeg quality
    return im


KINDS = ["bright", "dark", "contrast", "blur", "rotate", "flip", "crop", "recompress"]


def embed(image_bytes):
    return inf.embed_face(image_bytes)


def main():
    inf.load_models()
    print(f"backend={inf._backend.name}  thresholds: review={REVIEW} match={MATCH} dedup={DEDUP}")

    ids = sorted(glob.glob(os.path.join(FACES, "id_*.jpg")))
    if len(ids) < 10:
        print(f"Only {len(ids)} identities found in {FACES} — download must finish first."); sys.exit(2)

    originals, variants, labels = {}, {}, []
    det_fail = 0
    t0 = time.time()
    n_emb = 0

    for i, path in enumerate(ids):
        name = os.path.splitext(os.path.basename(path))[0]
        with open(path, "rb") as f:
            raw = f.read()
        try:
            e_o = embed(raw); n_emb += 1
        except ValueError:
            det_fail += 1; continue

        kind = KINDS[i % len(KINDS)]
        im = Image.open(io.BytesIO(raw)).convert("RGB")
        vbytes = jpeg_bytes(make_variant(im, kind), q=(60 if kind == "recompress" else 92))
        try:
            e_v = embed(vbytes); n_emb += 1
        except ValueError:
            det_fail += 1; continue

        originals[name] = e_o
        variants[name] = (e_v, kind)
        labels.append(name)

    elapsed = time.time() - t0
    print(f"identities used: {len(labels)} | images embedded: {n_emb} | "
          f"detection failures: {det_fail} | avg {elapsed/max(n_emb,1)*1000:.0f} ms/embed")

    # genuine + impostor
    genuine = np.array([float(originals[n] @ variants[n][0]) for n in labels])
    impostor = []
    L = labels
    for a in range(len(L)):
        for b in range(a + 1, len(L)):
            impostor.append(float(originals[L[a]] @ originals[L[b]]))
    impostor = np.array(impostor)

    def rate_ge(arr, t): return float((arr >= t).mean() * 100)

    print("\n--- score distributions ---")
    print(f"genuine  (n={len(genuine)}):  min={genuine.min():.3f} mean={genuine.mean():.3f} "
          f"max={genuine.max():.3f} std={genuine.std():.3f}")
    print(f"impostor (n={len(impostor)}): min={impostor.min():.3f} mean={impostor.mean():.3f} "
          f"max={impostor.max():.3f} std={impostor.std():.3f}")

    print("\n--- operating points ---")
    for label, t in [("review_floor", REVIEW), ("match", MATCH), ("dedup", DEDUP)]:
        tar = rate_ge(genuine, t)          # genuine accepted
        far = rate_ge(impostor, t)         # impostor wrongly accepted
        print(f"@ {t:.2f} ({label:11s}): TAR={tar:5.1f}%  FAR={far:5.1f}%  FRR={100-tar:5.1f}%")

    # EER sweep
    ts = np.linspace(0.0, 1.0, 201)
    best_t, best_gap, eer = 0, 9, 0
    for t in ts:
        far = (impostor >= t).mean()
        frr = (genuine < t).mean()
        if abs(far - frr) < best_gap:
            best_gap, best_t, eer = abs(far - frr), t, (far + frr) / 2
    print(f"\nEER ~ {eer*100:.2f}% at threshold ~ {best_t:.3f}")

    # FAISS 1:N rank-1 identification
    inf._faiss_index.reset()
    id_of = {}
    for n in labels:
        fid = inf.faiss_add(originals[n]); id_of[fid] = n
    correct = 0
    for n in labels:
        d, idx = inf.faiss_search(variants[n][0], k=1)
        if id_of.get(int(idx[0])) == n:
            correct += 1
    rank1 = correct / len(labels) * 100
    print(f"FAISS 1:N rank-1 identification: {correct}/{len(labels)} = {rank1:.1f}%")

    # histograms for the chart (bins of 0.05)
    bins = np.arange(0, 1.0001, 0.05)
    gh, _ = np.histogram(genuine, bins=bins)
    ih, _ = np.histogram(impostor, bins=bins)

    summary = {
        "identities": len(labels), "images": n_emb, "det_fail": det_fail,
        "ms_per_embed": round(elapsed / max(n_emb, 1) * 1000),
        "genuine": {"n": len(genuine), "min": round(float(genuine.min()), 3),
                    "mean": round(float(genuine.mean()), 3), "max": round(float(genuine.max()), 3)},
        "impostor": {"n": len(impostor), "min": round(float(impostor.min()), 3),
                     "mean": round(float(impostor.mean()), 3), "max": round(float(impostor.max()), 3)},
        "op": {t: {"tar": round(rate_ge(genuine, t), 1), "far": round(rate_ge(impostor, t), 1)}
               for t in (REVIEW, MATCH, DEDUP)},
        "eer_pct": round(eer * 100, 2), "eer_threshold": round(best_t, 3),
        "rank1_pct": round(rank1, 1),
        "bins": [round(float(b), 2) for b in bins[:-1]],
        "genuine_hist": [int(x) for x in gh], "impostor_hist": [int(x) for x in ih],
    }
    print("\nJSON_SUMMARY=" + json.dumps(summary))


if __name__ == "__main__":
    main()
