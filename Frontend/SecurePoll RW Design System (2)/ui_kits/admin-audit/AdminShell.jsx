// AdminShell.jsx — sidebar + topbar shell with view switching
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;
const { Input: ShellInput } = window.SecurePollRWDesignSystem_92875f;
const Icn = ({ n }) => <i data-lucide={n}></i>;

const ACCENTS = {
  "#16924f": ["#16924f", "#0f7740", "#0c5f34"], // electoral green (default)
  "#2563d9": ["#2563d9", "#1b4cb3", "#163d8f"], // civic blue
  "#6b3fd6": ["#6b3fd6", "#5a32bd", "#4a28a0"], // violet
};
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "#16924f",
  "density": "comfortable",
  "radius": 12
}/*EDITMODE-END*/;

const NAV = [
  { grp: "Monitor", items: [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "fraud", label: "Fraud detection", icon: "shield-alert", count: 9 },
  ]},
  { grp: "Manage", items: [
    { id: "registry", label: "Voter registry", icon: "users" },
    { id: "audit", label: "Audit log", icon: "file-check-2" },
  ]},
];
const EXTRA = [
  { id: "reporting", label: "Reporting", icon: "bar-chart-3" },
  { id: "users", label: "Users & roles", icon: "key-round" },
  { id: "encryption", label: "Encryption", icon: "lock" },
];
const TITLES = {
  dashboard: ["Dashboard", "Real-time national overview"],
  fraud: ["Fraud detection", "AI-flagged cases · risk-ranked"],
  registry: ["Voter registry", "Single source of truth · 8.42M records"],
  audit: ["Audit log", "Append-only · cryptographically verified"],
  reporting: ["Reporting", "Build, schedule & export official reports"],
  users: ["Users & roles", "Administrators · permission sets · MFA"],
  encryption: ["Encryption", "Key custody · HSM · data protection"],
};
// Topbar search only appears where it adds value. Registry, Reporting and
// Encryption omit it — Registry has its own dedicated search field, the others
// have nothing to search.
const SEARCH = {
  dashboard: "Search across all services…",
  fraud: "Search cases by ID or station…",
  audit: "Search audit entries…",
  users: "Search users by name or email…",
};

const NOTIF_TINTS = {
  red:   { bg: "var(--status-rejected-soft)", fg: "var(--status-rejected-text)" },
  amber: { bg: "var(--status-review-soft)",   fg: "var(--status-review-text)" },
  blue:  { bg: "var(--status-info-soft)",     fg: "var(--status-info-text)" },
  green: { bg: "var(--status-approved-soft)", fg: "var(--status-approved-text)" },
};
const NOTIFS_INIT = [
  { id: 1, tone: "red", icon: "shield-alert", title: "Critical fraud alert", desc: "FR-4471 · possible impersonation at PS-077", time: "2m", read: false },
  { id: 2, tone: "amber", icon: "users", title: "Duplicate registration flagged", desc: "1:N match · reg #20451 ↔ #18992", time: "8m", read: false },
  { id: 3, tone: "blue", icon: "radio-tower", title: "Station back online", desc: "PS-203 resumed sync after 4 min offline", time: "21m", read: false },
  { id: 4, tone: "green", icon: "file-check-2", title: "Report ready", desc: "National turnout — 14:00 snapshot (PDF)", time: "1h", read: true },
  { id: 5, tone: "green", icon: "shield-check", title: "Chain integrity verified", desc: "8.41M audit entries · 0 breaks detected", time: "2h", read: true },
];
const SETTINGS_MENU = [
  { icon: "user-cog", label: "Account & profile", tab: "account" },
  { icon: "sliders-horizontal", label: "Notification preferences", tab: "notifications" },
  { icon: "shield-check", label: "Security & MFA", note: "On", tab: "security" },
];

function NotifPanel({ notifs, onMarkAll, onRead, onViewAll }) {
  const unread = notifs.filter((n) => !n.read).length;
  return (
    <div className="pop pop--notif" onClick={(e) => e.stopPropagation()}>
      <div className="pop__h">
        <div className="pop__t">Notifications {unread > 0 && <span className="pop__count">{unread} new</span>}</div>
        <button className="pop__act" onClick={onMarkAll} disabled={unread === 0}>Mark all read</button>
      </div>
      <div className="notif-list">
        {notifs.map((n) => (
          <button className={"notif" + (n.read ? "" : " unread")} key={n.id} onClick={() => onRead(n.id)}>
            <span className="notif__ic" style={{ background: NOTIF_TINTS[n.tone].bg, color: NOTIF_TINTS[n.tone].fg }}><Icn n={n.icon} /></span>
            <div className="notif__tx">
              <div className="notif__h"><span className="notif__title">{n.title}</span><span className="notif__time">{n.time}</span></div>
              <div className="notif__desc">{n.desc}</div>
            </div>
            {!n.read && <span className="notif__dot"></span>}
          </button>
        ))}
      </div>
      <div className="pop__f"><button className="pop__link" onClick={onViewAll}>View all notifications</button></div>
    </div>
  );
}

