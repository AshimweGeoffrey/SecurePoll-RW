"""
Official LFW cross-session benchmark on the real InsightFace backend.

Uses scikit-learn's fetch_lfw_pairs (LFW View-2 protocol): real same-person photos
from DIFFERENT sessions (varying pose/lighting/expression/age) as genuine pairs, and
different-person photos as impostor pairs. This is the standard, citable face-
verification benchmark — far stronger than augmented variants.

Computes the full operating-characteristic curve:
  * ROC (TPR vs FPR) + AUC
  * DET-style error rates, Equal Error Rate (EER)
  * accuracy at the best threshold
  * TAR at fixed FAR = 1% and 0.1% (deployment-relevant operating points)
  * how the system's own thresholds (0.60 / 0.80 / 0.85) perform

Run:  AI_BACKEND=insightface python3 scripts/benchmark_lfw.py [n_pairs]
"""
import os, sys, io, json, time
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ["AI_BACKEND"] = "insightface"

import numpy as np
from PIL import Image

from app.core.config import settings
settings.ai_backend = "insightface"
import tempfile
settings.faiss_index_path = os.path.join(tempfile.mkdtemp(), "lfw.bin")
import ml.inference as inf

REVIEW, MATCH, DEDUP = settings.review_floor, settings.face_match_threshold, settings.dedup_threshold
MAX_PAIRS = int(sys.argv[1]) if len(sys.argv) > 1 else 600


def to_jpeg_bytes(arr):
    """LFW pair image (H,W,3) float [0,1] or [0,255] -> JPEG bytes."""
    a = np.asarray(arr)
    if a.max() <= 1.01:
        a = a * 255.0
    a = a.clip(0, 255).astype(np.uint8)
    b = io.BytesIO()
    Image.fromarray(a, "RGB").save(b, format="JPEG", quality=95)
    return b.getvalue()


def embed_with_pad(image_bytes):
    """Embed; if no face is found on the tight LFW crop, pad and retry once."""
    try:
        return inf.embed_face(image_bytes)
    except ValueError:
        im = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        padded = Image.new("RGB", (int(im.width * 1.6), int(im.height * 1.6)), (127, 127, 127))
        padded.paste(im, (int(im.width * 0.3), int(im.height * 0.3)))
        b = io.BytesIO(); padded.save(b, format="JPEG", quality=95)
        return inf.embed_face(b.getvalue())  # may still raise ValueError -> caller skips


