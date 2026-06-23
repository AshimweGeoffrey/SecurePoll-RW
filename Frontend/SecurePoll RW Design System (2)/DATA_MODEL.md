# SecurePoll RW — Backend Data Model

**Derived from the design mockups in this design system.**
This document specifies every domain object represented in the UI, the fields the
screens actually read/write, suggested types, enumerations, relationships, and the
API surface implied by the interactive modals. It is the contract the backend should
implement so the existing front-end can be wired to live data with minimal change.

> Conventions
> - Types use a language-neutral notation: `string`, `int`, `decimal`, `bool`, `datetime` (ISO-8601 UTC), `date`, `uuid`, `enum`, `json`.
> - `PK` = primary key, `FK` = foreign key. All tables get `created_at`, `updated_at` (datetime) unless noted.
> - **Scores** (face, fingerprint, similarity) are `decimal(4,3)` in `0.000–1.000`.
> - The UI today shows formatted/abbreviated values (e.g. `"+250 7•• ••• 142"`, `"14:41 today"`). The backend should store **canonical** values (full E.164 phone, real datetimes) and let the client format.
> - Money/PII handling: National ID, biometrics, phone are PII — see §15 Security.

---

## 1. Voter

The central record. Appears in the Registry (`RegistryView`), the polling kiosk roster (`PollingKiosk`), and citizen status lookup (`check-status`).

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `voter_token` | string | Public scan/lookup token, e.g. `RW-2026-0F3A-91C7` (kiosk QR). Unique, non-sequential |
| `registration_ref` | string | Human ref shown as `#18992`. Unique |
| `national_id` | string(16) | Rwanda NID, 16 digits. Unique, encrypted at rest |
| `first_name` | string | |
| `last_name` | string | |
| `sex` | enum | `male`, `female` |
| `date_of_birth` | date | |
| `phone` | string | E.164, e.g. `+2507xxxxxxxx`. Optional, PII-masked in UI |
| `district_id` | FK→District | |
| `polling_station_id` | FK→PollingStation | Assigned station |
| `roll_position` | int | Position on certified roll (`00482`) |
| `status` | enum | `registered`, `voted`, `flagged`, `blocked`, `archived` |
| `enrolled_at` | datetime | Field enrollment timestamp |
| `enrolled_by_officer_id` | FK→FieldOfficer | |
| `enrollment_location` | geopoint | GPS captured at enrollment (lat/lon, accuracy m) |
| `data_quality_score` | int | 0–100 (`quality` in UI) |
| `last_activity_at` | datetime | Drives "Last activity" / "Voted · 14:41" |
| `last_verified_at` | datetime | |

**Derived / joined for display:** `full_name`, `age`, `biometrics_complete` (bool from BiometricTemplate presence), `district.name`, `station.code`.

**Status enum semantics**
- `registered` — on certified roll, not yet voted.
- `voted` — ballot cast (set by kiosk verification flow, row-locked write).
- `flagged` — under dedup/fraud review (cannot vote until resolved).
- `blocked` — barred from verification (fraud/court order); roll position retained.
- `archived` — removed from active roll, never deleted; restorable.

---

## 2. BiometricTemplate

One per modality per voter. Never exposed raw to the client — only presence + quality + match scores.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `voter_id` | FK→Voter | |
| `modality` | enum | `face`, `fingerprint` |
| `template_blob` | bytes | Encrypted (AES-256-GCM), HSM-wrapped key. **Never** returned by API |
| `quality_score` | decimal | 0–1 capture quality |
| `liveness_passed` | bool | |
| `captured_at` | datetime | |
| `captured_by_officer_id` | FK→FieldOfficer | |
| `device_id` | string | e.g. `cam-02` |
| `key_id` | FK→EncryptionKey | Which key wraps this template |

UI usage: Registry shows `biom: { face: bool, print: bool }`; fraud/kiosk show match scores (see VerificationAttempt).

---

## 3. District & PollingStation

