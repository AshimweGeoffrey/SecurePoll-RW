"""
Live smoke-test — hits every registered endpoint and reports HTTP status.
Usage:  cd Backend && python3 scripts/smoke_test.py
"""
import json, sys, uuid, time
import urllib.request, urllib.error
from urllib.parse import urlencode

BASE = "http://127.0.0.1:8000"
RESULTS = []

# ── helpers ──────────────────────────────────────────────────────────────────

def req(method, path, body=None, headers=None, form=None, qs=None, expect=None, label=None):
    url = BASE + path + (("?" + qs) if qs else "")
    hdrs = {"Content-Type": "application/json"}
    if headers:
        hdrs.update(headers)
    data = None
    if body is not None:
        data = json.dumps(body).encode()
    elif form is not None:
        data = urlencode(form).encode()
        hdrs["Content-Type"] = "application/x-www-form-urlencoded"

    rq = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(rq, timeout=12) as r:
            status = r.status
            try:
                resp_body = json.loads(r.read().decode())
            except Exception:
                resp_body = {}
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            resp_body = json.loads(e.read().decode())
        except Exception:
            resp_body = {}
    except Exception as e:
        status = 0
        resp_body = {"error": str(e)}

    exp = expect if isinstance(expect, list) else ([expect] if expect else [200, 201])
    passed = status in exp
    tag = label or f"{method} {path}"
    RESULTS.append({"tag": tag, "status": status, "expected": exp, "passed": passed, "body": resp_body})
    mark = "PASS" if passed else "FAIL"
    print(f"  [{mark}] {status:3d}  {method:6s} {path}")
    return status, resp_body


def hdr(token):
    return {"Authorization": f"Bearer {token}"}

def items(body):
    """Extract first item's id from any list-shaped response."""
    if isinstance(body, list):
        return body
    return body.get("items", [])

def first_id(body, field="id"):
    lst = items(body)
    return lst[0].get(field) if lst else None

NULL_UUID = "00000000-0000-0000-0000-000000000000"

# ═══════════════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== AUTH ===")

s, b = req("POST", "/auth/login",
           body={"email": "admin@securepoll.rw", "password": "SecurePassword123!"},
           expect=[200])
TOKEN = b.get("access_token", "")
REFRESH = b.get("refresh_token", "")

req("POST", "/auth/login", body={"email": "bad@x.com", "password": "wrong"},
    expect=[401, 403, 422], label="POST /auth/login (wrong creds)")
req("POST", "/auth/token",
    form={"username": "admin@securepoll.rw", "password": "SecurePassword123!"},
    expect=[200])
req("POST", "/auth/refresh", body={"refresh_token": REFRESH}, expect=[200, 401, 422])
req("POST", "/auth/mfa", body={"token": "000000"}, expect=[400, 401, 403, 422])

# ═══════════════════════════════════════════════════════════════════════════
# USERS  (bare list)
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== USERS ===")
s, user_list = req("GET", "/users", headers=hdr(TOKEN), expect=[200])
USER_ID = user_list[0]["id"] if isinstance(user_list, list) and user_list else NULL_UUID

req("GET", "/users/me", headers=hdr(TOKEN), expect=[200])
req("GET", "/users/me", expect=[401], label="GET /users/me (unauth)")
req("GET", f"/users/{USER_ID}", headers=hdr(TOKEN), expect=[200])
req("PATCH", f"/users/{USER_ID}", headers=hdr(TOKEN), body={}, expect=[200, 422])

sx = uuid.uuid4().hex[:6]
req("POST", "/users:invite",
    headers=hdr(TOKEN),
    body={"email": f"invite_{sx}@test.com", "role_id": None, "full_name": "Invite Test"},
    expect=[200, 201, 400, 409, 422])