def main():
    inf.load_models()
    print(f"backend={inf._backend.name}  thresholds: review={REVIEW} match={MATCH} dedup={DEDUP}")

    from sklearn.datasets import fetch_lfw_pairs
    print("loading LFW pairs (downloads ~200MB on first run)...")
    lfw = fetch_lfw_pairs(subset="test", color=True, resize=1.0, funneled=True)
    pairs, target = lfw.pairs, lfw.target  # pairs:(n,2,H,W,3) target:1=same 0=diff
    # LFW pairs are grouped (all genuine, then all impostor) — shuffle so any
    # truncation stays balanced.
    rng = np.random.default_rng(42)
    perm = rng.permutation(len(pairs))
    pairs, target = pairs[perm], target[perm]
    n = min(MAX_PAIRS, len(pairs))
    print(f"LFW test pairs available: {len(pairs)} "
          f"(genuine={int((target==1).sum())}, impostor={int((target==0).sum())}); using {n}", flush=True)

    scores, ys, skipped = [], [], 0
    t0 = time.time(); n_emb = 0
    for i in range(n):
        try:
            e0 = embed_with_pad(to_jpeg_bytes(pairs[i][0])); n_emb += 1
            e1 = embed_with_pad(to_jpeg_bytes(pairs[i][1])); n_emb += 1
        except ValueError:
            skipped += 1
            continue
        scores.append(float(e0 @ e1))
        ys.append(int(target[i]))
        if (i + 1) % 100 == 0:
            print(f"  ...{i+1}/{n} processed")
    elapsed = time.time() - t0

    scores = np.array(scores); ys = np.array(ys)
    gen = scores[ys == 1]; imp = scores[ys == 0]
    print(f"\nusable pairs: {len(scores)} (genuine={len(gen)}, impostor={len(imp)}), "
          f"skipped(no-face)={skipped}, {elapsed/max(n_emb,1)*1000:.0f} ms/embed")
    print(f"genuine : min={gen.min():.3f} mean={gen.mean():.3f} max={gen.max():.3f}")
    print(f"impostor: min={imp.min():.3f} mean={imp.mean():.3f} max={imp.max():.3f}")

    # sweep thresholds for ROC / EER / accuracy
    ts = np.linspace(-0.2, 1.0, 241)
    tpr, fpr, acc = [], [], []
    for t in ts:
        tp = (gen >= t).mean(); fn = 1 - tp
        fp = (imp >= t).mean(); tn = 1 - fp
        tpr.append(tp); fpr.append(fp)
        acc.append((tp * len(gen) + tn * len(imp)) / (len(gen) + len(imp)))
    tpr = np.array(tpr); fpr = np.array(fpr); acc = np.array(acc)

    # AUC via trapezoid over fpr (ascending)
    order = np.argsort(fpr)
    auc = float(np.trapz(tpr[order], fpr[order]))

    # EER: where FPR ~= FNR (1-TPR)
    fnr = 1 - tpr
    eer_i = int(np.argmin(np.abs(fpr - fnr)))
    eer = float((fpr[eer_i] + fnr[eer_i]) / 2)
    eer_t = float(ts[eer_i])

    best_i = int(np.argmax(acc))
    best_acc, best_t = float(acc[best_i]), float(ts[best_i])

    def tar_at_far(target_far):
        idx = np.where(fpr <= target_far)[0]
        return float(tpr[idx].max()) if len(idx) else 0.0

    print(f"\nROC AUC          : {auc:.4f}")
    print(f"EER              : {eer*100:.2f}%  @ threshold {eer_t:.3f}")
    print(f"best accuracy    : {best_acc*100:.2f}%  @ threshold {best_t:.3f}")
    print(f"TAR @ FAR=1%     : {tar_at_far(0.01)*100:.1f}%")
    print(f"TAR @ FAR=0.1%   : {tar_at_far(0.001)*100:.1f}%")

    print("\n--- system thresholds on LFW ---")
    for label, t in [("review_floor", REVIEW), ("match", MATCH), ("dedup", DEDUP)]:
        tp = (gen >= t).mean() * 100; fp = (imp >= t).mean() * 100
        print(f"@ {t:.2f} ({label:11s}): TAR={tp:5.1f}%  FAR={fp:5.1f}%")

    # ROC points (subsample for plotting) + histograms
    sel = np.linspace(0, len(ts) - 1, 40).astype(int)
    roc_pts = [[round(float(fpr[i]), 4), round(float(tpr[i]), 4)] for i in sel]
    bins = np.arange(-0.2, 1.0001, 0.05)
    gh, _ = np.histogram(gen, bins=bins); ih, _ = np.histogram(imp, bins=bins)

    summary = {
        "dataset": "LFW test (View-2, funneled, cross-session)",
        "pairs_used": len(scores), "genuine": len(gen), "impostor": len(imp),
        "skipped_no_face": skipped, "ms_per_embed": round(elapsed / max(n_emb, 1) * 1000),
        "gen": {"min": round(float(gen.min()), 3), "mean": round(float(gen.mean()), 3), "max": round(float(gen.max()), 3)},
        "imp": {"min": round(float(imp.min()), 3), "mean": round(float(imp.mean()), 3), "max": round(float(imp.max()), 3)},
        "auc": round(auc, 4), "eer_pct": round(eer * 100, 2), "eer_threshold": round(eer_t, 3),
        "best_acc_pct": round(best_acc * 100, 2), "best_threshold": round(best_t, 3),
        "tar_far1pct": round(tar_at_far(0.01) * 100, 1), "tar_far01pct": round(tar_at_far(0.001) * 100, 1),
        "sys": {f"{t:.2f}": {"tar": round(float((gen >= t).mean() * 100), 1),
                             "far": round(float((imp >= t).mean() * 100), 1)} for t in (REVIEW, MATCH, DEDUP)},
        "roc": roc_pts,
        "bins": [round(float(b), 2) for b in bins[:-1]],
        "gen_hist": [int(x) for x in gh], "imp_hist": [int(x) for x in ih],
    }
    print("\nJSON_SUMMARY=" + json.dumps(summary))


if __name__ == "__main__":
    main()
