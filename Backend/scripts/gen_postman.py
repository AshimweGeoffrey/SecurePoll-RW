"""
Generate a complete Postman collection from the FastAPI OpenAPI spec.

Covers every registered route, grouped into folders by tag, with:
  * collection-level Bearer auth bound to {{access_token}}
  * {{base_url}} variable
  * sample JSON bodies synthesised from each endpoint's request schema
  * an Auth > Login request whose test script captures the token automatically

Run:  python3 scripts/gen_postman.py
Writes: SecurePoll-RW.postman_collection.json
"""
import json, os, sys
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

with patch("ml.inference.load_models"), \
     patch("ml.inference._faiss_index", MagicMock(ntotal=0)):
    from app.main import app

spec = app.openapi()
schemas = spec.get("components", {}).get("schemas", {})

OUT = os.path.join(os.path.dirname(__file__), "..", "SecurePoll-RW.postman_collection.json")
SKIP_PATHS = {"/openapi.json", "/docs", "/redoc", "/docs/oauth2-redirect"}


def example_for(schema, depth=0):
    """Synthesise a sample value from a JSON-schema fragment."""
    if depth > 6 or not isinstance(schema, dict):
        return None
    if "$ref" in schema:
        ref = schema["$ref"].split("/")[-1]
        return example_for(schemas.get(ref, {}), depth + 1)
    for comb in ("allOf", "anyOf", "oneOf"):
        if comb in schema and schema[comb]:
            return example_for(schema[comb][0], depth + 1)
    if "example" in schema:
        return schema["example"]
    if "default" in schema:
        return schema["default"]
    if "enum" in schema and schema["enum"]:
        return schema["enum"][0]
    t = schema.get("type")
    if t == "object" or "properties" in schema:
        props = schema.get("properties", {})
        required = set(schema.get("required", []))
        out = {}
        for name, sub in props.items():
            # include required fields + a few common optionals
            if name in required or len(out) < 8:
                out[name] = example_for(sub, depth + 1)
        return out
    if t == "array":
        return [example_for(schema.get("items", {}), depth + 1)]
    if t == "integer":
        return 0
    if t == "number":
        return 0.0
    if t == "boolean":
        return True
    fmt = schema.get("format")
    if fmt == "date":
        return "1990-01-01"
    if fmt == "date-time":
        return "2026-01-01T00:00:00Z"
    if fmt == "uuid":
        return "00000000-0000-0000-0000-000000000000"
    if fmt == "email":
        return "user@securepoll.rw"
    return "string"


def path_to_url(path):
    # FastAPI {param} -> Postman :param
    segments, variables = [], []
    for seg in path.strip("/").split("/"):
        if seg.startswith("{") and seg.endswith("}"):
            name = seg[1:-1]
            segments.append(":" + name)
            variables.append({"key": name, "value": "00000000-0000-0000-0000-000000000000"})
        else:
            segments.append(seg)
    return segments, variables


