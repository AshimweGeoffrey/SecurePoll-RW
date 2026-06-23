import { Link } from "react-router-dom";
import { Monitor, UserPlus, ShieldCheck, Globe, ArrowRight } from "lucide-react";
import { Brand } from "../components/index.js";

const SURFACES = [
  {
    to: "/admin",
    icon: <ShieldCheck size={26} />,
    eyebrow: "Console",
    title: "Admin & Audit",
    desc: "Registry, verification log, fraud, audit chain, IAM, encryption keys and analytics. NEC staff sign-in with 2FA.",
    accent: "var(--status-approved)",
  },
  {
    to: "/kiosk",
    icon: <Monitor size={26} />,
    eyebrow: "Polling station",
    title: "Verification kiosk",
    desc: "Election-day 1:1 face verification and double-vote-protected ballot issue. Dark, high-contrast kiosk theme.",
    accent: "var(--status-info)",
  },
  {
    to: "/register",
    icon: <UserPlus size={26} />,
    eyebrow: "Field",
    title: "Voter registration",
    desc: "Offline-first enrolment wizard — capture details, face biometric, run the 1:N dedup scan and issue a token.",
    accent: "var(--status-review)",
  },
  {
    to: "/portal",
    icon: <Globe size={26} />,
    eyebrow: "Public",
    title: "Citizen & observer portal",
    desc: "Check registration status, report an incident, and the accredited-observer dashboard (aggregated, read-only).",
    accent: "var(--secondary)",
  },
];

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-canvas)" }}>
      <div style={{ background: "radial-gradient(120% 100% at 50% -10%, var(--primary-soft), transparent 60%)" }}>
        <header style={{ maxWidth: 1080, margin: "0 auto", padding: "var(--space-5) var(--space-6)" }}>
          <Brand subtitle="National Electoral Commission of Rwanda" to="/" />
        </header>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "var(--space-12) var(--space-6) var(--space-8)" }}>
          <div className="t-eyebrow" style={{ color: "var(--primary-text)" }}>Biometric voter verification</div>
          <h1 style={{ fontSize: "var(--text-4xl)", marginTop: 8, maxWidth: 720 }}>
            Election-grade identity assurance for every polling station in Rwanda.
          </h1>
          <p style={{ marginTop: 12, maxWidth: 620, fontSize: "var(--text-lg)", color: "var(--text-muted)" }}>
            Four operational surfaces, one verified record of truth. Choose a surface to continue.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 var(--space-6) var(--space-16)" }}>
        <div className="sp-grid sp-grid-2">
          {SURFACES.map((s) => (
            <Link key={s.to} to={s.to} style={{ textDecoration: "none" }}>
              <div className="sp-card sp-card--raised sp-card--interactive" style={{ height: "100%" }}>
                <div style={{ height: 3, background: s.accent }} />
                <div style={{ padding: "var(--space-6)" }}>
                  <div className="sp-row-between" style={{ alignItems: "flex-start" }}>
                    <span style={{ width: 52, height: 52, borderRadius: "var(--radius-lg)", display: "grid", placeItems: "center", background: "var(--bg-subtle)", color: s.accent }}>
                      {s.icon}
                    </span>
                    <ArrowRight size={20} color="var(--text-subtle)" />
                  </div>
                  <div className="t-eyebrow" style={{ marginTop: "var(--space-4)" }}>{s.eyebrow}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--text-strong)", marginTop: 4 }}>{s.title}</div>
                  <p className="t-sm t-muted" style={{ marginTop: 8, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="t-xs t-muted" style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
          SecurePoll RW · Final Year Project · Ashimwe Geoffrey · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
}
