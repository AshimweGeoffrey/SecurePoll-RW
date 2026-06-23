// ObserverLogin.jsx — accredited election-observer sign-in
const { useState: useSl, useEffect: useEl } = React;
const L = window.SecurePollRWDesignSystem_92875f;
const Il = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function ll() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

function AuthBrand() {
  return (
    <aside className="auth__brand">
      <img src="../../assets/logo-wordmark-dark.svg" alt="SecurePoll RW" />
      <div className="bspacer"></div>
      <h2>Observer access to the live election dashboard.</h2>
      <p className="lede">Accredited domestic and international observers get a transparent, read-only window into the count — aggregated turnout, station status, and the public audit trail.</p>
      <div className="auth__feats">
        <div className="auth__feat"><div className="fi"><Il n="activity" /></div><div><div className="ft">Real-time turnout</div><div className="fs">Nationwide and by constituency, updated every 30 seconds</div></div></div>
        <div className="auth__feat"><div className="fi"><Il n="file-search" /></div><div><div className="ft">Public audit log</div><div className="fs">Every aggregation is hash-chained and independently verifiable</div></div></div>
        <div className="auth__feat"><div className="fi"><Il n="shield-check" /></div><div><div className="ft">Read-only by design</div><div className="fs">Observers can see everything and change nothing</div></div></div>
      </div>
      <div className="bspacer"></div>
      <div className="auth__seal"><Il n="lock" /> Accredited under NEC Observer Framework · Law 058/2021</div>
    </aside>
  );
}

function ObserverLogin() {
  const [show, setShow] = useSl(false);
  useEl(ll, [show]);
  return (
    <div className="auth">
      <AuthBrand />
      <section className="auth__form">
        <div className="inner">
          <span className="auth__eyebrow"><Il n="eye" /> Observer portal</span>
          <h1>Sign in</h1>
          <div className="sub">Use the credentials issued with your NEC accreditation.</div>

          <div className="auth__fields">
            <L.Input label="Observer ID or email" iconLeft={<Il n="user-round" />} placeholder="OBS-2026-00481 or you@org.org" defaultValue="OBS-2026-00481" />
            <div>
              <L.Input label="Password" type={show ? "text" : "password"} iconLeft={<Il n="key-round" />}
                iconRight={<span style={{ cursor: "pointer", display: "grid", placeItems: "center" }} onClick={() => setShow(!show)}><Il n={show ? "eye-off" : "eye"} /></span>}
                defaultValue="dummy-password" />
              <div className="auth__row" style={{ marginTop: 12 }}>
                <label className="auth__check"><input type="checkbox" defaultChecked /> Keep me signed in</label>
                <a className="auth__link" href="#">Forgot password?</a>
              </div>
            </div>
          </div>

          <div className="auth__cta">
            <a className="plain" href="observer-dashboard.html" style={{ display: "block", textDecoration: "none" }}>
              <L.Button variant="primary" size="lg" fullWidth iconRight={<Il n="arrow-right" />}>Sign in to dashboard</L.Button>
            </a>
          </div>

          <div className="auth__note"><Il n="info" /> First time here? Your organisation must be accredited by the NEC before observers can be registered.</div>

          <div className="auth__alt">New observer? <a href="observer-register.html">Request accreditation access</a></div>
        </div>
      </section>
    </div>
  );
}
window.ObserverLogin = ObserverLogin;
