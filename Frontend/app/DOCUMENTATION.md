# SecurePoll RW — Frontend Documentation

Complete reference for the SecurePoll RW web frontend: a React single-page app that
implements the four product surfaces of the biometric voter-verification platform and
integrates **every** endpoint of the FastAPI backend.

- **Location:** `SecurePoll-RW/Frontend/app`
- **Backend:** FastAPI on `http://localhost:8000` (synthetic AI backend by default)
- **Author:** Ashimwe Geoffrey — Final Year Project, NEC Rwanda (simulated)

---

## 1. Architecture overview

```
Browser (SPA, :5173)
   │  fetch /api/*           ← same-origin, no CORS
   ▼
Vite dev server  ──proxy──▶  FastAPI backend (:8000)  ──▶  Supabase Postgres
                                     │
                                     └─ ml/ (ArcFace embeddings, FAISS 1:N, liveness)
```

- **Single SPA, four surfaces** behind one React Router tree (`src/App.jsx`):
  `/` landing · `/login` · `/admin/*` · `/kiosk` · `/register` · `/portal/*`.
- **One integration layer** (`src/api/`) wraps all 106 backend operations; every page
  consumes it through the `useApi` / `usePoll` hooks.
- **Design system ported verbatim** from the mockups: tokens in `src/styles/tokens/`,
  primitives in `src/components/`.

### Tech stack
| Concern | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | react-router-dom 6 |
| Charts | recharts |
| Icons | lucide-react |
| Styling | Plain CSS + design-system CSS variables (no CSS framework) |
| State | React hooks + Context (auth, toasts); no Redux |

---

## 2. Directory structure

```
src/
├─ main.jsx                 App bootstrap: Router + ToastProvider + AuthProvider
├─ App.jsx                  Route table + RequireAuth guard
├─ api/
│  ├─ client.js             fetch wrapper: Bearer inject, 401 handling, CSV download
│  └─ endpoints.js          All 106 endpoints grouped by domain
├─ auth/
│  └─ AuthContext.jsx       login → MFA → token, current user, role/permissions
├─ lib/
│  ├─ useApi.js             useApi() data hook + usePoll() interval hook
│  ├─ useLookups.js         cached districts/stations/officers maps
│  ├─ list.js               normalizes the backend's list-envelope shapes
│  ├─ format.js             dates, scores, %, PII masking, status→tone
│  └─ toast.jsx             toast notifications
├─ components/              Design-system primitives + app UI
│  ├─ Button, Badge, Card, Input, Select, ConfidenceMeter, DecisionPanel  (ported)
│  ├─ Brand.jsx, StatusBadge                                              (brand)
│  ├─ BiometricCapture.jsx  webcam + file-upload face capture → base64
│  └─ ui.jsx                Modal, ConfirmDialog, Textarea, StatCard, Tabs,
│                           Pagination, Empty, Loading, ErrorState, Avatar, Toolbar
├─ styles/
│  ├─ index.css             global stylesheet + utility classes (.sp-*)
│  └─ tokens/               colors, typography, spacing, elevation, motion, fonts, base
└─ surfaces/
   ├─ Landing.jsx
   ├─ admin/                Login.jsx, AdminLayout.jsx, pages/*
   ├─ kiosk/Kiosk.jsx
   ├─ registration/Registration.jsx
   └─ portal/               PortalLayout, PortalHome, CheckStatus, ReportIncident,
                            ObserverDashboard
```

---

## 3. Authentication & authorization

### Login flow (`AuthContext`)
1. `POST /auth/login {email,password}` → if `mfa_required`, the *partial* token is stored
   under `sp.partialToken` and the UI shows the 6-digit TOTP step.
2. `POST /auth/mfa {code}` (sent with the partial token) → full JWT stored under `sp.token`.
3. `GET /users/me` + `GET /roles` populate the session; the app redirects to `/admin`
   (or the originally-requested route).
