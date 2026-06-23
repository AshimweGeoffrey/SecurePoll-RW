// AuditView.jsx — Audit & Transparency (Module 7) workspace + modals
const { useEffect: useEffectAu, useState: useStateAu } = React;
const AU = window.SecurePollRWDesignSystem_92875f;
const Ia = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lau() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

function KpiA({ label, icon, tint, value, unit, delta, dir }) {
  return (
    <div className="kpi">
      <div className="kpi__top"><span className="kpi__lbl">{label}</span><span className="kpi__ic" style={{ background: tint.bg, color: tint.fg }}><Ia n={icon} /></span></div>
      <div className="kpi__val">{value}{unit && <small> {unit}</small>}</div>
      {delta && <span className={"kpi__delta " + dir}><Ia n={dir === "up" ? "trending-up" : "trending-down"} />{delta}</span>}
    </div>
  );
}

const ACT_TONE = {
  VOTER_VERIFIED: "green", VOTER_VOTED: "green", TEMPLATE_ACCESSED: "blue",
  PERMISSION_CHANGED: "amber", LOGIN: "blue", RECORD_BLOCKED: "red", DATA_EXPORTED: "amber", RECORD_MERGED: "amber",
};
const TONE_VAR = { green: "var(--status-approved)", amber: "var(--status-review)", red: "var(--status-rejected)", blue: "var(--status-info)", neutral: "var(--slate-400)" };

const LOG = [
  { t: "14:41:22", action: "VOTER_VERIFIED", actor: "Officer #221", role: "Polling officer", init: "PO", service: "Verification", station: "PS-014", ip: "10.4.21.7", geo: "Nyarugenge", h: "a3f9c2", p: "7c21be",
    detail: "Voter Jean Baptiste verified · face score 0.91 · fingerprint pass", diff: null },
  { t: "14:41:19", action: "VOTER_VOTED", actor: "System", role: "Election service", init: "SY", service: "Election Ops", station: "PS-014", ip: "10.4.21.7", geo: "Nyarugenge", h: "7c21be", p: "0d44a1",
    detail: "Registry status transition · row-locked write", diff: [["Status", "REGISTERED", "VOTED"]] },
  { t: "14:40:58", action: "TEMPLATE_ACCESSED", actor: "AI Service", role: "ML pipeline", init: "AI", service: "AI / ML", station: "—", ip: "10.8.0.3", geo: "Kigali DC", h: "0d44a1", p: "f188e0",
    detail: "Biometric reference read for 1:1 match · mTLS · purpose: verification", diff: null },
  { t: "14:39:30", action: "PERMISSION_CHANGED", actor: "E. Mugisha", role: "Administrator", init: "EM", service: "IAM", station: "—", ip: "10.2.5.9", geo: "Kigali City", h: "f188e0", p: "5b9d3a",
    detail: "Support role scope edited", diff: [["Registry access", "read", "read+write"], ["Scope", "Gasabo", "Gasabo, Kicukiro"]] },
  { t: "14:38:02", action: "DATA_EXPORTED", actor: "M. Kanyana", role: "Auditor", init: "MK", service: "Registry", station: "—", ip: "10.2.5.4", geo: "Kigali City", h: "5b9d3a", p: "2c77ad",
    detail: "Signed CSV export · 4,812 rows · watermarked", diff: null },
  { t: "14:36:44", action: "RECORD_BLOCKED", actor: "M. Kanyana", role: "Auditor", init: "MK", service: "Registry", station: "PS-203", ip: "10.2.5.4", geo: "Kigali City", h: "2c77ad", p: "91ee0c",
    detail: "Voter #11998 blocked · reason: confirmed fraud", diff: [["Status", "REGISTERED", "BLOCKED"]] },
  { t: "14:35:10", action: "LOGIN", actor: "M. Kanyana", role: "Auditor", init: "MK", service: "Auth", station: "—", ip: "10.2.5.4", geo: "Kigali City", h: "91ee0c", p: "begin",
    detail: "Sign-in · MFA verified (TOTP) · trusted device", diff: null },
];

