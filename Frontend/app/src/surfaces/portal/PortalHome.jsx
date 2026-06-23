import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, IdCard, Search, TrendingUp, Check, RadioTower, Clock, MapPin, Megaphone, ArrowRight } from "lucide-react";
import { voters as votersApi, analytics } from "../../api/endpoints.js";
import { usePoll } from "../../lib/useApi.js";
import { useLookups } from "../../lib/useLookups.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { fmtInt, fmtPct, fmtTime } from "../../lib/format.js";
import { Input, Button, Card, Badge } from "../../components/index.js";
import { PortalNav } from "./chrome.jsx";
import wordmarkDark from "../../assets/logo-wordmark-dark.svg";

function StatusLookup() {
  const { isAuthed } = useAuth();
  const lookups = useLookups();
  const [token, setToken] = useState("");
  const [voter, setVoter] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const check = async () => {
    if (!token.trim()) return;
    setBusy(true); setErr(""); setVoter(null);
    try {
      setVoter(await votersApi.byToken(token.trim()));
    } catch (e) {
      setErr(e.status === 404 ? "No record found for that token."
        : e.status === 401 ? "Status lookups are staff-assisted — sign in to look up a voter."
        : e.message);
    } finally { setBusy(false); }
  };

  const station = voter && lookups.byStation[voter.polling_station_id];
  const district = voter && lookups.byDistrict[voter.district_id];
  const voted = voter?.status === "voted";

  return (
    <div>
      <div className="lookup">
        <div className="f">
          <Input label="Check your registration status" size="lg" mono iconLeft={<IdCard size={18} />}
            placeholder="RW-2026-XXXX-XXXX" value={token} onChange={(e) => setToken(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && check()} />
        </div>
        <Button variant="primary" size="lg" iconLeft={<Search size={18} />} loading={busy} onClick={check}>Check status</Button>
      </div>
      {!isAuthed && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 8 }}>Status lookups are performed by staff at registration centres.</div>}
      {err && <div className="lookup-result"><div className="t-sm" style={{ color: "var(--status-rejected-text)" }}>{err}</div></div>}
      {voter && (
        <div className="lookup-result">
          <Card accent="green" elevation="raised" title="You're registered to vote" subtitle={`Token ${voter.voter_token}`}
            headerEnd={<Badge tone="green" dot>REGISTERED</Badge>}>
            <div style={{ display: "flex", gap: 28, fontSize: 14, color: "var(--text-default)", flexWrap: "wrap" }}>
              <div><div style={{ color: "var(--text-muted)", fontSize: 12 }}>Polling station</div><b>{station ? `${station.code} · ${station.name}` : "—"}</b></div>
              <div><div style={{ color: "var(--text-muted)", fontSize: 12 }}>District</div><b>{district?.name || "—"}</b></div>
              <div><div style={{ color: "var(--text-muted)", fontSize: 12 }}>Status</div><b>{voted ? "Voted" : "Not yet voted"}</b></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function PublicPortal() {
  // Live turnout is auth-gated on the backend; the band only renders when real
  // aggregated data is actually available (no placeholder figures).
  const live = usePoll(() => analytics.live(), 30000, []);
  const t = live.data?.turnout || live.data || null;
  const stationsReporting = (t?.by_station || []).length;

  return (
    <div className="pub">
      <PortalNav />

      <header className="hero">
        <div className="hero__in">
          <span className="eyebrow"><ShieldCheck size={14} /> National Electoral Commission · Rwanda</span>
          <h1>A transparent, verifiable election — open to every citizen.</h1>
          <p>Check your registration, find your polling station, and follow turnout as it happens. All figures are aggregated and anonymized.</p>
          <StatusLookup />
        </div>
      </header>

      {t && (
        <section className="band-stats">
          <div className="sect-t">Live turnout</div>
          <div className="sect-s">Aggregated nationwide · updates every 30 seconds · no individual data shown</div>
          <div className="stat-grid">
            <div className="stat"><div className="sv">{fmtPct(t.turnout_rate)}</div><div className="sl">National turnout</div><div className="sd"><TrendingUp size={13} /> {fmtInt(t.total_voted)} ballots cast</div></div>
            <div className="stat"><div className="sv">{fmtInt(t.total_verified)}</div><div className="sl">Voters verified today</div><div className="sd"><Check size={13} /> across {fmtInt(stationsReporting)} stations</div></div>
            <div className="stat"><div className="sv">{fmtInt(stationsReporting)}</div><div className="sl">Stations reporting</div><div className="sd"><RadioTower size={13} /> live feed</div></div>
            <div className="stat"><div className="sv">{fmtTime(new Date().toISOString())}</div><div className="sl">Last updated</div><div className="sd"><Clock size={13} /> live feed</div></div>
          </div>
        </section>
      )}

      <section className="feat">
        <div className="feat-card">
          <div className="fi"><MapPin size={24} /></div>
          <h3>Find your polling station</h3>
          <p>Look up where to vote with your voter token. Stations open 06:00–18:00. Your assigned station and roll position appear instantly.</p>
          <div style={{ marginTop: 18 }}>
            <Link to="/portal/status" style={{ textDecoration: "none", display: "block" }}>
              <Button variant="secondary" fullWidth iconLeft={<Search size={16} />}>Check your registration</Button>
            </Link>
          </div>
        </div>
        <div className="feat-card">
          <div className="fi"><Megaphone size={24} /></div>
          <h3>Report an incident</h3>
          <p>Submit an anonymous report about any issue at a polling station — long queues, late openings, equipment failures or irregularities. Reports route directly to NEC monitoring.</p>
          <div style={{ marginTop: 18 }}>
            <Link to="/portal/incident" style={{ textDecoration: "none", display: "block" }}>
              <Button variant="secondary" fullWidth iconLeft={<Megaphone size={16} />}>Submit anonymous report</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="pub__foot">
        <div className="ft"><img src={wordmarkDark} alt="SecurePoll RW" /></div>
        <div className="fl">
          <Link to="/portal/status">Check status</Link>
          <Link to="/portal/incident">Report an incident</Link>
          <Link to="/portal/observer-login">Observer login</Link>
          <Link to="/login">Admin login</Link>
          <span>Data protection (Law 058/2021)</span>
        </div>
        <div className="fc">© {new Date().getFullYear()} National Electoral Commission of Rwanda. Public data is aggregated and anonymized. This portal has no access to individual voter records or biometric data.</div>
      </footer>
    </div>
  );
}