4. `POST /auth/refresh` / `POST /auth/logout` supported; a global **401 handler** clears
   the session and bounces to `/login`.

### RBAC (role-based access)
- The signed-in user's `role_id` is matched against `/roles` to resolve a permission set
  (`registry, verify, fraud, audit, users, keys`). `super` implicitly holds all.
- The admin sidebar **hides** modules the role can't access. Verified: an `observer`-role
  user sees only Dashboard, Geography, Reporting, AI — registry/verify/fraud/audit/users/keys
  are hidden.

### Token storage
`localStorage`: `sp.token` (full), `sp.partialToken` (pre-MFA). Kiosk/registration device
config lives in `sp.kiosk.cfg` / `sp.reg.cfg`.

---

## 4. API integration layer

`src/api/client.js`
- `http.get/post/put/patch/del(path, {body, query, form, multipart, auth})`.
- Injects `Authorization: Bearer <token>` unless `auth:false`; `auth:"partial"` uses the
  pre-MFA token (for `/auth/mfa`).
- `form` → `application/x-www-form-urlencoded` (biometric enrol/verify); `multipart` →
  `FormData` (CSV import).
- Normalizes FastAPI errors (`{detail}` string or validation array) into `ApiError`.
- `download(path, query, filename)` streams CSV exports to a browser download.

`src/api/endpoints.js` — domain modules: `auth, users, roles, sessions, districts,
stations, officers, voters, registry, biometrics, verification, votes, fraud, duplicates,
anomalies, audit, analytics, keys, ai, system`.

---

## 5. Surfaces & endpoint map

### `/login` — Admin sign-in
`/auth/login`, `/auth/mfa` (+ `/users/me`, `/roles` on success).

### `/admin/*` — Admin & Audit console (`AdminLayout` + sidebar)
| Page | Route | Endpoints |
|---|---|---|
| Dashboard | `/admin/dashboard` | `/analytics/live`, `/analytics/verification`, `/analytics/demographics`, `/analytics/fraud` (30s poll) |
| Verification | `/admin/verification` | `/verifications`, `/verifications/{id}:override`, `/analytics/verification`, `/ai/thresholds` |
| Fraud detection | `/admin/fraud` | `/fraud/cases`(+`{id}`,`:dismiss`,`:escalate`), `/duplicates`(+`:merge`), `/anomalies`(+`:acknowledge`,`:mute`), `/analytics/fraud` |
| Voter registry | `/admin/registry` | `/voters`(list/get/create/update), `:block/:flag/:archive/:restore`, `:import`, `:export`, `/registry/health`, `/voters/{id}/verifications`, `/biometrics/*` |
| Geography & ops | `/admin/geography` | `/districts`(CRUD), `/polling-stations`(CRUD,`:open`,`:close`), `/officers`(CRUD,`/stats`) |
| Audit log | `/admin/audit` | `/audit/entries`(+`{id}`), `/audit:verify-chain`, `/audit:export` |
| Reporting | `/admin/reporting` | `/analytics/turnout`, `/analytics/demographics`, `/analytics/verification`, `/analytics/enrollment`, exports |
| AI & models | `/admin/ai` | `/ai/status`, `/ai/thresholds`(GET/PUT), `/ai/rebuild-index`, `/ai/healthcheck` |
| Users & roles | `/admin/users` | `/users`(list/invite/update/:activate/:suspend/:reset-mfa/:totp-uri/delete), `/roles`(CRUD), `/sessions`(+`:revoke`) |
| Encryption | `/admin/encryption` | `/keys`(CRUD,`:rotate`), `/keys/health` |
| Account & settings | `/admin/settings` | `/users/me`, `/users/{id}` (PATCH), `/auth/change-password`, `/auth/logout` |

### `/kiosk` — Polling-station kiosk (dark theme, officer JWT)
Setup binds station + officer → `GET /voters/by-token/{token}` → `POST /verifications`
→ `DecisionPanel` → `POST /votes` (double-vote-protected, handles 409).