function SettingsPanel({ prefs, onToggle, onNavigate, theme, onTheme }) {
  return (
    <div className="pop pop--settings" onClick={(e) => e.stopPropagation()}>
      <div className="set-id">
        <div className="set-id__av">MK</div>
        <div className="set-id__tx">
          <div className="set-id__n">M. Kanyana</div>
          <div className="set-id__e">m.kanyana@nec.gov.rw</div>
        </div>
      </div>
      <div className="set-role"><span className="set-role__b">Auditor</span><span className="set-role__mfa"><Icn n="shield-check" />MFA on</span></div>
      <div className="set-menu">
        {SETTINGS_MENU.map((m, i) => (
          <button className="set-item" key={i} onClick={() => onNavigate(m.tab)}>
            <Icn n={m.icon} /><span>{m.label}</span>
            {m.note ? <span className="set-item__note">{m.note}</span> : <Icn n="chevron-right" />}
          </button>
        ))}
      </div>
      <div className="set-sec">Appearance</div>
      <div className="set-theme">
        <button type="button" className={"set-theme__opt" + (theme !== "dark" ? " on" : "")} onClick={() => onTheme("light")}>
          <span className="set-theme__sw set-theme__sw--light"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line></svg></span>Light
        </button>
        <button type="button" className={"set-theme__opt" + (theme === "dark" ? " on" : "")} onClick={() => onTheme("dark")}>
          <span className="set-theme__sw set-theme__sw--dark"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>Dark
        </button>
      </div>
      <div className="set-sec">Quick preferences</div>
      <label className="set-toggle">
        <span><b>Critical alerts only</b><small>Mute info-level notifications</small></span>
        <button type="button" className="set-switch" data-on={prefs.criticalOnly ? "1" : "0"} role="switch" aria-checked={prefs.criticalOnly} onClick={() => onToggle("criticalOnly")}><i></i></button>
      </label>
      <label className="set-toggle">
        <span><b>Daily email digest</b><small>Summary at 18:00 each day</small></span>
        <button type="button" className="set-switch" data-on={prefs.digest ? "1" : "0"} role="switch" aria-checked={prefs.digest} onClick={() => onToggle("digest")}><i></i></button>
      </label>
      <div className="set-foot"><button className="set-signout" onClick={() => { window.location.href = "admin-login.html"; }}><Icn n="log-out" />Sign out</button></div>
    </div>
  );
}

