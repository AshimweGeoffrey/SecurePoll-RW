// AdminSettings.jsx — full Settings pages + notifications modal
const { useState: useStateSet } = React;
const DST = window.SecurePollRWDesignSystem_92875f;
const Ico = ({ n, s }) => <i data-lucide={n} style={s}></i>;

const SET_TABS = [
  { id: "account", label: "Account & profile", icon: "user-cog" },
  { id: "notifications", label: "Notifications", icon: "sliders-horizontal" },
  { id: "security", label: "Security & MFA", icon: "shield-check" },
];

function Switch({ on, onClick }) {
  return <button type="button" className="set-switch" data-on={on ? "1" : "0"} role="switch" aria-checked={on} onClick={onClick}><i></i></button>;
}
function Field({ label, children }) {
  return <div className="sf"><div className="sf__l">{label}</div><div className="sf__c">{children}</div></div>;
}

/* ---------- Account ---------- */
function AccountTab() {
  return (
    <div className="set-stack">
      <DST.Card title="Profile" subtitle="How you appear across the platform">
        <div className="prof-head">
          <div className="prof-av">MK</div>
          <div className="prof-av__act">
            <DST.Button size="sm" variant="secondary" iconLeft={<Ico n="upload" />}>Change photo</DST.Button>
            <span className="prof-av__hint">PNG or JPG · max 2&nbsp;MB</span>
          </div>
        </div>
        <div className="set-form">
          <DST.Input label="Full name" defaultValue="M. Kanyana" />
          <DST.Input label="Work email" defaultValue="m.kanyana@nec.gov.rw" iconLeft={<Ico n="mail" />} />
          <DST.Input label="Phone" defaultValue="+250 788 000 000" mono />
          <DST.Select label="Preferred language" options={["English", "Kinyarwanda", "Français"]} />
          <DST.Select label="Time zone" options={["CAT — Kigali (UTC+2)", "UTC", "EAT — Nairobi (UTC+3)"]} />
          <DST.Select label="Default region" options={["National", "Kigali City", "Northern", "Southern", "Eastern", "Western"]} />
        </div>
      </DST.Card>
      <DST.Card title="Role & access" subtitle="Managed by a Super Admin">
        <div className="ro-grid">
          <Field label="Assigned role"><DST.Badge tone="green" dot>Auditor</DST.Badge></Field>
          <Field label="Clearance"><span className="ro-v">Tier 3 · read-all + verify</span></Field>
          <Field label="Member since"><span className="ro-v mono">2024-03-11</span></Field>
          <Field label="Approver"><span className="ro-v">E. Mugisha (Super Admin)</span></Field>
        </div>
        <div className="set-actions">
          <DST.Button iconLeft={<Ico n="check" />}>Save changes</DST.Button>
          <DST.Button variant="ghost">Discard</DST.Button>
        </div>
      </DST.Card>
    </div>
  );
}

/* ---------- Notifications ---------- */
const NOTIF_CHANNELS = [
  { k: "inApp", label: "In-app", desc: "Bell menu & badges", icon: "bell" },
  { k: "email", label: "Email", desc: "m.kanyana@nec.gov.rw", icon: "mail" },
  { k: "sms", label: "SMS", desc: "Critical alerts only", icon: "message-square" },
];
const NOTIF_CATS = [
  { k: "catFraud", label: "Fraud & critical alerts", desc: "Impersonation, escalations", icon: "shield-alert", tone: "red" },
  { k: "catDuplicate", label: "Duplicate registrations", desc: "1:N biometric matches", icon: "users", tone: "amber" },
  { k: "catStation", label: "Station status", desc: "Offline / sync events", icon: "radio-tower", tone: "blue" },
  { k: "catReports", label: "Reports", desc: "Generation & schedules", icon: "file-check-2", tone: "green" },
  { k: "catAudit", label: "Audit & integrity", desc: "Chain checks, exports", icon: "shield-check", tone: "green" },
];
function NotificationsTab({ prefs, onToggle }) {
  return (
    <div className="set-stack">
      <DST.Card title="Channels" subtitle="Where alerts are delivered">
        <div className="ch-grid">
          {NOTIF_CHANNELS.map((c) => (
            <div className={"ch" + (prefs[c.k] ? " on" : "")} key={c.k}>
              <span className="ch__ic"><Ico n={c.icon} /></span>
              <div className="ch__tx"><div className="ch__l">{c.label}</div><div className="ch__d">{c.desc}</div></div>
              <Switch on={prefs[c.k]} onClick={() => onToggle(c.k)} />
            </div>
          ))}
        </div>
      </DST.Card>
      <DST.Card title="Categories" subtitle="Choose what you get notified about">
        <div className="cat-list">
          {NOTIF_CATS.map((c) => (
            <div className="cat" key={c.k}>
              <span className="cat__ic" style={{ background: "var(--status-" + (c.tone === "green" ? "approved" : c.tone === "red" ? "rejected" : c.tone === "amber" ? "review" : "info") + "-soft)", color: "var(--status-" + (c.tone === "green" ? "approved" : c.tone === "red" ? "rejected" : c.tone === "amber" ? "review" : "info") + "-text)" }}><Ico n={c.icon} /></span>
              <div className="cat__tx"><div className="cat__l">{c.label}</div><div className="cat__d">{c.desc}</div></div>
              <Switch on={prefs[c.k]} onClick={() => onToggle(c.k)} />
            </div>
          ))}
        </div>
        <div className="set-divider"></div>
        <div className="cat" style={{ padding: "4px 0" }}>
          <div className="cat__tx"><div className="cat__l">Critical alerts only</div><div className="cat__d">Mute everything below escalation level</div></div>
          <Switch on={prefs.criticalOnly} onClick={() => onToggle("criticalOnly")} />
        </div>
        <div className="cat" style={{ padding: "10px 0 4px" }}>
          <div className="cat__tx"><div className="cat__l">Daily email digest</div><div className="cat__d">A summary at 18:00 each day</div></div>
          <Switch on={prefs.digest} onClick={() => onToggle("digest")} />
        </div>
      </DST.Card>
    </div>
  );
}