### District (30 — Rwanda ADM2; map uses geoBoundaries gbOpen)
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `code` | string | |
| `name` | string | e.g. `Gasabo` |
| `province` | enum | `Kigali City`, `Northern`, `Southern`, `Eastern`, `Western` |
| `boundary_ref` | string | geoBoundaries shapeName for choropleth join |

### PollingStation
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `code` | string | e.g. `PS-014`. Unique |
| `name` | string | `PS-014 · Nyarugenge` |
| `district_id` | FK→District | |
| `geopoint` | geopoint | lat/lon |
| `opens_at` / `closes_at` | time | `06:00` / `18:00` |
| `status` | enum | `online`, `syncing`, `not_open`, `offline` |
| `registered_count` | int | |
| `verified_today` | int | |

---

## 4. VerificationAttempt

Every biometric check at a kiosk (`PollingKiosk`) and the live verification feed. Feeds the kiosk decision panel (`DecisionPanel` component).

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `voter_id` | FK→Voter | Nullable if no match |
| `polling_station_id` | FK→PollingStation | |
| `officer_id` | FK→FieldOfficer | Officer operating kiosk |
| `device_id` | string | |
| `result` | enum | `approved`, `manual_review`, `rejected` |
| `confidence` | decimal | Overall 0–1 (`0.91`) |
| `face_score` | decimal | |
| `fingerprint_score` | decimal | |
| `liveness` | enum | `live`, `spoof`, `failed` |
| `review_required` | bool | |
| `explanation` | string | Human-readable AI summary |
| `flags` | string[] | e.g. `["Possible impersonation"]` |
| `created_at` | datetime | |

**DecisionPanel contract** (component `DecisionPanel.d.ts`): `{ decision, confidence, breakdown: {label→value}, explanation, flags[], reviewRequired }`. `breakdown` values are either decimals or labels (`"LIVE"`, `"EXACT"`).

---

## 5. FraudCase

`FraudView` + `CaseEvidenceModal`. AI-flagged investigation items.

| Field | Type | Notes |
|---|---|---|
| `id` | string | PK, e.g. `FR-4471` |
| `type` | enum | `Impersonation`, `Duplicate`, `Forgery`, `Anomaly` |
| `title` | string | |
| `risk_level` | enum | `critical` (red), `review` (amber/neutral) |
| `score` | decimal\|string | Primary metric or `SUSP` |
| `verdict` | enum | `rejected`, `review`, `approved`, `dismissed`, `escalated` |
| `voter_id` | FK→Voter | Nullable (`Unverified subject`, `Batch`) |
| `registration_ref` | string | `#20512` / `batch` |
| `polling_station_id` | FK→PollingStation | |
| `officer_id` | FK→FieldOfficer | |
| `detected_by` | string | `AI Verification (1:1)`, `1:N de-duplication`, `Forgery classifier`, `Isolation forest` |
| `face_score` | decimal | For VoterScan comparison |
| `opened_at` | datetime | |
| `resolved_at` | datetime | Nullable |
| `resolution` | enum | `dismissed`, `escalated`, `merged`, `blocked`, null |

**Sub-objects**
- **breakdown** (`bk[]`): `{ label, value: decimal, severity }` — the match bars.
- **timeline** (`tl[]`): `{ title, subtitle, at: datetime, state: "done"|"current" }` — case history.
- **assessment**: `{ detected_by, explanation, confidence }`.

For `Duplicate`, link to the candidate record: `duplicate_of_registration_ref`, `similarity` (1:N top match), `name_similarity`, `dob_match` (bool).

---

## 6. DuplicateMatch (dedup queue)

Registry side panel + `MergeModal`.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `record_a_id` | FK→Voter | |
| `record_b_id` | FK→Voter | |
| `similarity` | decimal | `0.88` |
| `status` | enum | `pending`, `merged`, `dismissed` |
| `merged_into_id` | FK→Voter | Survivor after merge; the other → `archived` |
| `resolved_by_user_id` | FK→AdminUser | |
| `resolved_at` | datetime | |

Merge writes an audit entry (`RECORD_MERGED`) and never hard-deletes.

---

## 7. AuditEntry (append-only, hash-chained)

