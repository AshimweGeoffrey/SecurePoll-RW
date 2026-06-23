import { useState } from "react";
import { Link } from "react-router-dom";
import { Building, BadgeCheck, Eye, Mail, KeyRound, ArrowLeft, ArrowRight, MailCheck, UserPlus, Lock } from "lucide-react";
import { Input, Select, Button, Badge } from "../../components/index.js";
import wordmarkDark from "../../assets/logo-wordmark-dark.svg";

function RegBrand() {
  return (
    <aside className="auth__brand">
      <img src={wordmarkDark} alt="SecurePoll RW" />
      <div className="bspacer" />
      <h2>Request observer accreditation.</h2>
      <p className="lede">Create an account for a domestic monitor, party agent, or international observer mission. Access is granted once the NEC verifies your accreditation.</p>
      <div className="auth__feats">
        <div className="auth__feat"><div className="fi"><Building size={18} /></div><div><div className="ft">Tied to your organisation</div><div className="fs">Each observer is linked to an accredited body and mission</div></div></div>
        <div className="auth__feat"><div className="fi"><BadgeCheck size={18} /></div><div><div className="ft">Verified before access</div><div className="fs">NEC reviews each request — usually within one working day</div></div></div>
        <div className="auth__feat"><div className="fi"><Eye size={18} /></div><div><div className="ft">Read-only dashboard</div><div className="fs">See aggregated results and the public audit trail in real time</div></div></div>
      </div>
      <div className="bspacer" />
      <div className="auth__seal"><Lock size={15} /> Accredited under NEC Observer Framework · Law 058/2021</div>
    </aside>
  );
}

const genRef = () => `OBS-REQ-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export default function ObserverRegister() {
  const [agree, setAgree] = useState(false);
  const [sent, setSent] = useState(null);
  const [f, setF] = useState({ first: "", last: "", email: "", category: "", org: "", acc: "", password: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // No backend observer-registration endpoint — captured as a pending accreditation
  // request with a client-side application reference (mirrors the NEC review workflow).
  const submit = () => { if (agree) setSent(genRef()); };

  if (sent) {
    return (
      <div className="auth">
        <RegBrand />
        <section className="auth__form">
          <div className="inner" style={{ textAlign: "center" }}>
            <div className="done-ring" style={{ margin: "0 auto 18px" }}><MailCheck size={44} /></div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--text-strong)", margin: 0 }}>Request received</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 10, lineHeight: 1.55 }}>Your accreditation request has been sent to the NEC for review. We've emailed a confirmation to your address — you'll be notified once your account is approved, usually within one working day.</p>
            <div className="ref-chip" style={{ marginTop: 22 }}>
              <div>
                <div className="rl">Application reference</div>
                <div className="rv">{sent}</div>
              </div>
              <Badge tone="amber" dot>PENDING REVIEW</Badge>
            </div>
            <div style={{ marginTop: 26 }}>
              <Link to="/portal/observer-login" className="plain"><Button variant="secondary" iconLeft={<ArrowLeft size={16} />}>Back to sign in</Button></Link>
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
          <span className="auth__eyebrow"><UserPlus size={14} /> Observer portal</span>
          <h1>Create your account</h1>
          <div className="sub">Tell us who you are and which body accredited you.</div>

          <div className="auth__fields">
            <div className="fg">
              <Input label="First name" required value={f.first} onChange={set("first")} />
              <Input label="Last name" required value={f.last} onChange={set("last")} />
            </div>
            <Input label="Work email" required type="email" iconLeft={<Mail size={17} />} placeholder="you@organisation.org" value={f.email} onChange={set("email")} />
            <Select label="Observer category" required placeholder="Select a category" value={f.category} onChange={set("category")}
              options={["Domestic civil-society monitor", "Political party agent", "International observer mission", "Media / press"]} />
            <Input label="Accredited organisation" required iconLeft={<Building size={17} />} placeholder="e.g. Transparency International Rwanda" value={f.org} onChange={set("org")} />
            <Input label="NEC accreditation number" required mono iconLeft={<BadgeCheck size={17} />} placeholder="ACC-2026-XXXXX" value={f.acc} onChange={set("acc")} hint="Found on your accreditation letter from the NEC" />
            <Input label="Create password" required type="password" iconLeft={<KeyRound size={17} />} hint="At least 12 characters, with a number and a symbol" value={f.password} onChange={set("password")} />

            <label className="auth__check" style={{ alignItems: "flex-start", lineHeight: 1.45 }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 2 }} />
              <span>I confirm the details above are accurate and I agree to the <a className="auth__link" href="#" onClick={(e) => e.preventDefault()}>Observer Code of Conduct</a> and data-protection terms (Law 058/2021).</span>
            </label>
          </div>

          <div className="auth__cta">
            <Button variant="primary" size="lg" fullWidth disabled={!agree} iconRight={<ArrowRight size={18} />} onClick={submit}>Submit for accreditation</Button>
          </div>
          <div className="auth__alt">Already have an account? <Link to="/portal/observer-login">Sign in</Link></div>
        </div>
      </section>
    </div>
  );
}
