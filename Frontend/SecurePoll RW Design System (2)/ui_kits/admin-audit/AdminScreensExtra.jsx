// AdminScreensExtra.jsx — Reporting, Users & roles, Encryption views
const { useEffect: useEffectX, useState: useStateX } = React;
const DSX = window.SecurePollRWDesignSystem_92875f;
const FWX = window.FraudWidgets;
const IX = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lucideX() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

/* ============================= REPORTING ============================= */
const RPT_CATS = [
  { id: "turnout", label: "Turnout report", icon: "users", desc: "By district & hour", tint: { bg: "var(--primary-soft)", fg: "var(--primary-text)" } },
  { id: "verify", label: "Verification", icon: "badge-check", desc: "Outcomes & throughput", tint: { bg: "var(--secondary-soft)", fg: "var(--secondary-text)" } },
  { id: "fraud", label: "Fraud & cases", icon: "shield-alert", desc: "Flagged & resolved", tint: { bg: "var(--status-review-soft)", fg: "var(--status-review-text)" } },
  { id: "audit", label: "Audit export", icon: "file-check-2", desc: "Signed log range", tint: { bg: "var(--status-approved-soft)", fg: "var(--status-approved-text)" } },
];
const RPT_PREVIEW = {
  turnout: { stats: [["Total turnout", "62.4%"], ["Peak hour", "12:00–13:00"], ["Highest district", "Gasabo · 71%"], ["Lowest district", "Burera · 48%"]], bars: [41, 58, 71, 66, 52, 38, 29] },
  verify: { stats: [["Verifications", "1.84M"], ["Auto-approved", "93.0%"], ["Manual review", "101k"], ["Avg. latency", "1.4s"]], bars: [62, 70, 88, 91, 84, 60, 44] },
  fraud: { stats: [["Cases opened", "37"], ["Critical", "9"], ["Resolved", "21"], ["False-positive rate", "11%"]], bars: [9, 14, 22, 18, 12, 7, 5] },
  audit: { stats: [["Entries in range", "8.41M"], ["Chain breaks", "0"], ["Format", "Signed CSV + JWS"], ["Coverage", "All services"]], bars: [50, 55, 60, 58, 62, 66, 70] },
};
const RPT_RECENT = [
  { name: "National turnout — 14:00 snapshot", who: "M. Kanyana", when: "14:05", fmt: "PDF", tone: "green", st: "READY" },
  { name: "Verification outcomes — daily", who: "Scheduled", when: "12:00", fmt: "XLSX", tone: "green", st: "READY" },
  { name: "Fraud case digest — week 21", who: "A. Uwase", when: "11:42", fmt: "PDF", tone: "amber", st: "GENERATING" },
  { name: "Audit export — 06:00–12:00", who: "Scheduled", when: "12:00", fmt: "CSV", tone: "green", st: "READY" },
];

