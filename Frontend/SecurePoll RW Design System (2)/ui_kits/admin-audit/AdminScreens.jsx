// AdminScreens.jsx — dashboard views for the Admin & Audit web app
const { useEffect: useEffectA, useState: useStateA } = React;
const DS = window.SecurePollRWDesignSystem_92875f;
const FW = window.FraudWidgets;
const I = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lucideA() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

function Kpi({ label, icon, tint, value, unit, delta, dir }) {
  return (
    <div className="kpi">
      <div className="kpi__top">
        <span className="kpi__lbl">{label}</span>
        <span className="kpi__ic" style={{ background: tint.bg, color: tint.fg }}><I n={icon} /></span>
      </div>
      <div className="kpi__val">{value}{unit && <small> {unit}</small>}</div>
      {delta && <span className={"kpi__delta " + dir}><I n={dir === "up" ? "trending-up" : "trending-down"} />{delta}</span>}
    </div>
  );
}

function DashboardView() {
  useEffectA(lucideA);
  const turnout = [
    { d: "06:00", v: 8 }, { d: "08:00", v: 22 }, { d: "10:00", v: 41 },
    { d: "12:00", v: 58 }, { d: "14:00", v: 71, now: true }, { d: "16:00", v: 0, m: true }, { d: "18:00", v: 0, m: true },
  ];
  return (
    <div>
      <div className="kpis">
        <Kpi label="National turnout" icon="users" tint={{ bg: "var(--primary-soft)", fg: "var(--primary-text)" }} value="62.4" unit="%" delta="4.2% vs last hour" dir="up" />
        <Kpi label="Verified today" icon="badge-check" tint={{ bg: "var(--secondary-soft)", fg: "var(--secondary-text)" }} value="1.84" unit="M" delta="12.1k / min" dir="up" />
        <Kpi label="Fraud alerts" icon="shield-alert" tint={{ bg: "var(--status-review-soft)", fg: "var(--status-review-text)" }} value="37" delta="9 critical" dir="down" />
        <Kpi label="Stations online" icon="radio-tower" tint={{ bg: "var(--status-approved-soft)", fg: "var(--status-approved-text)" }} value="2,391" unit="/ 2,410" delta="19 syncing" dir="up" />
      </div>
      <div className="cols">
        <DS.Card title="Turnout through the day" subtitle="National · live, 30s refresh"
          headerEnd={<DS.Badge tone="green" dot>Live</DS.Badge>}>
          <div className="bars">
            {turnout.map((t, i) => (
              <div className="bar-col" key={i}>
                <span className="bv">{t.m ? "—" : t.v + "%"}</span>
                <div className={"bar" + (t.m ? " muted" : "")} style={{ height: (t.m ? 6 : Math.max(t.v, 4) * 2) + "px", opacity: t.m ? .5 : 1 }}></div>
                <span className="bl">{t.d}</span>
              </div>
            ))}
          </div>
        </DS.Card>
        <DS.Card title="Authentication outcomes" subtitle="All verifications today">
          <div className="donut-wrap">
            <div className="donut" style={{ background: "conic-gradient(var(--green-500) 0 93%, var(--amber-400) 93% 98.5%, var(--red-500) 98.5% 100%)" }}>
              <div className="donut__c"><div className="n">93%</div><div className="l">auto-approved</div></div>
            </div>
            <div className="legend-list">
              <div className="li"><span className="k" style={{ background: "var(--green-500)" }}></span>Approved <b>1.71M</b></div>
              <div className="li"><span className="k" style={{ background: "var(--amber-400)" }}></span>Manual review <b>101k</b></div>
              <div className="li"><span className="k" style={{ background: "var(--red-500)" }}></span>Rejected <b>27.4k</b></div>
            </div>
          </div>
        </DS.Card>
      </div>
      <div style={{ height: 16 }}></div>
      <DS.Card title="Recent activity" subtitle="Across all services">
        <table className="tbl">
          <thead><tr><th>Time</th><th>Service</th><th>Event</th><th>Station</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td className="mono">14:41:22</td><td>Verification</td><td>Voter verified</td><td className="mono">PS-014</td><td><DS.Badge tone="green" size="sm" dot>APPROVED</DS.Badge></td></tr>
            <tr><td className="mono">14:41:19</td><td>AI / ML</td><td>Duplicate scan flagged</td><td className="mono">PS-203</td><td><DS.Badge tone="amber" size="sm" dot>REVIEW</DS.Badge></td></tr>
            <tr><td className="mono">14:41:05</td><td>Election Ops</td><td>Turnout counter sync</td><td className="mono">District</td><td><DS.Badge tone="blue" size="sm">INFO</DS.Badge></td></tr>
            <tr><td className="mono">14:40:58</td><td>Verification</td><td>Match below threshold</td><td className="mono">PS-077</td><td><DS.Badge tone="red" size="sm" dot>REJECTED</DS.Badge></td></tr>
          </tbody>
        </table>
      </DS.Card>
    </div>
  );
}