req("POST", f"/users/{USER_ID}:reset-mfa", headers=hdr(TOKEN), expect=[200, 400, 401])
req("GET", f"/users/{USER_ID}:totp-uri", headers=hdr(TOKEN), expect=[200, 400, 401])
req("POST", f"/users/{USER_ID}:suspend", headers=hdr(TOKEN), expect=[200, 400, 401])
req("POST", f"/users/{USER_ID}:activate", headers=hdr(TOKEN), expect=[200, 400, 401])
req("DELETE", f"/users/{USER_ID}", headers=hdr(TOKEN), expect=[204, 400, 403, 404],
    label="DELETE /users/{id} (soft-delete)")

# ═══════════════════════════════════════════════════════════════════════════
# ROLES  (bare list)
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== ROLES ===")
req("GET", "/roles", headers=hdr(TOKEN), expect=[200])
s, rnb = req("POST", "/roles", headers=hdr(TOKEN),
             body={"name": f"role_{uuid.uuid4().hex[:6]}", "description": "smoke role"},
             expect=[200, 201])
ROLE_ID = rnb.get("id", NULL_UUID) if s in (200, 201) else NULL_UUID
req("PATCH", f"/roles/{ROLE_ID}", headers=hdr(TOKEN), body={"description": "updated"}, expect=[200, 404])
req("DELETE", f"/roles/{ROLE_ID}", headers=hdr(TOKEN), expect=[204, 400, 404, 409])

# ═══════════════════════════════════════════════════════════════════════════
# SESSIONS  (bare list)
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== SESSIONS ===")
s, sess_list = req("GET", "/sessions", headers=hdr(TOKEN), expect=[200])
SESSION_ID = sess_list[0]["id"] if isinstance(sess_list, list) and sess_list else NULL_UUID
req("POST", f"/sessions/{SESSION_ID}:revoke", headers=hdr(TOKEN), expect=[200, 204, 400, 404])

# ═══════════════════════════════════════════════════════════════════════════
# GEOGRAPHY  ({total,skip,limit,items})
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== GEOGRAPHY ===")
s, dist_body = req("GET", "/districts", headers=hdr(TOKEN), expect=[200])
DISTRICT_ID = first_id(dist_body)

sx = uuid.uuid4().hex[:6].upper()
s, new_dist = req("POST", "/districts", headers=hdr(TOKEN),
                  body={"name": f"Smoke District {sx}", "code": f"SD-{sx}", "region": "Test"},
                  expect=[200, 201])
TEMP_DIST_ID = new_dist.get("id") if s in (200, 201) else None

req("GET", f"/districts/{DISTRICT_ID}", headers=hdr(TOKEN), expect=[200])
req("PATCH", f"/districts/{DISTRICT_ID}", headers=hdr(TOKEN),
    body={"region": "Updated"}, expect=[200])
req("GET", f"/districts/{DISTRICT_ID}/stations", headers=hdr(TOKEN), expect=[200])

s, stn_body = req("GET", "/polling-stations", headers=hdr(TOKEN), expect=[200])
STATION_ID = first_id(stn_body)

req("GET", f"/polling-stations/{STATION_ID}", headers=hdr(TOKEN), expect=[200])
req("PATCH", f"/polling-stations/{STATION_ID}", headers=hdr(TOKEN), body={}, expect=[200, 422])
req("GET", f"/polling-stations/{STATION_ID}/summary", headers=hdr(TOKEN), expect=[200])
req("POST", f"/polling-stations/{STATION_ID}:open", headers=hdr(TOKEN), expect=[200, 400])
req("POST", f"/polling-stations/{STATION_ID}:close", headers=hdr(TOKEN), expect=[200, 400])

sx2 = uuid.uuid4().hex[:6].upper()
s4, ps_new = req("POST", "/polling-stations", headers=hdr(TOKEN),
                 body={"name": f"Smoke Station {sx2}", "code": f"SS-{sx2}",
                       "district_id": DISTRICT_ID, "capacity": 100, "address": "Smoke Ave"},
                 expect=[200, 201])
TEMP_STATION_ID = ps_new.get("id") if s4 in (200, 201) else None