### `/register` — Field registration wizard (officer JWT)
Details (`POST /voters`) → Biometrics (`POST /biometrics/enroll`) →
Dedup (`POST /biometrics/dedup-scan/{id}`) → Issue token.

### `/portal/*` — Citizen & observer portal
Rebuilt to match the design-system mock 1:1 (each page carries its own nav; ported
`portal.css` + `pages.css`). All portal pages are **full-bleed / full-screen** (no fixed
1280px cap) and responsive. **No placeholder data**: components that have no real data
available (e.g. the public Live-turnout band for anonymous visitors) are hidden rather than
shown with dashes; the mock's illustrative map and "nearby stations" rows were removed since
the backend has no geolocation/proximity data.
- **`/portal`** — PublicPortal landing: marketing nav (Check status · Report an incident ·
  lang toggle · Admin/Observer login), hero with an inline **status lookup**
  (`GET /voters/by-token/{token}`), **Live turnout** band (`GET /analytics/live`, 30s),
  two feature cards (find station / report incident), dark footer (Law 058/2021).
  Auth-gated data degrades gracefully for anonymous visitors.
- **`/portal/status`** — Check status: "private lookup" assurance, token lookup, a
  **registration detail grid** + a **voting-status timeline** driven by the live voter status.
- **`/portal/incident`** — Report incident: "you are anonymous" assurance, Incident-details +
  Stay-reachable cards, evidence dropzone, then a tracking-reference success screen
  (client-side ref — no backend route, see §8).
- **`/portal/observer-login`** — dedicated split-screen observer sign-in (brand panel +
  form), wired to `AuthContext.login` (observer accounts are one-step, no MFA).
- **`/portal/observer-register`** — accreditation request form → "Request received" with an
  application reference (client-side; mirrors the NEC review workflow — no backend route).
- **`/portal/observer`** — Election transparency dashboard (gated on a signed-in observer):
  read-only KPIs, **turnout-by-district** bars (aggregated from `/analytics/live` via the
  station→district lookup), **station-status donut**, **public audit trail**
  (`GET /audit/entries`), authentication outcomes (`GET /analytics/verification`), and chain
  integrity (`POST /audit:verify-chain`).

---

## 6. Components

**Ported design-system primitives** (self-inject scoped CSS): `Button`, `Badge`, `Card`,
`Input`, `Select`, `ConfidenceMeter`, `DecisionPanel`.

**App UI** (`ui.jsx`): `Modal`, `ConfirmDialog`, `Textarea`, `StatCard`, `Tabs`,
`Pagination`, `Empty`, `Loading`, `ErrorState`, `Avatar`, `Toolbar`.

