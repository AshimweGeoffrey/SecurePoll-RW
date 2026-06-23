import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ScanFace, ShieldAlert, CheckCircle2, RotateCcw, Settings2, UserCheck, Copy } from "lucide-react";
import { voters as votersApi, biometrics } from "../../api/endpoints.js";
import { useLookups } from "../../lib/useLookups.js";
import { useToast } from "../../lib/toast.jsx";
import { fullName, fmtScore } from "../../lib/format.js";
import {
  Button, Input, Select, Badge, ConfidenceMeter, Loading, Empty,
} from "../../components/index.js";
import { Brand } from "../../components/Brand.jsx";
import { BiometricCapture } from "../../components/BiometricCapture.jsx";
import "./registration.css";

const CFG_KEY = "sp.reg.cfg";
const STEPS = ["Details", "Biometrics", "Dedup", "Issue"];
const loadCfg = () => { try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch { return {}; } };
const genToken = () => {
  const r = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `RW-${new Date().getFullYear()}-${r.slice(0, 4)}-${r.slice(4, 8)}`;
};

export default function Registration() {
  const navigate = useNavigate();
  const toast = useToast();
  const lookups = useLookups();
  const [cfg, setCfg] = useState(loadCfg());
  const [setupOpen, setSetupOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    first_name: "", last_name: "", national_id: "", sex: "male", date_of_birth: "",
    phone: "", district_id: "", polling_station_id: "",
  });
  const [voter, setVoter] = useState(null);
  const [capture, setCapture] = useState(null);
  const [enrollRes, setEnrollRes] = useState(null);
  const [dedup, setDedup] = useState(null);
  const [busy, setBusy] = useState("");

  useEffect(() => { if (lookups.ready && !cfg.officer_id) setSetupOpen(true); }, [lookups.ready]); // eslint-disable-line
  const officer = lookups.byOfficer[cfg.officer_id];
  const stationsForDistrict = lookups.stations.filter((s) => !form.district_id || s.district_id === form.district_id);

  const resetAll = () => { setStep(0); setForm({ first_name: "", last_name: "", national_id: "", sex: "male", date_of_birth: "", phone: "", district_id: cfg.district_id || "", polling_station_id: "" }); setVoter(null); setCapture(null); setEnrollRes(null); setDedup(null); };

  // Step 1 — create the voter record.
  const submitDetails = async () => {
    const req = ["first_name", "last_name", "national_id", "date_of_birth", "district_id", "polling_station_id"];
    if (req.some((k) => !form[k])) { toast.error("Fill all required fields"); return; }
    setBusy("create");
    try {
      const token = genToken();
      const v = await votersApi.create({
        voter_token: token,
        registration_ref: `#${Math.floor(10000 + Math.random() * 89999)}`,
        national_id: form.national_id, first_name: form.first_name, last_name: form.last_name,
        sex: form.sex, date_of_birth: form.date_of_birth, phone: form.phone || null,
        district_id: form.district_id, polling_station_id: form.polling_station_id, roll_position: null,
      });
      setVoter(v);
      toast.success(`Record created · ${v.voter_token}`);
      setStep(1);
    } catch (e) { toast.error(e); } finally { setBusy(""); }
  };

  // Step 2 — enrol the face biometric.
  const enroll = async () => {
    if (!capture) { toast.error("Capture or upload a face image"); return; }
    setBusy("enroll");
    try {
      const res = await biometrics.enroll(voter.id, capture.base64);
      setEnrollRes(res);
      toast.success(`Face enrolled · quality ${fmtScore(res.quality_score)}`);
      setStep(2);
    } catch (e) { toast.error(e); } finally { setBusy(""); }
  };

  // Step 3 — 1:N dedup scan.
  const runDedup = async () => {
    setBusy("dedup");
    try {
      const res = await biometrics.dedupScan(voter.id);
      setDedup(res);
    } catch (e) { toast.error(e); } finally { setBusy(""); }
  };
  useEffect(() => { if (step === 2 && voter && !dedup && busy !== "dedup") runDedup(); }, [step]); // eslint-disable-line

  const dupCount = dedup ? (dedup.matches?.length ?? dedup.duplicate_count ?? dedup.match_count ?? 0) : 0;

  return (
    <div className="reg">
      <div className="reg__bar">
        <Brand size={28} subtitle="Field registration" to="/" />
        <div className="sp-grow" />
        <Badge tone="blue" dot={false}><UserCheck size={13} style={{ marginRight: 4 }} />{officer ? officer.name : "No officer"}</Badge>
        <button className="sp-iconbtn" title="Setup" onClick={() => setSetupOpen(true)}><Settings2 size={18} /></button>
        <Button size="sm" variant="ghost" iconLeft={<ArrowLeft size={15} />} onClick={() => navigate("/")}>Exit</Button>
      </div>

      <div className="reg__body">
        <div className="reg__steps">
          {STEPS.map((s, i) => (
            <div key={s} className={"reg__step" + (i === step ? " active" : i < step ? " done" : "")}>
              <div className="bar" /><div className="lbl">{i + 1}. {s}</div>
            </div>
          ))}
        </div>

        <div className="reg__card">
          {step === 0 && (
            <div className="sp-stack sp-gap-4">
              <h2 className="sp-section-title">Voter details</h2>
              <div className="sp-grid sp-grid-2">
                <Input label="First name" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                <Input label="Last name" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <div className="sp-grid sp-grid-2">
                <Input label="National ID" required mono value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })} hint="16 digits, as printed on the card" />
                <Select label="Sex" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
              </div>
              <div className="sp-grid sp-grid-2">
                <Input label="Date of birth" required type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                <Input label="Phone" mono value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+2507…" />
              </div>
              <div className="sp-grid sp-grid-2">
                <Select label="District" required placeholder="Select district" value={form.district_id}
                  onChange={(e) => setForm({ ...form, district_id: e.target.value, polling_station_id: "" })}
                  options={lookups.districts.map((d) => ({ value: d.id, label: `${d.name} · ${d.province}` }))} />
                <Select label="Polling station" required placeholder="Select station" value={form.polling_station_id}
                  onChange={(e) => setForm({ ...form, polling_station_id: e.target.value })}
                  options={stationsForDistrict.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))} />
              </div>
              <div className="sp-row-between" style={{ marginTop: "var(--space-2)" }}>
                <span />
                <Button variant="primary" iconRight={<ArrowRight size={16} />} loading={busy === "create"} disabled={!cfg.officer_id} onClick={submitDetails}>
                  Continue to biometrics
                </Button>
              </div>
            </div>
          )}

          {step === 1 && voter && (
            <div className="sp-stack sp-gap-4">
              <h2 className="sp-section-title">Face biometric</h2>
              <p className="t-sm t-muted">Enrolling <b>{fullName(voter)}</b> · <span className="t-mono">{voter.voter_token}</span>. Capture a clear, well-lit face.</p>
              <BiometricCapture onCapture={setCapture} onClear={() => setCapture(null)} height={300} />
              <div className="sp-row-between">
                <Button variant="ghost" iconLeft={<ArrowLeft size={16} />} onClick={() => setStep(0)}>Back</Button>
                <Button variant="primary" iconLeft={<ScanFace size={16} />} loading={busy === "enroll"} disabled={!capture} onClick={enroll}>Enrol face &amp; continue</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="sp-stack sp-gap-4">
              <h2 className="sp-section-title">Deduplication scan</h2>
              {enrollRes && (
                <div className="sp-grid sp-grid-2">
                  <ConfidenceMeter value={Number(enrollRes.quality_score)} threshold={0.4} label="Capture quality" size="sm" />
                  <div className="sp-row sp-gap-2" style={{ alignItems: "center" }}>
                    <span className="t-sm t-muted">Liveness</span>
                    {enrollRes.liveness_passed ? <Badge tone="green">PASSED</Badge> : <Badge tone="red">FAILED</Badge>}
                  </div>
                </div>
              )}
              <div className="sp-divider" />
              {busy === "dedup" || !dedup ? <Loading label="Running 1:N scan against the registry…" /> : (
                dupCount > 0 ? (
                  <div className="sp-stack sp-gap-3" style={{ alignItems: "center", textAlign: "center", padding: "var(--space-4)", background: "var(--status-review-soft)", borderRadius: "var(--radius-lg)", border: "1px solid var(--status-review)" }}>
                    <ShieldAlert size={40} color="var(--status-review-text)" />
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--status-review-text)" }}>{dupCount} POTENTIAL MATCH(ES)</div>
                    <div className="t-sm t-muted">A fraud case has been opened for review. The record is retained and flagged.</div>
                  </div>
                ) : (
                  <div className="sp-stack sp-gap-3" style={{ alignItems: "center", textAlign: "center", padding: "var(--space-4)", background: "var(--status-approved-soft)", borderRadius: "var(--radius-lg)", border: "1px solid var(--status-approved)" }}>
                    <CheckCircle2 size={40} color="var(--status-approved-text)" />
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--status-approved-text)" }}>NO DUPLICATES FOUND</div>
                    <div className="t-sm t-muted">This biometric is unique in the registry.</div>
                  </div>
                )
              )}
              <div className="sp-row-between">
                <Button variant="ghost" iconLeft={<ArrowLeft size={16} />} onClick={() => setStep(1)}>Back</Button>
                <Button variant="primary" iconRight={<ArrowRight size={16} />} disabled={!dedup} onClick={() => setStep(3)}>Finish &amp; issue</Button>
              </div>
            </div>
          )}

          {step === 3 && voter && (
            <div className="reg__issue">
              <CheckCircle2 size={56} color="var(--status-approved-text)" />
              <h2 className="sp-section-title" style={{ marginTop: 12 }}>Registration complete</h2>
              <p className="t-sm t-muted" style={{ marginTop: 6 }}>{fullName(voter)} is enrolled on the certified roll.</p>
              <div className="reg__token">{voter.voter_token}</div>
              <div className="sp-row sp-gap-2" style={{ justifyContent: "center", marginTop: "var(--space-5)" }}>
                <Button variant="secondary" iconLeft={<Copy size={15} />} onClick={() => { navigator.clipboard?.writeText(voter.voter_token); toast.success("Token copied"); }}>Copy token</Button>
                <Button variant="primary" iconLeft={<RotateCcw size={15} />} onClick={resetAll}>Register another voter</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {setupOpen && (
        <RegSetup lookups={lookups} cfg={cfg}
          onClose={() => { if (cfg.officer_id) setSetupOpen(false); }}
          onSave={(next) => { setCfg(next); localStorage.setItem(CFG_KEY, JSON.stringify(next)); setForm((f) => ({ ...f, district_id: next.district_id || f.district_id })); setSetupOpen(false); }} />
      )}
    </div>
  );
}

