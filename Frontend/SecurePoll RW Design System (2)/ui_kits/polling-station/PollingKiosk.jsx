// PollingKiosk.jsx — election-day verification kiosk (dark theme)
// Screens: idle → voter found → capture → result, driven by a small state machine.
const { useState, useEffect, useRef } = React;
const { Button, Badge, DecisionPanel, ConfidenceMeter } = window.SecurePollRWDesignSystem_92875f;

const Ic = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function relucide() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

// fake roster
const VOTERS = {
  "RW-2026-0F3A-91C7": { name: "Jean Baptiste Niyonzima", nid: "1 1990 8 0012345 6 78", station: "PS-014", constituency: "Nyarugenge", age: 35, status: "registered",
    result: { confidence: 0.91, breakdown: { "Face match": 0.94, "Fingerprint": 0.87, "Liveness": "LIVE" }, explanation: "Strong face match with high liveness confidence. Fingerprint confirms identity." } },
  "RW-2026-7C12-44AB": { name: "Aline Uwase", nid: "1 1994 7 0098765 4 32", station: "PS-014", constituency: "Nyarugenge", age: 31, status: "registered",
    result: { confidence: 0.72, reviewRequired: true, breakdown: { "Face match": 0.74, "Fingerprint": 0.69, "Liveness": "LIVE" }, explanation: "Moderate match. Lighting reduced face confidence — officer review advised." } },
  "RW-2026-22D9-1188": { name: "Eric Mugisha", nid: "1 1988 2 0044556 7 89", station: "PS-014", constituency: "Nyarugenge", age: 37, status: "voted",
    result: null },
};

function KioskChrome({ children, officer }) {
  return (
    <div className="kiosk" data-theme="dark">
      <header className="kiosk__bar">
        <div className="kiosk__brand">
          <img src="../../assets/mark.svg" alt="" />
          <div>
            <div className="kiosk__ttl">SecurePoll RW</div>
            <div className="kiosk__sub">Polling Station 014 · Nyarugenge</div>
          </div>
        </div>
        <div className="kiosk__bar-end">
          <span className="kiosk__pill"><Ic n="wifi" /> Online</span>
          <span className="kiosk__pill"><Ic n="clock" /> 11:42</span>
          <span className="kiosk__officer"><Ic n="shield" /> {officer}</span>
        </div>
      </header>
      <main className="kiosk__stage">{children}</main>
      <footer className="kiosk__foot">
        <span><b>1,204</b> verified today</span>
        <span><b>62.4%</b> turnout</span>
        <span className="kiosk__foot-q"><Ic n="users" /> 18 in queue</span>
      </footer>
    </div>
  );
}

function IdleScreen({ onScan }) {
  useEffect(relucide);
  return (
    <div className="scr scr--idle">
      <div className="idle-ring"><Ic n="qr-code" s={{ width: 64, height: 64 }} /></div>
      <h1>Scan voter ID card</h1>
      <p>Present the QR code on the voter card to the scanner, or enter the voter ID manually.</p>
      <div className="idle-demo">
        <div className="idle-demo__lbl">Demo — pick a card to scan</div>
        <div className="idle-demo__row">
          <Button size="xl" variant="primary" iconLeft={<Ic n="scan-line" />} onClick={() => onScan("RW-2026-0F3A-91C7")}>Strong match</Button>
          <Button size="xl" variant="secondary" iconLeft={<Ic n="scan-line" />} onClick={() => onScan("RW-2026-7C12-44AB")}>Borderline</Button>
          <Button size="xl" variant="secondary" iconLeft={<Ic n="scan-line" />} onClick={() => onScan("RW-2026-22D9-1188")}>Already voted</Button>
        </div>
      </div>
    </div>
  );
}

function VoterScreen({ voter, onBack, onVerify }) {
  useEffect(relucide);
  const voted = voter.status === "voted";
  return (
    <div className="scr scr--voter">
      <div className="voter-card">
        <div className="voter-photo"><Ic n="user" s={{ width: 52, height: 52 }} /></div>
        <div className="voter-meta">
          <div className="voter-name">{voter.name}</div>
          <div className="voter-rows">
            <div><span>National ID</span><b className="mono">{voter.nid}</b></div>
            <div><span>Constituency</span><b>{voter.constituency}</b></div>
            <div><span>Assigned station</span><b>{voter.station}</b></div>
          </div>
          <div className="voter-status">
            {voted
              ? <Badge tone="red" variant="solid" dot>ALREADY VOTED</Badge>
              : <Badge tone="green" dot>Eligible · registered</Badge>}
            <Badge tone="neutral" variant="outline">Station matches</Badge>
          </div>
        </div>
      </div>
      {voted ? (
        <div className="voter-block">
          <Ic n="shield-x" s={{ width: 22, height: 22 }} />
          <div>This voter was already verified at <b>11:06</b> today. Double-voting is blocked. Refer to the supervisor if this is disputed.</div>
        </div>
      ) : (
        <p className="voter-hint">Confirm the photo and details match the person, then begin biometric verification.</p>
      )}
      <div className="scr__actions">
        <Button size="xl" variant="ghost" iconLeft={<Ic n="arrow-left" />} onClick={onBack}>Back</Button>
        {!voted && <Button size="xl" variant="primary" iconLeft={<Ic n="scan-face" />} onClick={onVerify}>Begin face verification</Button>}
      </div>
    </div>
  );
}