`AuditView` log explorer + `LogDetailModal`. Tamper-evident chain.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `sequence` | bigint | Monotonic chain index |
| `occurred_at` | datetime | `14:41:22` |
| `action` | enum | see below |
| `actor_type` | enum | `user`, `officer`, `system`, `service` |
| `actor_id` | string | FK to the actor; or `System`/`AI Service` |
| `actor_role` | string | `Polling officer`, `Auditor`, `Administrator`, `ML pipeline` |
| `service` | enum | `Verification`, `Election Ops`, `AI / ML`, `Registry`, `IAM`, `Auth` |
| `polling_station_id` | FK→PollingStation | Nullable |
| `ip_address` | string | |
| `geo` | string | Resolved location |
| `detail` | string | Human summary |
| `change_diff` | json[] | `[{field, old, new}]` for mutations; null otherwise |
| `entry_hash` | string | SHA-256 of this entry |
| `prev_hash` | string | Hash of previous entry (chain link); `begin` for genesis |

**`action` enum (observed):** `VOTER_VERIFIED`, `VOTER_VOTED`, `TEMPLATE_ACCESSED`, `PERMISSION_CHANGED`, `LOGIN`, `DATA_EXPORTED`, `RECORD_BLOCKED`, `RECORD_CREATED`, `BIOMETRIC_LINKED`, `ADDRESS_UPDATED`, `STATUS_SYNCED`, `RECORD_MERGED`, `RECORD_ARCHIVED`, `KEY_ROTATED`, `HSM_HEALTHCHECK`.

**Chain verification** (`VerifyModal`): returns `{ entries_walked, breaks_found, merkle_root, signed_by, duration_ms, verified_at }`.

---

## 8. AnomalySignal

`AuditView` anomaly cards + `AnomalyModal`. Real-time detector output.

| Field | Type | Notes |
|---|---|---|
| `id` | string | PK, `AN-21` |
| `severity` | enum | `critical` (red), `warning` (amber), `info` (blue) |
| `title` | string | |
| `description` | string | |
| `is_live` | bool | |
| `signal_name` | string | `Face-match rejection rate` |
| `baseline` | decimal | |
| `observed` | decimal | |
| `unit` | string | `%`, `km`, `` |
| `affected_entities` | string[] | |
| `recommendation` | string | |
| `related_case_id` | FK→FraudCase | Nullable |
| `status` | enum | `active`, `acknowledged`, `muted` |
| `detected_at` | datetime | |

---

## 9. AdminUser & Role (IAM)

`UsersView` + invite/detail/edit/role modals. Also drives logins (`admin-login` 2FA, observer auth).

### AdminUser
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `full_name` | string | |
| `email` | string | Unique, `@nec.gov.rw` etc |
| `role_id` | FK→Role | |
| `district_scope` | string | `National` or a district name |
| `status` | enum | `active`, `suspended`, `invitation_pending` |
| `mfa_enabled` | bool | TOTP enrollment |
| `last_active_at` | datetime | |

### Role
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK, `super`/`auditor`/`officer`/`observer`/`support` |
| `name` | string | `Super Admin` |
| `user_count` | int | Derived |
| `permissions` | string[] | Subset of permission keys below |

**Permission keys (`PERM_GROUPS`):** `registry`, `verify`, `fraud`, `audit`, `users`, `keys`. Each grants the matching module's read+write.

### Session
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | FK→AdminUser | |
| `device` | string | `Chrome · Windows 11` |
| `ip_address` | string | |
| `location` | string | |
| `is_current` | bool | |
| `last_active_at` | datetime | |
| `revoked_at` | datetime | Nullable |

**Auth flows**
- **Admin login**: email + password → **TOTP 6-digit** second factor (mandatory). `admin-login.html`.
- **Observer**: email/Observer-ID + password; account gated on NEC accreditation (see §12).
- **MFA reset / suspend**: require a `reason` enum + optional note; both audit-logged.

---

## 10. EncryptionKey & HSM

`EncryptionView` + key-detail/rotate/integrity/export modals.

