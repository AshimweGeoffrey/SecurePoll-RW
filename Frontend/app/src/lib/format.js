/* Display formatting helpers. The backend stores canonical values
   (ISO datetimes, full phone, decimals); the client formats/masks them. */

export function fmtDate(iso, opts = {}) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", ...opts,
  });
}

export function fmtDay(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// "3 minutes ago" style relative time.
export function fmtRelative(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  const abs = Math.abs(s);
  const sign = s >= 0 ? "ago" : "from now";
  if (abs < 60) return `${abs}s ${sign}`;
  if (abs < 3600) return `${Math.round(abs / 60)}m ${sign}`;
  if (abs < 86400) return `${Math.round(abs / 3600)}h ${sign}`;
  return `${Math.round(abs / 86400)}d ${sign}`;
}

// Scores shown to two decimals (0.91).
export function fmtScore(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toFixed(2);
}

export function fmtPct(v, digits = 1) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (isNaN(n)) return "—";
  // Accept either a 0–1 fraction or an already-percent number.
  const pct = n <= 1 ? n * 100 : n;
  return `${pct.toFixed(digits)}%`;
}

export function fmtInt(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toLocaleString("en-US");
}

// PII-masked phone: "+250 7•• ••• 142"
export function maskPhone(p) {
  if (!p) return "—";
  const digits = p.replace(/\s/g, "");
  if (digits.length < 6) return p;
  const tail = digits.slice(-3);
  const head = digits.slice(0, 4);
  return `${head} •• ••• ${tail}`;
}

export function maskNid(nid) {
  if (!nid) return "—";
  const s = String(nid);
  if (s.length <= 4) return s;
  return `${s.slice(0, 4)} •••• •••• ${s.slice(-4)}`;
}

export function fullName(v) {
  if (!v) return "—";
  return [v.first_name, v.last_name].filter(Boolean).join(" ") || v.full_name || "—";
}

export function ageFrom(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d)) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function initials(name) {
  if (!name) return "··";
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// Map a domain status string to a Badge tone.
export function statusTone(status) {
  const s = String(status || "").toLowerCase();
  if (["approved", "active", "online", "voted", "verified", "approve", "merged", "resolved"].includes(s)) return "approved";
  if (["rejected", "blocked", "suspended", "offline", "critical", "spoof", "failed"].includes(s)) return "rejected";
  if (["manual_review", "review", "flagged", "syncing", "rotate_soon", "pending", "pending_review", "warning", "invitation_pending", "under_review", "stale"].includes(s)) return "review";
  if (["registered", "info", "acknowledged", "triaged", "not_open"].includes(s)) return "info";
  return "neutral";
}

export function prettyStatus(s) {
  if (!s) return "—";
  return String(s).replace(/_/g, " ");
}
