import { useEffect, useState } from "react";
import {
  UserCog, Palette, SlidersHorizontal, ShieldCheck, Save, KeyRound, LogOut, Mail, Sun, Moon,
  Lock, Monitor, Bell, MessageSquare, Users, RadioTower, FileCheck2, ShieldAlert, X, Settings as SettingsIcon, ChevronRight,
} from "lucide-react";
import { auth as authApi, users as usersApi, sessions as sessionsApi, preferences as prefsApi } from "../../api/endpoints.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useTheme } from "../../lib/theme.jsx";
import { useToast } from "../../lib/toast.jsx";
import { useApi } from "../../lib/useApi.js";
import { listItems } from "../../lib/list.js";
import { initials } from "../../lib/format.js";
import { Input, Button, Badge, Avatar } from "../../components/index.js";
import "./admin-settings.css";

export const SET_TABS = [
  { id: "account", label: "Account & profile", icon: UserCog, sub: "Manage your profile, role & regional defaults" },
  { id: "appearance", label: "Appearance", icon: Palette, sub: "Theme and display preferences" },
  { id: "notifications", label: "Notifications", icon: SlidersHorizontal, sub: "Channels and categories you get alerted on" },
  { id: "security", label: "Security & MFA", icon: ShieldCheck, sub: "MFA, password and active sessions" },
];

const DEFAULT_PREFS = {
  theme: "light", channels: { inApp: true, email: true, sms: false },
  categories: { catFraud: true, catDuplicate: true, catStation: true, catReports: true, catAudit: false },
  criticalOnly: false, digest: true,
};

function Switch({ on, onClick }) {
  return <button type="button" className="set-switch" data-on={on ? "1" : "0"} role="switch" aria-checked={on} onClick={onClick}><i /></button>;
}
function Card({ title, subtitle, headerEnd, children }) {
  return (
    <div className="dscard">
      <div className="dscard__hd"><div><div className="dscard__t">{title}</div>{subtitle && <div className="dscard__sub">{subtitle}</div>}</div>{headerEnd && <div className="dscard__hd-end">{headerEnd}</div>}</div>
      <div className="dscard__body">{children}</div>
    </div>
  );
}

function AccountTab() {
  const { user, role, reload } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ full_name: user?.full_name || "", district_scope: user?.district_scope || "" });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try { await usersApi.update(user.id, form); toast.success("Profile saved"); reload(); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  return (
    <div className="set-stack">
      <Card title="Profile" subtitle="How you appear across the platform">
        <div className="prof-head">
          <div className="prof-av">{initials(user?.full_name)}</div>
          <div className="prof-av__act"><div style={{ fontWeight: 600, color: "var(--text-strong)" }}>{user?.full_name}</div><span className="prof-av__hint">{user?.email}</span></div>
        </div>
        <div className="set-form">
          <Input label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Work email" value={user?.email || ""} iconLeft={<Mail size={16} />} disabled />
          <Input label="District scope" value={form.district_scope} onChange={(e) => setForm({ ...form, district_scope: e.target.value })} />
          <div className="sp-stack"><span className="sf__l">Assigned role</span><div><Badge tone="green" dot>{role?.name || user?.role_id}</Badge></div></div>
        </div>
        <div className="set-actions">
          <Button iconLeft={<Save size={15} />} loading={busy} onClick={save}>Save changes</Button>
          <Button variant="ghost" onClick={() => setForm({ full_name: user?.full_name || "", district_scope: user?.district_scope || "" })}>Discard</Button>
        </div>
      </Card>
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="set-stack">
      <Card title="Appearance" subtitle="Theme applies across this device and is saved to your account">
        <div className="set-theme">
          <button className={"set-theme__opt" + (theme !== "dark" ? " on" : "")} onClick={() => setTheme("light")}><span className="set-theme__sw set-theme__sw--light"><Sun size={16} /></span>Light</button>
          <button className={"set-theme__opt" + (theme === "dark" ? " on" : "")} onClick={() => setTheme("dark")}><span className="set-theme__sw set-theme__sw--dark"><Moon size={16} /></span>Dark</button>
        </div>
        <div className="prof-av__hint" style={{ marginTop: 12 }}>The polling-station kiosk always uses the dark theme for high-contrast focus.</div>
      </Card>
    </div>
  );
}

