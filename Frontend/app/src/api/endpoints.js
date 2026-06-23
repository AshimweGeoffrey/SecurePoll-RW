/* Typed-ish wrappers for every SecurePoll RW backend endpoint, grouped by domain.
   Paths and shapes mirror the live OpenAPI spec (106 operations). */

import { http, download } from "./client.js";

/* ───────────────────────── auth ───────────────────────── */
export const auth = {
  login: (email, password) => http.post("/auth/login", { body: { email, password }, auth: false }),
  // MFA uses the partial (pre-2FA) token issued by login.
  mfa: (code) => http.post("/auth/mfa", { body: { code }, auth: "partial" }),
  resendOtp: () => http.post("/auth/resend-otp", { auth: "partial" }),
  refresh: () => http.post("/auth/refresh"),
  logout: () => http.post("/auth/logout"),
  changePassword: (current_password, new_password) =>
    http.post("/auth/change-password", { query: { current_password, new_password } }),
};

/* ───────────────────────── users / IAM ───────────────────────── */
export const users = {
  list: () => http.get("/users"),
  me: () => http.get("/users/me"),
  get: (id) => http.get(`/users/${id}`),
  invite: (payload) => http.post("/users:invite", { body: payload }),
  update: (id, payload) => http.patch(`/users/${id}`, { body: payload }),
  activate: (id) => http.post(`/users/${id}:activate`),
  suspend: (id) => http.post(`/users/${id}:suspend`),
  resetMfa: (id) => http.post(`/users/${id}:reset-mfa`),
  totpUri: (id) => http.get(`/users/${id}:totp-uri`),
  remove: (id) => http.del(`/users/${id}`),
};

export const roles = {
  list: () => http.get("/roles"),
  create: (payload) => http.post("/roles", { body: payload }),
  update: (id, payload) => http.patch(`/roles/${id}`, { body: payload }),
  remove: (id) => http.del(`/roles/${id}`),
};

export const sessions = {
  list: () => http.get("/sessions"),
  revoke: (id) => http.post(`/sessions/${id}:revoke`),
};

/* ───────────────────────── geography ───────────────────────── */
export const districts = {
  list: (query) => http.get("/districts", { query }),
  get: (id) => http.get(`/districts/${id}`),
  create: (payload) => http.post("/districts", { body: payload }),
  update: (id, payload) => http.patch(`/districts/${id}`, { body: payload }),
  remove: (id) => http.del(`/districts/${id}`),
  stations: (id) => http.get(`/districts/${id}/stations`),
};

export const stations = {
  list: (query) => http.get("/polling-stations", { query }),
  get: (id) => http.get(`/polling-stations/${id}`),
  create: (payload) => http.post("/polling-stations", { body: payload }),
  update: (id, payload) => http.patch(`/polling-stations/${id}`, { body: payload }),
  remove: (id) => http.del(`/polling-stations/${id}`),
  open: (id) => http.post(`/polling-stations/${id}:open`),
  close: (id) => http.post(`/polling-stations/${id}:close`),
  summary: (id) => http.get(`/polling-stations/${id}/summary`),
};

/* ───────────────────────── officers ───────────────────────── */
export const officers = {
  list: (query) => http.get("/officers", { query }),
  get: (id) => http.get(`/officers/${id}`),
  create: (payload) => http.post("/officers", { body: payload }),
  update: (id, payload) => http.patch(`/officers/${id}`, { body: payload }),
  remove: (id) => http.del(`/officers/${id}`),
  stats: (id) => http.get(`/officers/${id}/stats`),
};

/* ───────────────────────── voters / registry ───────────────────────── */
export const voters = {
  list: (query) => http.get("/voters", { query }),
  get: (id) => http.get(`/voters/${id}`),
  byToken: (token) => http.get(`/voters/by-token/${encodeURIComponent(token)}`),
  create: (payload) => http.post("/voters", { body: payload }),
  update: (id, payload) => http.patch(`/voters/${id}`, { body: payload }),
  block: (id, reason, note) => http.post(`/voters/${id}:block`, { query: { reason, note } }),
  flag: (id, reason) => http.post(`/voters/${id}:flag`, { query: { reason } }),
  archive: (id) => http.post(`/voters/${id}:archive`),
  restore: (id) => http.post(`/voters/${id}:restore`),
  verifications: (id) => http.get(`/voters/${id}/verifications`),
  importCsv: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return http.post("/voters:import", { multipart: fd });
  },
  exportCsv: (format = "csv") => download("/voters:export", { format }, `voters.${format}`),
};

export const registry = {
  health: () => http.get("/registry/health"),
};