### EncryptionKey
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `title` | string | `Biometric template key` |
| `algorithm` | string | `AES-256-GCM`, `AES-256-XTS`, `RSA-4096 · split` |
| `scope` | string | What it protects |
| `is_hsm_backed` | bool | |
| `status` | enum | `active`, `rotate_soon`, `retired` |
| `current_version` | int | |
| `rotated_at` | datetime | |
| `rotation_policy_days` | int | `90` |
| `cycle_progress` | decimal | 0–1 (drives the bar / `ROTATE SOON`) |

### KeyVersion
`{ key_id, version, state: "current"|"retired", activated_at, retired_at }` — previous versions retained for decrypt.

### HsmCluster
`{ id: "kigali-hsm-01", nodes_online, nodes_total, fips_level, quorum: "2-of-3", ops_per_min, last_attestation_at, tamper_events }`.

### KeyEvent
`{ action: "KEY_ROTATED"|"HSM_HEALTHCHECK"|..., detail, severity, occurred_at }` — feeds the activity log (also mirrored to AuditEntry).

**Rotate request**: `{ key_id, timing: "immediate"|"next_window"|"scheduled", rewrap_dependent: bool, retain_previous: bool, notify_custodians: bool }` → requires HSM quorum approval.

---

## 11. IncidentReport

Public `report-incident` form. Anonymous by default.

| Field | Type | Notes |
|---|---|---|
| `id` | string | PK / tracking ref, `INC-7K42-9PQX` |
| `type` | enum | `queue_wait`, `late_or_closed`, `equipment_failure`, `materials_shortage`, `intimidation`, `accessibility`, `irregularity`, `other` |
| `polling_station_id` | FK→PollingStation | Or free text |
| `district` | string | |
| `occurred_at` | datetime | |
| `urgency` | enum | `low`, `medium`, `high` |
| `description` | text | Required |
| `evidence` | file[] | Photos/docs; **metadata stripped** on upload, ≤10 MB |
| `contact` | string | Optional (phone/email) — only if follow-up requested |
| `preferred_language` | enum | `rw`, `en`, `fr` |
| `status` | enum | `under_review`, `triaged`, `resolved` |
| `is_anonymous` | bool | No actor identity/IP stored when true |
| `submitted_at` | datetime | |

---

## 12. Observer & Accreditation

`observer-register` / `observer-login` / `observer-dashboard`.

### Observer
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK; observer ID `OBS-2026-00481` |
| `first_name` / `last_name` | string | |
| `email` | string | |
| `category` | enum | `domestic_monitor`, `party_agent`, `international_mission`, `media` |
| `organisation` | string | |
| `accreditation_number` | string | NEC `ACC-2026-XXXXX` |
| `status` | enum | `pending_review`, `approved`, `rejected`, `suspended` |
| `application_ref` | string | `OBS-REQ-3F90` |
| `access` | const | **read-only**, aggregated data only |

Observer dashboard reads only **aggregated** views (see §13) — never individual voter records.

---

## 13. Aggregate / Analytics objects

These are computed read models (materialized views / cached rollups), not raw tables. Surfaced in Dashboard, Reporting, Observer dashboard.

| Object | Shape | Source screens |
|---|---|---|
| `TurnoutSnapshot` | `{ at, national_pct, delta_pct, by_hour:[{hour,pct}], by_district:[{district,pct}] }` | Dashboard, Observer |
| `TurnoutDemographics` | `{ by_age_band:[{band, female_pct, male_pct}], gender_split:{female_pct, male_pct, female_count, male_count} }` | Reporting (`AGE_BANDS`) |
| `VerificationStats` | `{ auto_approved_pct, manual_review_pct, rejected_pct, total_today, per_minute }` | Reporting, Observer |
| `FraudSummary` | `{ flagged_total, by_district:[{district, cases, intensity_level:0..5}], top:[{district,cases}] }` | Fraud heatmap, Reporting |
| `StationStatus` | `{ total, online, syncing, not_open }` | Observer, Dashboard |
| `RegistryHealth` | `{ overall_score, total, biometrics_pct, photo_pct, address_pct, contact_pct }` | Registry data-quality panel |
| `AccessByLocation` | `[{ region, admins, note, share_pct }]` | Audit |
| `VerificationByStation` | `[{ station, count, pct }]` | Audit |