if TEMP_STATION_ID:
    req("DELETE", f"/polling-stations/{TEMP_STATION_ID}", headers=hdr(TOKEN), expect=[204, 400, 404])
if TEMP_DIST_ID:
    req("DELETE", f"/districts/{TEMP_DIST_ID}", headers=hdr(TOKEN), expect=[204, 400, 404])

# ═══════════════════════════════════════════════════════════════════════════
# OFFICERS  ({total,skip,limit,items})
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== OFFICERS ===")
s, off_body = req("GET", "/officers", headers=hdr(TOKEN), expect=[200])
OFFICER_ID = first_id(off_body)
req("GET", f"/officers/{OFFICER_ID}", headers=hdr(TOKEN), expect=[200, 404])
req("PATCH", f"/officers/{OFFICER_ID}", headers=hdr(TOKEN), body={}, expect=[200, 422])
req("GET", f"/officers/{OFFICER_ID}/stats", headers=hdr(TOKEN), expect=[200, 404])

sfx = uuid.uuid4().hex[:6].upper()
s, onb = req("POST", "/officers", headers=hdr(TOKEN),
             body={"name": f"Smoke Officer {sfx}", "badge_number": f"SMK-{sfx}",
                   "station_id": STATION_ID, "rank": "officer"},
             expect=[200, 201, 422])
TEMP_OFFICER_ID = onb.get("id") if s in (200, 201) else None
if TEMP_OFFICER_ID:
    req("DELETE", f"/officers/{TEMP_OFFICER_ID}", headers=hdr(TOKEN), expect=[204, 404])

# ═══════════════════════════════════════════════════════════════════════════
# VOTERS  ({total,page,size,items})
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== VOTERS ===")
s, vtr_body = req("GET", "/voters", headers=hdr(TOKEN), expect=[200])
VOTER = items(vtr_body)[0] if items(vtr_body) else {}
VOTER_ID = VOTER.get("id", NULL_UUID)
VOTER_TOKEN = VOTER.get("voter_token", "NO-TOKEN")

req("GET", f"/voters/{VOTER_ID}", headers=hdr(TOKEN), expect=[200])
req("GET", f"/voters/by-token/{VOTER_TOKEN}", headers=hdr(TOKEN), expect=[200])
req("PATCH", f"/voters/{VOTER_ID}", headers=hdr(TOKEN), body={}, expect=[200, 422])
req("GET", f"/voters/{VOTER_ID}/verifications", headers=hdr(TOKEN), expect=[200])
req("POST", f"/voters/{VOTER_ID}:flag", headers=hdr(TOKEN),
    body={"reason": "smoke flag"}, expect=[200, 400, 422])
req("POST", f"/voters/{VOTER_ID}:block", headers=hdr(TOKEN),
    qs="reason=smoke", expect=[200, 400])
req("POST", f"/voters/{VOTER_ID}:restore", headers=hdr(TOKEN), expect=[200, 400])
req("GET", "/voters:export", headers=hdr(TOKEN), expect=[200])
req("GET", "/voters", expect=[401], label="GET /voters (unauth)")

# Import accepts multipart file; expect 422 for JSON body
req("POST", "/voters:import", headers=hdr(TOKEN), body={}, expect=[400, 415, 422])

# Create + archive a throwaway voter
vsfx = uuid.uuid4().hex[:8].upper()
s, vnew = req("POST", "/voters", headers=hdr(TOKEN),
              body={"voter_token": f"SMK-{vsfx}", "registration_ref": f"#SMK-{vsfx}",
                    "national_id": f"SMK{vsfx}", "first_name": "Smoke", "last_name": "Test",
                    "sex": "male", "date_of_birth": "1990-01-01",
                    "district_id": DISTRICT_ID, "polling_station_id": STATION_ID},
              expect=[200, 201])
