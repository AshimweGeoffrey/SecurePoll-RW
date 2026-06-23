# SecurePoll RW — Frontend

React (Vite) single-page app for the SecurePoll RW biometric voter-verification
platform. It implements the four product surfaces from the design system and wires
them to **every** endpoint of the FastAPI backend (106 operations).

## Stack
- **React 18 + Vite 5**, React Router 6
- **Recharts** for analytics, **lucide-react** icons
- Design-system tokens copied verbatim from `../SecurePoll RW Design System (2)/tokens`
- No component library — the design-system primitives (Button, Card, Badge, Input,
  Select, ConfidenceMeter, DecisionPanel) are ported into `src/components/`.

## Run

```bash
# 1. Start the backend (from Backend/) — must be on :8000
cd ../../Backend && .venv/bin/uvicorn app.main:app --port 8000

# 2. Start the frontend
cd Frontend/app
npm install
npm run dev          # http://localhost:5173
```

Vite proxies `/api/*` → `http://localhost:8000` (configurable via `VITE_BACKEND_URL`),
so there are no CORS or base-URL concerns.

## Surfaces (routes)
| Route | Surface | Auth |
|---|---|---|
| `/` | Landing / surface chooser | public |
| `/login` | Admin sign-in (email + password → **TOTP 2FA**) | public |
| `/admin/*` | Admin & Audit console | JWT (role-scoped) |
| `/kiosk` | Polling-station verification kiosk (dark theme) | officer JWT |
| `/register` | Field registration wizard | officer JWT |
| `/portal/*` | Citizen status, incident report, observer dashboard | mixed |

### Admin console pages → endpoints
- **Dashboard / Reporting** → `/analytics/*`
- **Registry** → `/voters*`, `/registry/health`, `/biometrics/*` (enrol, quality, dedup, delete)
- **Verification** → `/verifications*` (+ `:override`)
- **Fraud** → `/fraud/*`, `/duplicates*`, `/anomalies*`
- **Audit** → `/audit/entries`, `:verify-chain`, `:export`
- **Geography & ops** → `/districts*`, `/polling-stations*` (+ open/close), `/officers*` (+ stats)
- **AI & models** → `/ai/*` (status, thresholds, rebuild-index, healthcheck)
- **Users & roles** → `/users*`, `/roles*`, `/sessions*`
- **Encryption** → `/keys*` (+ rotate, health)
- **Account** → `/users/me`, `/auth/change-password`, `/auth/logout`

## Demo login
Seeded super-admin: **`admin@securepoll.rw` / `SecurePassword123!`** (MFA **enabled**).
The login flow requires a 6-digit TOTP. To get a code, add the account's TOTP secret
to an authenticator app, or reset/re-provision it from **Users & roles → reset MFA**
(shows the `otpauth://` URI). For development you can also compute the current code
from the seeded secret server-side.

## Notes / known gaps
- **Public portal endpoints** (`/public/voter-status`, `/public/incidents`, `/observers`)
  described in the design's data model are **not implemented in the backend**.
  - *Check status* uses the authenticated `/voters/by-token/{token}` (staff-assisted).
  - *Report incident* captures a client-side tracking reference (wire to
    `POST /public/incidents` when the backend adds it).
  - *Observer dashboard* uses the live aggregated `/analytics/*` endpoints (read-only),
    gated on a signed-in observer-role account.
- With the backend's **synthetic** AI backend, a 1:1 face match requires the *same
  image bytes* used at enrolment — use the capture widget's "Upload image" with the
  same file for a guaranteed APPROVED demo.
