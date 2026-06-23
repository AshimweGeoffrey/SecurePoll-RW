import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanFace, Search, ArrowLeft, CheckCircle2, RotateCcw, Settings2, Vote } from "lucide-react";
import { voters as votersApi, verification, votes } from "../../api/endpoints.js";
import { useLookups } from "../../lib/useLookups.js";
import { useToast } from "../../lib/toast.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import { fullName, ageFrom, prettyStatus, fmtScore } from "../../lib/format.js";
import {
  Button, Input, Select, Badge, StatusBadge, DecisionPanel, Loading,
} from "../../components/index.js";
import { Brand } from "../../components/Brand.jsx";
import { BiometricCapture } from "../../components/BiometricCapture.jsx";
import "./kiosk.css";

const CFG_KEY = "sp.kiosk.cfg";

function loadCfg() { try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch { return {}; } }

export default function Kiosk() {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();
  const lookups = useLookups();
  const [cfg, setCfg] = useState(loadCfg());
  const [setupOpen, setSetupOpen] = useState(false);

  const [token, setToken] = useState("");
  const [voter, setVoter] = useState(null);
  const [capture, setCapture] = useState(null);
  const [result, setResult] = useState(null);
  const [voteDone, setVoteDone] = useState(null);
  const [busy, setBusy] = useState("");

  // Require station + officer config before operating.
  useEffect(() => {
    if (lookups.ready && (!cfg.station_id || !cfg.officer_id)) setSetupOpen(true);
  }, [lookups.ready]); // eslint-disable-line

  const station = lookups.byStation[cfg.station_id];
  const officer = lookups.byOfficer[cfg.officer_id];
  const thr = 0.3; // backend face_match_threshold

  const reset = () => { setToken(""); setVoter(null); setCapture(null); setResult(null); setVoteDone(null); };

  const lookup = async () => {
    if (!token.trim()) return;
    setBusy("lookup");
    try {
      const v = await votersApi.byToken(token.trim());
      setVoter(v); setResult(null); setVoteDone(null); setCapture(null);
    } catch (e) {
      toast.error(e.status === 404 ? "No voter found for that token" : e);
      setVoter(null);
    } finally { setBusy(""); }
  };

  const verify = async () => {
    if (!capture) { toast.error("Capture the voter's face first"); return; }
    setBusy("verify");
    try {
      const res = await verification.verify({
        voter_token: voter.voter_token,
        polling_station_id: cfg.station_id,
        officer_id: cfg.officer_id,
        face_image: capture.base64,
      });
      setResult(res);
    } catch (e) { toast.error(e); } finally { setBusy(""); }
  };

  const castVote = async () => {
    setBusy("vote");
    try {
      const res = await votes.cast({ voter_id: voter.id, officer_id: cfg.officer_id, polling_station_id: cfg.station_id });
      setVoteDone(res);
      toast.success("Ballot granted — voter marked VOTED");
    } catch (e) {
      toast.error(e.status === 409 || /already/i.test(e.message) ? "Voter already voted at this station." : e);
    } finally { setBusy(""); }
  };

  const decision = result && (result.result === "manual_review" ? "review" : result.result);
  const breakdown = result ? {
    "Face match": result.decision?.face_score != null ? Number(result.decision.face_score) : Number(result.confidence),
    Liveness: String(result.liveness || "").toUpperCase(),
  } : null;
  const alreadyVoted = voter?.status === "voted";

  return (
    <div className="kiosk" data-theme="dark">
      <div className="kiosk__bar">
        <Brand size={28} subtitle="Polling station kiosk" tone="light" to="/" />
        <div className="sp-grow" />
        <div className="kiosk__meta">
          <div className="l">Station</div>
          <div className="v">{station ? `${station.code}` : "— not set —"}</div>
        </div>
        <div className="kiosk__meta">
          <div className="l">Officer</div>
          <div className="v">{officer ? officer.name : "—"}</div>
        </div>
        <button className="sp-iconbtn" title="Kiosk setup" onClick={() => setSetupOpen(true)}><Settings2 size={18} /></button>
        <Button size="sm" variant="ghost" iconLeft={<ArrowLeft size={15} />} onClick={() => navigate("/")}>Exit</Button>
      </div>

      <div className="kiosk__stage">
        {/* Left — lookup + capture */}
        <div className="kiosk__panel">
          {!voter ? (
            <>
              <div className="kiosk__step">Step 1 · Identify voter</div>
              <div className="kiosk__hero">
                <ScanFace size={56} strokeWidth={1.4} color="var(--primary)" />
                <div className="n" style={{ fontSize: "var(--text-2xl)", marginTop: 12 }}>Scan or enter voter token</div>
                <p className="t-muted t-sm" style={{ marginTop: 6 }}>Read the QR on the voter card, or type the token.</p>
              </div>
              <div className="kiosk__big-input">
                <Input value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} placeholder="RW-2026-XXXX-XXXX"
                  onKeyDown={(e) => e.key === "Enter" && lookup()} autoFocus />
              </div>
              <div style={{ marginTop: "var(--space-4)" }}>
                <Button size="xl" fullWidth variant="primary" iconLeft={<Search size={18} />} loading={busy === "lookup"}
                  disabled={!cfg.station_id || !cfg.officer_id} onClick={lookup}>
                  Look up voter
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="kiosk__step">Step 2 · Capture &amp; verify</div>
              <div className="kiosk__voter" style={{ margin: "var(--space-3) 0 var(--space-4)" }}>
                <div className="sp-row-between">
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--text-strong)" }}>{fullName(voter)}</div>
                    <div className="t-mono t-sm t-muted">{voter.voter_token}</div>
                  </div>
                  <StatusBadge status={voter.status} />
                </div>
                <div className="t-sm t-muted">
                  {prettyStatus(voter.sex)} · {ageFrom(voter.date_of_birth)} yrs · {lookups.byDistrict[voter.district_id]?.name || "—"}
                </div>
              </div>
              <BiometricCapture dark onCapture={setCapture} onClear={() => setCapture(null)} height={260}
                label="Position the voter's face within the frame" />
              <div className="sp-row sp-gap-2 sp-wrap" style={{ marginTop: "var(--space-4)" }}>
                <Button size="lg" variant="primary" iconLeft={<ScanFace size={17} />} loading={busy === "verify"} disabled={!capture} onClick={verify}>
                  Verify identity
                </Button>
                <Button size="lg" variant="ghost" iconLeft={<RotateCcw size={16} />} onClick={reset}>New voter</Button>
              </div>
            </>
          )}
        </div>

        {/* Right — decision + ballot */}
        <div className="kiosk__panel">
          {!result ? (
            <div className="kiosk__hero" style={{ margin: "auto 0", opacity: 0.6 }}>
              <Vote size={56} strokeWidth={1.2} />
              <div className="n" style={{ fontSize: "var(--text-xl)", marginTop: 12 }}>Awaiting verification</div>
              <p className="t-muted t-sm" style={{ marginTop: 6 }}>The AI decision and ballot control appear here.</p>
            </div>
          ) : (
            <div className="sp-stack sp-gap-4">
              <div className="kiosk__step">Step 3 · Decision</div>
              <DecisionPanel
                decision={decision}
                confidence={Number(result.confidence)}
                threshold={thr}
                voterName={fullName(voter)}
                breakdown={breakdown}
                explanation={result.explanation}
                flags={result.flags}
                reviewRequired={result.review_required}
              />
              {voteDone ? (
                <div className="sp-stack sp-gap-2" style={{ alignItems: "center", textAlign: "center", padding: "var(--space-4)", background: "var(--status-approved-soft)", borderRadius: "var(--radius-lg)", border: "1px solid var(--status-approved)" }}>
                  <CheckCircle2 size={40} color="var(--status-approved-text)" />
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--status-approved-text)" }}>BALLOT GRANTED</div>
                  <div className="t-sm t-muted">Voter marked <b>{prettyStatus(voteDone.status)}</b>. Direct them to the booth.</div>
                  <Button variant="primary" iconLeft={<RotateCcw size={16} />} onClick={reset} style={{ marginTop: 8 }}>Next voter</Button>
                </div>
              ) : decision === "approved" ? (
                alreadyVoted ? (
                  <div className="t-sm" style={{ color: "var(--status-rejected-text)", textAlign: "center" }}>Voter already voted at this station — no ballot issued.</div>
                ) : (
                  <Button size="xl" fullWidth variant="primary" iconLeft={<Vote size={18} />} loading={busy === "vote"} onClick={castVote}>
                    Grant ballot
                  </Button>
                )
              ) : (
                <div className="sp-stack sp-gap-3" style={{ textAlign: "center" }}>
                  <div className="t-sm t-muted">
                    {decision === "review" ? "Officer decision required — escalate to a supervisor before issuing a ballot." : "Identity not confirmed — ballot withheld."}
                  </div>
                  <Button variant="ghost" iconLeft={<RotateCcw size={16} />} onClick={reset}>New voter</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {setupOpen && (
        <KioskSetup
          lookups={lookups} cfg={cfg}
          onClose={() => { if (cfg.station_id && cfg.officer_id) setSetupOpen(false); }}
          onSave={(next) => { setCfg(next); localStorage.setItem(CFG_KEY, JSON.stringify(next)); setSetupOpen(false); reset(); }}
        />
      )}
    </div>
  );
}

function KioskSetup({ lookups, cfg, onClose, onSave }) {
  const [station, setStation] = useState(cfg.station_id || "");
  const [officer, setOfficer] = useState(cfg.officer_id || "");
  if (!lookups.ready) return null;
  return (
    <div className="sp-modal-scrim" data-theme="dark">
      <div className="sp-modal" role="dialog">
        <div className="sp-modal__head"><div className="sp-section-title">Kiosk setup</div></div>
        <div className="sp-modal__body sp-stack sp-gap-4">
          <p className="t-sm t-muted">Bind this kiosk to a polling station and the operating officer. Used on every verification.</p>
          <Select label="Polling station" placeholder="Select station" value={station} onChange={(e) => setStation(e.target.value)}
            options={lookups.stations.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))} />
          <Select label="Operating officer" placeholder="Select officer" value={officer} onChange={(e) => setOfficer(e.target.value)}
            options={lookups.officers.map((o) => ({ value: o.id, label: `${o.name}${o.team ? ` · ${o.team}` : ""}` }))} />
        </div>
        <div className="sp-modal__foot">
          {cfg.station_id && cfg.officer_id && <Button variant="ghost" onClick={onClose}>Cancel</Button>}
          <Button variant="primary" disabled={!station || !officer} onClick={() => onSave({ station_id: station, officer_id: officer })}>Save &amp; start</Button>
        </div>
      </div>
    </div>
  );
}