const CHANNELS = [
  { k: "inApp", label: "In-app", desc: "Bell menu & badges", icon: Bell },
  { k: "email", label: "Email", desc: "To your work email", icon: Mail },
  { k: "sms", label: "SMS", desc: "Critical alerts only", icon: MessageSquare },
];
const CATS = [
  { k: "catFraud", label: "Fraud & critical alerts", desc: "Impersonation, escalations", icon: ShieldAlert, tone: "rejected" },
  { k: "catDuplicate", label: "Duplicate registrations", desc: "1:N biometric matches", icon: Users, tone: "review" },
  { k: "catStation", label: "Station status", desc: "Offline / sync events", icon: RadioTower, tone: "info" },
  { k: "catReports", label: "Reports", desc: "Generation & schedules", icon: FileCheck2, tone: "approved" },
  { k: "catAudit", label: "Audit & integrity", desc: "Chain checks, exports", icon: ShieldCheck, tone: "approved" },
];
function NotificationsTab({ prefs, setPrefs }) {
  const toast = useToast();
  const save = async (next) => { setPrefs(next); try { await prefsApi.update(next); } catch (e) { toast.error(e); } };
  const toggleCh = (k) => save({ ...prefs, channels: { ...prefs.channels, [k]: !prefs.channels[k] } });
  const toggleCat = (k) => save({ ...prefs, categories: { ...prefs.categories, [k]: !prefs.categories[k] } });
  const toggleFlag = (k) => save({ ...prefs, [k]: !prefs[k] });
  return (
    <div className="set-stack">
      <Card title="Channels" subtitle="Where alerts are delivered">
        <div className="ch-grid">
          {CHANNELS.map((c) => (
            <div className={"ch" + (prefs.channels[c.k] ? " on" : "")} key={c.k}>
              <span className="ch__ic"><c.icon size={16} /></span>
              <div className="ch__tx"><div className="ch__l">{c.label}</div><div className="ch__d">{c.desc}</div></div>
              <Switch on={prefs.channels[c.k]} onClick={() => toggleCh(c.k)} />
            </div>
          ))}
        </div>
      </Card>
      <Card title="Categories" subtitle="Choose what you get notified about">
        <div className="cat-list">
          {CATS.map((c) => (
            <div className="cat" key={c.k}>
              <span className="cat__ic" style={{ background: `var(--status-${c.tone}-soft)`, color: `var(--status-${c.tone}-text)` }}><c.icon size={16} /></span>
              <div className="cat__tx"><div className="cat__l">{c.label}</div><div className="cat__d">{c.desc}</div></div>
              <Switch on={prefs.categories[c.k]} onClick={() => toggleCat(c.k)} />
            </div>
          ))}
        </div>
        <div className="set-divider" />
        <div className="cat" style={{ borderBottom: "none", padding: "4px 0" }}>
          <div className="cat__tx"><div className="cat__l">Critical alerts only</div><div className="cat__d">Mute everything below escalation level</div></div>
          <Switch on={prefs.criticalOnly} onClick={() => toggleFlag("criticalOnly")} />
        </div>
        <div className="cat" style={{ borderBottom: "none", padding: "4px 0" }}>
          <div className="cat__tx"><div className="cat__l">Daily email digest</div><div className="cat__d">A summary at 18:00 each day</div></div>
          <Switch on={prefs.digest} onClick={() => toggleFlag("digest")} />
        </div>
      </Card>
    </div>
  );
}