**Loading overlay** (`Loader.jsx`): the design system's Imigongo loader — black-and-white
diamond tiles converge into the Ingabo shield emblem with the "SECUREPOLL RW" wordmark and
three pulsing diamond dots (ported from the design's `loader.js`/`loader.css`). `RouteLoader`
is mounted once in `App.jsx` and shows the overlay for **5 seconds** on first load and on
every route/page change (and therefore through the login → dashboard transition). Tune the
duration via the `LOADER_MS` constant in `Loader.jsx`.

**Domain components:** `Brand` (logo lockup), `StatusBadge` (status→tone), `BiometricCapture`
(webcam capture or file upload → bare base64; mirrored video, oval guide; the upload path is
the reliable way to reproduce identical bytes for a synthetic-backend match).

---

## 7. Design system

Tokens copied verbatim (`src/styles/tokens/`): warm-slate canvas, **electoral green**
primary, civic-blue secondary, strict status semantics (green=approved, amber=review,
red=rejected). Fonts: **Zilla Slab** (display), **Hanken Grotesk** (UI), **JetBrains Mono**
(numbers/IDs/hashes). Dark theme (`[data-theme="dark"]`) powers the kiosk.

---

## 8. Running & configuration

```bash
# Backend (must be on :8000)
cd SecurePoll-RW/Backend
.venv/bin/uvicorn app.main:app --port 8000

# Frontend
cd SecurePoll-RW/Frontend/app
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
```

- Proxy target overridable with `VITE_BACKEND_URL` (default `http://localhost:8000`).
- Backend `.env`: `AI_BACKEND=synthetic`, `LIVENESS_BACKEND=passive`, `CORS_ORIGINS=*`,
  `RATE_LIMIT_PER_MINUTE=0`.
- **bcrypt pin:** `Backend/pyproject.toml` pins `bcrypt>=4.0,<4.1` — passlib 1.7.4 breaks on
  bcrypt 4.1+/5.x and every login returns 500 otherwise.

### Demo accounts
| Email | Password | Role | MFA |
|---|---|---|---|
| `admin@securepoll.rw` | `SecurePassword123!` | Super Admin | **Yes (TOTP)** |
| `obs.test@nec.gov.rw` | `ObserverPass123!` | Observer | No (one-step) |

Admin login needs a 6-digit TOTP. Add the account's seeded secret to an authenticator,
re-provision it from **Users & roles → reset MFA** (shows the `otpauth://` URI), or compute
the current code server-side:
```bash
cd Backend && .venv/bin/python -c "import pyotp;from app.core.db import SessionLocal;from sqlalchemy import text;\
print(pyotp.TOTP(SessionLocal().execute(text(\"select totp_secret from admin_users where email='admin@securepoll.rw'\")).scalar()).now())"
```

---

## 9. Verification results (this test pass)

All checked against the live backend with **zero console errors**; production build green
(2425 modules).

| Area | Result |
|---|---|
| Admin login + **2FA** | ✅ Real UI: email/password → TOTP step (6 boxes) → full token → `/admin/dashboard` |
| Integrated auth / RBAC | ✅ `/users/me` + `/roles` drive the session; observer role correctly hides 6 modules |
| Observer login + dashboard | ✅ One-step (no MFA) login; live aggregated stats (70% turnout, 85.1% approval) |
| **Biometric verification** | ✅ Enrol face (200, liveness passed) → kiosk verify same face → **APPROVED 1.00** → grant ballot → DB `voted` → 2nd vote **blocked (409)** |
| Liveness anti-spoof | ✅ Flat image correctly rejected `400 spoof detected`; textured image passes |
| Public portal | ✅ Home, check-status (by-token, PII-minimized), report-incident (tracking ref), observer dashboard |
| Endpoint connectivity | ✅ 27/27 GET endpoints reachable through the `/api` proxy with auth (`/keys/health` ~9s but 200) |
| Pages render live data | ✅ Dashboard, Registry (+VoterDetail/Biometrics), Geography (49 districts), Audit (+entry modal), Fraud (102 open cases), Users (74 users), Reporting, AI, Encryption |

---

## 10. Known gaps & notes

- **No public backend routes.** The backend exposes no `/public/*` or `/observers` endpoints:
  - *Check status* uses authenticated `/voters/by-token/{token}` (staff-assisted lookup).
  - *Report incident* generates a **client-side** tracking reference — wire to
    `POST /public/incidents` if/when the backend adds it.
  - *Observer dashboard* reuses the authenticated `/analytics/*` endpoints.
- **Synthetic AI backend** embeds `sha256(image_bytes)`, so a 1:1 match needs the *same image
  bytes* at enrol and verify. Use the capture widget's **Upload image** with the same file for
  a guaranteed APPROVED demo. (Switch `AI_BACKEND=insightface` for real face recognition.)
- **`/keys/health` is slow (~9s)** — it enumerates every key version; the Encryption page shows
  a loading state meanwhile.
- **Verification override** requires an admin JWT; the kiosk (officer device) shows the
  manual-review verdict and defers to a supervisor rather than overriding inline.
- **Recharts bundle** is large (~760 KB) — acceptable for an internal console; code-split if
  a lighter initial load is needed.