function RegSetup({ lookups, cfg, onClose, onSave }) {
  const [officer, setOfficer] = useState(cfg.officer_id || "");
  const [district, setDistrict] = useState(cfg.district_id || "");
  if (!lookups.ready) return null;
  return (
    <div className="sp-modal-scrim">
      <div className="sp-modal" role="dialog">
        <div className="sp-modal__head"><div className="sp-section-title">Registration setup</div></div>
        <div className="sp-modal__body sp-stack sp-gap-4">
          <p className="t-sm t-muted">Identify the enrolling officer. Out-of-district enrolment is discouraged.</p>
          <Select label="Enrolling officer" placeholder="Select officer" value={officer} onChange={(e) => setOfficer(e.target.value)}
            options={lookups.officers.map((o) => ({ value: o.id, label: `${o.name}${o.team ? ` · ${o.team}` : ""}` }))} />
          <Select label="Default district" placeholder="Any district" value={district} onChange={(e) => setDistrict(e.target.value)}
            options={[{ value: "", label: "Any district" }, ...lookups.districts.map((d) => ({ value: d.id, label: d.name }))]} />
        </div>
        <div className="sp-modal__foot">
          {cfg.officer_id && <Button variant="ghost" onClick={onClose}>Cancel</Button>}
          <Button variant="primary" disabled={!officer} onClick={() => onSave({ officer_id: officer, district_id: district })}>Save &amp; start</Button>
        </div>
      </div>
    </div>
  );
}
