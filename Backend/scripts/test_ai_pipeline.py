"""End-to-end check of the biometric pipeline against the synthetic backend."""
import base64, io, json, uuid, urllib.request, urllib.error
import numpy as np
from PIL import Image

BASE = "http://127.0.0.1:8000"


def call(method, path, body=None, token=None, form=None):
    hdrs = {}
    data = None
    if form is not None:
        from urllib.parse import urlencode
        data = urlencode(form).encode()
        hdrs["Content-Type"] = "application/x-www-form-urlencoded"
    elif body is not None:
        data = json.dumps(body).encode()
        hdrs["Content-Type"] = "application/json"
    if token:
        hdrs["Authorization"] = f"Bearer {token}"
    rq = urllib.request.Request(BASE + path, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(rq, timeout=30) as r:
            return r.status, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode() or "{}")
        except Exception:
            return e.code, {}


def face_jpeg(r, g, b):
    buf = io.BytesIO()
    Image.new("RGB", (16, 16), (r, g, b)).save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode()


# login
_, lg = call("POST", "/auth/login",
             body={"email": "admin@securepoll.rw", "password": "SecurePassword123!"})
TOKEN = lg["access_token"]

# status
s, st = call("GET", "/ai/status", token=TOKEN)
print(f"[status] {s}  backend={st.get('backend')}  faiss={st.get('faiss_index_size')}")

# geography for new voters
_, stations = call("GET", "/polling-stations", token=TOKEN, body=None)
st0 = stations["items"][0]
district_id, station_id = st0["district_id"], st0["id"]


def make_voter(tag):
    sfx = uuid.uuid4().hex[:8].upper()
    s, v = call("POST", "/voters", token=TOKEN, body={
        "voter_token": f"AIT-{tag}-{sfx}", "registration_ref": f"#AIT-{tag}-{sfx}",
        "national_id": f"AIT{tag}{sfx}", "first_name": tag, "last_name": "AITest",
        "sex": "male", "date_of_birth": "1990-01-01",
        "district_id": district_id, "polling_station_id": station_id,
    })
    assert s == 201, f"create voter failed: {s} {v}"
    return v["id"], v["voter_token"]


faceA = face_jpeg(200, 50, 50)   # unique face A
faceB = face_jpeg(50, 50, 200)   # unique face B

# 1) enrol voter A
vA, tokA = make_voter("A")
s, e = call("POST", "/biometrics/enroll", token=TOKEN,
            form={"voter_id": vA, "face_image": faceA})
print(f"[enroll A] {s}  liveness={e.get('liveness_passed')}  quality={round(e.get('quality_score',0),3)}")

# 2) 1:1 verify A with the SAME face -> should approve (deterministic match)
s, vr = call("POST", "/verifications", body={
    "voter_token": tokA, "polling_station_id": station_id,
    "officer_id": None, "face_image": faceA,
})
print(f"[verify A same face] {s}  result={vr.get('result')}  confidence={round(vr.get('confidence',0),3)}")

# 3) verify A with a DIFFERENT face -> should NOT approve
s, vr2 = call("POST", "/verifications", body={
    "voter_token": tokA, "polling_station_id": station_id,
    "officer_id": None, "face_image": faceB,
})
print(f"[verify A wrong face] {s}  result={vr2.get('result')}  confidence={round(vr2.get('confidence',0),3)}")

# 4) dedup: enrol voter B with the SAME face as A -> should raise a duplicate flag
vB, tokB = make_voter("B")
s, e2 = call("POST", "/biometrics/enroll", token=TOKEN,
             form={"voter_id": vB, "face_image": faceA})
print(f"[enroll B reuse A's face] {s}  liveness={e2.get('liveness_passed')}")
s, dups = call("GET", "/duplicates", token=TOKEN)
recent = [d for d in dups.get("items", []) if d.get("record_a_id") in (vA, vB) or d.get("record_b_id") in (vA, vB)]
print(f"[dedup] total_duplicates={dups.get('total')}  match_for_AB={'YES' if recent else 'no'}")

# 5) garbage image -> 400 (not 500)
s, g = call("POST", "/biometrics/enroll", token=TOKEN,
            form={"voter_id": vA, "face_image": "bm90LWFuLWltYWdl"})
print(f"[enroll garbage] {s}  detail={str(g.get('detail'))[:50]}")

# final status
s, st2 = call("GET", "/ai/status", token=TOKEN)
print(f"[status] faiss now={st2.get('faiss_index_size')}")