/* ---------- Security ---------- */
const SESSIONS = [
  { dev: "MacBook Pro · Chrome", loc: "Kigali, RW · 41.75.x.x", last: "Active now", cur: true },
  { dev: "iPhone 15 · SecurePoll app", loc: "Kigali, RW", last: "12m ago", cur: false },
  { dev: "Windows · Edge", loc: "Musanze, RW", last: "Yesterday 19:04", cur: false },
];
function SecurityTab() {
  return (
    <div className="set-stack">
      <DST.Card title="Multi-factor authentication" subtitle="Required for all admin roles"
        headerEnd={<DST.Badge tone="green" dot>Enabled</DST.Badge>}>
        <div className="sec-row">
          <span className="sec-row__ic"><Ico n="smartphone" /></span>
          <div className="sec-row__tx"><div className="sec-row__l">Authenticator app</div><div className="sec-row__d">TOTP · added 2024-03-11</div></div>
          <DST.Button size="sm" variant="secondary">Reconfigure</DST.Button>
        </div>
        <div className="sec-row">
          <span className="sec-row__ic"><Ico n="key-round" /></span>
          <div className="sec-row__tx"><div className="sec-row__l">Recovery codes</div><div className="sec-row__d">8 of 10 unused</div></div>
          <DST.Button size="sm" variant="ghost">View codes</DST.Button>
        </div>
        <div className="sec-row">
          <span className="sec-row__ic"><Ico n="lock" /></span>
          <div className="sec-row__tx"><div className="sec-row__l">Password</div><div className="sec-row__d">Last changed 38 days ago</div></div>
          <DST.Button size="sm" variant="ghost">Change</DST.Button>
        </div>
      </DST.Card>
      <DST.Card title="Active sessions" subtitle="Devices signed in to your account"
        headerEnd={<DST.Button size="sm" variant="danger" iconLeft={<Ico n="log-out" />}>Revoke all others</DST.Button>}>
        <table className="tbl">
          <thead><tr><th>Device</th><th>Location</th><th>Last active</th><th></th></tr></thead>
          <tbody>
            {SESSIONS.map((s, i) => (
              <tr key={i}>
                <td className="nm">{s.dev}{s.cur && <DST.Badge tone="green" size="sm" style={{ marginLeft: 8 }}>THIS DEVICE</DST.Badge>}</td>
                <td>{s.loc}</td>
                <td className="mono">{s.last}</td>
                <td style={{ textAlign: "right" }}>{!s.cur && <button className="link-btn">Revoke</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DST.Card>
    </div>
  );
}

/* ---------- API ---------- */
const API_KEYS = [
  { name: "Tally service (prod)", key: "sk_live_••••••••4f9c", created: "2025-11-02", used: "2m ago", tone: "green" },
  { name: "Observer dashboard (read)", key: "sk_live_••••••••a18e", created: "2025-12-14", used: "1h ago", tone: "green" },
  { name: "Legacy export script", key: "sk_live_••••••••0d22", created: "2024-08-01", used: "94 days ago", tone: "amber" },
];
const WEBHOOKS = [
  { url: "https://ops.nec.gov.rw/hooks/fraud", ev: "fraud.flagged", tone: "green", st: "ACTIVE" },
  { url: "https://tally.nec.gov.rw/hooks/turnout", ev: "turnout.synced", tone: "green", st: "ACTIVE" },
];
function ApiTab() {
  return (
    <div className="set-stack">
      <DST.Card title="API keys" subtitle="Server-to-server access · scoped & revocable"
        headerEnd={<DST.Button size="sm" iconLeft={<Ico n="plus" />}>Generate key</DST.Button>}>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Key</th><th>Created</th><th>Last used</th><th></th></tr></thead>
          <tbody>
            {API_KEYS.map((k, i) => (
              <tr key={i}>
                <td className="nm">{k.name}</td>
                <td className="mono">{k.key}</td>
                <td className="mono">{k.created}</td>
                <td><DST.Badge tone={k.tone} size="sm" dot>{k.used}</DST.Badge></td>
                <td style={{ textAlign: "right" }}><button className="link-btn danger">Revoke</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DST.Card>
      <DST.Card title="Webhooks" subtitle="Outbound event delivery"
        headerEnd={<DST.Button size="sm" variant="secondary" iconLeft={<Ico n="plus" />}>Add endpoint</DST.Button>}>
        <div className="hook-list">
          {WEBHOOKS.map((w, i) => (
            <div className="hook" key={i}>
              <span className="hook__ic"><Ico n="webhook" /></span>
              <div className="hook__tx"><div className="hook__url mono">{w.url}</div><div className="hook__ev">on <b>{w.ev}</b></div></div>
              <DST.Badge tone={w.tone} size="sm" dot>{w.st}</DST.Badge>
            </div>
          ))}
        </div>
      </DST.Card>
    </div>
  );
}

/* ---------- Help ---------- */
const HELP_LINKS = [
  { icon: "book-open", t: "Admin handbook", d: "Workflows, roles & escalation paths" },
  { icon: "code-2", t: "API reference", d: "Endpoints, auth & webhooks" },
  { icon: "graduation-cap", t: "Training & onboarding", d: "Guided tours for new auditors" },
  { icon: "scale", t: "Compliance & legal", d: "Data handling & retention policy" },
];
function HelpTab() {
  return (
    <div className="set-stack">
      <DST.Card title="Documentation" subtitle="Guides for the SecurePoll RW platform">
        <div className="help-grid">
          {HELP_LINKS.map((h, i) => (
            <button className="help-card" key={i}>
              <span className="help-card__ic"><Ico n={h.icon} /></span>
              <div className="help-card__t">{h.t}</div>
              <div className="help-card__d">{h.d}</div>
              <Ico n="arrow-up-right" s={{ width: 15, height: 15, position: "absolute", top: 14, right: 14, color: "var(--text-subtle)" }} />
            </button>
          ))}
        </div>
      </DST.Card>
      <DST.Card title="Contact support" subtitle="Election Commission IT desk"
        headerEnd={<DST.Badge tone="green" dot>Online</DST.Badge>}>
        <div className="sec-row">
          <span className="sec-row__ic"><Ico n="headset" /></span>
          <div className="sec-row__tx"><div className="sec-row__l">Priority line — critical incidents</div><div className="sec-row__d mono">+250 788 100 100 · 24/7 during polls</div></div>
          <DST.Button size="sm" variant="secondary" iconLeft={<Ico n="message-circle" />}>Open ticket</DST.Button>
        </div>
        <div className="sec-row">
          <span className="sec-row__ic"><Ico n="info" /></span>
          <div className="sec-row__tx"><div className="sec-row__l">System status</div><div className="sec-row__d">All services operational · v3.8.1</div></div>
          <DST.Button size="sm" variant="ghost">Status page</DST.Button>
        </div>
      </DST.Card>
    </div>
  );
}

function SettingsView({ tab, setTab, prefs, onToggle }) {
  React.useEffect(() => { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }, [tab]);
  return (
    <div className="set-page">
      <aside className="set-nav">
        {SET_TABS.map((s) => (
          <button key={s.id} className={"set-nav__i" + (tab === s.id ? " active" : "")} onClick={() => setTab(s.id)}>
            <Ico n={s.icon} />{s.label}
          </button>
        ))}
      </aside>
      <div className="set-body">
        {tab === "account" && <AccountTab />}
        {tab === "notifications" && <NotificationsTab prefs={prefs} onToggle={onToggle} />}
        {tab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}

/* ---------- Settings modal ---------- */
function SettingsModal({ tab, setTab, prefs, onToggle, onClose }) {
  React.useEffect(() => { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }, [tab]);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const active = SET_TABS.find((s) => s.id === tab) || SET_TABS[0];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="set-modal" onClick={(e) => e.stopPropagation()}>
        <aside className="set-modal__nav">
          <div className="set-modal__brand"><Ico n="settings" /><span>Settings</span></div>
          <div className="set-modal__list">
            {SET_TABS.map((s) => (
              <button key={s.id} className={"set-nav__i" + (tab === s.id ? " active" : "")} onClick={() => setTab(s.id)}>
                <Ico n={s.icon} />{s.label}
              </button>
            ))}
          </div>
          <div className="set-modal__id">
            <div className="set-modal__av">MK</div>
            <div><div className="set-modal__n">M. Kanyana</div><div className="set-modal__r">Auditor · MFA on</div></div>
          </div>
        </aside>
        <section className="set-modal__main">
          <header className="set-modal__h">
            <div>
              <h2>{active.label}</h2>
              <div className="set-modal__sub">{SET_SUBS[tab]}</div>
            </div>
            <button className="modal__x" onClick={onClose} aria-label="Close"><Ico n="x" /></button>
          </header>
          <div className="set-modal__body">
            {tab === "account" && <AccountTab />}
            {tab === "notifications" && <NotificationsTab prefs={prefs} onToggle={onToggle} />}
            {tab === "security" && <SecurityTab />}
          </div>
        </section>
      </div>
    </div>
  );
}
const SET_SUBS = {
  account: "Manage your profile, role & regional defaults",
  notifications: "Channels and categories you get alerted on",
  security: "MFA, recovery and active sessions",
};

/* ---------- Notifications modal ---------- */
const N_TINTS = {
  red: { bg: "var(--status-rejected-soft)", fg: "var(--status-rejected-text)" },
  amber: { bg: "var(--status-review-soft)", fg: "var(--status-review-text)" },
  blue: { bg: "var(--status-info-soft)", fg: "var(--status-info-text)" },
  green: { bg: "var(--status-approved-soft)", fg: "var(--status-approved-text)" },
};
function NotificationsModal({ notifs, onMarkAll, onRead, onClose, onSettings }) {
  const [filter, setFilter] = useStateSet("all");
  React.useEffect(() => { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }, [filter]);
  const unread = notifs.filter((n) => !n.read).length;
  const shown = notifs.filter((n) => filter === "all" || (filter === "unread" && !n.read) || (filter === "critical" && n.tone === "red"));
  const FILTERS = [["all", "All", notifs.length], ["unread", "Unread", unread], ["critical", "Critical", notifs.filter((n) => n.tone === "red").length]];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div>
            <h2>Notifications</h2>
            <div className="modal__sub">{unread} unread · {notifs.length} total</div>
          </div>
          <button className="modal__x" onClick={onClose} aria-label="Close"><Ico n="x" /></button>
        </div>
        <div className="modal__bar">
          <div className="nfilters">
            {FILTERS.map(([id, lbl, ct]) => (
              <button key={id} className={"nfilter" + (filter === id ? " on" : "")} onClick={() => setFilter(id)}>{lbl}<span className="nfilter__c">{ct}</span></button>
            ))}
          </div>
          <button className="pop__act" onClick={onMarkAll} disabled={unread === 0}>Mark all read</button>
        </div>
        <div className="modal__body">
          {shown.length === 0 && <div className="modal__empty"><Ico n="inbox" s={{ width: 26, height: 26 }} /><p>Nothing here — you're all caught up.</p></div>}
          {shown.map((n) => (
            <button className={"notif" + (n.read ? "" : " unread")} key={n.id} onClick={() => onRead(n.id)}>
              <span className="notif__ic" style={{ background: N_TINTS[n.tone].bg, color: N_TINTS[n.tone].fg }}><Ico n={n.icon} /></span>
              <div className="notif__tx">
                <div className="notif__h"><span className="notif__title">{n.title}</span><span className="notif__time">{n.time}</span></div>
                <div className="notif__desc">{n.desc}</div>
              </div>
              {!n.read && <span className="notif__dot"></span>}
            </button>
          ))}
        </div>
        <div className="modal__f">
          <button className="pop__link" onClick={onSettings}><Ico n="sliders-horizontal" s={{ width: 15, height: 15, marginRight: 7, verticalAlign: "-2px" }} />Notification preferences</button>
        </div>
      </div>
    </div>
  );
}

window.AdminSettings = { SettingsView, SettingsModal, NotificationsModal, SET_TABS };