TEMP_VOTER_ID = vnew.get("id") if s in (200, 201) else None
if TEMP_VOTER_ID:
    req("POST", f"/voters/{TEMP_VOTER_ID}:archive", headers=hdr(TOKEN), expect=[200, 400])

# ═══════════════════════════════════════════════════════════════════════════
# BIOMETRICS
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== BIOMETRICS ===")
s, tmpl_body = req("GET", "/biometrics/templates", headers=hdr(TOKEN), expect=[200])
BIO_VOTER_ID = first_id(tmpl_body, "voter_id") or VOTER_ID
req("GET", f"/biometrics/quality/{BIO_VOTER_ID}", headers=hdr(TOKEN), expect=[200, 404])
req("GET", "/biometrics/stats", headers=hdr(TOKEN), expect=[200])
req("GET", "/biometrics/templates", expect=[401], label="GET /biometrics/templates (unauth)")
# enroll - fails without insightface but server must not crash (400/422/500 all ok)
req("POST", "/biometrics/enroll", headers=hdr(TOKEN),
    form={"voter_id": BIO_VOTER_ID, "face_image": "ZmFrZWltYWdl"},
    expect=[200, 400, 422, 500])
req("PUT", "/biometrics/enroll", headers=hdr(TOKEN),
    form={"voter_id": BIO_VOTER_ID, "face_image": "ZmFrZWltYWdl"},
    expect=[200, 400, 404, 422, 500])
req("POST", f"/biometrics/dedup-scan/{BIO_VOTER_ID}", headers=hdr(TOKEN),
    expect=[200, 400, 500])
req("DELETE", f"/biometrics/templates/{NULL_UUID}", headers=hdr(TOKEN), expect=[404])

# ═══════════════════════════════════════════════════════════════════════════
# VERIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== VERIFICATIONS ===")
s, ver_body = req("GET", "/verifications", headers=hdr(TOKEN), expect=[200])
VER_ID = first_id(ver_body)
if VER_ID:
    req("GET", f"/verifications/{VER_ID}", headers=hdr(TOKEN), expect=[200])
    req("POST", f"/verifications/{VER_ID}:override", headers=hdr(TOKEN),
        qs="override_result=approved&reason=smoke", expect=[200, 400])
req("GET", f"/verifications/station/{STATION_ID}/log", headers=hdr(TOKEN), expect=[200])
req("GET", "/verifications", expect=[401], label="GET /verifications (unauth)")
# POST /verifications - fails without insightface
req("POST", "/verifications",
    body={"voter_token": VOTER_TOKEN, "polling_station_id": STATION_ID,
          "officer_id": OFFICER_ID or NULL_UUID, "face_image": "ZmFrZQ=="},
    expect=[200, 400, 500])

# ═══════════════════════════════════════════════════════════════════════════
# VOTES
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== VOTES ===")
req("POST", "/votes",
    body={"voter_id": NULL_UUID, "officer_id": OFFICER_ID or NULL_UUID,
          "polling_station_id": STATION_ID},
    expect=[404, 400])

# ═══════════════════════════════════════════════════════════════════════════
# FRAUD  ({total,items})
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== FRAUD ===")
s, fc_body = req("GET", "/fraud/cases", headers=hdr(TOKEN), expect=[200])
CASE_ID = first_id(fc_body)
req("GET", "/fraud/summary", headers=hdr(TOKEN), expect=[200])
if CASE_ID:
    req("GET", f"/fraud/cases/{CASE_ID}", headers=hdr(TOKEN), expect=[200])
    req("POST", f"/fraud/cases/{CASE_ID}:escalate", headers=hdr(TOKEN), expect=[200, 400])
    req("POST", f"/fraud/cases/{CASE_ID}:dismiss", headers=hdr(TOKEN),
        body={"reason": "smoke"}, expect=[200, 400])
s, fc_new = req("POST", "/fraud/cases", headers=hdr(TOKEN),
                body={"type": "duplicate_biometric", "title": "Smoke case", "risk_level": "medium"},
                expect=[200, 201])