const ANOMS = [
  { id: "AN-21", tone: "red", icon: "shield-alert", t: "Impersonation spike", live: true, d: "4 sub-threshold face scores at PS-077 in 9 min · +3.4σ over baseline", when: "live · 14:40",
    signal: "Face-match rejection rate", baseline: 1.5, observed: 11.8, unit: "%", entities: ["PS-077 · Kicukiro", "Device cam-02", "4 capture sessions"], rec: "Dispatch supervisor to PS-077 and review the 4 flagged captures.", cases: "FR-4471" },
  { id: "AN-20", tone: "amber", icon: "activity", t: "Enrollment rate anomaly", d: "Officer #88 logged 41 registrations in 20 min — isolation-forest flag", when: "14:21",
    signal: "Registrations / 20 min", baseline: 9, observed: 41, unit: "", entities: ["Officer #88", "PS-014 · Nyarugenge"], rec: "Spot-check a sample of officer #88's recent enrollments.", cases: "FR-4440" },
  { id: "AN-19", tone: "blue", icon: "map-pin", t: "New access geography", d: "Admin session from Musanze — first sign-in from this district", when: "13:58",
    signal: "Distance from usual location", baseline: 4, observed: 92, unit: "km", entities: ["Admin: J. Uwimana", "Musanze", "New device"], rec: "Confirm the session with the administrator; revoke if unrecognised.", cases: null },
];

/* ---------- Log entry detail ---------- */
function LogDetailModal({ e, onClose }) {
  useEffectAu(lau);
  const tone = ACT_TONE[e.action] || "neutral";
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(ev) => ev.stopPropagation()}>
        <div className="modal__h">
          <div><h2>Audit entry</h2><div className="modal__sub"><span className="logact"><span className="dot" style={{ background: TONE_VAR[tone] }}></span><span className="a">{e.action}</span></span> · {e.t} today</div></div>
          <button className="modal__x" onClick={onClose}><Ia n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="fxev">
            <div className="fxev__col">
              <div className="fxev__lbl">Event</div>
              <div style={{ fontSize: 14, color: "var(--text-default)", lineHeight: 1.55 }}>{e.detail}</div>
              <div className="fxev__lbl">Attribution</div>
              <div className="fxmeta">
                <div className="fxmeta__row"><span className="fxmeta__k">Actor</span><span className="fxmeta__v">{e.actor}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Role</span><span className="fxmeta__v">{e.role}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Service</span><span className="fxmeta__v">{e.service}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Station</span><span className="fxmeta__v">{e.station}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">IP address</span><span className="fxmeta__v mono">{e.ip}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Location</span><span className="fxmeta__v">{e.geo}</span></div>
              </div>
              {e.diff && (
                <React.Fragment>
                  <div className="fxev__lbl">Change</div>
                  <div>
                    {e.diff.map((d, i) => (
                      <div className="diffrow" key={i}><span className="k">{d[0]}</span><span><span className="old">{d[1]}</span><span className="arr">→</span><span className="new">{d[2]}</span></span></div>
                    ))}
                  </div>
                </React.Fragment>
              )}
            </div>
            <div className="fxev__col">
              <div className="fxev__lbl">Hash-chain context</div>
              <div className="chain-list">
                <div className="chain-item"><div className="chain-node"><div className="lnk" style={{ background: "var(--bg-inset)", color: "var(--text-subtle)" }}><Ia n="arrow-up" /></div></div><div className="chain-info"><div className="ca" style={{ fontSize: 12, color: "var(--text-muted)" }}>Previous entry</div><div className="cm hashmono" style={{ color: "var(--text-muted)" }}>{e.p}…</div></div></div>
                <div className="chain-item"><div className="chain-node"><div className="lnk"><Ia n="link" /></div></div><div className="chain-info"><div className="ca">This entry</div><div className="cm hashmono">{e.h}…</div></div><div className="chain-hash"><AU.Badge tone="green" size="sm" dot>VERIFIED</AU.Badge></div></div>
                <div className="chain-item"><div className="chain-node"><div className="lnk" style={{ background: "var(--bg-inset)", color: "var(--text-subtle)" }}><Ia n="arrow-down" /></div></div><div className="chain-info"><div className="ca" style={{ fontSize: 12, color: "var(--text-muted)" }}>Next entry</div><div className="cm hashmono" style={{ color: "var(--text-muted)" }}>links forward ✓</div></div></div>
              </div>
              <div className="fxai"><Ia n="shield-check" /><div className="t"><b>Integrity intact.</b> This entry's hash includes the previous entry's hash; recomputing the chain reproduces the signed Merkle root.</div></div>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <span className="grow"><Ia n="lock" /> Append-only · cannot be edited or deleted</span>
          <AU.Button variant="secondary" iconLeft={<Ia n="download" />} onClick={onClose}>Export entry</AU.Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Chain verification ---------- */