def build_request(path, method, op):
    segments, path_vars = path_to_url(path)
    raw = "{{base_url}}/" + "/".join(segments)
    url = {"raw": raw, "host": ["{{base_url}}"], "path": segments}
    if path_vars:
        url["variable"] = path_vars

    # query params from parameters
    query = []
    for p in op.get("parameters", []):
        if p.get("in") == "query":
            query.append({"key": p["name"], "value": str(example_for(p.get("schema", {})) or ""),
                          "disabled": not p.get("required", False)})
    if query:
        url["query"] = query

    req = {"method": method.upper(), "header": [], "url": url}

    # request body
    body_spec = op.get("requestBody", {})
    content = body_spec.get("content", {})
    if "application/json" in content:
        sample = example_for(content["application/json"].get("schema", {}))
        req["header"].append({"key": "Content-Type", "value": "application/json"})
        req["body"] = {"mode": "raw", "raw": json.dumps(sample, indent=2),
                       "options": {"raw": {"language": "json"}}}
    elif "application/x-www-form-urlencoded" in content:
        sample = example_for(content["application/x-www-form-urlencoded"].get("schema", {})) or {}
        req["body"] = {"mode": "urlencoded",
                       "urlencoded": [{"key": k, "value": str(v)} for k, v in sample.items()]}
    elif "multipart/form-data" in content:
        sample = example_for(content["multipart/form-data"].get("schema", {})) or {}
        req["body"] = {"mode": "formdata",
                       "formdata": [{"key": k, "value": str(v), "type": "text"} for k, v in sample.items()]}

    # Usage comment on the request: auth note + the endpoint's OpenAPI description,
    # plus path/query param hints so the request is self-documenting in Postman.
    PUBLIC = {("post", "/auth/login"), ("post", "/auth/token"), ("post", "/auth/refresh"),
              ("post", "/auth/mfa"), ("post", "/verifications"), ("post", "/votes"),
              ("get", "/health")}
    auth_note = "Auth: public (no token)" if (method, path) in PUBLIC else "Auth: Bearer {{access_token}}"
    usage = [f"`{method.upper()} {path}` — {auth_note}", ""]
    if op.get("description"):
        usage.append(op["description"])
    elif op.get("summary"):
        usage.append(op["summary"])
    pp = [p["name"] for p in op.get("parameters", []) if p.get("in") == "path"]
    qp = [p["name"] for p in op.get("parameters", []) if p.get("in") == "query"]
    if pp:
        usage.append("\n**Path params:** " + ", ".join(f"`{x}`" for x in pp))
    if qp:
        usage.append("**Query params:** " + ", ".join(f"`{x}`" for x in qp))
    req["description"] = "\n".join(usage)

    item = {"name": op.get("summary") or f"{method.upper()} {path}",
            "request": req, "response": []}

    # Login: prefill seeded admin credentials + capture the token automatically
    if path == "/auth/login" and method == "post":
        req["body"]["raw"] = json.dumps(
            {"email": "admin@securepoll.rw", "password": "SecurePassword123!"}, indent=2)
        item["event"] = [{"listen": "test", "script": {"type": "text/javascript", "exec": [
            "var j = pm.response.json();",
            "if (j.access_token) { pm.collectionVariables.set('access_token', j.access_token); }",
            "if (j.refresh_token) { pm.collectionVariables.set('refresh_token', j.refresh_token); }",
        ]}}]
    return item


# group by tag
folders = {}
order = []
for path, methods in spec["paths"].items():
    if path in SKIP_PATHS:
        continue
    for method, op in methods.items():
        if method not in ("get", "post", "put", "patch", "delete"):
            continue
        tag = (op.get("tags") or ["misc"])[0]
        if tag not in folders:
            folders[tag] = []
            order.append(tag)
        folders[tag].append(build_request(path, method, op))

# Per-folder usage descriptions from the OpenAPI tag metadata.
tag_desc = {t["name"]: t.get("description", "") for t in spec.get("tags", [])}

_USAGE_GUIDE = (
    "# SecurePoll RW — API collection\n\n"
    "Auto-generated from the FastAPI OpenAPI spec — covers **every** endpoint, each with a "
    "usage description, auth note, and example body.\n\n"
    "## Getting started\n"
    "1. Set the `base_url` variable (default `http://127.0.0.1:8000`).\n"
    "2. Run **auth > Login** — its test script captures `access_token` and `refresh_token` "
    "into collection variables automatically.\n"
    "3. Every other request inherits Bearer auth (`{{access_token}}`) — just send it.\n\n"
    "## Notes\n"
    "- Public endpoints (no token): `POST /auth/login`, `/auth/token`, `/verifications`, `/votes`, `GET /health`.\n"
    "- Path/query params are pre-filled with placeholder values — replace IDs with real ones "
    "(list endpoints return them).\n"
    "- Each request's **Description** tab explains what it does and which params it takes.\n"
    "- Seeded admin login: `admin@securepoll.rw` / `SecurePassword123!`."
)

collection = {
    "info": {
        "name": "SecurePoll RW",
        "description": _USAGE_GUIDE,
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    "auth": {"type": "bearer", "bearer": [{"key": "token", "value": "{{access_token}}", "type": "string"}]},
    "variable": [
        {"key": "base_url", "value": "http://127.0.0.1:8000"},
        {"key": "access_token", "value": ""},
        {"key": "refresh_token", "value": ""},
    ],
    "item": [{"name": tag, "description": tag_desc.get(tag, ""), "item": folders[tag]}
             for tag in order],
}

with open(OUT, "w") as f:
    json.dump(collection, f, indent=2)

total = sum(len(v) for v in folders.values())
print(f"Wrote {os.path.relpath(OUT)}")
print(f"Folders: {len(folders)} | Requests: {total}")
for tag in order:
    print(f"  - {tag}: {len(folders[tag])}")
