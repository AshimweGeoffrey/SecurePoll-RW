import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserRound, KeyRound, ArrowRight, Activity, FileSearch, ShieldCheck, Lock, Info } from "lucide-react";
import { Input, Button } from "../../components/index.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import wordmarkDark from "../../assets/logo-wordmark-dark.svg";

function AuthBrand() {
  return (
    <aside className="auth__brand">
      <img src={wordmarkDark} alt="SecurePoll RW" />
      <div className="bspacer" />
      <h2>Observer access to the live election dashboard.</h2>
      <p className="lede">Accredited domestic and international observers get a transparent, read-only window into the count — aggregated turnout, station status, and the public audit trail.</p>
      <div className="auth__feats">
        <div className="auth__feat"><div className="fi"><Activity size={18} /></div><div><div className="ft">Real-time turnout</div><div className="fs">Nationwide and by constituency, updated every 30 seconds</div></div></div>
        <div className="auth__feat"><div className="fi"><FileSearch size={18} /></div><div><div className="ft">Public audit log</div><div className="fs">Every aggregation is hash-chained and independently verifiable</div></div></div>
        <div className="auth__feat"><div className="fi"><ShieldCheck size={18} /></div><div><div className="ft">Read-only by design</div><div className="fs">Observers can see everything and change nothing</div></div></div>
      </div>
      <div className="bspacer" />
      <div className="auth__seal"><Lock size={15} /> Accredited under NEC Observer Framework · Law 058/2021</div>
    </aside>
  );
}

export default function ObserverLogin() {
  const { login, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("obs.test@nec.gov.rw");
  const [password, setPassword] = useState("ObserverPass123!");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { if (isAuthed) navigate("/portal/observer", { replace: true }); }, [isAuthed]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const { mfaRequired } = await login(email.trim(), password);
      if (mfaRequired) { setErr("This account requires 2FA — please use the admin sign-in."); return; }
      navigate("/portal/observer", { replace: true });
    } catch (e2) {
      setErr(e2.message || "Invalid credentials");
    } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <AuthBrand />
      <section className="auth__form">
        <form className="inner" onSubmit={submit}>
          <span className="auth__eyebrow"><Eye size={14} /> Observer portal</span>
          <h1>Sign in</h1>
          <div className="sub">Use the credentials issued with your NEC accreditation.</div>

          <div className="auth__fields">
            <Input label="Observer ID or email" iconLeft={<UserRound size={17} />} value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@org.org" autoComplete="username" />
            <Input label="Password" type={show ? "text" : "password"} iconLeft={<KeyRound size={17} />} value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
              iconRight={<span style={{ cursor: "pointer", display: "grid", placeItems: "center", pointerEvents: "auto" }} onClick={() => setShow(!show)}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</span>} />
            <div className="auth__row">
              <label className="auth__check"><input type="checkbox" defaultChecked /> Keep me signed in</label>
              <a className="auth__link" href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>
          </div>

          {err && (
            <div style={{ marginTop: 16, fontSize: "var(--text-sm)", color: "var(--status-rejected-text)", background: "var(--status-rejected-soft)", border: "1px solid var(--status-rejected)", padding: "9px 12px", borderRadius: "var(--radius-md)" }}>
              {err}
            </div>
          )}

          <div className="auth__cta">
            <Button variant="primary" size="lg" fullWidth type="submit" loading={busy} iconRight={!busy && <ArrowRight size={18} />}>Sign in to dashboard</Button>
          </div>

          <div className="auth__note"><Info size={14} /> First time here? Your organisation must be accredited by the NEC before observers can be registered.</div>
          <div className="auth__alt">New observer? <Link to="/portal/observer-register">Request accreditation access</Link></div>
        </form>
      </section>
    </div>
  );
}