function SecurityTab() {
  const { user } = useAuth();
  const toast = useToast();
  const sessions = useApi(() => sessionsApi.list(), []);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const sessItems = listItems(sessions.data);
  const change = async () => {
    if (!pw.current || !pw.next) { toast.error("Fill both password fields"); return; }
    if (pw.next !== pw.confirm) { toast.error("New passwords don't match"); return; }
    setBusy(true);
    try { await authApi.changePassword(pw.current, pw.next); toast.success("Password changed"); setPw({ current: "", next: "", confirm: "" }); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  const revoke = async (id) => { try { await sessionsApi.revoke(id); toast.success("Session revoked"); sessions.reload(); } catch (e) { toast.error(e); } };
  return (
    <div className="set-stack">
      <Card title="Multi-factor authentication" subtitle="Required for all admin roles" headerEnd={<Badge tone={user?.mfa_enabled ? "green" : "neutral"} dot>{user?.mfa_enabled ? "Enabled" : "Disabled"}</Badge>}>
        <div className="sec-row"><span className="sec-row__ic"><Mail size={18} /></span><div className="sec-row__tx"><div className="sec-row__l">Email one-time passcode</div><div className="sec-row__d">A 6-digit code is emailed at each sign-in</div></div><Badge tone="green" size="sm" dot>Active</Badge></div>
        <div className="sec-row"><span className="sec-row__ic"><Lock size={18} /></span><div className="sec-row__tx"><div className="sec-row__l">Password</div><div className="sec-row__d">Change your account password below</div></div></div>
        <div className="set-form" style={{ marginTop: 14 }}>
          <Input label="Current password" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <div />
          <Input label="New password" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          <Input label="Confirm new password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
        </div>
        <div className="set-actions"><Button iconLeft={<KeyRound size={15} />} loading={busy} onClick={change}>Change password</Button></div>
      </Card>
      <Card title="Active sessions" subtitle="Devices signed in to your account">
        {sessItems.length === 0 ? (
          <div className="sec-row"><span className="sec-row__ic"><Monitor size={18} /></span><div className="sec-row__tx"><div className="sec-row__l">This device</div><div className="sec-row__d">No other active sessions recorded.</div></div><Badge tone="green" size="sm">CURRENT</Badge></div>
        ) : sessItems.map((s) => (
          <div className="sec-row" key={s.id}>
            <span className="sec-row__ic"><Monitor size={18} /></span>
            <div className="sec-row__tx"><div className="sec-row__l">{s.device || "Device"} {s.is_current && <Badge tone="green" size="sm" style={{ marginLeft: 6 }}>THIS DEVICE</Badge>}</div><div className="sec-row__d mono">{s.ip_address || "—"} · {s.location || "—"}</div></div>
            {!s.is_current && <button className="link-btn danger" onClick={() => revoke(s.id)}>Revoke</button>}
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ───────── the Settings MODAL ───────── */
export function SettingsModal({ tab = "account", setTab, onClose }) {
  const { user, role } = useAuth();
  const [prefs, setPrefs] = useState(null);
  useEffect(() => {
    if (tab === "notifications" && !prefs) prefsApi.get().then(setPrefs).catch(() => setPrefs(DEFAULT_PREFS));
  }, [tab, prefs]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  const active = SET_TABS.find((s) => s.id === tab) || SET_TABS[0];
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="set-modal" role="dialog" aria-modal="true">
        <aside className="set-modal__nav">
          <div className="set-modal__brand"><SettingsIcon size={18} /><span>Settings</span></div>
          <div className="set-modal__list">
            {SET_TABS.map((s) => (
              <button key={s.id} className={"set-nav__i" + (tab === s.id ? " active" : "")} onClick={() => setTab(s.id)}><s.icon size={17} />{s.label}</button>
            ))}
          </div>
          <div className="set-modal__id"><Avatar name={user?.full_name} size={34} /><div style={{ minWidth: 0 }}><div className="set-modal__n">{user?.full_name}</div><div className="set-modal__r">{role?.name || user?.role_id}{user?.mfa_enabled ? " · MFA on" : ""}</div></div></div>
        </aside>
        <section className="set-modal__main">
          <header className="set-modal__h">
            <div><h2>{active.label}</h2><div className="set-modal__sub">{active.sub}</div></div>
            <button className="dmodal__x" onClick={onClose} aria-label="Close"><X size={16} /></button>
          </header>
          <div className="set-modal__body">
            {tab === "account" && <AccountTab />}
            {tab === "appearance" && <AppearanceTab />}
            {tab === "notifications" && (prefs ? <NotificationsTab prefs={prefs} setPrefs={setPrefs} /> : null)}
            {tab === "security" && <SecurityTab />}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ───────── the gear settings panel (dropdown) ───────── */
export function SettingsPanel({ onOpen, onClose, onSignOut }) {
  const { user, role } = useAuth();
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState(null);
  useEffect(() => { prefsApi.get().then(setPrefs).catch(() => setPrefs(DEFAULT_PREFS)); }, []);
  const toggleFlag = (k) => { const next = { ...(prefs || DEFAULT_PREFS), [k]: !(prefs || DEFAULT_PREFS)[k] }; setPrefs(next); prefsApi.update({ [k]: next[k] }).catch(() => {}); };
  const p = prefs || DEFAULT_PREFS;
  return (
    <>
      <div className="pop-overlay" onClick={onClose} />
      <div className="spanel">
        <div className="set-id"><Avatar name={user?.full_name} size={42} /><div style={{ minWidth: 0 }}><div className="set-id__n">{user?.full_name}</div><div className="set-id__e">{user?.email}</div></div></div>
        <div className="set-role"><span className="set-role__b">{role?.name || user?.role_id}</span>{user?.mfa_enabled && <span className="set-role__mfa"><ShieldCheck size={14} /> MFA on</span>}</div>
        <div className="set-menu">
          {SET_TABS.map((t) => (
            <button key={t.id} className="set-item" onClick={() => onOpen(t.id)}><t.icon size={16} /><span>{t.label}</span><ChevronRight size={15} /></button>
          ))}
        </div>
        <div className="set-sec">Appearance</div>
        <div className="set-theme set-theme--panel">
          <button className={"set-theme__opt" + (theme !== "dark" ? " on" : "")} onClick={() => setTheme("light")}><span className="set-theme__sw set-theme__sw--light"><Sun size={14} /></span>Light</button>
          <button className={"set-theme__opt" + (theme === "dark" ? " on" : "")} onClick={() => setTheme("dark")}><span className="set-theme__sw set-theme__sw--dark"><Moon size={14} /></span>Dark</button>
        </div>
        <div className="set-sec">Quick preferences</div>
        <div className="set-toggle"><span><b>Critical alerts only</b><small>Mute info-level notifications</small></span><Switch on={p.criticalOnly} onClick={() => toggleFlag("criticalOnly")} /></div>
        <div className="set-toggle"><span><b>Daily email digest</b><small>Summary at 18:00 each day</small></span><Switch on={p.digest} onClick={() => toggleFlag("digest")} /></div>
        <div className="set-foot"><button className="set-signout" onClick={onSignOut}><LogOut size={16} /> Sign out</button></div>
      </div>
    </>
  );
}
