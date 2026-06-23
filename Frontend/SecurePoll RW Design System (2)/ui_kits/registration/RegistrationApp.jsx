// RegistrationApp.jsx — offline-first field enrollment wizard
const { useState: useStateR, useEffect: useEffectR } = React;
const R = window.SecurePollRWDesignSystem_92875f;
const Ir = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lucideR() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

const STEPS = ["Details", "Biometrics", "Duplicate check", "Issue ID"];

function Stepper({ step }) {
  return (
    <div className="stepper">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <div className={"step-line" + (i <= step ? " done" : "")}></div>}
          <div className={"step-dot " + (i === step ? "active" : i < step ? "done" : "")}>
            <span className="n">{i < step ? <Ir n="check" s={{ width: 15, height: 15 }} /> : i + 1}</span>
            <span className="lb">{s}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function DetailsStep() {
  useEffectR(lucideR);
  return (
    <div className="form-grid">
      <div className="full"><R.Input label="National ID" required mono placeholder="1 1990 8 0012345 6 78" iconLeft={<Ir n="id-card" />} hint="16 digits, as printed on the card" defaultValue="1 1996 8 0073391 4 21" /></div>
      <R.Input label="Given name" required defaultValue="Chantal" />
      <R.Input label="Family name" required defaultValue="Ingabire" />
      <R.Input label="Date of birth" type="date" required defaultValue="1996-04-12" />
      <R.Select label="Sex" options={["Female", "Male"]} />
      <R.Select label="District" required options={["Kicukiro", "Nyarugenge", "Gasabo"]} />
      <R.Select label="Constituency" required options={["Niboye", "Gatenga", "Kanombe"]} />
      <div className="full"><R.Input label="Residential address" placeholder="Village, cell, sector" defaultValue="Niboye · Kicukiro" iconLeft={<Ir n="map-pin" />} /></div>
    </div>
  );
}

function BiometricsStep({ state, setState }) {
  useEffectR(lucideR, [state]);
  return (
    <div className="bio-grid">
      <div className="bio-pane">
        <h3><Ir n="scan-face" /> Face capture</h3>
        <div className={"bio-frame" + (state.face ? " captured" : "")}>
          <Ir n="user" s={{ width: 64, height: 64 }} />
          {state.face && <span className="ok"><R.Badge tone="green" size="sm" dot>Captured</R.Badge></span>}
        </div>
        {state.face ? (
          <div className="bio-quality">
            <R.ConfidenceMeter value={0.93} threshold={0.7} size="sm" label="Sample quality" />
            <div className="bio-q-row"><span className="l"><Ir n="scan-eye" /> Liveness</span><R.Badge tone="green" size="sm">LIVE</R.Badge></div>
          </div>
        ) : (
          <R.Button variant="primary" fullWidth iconLeft={<Ir n="camera" />} onClick={() => setState({ ...state, face: true })}>Capture face</R.Button>
        )}
      </div>
      <div className="bio-pane">
        <h3><Ir n="fingerprint" /> Fingerprint</h3>
        <div className={"bio-frame" + (state.print ? " captured" : "")}>
          <Ir n="fingerprint" s={{ width: 64, height: 64 }} />
          {state.print && <span className="ok"><R.Badge tone="green" size="sm" dot>Captured</R.Badge></span>}
        </div>
        {state.print ? (
          <div className="bio-quality">
            <R.ConfidenceMeter value={0.88} threshold={0.7} size="sm" label="Minutiae quality" />
            <div className="bio-q-row"><span className="l"><Ir n="check-circle-2" /> Index finger</span><R.Badge tone="blue" size="sm">RIGHT</R.Badge></div>
          </div>
        ) : (
          <R.Button variant="primary" fullWidth iconLeft={<Ir n="scan-line" />} onClick={() => setState({ ...state, print: true })}>Scan fingerprint</R.Button>
        )}
      </div>
    </div>
  );
}

function DuplicateStep() {
  useEffectR(lucideR);
  return (
    <div>
      <div className="dup-banner clean">
        <Ir n="shield-check" s={{ width: 24, height: 24 }} />
        <div>
          <div className="dt">No duplicate found</div>
          <div className="ds">1:N scan against 8.42M templates · top match 0.31 · well below the 0.85 threshold</div>
        </div>
        <div style={{ marginLeft: "auto" }}><R.Badge tone="green" dot>CLEAR</R.Badge></div>
      </div>
      <R.Card title="Review enrollment" subtitle="Confirm before issuing the voter ID">
        <div className="summary-card">
          <div className="summary-row"><span className="k">Name</span><span className="v">Chantal Ingabire</span></div>
          <div className="summary-row"><span className="k">National ID</span><span className="v mono">1 1996 8 0073391 4 21</span></div>
          <div className="summary-row"><span className="k">Date of birth</span><span className="v">12 Apr 1996</span></div>
          <div className="summary-row"><span className="k">Constituency</span><span className="v">Niboye · Kicukiro</span></div>
          <div className="summary-row"><span className="k">Biometrics</span><span className="v">Face 0.93 · Fingerprint 0.88 · LIVE</span></div>
          <div className="summary-row"><span className="k">Captured by</span><span className="v">Officer #88 · GPS tagged</span></div>
        </div>
      </R.Card>
    </div>
  );
}

function IssueStep() {
  useEffectR(lucideR);
  return (
    <div className="issue">
      <div className="issue__ring"><Ir n="badge-check" s={{ width: 46, height: 46 }} /></div>
      <h2>Voter ID issued</h2>
      <p>Chantal Ingabire is registered. The card below is queued to print, and the record will sync when the device is back online.</p>
      <div className="voter-id-card">
        <div className="vc-top">
          <div className="vc-brand"><img src="../../assets/logo-wordmark-dark.svg" style={{ height: 24 }} alt="SecurePoll RW" /></div>
          <div className="vc-qr"><Ir n="qr-code" s={{ width: 48, height: 48 }} /></div>
        </div>
        <div className="vc-name">Chantal Ingabire</div>
        <div className="vc-id">RW-2026-9F44-21A0</div>
        <div className="vc-meta">
          <div>Constituency<b>Niboye</b></div>
          <div>District<b>Kicukiro</b></div>
          <div>Issued<b>07 Jun 2026</b></div>
        </div>
      </div>
    </div>
  );
}

function RegistrationApp() {
  const [step, setStep] = useStateR(0);
  const [bio, setBio] = useStateR({ face: false, print: false });
  useEffectR(lucideR, [step]);
  const canNext = step !== 1 || (bio.face && bio.print);
  return (
    <div className="reg">
      <header className="reg__bar">
        <img src="../../assets/mark.svg" alt="" />
        <div>
          <div className="ttl">Field Registration</div>
          <div className="sub">Mobile enrollment · Kicukiro team</div>
        </div>
        <div className="reg__bar-end">
          <span className="reg__offline"><Ir n="cloud-off" /> Offline</span>
          <span className="reg__queue"><Ir n="upload-cloud" /> 23 queued to sync</span>
        </div>
      </header>
      <Stepper step={step} />
      <main className="reg__stage">
        <div className="reg__inner">
          {step === 0 && <DetailsStep />}
          {step === 1 && <BiometricsStep state={bio} setState={setBio} />}
          {step === 2 && <DuplicateStep />}
          {step === 3 && <IssueStep />}
        </div>
      </main>
      <footer className="reg__foot">
        <R.Button variant="ghost" iconLeft={<Ir n="arrow-left" />} disabled={step === 0}
          onClick={() => setStep(Math.max(0, step - 1))}>Back</R.Button>
        {step < 3 ? (
          <R.Button variant="primary" iconRight={<Ir n="arrow-right" />} disabled={!canNext}
            onClick={() => setStep(step + 1)}>
            {step === 2 ? "Issue voter ID" : "Continue"}
          </R.Button>
        ) : (
          <R.Button variant="primary" iconLeft={<Ir n="user-plus" />} onClick={() => { setStep(0); setBio({ face: false, print: false }); }}>
            New registration
          </R.Button>
        )}
      </footer>
    </div>
  );
}
window.RegistrationApp = RegistrationApp;
