/* Core HTTP client for the SecurePoll RW backend.
   - Talks to the FastAPI server via the Vite proxy at /api (-> :8000).
   - Injects the Bearer JWT, transparently refreshes on 401, and normalizes
     FastAPI error envelopes ({detail: ...}) into thrown ApiError objects. */

const BASE = "/api";

const TOKEN_KEY = "sp.token";
const PARTIAL_KEY = "sp.partialToken"; // pre-MFA token

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY) || "",
  set: (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)),
  getPartial: () => localStorage.getItem(PARTIAL_KEY) || "",
  setPartial: (t) => (t ? localStorage.setItem(PARTIAL_KEY, t) : localStorage.removeItem(PARTIAL_KEY)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PARTIAL_KEY);
  },
};

export class ApiError extends Error {
  constructor(status, detail, body) {
    super(typeof detail === "string" ? detail : "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.body = body;
  }
}

// FastAPI returns validation errors as {detail: [{loc, msg, type}, ...]}.
// Flatten them into a single readable sentence for toasts.
function readableDetail(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : "";
        return field ? `${field}: ${d.msg}` : d.msg;
      })
      .join("; ");
  }
  return "Request failed";
}

let onAuthLost = null;
export function setAuthLostHandler(fn) {
  onAuthLost = fn;
}

async function parse(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(method, path, { body, query, auth = true, form, multipart, raw } = {}) {
  let url = BASE + path;
  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const s = qs.toString();
    if (s) url += "?" + s;
  }

  const headers = {};
  let payload;
  if (multipart) {
    payload = multipart; // FormData — let the browser set the boundary
  } else if (form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    const tok = auth === "partial" ? tokenStore.getPartial() : tokenStore.get();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  }

  const res = await fetch(url, { method, headers, body: payload });

  if (res.status === 401 && auth === true) {
    if (onAuthLost) onAuthLost();
    const data = await parse(res);
    throw new ApiError(401, readableDetail(data?.detail) || "Session expired", data);
  }

  if (raw) return res;

  const data = await parse(res);
  if (!res.ok) {
    throw new ApiError(res.status, readableDetail(data?.detail) || `HTTP ${res.status}`, data);
  }
  return data;
}

export const http = {
  get: (path, opts) => request("GET", path, opts),
  post: (path, opts) => request("POST", path, opts),
  put: (path, opts) => request("PUT", path, opts),
  patch: (path, opts) => request("PATCH", path, opts),
  del: (path, opts) => request("DELETE", path, opts),
};

// Download a CSV/file export and trigger a browser save.
export async function download(path, query, filename) {
  const res = await request("GET", path, { query, raw: true });
  if (!res.ok) throw new ApiError(res.status, `Export failed (HTTP ${res.status})`);
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename || "export.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
