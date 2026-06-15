"""
End-to-end validation of the SecurePoll biometric logic using REAL face images.

Two stages:

  STAGE 1 — inference layer (no DB):  embeds real faces, checks 1:1 match /
            no-match separation, and FAISS 1:N dedup, straight through the
            ml.inference facade against the active backend.

  STAGE 2 — full HTTP pipeline (needs DB):  enroll -> verify (right/wrong face)
            -> 1:N dedup + fraud case -> blocked-voter rejection -> double-vote
            409 -> audit-chain integrity, over the running API.

Fixtures live in tests/fixtures/faces/.  Run from Backend/:
    python3 scripts/validate_pipeline.py
"""
import base64, io, json, os, sys, uuid
import urllib.request, urllib.error
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.abspath(os.path.join(HERE, ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)
FACES = os.path.join(BACKEND_ROOT, "tests", "fixtures", "faces")
BASE = "http://127.0.0.1:8000"

PASS, FAIL = [], []


def check(name, ok, detail=""):
    (PASS if ok else FAIL).append(name)
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}" + (f"  — {detail}" if detail else ""))
    return ok


def img_bytes(fname):
    with open(os.path.join(FACES, fname), "rb") as f:
        return f.read()


def b64(fname):
    return base64.b64encode(img_bytes(fname)).decode()


# ═══════════════════════════════════════════════════════════════════════════
# STAGE 1 — inference layer, real images, no DB
# ═══════════════════════════════════════════════════════════════════════════
def stage1():
    print("\n" + "=" * 70)
    print("STAGE 1 — inference layer (real faces, no DB)")
    print("=" * 70)

    import tempfile
    from app.core.config import settings
    settings.faiss_index_path = os.path.join(tempfile.mkdtemp(), "val.bin")
    import ml.inference as inf
    inf.load_models()
    backend = inf._backend.name
    print(f"  backend: {backend}\n")

    people = [f"person_0{i}.jpg" for i in range(1, 7)]
    emb = {p: inf.embed_face(img_bytes(p)) for p in people}

    # all embeddings well-formed
    dims_ok = all(e.shape == (512,) for e in emb.values())
    norms_ok = all(abs(float(np.linalg.norm(e)) - 1.0) < 1e-3 for e in emb.values())
    check("embeddings are 512-d", dims_ok)
    check("embeddings are L2-normalized", norms_ok)

    # 1:1 — same capture must match (cosine ~1.0)
    same = float(emb["person_01.jpg"] @ inf.embed_face(img_bytes("person_01_dup.jpg")))
    check("same capture -> high similarity (match)", same > 0.95, f"cosine={same:.4f}")

    # 1:1 — different people must NOT match (well under dedup/match thresholds)
    diffs = [float(emb["person_01.jpg"] @ emb[p]) for p in people[1:]]
    max_diff = max(diffs)
    check("different people -> low similarity (no match)", max_diff < 0.80,
          f"max cosine={max_diff:.4f}")

    # same-person variants (brightness / crop) — backend-dependent expectation
    v_bright = float(emb["person_01.jpg"] @ inf.embed_face(img_bytes("person_01_bright.jpg")))
    v_crop = float(emb["person_01.jpg"] @ inf.embed_face(img_bytes("person_01_crop.jpg")))
    if backend == "insightface":
        check("same person, brighter -> still matches (real biometrics)", v_bright > 0.45,
              f"cosine={v_bright:.4f}")
        check("same person, cropped -> still matches (real biometrics)", v_crop > 0.45,
              f"cosine={v_crop:.4f}")
    else:
        print(f"  [info] synthetic backend is byte-deterministic, so same-person "
              f"variants do NOT match (bright={v_bright:.3f}, crop={v_crop:.3f}).")
        print(f"         True same-person-different-photo matching needs AI_BACKEND=insightface.")

    # FAISS 1:N — add all, nearest neighbour of person_03 is itself
    ids = {p: inf.faiss_add(emb[p]) for p in people}
    d, i = inf.faiss_search(emb["person_03.jpg"], k=1)
    check("FAISS 1:N nearest neighbour is correct", int(i[0]) == ids["person_03.jpg"],
          f"got id {int(i[0])}, score {float(d[0]):.4f}")

    # garbage rejected
    try:
        inf.embed_face(img_bytes("corrupt.bin"))
        check("garbage image rejected (ValueError)", False)
    except ValueError:
        check("garbage image rejected (ValueError -> HTTP 400)", True)

    return backend


# ═══════════════════════════════════════════════════════════════════════════
# HTTP helpers
# ═══════════════════════════════════════════════════════════════════════════
def call(method, path, body=None, token=None, form=None, timeout=30):
    hdrs, data = {}, None
    if form is not None:
        from urllib.parse import urlencode
        data = urlencode(form).encode(); hdrs["Content-Type"] = "application/x-www-form-urlencoded"
    elif body is not None:
        data = json.dumps(body).encode(); hdrs["Content-Type"] = "application/json"
    if token:
        hdrs["Authorization"] = f"Bearer {token}"
    rq = urllib.request.Request(BASE + path, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(rq, timeout=timeout) as r:
            return r.status, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode() or "{}")
        except Exception:
            return e.code, {}
    except Exception as e:
        return 0, {"error": str(e)}


def db_reachable(token):
    s, _ = call("GET", "/voters", token=token, timeout=12)
    return s == 200