const CASES = [
  { id: "FR-4471", risk: "var(--red-500)", title: "Possible impersonation", type: "Impersonation", desc: "PS-077 · face 0.38 · 14:40", score: "0.38", tone: "red", v: "rejected", face: 0.38, station: "PS-077 · Kicukiro",
    voter: "Unverified subject", officer: "#318", detectedBy: "AI Verification (1:1)", reg: "#20512", opened: "14:40 · today",
    bk: [{ k: "Face match (1:1)", v: 0.38, col: "var(--red-500)" }, { k: "Fingerprint", v: 0.45, col: "var(--red-500)" }, { k: "Liveness", v: 0.97, col: "var(--green-500)" }],
    tl: [
      { t: "Capture at station", s: "Live capture · device cam-02", m: "14:40:02", state: "done" },
      { t: "Auto-flagged by AI", s: "Face similarity 0.38 — below 0.85 threshold", m: "14:40:03", state: "done" },
      { t: "Routed to fraud queue", s: "Priority: critical · impersonation", m: "14:40:05", state: "done" },
      { t: "Awaiting investigator decision", s: "Dismiss, escalate, or request manual re-capture", m: "now", state: "current" },
    ],
    panel: { confidence: 0.38, breakdown: { "Face match": 0.38, "Fingerprint": 0.45, "Liveness": "LIVE" }, explanation: "Low similarity to the stored template. No reliable identity match.", flags: ["Possible impersonation"] } },
  { id: "FR-4468", risk: "var(--amber-400)", title: "Duplicate registration", type: "Duplicate", desc: "1:N · #20451 ↔ #18992", score: "0.88", tone: "amber", v: "review", face: 0.92, station: "PS-203 · Gasabo",
    voter: "Eric Niyonsaba", officer: "#221", detectedBy: "1:N de-duplication", reg: "#20451", opened: "13:12 · today",
    bk: [{ k: "1:N top match", v: 0.88, col: "var(--amber-500)" }, { k: "Name similarity", v: 0.91, col: "var(--amber-500)" }, { k: "DOB match", v: 1, col: "var(--green-500)" }],
    tl: [
      { t: "Registration submitted", s: "Reg #20451 · officer #221", m: "13:11", state: "done" },
      { t: "1:N scan flagged", s: "Top match reg #18992 at 0.88 similarity", m: "13:12", state: "done" },
      { t: "Queued for review", s: "Likely duplicate enrollment", m: "13:12", state: "done" },
      { t: "Under investigation", s: "Compare both records before merging or rejecting", m: "now", state: "current" },
    ],
    panel: { decision: "review", confidence: 0.88, breakdown: { "1:N top match": 0.88, "Name similarity": 0.91, "DOB match": "EXACT" }, explanation: "High biometric + demographic overlap with an existing record. Likely duplicate enrollment.", flags: ["Duplicate detected"], reviewRequired: true } },
  { id: "FR-4455", risk: "var(--amber-400)", title: "Document forgery suspected", type: "Forgery", desc: "Reg #20388 · metadata anomaly", score: "SUSP", tone: "amber", v: "review", face: 0.71, station: "PS-118 · Rubavu",
    voter: "Claudine Uwineza", officer: "#142", detectedBy: "Forgery classifier", reg: "#20388", opened: "11:48 · today",
    bk: [{ k: "Forgery classifier", v: 0.74, col: "var(--amber-500)" }, { k: "Metadata integrity", v: 0.32, col: "var(--red-500)" }, { k: "Face match", v: 0.71, col: "var(--amber-500)" }],
    tl: [
      { t: "ID document uploaded", s: "Scanned at enrollment", m: "11:46", state: "done" },
      { t: "Forgery classifier hit", s: "Compression + metadata inconsistencies", m: "11:48", state: "done" },
      { t: "Queued for review", s: "Possible tampering", m: "11:48", state: "done" },
      { t: "Awaiting document re-check", s: "Request original document at station", m: "now", state: "current" },
    ],
    panel: { decision: "review", confidence: 0.61, breakdown: { "Forgery classifier": "SUSPICIOUS", "Metadata check": "ANOMALY" }, explanation: "ID document shows compression and metadata inconsistencies typical of tampering.", flags: ["Document forgery"], reviewRequired: true } },
  { id: "FR-4440", risk: "var(--slate-400)", title: "Registration pattern anomaly", type: "Anomaly", desc: "Officer #88 · 41 regs / 20 min", score: "0.72", tone: "neutral", v: "review", face: 0.83, station: "PS-014 · Nyarugenge",
    voter: "Batch · 41 records", officer: "#88", detectedBy: "Isolation forest", reg: "batch", opened: "10:30 · today",
    bk: [{ k: "Isolation forest", v: 0.72, col: "var(--slate-500)" }, { k: "Rate z-score", v: 0.9, col: "var(--amber-500)" }, { k: "Geo consistency", v: 0.6, col: "var(--slate-500)" }],
    tl: [
      { t: "Burst of registrations", s: "41 records in 20 minutes by officer #88", m: "10:10–10:30", state: "done" },
      { t: "Rate anomaly flagged", s: "+3.1σ above officer baseline", m: "10:30", state: "done" },
      { t: "Queued for spot-check", s: "No individual fraud confirmed yet", m: "10:30", state: "done" },
      { t: "Pending field spot-check", s: "Assign supervisor to verify a sample", m: "now", state: "current" },
    ],
    panel: { decision: "review", confidence: 0.72, breakdown: { "Isolation forest": 0.72, "Rate z-score": "+3.1σ" }, explanation: "Enrollment rate far above the officer's baseline. Recommend spot-check.", reviewRequired: true } },
];