**Fraud intensity ramp** (heatmap): level `0..5` = None / Low / Moderate / Elevated / High / Critical, mapped per district by case count.

---

## 14. FieldOfficer & field-ops (mobile)

`field-mobile` app.

### FieldOfficer
| Field | Type | Notes |
|---|---|---|
| `id` | string | `#88` / `#221` |
| `name` | string | `D. Habimana` |
| `team` | string | `Kicukiro field team` |
| `assigned_district_id` | FK→District | Out-of-district enrollment is prevented |

### FieldStats (per officer, per day)
`{ officer_id, date, registrations, duplicates_caught, avg_capture_seconds, biometric_quality_pct, district_rank, week_series:[{day, count}], sync_queue_count, is_offline }`.

### Custom report builder (`ReportBuilder`)
A saved report definition: `{ id, name, dimensions:[district|station|age|gender|hour], measures:[{field:turnout|verifications|rejections|fraud_cases|latency, aggregation:Sum|Average|Count|Min|Max}], schedule, format }`.

### ScheduledReport (`RPT_RECENT`, settings webhooks)
`{ id, name, generated_by, generated_at, format:PDF|XLSX|CSV|JSON, status:READY|RUNNING, signed_hash, recipients[] }`.

---

## 15. Settings, API keys, webhooks, notifications

From `AdminSettings` / `AdminShell`.

- **ApiKey**: `{ id, name, key_prefix, key_masked, scope:read|write, created_at, last_used_at, status:active|stale }`.
- **Webhook**: `{ id, url, event:"fraud.flagged"|"turnout.synced"|..., status:active|paused, secret }`.
- **Notification**: `{ id, severity:red|amber|blue|green, category:catFraud|catDuplicate|..., title, description, created_at, read:bool }`.
- **NotificationPreference**: per-channel (`in_app`, `email`, `sms`) × per-category booleans.
- **UserPreference**: `{ theme:"light"|"dark", quick_prefs:{...} }` — theme persists per device (client stores `sp-theme`; mirror server-side for cross-device).

---

## 16. Implied API surface (by screen action)

> All mutations write an `AuditEntry`. All list endpoints support `?search=&district=&status=&service=&range=&page=`.

**Voters / Registry**
- `GET /voters` · `GET /voters/{id}` (overview / history / audit tabs)
- `POST /voters` (Add) · `PATCH /voters/{id}` (Edit)
- `POST /voters/{id}:block` `{reason, note}` · `:archive` `{reason, note}` · `:restore`
- `POST /voters:import` (CSV → map → validate → commit; returns `{added, flagged, rejected}`)
- `POST /duplicates/{id}:merge` `{survivor_id}`
- `GET /voters:export` `{format, scope, fields[]}` → signed file
- `GET /registry/health`

**Verification / Kiosk**
- `POST /verifications` `{voter_token|nid, station_id, officer_id}` → VerificationAttempt
- `POST /verifications/{id}:override` (supervisor) · `POST /votes` (cast → sets voter `voted`)
- `GET /voters/by-token/{token}` (QR scan)

**Public**
- `GET /public/voter-status?national_id=` → `{registered, station, status, turnout_step}` (no PII echo)
- `POST /public/incidents` (anonymous) → tracking ref

**Fraud / Audit**
- `GET /fraud/cases` · `GET /fraud/cases/{id}` · `POST .../{id}:dismiss|:escalate`
- `GET /fraud/summary` (heatmap)
- `GET /audit/entries` · `GET /audit/entries/{id}` · `POST /audit:verify-chain` · `GET /audit:export`
- `GET /anomalies` · `POST /anomalies/{id}:acknowledge|:mute`