function VerifyModal({ onClose }) {
  const [done, setDone] = useStateAu(false);
  useEffectAu(() => { lau(); const t = setTimeout(() => setDone(true), 1400); return () => clearTimeout(t); }, []);
  useEffectAu(lau, [done]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--mid" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div><h2>Verify chain integrity</h2><div className="modal__sub">Re-walk the SHA-256 hash chain end to end</div></div>
          <button className="modal__x" onClick={onClose}><Ia n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="vrun">
            {!done ? (
              <React.Fragment>
                <div className="vrun__ring" style={{ background: "var(--secondary-soft)", color: "var(--secondary-text)" }}><Ia n="loader" /></div>
                <h3>Walking the chain…</h3>
                <p>Recomputing entry hashes and comparing against the signed Merkle root.</p>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="vrun__ring"><Ia n="shield-check" /></div>
                <h3>Integrity verified · 0 breaks</h3>
                <p>The entire audit chain reproduces the signed root. No entry was altered, inserted, or removed.</p>
                <div className="vrun__grid">
                  <div className="fxmeta__row"><span className="fxmeta__k">Entries walked</span><span className="fxmeta__v mono">8,412,556</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">Breaks found</span><span className="fxmeta__v" style={{ color: "var(--status-approved-text)" }}>0</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">Merkle root</span><span className="fxmeta__v mono">a3f9…c21b</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">Signed by</span><span className="fxmeta__v">NEC HSM-01</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">Duration</span><span className="fxmeta__v mono">1.31s</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">Verified at</span><span className="fxmeta__v mono">14:41:30</span></div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
        <div className="modal__foot">
          <AU.Button variant="ghost" onClick={onClose}>Close</AU.Button>
          <AU.Button variant="primary" disabled={!done} iconLeft={<Ia n="file-down" />} onClick={onClose}>Download proof</AU.Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Export / audit report ---------- */
function ExportAuditModal({ onClose, onConfirm }) {
  const [fmt, setFmt] = useStateAu("csv");
  useEffectAu(lau, [fmt]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--mid" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div><h2>Export audit report</h2><div className="modal__sub">Signed, tamper-evident extract</div></div>
          <button className="modal__x" onClick={onClose}><Ia n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="fxform">
            <div>
              <label className="fxf__l">Format</label>
              <div className="fx-seg">
                {[["csv", "CSV"], ["json", "JSON"], ["pdf", "PDF report"]].map(([k, l]) => (
                  <button key={k} className={fmt === k ? "on normal" : ""} onClick={() => setFmt(k)}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label className="fxf__l">Date range</label><AU.Select options={["Today", "Last 24 hours", "Last 7 days", "Custom…"]} /></div>
              <div><label className="fxf__l">Service</label><AU.Select options={["All services", "Verification", "AI / ML", "Registry", "IAM", "Auth"]} /></div>
            </div>
            <div>
              <label className="fxf__l">Include</label>
              <div className="fx-checks">
                <label className="fx-check"><input type="checkbox" defaultChecked /> Full event payloads</label>
                <label className="fx-check"><input type="checkbox" defaultChecked /> Hash-chain references</label>
                <label className="fx-check"><input type="checkbox" defaultChecked /> Signed Merkle proof</label>
                <label className="fx-check"><input type="checkbox" /> Actor IP &amp; device</label>
              </div>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <span className="grow"><Ia n="lock" /> Exports are watermarked &amp; logged</span>
          <AU.Button variant="ghost" onClick={onClose}>Cancel</AU.Button>
          <AU.Button variant="primary" iconLeft={<Ia n="download" />} onClick={onConfirm}>Generate report</AU.Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Anomaly detail ---------- */
function AnomalyModal({ a, onClose, onAck, onCase }) {
  useEffectAu(lau);
  const max = Math.max(a.baseline, a.observed) * 1.15;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div><h2>{a.t}</h2><div className="modal__sub">{a.id} · {a.when}</div></div>
          <button className="modal__x" onClick={onClose}><Ia n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="fxform">
            <div className={"anom anom--" + a.tone} style={{ cursor: "default", boxShadow: "none" }}>
              <span className="anom__ic"><Ia n={a.icon} /></span>
              <div><div className="anom__t">{a.t}{a.live && <span className="anom__live">LIVE</span>}</div><div className="anom__d">{a.d}</div></div>
            </div>
            <div>
              <label className="fxf__l">{a.signal} · observed vs baseline</label>
              <div className="cmp">
                <div className="cmp__row"><span className="cmp__lbl">Baseline</span><span className="cmp__track"><span className="cmp__fill" style={{ width: (a.baseline / max * 100) + "%", background: "var(--slate-400)" }}></span></span><span className="cmp__v">{a.baseline}{a.unit}</span></div>
                <div className="cmp__row"><span className="cmp__lbl">Observed</span><span className="cmp__track"><span className="cmp__fill" style={{ width: (a.observed / max * 100) + "%", background: TONE_VAR[a.tone] }}></span></span><span className="cmp__v">{a.observed}{a.unit}</span></div>
              </div>
            </div>
            <div>
              <label className="fxf__l">Affected entities</label>
              <div className="fxflags">{a.entities.map((en, i) => <AU.Badge key={i} tone="neutral" size="sm">{en}</AU.Badge>)}</div>
            </div>
            <div className="fxai"><Ia n="lightbulb" /><div className="t"><b>Recommended action.</b> {a.rec}</div></div>
          </div>
        </div>
        <div className="modal__foot">
          <AU.Button variant="ghost" onClick={onClose}>Mute signal</AU.Button>
          {a.cases && <AU.Button variant="secondary" iconLeft={<Ia n="folder-open" />} onClick={onCase}>Open case {a.cases}</AU.Button>}
          <AU.Button variant="primary" iconLeft={<Ia n="check" />} onClick={onAck}>Acknowledge</AU.Button>
        </div>
      </div>
    </div>
  );
}

/* ============================ MAIN VIEW ============================ */
function AuditView() {
  const [modal, setModal] = useStateAu(null); // verify | export | entry | anomaly
  const [entry, setEntry] = useStateAu(null);
  const [anom, setAnom] = useStateAu(null);
  const [toast, setToast] = useStateAu(null);
  useEffectAu(lau, [modal]);
  const fire = (m) => { setModal(null); setToast(m); setTimeout(() => setToast(null), 2600); };

  const stations = [
    { ps: "PS-014", n: 1284, pct: 0.96 }, { ps: "PS-203", n: 1102, pct: 0.82 },
    { ps: "PS-077", n: 884, pct: 0.66 }, { ps: "PS-118", n: 741, pct: 0.55 },
  ];
  const geo = [
    { l: "Kigali City", d: "9 admins · 6 services", n: "61%", ic: "building-2" },
    { l: "Northern · Musanze", d: "2 admins · 1 new device", n: "14%", ic: "map-pin" },
    { l: "Eastern · Rwamagana", d: "3 admins", n: "13%", ic: "map-pin" },
    { l: "Western · Rubavu", d: "2 admins", n: "12%", ic: "map-pin" },
  ];

  return (
    <div className="audit2">
      <div className="kpis">
        <KpiA label="Chain entries" icon="link" tint={{ bg: "var(--primary-soft)", fg: "var(--primary-text)" }} value="8.41" unit="M" delta="append-only" dir="up" />
        <KpiA label="Events today" icon="activity" tint={{ bg: "var(--secondary-soft)", fg: "var(--secondary-text)" }} value="124k" delta="2.1k / min" dir="up" />
        <KpiA label="Active anomalies" icon="shield-alert" tint={{ bg: "var(--status-review-soft)", fg: "var(--status-review-text)" }} value="3" delta="1 critical" dir="down" />
        <KpiA label="Chain integrity" icon="shield-check" tint={{ bg: "var(--status-approved-soft)", fg: "var(--status-approved-text)" }} value="0" unit="breaks" delta="verified 14:41" dir="up" />
      </div>

      <div className="verified-banner">
        <Ia n="shield-check" s={{ width: 22, height: 22 }} />
        <div>
          <div className="vt">Chain integrity verified</div>
          <div className="vs">8,412,556 entries · SHA-256 hash chain · last verified 14:41:30 · 0 breaks detected</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <AU.Button size="sm" variant="secondary" iconLeft={<Ia n="download" />} onClick={() => setModal("export")}>Export report</AU.Button>
          <AU.Button size="sm" variant="primary" iconLeft={<Ia n="refresh-cw" />} onClick={() => setModal("verify")}>Re-verify chain</AU.Button>
        </div>
      </div>

      <div className="sect-h"><h2>Real-time anomaly detection</h2><div className="end"><AU.Badge tone="amber" dot>3 active signals</AU.Badge></div></div>
      <div className="anoms">
        {ANOMS.map((x) => (
          <div className={"anom anom--" + x.tone} key={x.id} onClick={() => { setAnom(x); setModal("anomaly"); }}>
            <span className="anom__ic"><Ia n={x.icon} /></span>
            <div>
              <div className="anom__t">{x.t}{x.live && <span className="anom__live">LIVE</span>}</div>
              <div className="anom__d">{x.d}</div>
              <div className="anom__when">{x.when}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="fxbar">
        <div className="fxbar__sr"><AU.Input iconLeft={<Ia n="search" />} placeholder="Search by actor, action, hash or station…" /></div>
        <div className="fxbar__sel"><AU.Select options={["All actions", "VOTER_VERIFIED", "VOTER_VOTED", "TEMPLATE_ACCESSED", "PERMISSION_CHANGED", "LOGIN"]} /></div>
        <div className="fxbar__sel"><AU.Select options={["All services", "Verification", "AI / ML", "Registry", "IAM", "Auth"]} /></div>
        <div className="fxbar__sel"><AU.Select options={["Today (live)", "Last hour", "Last 24h", "Custom…"]} /></div>
        <AU.Button variant="secondary" iconLeft={<Ia n="download" />} onClick={() => setModal("export")}>Export</AU.Button>
      </div>

      <div className="cols" style={{ gridTemplateColumns: "1.62fr 1fr", alignItems: "start" }}>
        <AU.Card title="Audit log explorer" subtitle="Append-only · tamper-evident · 7 of 8.41M shown" bodyClassName="p0"
          headerEnd={<AU.Badge tone="green" size="sm" dot>SIGNED</AU.Badge>}>
          <table className="tbl">
            <thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>Station</th><th>Entry hash</th><th></th></tr></thead>
            <tbody>
              {LOG.map((e, i) => (
                <tr className="row-hover clk" key={i} onClick={() => { setEntry(e); setModal("entry"); }}>
                  <td className="mono" style={{ fontSize: 12 }}>{e.t}</td>
                  <td><span className="logact"><span className="dot" style={{ background: TONE_VAR[ACT_TONE[e.action] || "neutral"] }}></span><span className="a">{e.action}</span></span></td>
                  <td><div className="actor"><span className="actor__av">{e.init}</span><div><div className="actor__n">{e.actor}</div><div className="actor__r">{e.role}</div></div></div></td>
                  <td className="mono" style={{ fontSize: 12 }}>{e.station}</td>
                  <td><span className="hashmono">{e.h}…</span></td>
                  <td style={{ textAlign: "right" }} onClick={(ev) => ev.stopPropagation()}><button className="rowact" onClick={() => { setEntry(e); setModal("entry"); }} aria-label="Open entry"><Ia n="chevron-right" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </AU.Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AU.Card title="Verification history" subtitle="By polling station · today">
            <div className="vbs">
              {stations.map((s, i) => (
                <div className="vbs__row" key={i}>
                  <span className="vbs__ps">{s.ps}</span>
                  <span className="vbs__meter"><i style={{ width: s.pct * 100 + "%" }}></i></span>
                  <span className="vbs__n"><b>{s.n.toLocaleString()}</b> · {Math.round(s.pct * 100)}%</span>
                </div>
              ))}
            </div>
          </AU.Card>
          <AU.Card title="Access by location" subtitle="Admin activity · geo-mapped">
            <div className="geo-list">
              {geo.map((g, i) => (
                <div className="geo" key={i}>
                  <span className="geo__ic"><Ia n={g.ic} /></span>
                  <div className="geo__tx"><div className="geo__l">{g.l}</div><div className="geo__d">{g.d}</div></div>
                  <span className="geo__n">{g.n}</span>
                </div>
              ))}
            </div>
          </AU.Card>
        </div>
      </div>

      {modal === "entry" && entry && <LogDetailModal e={entry} onClose={() => setModal(null)} />}
      {modal === "verify" && <VerifyModal onClose={() => setModal(null)} />}
      {modal === "export" && <ExportAuditModal onClose={() => setModal(null)} onConfirm={() => fire("Audit report generated")} />}
      {modal === "anomaly" && anom && <AnomalyModal a={anom} onClose={() => setModal(null)} onAck={() => fire("Anomaly acknowledged · " + anom.id)} onCase={() => fire("Opening case " + anom.cases)} />}
      {toast && <div className="fx-toast"><Ia n="check-circle" s={{ width: 16, height: 16 }} />{toast}</div>}
    </div>
  );
}

window.AdminScreens = window.AdminScreens || {};
window.AdminScreens.AuditView = AuditView;