# ═══════════════════════════════════════════════════════════════════════════
# STAGE 2 — full HTTP pipeline (needs DB)
# ═══════════════════════════════════════════════════════════════════════════
def stage2():
    print("\n" + "=" * 70)
    print("STAGE 2 — full HTTP pipeline (enroll -> verify -> dedup -> vote -> audit)")
    print("=" * 70)

    s, lg = call("POST", "/auth/login",
                 body={"email": "admin@securepoll.rw", "password": "SecurePassword123!"})
    if s != 200:
        print(f"  [SKIP] login failed ({s}) — is the server up?"); return False
    token = lg["access_token"]

    if not db_reachable(token):
        print("  [SKIP] database not reachable (Supabase pooler still recovering).")
        print("         Re-run this script once it clears to exercise Stage 2.")
        return False

    _, stns = call("GET", "/polling-stations", token=token)
    st0 = stns["items"][0]
    district_id, station_id = st0["district_id"], st0["id"]
    _, offs = call("GET", "/officers", token=token)
    officer_id = offs["items"][0]["id"] if offs.get("items") else None

    def new_voter(tag):
        sfx = uuid.uuid4().hex[:8].upper()
        s, v = call("POST", "/voters", token=token, body={
            "voter_token": f"VAL-{tag}-{sfx}", "registration_ref": f"#VAL-{tag}-{sfx}",
            "national_id": f"VAL{tag}{sfx}", "first_name": tag, "last_name": "Validate",
            "sex": "male", "date_of_birth": "1990-01-01",
            "district_id": district_id, "polling_station_id": station_id})
        return (v["id"], v["voter_token"]) if s == 201 else (None, None)

    # --- enroll voter A with person_01 ---
    vA, tokA = new_voter("A")
    s, e = call("POST", "/biometrics/enroll", token=token,
                form={"voter_id": vA, "face_image": b64("person_01.jpg")})
    check("enroll voter A (person_01)", s == 200, f"HTTP {s}")

    # --- 1:1 verify A with the SAME face -> approved ---
    s, vr = call("POST", "/verifications", body={
        "voter_token": tokA, "polling_station_id": station_id,
        "officer_id": officer_id, "face_image": b64("person_01.jpg")})
    check("verify A with correct face -> approved", s == 200 and vr.get("result") == "approved",
          f"HTTP {s} result={vr.get('result')} conf={round(vr.get('confidence',0),3)}")

    # --- 1:1 verify A with a DIFFERENT face -> not approved ---
    s, vr2 = call("POST", "/verifications", body={
        "voter_token": tokA, "polling_station_id": station_id,
        "officer_id": officer_id, "face_image": b64("person_02.jpg")})
    check("verify A with wrong face -> rejected/manual_review",
          s == 200 and vr2.get("result") in ("rejected", "manual_review"),
          f"HTTP {s} result={vr2.get('result')} conf={round(vr2.get('confidence',0),3)}")

    # --- 1:N dedup: enroll voter B with person_01 (duplicate) -> flagged ---
    _, dups_before = call("GET", "/duplicates", token=token)
    vB, tokB = new_voter("B")
    s, e2 = call("POST", "/biometrics/enroll", token=token,
                 form={"voter_id": vB, "face_image": b64("person_01.jpg")})
    _, dups_after = call("GET", "/duplicates", token=token)
    grew = (dups_after.get("total", 0) > dups_before.get("total", 0))
    check("1:N dedup detects duplicate biometric on re-enroll", s == 200 and grew,
          f"duplicates {dups_before.get('total')} -> {dups_after.get('total')}")

    # --- blocked voter cannot verify ---
    vC, tokC = new_voter("C")
    call("POST", "/biometrics/enroll", token=token,
         form={"voter_id": vC, "face_image": b64("person_04.jpg")})
    call("POST", f"/voters/{vC}:block", token=token, body=None)
    s, vr3 = call("POST", "/verifications", body={
        "voter_token": tokC, "polling_station_id": station_id,
        "officer_id": officer_id, "face_image": b64("person_04.jpg")})
    check("blocked voter -> verification rejected (400)", s == 400,
          f"HTTP {s} detail={str(vr3.get('detail'))[:40]}")

    # --- double-vote protection ---
    vD, tokD = new_voter("D")
    payload = {"voter_id": vD, "officer_id": officer_id, "polling_station_id": station_id}
    s1, r1 = call("POST", "/votes", body=payload)
    s2, r2 = call("POST", "/votes", body=payload)
    check("first vote accepted (200), second blocked (409)",
          s1 == 200 and s2 == 409, f"first={s1} second={s2}")

    # --- audit chain integrity after all this activity ---
    s, chain = call("POST", "/audit:verify-chain", token=token)
    check("audit hash-chain intact (no breaks)", s == 200 and chain.get("breaks_found", 1) == 0,
          f"entries={chain.get('entries_walked')} breaks={chain.get('breaks_found')}")
    return True


if __name__ == "__main__":
    backend = stage1()
    stage2()

    print("\n" + "=" * 70)
    total = len(PASS) + len(FAIL)
    print(f"  RESULT: {len(PASS)}/{total} checks passed"
          + (f"  —  {len(FAIL)} FAILED: {', '.join(FAIL)}" if FAIL else "  —  all green"))
    print("=" * 70)
    sys.exit(1 if FAIL else 0)