const RISK_DOT = { red: "var(--status-rejected)", amber: "var(--status-review)", neutral: "var(--slate-400)" };

function CaseEvidenceModal({ c, onClose, onEscalate, onDismiss }) {
  useEffectA(lucideA);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div>
            <h2>Case evidence · {c.id}</h2>
            <div className="modal__sub">{c.title} · {c.station} · opened {c.opened}</div>
          </div>
          <button className="modal__x" onClick={onClose}><I n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="fxev">
            <div className="fxev__col">
              <div className="fxev__lbl">Biometric comparison</div>
              <FW.VoterScan score={c.face} verdict={c.v} />
              <div className="fxev__lbl">ID document on file</div>
              <div className="fxdoc">
                <span className="fxdoc__tag">{c.reg}</span>
                <div className="fxdoc__sheet"></div>
                <div className="fxdoc__photo"><I n="user-round" /></div>
              </div>
            </div>
            <div className="fxev__col">
              <div className="fxev__lbl">Match breakdown</div>
              <div className="fxbk">
                {c.bk.map((b, i) => (
                  <div className="fxbk__row" key={i}>
                    <div className="top"><span className="k">{b.k}</span><span className="v">{Math.round(b.v * 100)}%</span></div>
                    <div className="fxbk__track"><div className="fxbk__fill" style={{ width: (b.v * 100) + "%", background: b.col }}></div></div>
                  </div>
                ))}
              </div>
              <div className="fxev__lbl">AI assessment</div>
              <div className="fxai"><I n="sparkles" /><div className="t"><b>{c.detectedBy}.</b> {c.panel.explanation}</div></div>
              <div className="fxev__lbl">Case metadata</div>
              <div className="fxmeta">
                <div className="fxmeta__row"><span className="fxmeta__k">Type</span><span className="fxmeta__v">{c.type}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Station</span><span className="fxmeta__v">{c.station.split(" · ")[0]}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Officer</span><span className="fxmeta__v mono">{c.officer}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Reg ref</span><span className="fxmeta__v mono">{c.reg}</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <span className="grow"><I n="lock" /> Viewing is logged to the audit chain</span>
          <DS.Button variant="ghost" onClick={onDismiss}>Dismiss case</DS.Button>
          <DS.Button variant="danger" iconLeft={<I n="flag" />} onClick={onEscalate}>Escalate</DS.Button>
        </div>
      </div>
    </div>
  );
}