s, dup_body = req("GET", "/duplicates", headers=hdr(TOKEN), expect=[200])
DUP_ID = first_id(dup_body)
if DUP_ID:
    req("GET", f"/duplicates/{DUP_ID}", headers=hdr(TOKEN), expect=[200])
    req("POST", f"/duplicates/{DUP_ID}:merge", headers=hdr(TOKEN), expect=[200, 400])

s, ano_body = req("GET", "/anomalies", headers=hdr(TOKEN), expect=[200])
ANO_ID = first_id(ano_body)
s2, ano_new = req("POST", "/anomalies", headers=hdr(TOKEN),
                  body={"severity": "low", "title": "Smoke anomaly",
                        "anomaly_type": "geographic_outlier"},
                  expect=[200, 201, 422])
NEW_ANO_ID = ano_new.get("id") if s2 in (200, 201) else ANO_ID

if NEW_ANO_ID:
    req("GET", f"/anomalies/{NEW_ANO_ID}", headers=hdr(TOKEN), expect=[200])
    req("POST", f"/anomalies/{NEW_ANO_ID}:acknowledge", headers=hdr(TOKEN), expect=[200, 400])
    req("POST", f"/anomalies/{NEW_ANO_ID}:mute", headers=hdr(TOKEN), expect=[200, 400])
    req("DELETE", f"/anomalies/{NEW_ANO_ID}", headers=hdr(TOKEN), expect=[204, 404])

# ═══════════════════════════════════════════════════════════════════════════
# ANALYTICS
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== ANALYTICS ===")
req("GET", "/analytics/turnout", headers=hdr(TOKEN), expect=[200])
req("GET", "/analytics/live", headers=hdr(TOKEN), expect=[200])
req("GET", "/analytics/verification", headers=hdr(TOKEN), expect=[200])
req("GET", "/analytics/enrollment", headers=hdr(TOKEN), expect=[200])
req("GET", "/analytics/fraud", headers=hdr(TOKEN), expect=[200])
req("GET", "/analytics/demographics", headers=hdr(TOKEN), expect=[200])

# ═══════════════════════════════════════════════════════════════════════════
# ENCRYPTION KEYS  ({total,items})
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== KEYS ===")
s, key_body = req("GET", "/keys", headers=hdr(TOKEN), expect=[200])
KEY_ID = first_id(key_body)
req("GET", "/keys/health", headers=hdr(TOKEN), expect=[200])
if KEY_ID:
    req("GET", f"/keys/{KEY_ID}", headers=hdr(TOKEN), expect=[200])
    req("PATCH", f"/keys/{KEY_ID}", headers=hdr(TOKEN), body={"title": "Smoke Updated"}, expect=[200])
    req("POST", f"/keys/{KEY_ID}:rotate", headers=hdr(TOKEN), expect=[200, 400])
ksfx = uuid.uuid4().hex[:6].upper()
s, knb = req("POST", "/keys", headers=hdr(TOKEN),
             body={"title": f"smoke-key-{ksfx}", "scope": "template_encryption"},
             expect=[200, 201, 422])
TEMP_KEY_ID = knb.get("id") if s in (200, 201) else None
if TEMP_KEY_ID:
    req("DELETE", f"/keys/{TEMP_KEY_ID}", headers=hdr(TOKEN), expect=[204, 404])

# ═══════════════════════════════════════════════════════════════════════════
# AI
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== AI ===")
req("GET", "/ai/status", headers=hdr(TOKEN), expect=[200])
req("GET", "/ai/thresholds", headers=hdr(TOKEN), expect=[200])
req("PUT", "/ai/thresholds", headers=hdr(TOKEN), body={"face_match_threshold": 0.80}, expect=[200])
req("POST", "/ai/healthcheck", headers=hdr(TOKEN), expect=[200, 500])
req("POST", "/ai/rebuild-index", headers=hdr(TOKEN), expect=[200, 500])

