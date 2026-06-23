import { useState } from "react";
import { KeyRound, UserPlus, ShieldCheck, Ban, Check, RotateCcw, Trash2, Plus, Copy, Smartphone, Monitor } from "lucide-react";
import { users as usersApi, roles as rolesApi, sessions as sessionsApi } from "../../../api/endpoints.js";
import { useApi } from "../../../lib/useApi.js";
import { useToast } from "../../../lib/toast.jsx";
import { listItems } from "../../../lib/list.js";
import { fmtRelative, fmtDate } from "../../../lib/format.js";
import {
  Button, Tabs, Input, Select, Badge, StatusBadge, Avatar, Loading, ErrorState, Empty, Modal, ConfirmDialog,
} from "../../../components/index.js";
import PageHead from "./PageHead.jsx";

const PERMS = ["registry", "verify", "fraud", "audit", "users", "keys"];

/* ───────── Users ───────── */
function InviteModal({ roles, onClose, onDone }) {
  const toast = useToast();
  const [f, setF] = useState({ full_name: "", email: "", role_id: roles[0]?.id || "support", district_scope: "National", password: "" });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!f.full_name || !f.email || !f.password) { toast.error("Name, email and password required"); return; }
    setBusy(true);
    try { await usersApi.invite(f); toast.success("User invited"); onDone(); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title="Invite administrator" subtitle="Creates an account · audit-logged"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" loading={busy} onClick={submit}>Send invite</Button></>}>
      <div className="sp-stack sp-gap-4">
        <Input label="Full name" required value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
        <Input label="Work email" required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@nec.gov.rw" />
        <div className="sp-grid sp-grid-2">
          <Select label="Role" value={f.role_id} onChange={(e) => setF({ ...f, role_id: e.target.value })} options={roles.map((r) => ({ value: r.id, label: r.name }))} />
          <Input label="District scope" value={f.district_scope} onChange={(e) => setF({ ...f, district_scope: e.target.value })} />
        </div>
        <Input label="Temporary password" required type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} hint="Min 8 chars" />
      </div>
    </Modal>
  );
}