/* ───────────────────────── biometrics ───────────────────────── */
export const biometrics = {
  // enroll/re-enroll take a base64 face image (form-encoded, matches backend).
  enroll: (voter_id, face_image) =>
    http.post("/biometrics/enroll", { form: { voter_id, face_image } }),
  reEnroll: (voter_id, face_image) =>
    http.put("/biometrics/enroll", { form: { voter_id, face_image } }),
  quality: (voter_id) => http.get(`/biometrics/quality/${voter_id}`),
  templates: (query) => http.get("/biometrics/templates", { query }),
  deleteTemplate: (voter_id) => http.del(`/biometrics/templates/${voter_id}`),
  dedupScan: (voter_id) => http.post(`/biometrics/dedup-scan/${voter_id}`),
  stats: () => http.get("/biometrics/stats"),
};

/* ───────────────────────── verification / votes ───────────────────────── */
export const verification = {
  // Verify is a public endpoint, but the kiosk operator is a signed-in officer,
  // so we send the bearer token when present (harmless on the public route).
  verify: (payload) => http.post("/verifications", { body: payload }),
  list: (query) => http.get("/verifications", { query }),
  get: (id) => http.get(`/verifications/${id}`),
  override: (id, override_result, reason) =>
    http.post(`/verifications/${id}:override`, { query: { override_result, reason } }),
  stationLog: (stationId) => http.get(`/verifications/station/${stationId}/log`),
};

export const votes = {
  cast: (payload) => http.post("/votes", { body: payload }),
};

/* ───────────────────────── fraud ───────────────────────── */
export const fraud = {
  cases: (query) => http.get("/fraud/cases", { query }),
  case: (id) => http.get(`/fraud/cases/${id}`),
  createCase: (payload) => http.post("/fraud/cases", { body: payload }),
  dismissCase: (id) => http.post(`/fraud/cases/${id}:dismiss`),
  escalateCase: (id) => http.post(`/fraud/cases/${id}:escalate`),
  summary: () => http.get("/fraud/summary"),
};

export const duplicates = {
  list: (query) => http.get("/duplicates", { query }),
  get: (id) => http.get(`/duplicates/${id}`),
  merge: (id, survivor_id) => http.post(`/duplicates/${id}:merge`, { body: { survivor_id } }),
};

export const anomalies = {
  list: (query) => http.get("/anomalies", { query }),
  get: (id) => http.get(`/anomalies/${id}`),
  create: (payload) => http.post("/anomalies", { body: payload }),
  acknowledge: (id) => http.post(`/anomalies/${id}:acknowledge`),
  mute: (id) => http.post(`/anomalies/${id}:mute`),
  remove: (id) => http.del(`/anomalies/${id}`),
};

/* ───────────────────────── audit ───────────────────────── */
export const audit = {
  entries: (query) => http.get("/audit/entries", { query }),
  entry: (id) => http.get(`/audit/entries/${id}`),
  verifyChain: () => http.post("/audit:verify-chain"),
  exportCsv: (format = "csv") => download("/audit:export", { format }, `audit.${format}`),
};

/* ───────────────────────── analytics ───────────────────────── */
export const analytics = {
  turnout: () => http.get("/analytics/turnout"),
  demographics: () => http.get("/analytics/demographics"),
  live: () => http.get("/analytics/live"),
  verification: () => http.get("/analytics/verification"),
  enrollment: () => http.get("/analytics/enrollment"),
  fraud: () => http.get("/analytics/fraud"),
};

/* ───────────────────────── encryption keys ───────────────────────── */
export const keys = {
  list: () => http.get("/keys"),
  get: (id) => http.get(`/keys/${id}`),
  create: (payload) => http.post("/keys", { body: payload }),
  update: (id, payload) => http.patch(`/keys/${id}`, { body: payload }),
  remove: (id) => http.del(`/keys/${id}`),
  rotate: (id) => http.post(`/keys/${id}:rotate`),
  health: () => http.get("/keys/health"),
};

/* ───────────────────────── AI / ML ───────────────────────── */
export const ai = {
  status: () => http.get("/ai/status"),
  thresholds: () => http.get("/ai/thresholds"),
  setThresholds: (payload) => http.put("/ai/thresholds", { body: payload }),
  rebuildIndex: () => http.post("/ai/rebuild-index"),
  healthcheck: () => http.post("/ai/healthcheck"),
};

export const notifications = {
  list: (query) => http.get("/notifications", { query }),
  markRead: (id) => http.post(`/notifications/${id}:read`),
  markAllRead: () => http.post("/notifications:read-all"),
};

export const preferences = {
  get: () => http.get("/users/me/preferences"),
  update: (payload) => http.put("/users/me/preferences", { body: payload }),
};

export const system = {
  health: () => http.get("/health", { auth: false }),
};

export default {
  auth, users, roles, sessions, districts, stations, officers,
  voters, registry, biometrics, verification, votes,
  fraud, duplicates, anomalies, audit, analytics, keys, ai, system,
};
