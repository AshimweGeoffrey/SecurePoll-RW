import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone, KeyRound, FileCheck2, LogIn, AlertCircle, Info } from "lucide-react";
import { Input, Button } from "../../components/index.js";
import { Brand } from "../../components/Brand.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useToast } from "../../lib/toast.jsx";
import "./login.css";

function CredStep({ onDone }) {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("geoffreyashimwe@gmail.com");
  const [password, setPassword] = useState("SecurePassword123!");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const { mfaRequired } = await login(email.trim(), password);
      onDone(mfaRequired, email.trim());
    } catch (e2) {
      setErr(e2.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="login__card" onSubmit={submit}>
      <span className="login__eyebrow"><ShieldCheck size={14} /> Administrator portal</span>
      <h1>Sign in</h1>
      <div className="login__sub">Use your National Electoral Commission credentials.</div>
      <div className="login__fields">
        <Input label="Work email" type="email" iconLeft={<Mail size={17} />} value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="you@nec.gov.rw" />
        <Input
          label="Password"
          type={show ? "text" : "password"}
          iconLeft={<Lock size={17} />}
          iconRight={
            <span style={{ cursor: "pointer", display: "grid", placeItems: "center", pointerEvents: "auto" }} onClick={() => setShow(!show)}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </span>
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      {err && <div className="login__error"><AlertCircle size={15} /> {err}</div>}
      <div className="login__cta">
        <Button variant="primary" size="lg" fullWidth type="submit" loading={busy} iconRight={!busy && <ArrowRight size={18} />}>
          Continue
        </Button>
      </div>
      <div className="login__note"><Info size={15} /> Multi-factor authentication is required for every administrator. You'll confirm a 6-digit code next.</div>
      <div className="login__alt"><Link to="/">← Back to all surfaces</Link></div>
    </form>
  );
}

function OtpStep({ email, onBack }) {
  const { completeMfa, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    if (cooldown > 0) return;
    try {
      await resendOtp();
      toast.success("A new code has been emailed to you");
      setCooldown(30);
    } catch (e) { toast.error(e); }
  };

  const setDigit = (i, val) => {
    const v = val.replace(/\D/g, "");
    setErr("");
    setCode((c) => {
      const next = [...c];
      if (v.length > 1) {
        v.slice(0, 6).split("").forEach((ch, k) => { if (i + k < 6) next[i + k] = ch; });
      } else next[i] = v;
      return next;
    });
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const verify = async (e) => {
    e?.preventDefault();
    if (!code.every((d) => d !== "")) { setErr("Enter all 6 digits of your authentication code."); return; }
    setBusy(true);
    setErr("");
    try {
      await completeMfa(code.join(""));
      toast.success("Signed in");
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (e2) {
      setErr(e2.message || "Invalid or expired code");
      setCode(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  };

  const initials = email.slice(0, 2).toUpperCase();
  return (
    <form className="login__card" onSubmit={verify}>
      <span className="login__eyebrow"><Smartphone size={14} /> Step 2 of 2</span>
      <h1>Two-factor authentication</h1>
      <div className="login__sub">We've emailed a 6-digit verification code to your address. Enter it below to finish signing in.</div>
      <div className="otp-id">
        <span className="otp-id__av">{initials}</span>
        <div className="sp-grow"><div className="otp-id__e">{email}</div></div>
        <button type="button" className="login__link" onClick={onBack}>Change</button>
      </div>
      <div className="otp-boxes">
        {code.map((d, i) => (
          <input key={i} ref={(el) => (refs.current[i] = el)} className={"otp-box" + (d ? " filled" : "") + (err ? " err" : "")}
            inputMode="numeric" maxLength={i === 0 ? 6 : 1} value={d} autoFocus={i === 0}
            onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} aria-label={"Digit " + (i + 1)} />
        ))}
      </div>
      {err && <div className="login__error"><AlertCircle size={15} /> {err}</div>}
      <div className="login__cta">
        <Button variant="primary" size="lg" fullWidth type="submit" loading={busy} iconRight={!busy && <LogIn size={18} />}>
          Verify &amp; sign in
        </Button>
      </div>
      <div className="otp-app">
        <ShieldCheck size={16} />
        <span>
          Didn't get the email? Check spam, or{" "}
          <button type="button" className="login__link" disabled={cooldown > 0} onClick={resend}
            style={{ opacity: cooldown > 0 ? 0.5 : 1 }}>
            resend the code{cooldown > 0 ? ` (${cooldown}s)` : ""}
          </button>. The code expires in 10 minutes.
        </span>
      </div>
    </form>
  );
}

export default function Login() {
  const { isAuthed, mfaPending, cancelMfa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(mfaPending ? "otp" : "creds");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (isAuthed) navigate(location.state?.from || "/admin", { replace: true });
  }, [isAuthed]); // eslint-disable-line

  return (
    <div className="login">
      <aside className="login__brand">
        <Brand size={34} subtitle="National Electoral Commission" tone="light" to="/" />
        <div style={{ flex: 1 }} />
        <h2>Secure access to the national election platform.</h2>
        <p className="login__lede">
          The administration &amp; audit console for the National Electoral Commission. Every session is
          role-scoped, multi-factor protected, and written to the tamper-evident audit chain.
        </p>
        <div className="login__pills">
          <span className="login__pill"><KeyRound size={14} /> Role-based access</span>
          <span className="login__pill"><Smartphone size={14} /> MFA required</span>
          <span className="login__pill"><FileCheck2 size={14} /> Audit-logged</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="login__seal"><Lock size={14} /> Authorised personnel only · activity is monitored &amp; recorded</div>
      </aside>
      <section className="login__form">
        {step === "creds"
          ? <CredStep onDone={(mfa, em) => { setEmail(em); if (mfa) setStep("otp"); }} />
          : <OtpStep email={email} onBack={() => { cancelMfa(); setStep("creds"); }} />}
      </section>
    </div>
  );
}