function TotpModal({ uri, onClose }) {
  const toast = useToast();
  const copy = () => { navigator.clipboard?.writeText(uri); toast.success("Copied"); };
  return (
    <Modal open onClose={onClose} title="TOTP provisioning" subtitle="Add this secret to an authenticator app"
      footer={<Button variant="primary" onClick={onClose}>Done</Button>}>
      <div className="sp-stack sp-gap-3">
        <p className="t-sm t-muted">Paste this <span className="t-mono">otpauth://</span> URI into any TOTP app (Google Authenticator, Authy…), or use your app's “enter setup key” option.</p>
        <div style={{ background: "var(--bg-inset)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 12 }}>
          <div className="t-mono t-xs" style={{ wordBreak: "break-all", color: "var(--text-strong)" }}>{uri}</div>
        </div>
        <div><Button size="sm" variant="secondary" iconLeft={<Copy size={14} />} onClick={copy}>Copy URI</Button></div>
      </div>
    </Modal>
  );
}

function UsersTab({ roles }) {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => usersApi.list(), []);
  const [inviting, setInviting] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [totp, setTotp] = useState(null);
  const items = listItems(data);
  const roleName = (id) => roles.find((r) => r.id === id)?.name || id;

  const act = async (u, which) => {
    setBusy(true);
    try {
      if (which === "suspend") await usersApi.suspend(u.id);
      if (which === "activate") await usersApi.activate(u.id);
      if (which === "delete") await usersApi.remove(u.id);
      if (which === "reset-mfa") {
        const r = await usersApi.resetMfa(u.id);
        const uri = r?.totp_uri || r?.uri || r?.provisioning_uri;
        if (uri) setTotp(uri);
      }
      toast.success(`User ${which.replace("-", " ")} done`);
      setConfirm(null); reload();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  const showTotp = async (u) => {
    try { const r = await usersApi.totpUri(u.id); const uri = r?.totp_uri || r?.uri || r?.provisioning_uri || (typeof r === "string" ? r : null); if (uri) setTotp(uri); else toast.error("No TOTP URI available"); }
    catch (e) { toast.error(e); }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <>
      <div className="sp-row-between" style={{ marginBottom: 12 }}>
        <span className="t-sm t-muted">{items.length} administrators</span>
        <Button size="sm" variant="primary" iconLeft={<UserPlus size={15} />} onClick={() => setInviting(true)}>Invite user</Button>
      </div>
      <div className="table-wrap">
        <table className="sp-table">
          <thead><tr><th>User</th><th>Role</th><th>Scope</th><th>Status</th><th>MFA</th><th>Last active</th><th></th></tr></thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td><div className="sp-row sp-gap-2"><Avatar name={u.full_name} size={30} /><div><div style={{ fontWeight: 600, color: "var(--text-strong)" }}>{u.full_name}</div><div className="t-xs t-mono t-muted">{u.email}</div></div></div></td>
                <td className="t-sm">{roleName(u.role_id)}</td>
                <td className="t-sm">{u.district_scope}</td>
                <td><StatusBadge status={u.status} size="sm" /></td>
                <td>{u.mfa_enabled ? <Badge tone="green" size="sm" dot={false}><ShieldCheck size={12} style={{ marginRight: 3 }} />On</Badge> : <Badge tone="neutral" size="sm">Off</Badge>}</td>
                <td className="t-xs t-muted t-nowrap">{u.last_active_at ? fmtRelative(u.last_active_at) : "—"}</td>
                <td className="t-right">
                  <div className="sp-row sp-gap-1" style={{ justifyContent: "flex-end" }}>
                    <button className="sp-iconbtn" title="TOTP URI" onClick={() => showTotp(u)}><Smartphone size={15} /></button>
                    <button className="sp-iconbtn" title="Reset MFA" onClick={() => setConfirm({ u, which: "reset-mfa" })}><RotateCcw size={15} /></button>
                    {u.status === "active"
                      ? <button className="sp-iconbtn" title="Suspend" onClick={() => setConfirm({ u, which: "suspend" })}><Ban size={15} /></button>
                      : <button className="sp-iconbtn" title="Activate" onClick={() => act(u, "activate")}><Check size={15} /></button>}
                    <button className="sp-iconbtn" title="Delete" onClick={() => setConfirm({ u, which: "delete" })}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {inviting && <InviteModal roles={roles} onClose={() => setInviting(false)} onDone={() => { setInviting(false); reload(); }} />}
      {totp && <TotpModal uri={totp} onClose={() => setTotp(null)} />}
      <ConfirmDialog
        open={!!confirm}
        danger={confirm?.which === "delete" || confirm?.which === "suspend"}
        busy={busy}
        title={confirm ? `${confirm.which.replace("-", " ")} — ${confirm.u.full_name}` : ""}
        confirmLabel="Confirm"
        message="This action is audit-logged."
        onClose={() => setConfirm(null)}
        onConfirm={() => act(confirm.u, confirm.which)}
      />
    </>
  );
}

/* ───────── Roles ───────── */
function RoleEditor({ role, onClose, onDone }) {
  const toast = useToast();
  const isNew = !role;
  const [f, setF] = useState({ id: role?.id || "", name: role?.name || "", permissions: new Set(role?.permissions || []) });
  const [busy, setBusy] = useState(false);
  const toggle = (p) => setF((s) => { const n = new Set(s.permissions); n.has(p) ? n.delete(p) : n.add(p); return { ...s, permissions: n }; });
  const submit = async () => {
    if (!f.id || !f.name) { toast.error("ID and name required"); return; }
    setBusy(true);
    try {
      const payload = { id: f.id, name: f.name, permissions: [...f.permissions] };
      if (isNew) await rolesApi.create(payload); else await rolesApi.update(role.id, payload);
      toast.success(isNew ? "Role created" : "Role updated"); onDone();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={isNew ? "Create role" : `Edit ${role.name}`}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" loading={busy} onClick={submit}>{isNew ? "Create" : "Save"}</Button></>}>
      <div className="sp-stack sp-gap-4">
        <div className="sp-grid sp-grid-2">
          <Input label="Role ID" required mono value={f.id} disabled={!isNew} onChange={(e) => setF({ ...f, id: e.target.value })} placeholder="e.g. auditor" />
          <Input label="Display name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </div>
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 8 }}>Permissions</div>
          <div className="sp-grid sp-grid-2 sp-gap-2">
            {PERMS.map((p) => (
              <label key={p} className="sp-row sp-gap-2" style={{ cursor: "pointer", padding: "8px 10px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: f.permissions.has(p) ? "var(--primary-soft)" : "var(--bg-surface)" }}>
                <input type="checkbox" checked={f.permissions.has(p)} onChange={() => toggle(p)} />
                <span className="t-sm" style={{ textTransform: "capitalize" }}>{p}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function RolesTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => rolesApi.list(), []);
  const [editing, setEditing] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const roles = listItems(data);
  const remove = async () => { setBusy(true); try { await rolesApi.remove(del.id); toast.success("Role deleted"); setDel(null); reload(); } catch (e) { toast.error(e); } finally { setBusy(false); } };
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <>
      <div className="sp-row-between" style={{ marginBottom: 12 }}>
        <span className="t-sm t-muted">{roles.length} roles</span>
        <Button size="sm" variant="primary" iconLeft={<Plus size={15} />} onClick={() => setEditing(null)}>Create role</Button>
      </div>
      <div className="table-wrap">
        <table className="sp-table">
          <thead><tr><th>Role</th><th>ID</th><th>Permissions</th><th></th></tr></thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="sp-row-click" onClick={() => setEditing(r)}>
                <td style={{ fontWeight: 600, color: "var(--text-strong)" }}>{r.name}</td>
                <td className="t-mono t-sm">{r.id}</td>
                <td><div className="sp-row sp-gap-1 sp-wrap">{(r.permissions || []).map((p) => <Badge key={p} tone="blue" size="sm" dot={false}>{p}</Badge>)}{!r.permissions?.length && <span className="t-muted t-sm">—</span>}</div></td>
                <td className="t-right"><button className="sp-iconbtn" onClick={(e) => { e.stopPropagation(); setDel(r); }}><Trash2 size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing !== undefined && <RoleEditor role={editing} onClose={() => setEditing(undefined)} onDone={() => { setEditing(undefined); reload(); }} />}
      <ConfirmDialog open={!!del} danger busy={busy} title="Delete role" confirmLabel="Delete" message={`Delete role ${del?.name}?`} onClose={() => setDel(null)} onConfirm={remove} />
    </>
  );
}

/* ───────── Sessions ───────── */
function SessionsTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => sessionsApi.list(), []);
  const items = listItems(data);
  const revoke = async (id) => { try { await sessionsApi.revoke(id); toast.success("Session revoked"); reload(); } catch (e) { toast.error(e); } };
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!items.length) return <Empty icon={<Monitor size={28} />} title="No active sessions" message="Active sessions for your account appear here." />;
  return (
    <div className="table-wrap">
      <table className="sp-table">
        <thead><tr><th>Device</th><th>IP</th><th>Location</th><th>Last active</th><th></th></tr></thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td>{s.device || "—"} {s.is_current && <Badge tone="green" size="sm" style={{ marginLeft: 6 }}>This device</Badge>}</td>
              <td className="t-mono t-sm">{s.ip_address || "—"}</td>
              <td className="t-sm">{s.location || "—"}</td>
              <td className="t-xs t-muted">{s.last_active_at ? fmtDate(s.last_active_at) : "—"}</td>
              <td className="t-right">{!s.is_current && <Button size="sm" variant="ghost" onClick={() => revoke(s.id)}>Revoke</Button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function UsersRoles() {
  const [tab, setTab] = useState("users");
  const roles = useApi(() => rolesApi.list(), []);
  return (
    <>
      <PageHead title="Users & roles" sub="Administrators · permission sets · MFA · sessions" />
      <div className="section">
        <div className="section__bd">
          <Tabs tabs={[{ id: "users", label: "Users" }, { id: "roles", label: "Roles" }, { id: "sessions", label: "Sessions" }]} active={tab} onChange={setTab} />
          {tab === "users" && <UsersTab roles={listItems(roles.data)} />}
          {tab === "roles" && <RolesTab />}
          {tab === "sessions" && <SessionsTab />}
        </div>
      </div>
    </>
  );
}