function EscalateModal({ c, onClose, onConfirm }) {
  const [assignee, setAssignee] = useStateA("Fraud Investigation Unit");
  const [priority, setPriority] = useStateA("high");
  const [note, setNote] = useStateA("");
  const [notifyNec, setNotifyNec] = useStateA(true);
  const [notifySup, setNotifySup] = useStateA(true);
  useEffectA(lucideA);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div>
            <h2>Escalate case {c.id}</h2>
            <div className="modal__sub">{c.title} · {c.station}</div>
          </div>
          <button className="modal__x" onClick={onClose}><I n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="fxform">
            <div>
              <label className="fxf__l">Assign to <span className="req">*</span></label>
              <DS.Select value={assignee} onChange={(e) => setAssignee(e.target.value)}
                options={["Fraud Investigation Unit", "District supervisor · " + c.station.split(" · ")[1], "NEC monitoring desk", "Senior auditor (M. Kanyana)"]} />
            </div>
            <div>
              <label className="fxf__l">Priority</label>
              <div className="fx-seg">
                {["normal", "high", "urgent"].map((p) => (
                  <button key={p} className={(priority === p ? "on " + p : "")} onClick={() => setPriority(p)}>{p[0].toUpperCase() + p.slice(1)}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="fxf__l">Investigation note</label>
              <textarea className="fx-ta" placeholder="Add context for the investigator — what to verify, who to contact, deadlines…" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
            </div>
            <div>
              <label className="fxf__l">Notify</label>
              <div className="fx-checks">
                <label className="fx-check"><input type="checkbox" checked={notifyNec} onChange={(e) => setNotifyNec(e.target.checked)} /> NEC monitoring desk</label>
                <label className="fx-check"><input type="checkbox" checked={notifySup} onChange={(e) => setNotifySup(e.target.checked)} /> Station supervisor ({c.station.split(" · ")[0]})</label>
              </div>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <DS.Button variant="ghost" onClick={onClose}>Cancel</DS.Button>
          <DS.Button variant="danger" iconLeft={<I n="flag" />} onClick={onConfirm}>Escalate case</DS.Button>
        </div>
      </div>
    </div>
  );
}

function DismissModal({ c, onClose, onConfirm }) {
  const [reason, setReason] = useStateA("False positive — identity confirmed");
  const [note, setNote] = useStateA("");
  useEffectA(lucideA);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--narrow" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div>
            <h2>Dismiss case {c.id}</h2>
            <div className="modal__sub">{c.title}</div>
          </div>
          <button className="modal__x" onClick={onClose}><I n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="fxform">
            <div className="fx-warn"><I n="alert-triangle" /><div className="t">Dismissing closes this case and removes it from the active fraud queue. The action and reason are recorded in the audit chain.</div></div>
            <div>
              <label className="fxf__l">Reason <span className="req">*</span></label>
              <DS.Select value={reason} onChange={(e) => setReason(e.target.value)}
                options={["False positive — identity confirmed", "Resolved offline at station", "Duplicate of another case", "Insufficient evidence"]} />
            </div>
            <div>
              <label className="fxf__l">Note (optional)</label>
              <textarea className="fx-ta" placeholder="Add any supporting detail for the record…" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <DS.Button variant="ghost" onClick={onClose}>Cancel</DS.Button>
          <DS.Button variant="danger" iconLeft={<I n="check" />} onClick={onConfirm}>Dismiss case</DS.Button>
        </div>
      </div>
    </div>
  );
}

function FraudView() {
  const [sel, setSel] = useStateA(CASES[0].id);
  const [riskFilter, setRiskFilter] = useStateA("all");
  const [modal, setModal] = useStateA(null); // null | evidence | escalate | dismiss
  const [toast, setToast] = useStateA(null);
  useEffectA(lucideA, [sel, riskFilter, modal]);

  const counts = { all: CASES.length, critical: CASES.filter((x) => x.tone === "red").length, review: CASES.filter((x) => x.tone !== "red").length };
  const visible = CASES.filter((x) => riskFilter === "all" || (riskFilter === "critical" ? x.tone === "red" : x.tone !== "red"));
  const c = CASES.find((x) => x.id === sel) || CASES[0];
  const act = (verb) => { setModal(null); setToast(verb + " · " + c.id); setTimeout(() => setToast(null), 2600); };

  return (
    <div className="fraudx">
      <div className="kpis">
        <Kpi label="Open cases" icon="folder-open" tint={{ bg: "var(--status-review-soft)", fg: "var(--status-review-text)" }} value="37" delta="9 critical · 28 review" dir="down" />
        <Kpi label="Duplicates caught" icon="copy-x" tint={{ bg: "var(--secondary-soft)", fg: "var(--secondary-text)" }} value="12" unit="today" delta="1:N matches" dir="up" />
        <Kpi label="Impersonation blocked" icon="user-x" tint={{ bg: "var(--status-rejected-soft)", fg: "var(--status-rejected-text)" }} value="5" unit="today" delta="sub-threshold faces" dir="down" />
        <Kpi label="Median resolution" icon="timer" tint={{ bg: "var(--status-approved-soft)", fg: "var(--status-approved-text)" }} value="3.4" unit="h" delta="18% faster vs last wk" dir="up" />
      </div>

      <div className="fxbar">
        <div className="fxbar__sr"><DS.Input iconLeft={<I n="search" />} placeholder="Search cases by ID, voter, station or officer…" /></div>
        <div className="fxbar__seg">
          {[["all", "All"], ["critical", "Critical"], ["review", "Review"]].map(([k, lbl]) => (
            <button key={k} className={"fxbar__chip" + (riskFilter === k ? " on" : "")} onClick={() => setRiskFilter(k)}>{lbl}<span className="n">{counts[k]}</span></button>
          ))}
        </div>
        <div className="fxbar__sel"><DS.Select options={["All types", "Impersonation", "Duplicate", "Forgery", "Anomaly"]} /></div>
        <div className="fxbar__sel"><DS.Select options={["All stations", "PS-077", "PS-203", "PS-118", "PS-014"]} /></div>
      </div>

      <div className="fxmain">
        <div className="fxq">
          <div className="fxq__h">
            <div><div className="t">Case queue</div><div className="c">{visible.length} of {CASES.length} cases</div></div>
            <button className="fxq__sort"><I n="arrow-down-wide-narrow" /> Risk</button>
          </div>
          <div className="fxq__list">
            {visible.map((x) => (
              <button key={x.id} className={"fxcase" + (x.id === sel ? " on" : "")} onClick={() => setSel(x.id)}>
                <span className="fxcase__dot" style={{ background: RISK_DOT[x.tone], color: RISK_DOT[x.tone] }}></span>
                <span className="fxcase__tx">
                  <span className="fxcase__top"><DS.Badge tone={x.tone === "neutral" ? "neutral" : x.tone} size="sm">{x.type}</DS.Badge><span className="fxcase__t">{x.title}</span></span>
                  <span className="fxcase__m">{x.id} · {x.desc}</span>
                </span>
                <span className="fxcase__sc"><span className="v" style={{ color: RISK_DOT[x.tone] }}>{x.score}</span><span className="l">score</span></span>
              </button>
            ))}
          </div>
        </div>

        <div className="fxd">
          <div className="fxd__head">
            <div className="fxd__hl">
              <div className="fxd__hid">{c.id} · {c.station}</div>
              <h2>{c.title}</h2>
              <div className="fxd__badges">
                <DS.Badge tone={c.tone === "neutral" ? "neutral" : c.tone} dot>{c.v === "rejected" ? "CRITICAL" : "NEEDS REVIEW"}</DS.Badge>
                <DS.Badge tone="neutral" size="sm">{c.type}</DS.Badge>
                <DS.Badge tone="blue" size="sm">{c.detectedBy}</DS.Badge>
              </div>
            </div>
            <div className="fxd__act">
              <DS.Button size="sm" variant="secondary" iconLeft={<I n="image" />} onClick={() => setModal("evidence")}>View evidence</DS.Button>
              <DS.Button size="sm" variant="ghost" onClick={() => setModal("dismiss")}>Dismiss</DS.Button>
              <DS.Button size="sm" variant="danger" iconLeft={<I n="flag" />} onClick={() => setModal("escalate")}>Escalate</DS.Button>
            </div>
          </div>

          <div className="fxd__grid">
            <DS.Card title="Biometric face scan" subtitle={c.station + " · device cam-02"} headerEnd={<DS.Badge tone="blue" size="sm" dot>1:1 VERIFY</DS.Badge>}>
              <FW.VoterScan score={c.face} verdict={c.v} />
            </DS.Card>
            <DS.DecisionPanel voterName={c.title} {...c.panel} />
          </div>

          <div className="fxd__grid">
            <DS.Card title="Case details" subtitle="Origin & attribution">
              <div className="fxmeta">
                <div className="fxmeta__row"><span className="fxmeta__k">Type</span><span className="fxmeta__v">{c.type}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Subject</span><span className="fxmeta__v">{c.voter}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Station</span><span className="fxmeta__v">{c.station.split(" · ")[0]}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Officer</span><span className="fxmeta__v mono">{c.officer}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Reg ref</span><span className="fxmeta__v mono">{c.reg}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Opened</span><span className="fxmeta__v">{c.opened}</span></div>
              </div>
              <div className="fxflags">
                {(c.panel.flags || ["Pattern anomaly"]).map((f, i) => <DS.Badge key={i} tone={c.tone === "neutral" ? "neutral" : c.tone} size="sm" dot>{f}</DS.Badge>)}
              </div>
            </DS.Card>
            <DS.Card title="Investigation timeline" subtitle="Audit-logged events">
              <div className="fxtl">
                {c.tl.map((s, i) => (
                  <div className={"fxtl-step " + s.state} key={i}>
                    <span className="fxtl-dot"><I n={s.state === "done" ? "check" : "loader"} /></span>
                    <div className="fxtl-bd"><div className="tt">{s.t}</div><div className="ts">{s.s}</div><div className="tm">{s.m}</div></div>
                  </div>
                ))}
              </div>
            </DS.Card>
          </div>
        </div>
      </div>

      <DS.Card title="Fraud cases by district" subtitle="Live geographic distribution · all open cases"
        headerEnd={<DS.Badge tone="red" size="sm" dot>HEATMAP</DS.Badge>}>
        <FW.FraudHeatmap />
      </DS.Card>

      {modal === "evidence" && <CaseEvidenceModal c={c} onClose={() => setModal(null)} onEscalate={() => setModal("escalate")} onDismiss={() => setModal("dismiss")} />}
      {modal === "escalate" && <EscalateModal c={c} onClose={() => setModal(null)} onConfirm={() => act("Escalated")} />}
      {modal === "dismiss" && <DismissModal c={c} onClose={() => setModal(null)} onConfirm={() => act("Dismissed")} />}
      {toast && <div className="fx-toast"><I n="check-circle" s={{ width: 16, height: 16 }} />{toast}</div>}
    </div>
  );
}

window.AdminScreens = { DashboardView, FraudView };
