// ObserverRegister.jsx — accreditation request for new election observers
const { useState: useSg, useEffect: useEg } = React;
const G = window.SecurePollRWDesignSystem_92875f;
const Ig = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lg() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

function RegBrand() {
  return (
    <aside className="auth__brand">
      <img src="../../assets/logo-wordmark-dark.svg" alt="SecurePoll RW" />
      <div className="bspacer"></div>
      <h2>Request observer accreditation.</h2>
      <p className="lede">Create an account for a domestic monitor, party agent, or international observer mission. Access is granted once the NEC verifies your accreditation.</p>
      <div className="auth__feats">
        <div className="auth__feat"><div className="fi"><Ig n="building" /></div><div><div className="ft">Tied to your organisation</div><div className="fs">Each observer is linked to an accredited body and mission</div></div></div>
        <div className="auth__feat"><div className="fi"><Ig n="badge-check" /></div><div><div className="ft">Verified before access</div><div className="fs">NEC reviews each request — usually within one working day</div></div></div>
        <div className="auth__feat"><div className="fi"><Ig n="eye" /></div><div><div className="ft">Read-only dashboard</div><div className="fs">See aggregated results and the public audit trail in real time</div></div></div>
      </div>
      <div className="bspacer"></div>
      <div className="auth__seal"><Ig n="lock" /> Accredited under NEC Observer Framework · Law 058/2021</div>
    </aside>
  );
}

function ObserverRegister() {
  const [sent, setSent] = useSg(false);
  const [agree, setAgree] = useSg(false);
  useEg(lg, [sent]);

  if (sent) {
    return (
      <div className="auth">
        <RegBrand />
        <section className="auth__form">
          <div className="inner" style={{ textAlign: "center" }}>
            <div className="done-ring" style={{ margin: "0 auto 18px" }}><Ig n="mail-check" /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--text-strong)", margin: 0 }}>Request received</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 10, lineHeight: 1.55 }}>Your accreditation request has been sent to the NEC for review. We've emailed a confirmation to your address — you'll be notified once your account is approved, usually within one working day.</p>
            <div className="ref-chip" style={{ marginTop: 22 }}>
              <div>
                <div className="rl">Application reference</div>
                <div className="rv">OBS-REQ-3F90</div>
              </div>
              <G.Badge tone="amber" dot>PENDING REVIEW</G.Badge>
            </div>
            <div style={{ marginTop: 26 }}>
              <a className="plain" href="observer-login.html"><G.Button variant="secondary" iconLeft={<Ig n="arrow-left" />}>Back to sign in</G.Button></a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="auth">
      <RegBrand />
      <section className="auth__form" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="inner" style={{ maxWidth: 460 }}>
          <span className="auth__eyebrow"><Ig n="user-plus" /> Observer portal</span>
          <h1>Create your account</h1>
          <div className="sub">Tell us who you are and which body accredited you.</div>

          <div className="auth__fields">
            <div className="fg">
              <G.Input label="First name" required defaultValue="Aline" />
              <G.Input label="Last name" required defaultValue="Mukamana" />
            </div>
            <G.Input label="Work email" required type="email" iconLeft={<Ig n="mail" />} placeholder="you@organisation.org" />
            <G.Select label="Observer category" required placeholder="Select a category"
              options={["Domestic civil-society monitor", "Political party agent", "International observer mission", "Media / press"]} />
            <G.Input label="Accredited organisation" required iconLeft={<Ig n="building" />} placeholder="e.g. Transparency International Rwanda" />
            <G.Input label="NEC accreditation number" required mono iconLeft={<Ig n="badge-check" />} placeholder="ACC-2026-XXXXX" defaultValue="ACC-2026-01928" hint="Found on your accreditation letter from the NEC" />
            <G.Input label="Create password" required type="password" iconLeft={<Ig n="key-round" />} hint="At least 12 characters, with a number and a symbol" defaultValue="dummy-password" />

            <label className="auth__check" style={{ alignItems: "flex-start", lineHeight: 1.45 }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 2 }} />
              <span>I confirm the details above are accurate and I agree to the <a className="auth__link" href="#">Observer Code of Conduct</a> and data-protection terms (Law 058/2021).</span>
            </label>
          </div>

          <div className="auth__cta">
            <G.Button variant="primary" size="lg" fullWidth disabled={!agree} iconRight={<Ig n="arrow-right" />} onClick={() => setSent(true)}>Submit for accreditation</G.Button>
          </div>

          <div className="auth__alt">Already have an account? <a href="observer-login.html">Sign in</a></div>
        </div>
      </section>
    </div>
  );
}
window.ObserverRegister = ObserverRegister;
