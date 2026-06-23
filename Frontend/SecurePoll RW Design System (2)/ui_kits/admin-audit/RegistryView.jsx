// RegistryView.jsx — Voter Database Management (Module 5) + full modal set
const { useEffect: useEffectR2, useState: useStateR2 } = React;
const R2 = window.SecurePollRWDesignSystem_92875f;
const Ir = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lr2() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

function KpiR({ label, icon, tint, value, unit, delta, dir }) {
  return (
    <div className="kpi">
      <div className="kpi__top">
        <span className="kpi__lbl">{label}</span>
        <span className="kpi__ic" style={{ background: tint.bg, color: tint.fg }}><Ir n={icon} /></span>
      </div>
      <div className="kpi__val">{value}{unit && <small> {unit}</small>}</div>
      {delta && <span className={"kpi__delta " + dir}><Ir n={dir === "up" ? "trending-up" : "trending-down"} />{delta}</span>}
    </div>
  );
}

const STATUS = {
  registered: { tone: "blue", label: "REGISTERED" },
  voted: { tone: "green", label: "VOTED" },
  blocked: { tone: "red", label: "BLOCKED" },
  flagged: { tone: "amber", label: "FLAGGED" },
  archived: { tone: "neutral", label: "ARCHIVED" },
};

const VOTERS = [
  { nid: "1 1990 8 0012345 6 78", name: "Jean Baptiste Niyonzima", init: "JN", sex: "Male", dob: "12 Aug 1990", district: "Nyarugenge", station: "PS-014", s: "voted", biom: { face: true, print: true }, last: "Voted · 14:41 today", reg: "#18992", enrolled: "08 Mar 2024", phone: "+250 7•• ••• 142", quality: 100 },
  { nid: "1 1994 7 0098765 4 32", name: "Aline Uwase", init: "AU", sex: "Female", dob: "03 Jul 1994", district: "Nyarugenge", station: "PS-014", s: "registered", biom: { face: true, print: true }, last: "Verified · 09 Jun", reg: "#20104", enrolled: "21 Apr 2024", phone: "+250 7•• ••• 887", quality: 100 },
  { nid: "1 1988 2 0044556 7 89", name: "Eric Mugisha", init: "EM", sex: "Male", dob: "19 Feb 1988", district: "Gasabo", station: "PS-203", s: "voted", biom: { face: true, print: false }, last: "Voted · 11:20 today", reg: "#15007", enrolled: "02 Feb 2024", phone: "+250 7•• ••• 410", quality: 92 },
  { nid: "1 2001 5 0077123 9 14", name: "Chantal Ingabire", init: "CI", sex: "Female", dob: "27 May 2001", district: "Kicukiro", station: "PS-118", s: "flagged", biom: { face: true, print: true }, last: "Dedup review · today", reg: "#20451", enrolled: "30 May 2024", phone: "+250 7•• ••• 233", quality: 78 },
  { nid: "1 1979 3 0011998 2 55", name: "Patrick Habimana", init: "PH", sex: "Male", dob: "11 Mar 1979", district: "Gasabo", station: "PS-203", s: "blocked", biom: { face: true, print: true }, last: "Blocked · 02 Jun", reg: "#11998", enrolled: "18 Jan 2024", phone: "+250 7•• ••• 019", quality: 88 },
  { nid: "1 1996 9 0066274 1 07", name: "Diane Mukamana", init: "DM", sex: "Female", dob: "05 Sep 1996", district: "Musanze", station: "PS-061", s: "registered", biom: { face: true, print: true }, last: "Verified · 07 Jun", reg: "#19872", enrolled: "14 Mar 2024", phone: "+250 7•• ••• 556", quality: 100 },
];

