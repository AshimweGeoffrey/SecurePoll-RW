// AdminLogin.jsx — admin sign-in with two-factor authentication
const { useState: useSt, useRef: useRf, useEffect: useEf } = React;
const LG = window.SecurePollRWDesignSystem_92875f;
const Il = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function llg() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

function LoginBrand() {
  return (
    <aside className="login__brand">
      <div className="login__logo"><img src="../../assets/mark.svg" alt="" /><span>SecurePoll RW</span></div>
      <div className="login__sp"></div>
      <h2>Secure access to the national election platform.</h2>
      <p className="login__lede">The administration & audit console for the National Electoral Commission. Every session is role-scoped, multi-factor protected, and written to the tamper-evident audit chain.</p>
      <div className="login__pills">
        <span className="login__pill"><Il n="key-round" /> Role-based access</span>
        <span className="login__pill"><Il n="smartphone" /> MFA required</span>
        <span className="login__pill"><Il n="file-check-2" /> Audit-logged</span>
      </div>
      <div className="login__sp"></div>
      <div className="login__seal"><Il n="lock" /> Authorised personnel only · activity is monitored & recorded</div>
    </aside>
  );
}

function CredStep({ onContinue }) {
  const [show, setShow] = useSt(false);
  useEf(llg, [show]);
  return (
    <div className="login__card">
      <span className="login__eyebrow"><Il n="shield-check" /> Administrator portal</span>
      <h1>Sign in</h1>
      <div className="sub">Use your National Electoral Commission credentials.</div>
      <div className="login__fields">
        <LG.Input label="Work email" iconLeft={<Il n="mail" />} placeholder="you@nec.gov.rw" defaultValue="m.kanyana@nec.gov.rw" />
        <div>
          <LG.Input label="Password" type={show ? "text" : "password"} iconLeft={<Il n="lock" />}
            iconRight={<span style={{ cursor: "pointer", display: "grid", placeItems: "center" }} onClick={() => setShow(!show)}><Il n={show ? "eye-off" : "eye"} /></span>}
            defaultValue="dummy-password" />
          <div className="login__row" style={{ marginTop: 12 }}>
            <label className="login__check"><input type="checkbox" /> Trust this device for 12h</label>
            <a className="login__link" href="#">Forgot password?</a>
          </div>
        </div>
      </div>
      <div className="login__cta">
        <LG.Button variant="primary" size="lg" fullWidth iconRight={<Il n="arrow-right" />} onClick={onContinue}>Continue</LG.Button>
      </div>
      <div className="login__note"><Il n="info" /> Multi-factor authentication is required for every administrator. You'll confirm a 6-digit code next.</div>
      <div className="login__alt">Trouble signing in? <a href="#">Contact the IT desk</a></div>
    </div>
  );
}

function OtpStep({ onBack, onVerify }) {
  const [code, setCode] = useSt(["", "", "", "", "", ""]);
  const [err, setErr] = useSt(false);
  const refs = useRf([]);
  useEf(llg);
  const setDigit = (i, val) => {
    const v = val.replace(/\D/g, "");
    setErr(false);
    setCode((c) => {
      const next = [...c];
      if (v.length > 1) { // paste
        v.slice(0, 6).split("").forEach((ch, k) => { if (i + k < 6) next[i + k] = ch; });
      } else { next[i] = v; }
      return next;
    });
    if (v && i < 5) refs.current[i + 1] && refs.current[i + 1].focus();
  };
  const onKey = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1] && refs.current[i - 1].focus();
  };
  const filled = code.every((d) => d !== "");
  const verify = () => { if (!filled) { setErr(true); return; } onVerify(); };
  return (
    <div className="login__card">
      <span className="login__eyebrow"><Il n="smartphone" /> Step 2 of 2</span>
      <h1>Two-factor authentication</h1>
      <div className="sub">Enter the 6-digit code from your authenticator app to finish signing in.</div>
      <div className="otp-id">
        <span className="otp-id__av">MK</span>
        <div><div className="otp-id__n">M. Kanyana</div><div className="otp-id__e">m.kanyana@nec.gov.rw</div></div>
        <button className="login__link otp-id__chg" onClick={onBack}>Change</button>
      </div>
      <div className="otp-boxes" style={{ marginTop: 18 }}>
        {code.map((d, i) => (
          <input key={i} ref={(el) => (refs.current[i] = el)} className={"otp-box" + (d ? " filled" : "") + (err ? " err" : "")}
            inputMode="numeric" maxLength={i === 0 ? 6 : 1} value={d} autoFocus={i === 0}
            onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} aria-label={"Digit " + (i + 1)} />
        ))}
      </div>
      {err && <div className="otp-err"><Il n="alert-circle" /> Enter all 6 digits of your authentication code.</div>}
      <div className="login__cta">
        <LG.Button variant="primary" size="lg" fullWidth iconRight={<Il n="log-in" />} onClick={verify}>Verify & sign in</LG.Button>
      </div>
      <div className="otp-resend">Didn't get a code? <button>Resend</button> · <button>Use a recovery code</button></div>
      <div className="otp-app"><Il n="shield-check" /><span className="t">Open your authenticator app (any TOTP app) to read the rotating code for SecurePoll RW. Codes refresh every 30 seconds.</span></div>
    </div>
  );
}

function AdminLogin() {
  const [step, setStep] = useSt("creds");
  useEf(llg, [step]);
  return (
    <div className="login">
      <LoginBrand />
      <section className="login__form">
        {step === "creds"
          ? <CredStep onContinue={() => setStep("otp")} />
          : <OtpStep onBack={() => setStep("creds")} onVerify={() => { window.location.href = "index.html"; }} />}
      </section>
    </div>
  );
}
window.AdminLogin = AdminLogin;