function CaptureScreen({ onDone }) {
  const [phase, setPhase] = useState("framing");
  useEffect(relucide);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("matching"), 1400);
    const t2 = setTimeout(() => onDone(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className="scr scr--capture">
      <div className={"cap-frame " + (phase === "matching" ? "cap-frame--scan" : "")}>
        <Ic n="user" s={{ width: 90, height: 90 }} />
        <div className="cap-corners"><i></i><i></i><i></i><i></i></div>
        {phase === "matching" && <div className="cap-laser"></div>}
      </div>
      <div className="cap-status">
        {phase === "framing"
          ? <><span className="cap-dot pulse"></span> Hold still — centering face…</>
          : <><span className="cap-dot scan"></span> Matching against stored template…</>}
      </div>
      <div className="cap-steps">
        <span className="done"><Ic n="check" /> Liveness</span>
        <span className={phase === "matching" ? "active" : ""}><Ic n="scan-face" /> 1:1 face</span>
        <span><Ic n="fingerprint" /> Fingerprint</span>
        <span><Ic n="sigma" /> Fusion</span>
      </div>
    </div>
  );
}

function ResultScreen({ voter, onNext }) {
  useEffect(relucide);
  const r = voter.result;
  const approved = r.confidence >= 0.8;
  return (
    <div className="scr scr--result">
      <div className="result-grid">
        <DecisionPanel voterName={voter.name + " · " + voter.station}
          confidence={r.confidence} breakdown={r.breakdown}
          explanation={r.explanation} reviewRequired={r.reviewRequired} />
        <div className="result-side">
          {approved ? (
            <div className="result-cta result-cta--ok">
              <Ic n="badge-check" s={{ width: 40, height: 40 }} />
              <div className="result-cta__big">Grant ballot</div>
              <p>Voter marked <b>VOTED</b> · turnout updated · logged to audit.</p>
            </div>
          ) : r.reviewRequired ? (
            <div className="result-cta result-cta--rv">
              <Ic n="user-cog" s={{ width: 40, height: 40 }} />
              <div className="result-cta__big">Officer decision</div>
              <p>Review the breakdown, then approve or reject with a logged justification.</p>
              <div className="result-cta__row">
                <Button size="lg" variant="primary" iconLeft={<Ic n="check" />}>Approve</Button>
                <Button size="lg" variant="danger" iconLeft={<Ic n="x" />}>Reject</Button>
              </div>
            </div>
          ) : (
            <div className="result-cta result-cta--no">
              <Ic n="shield-x" s={{ width: 40, height: 40 }} />
              <div className="result-cta__big">Do not grant</div>
              <p>Supervisor alerted. Logged to audit.</p>
            </div>
          )}
          <Button size="xl" variant="secondary" fullWidth iconLeft={<Ic n="arrow-right" />} onClick={onNext}>Next voter</Button>
        </div>
      </div>
    </div>
  );
}

function PollingKiosk() {
  const [screen, setScreen] = useState("idle");
  const [voterId, setVoterId] = useState(null);
  const voter = voterId ? VOTERS[voterId] : null;
  useEffect(relucide, [screen]);
  return (
    <KioskChrome officer="P. Officer · #221">
      {screen === "idle" && <IdleScreen onScan={(id) => { setVoterId(id); setScreen("voter"); }} />}
      {screen === "voter" && <VoterScreen voter={voter} onBack={() => setScreen("idle")} onVerify={() => setScreen("capture")} />}
      {screen === "capture" && <CaptureScreen onDone={() => setScreen("result")} />}
      {screen === "result" && <ResultScreen voter={voter} onNext={() => { setVoterId(null); setScreen("idle"); }} />}
    </KioskChrome>
  );
}

window.PollingKiosk = PollingKiosk;