**IAM / Security**
- `POST /auth/login` → `{mfa_required:true}` → `POST /auth/mfa` `{code}`
- `GET /users` · `POST /users:invite` · `PATCH /users/{id}` · `POST /users/{id}:reset-mfa|:suspend`
- `GET /roles` · `POST /roles` · `PATCH /roles/{id}`
- `GET /sessions` · `POST /sessions/{id}:revoke`

**Keys**
- `GET /keys` · `GET /keys/{id}` · `POST /keys/{id}:rotate` · `POST /encryption:integrity-check` · `GET /keys:export`

**Observer**
- `POST /observers:register` → pending · `POST /auth/observer-login`
- `GET /observer/turnout` `GET /observer/stations` `GET /observer/audit-trail` `GET /observer/verification-stats` (all aggregated, read-only)

**Analytics / Reporting**
- `GET /analytics/turnout` `GET /analytics/demographics` `GET /analytics/verification`
- `POST /reports:build` (custom builder) · `GET /reports` · `POST /reports:schedule`

---

## 17. Core enumerations (quick reference)

```
VoterStatus      = registered | voted | flagged | blocked | archived
VerifyResult     = approved | manual_review | rejected
Liveness         = live | spoof | failed
FraudType        = Impersonation | Duplicate | Forgery | Anomaly
RiskLevel        = critical | review
CaseResolution   = dismissed | escalated | merged | blocked
AuditAction      = VOTER_VERIFIED | VOTER_VOTED | TEMPLATE_ACCESSED | PERMISSION_CHANGED
                 | LOGIN | DATA_EXPORTED | RECORD_BLOCKED | RECORD_CREATED | BIOMETRIC_LINKED
                 | ADDRESS_UPDATED | STATUS_SYNCED | RECORD_MERGED | RECORD_ARCHIVED
                 | KEY_ROTATED | HSM_HEALTHCHECK
Service          = Verification | Election Ops | AI / ML | Registry | IAM | Auth
AnomalySeverity  = critical | warning | info
UserStatus       = active | suspended | invitation_pending
RoleId           = super | auditor | officer | observer | support
Permission       = registry | verify | fraud | audit | users | keys
KeyStatus        = active | rotate_soon | retired
IncidentType     = queue_wait | late_or_closed | equipment_failure | materials_shortage
                 | intimidation | accessibility | irregularity | other
Urgency          = low | medium | high
ObserverCategory = domestic_monitor | party_agent | international_mission | media
ObserverStatus   = pending_review | approved | rejected | suspended
Province         = Kigali City | Northern | Southern | Eastern | Western
Language         = rw | en | fr
```

---

## 18. Key relationships

```
District 1──* PollingStation 1──* Voter 1──* BiometricTemplate
Voter 1──* VerificationAttempt *──1 PollingStation
Voter 1──* FraudCase ; FraudCase *──1 AnomalySignal (optional)
Voter ─ DuplicateMatch ─ Voter (self, via record_a/record_b → merged_into)
AdminUser *──1 Role (Role has Permission[]) ; AdminUser 1──* Session
EncryptionKey 1──* KeyVersion ; EncryptionKey 1──* BiometricTemplate (wraps)
FieldOfficer 1──* Voter (enrolled_by) ; FieldOfficer 1──1 FieldStats/day
Observer (accreditation-gated) → read-only Aggregate views
AuditEntry forms a hash chain (prev_hash → entry_hash); every mutation appends one
```

---

### Notes for implementers
1. **Audit-first**: treat `AuditEntry` as the system of record for changes; the chain (`prev_hash`) must be unbroken and signed into a Merkle root (HSM-signed) the `VerifyModal` can reproduce.
2. **PII isolation**: biometrics and NID live in the encrypted vault keyed by `EncryptionKey`; the public and observer APIs must never join to them.
3. **Soft-delete only**: block/archive/merge never hard-delete — they transition `status` and retain the row.
4. **Aggregates are read models**: turnout/fraud/verification rollups should be cached/materialized and refreshed on a cadence (UI shows ~30s for live turnout).
5. **Display vs. storage**: store canonical datetimes, full phone numbers, and decimals; the front-end already formats/masks them.