function ReportingView() {
  const [cat, setCat] = useStateX("turnout");
  const [fmt, setFmt] = useStateX("PDF");
  useEffectX(lucideX, [cat, fmt]);
  const pv = RPT_PREVIEW[cat];
  const active = RPT_CATS.find((c) => c.id === cat);
  return (
    <div>
      <div className="rpt-cats">
        {RPT_CATS.map((c) => (
          <button key={c.id} className={"rpt-cat" + (c.id === cat ? " sel" : "")} onClick={() => setCat(c.id)}>
            <span className="rpt-cat__ic" style={{ background: c.tint.bg, color: c.tint.fg }}><IX n={c.icon} /></span>
            <div className="rpt-cat__tx"><div className="t">{c.label}</div><div className="d">{c.desc}</div></div>
            <i data-lucide="check" className="rpt-cat__chk"></i>
          </button>
        ))}
      </div>
      <div className="cols" style={{ alignItems: "start" }}>
        <DSX.Card title="Configure report" subtitle={active.label}>
          <div className="form-grid">
            <DSX.Select label="Date range" options={["Today (live)", "Yesterday", "Last 7 days", "Custom range…"]} />
            <DSX.Select label="Region" options={["All districts", "Kigali City", "Northern", "Southern", "Eastern", "Western"]} />
            <DSX.Select label="Granularity" options={["By district", "By constituency", "By polling station", "Hourly"]} />
            <div>
              <div className="fld-lbl">Format</div>
              <div className="seg">
                {["PDF", "XLSX", "CSV"].map((f) => (
                  <button key={f} className={"seg__b" + (fmt === f ? " on" : "")} onClick={() => setFmt(f)}>{f}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="opt-row">
            <label className="chk"><input type="checkbox" defaultChecked /><span className="chk__box"></span><span className="chk__t">Include signed integrity hash</span></label>
            <label className="chk"><input type="checkbox" /><span className="chk__box"></span><span className="chk__t">Schedule daily at 12:00</span></label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <DSX.Button iconLeft={<IX n="file-down" />}>Generate {fmt}</DSX.Button>
            <DSX.Button variant="ghost" iconLeft={<IX n="calendar-clock" />}>Schedule</DSX.Button>
          </div>
        </DSX.Card>
        <DSX.Card title="Preview" subtitle="Estimated · refreshes on generate" headerEnd={<DSX.Badge tone="blue" size="sm">DRAFT</DSX.Badge>}>
          <div className="mini-bars">
            {pv.bars.map((v, i) => {
              const mx = Math.max(...pv.bars);
              return <div className="mb-col" key={i}><div className="mb" style={{ height: Math.round(Math.max(v / mx, 0.06) * 100) + "%" }}></div></div>;
            })}
          </div>
          <div className="stat-lines">
            {pv.stats.map((s, i) => (
              <div className="stat-line" key={i}><span className="k">{s[0]}</span><span className="v">{s[1]}</span></div>
            ))}
          </div>
        </DSX.Card>
      </div>
      <div style={{ height: 16 }}></div>
      {window.TurnoutDemographics ? <window.TurnoutDemographics /> : null}
      <div style={{ height: 16 }}></div>
      {window.ReportBuilder ? <window.ReportBuilder /> : null}
      <div style={{ height: 16 }}></div>
      <DSX.Card title="Geographic distribution" subtitle="Fraud cases by district · feeds the fraud & cases report"
        headerEnd={<DSX.Badge tone="red" size="sm" dot>HEATMAP</DSX.Badge>}>
        <FWX.FraudHeatmap />
      </DSX.Card>
      <div style={{ height: 16 }}></div>
      <DSX.Card title="Recent reports" subtitle="Generated & scheduled"
        headerEnd={<DSX.Button size="sm" variant="secondary" iconLeft={<IX n="history" />}>View all</DSX.Button>}>
        <table className="tbl">
          <thead><tr><th>Report</th><th>Requested by</th><th>Time</th><th>Format</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {RPT_RECENT.map((r, i) => (
              <tr className="row-hover" key={i}>
                <td className="nm">{r.name}</td>
                <td>{r.who}</td>
                <td className="mono">{r.when}</td>
                <td><DSX.Badge tone="neutral" size="sm">{r.fmt}</DSX.Badge></td>
                <td><DSX.Badge tone={r.tone} size="sm" dot>{r.st}</DSX.Badge></td>
                <td style={{ textAlign: "right" }}><IX n={r.st === "READY" ? "download" : "loader"} s={{ width: 15, height: 15, color: "var(--text-subtle)" }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DSX.Card>
    </div>
  );
}

/* ============================= USERS & ROLES ============================= */
const ROLES = [
  { id: "super", name: "Super Admin", n: 3, tone: "red", perms: "Full control · key custody · user mgmt" },
  { id: "auditor", name: "Auditor", n: 11, tone: "green", perms: "Read-all · verify chain · export" },
  { id: "officer", name: "Election Officer", n: 26, tone: "blue", perms: "Registry · verification · stations" },
  { id: "observer", name: "Observer", n: 6, tone: "neutral", perms: "Read-only dashboards" },
  { id: "support", name: "Support", n: 2, tone: "amber", perms: "Reset sessions · device mgmt" },
];
const USERS = [
  { in: "MK", name: "M. Kanyana", email: "m.kanyana@nec.gov.rw", role: "Auditor", tone: "green", dist: "National", mfa: true, last: "now" },
  { in: "AU", name: "Aline Uwase", email: "a.uwase@nec.gov.rw", role: "Election Officer", tone: "blue", dist: "Nyarugenge", mfa: true, last: "4m ago" },
  { in: "EM", name: "Eric Mugisha", email: "e.mugisha@nec.gov.rw", role: "Super Admin", tone: "red", dist: "National", mfa: true, last: "22m ago" },
  { in: "CI", name: "Chantal Ingabire", email: "c.ingabire@nec.gov.rw", role: "Observer", tone: "neutral", dist: "Kicukiro", mfa: true, last: "1h ago" },
  { in: "PH", name: "Patrick Habimana", email: "p.habimana@nec.gov.rw", role: "Support", tone: "amber", dist: "Gasabo", mfa: false, last: "3h ago" },
];

const PERM_GROUPS = [
  { k: "registry", t: "Voter registry", s: "View & edit voter records", ic: "users" },
  { k: "verify", t: "Verification", s: "Approve / reject at stations", ic: "badge-check" },
  { k: "fraud", t: "Fraud & cases", s: "Investigate, escalate, dismiss", ic: "shield-alert" },
  { k: "audit", t: "Audit & chain", s: "Read log, verify integrity, export", ic: "file-check-2" },
  { k: "users", t: "Users & roles", s: "Manage admins & permissions", ic: "user-cog" },
  { k: "keys", t: "Keys & encryption", s: "Key custody, rotation, HSM", ic: "key-round" },
];
const ROLE_PERMS = {
  super: ["registry", "verify", "fraud", "audit", "users", "keys"],
  auditor: ["audit", "registry"],
  officer: ["registry", "verify", "fraud"],
  observer: ["audit"],
  support: ["users"],
};

function InviteUserModal({ onClose, onConfirm }) {
  useEffectX(lucideX);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h"><div><h2>Invite administrator</h2><div className="modal__sub">They'll receive an email to set a password &amp; enroll MFA</div></div><button className="modal__x" onClick={onClose}><IX n="x" /></button></div>
        <div className="modal__scroll">
          <div className="fxform">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <DSX.Input label="Full name" placeholder="Given &amp; family name" />
              <DSX.Input label="Work email" iconLeft={<IX n="mail" />} placeholder="name@nec.gov.rw" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label className="fxf__l">Role</label><DSX.Select options={["Auditor", "Election Officer", "Super Admin", "Observer", "Support"]} /></div>
              <div><label className="fxf__l">District scope</label><DSX.Select options={["National", "Nyarugenge", "Gasabo", "Kicukiro", "Musanze"]} /></div>
            </div>
            <div className="fx-warn"><IX n="shield-check" /><div className="t">MFA enrollment is mandatory. The account stays inactive until the invitee verifies their email and sets up an authenticator.</div></div>
          </div>
        </div>
        <div className="modal__foot"><DSX.Button variant="ghost" onClick={onClose}>Cancel</DSX.Button><DSX.Button variant="primary" iconLeft={<IX n="send" />} onClick={onConfirm}>Send invitation</DSX.Button></div>
      </div>
    </div>
  );
}

function UserDetailModal({ u, onClose, onEdit, onReset, onSuspend }) {
  useEffectX(lucideX);
  const sessions = [
    { ic: "monitor", t: "Chrome · Windows 11", m: "10.2.5.4 · " + u.dist + " · current", current: true },
    { ic: "smartphone", t: "SecurePoll mobile · Android", m: "Kigali · " + u.last, current: false },
  ];
  const activity = [
    { t: "Signed in", s: "MFA verified (TOTP)", m: u.last, state: "done" },
    { t: "Exported registry slice", s: "4,812 rows · signed CSV", m: "14:38", state: "done" },
    { t: "Edited a permission set", s: "Support role scope", m: "13:50", state: "done" },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h"><div><h2>User account</h2><div className="modal__sub">{u.email}</div></div><button className="modal__x" onClick={onClose}><IX n="x" /></button></div>
        <div className="vprof">
          <div className="vprof__av" style={{ background: "var(--secondary-soft)", color: "var(--secondary-text)", fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>{u.in}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="vprof__n">{u.name}</div>
            <div className="vprof__id">{u.email}</div>
            <div className="vprof__badges">
              <DSX.Badge tone={u.tone} dot>{u.role}</DSX.Badge>
              <DSX.Badge tone="neutral" size="sm">{u.dist}</DSX.Badge>
              <DSX.Badge tone={u.mfa ? "green" : "amber"} size="sm" dot>{u.mfa ? "MFA ON" : "MFA PENDING"}</DSX.Badge>
            </div>
          </div>
          <DSX.Button size="sm" variant="secondary" iconLeft={<IX n="pencil" />} onClick={onEdit}>Edit role</DSX.Button>
        </div>
        <div className="modal__scroll" style={{ padding: 20 }}>
          <div className="fxev" style={{ padding: 0 }}>
            <div className="fxev__col">
              <div className="fxev__lbl">Active sessions</div>
              <div>
                {sessions.map((s, i) => (
                  <div className="sess-row" key={i}>
                    <span className="sess-row__ic"><IX n={s.ic} /></span>
                    <div className="sess-row__tx"><div className="sess-row__t">{s.t}{s.current && <DSX.Badge tone="green" size="sm" dot>CURRENT</DSX.Badge>}</div><div className="sess-row__m">{s.m}</div></div>
                    {!s.current && <button className="sess-revoke">Revoke</button>}
                  </div>
                ))}
              </div>
            </div>
            <div className="fxev__col">
              <div className="fxev__lbl">Recent activity</div>
              <div className="fxtl">
                {activity.map((s, i) => (
                  <div className="fxtl-step done" key={i}><span className="fxtl-dot"><IX n="check" /></span><div className="fxtl-bd"><div className="tt">{s.t}</div><div className="ts">{s.s}</div><div className="tm">{s.m}</div></div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <span className="grow"><IX n="lock" /> Account actions are audit-logged</span>
          <DSX.Button variant="ghost" iconLeft={<IX n="key-round" />} onClick={onReset}>Reset MFA</DSX.Button>
          <DSX.Button variant="danger" iconLeft={<IX n="user-x" />} onClick={onSuspend}>Suspend</DSX.Button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ u, onClose, onSave }) {
  const [mfa, setMfa] = useStateX(u.mfa);
  useEffectX(lucideX, [mfa]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h"><div><h2>Edit user</h2><div className="modal__sub">{u.name} · {u.email}</div></div><button className="modal__x" onClick={onClose}><IX n="x" /></button></div>
        <div className="modal__scroll">
          <div className="fxform">
            <div><label className="fxf__l">Role</label><DSX.Select defaultValue={u.role} options={["Auditor", "Election Officer", "Super Admin", "Observer", "Support"]} /></div>
            <div><label className="fxf__l">District scope</label><DSX.Select defaultValue={u.dist} options={["National", "Nyarugenge", "Gasabo", "Kicukiro", "Musanze"]} /></div>
            <div><label className="fxf__l">Account status</label><DSX.Select options={["Active", "Suspended", "Invitation pending"]} /></div>
            <div className="perm-row" style={{ borderBottom: "none", padding: "4px 0" }}>
              <div className="perm-left"><span className="perm-row__ic"><IX n="shield-check" /></span><div><div className="perm-row__t">Require MFA</div><div className="perm-row__s">Authenticator app at every sign-in</div></div></div>
              <button type="button" className="set-switch" data-on={mfa ? "1" : "0"} role="switch" aria-checked={mfa} onClick={() => setMfa(!mfa)}><i></i></button>
            </div>
          </div>
        </div>
        <div className="modal__foot"><DSX.Button variant="ghost" onClick={onClose}>Cancel</DSX.Button><DSX.Button variant="primary" iconLeft={<IX n="check" />} onClick={onSave}>Save changes</DSX.Button></div>
      </div>
    </div>
  );
}

function RoleModal({ role, onClose, onSave }) {
  const init = {};
  PERM_GROUPS.forEach((g) => { init[g.k] = role ? (ROLE_PERMS[role.id] || []).includes(g.k) : false; });
  const [perms, setPerms] = useStateX(init);
  useEffectX(lucideX, [perms]);
  const toggle = (k) => setPerms((p) => ({ ...p, [k]: !p[k] }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--mid" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h"><div><h2>{role ? "Edit role · " + role.name : "Create role"}</h2><div className="modal__sub">{role ? role.n + " users assigned" : "Define a new permission set"}</div></div><button className="modal__x" onClick={onClose}><IX n="x" /></button></div>
        <div className="modal__scroll">
          <div className="fxform">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <DSX.Input label="Role name" defaultValue={role ? role.name : ""} placeholder="e.g. District auditor" />
              <div><label className="fxf__l">Base template</label><DSX.Select options={["Custom", "Auditor", "Election Officer", "Observer"]} /></div>
            </div>
            <div>
              <label className="fxf__l">Permissions</label>
              <div>
                {PERM_GROUPS.map((g) => (
                  <div className="perm-row" key={g.k}>
                    <div className="perm-left"><span className="perm-row__ic"><IX n={g.ic} /></span><div><div className="perm-row__t">{g.t}</div><div className="perm-row__s">{g.s}</div></div></div>
                    <button type="button" className="set-switch" data-on={perms[g.k] ? "1" : "0"} role="switch" aria-checked={perms[g.k]} onClick={() => toggle(g.k)}><i></i></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="modal__foot"><DSX.Button variant="ghost" onClick={onClose}>Cancel</DSX.Button><DSX.Button variant="primary" iconLeft={<IX n="check" />} onClick={onSave}>{role ? "Save role" : "Create role"}</DSX.Button></div>
      </div>
    </div>
  );
}

function ConfirmUserModal({ kind, u, onClose, onConfirm }) {
  const reset = kind === "resetmfa";
  useEffectX(lucideX);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--narrow" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h"><div><h2>{reset ? "Reset MFA" : "Suspend user"}</h2><div className="modal__sub">{u.name} · {u.email}</div></div><button className="modal__x" onClick={onClose}><IX n="x" /></button></div>
        <div className="modal__scroll">
          <div className="fxform">
            <div className="fx-warn"><IX n="alert-triangle" /><div className="t">{reset ? "This clears the user's authenticator enrollment. They must re-enroll MFA on next sign-in before regaining access." : "Suspending immediately ends all active sessions and blocks sign-in until an admin re-activates the account."}</div></div>
            <div><label className="fxf__l">Reason <span className="req">*</span></label><DSX.Select options={reset ? ["Lost device", "Suspected compromise", "Routine reset", "User request"] : ["Suspected compromise", "Role ended", "Policy violation", "Extended leave"]} /></div>
          </div>
        </div>
        <div className="modal__foot"><DSX.Button variant="ghost" onClick={onClose}>Cancel</DSX.Button><DSX.Button variant="danger" iconLeft={<IX n={reset ? "key-round" : "user-x"} />} onClick={onConfirm}>{reset ? "Reset MFA" : "Suspend user"}</DSX.Button></div>
      </div>
    </div>
  );
}

function UsersView() {
  const [modal, setModal] = useStateX(null);
  const [selUser, setSelUser] = useStateX(null);
  const [selRole, setSelRole] = useStateX(null);
  const [toast, setToast] = useStateX(null);
  const uFire = (m) => { setModal(null); setToast(m); setTimeout(() => setToast(null), 2600); };
  useEffectX(lucideX, [modal]);
  return (
    <div>
      <div className="kpis">
        <div className="kpi"><div className="kpi__top"><span className="kpi__lbl">Admin users</span><span className="kpi__ic" style={{ background: "var(--primary-soft)", color: "var(--primary-text)" }}><IX n="users" /></span></div><div className="kpi__val">48</div><span className="kpi__delta up"><IX n="user-plus" />3 this week</span></div>
        <div className="kpi"><div className="kpi__top"><span className="kpi__lbl">Active sessions</span><span className="kpi__ic" style={{ background: "var(--secondary-soft)", color: "var(--secondary-text)" }}><IX n="monitor-dot" /></span></div><div className="kpi__val">12</div><span className="kpi__delta up"><IX n="circle" />all MFA-verified</span></div>
        <div className="kpi"><div className="kpi__top"><span className="kpi__lbl">Pending invites</span><span className="kpi__ic" style={{ background: "var(--status-review-soft)", color: "var(--status-review-text)" }}><IX n="mail" /></span></div><div className="kpi__val">3</div><span className="kpi__delta down"><IX n="clock" />awaiting accept</span></div>
        <div className="kpi"><div className="kpi__top"><span className="kpi__lbl">MFA coverage</span><span className="kpi__ic" style={{ background: "var(--status-approved-soft)", color: "var(--status-approved-text)" }}><IX n="shield-check" /></span></div><div className="kpi__val">98<small>%</small></div><span className="kpi__delta down"><IX n="alert-triangle" />1 user pending</span></div>
      </div>
      <div className="cols" style={{ alignItems: "start" }}>
        <DSX.Card title="Administrators" subtitle="48 users · 5 roles"
          headerEnd={<DSX.Button size="sm" iconLeft={<IX n="user-plus" />} onClick={() => setModal("invite")}>Invite user</DSX.Button>}>
          <table className="tbl">
            <thead><tr><th>User</th><th>Role</th><th>Scope</th><th>MFA</th><th>Last active</th></tr></thead>
            <tbody>
              {USERS.map((u, i) => (
                <tr className="row-hover clk" key={i} onClick={() => { setSelUser(u); setModal("user"); }}>
                  <td>
                    <div className="usr"><span className="usr__av">{u.in}</span><div><div className="usr__n">{u.name}</div><div className="usr__e">{u.email}</div></div></div>
                  </td>
                  <td><DSX.Badge tone={u.tone} size="sm" dot>{u.role}</DSX.Badge></td>
                  <td>{u.dist}</td>
                  <td>{u.mfa ? <span className="mfa on"><IX n="check" />On</span> : <span className="mfa off"><IX n="x" />Off</span>}</td>
                  <td className="mono">{u.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DSX.Card>
        <DSX.Card title="Roles" subtitle="Permission sets" headerEnd={<DSX.Button size="sm" variant="ghost" iconLeft={<IX n="plus" />} onClick={() => { setSelRole(null); setModal("role"); }}>New</DSX.Button>}>
          <div className="role-list">
            {ROLES.map((r) => (
              <div className="role role-clk" key={r.id} onClick={() => { setSelRole(r); setModal("role"); }}>
                <span className="role__dot" style={{ background: "var(--status-" + (r.tone === "green" ? "approved" : r.tone === "red" ? "rejected" : r.tone === "amber" ? "review" : r.tone === "blue" ? "info" : "info") + ")", opacity: r.tone === "neutral" ? .3 : 1 }}></span>
                <div className="role__tx">
                  <div className="role__top"><span className="role__n">{r.name}</span><span className="role__c">{r.n}</span></div>
                  <div className="role__p">{r.perms}</div>
                </div>
                <IX n="chevron-right" s={{ width: 15, height: 15, color: "var(--text-subtle)" }} />
              </div>
            ))}
          </div>
        </DSX.Card>
      </div>
      {modal === "invite" && <InviteUserModal onClose={() => setModal(null)} onConfirm={() => uFire("Invitation sent")} />}
      {modal === "user" && selUser && <UserDetailModal u={selUser} onClose={() => setModal(null)} onEdit={() => setModal("edituser")} onReset={() => setModal("resetmfa")} onSuspend={() => setModal("suspend")} />}
      {modal === "edituser" && selUser && <EditUserModal u={selUser} onClose={() => setModal(null)} onSave={() => uFire("User updated · " + selUser.name)} />}
      {modal === "role" && <RoleModal role={selRole} onClose={() => setModal(null)} onSave={() => uFire(selRole ? "Role saved · " + selRole.name : "Role created")} />}
      {modal === "resetmfa" && selUser && <ConfirmUserModal kind="resetmfa" u={selUser} onClose={() => setModal(null)} onConfirm={() => uFire("MFA reset · " + selUser.name)} />}
      {modal === "suspend" && selUser && <ConfirmUserModal kind="suspend" u={selUser} onClose={() => setModal(null)} onConfirm={() => uFire("User suspended · " + selUser.name)} />}
      {toast && <div className="fx-toast"><IX n="check-circle" s={{ width: 16, height: 16 }} />{toast}</div>}
    </div>
  );
}

/* ============================= ENCRYPTION ============================= */
const KEYS = [
  { icon: "fingerprint", title: "Biometric template key", algo: "AES-256-GCM", scope: "Voter biometric vault", rotated: "12 days ago", next: 0.13, status: "ACTIVE", tone: "green", hsm: true },
  { icon: "database", title: "Data-at-rest key", algo: "AES-256-XTS", scope: "Registry & audit store", rotated: "12 days ago", next: 0.13, status: "ACTIVE", tone: "green", hsm: true },
  { icon: "network", title: "Transit / service mesh", algo: "TLS 1.3 · mTLS", scope: "All inter-service traffic", rotated: "2 days ago", next: 0.02, status: "ACTIVE", tone: "green", hsm: false },
  { icon: "key-round", title: "Master key (KEK)", algo: "RSA-4096 · split", scope: "Wraps all data keys", rotated: "89 days ago", next: 0.98, status: "ROTATE SOON", tone: "amber", hsm: true },
];
const KEY_EVENTS = [
  { a: "KEY_ROTATED", m: "Transit mesh certificate renewed · auto", t: "2d ago", tone: "green" },
  { a: "HSM_HEALTHCHECK", m: "Cluster kigali-hsm-01 · 3/3 nodes healthy", t: "6h ago", tone: "green" },
  { a: "ROTATION_DUE", m: "Master KEK reaches 90-day policy in 1 day", t: "1h ago", tone: "amber" },
  { a: "TEMPLATE_ACCESSED", m: "Biometric key unwrapped by AI Service · mTLS", t: "3m ago", tone: "blue" },
];

function KeyCard({ k, onClick }) {
  return (
    <div className="keycard clk" onClick={onClick}>
      <div className="keycard__h">
        <span className="keycard__ic"><IX n={k.icon} /></span>
        <div className="keycard__t">{k.title}</div>
        <DSX.Badge tone={k.tone} size="sm" dot>{k.status}</DSX.Badge>
      </div>
      <div className="keycard__algo mono">{k.algo}{k.hsm && <span className="hsm-tag"><IX n="cpu" />HSM</span>}</div>
      <div className="keycard__scope">{k.scope}</div>
      <div className="keycard__rot">
        <div className="rot-meta"><span>Rotated {k.rotated}</span><span>{Math.round(k.next * 100)}% of cycle</span></div>
        <div className="rot-track"><div className="rot-fill" style={{ width: k.next * 100 + "%", background: k.tone === "amber" ? "var(--status-review)" : "var(--status-approved)" }}></div></div>
      </div>
    </div>
  );
}

function KeyDetailModal({ k, onClose, onRotate }) {
  useEffectX(lucideX);
  const versions = [
    { t: "v" + (k.tone === "amber" ? "12" : "47") + " · current", s: "Active · wraps " + k.scope.toLowerCase(), m: "Rotated " + k.rotated, state: "current" },
    { t: "v" + (k.tone === "amber" ? "11" : "46"), s: "Retired · retained for decrypt", m: "102 days ago", state: "done" },
    { t: "v" + (k.tone === "amber" ? "10" : "45"), s: "Retired", m: "194 days ago", state: "done" },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h"><div><h2>{k.title}</h2><div className="modal__sub">{k.algo} · {k.scope}</div></div><button className="modal__x" onClick={onClose}><IX n="x" /></button></div>
        <div className="modal__scroll">
          <div className="fxev">
            <div className="fxev__col">
              <div className="fxev__lbl">Key details</div>
              <div className="fxmeta">
                <div className="fxmeta__row"><span className="fxmeta__k">Algorithm</span><span className="fxmeta__v mono">{k.algo}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Scope</span><span className="fxmeta__v">{k.scope}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Custody</span><span className="fxmeta__v">{k.hsm ? "HSM · 2-of-3 quorum" : "Service mesh"}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Status</span><span className="fxmeta__v">{k.status}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Last rotated</span><span className="fxmeta__v">{k.rotated}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Policy</span><span className="fxmeta__v">90-day rotation</span></div>
              </div>
              <div className="fxev__lbl">Cycle progress</div>
              <div className="dqbar"><div className="top"><span className="k">{Math.round(k.next * 100)}% of rotation cycle</span><span className="v">{k.tone === "amber" ? "due in 1d" : "healthy"}</span></div><div className="dqbar__track"><div className="dqbar__fill" style={{ width: k.next * 100 + "%", background: k.tone === "amber" ? "var(--status-review)" : "var(--status-approved)" }}></div></div></div>
            </div>
            <div className="fxev__col">
              <div className="fxev__lbl">Version history</div>
              <div className="fxtl">
                {versions.map((v, i) => (
                  <div className={"fxtl-step " + v.state} key={i}><span className="fxtl-dot"><IX n={v.state === "current" ? "key-round" : "check"} /></span><div className="fxtl-bd"><div className="tt">{v.t}</div><div className="ts">{v.s}</div><div className="tm">{v.m}</div></div></div>
                ))}
              </div>
              <div className="fxai"><IX n="shield-check" /><div className="t"><b>Custody intact.</b> {k.hsm ? "Key material never leaves the HSM; only wrapped data keys are issued under 2-of-3 quorum." : "Certificates are issued per-service over mTLS and auto-rotated."}</div></div>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <span className="grow"><IX n="lock" /> Key operations require quorum &amp; are logged</span>
          <DSX.Button variant="primary" iconLeft={<IX n="refresh-cw" />} onClick={onRotate}>Rotate now</DSX.Button>
        </div>
      </div>
    </div>
  );
}

function RotateKeyModal({ k, onClose, onConfirm }) {
  const [timing, setTiming] = useStateX("now");
  useEffectX(lucideX, [timing]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--mid" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h"><div><h2>Rotate key</h2><div className="modal__sub">{k.title} · {k.algo}</div></div><button className="modal__x" onClick={onClose}><IX n="x" /></button></div>
        <div className="modal__scroll">
          <div className="fxform">
            <div className="fx-warn"><IX n="alert-triangle" /><div className="t">Rotation issues a new key version and re-wraps dependent data keys. The previous version is retained for decryption — no data is lost. HSM quorum approval (2-of-3) is required to proceed.</div></div>
            <div>
              <label className="fxf__l">Timing</label>
              <div className="fx-seg">
                {[["now", "Immediate"], ["maint", "Next window"], ["sched", "Scheduled"]].map(([key, l]) => (
                  <button key={key} className={timing === key ? "on normal" : ""} onClick={() => setTiming(key)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="fx-checks">
              <label className="fx-check"><input type="checkbox" defaultChecked /> Re-wrap all dependent data keys</label>
              <label className="fx-check"><input type="checkbox" defaultChecked /> Retain previous version for decrypt</label>
              <label className="fx-check"><input type="checkbox" defaultChecked /> Notify key-custody officers</label>
            </div>
          </div>
        </div>
        <div className="modal__foot"><DSX.Button variant="ghost" onClick={onClose}>Cancel</DSX.Button><DSX.Button variant="danger" iconLeft={<IX n="refresh-cw" />} onClick={onConfirm}>Request rotation</DSX.Button></div>
      </div>
    </div>
  );
}

function IntegrityCheckModal({ onClose }) {
  const [done, setDone] = useStateX(false);
  useEffectX(() => { lucideX(); const t = setTimeout(() => setDone(true), 1400); return () => clearTimeout(t); }, []);
  useEffectX(lucideX, [done]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--mid" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h"><div><h2>Encryption integrity check</h2><div className="modal__sub">Verify every store is sealed &amp; HSM-attested</div></div><button className="modal__x" onClick={onClose}><IX n="x" /></button></div>
        <div className="modal__scroll">
          <div className="vrun">
            {!done ? (
              <React.Fragment>
                <div className="vrun__ring" style={{ background: "var(--secondary-soft)", color: "var(--secondary-text)" }}><IX n="loader" /></div>
                <h3>Checking encryption…</h3>
                <p>Scanning data stores for plaintext and validating HSM attestation.</p>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="vrun__ring"><IX n="shield-check" /></div>
                <h3>All stores sealed</h3>
                <p>Every data store is encrypted with an HSM-backed key. No plaintext at rest detected.</p>
                <div className="vrun__grid">
                  <div className="fxmeta__row"><span className="fxmeta__k">Stores scanned</span><span className="fxmeta__v mono">14</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">Plaintext found</span><span className="fxmeta__v" style={{ color: "var(--status-approved-text)" }}>0</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">HSM attestation</span><span className="fxmeta__v">Valid</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">Tamper events</span><span className="fxmeta__v">0</span></div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
        <div className="modal__foot"><DSX.Button variant="ghost" onClick={onClose}>Close</DSX.Button><DSX.Button variant="primary" disabled={!done} iconLeft={<IX n="file-down" />} onClick={onClose}>Download attestation</DSX.Button></div>
      </div>
    </div>
  );
}

function KeyExportModal({ onClose, onConfirm }) {
  const [fmt, setFmt] = useStateX("csv");
  useEffectX(lucideX, [fmt]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--mid" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h"><div><h2>Export key &amp; HSM activity</h2><div className="modal__sub">Signed log of key operations</div></div><button className="modal__x" onClick={onClose}><IX n="x" /></button></div>
        <div className="modal__scroll">
          <div className="fxform">
            <div>
              <label className="fxf__l">Format</label>
              <div className="fx-seg">{[["csv", "CSV"], ["json", "JSON"], ["pdf", "PDF report"]].map(([key, l]) => (<button key={key} className={fmt === key ? "on normal" : ""} onClick={() => setFmt(key)}>{l}</button>))}</div>
            </div>
            <div><label className="fxf__l">Date range</label><DSX.Select options={["Last 24 hours", "Last 7 days", "Last 30 days", "Custom…"]} /></div>
            <div className="fx-checks">
              <label className="fx-check"><input type="checkbox" defaultChecked /> Rotation &amp; re-wrap events</label>
              <label className="fx-check"><input type="checkbox" defaultChecked /> HSM health &amp; attestation</label>
              <label className="fx-check"><input type="checkbox" defaultChecked /> Signed integrity hash</label>
            </div>
          </div>
        </div>
        <div className="modal__foot"><span className="grow"><IX n="lock" /> Watermarked &amp; logged</span><DSX.Button variant="ghost" onClick={onClose}>Cancel</DSX.Button><DSX.Button variant="primary" iconLeft={<IX n="download" />} onClick={onConfirm}>Export</DSX.Button></div>
      </div>
    </div>
  );
}

function EncryptionView() {
  const [modal, setModal] = useStateX(null);
  const [selKey, setSelKey] = useStateX(null);
  const [toast, setToast] = useStateX(null);
  const eFire = (m) => { setModal(null); setToast(m); setTimeout(() => setToast(null), 2600); };
  useEffectX(lucideX, [modal]);
  return (
    <div>
      <div className="verified-banner">
        <IX n="lock" s={{ width: 22, height: 22 }} />
        <div>
          <div className="vt">All data encrypted end-to-end</div>
          <div className="vs">Biometric templates, registry & audit store sealed · HSM-backed key custody · 0 plaintext at rest</div>
        </div>
        <div style={{ marginLeft: "auto" }}><DSX.Button size="sm" variant="secondary" iconLeft={<IX n="shield-check" />} onClick={() => setModal("integrity")}>Run integrity check</DSX.Button></div>
      </div>
      <div className="keys">
        {KEYS.map((k, i) => <KeyCard k={k} key={i} onClick={() => { setSelKey(k); setModal("key"); }} />)}
      </div>
      <div style={{ height: 16 }}></div>
      <div className="cols" style={{ gridTemplateColumns: "1.6fr 1fr", alignItems: "start" }}>
        <DSX.Card title="Key & HSM activity" subtitle="Append-only · last 24h"
          headerEnd={<DSX.Button size="sm" variant="secondary" iconLeft={<IX n="download" />} onClick={() => setModal("export")}>Export</DSX.Button>}>
          <div className="chain-list">
            {KEY_EVENTS.map((e, i) => (
              <div className="chain-item" key={i} style={{ gridTemplateColumns: "auto 1fr auto" }}>
                <div className="chain-node"><div className="lnk" style={{ background: "var(--status-" + (e.tone === "green" ? "approved" : e.tone === "amber" ? "review" : "info") + "-soft)", color: "var(--status-" + (e.tone === "green" ? "approved" : e.tone === "amber" ? "review" : "info") + "-text)" }}><IX n={e.tone === "amber" ? "alert-triangle" : "key-round"} /></div></div>
                <div className="chain-info"><div className="ca">{e.a}</div><div className="cm">{e.m}</div></div>
                <div className="chain-hash">{e.t}</div>
              </div>
            ))}
          </div>
        </DSX.Card>
        <DSX.Card title="HSM cluster" subtitle="kigali-hsm-01" headerEnd={<DSX.Badge tone="green" size="sm" dot>HEALTHY</DSX.Badge>}>
          <div className="hsm-grid">
            <div className="hsm-stat"><div className="n">3/3</div><div className="l">Nodes online</div></div>
            <div className="hsm-stat"><div className="n">FIPS 140-2</div><div className="l">Level 3</div></div>
            <div className="hsm-stat"><div className="n">2-of-3</div><div className="l">Quorum custody</div></div>
            <div className="hsm-stat"><div className="n">4,196</div><div className="l">Ops / min</div></div>
          </div>
          <div className="stat-lines" style={{ marginTop: 14 }}>
            <div className="stat-line"><span className="k">Rotation policy</span><span className="v">90 days</span></div>
            <div className="stat-line"><span className="k">Last attestation</span><span className="v mono">14:30:02</span></div>
            <div className="stat-line"><span className="k">Tamper events</span><span className="v">0</span></div>
          </div>
        </DSX.Card>
      </div>
      {modal === "key" && selKey && <KeyDetailModal k={selKey} onClose={() => setModal(null)} onRotate={() => setModal("rotate")} />}
      {modal === "rotate" && selKey && <RotateKeyModal k={selKey} onClose={() => setModal(null)} onConfirm={() => eFire("Rotation requested · " + selKey.title)} />}
      {modal === "integrity" && <IntegrityCheckModal onClose={() => setModal(null)} />}
      {modal === "export" && <KeyExportModal onClose={() => setModal(null)} onConfirm={() => eFire("Key activity exported")} />}
      {toast && <div className="fx-toast"><IX n="check-circle" s={{ width: 16, height: 16 }} />{toast}</div>}
    </div>
  );
}

Object.assign(window.AdminScreens, { ReportingView, UsersView, EncryptionView });