function AdminShell() {
  const [view, setView] = useStateS("dashboard");
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [panel, setPanel] = useStateS(null); // null | "notif" | "settings"
  const [notifs, setNotifs] = useStateS(NOTIFS_INIT);
  const [prefs, setPrefs] = useStateS({
    criticalOnly: false, digest: true,
    inApp: true, email: true, sms: false,
    catFraud: true, catDuplicate: true, catStation: true, catReports: true, catAudit: false,
  });
  const [settingsTab, setSettingsTab] = useStateS("account");
  const [modal, setModal] = useStateS(null); // null | "notifs" | "settings"
  const rootRef = useRefS(null);
  useEffectS(() => { setTimeout(() => window.lucide && window.lucide.createIcons(), 30); }, [view, panel, modal, t.theme]);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const markAll = () => setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
  const readOne = (id) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const togglePref = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const openSettings = (tab) => { setSettingsTab(tab || "account"); setModal("settings"); setPanel(null); };

  // apply tweaks
  useEffectS(() => {
    const dark = t.theme === "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "";
    try { localStorage.setItem("sp-theme", dark ? "dark" : "light"); } catch (e) {}
  }, [t.theme]);
  useEffectS(() => {
    const el = rootRef.current; if (!el) return;
    const [p, h, pr] = ACCENTS[t.accent] || ACCENTS["#16924f"];
    el.style.setProperty("--primary", p);
    el.style.setProperty("--primary-hover", h);
    el.style.setProperty("--primary-press", pr);
    el.style.setProperty("--primary-soft", `color-mix(in srgb, ${p} 12%, var(--bg-surface))`);
    el.style.setProperty("--primary-soft-border", `color-mix(in srgb, ${p} 32%, var(--bg-surface))`);
    el.style.setProperty("--primary-text", `color-mix(in srgb, ${p} 66%, var(--text-strong))`);
    el.style.setProperty("--ring", `color-mix(in oklab, ${p} 55%, transparent)`);
  }, [t.accent, t.theme]);
  useEffectS(() => {
    const el = rootRef.current; if (!el) return;
    const r = t.radius;
    el.style.setProperty("--radius-lg", r + "px");
    el.style.setProperty("--radius-md", Math.round(r * 0.66) + "px");
    el.style.setProperty("--radius-sm", Math.round(r * 0.42) + "px");
  }, [t.radius]);

  const S = window.AdminScreens;
  const [title, sub] = TITLES[view] || ["Reporting", ""];
  return (
    <div className={"admin" + (t.density === "compact" ? " dense" : "")} ref={rootRef}>
      <aside className="side">
        <button className="side__brand" onClick={() => setView("dashboard")} aria-label="Go to dashboard"><img src="../../assets/mark.svg" alt="" /><span className="nm">SecurePoll</span></button>
        {NAV.map((g) => (
          <div key={g.grp}>
            <div className="side__grp">{g.grp}</div>
            {g.items.map((it) => (
              <button key={it.id} className={"side__item" + (view === it.id ? " active" : "")} onClick={() => setView(it.id)}>
                <Icn n={it.icon} />{it.label}
                {it.count && <span className="count">{it.count}</span>}
              </button>
            ))}
          </div>
        ))}
        <div className="side__grp">Analyze</div>
        {EXTRA.map((it) => (
          <button key={it.id} className={"side__item" + (view === it.id ? " active" : "")} onClick={() => setView(it.id)}>
            <Icn n={it.icon} />{it.label}
          </button>
        ))}
        <div className="side__user">
          <div className="av">MK</div>
          <div><div className="un">M. Kanyana</div><div className="ur">Auditor · MFA</div></div>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <div className="sub">{sub}</div>
          </div>
          <div className="topbar__end">
            {SEARCH[view] && <div className="topbar__search"><ShellInput iconLeft={<Icn n="search" />} placeholder={SEARCH[view]} /></div>}
            <button className={"icon-btn" + (panel === "notif" ? " on" : "")} onClick={() => setPanel((p) => (p === "notif" ? null : "notif"))} aria-label="Notifications">
              <Icn n="bell" />{unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
            </button>
            <button className={"icon-btn" + (panel === "settings" ? " on" : "")} onClick={() => setPanel((p) => (p === "settings" ? null : "settings"))} aria-label="Settings">
              <Icn n="settings" />
            </button>
          </div>
          {panel && <div className="pop-overlay" onClick={() => setPanel(null)}></div>}
          {panel === "notif" && <NotifPanel notifs={notifs} onMarkAll={markAll} onRead={readOne} onViewAll={() => { setModal("notifs"); setPanel(null); }} />}
          {panel === "settings" && <SettingsPanel prefs={prefs} onToggle={togglePref} onNavigate={openSettings} theme={t.theme} onTheme={(v) => setTweak("theme", v)} />}
        </header>
        <div className="content">
          {view === "dashboard" && <S.DashboardView />}
          {view === "fraud" && <S.FraudView />}
          {view === "registry" && <S.RegistryView />}
          {view === "audit" && <S.AuditView />}
          {view === "reporting" && <S.ReportingView />}
          {view === "users" && <S.UsersView />}
          {view === "encryption" && <S.EncryptionView />}
        </div>
      </div>
      {modal === "settings" && (
        <window.AdminSettings.SettingsModal
          tab={settingsTab} setTab={setSettingsTab} prefs={prefs} onToggle={togglePref}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "notifs" && (
        <window.AdminSettings.NotificationsModal
          notifs={notifs} onMarkAll={markAll} onRead={readOne}
          onClose={() => setModal(null)}
          onSettings={() => { setModal(null); openSettings("notifications"); }}
        />
      )}
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Theme" />
        <window.TweakRadio label="Mode" value={t.theme} options={["light", "dark"]} onChange={(v) => setTweak("theme", v)} />
        <window.TweakColor label="Accent" value={t.accent} options={Object.keys(ACCENTS)} onChange={(v) => setTweak("accent", v)} />
        <window.TweakSection label="Layout" />
        <window.TweakRadio label="Density" value={t.density} options={["comfortable", "compact"]} onChange={(v) => setTweak("density", v)} />
        <window.TweakSlider label="Corner radius" value={t.radius} min={0} max={18} unit="px" onChange={(v) => setTweak("radius", v)} />
      </window.TweaksPanel>
    </div>
  );
}
window.AdminShell = AdminShell;