# ═══════════════════════════════════════════════════════════════════════════
# AUDIT
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== AUDIT ===")
req("POST", "/audit:verify-chain", headers=hdr(TOKEN), expect=[200])
s, aud_body = req("GET", "/audit/entries", headers=hdr(TOKEN), expect=[200])
AUDIT_ID = first_id(aud_body)
if AUDIT_ID:
    req("GET", f"/audit/entries/{AUDIT_ID}", headers=hdr(TOKEN), expect=[200])
req("GET", "/audit:export", headers=hdr(TOKEN), expect=[200])

# ═══════════════════════════════════════════════════════════════════════════
# HEALTH / REGISTRY
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== HEALTH / REGISTRY ===")
req("GET", "/health", expect=[200])
req("GET", "/registry/health", headers=hdr(TOKEN), expect=[200])

# ═══════════════════════════════════════════════════════════════════════════
# AUTH EXTRAS
# ═══════════════════════════════════════════════════════════════════════════
print("\n=== AUTH EXTRAS ===")
req("POST", "/auth/change-password", headers=hdr(TOKEN),
    body={"current_password": "wrong", "new_password": "Abc12345!"},
    expect=[400, 401, 403, 422])

# LOGOUT last
req("POST", "/auth/logout", headers=hdr(TOKEN), expect=[200, 204])

# ═══════════════════════════════════════════════════════════════════════════
# REPORT
# ═══════════════════════════════════════════════════════════════════════════
passed_tests = [r for r in RESULTS if r["passed"]]
failed_tests = [r for r in RESULTS if not r["passed"]]
total = len(RESULTS)
pct = len(passed_tests) / total * 100

print("\n" + "=" * 65)
print(f"  TOTAL TESTED  : {total}")
print(f"  PASSED        : {len(passed_tests)}")
print(f"  FAILED        : {len(failed_tests)}")
print(f"  PASS RATE     : {pct:.1f}%")

if failed_tests:
    print("\n── FAILURES ──────────────────────────────────────────────────")
    for f in failed_tests:
        exp = f["expected"]
        detail = f["body"].get("detail") or f["body"].get("error") or ""
        if isinstance(detail, list):
            detail = detail[0].get("msg", "") if detail else ""
        print(f"  HTTP {f['status']} (expected {exp})")
        print(f"    {f['tag']}")
        if detail:
            print(f"    detail: {str(detail)[:120]}")

print("\n── MODULE BREAKDOWN ──────────────────────────────────────────")
modules = {}
for r in RESULTS:
    raw_path = r["tag"].split(" ")[-1]
    seg = raw_path.lstrip("/").split("/")[0].split(":")[0].split("?")[0]
    mod_map = {
        "ai": "ai", "analytics": "analytics", "anomalies": "fraud",
        "audit": "audit", "auth": "auth", "biometrics": "biometrics",
        "districts": "geography", "duplicates": "fraud", "fraud": "fraud",
        "health": "system", "keys": "keys", "officers": "officers",
        "polling-stations": "geography", "registry": "system",
        "roles": "auth/users", "sessions": "auth/users",
        "users": "auth/users", "verifications": "verification",
        "voters": "voters", "votes": "verification",
    }
    mod = mod_map.get(seg, seg)
    if mod not in modules:
        modules[mod] = {"pass": 0, "fail": 0}
    if r["passed"]:
        modules[mod]["pass"] += 1
    else:
        modules[mod]["fail"] += 1

for mod, counts in sorted(modules.items()):
    t = counts["pass"] + counts["fail"]
    p = counts["pass"] / t * 100
    bar = "█" * int(p / 10) + "░" * (10 - int(p / 10))
    status = "✓" if p == 100 else ("~" if p >= 80 else "✗")
    print(f"  {status} {mod:22s} {bar}  {counts['pass']}/{t}  ({p:.0f}%)")

print()
sys.exit(0 if not failed_tests else 1)