/* ---------------- Voter detail (tabbed) ---------------- */
function VoterDetail({ v, onClose, onEdit, onBlock, onArchive, onMerge }) {
  const [tab, setTab] = useStateR2("overview");
  useEffectR2(lr2, [tab]);
  const st = STATUS[v.s];
  const history = [
    { t: "Enrolled in field", s: v.station + " · officer #221 · biometrics captured", m: v.enrolled, state: "done" },
    { t: "Biometrics verified", s: "Face + fingerprint quality passed", m: v.enrolled, state: "done" },
    { t: "Added to certified roll", s: "District: " + v.district, m: "12 Apr 2024", state: "done" },
    { t: v.s === "voted" ? "Voted at station" : "Most recent activity", s: v.last, m: "today", state: v.s === "voted" ? "done" : "current" },
  ];
  const audit = [
    { a: "RECORD_CREATED", m: "Field enrollment · officer #221", h: "a3f9c2…" },
    { a: "BIOMETRIC_LINKED", m: "Template stored · HSM-sealed", h: "7c21be…" },
    { a: "ADDRESS_UPDATED", m: "Sector corrected by support · E. Mugisha", h: "0d44a1…" },
    { a: v.s === "blocked" ? "RECORD_BLOCKED" : "STATUS_SYNCED", m: v.last, h: "f188e0…" },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div><h2>Voter record</h2><div className="modal__sub">{v.reg} · {v.district}</div></div>
          <button className="modal__x" onClick={onClose}><Ir n="x" /></button>
        </div>
        <div className="vprof">
          <div className="vprof__av"><Ir n="user-round" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="vprof__n">{v.name}</div>
            <div className="vprof__id">{v.nid}</div>
            <div className="vprof__badges">
              <R2.Badge tone={st.tone} dot>{st.label}</R2.Badge>
              <R2.Badge tone={v.biom.face && v.biom.print ? "green" : "amber"} size="sm">{v.biom.face && v.biom.print ? "BIOMETRICS COMPLETE" : "BIOMETRICS PARTIAL"}</R2.Badge>
              <R2.Badge tone="neutral" size="sm">{v.station}</R2.Badge>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <R2.Button size="sm" variant="secondary" iconLeft={<Ir n="pencil" />} onClick={onEdit}>Edit</R2.Button>
            <R2.Button size="sm" variant="ghost" iconLeft={<Ir n="git-merge" />} onClick={onMerge}>Merge</R2.Button>
          </div>
        </div>
        <div className="mtabs">
          {[["overview", "Overview"], ["history", "Registration history"], ["audit", "Audit trail"]].map(([k, l]) => (
            <button key={k} className={"mtab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="modal__scroll" style={{ padding: 20 }}>
          {tab === "overview" && (
            <div className="fxmeta">
              <div className="fxmeta__row"><span className="fxmeta__k">Full name</span><span className="fxmeta__v">{v.name}</span></div>
              <div className="fxmeta__row"><span className="fxmeta__k">National ID</span><span className="fxmeta__v mono">{v.nid}</span></div>
              <div className="fxmeta__row"><span className="fxmeta__k">Date of birth</span><span className="fxmeta__v">{v.dob}</span></div>
              <div className="fxmeta__row"><span className="fxmeta__k">Sex</span><span className="fxmeta__v">{v.sex}</span></div>
              <div className="fxmeta__row"><span className="fxmeta__k">District</span><span className="fxmeta__v">{v.district}</span></div>
              <div className="fxmeta__row"><span className="fxmeta__k">Polling station</span><span className="fxmeta__v">{v.station}</span></div>
              <div className="fxmeta__row"><span className="fxmeta__k">Phone</span><span className="fxmeta__v mono">{v.phone}</span></div>
              <div className="fxmeta__row"><span className="fxmeta__k">Enrolled</span><span className="fxmeta__v">{v.enrolled}</span></div>
              <div className="fxmeta__row"><span className="fxmeta__k">Face template</span><span className="fxmeta__v">{v.biom.face ? "On file ✓" : "Missing"}</span></div>
              <div className="fxmeta__row"><span className="fxmeta__k">Fingerprint</span><span className="fxmeta__v">{v.biom.print ? "On file ✓" : "Missing"}</span></div>
            </div>
          )}
          {tab === "history" && (
            <div className="fxtl">
              {history.map((s, i) => (
                <div className={"fxtl-step " + s.state} key={i}>
                  <span className="fxtl-dot"><Ir n={s.state === "done" ? "check" : "loader"} /></span>
                  <div className="fxtl-bd"><div className="tt">{s.t}</div><div className="ts">{s.s}</div><div className="tm">{s.m}</div></div>
                </div>
              ))}
            </div>
          )}
          {tab === "audit" && (
            <div className="chain-list">
              {audit.map((it, i) => (
                <div className="chain-item" key={i}>
                  <div className="chain-node"><div className="lnk"><Ir n="link" /></div></div>
                  <div className="chain-info"><div className="ca">{it.a}</div><div className="cm">{it.m}</div></div>
                  <div className="chain-hash"><span className="h">{it.h}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal__foot">
          <span className="grow"><Ir n="lock" /> All changes are audit-logged</span>
          <R2.Button variant="ghost" onClick={onArchive}>Archive</R2.Button>
          <R2.Button variant="danger" iconLeft={<Ir n="ban" />} onClick={onBlock}>Block voter</R2.Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Edit / Add form ---------------- */
function VoterForm({ v, mode, onClose, onSave }) {
  useEffectR2(lr2);
  const add = mode === "add";
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div><h2>{add ? "Add voter record" : "Edit voter"}</h2><div className="modal__sub">{add ? "Create a new registry entry" : v.name + " · " + v.reg}</div></div>
          <button className="modal__x" onClick={onClose}><Ir n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="fxform">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <R2.Input label="First name" defaultValue={add ? "" : v.name.split(" ")[0]} placeholder="First name" />
              <R2.Input label="Last name" defaultValue={add ? "" : v.name.split(" ").slice(1).join(" ")} placeholder="Last name" />
            </div>
            <R2.Input label="National ID" mono iconLeft={<Ir n="id-card" />} defaultValue={add ? "" : v.nid} placeholder="16 digits" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <R2.Input label="Date of birth" type="date" defaultValue="1994-07-03" />
              <R2.Select label="Sex" options={["Female", "Male"]} defaultValue={add ? "Female" : v.sex} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <R2.Select label="District" options={["Nyarugenge", "Gasabo", "Kicukiro", "Musanze", "Rubavu"]} defaultValue={add ? "Nyarugenge" : v.district} />
              <R2.Input label="Polling station" defaultValue={add ? "" : v.station} placeholder="PS-000" />
            </div>
            <R2.Input label="Phone" iconLeft={<Ir n="phone" />} defaultValue={add ? "" : v.phone} placeholder="+250 7XX XXX XXX" />
            {!add && <R2.Select label="Status" options={["Registered", "Voted", "Flagged", "Blocked", "Archived"]} defaultValue={STATUS[v.s].label[0] + STATUS[v.s].label.slice(1).toLowerCase()} />}
          </div>
        </div>
        <div className="modal__foot">
          <R2.Button variant="ghost" onClick={onClose}>Cancel</R2.Button>
          <R2.Button variant="primary" iconLeft={<Ir n="check" />} onClick={onSave}>{add ? "Create record" : "Save changes"}</R2.Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Batch import (stepper) ---------------- */
function ImportModal({ onClose, onDone }) {
  const [step, setStep] = useStateR2(1);
  useEffectR2(lr2, [step]);
  const steps = ["Upload", "Map columns", "Validate", "Import"];
  const maps = [["national_id", "National ID"], ["full_name", "Full name"], ["dob", "Date of birth"], ["district", "District"], ["station", "Polling station"]];
  const vals = [
    { ic: "check", tone: "green", t: "4,812 rows ready to import", s: "All required fields present" },
    { ic: "alert-triangle", tone: "amber", t: "63 rows need review", s: "Missing polling station — will default to district HQ" },
    { ic: "x", tone: "red", t: "12 rows rejected", s: "Invalid or duplicate National ID" },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div><h2>Batch import voters</h2><div className="modal__sub">Bulk enrollment from a verified CSV file</div></div>
          <button className="modal__x" onClick={onClose}><Ir n="x" /></button>
        </div>
        <div className="stepper">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={"step" + (step === i + 1 ? " on" : step > i + 1 ? " done" : "")}>
                <span className="step__n">{step > i + 1 ? "✓" : i + 1}</span><span className="step__l">{s}</span>
              </div>
              {i < steps.length - 1 && <span className={"step__line" + (step > i + 1 ? " done" : "")}></span>}
            </React.Fragment>
          ))}
        </div>
        <div className="modal__scroll" style={{ padding: 20 }}>
          {step === 1 && (
            <div className="reg-drop">
              <Ir n="file-up" />
              <div className="t">Drag a CSV file here, or click to browse</div>
              <div className="s">voters.csv · UTF-8 · max 50,000 rows · 16-digit National IDs</div>
            </div>
          )}
          {step === 2 && (
            <div>
              <p className="msec" style={{ marginBottom: 8 }}>Map CSV columns → registry fields</p>
              {maps.map(([src, dst]) => (
                <div className="maprow" key={src}><span className="src">{src}</span><Ir n="arrow-right" /><R2.Select options={[dst, "— ignore —"]} /></div>
              ))}
            </div>
          )}
          {step === 3 && (
            <div>
              {vals.map((v, i) => (
                <div className="valrow" key={i}>
                  <span className="valrow__ic" style={{ background: `var(--status-${v.tone === "green" ? "approved" : v.tone === "amber" ? "review" : "rejected"}-soft)`, color: `var(--status-${v.tone === "green" ? "approved" : v.tone === "amber" ? "review" : "rejected"}-text)` }}><Ir n={v.ic} /></span>
                  <div><div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-strong)" }}>{v.t}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{v.s}</div></div>
                  <R2.Badge tone={v.tone} size="sm">{["4,812", "63", "12"][i]}</R2.Badge>
                </div>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="import-done">
              <div className="ring"><Ir n="check" /></div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--text-strong)" }}>4,875 records imported</div>
              <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 13.5 }}>4,812 added · 63 flagged for review · 12 rejected. Every record was written to the audit chain.</p>
            </div>
          )}
        </div>
        <div className="modal__foot">
          {step > 1 && step < 4 && <R2.Button variant="ghost" onClick={() => setStep(step - 1)}>Back</R2.Button>}
          {step < 3 && <R2.Button variant="primary" iconRight={<Ir n="arrow-right" />} onClick={() => setStep(step + 1)}>Continue</R2.Button>}
          {step === 3 && <R2.Button variant="primary" iconLeft={<Ir n="upload" />} onClick={() => setStep(4)}>Import 4,875 rows</R2.Button>}
          {step === 4 && <R2.Button variant="primary" onClick={onDone}>Done</R2.Button>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Merge duplicates ---------------- */
function MergeModal({ onClose, onConfirm }) {
  const [win, setWin] = useStateR2("a");
  useEffectR2(lr2, [win]);
  const A = { reg: "#20451", name: "Chantal Ingabire", nid: "1 2001 5 0077123 9 14", enrolled: "30 May 2024", station: "PS-118", biom: "Complete" };
  const B = { reg: "#17220", name: "Chantal Ingabiré", nid: "1 2001 5 0077123 9 14", enrolled: "12 Feb 2024", station: "PS-014", biom: "Face only" };
  const col = (rec, key, other) => (
    <div className={"mcol" + (win === key ? " win" : "")}>
      <div className="mcol__h" onClick={() => setWin(key)}>
        <span className="mcol__radio"></span>
        <div><div className="mcol__t">{rec.name}</div><div className="mcol__s">{rec.reg}</div></div>
        {win === key && <span className="mcol__win">Keep</span>}
      </div>
      <div className={"mrow" + (rec.name !== other.name ? " diff" : "")}><span className="k">Name</span><span className="v">{rec.name}</span></div>
      <div className="mrow"><span className="k">National ID</span><span className="v" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{rec.nid}</span></div>
      <div className={"mrow" + (rec.enrolled !== other.enrolled ? " diff" : "")}><span className="k">Enrolled</span><span className="v">{rec.enrolled}</span></div>
      <div className={"mrow" + (rec.station !== other.station ? " diff" : "")}><span className="k">Station</span><span className="v">{rec.station}</span></div>
      <div className={"mrow" + (rec.biom !== other.biom ? " diff" : "")}><span className="k">Biometrics</span><span className="v">{rec.biom}</span></div>
    </div>
  );
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div><h2>Merge duplicate records</h2><div className="modal__sub">1:N match · 0.88 similarity · pick the record to keep</div></div>
          <button className="modal__x" onClick={onClose}><Ir n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="merge">{col(A, "a", B)}{col(B, "b", A)}</div>
          <div className="merge-note"><Ir n="info" /><div className="t">The kept record absorbs verified history from both. The other record is archived (never deleted) and the merge is recorded in the audit chain. Highlighted rows differ between records.</div></div>
        </div>
        <div className="modal__foot">
          <R2.Button variant="ghost" onClick={onClose}>Cancel</R2.Button>
          <R2.Button variant="primary" iconLeft={<Ir n="git-merge" />} onClick={onConfirm}>Merge into {win === "a" ? A.reg : B.reg}</R2.Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Block / Archive confirms ---------------- */
function ConfirmModal({ kind, v, onClose, onConfirm }) {
  const block = kind === "block";
  const [reason, setReason] = useStateR2(block ? "Confirmed fraud / impersonation" : "Deceased — verified");
  useEffectR2(lr2);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--narrow" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div><h2>{block ? "Block voter" : "Archive record"}</h2><div className="modal__sub">{v.name} · {v.reg}</div></div>
          <button className="modal__x" onClick={onClose}><Ir n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="fxform">
            <div className="fx-warn"><Ir n="alert-triangle" /><div className="t">{block ? "Blocking prevents this voter from being verified at any station. The roll position is retained and the action is fully audit-logged." : "Archiving removes the record from active rolls but never deletes it. It can be restored by an administrator."}</div></div>
            <div>
              <label className="fxf__l">Reason <span className="req">*</span></label>
              <R2.Select value={reason} onChange={(e) => setReason(e.target.value)}
                options={block ? ["Confirmed fraud / impersonation", "Court order", "Duplicate enrollment", "Other (see note)"] : ["Deceased — verified", "Relocated abroad", "Duplicate of another record", "Ineligible"]} />
            </div>
            <div>
              <label className="fxf__l">Note (optional)</label>
              <textarea className="fx-ta" placeholder="Supporting detail for the record…"></textarea>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <R2.Button variant="ghost" onClick={onClose}>Cancel</R2.Button>
          <R2.Button variant="danger" iconLeft={<Ir n={block ? "ban" : "archive"} />} onClick={onConfirm}>{block ? "Block voter" : "Archive record"}</R2.Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Export ---------------- */
function ExportModal({ onClose, onConfirm }) {
  const [fmt, setFmt] = useStateR2("csv");
  useEffectR2(lr2, [fmt]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--mid" onClick={(e) => e.stopPropagation()}>
        <div className="modal__h">
          <div><h2>Export registry</h2><div className="modal__sub">Generate a signed extract of the current filter</div></div>
          <button className="modal__x" onClick={onClose}><Ir n="x" /></button>
        </div>
        <div className="modal__scroll">
          <div className="fxform">
            <div>
              <label className="fxf__l">Format</label>
              <div className="fx-seg">
                {[["csv", "CSV"], ["xlsx", "Excel"], ["pdf", "PDF report"]].map(([k, l]) => (
                  <button key={k} className={fmt === k ? "on normal" : ""} onClick={() => setFmt(k)}>{l}</button>
                ))}
              </div>
            </div>
            <div><label className="fxf__l">Scope</label><R2.Select options={["Current filter (6 shown)", "All Nyarugenge district", "Entire roll (8.42M)"]} /></div>
            <div>
              <label className="fxf__l">Include fields</label>
              <div className="fx-checks">
                <label className="fx-check"><input type="checkbox" defaultChecked /> Identity &amp; demographics</label>
                <label className="fx-check"><input type="checkbox" defaultChecked /> Station &amp; status</label>
                <label className="fx-check"><input type="checkbox" /> Biometric quality scores</label>
                <label className="fx-check"><input type="checkbox" defaultChecked /> Signed integrity hash</label>
              </div>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <span className="grow"><Ir n="lock" /> Exports are watermarked &amp; logged</span>
          <R2.Button variant="ghost" onClick={onClose}>Cancel</R2.Button>
          <R2.Button variant="primary" iconLeft={<Ir n="download" />} onClick={onConfirm}>Export</R2.Button>
        </div>
      </div>
    </div>
  );
}

/* ============================ MAIN VIEW ============================ */
function RegistryView() {
  const [sel, setSel] = useStateR2(null);
  const [modal, setModal] = useStateR2(null); // detail|edit|add|import|merge|block|archive|export
  const [toast, setToast] = useStateR2(null);
  const [loading, setLoading] = useStateR2(true);
  useEffectR2(function () { var t = setTimeout(function () { setLoading(false); }, 1100); return function () { clearTimeout(t); }; }, []);
  useEffectR2(lr2, [modal, sel, loading]);
  const open = (m, v) => { if (v) setSel(v); setModal(m); };
  const fire = (msg) => { setModal(null); setToast(msg); setTimeout(() => setToast(null), 2600); };
  const dq = [
    { k: "Biometrics on file", v: 99.2 }, { k: "Photo captured", v: 98.7 }, { k: "Address complete", v: 96.4 }, { k: "Contact on file", v: 88.1 },
  ];
  const dupes = [
    { a: "#20451 Chantal Ingabire", b: "#17220 Chantal Ingabiré", sc: "0.88" },
    { a: "#20388 Claudine U.", b: "#17220 Claudine Uwineza", sc: "0.84" },
  ];
  return (
    <div className="reg2">
      <div className="kpis">
        <KpiR label="Total registered" icon="users" tint={{ bg: "var(--primary-soft)", fg: "var(--primary-text)" }} value="8.42" unit="M" delta="+4,875 imported today" dir="up" />
        <KpiR label="Biometrics on file" icon="fingerprint" tint={{ bg: "var(--secondary-soft)", fg: "var(--secondary-text)" }} value="99.2" unit="%" delta="56k missing" dir="up" />
        <KpiR label="Flagged / blocked" icon="user-x" tint={{ bg: "var(--status-rejected-soft)", fg: "var(--status-rejected-text)" }} value="1,204" delta="312 pending dedup" dir="down" />
        <KpiR label="Data quality" icon="badge-check" tint={{ bg: "var(--status-approved-soft)", fg: "var(--status-approved-text)" }} value="98.6" unit="%" delta="+0.4 this week" dir="up" />
      </div>

      <div className="fxbar">
        <div className="fxbar__sr"><R2.Input iconLeft={<Ir n="search" />} placeholder="Search by name, National ID or voter ID…" /></div>
        <div className="fxbar__sel"><R2.Select options={["All districts", "Nyarugenge", "Gasabo", "Kicukiro", "Musanze"]} /></div>
        <div className="fxbar__sel"><R2.Select options={["Any status", "Registered", "Voted", "Flagged", "Blocked", "Archived"]} /></div>
        <R2.Button variant="secondary" iconLeft={<Ir n="upload" />} onClick={() => open("import")}>Import</R2.Button>
        <R2.Button variant="secondary" iconLeft={<Ir n="download" />} onClick={() => open("export")}>Export</R2.Button>
        <R2.Button variant="primary" iconLeft={<Ir n="user-plus" />} onClick={() => open("add")}>Add voter</R2.Button>
      </div>

      <div className="reg2__main">
        <R2.Card title="Voter records" subtitle={loading ? "Loading records…" : "8,420,114 total · showing 6"} bodyClassName="p0"
          headerEnd={<R2.Button size="sm" variant="ghost" iconLeft={<Ir n="refresh-cw" />} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1100); }}>Refresh</R2.Button>}>
          <table className="tbl">
            <thead><tr><th>Voter</th><th>District · station</th><th>Biometrics</th><th>Status</th><th>Last activity</th><th></th></tr></thead>
            <tbody>
              {loading ? [0,1,2,3,4,5].map(function (i) { return (
                <tr key={"sk" + i}>
                  <td><div className="sk-row"><span className="sk sk-circle" style={{ "--sz": "36px" }}></span><span className="sk-grow sk-stack" style={{ "--g": "7px" }}><span className="sk sk-line w-70"></span><span className="sk sk-line w-40"></span></span></div></td>
                  <td><span className="sk sk-line w-60" style={{ display: "block" }}></span></td>
                  <td><span className="sk sk-line w-30" style={{ display: "block" }}></span></td>
                  <td><span className="sk sk-chip"></span></td>
                  <td><span className="sk sk-line w-50" style={{ display: "block" }}></span></td>
                  <td></td>
                </tr>
              ); }) : VOTERS.map((v, i) => (
                <tr className="row-hover clk" key={i} onClick={() => open("detail", v)}>
                  <td>
                    <div className="vcell">
                      <span className="vcell__av">{v.init}</span>
                      <div><div className="vcell__n">{v.name}</div><div className="vcell__id">{v.nid}</div></div>
                    </div>
                  </td>
                  <td>{v.district}<div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{v.station}</div></td>
                  <td><span className="biom"><i data-lucide="scan-face" className={v.biom.face ? "ok" : "no"}></i><i data-lucide="fingerprint" className={v.biom.print ? "ok" : "no"}></i></span></td>
                  <td><R2.Badge tone={STATUS[v.s].tone} size="sm" dot>{STATUS[v.s].label}</R2.Badge></td>
                  <td style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{v.last}</td>
                  <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <button className="rowact" onClick={() => open("detail", v)} aria-label="Open record"><Ir n="chevron-right" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </R2.Card>

        <div className="reg-side">
          <R2.Card title="Data quality" subtitle="Registry health">
            <div className="dq">
              <div className="dq__score">
                <div className="dq__ring" style={{ background: "conic-gradient(var(--green-500) 0 98.6%, var(--bg-inset) 98.6% 100%)" }}><span>98.6</span></div>
                <div className="dq__st"><div className="t">Healthy</div><div className="s">8.31M complete records</div></div>
              </div>
              {dq.map((d, i) => (
                <div className="dqbar" key={i}>
                  <div className="top"><span className="k">{d.k}</span><span className="v">{d.v}%</span></div>
                  <div className="dqbar__track"><div className="dqbar__fill" style={{ width: d.v + "%" }}></div></div>
                </div>
              ))}
            </div>
          </R2.Card>
          <R2.Card title="Duplicate review" subtitle="312 pending" headerEnd={<R2.Badge tone="amber" size="sm" dot>312</R2.Badge>}>
            <div className="dupq">
              {dupes.map((d, i) => (
                <div className="dupq__i" key={i}>
                  <div className="dupq__top"><span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-strong)" }}>Likely duplicate</span><span className="dupq__sc">{d.sc}</span></div>
                  <div className="dupq__pair"><b>{d.a}</b><br />↔ {d.b}</div>
                  <R2.Button size="sm" variant="secondary" fullWidth iconLeft={<Ir n="git-merge" />} onClick={() => open("merge")}>Review &amp; merge</R2.Button>
                </div>
              ))}
            </div>
          </R2.Card>
        </div>
      </div>

      {modal === "detail" && sel && <VoterDetail v={sel} onClose={() => setModal(null)} onEdit={() => setModal("edit")} onBlock={() => setModal("block")} onArchive={() => setModal("archive")} onMerge={() => setModal("merge")} />}
      {modal === "edit" && sel && <VoterForm v={sel} mode="edit" onClose={() => setModal(null)} onSave={() => fire("Record updated · " + sel.reg)} />}
      {modal === "add" && <VoterForm mode="add" onClose={() => setModal(null)} onSave={() => fire("Voter record created")} />}
      {modal === "import" && <ImportModal onClose={() => setModal(null)} onDone={() => fire("4,875 records imported")} />}
      {modal === "merge" && <MergeModal onClose={() => setModal(null)} onConfirm={() => fire("Records merged")} />}
      {modal === "block" && sel && <ConfirmModal kind="block" v={sel} onClose={() => setModal(null)} onConfirm={() => fire("Voter blocked · " + sel.reg)} />}
      {modal === "archive" && sel && <ConfirmModal kind="archive" v={sel} onClose={() => setModal(null)} onConfirm={() => fire("Record archived · " + sel.reg)} />}
      {modal === "export" && <ExportModal onClose={() => setModal(null)} onConfirm={() => fire("Export started — you'll be notified")} />}
      {toast && <div className="fx-toast"><Ir n="check-circle" s={{ width: 16, height: 16 }} />{toast}</div>}
    </div>
  );
}

window.AdminScreens = window.AdminScreens || {};
window.AdminScreens.RegistryView = RegistryView;
