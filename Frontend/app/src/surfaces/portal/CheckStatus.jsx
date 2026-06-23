import { useState } from "react";
import { Link } from "react-router-dom";
import { IdCard, Lock, Search, Check, UserRound, Flag, Megaphone, RotateCcw } from "lucide-react";
import { voters as votersApi } from "../../api/endpoints.js";
import { useLookups } from "../../lib/useLookups.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { fmtDay } from "../../lib/format.js";
import { Input, Button, Card, Badge } from "../../components/index.js";
import { SubNav } from "./chrome.jsx";

export default function CheckStatus() {
  const { isAuthed } = useAuth();
  const lookups = useLookups();
  const [token, setToken] = useState("");
  const [voter, setVoter] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const check = async () => {
    if (!token.trim()) return;
    setBusy(true); setErr(""); setVoter(null);
    try { setVoter(await votersApi.byToken(token.trim())); }
    catch (e) {
      setErr(e.status === 404 ? "No record found for that token. Check the value on your voter card."
        : e.status === 401 ? "This lookup is performed by staff at registration centres. Sign in to continue."
        : e.message);
    } finally { setBusy(false); }
  };

  const reset = () => { setVoter(null); setToken(""); setErr(""); };
  const station = voter && lookups.byStation[voter.polling_station_id];
  const district = voter && lookups.byDistrict[voter.district_id];
  const voted = voter?.status === "voted";

  const steps = voter ? [
    { state: "done", icon: <Check size={15} />, t: "Registration confirmed", s: `On the certified voter roll${district ? ` for ${district.name}` : ""}` },
    { state: "done", icon: <Check size={15} />, t: "Station assigned", s: station ? `${station.code} · ${station.name}` : "Polling station assigned" },
    { state: voted ? "done" : "current", icon: <UserRound size={15} />, t: voted ? "Identity verified" : "Awaiting your vote", s: voted ? "Biometric verification completed at the station" : "Bring your voter card. Verification takes seconds." },
    { state: voted ? "current" : "", icon: <Flag size={15} />, t: "Vote recorded", s: voted ? "Your ballot has been cast and counted" : "Your ballot status will appear here once cast" },
  ] : [];

  return (
    <div className="page">
      <SubNav />
      <header className="phead">
        <span className="eyebrow"><IdCard size={14} /> Voter services</span>
        <h1>Check your registration status</h1>
        <p>Enter your voter token to confirm you are registered, find your assigned polling station, and see whether your vote has been recorded.</p>
      </header>

      <main className="pbody">
        <div className="narrow">
          <div className="assure blue">
            <Lock size={20} />
            <div>
              <div className="at">This lookup is private</div>
              <div className="as">We never display your biometric data or how you voted — only your registration and turnout status. Sessions are not logged against your identity.</div>
            </div>
          </div>

          <div className="lk-card">
            <div className="f">
              <Input label="Voter token" size="lg" mono iconLeft={<IdCard size={18} />} placeholder="RW-2026-XXXX-XXXX"
                value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && check()} />
            </div>
            <Button variant="primary" size="lg" iconLeft={<Search size={18} />} loading={busy} onClick={check}>Check</Button>
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 8 }}>
            {isAuthed ? "As printed on your voter card." : "Staff-assisted — sign in to look up a voter."}
          </div>
          {err && <div className="t-sm" style={{ color: "var(--status-rejected-text)", marginTop: 14 }}>{err}</div>}

          {voter && (
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 18 }}>
              <Card accent="green" elevation="raised" title="You're registered to vote" subtitle={`Token ${voter.voter_token}`}
                headerEnd={<Badge tone="green" dot>REGISTERED</Badge>}>
                <div className="detail-grid">
                  <div className="detail-row"><span className="k">Polling station</span><span className="v">{station ? `${station.code} · ${station.name}` : "—"}</span></div>
                  <div className="detail-row"><span className="k">District</span><span className="v">{district?.name || "—"}</span></div>
                  <div className="detail-row"><span className="k">Province</span><span className="v">{district?.province || "—"}</span></div>
                  <div className="detail-row"><span className="k">Station hours</span><span className="v">{station?.opens_at?.slice(0, 5) || "06:00"} – {station?.closes_at?.slice(0, 5) || "18:00"}</span></div>
                  <div className="detail-row"><span className="k">Roll position</span><span className="v mono">{voter.roll_position ?? "—"}</span></div>
                  <div className="detail-row"><span className="k">Last verified</span><span className="v">{voter.last_verified_at ? fmtDay(voter.last_verified_at) : "—"}</span></div>
                </div>
              </Card>

              <Card title="Voting status" subtitle="Live for today's election"
                headerEnd={<Badge tone={voted ? "green" : "amber"} dot>{voted ? "VOTED" : "NOT YET VOTED"}</Badge>}>
                <div className="tl">
                  {steps.map((st, i) => (
                    <div key={i} className={"tl-step" + (st.state ? " " + st.state : "")}>
                      <div className="tl-dot">{st.icon}</div>
                      <div className="tl-bd"><div className="tt">{st.t}</div><div className="ts">{st.s}</div></div>
                    </div>
                  ))}
                </div>
              </Card>

              <div style={{ display: "flex", gap: 12 }}>
                <Link to="/portal/incident" className="plain" style={{ flex: 1, textDecoration: "none" }}>
                  <Button variant="secondary" fullWidth iconLeft={<Megaphone size={16} />}>Report a problem at this station</Button>
                </Link>
                <Button variant="ghost" iconLeft={<RotateCcw size={16} />} onClick={reset}>Check another</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
