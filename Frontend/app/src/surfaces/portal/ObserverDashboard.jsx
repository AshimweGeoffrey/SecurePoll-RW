import { useMemo } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import {
  Eye, Users, BadgeCheck, RadioTower, ShieldCheck, TrendingUp, Activity, Check, Lock, Download, LogOut,
  GitCommitHorizontal, FileCheck2,
} from "lucide-react";
import { analytics, audit } from "../../api/endpoints.js";
import { usePoll, useApi } from "../../lib/useApi.js";
import { useLookups } from "../../lib/useLookups.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { listItems } from "../../lib/list.js";
import { fmtInt, fmtPct, fmtTime, prettyStatus, initials } from "../../lib/format.js";
import { Badge, Button, Loading, ErrorState } from "../../components/index.js";
import wordmark from "../../assets/logo-wordmark.svg";

const ACTION_ICON = { default: GitCommitHorizontal, VOTER_VOTED: BadgeCheck, VOTER_VERIFIED: BadgeCheck, KEY_ROTATED: Lock, HSM_HEALTHCHECK: ShieldCheck, DATA_EXPORTED: FileCheck2, STATUS_SYNCED: RadioTower };

export default function ObserverDashboard() {
  const { isAuthed, booting, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const lookups = useLookups();
  const live = usePoll(() => analytics.live(), isAuthed ? 30000 : 0, [isAuthed], { skip: !isAuthed });
  const verif = usePoll(() => analytics.verification(), isAuthed ? 30000 : 0, [isAuthed], { skip: !isAuthed });
  const trail = useApi(() => audit.entries({ limit: 6 }), [isAuthed], { skip: !isAuthed });
  const chain = useApi(() => audit.verifyChain(), [isAuthed], { skip: !isAuthed });

  // District-level turnout aggregated from the per-station live feed via the lookup maps.
  const districts = useMemo(() => {
    const t = live.data?.turnout || live.data || {};
    const acc = {};
    (t.by_station || []).forEach((s) => {
      const d = lookups.byStation[s.station_id]?.district_id;
      const name = lookups.byDistrict[d]?.name;
      if (!name) return;
      acc[name] = acc[name] || { registered: 0, voted: 0 };
      acc[name].registered += s.registered || 0;
      acc[name].voted += s.voted || 0;
    });
    return Object.entries(acc)
      .map(([n, v]) => ({ n, v: v.registered ? Math.round((v.voted / v.registered) * 1000) / 10 : 0 }))
      .sort((a, b) => b.v - a.v).slice(0, 8);
  }, [live.data, lookups]);

  // Station status counts from the stations lookup.
  const stationStatus = useMemo(() => {
    const c = { online: 0, syncing: 0, other: 0, total: lookups.stations.length };
    lookups.stations.forEach((s) => {
      if (s.status === "online") c.online++;
      else if (s.status === "syncing") c.syncing++;
      else c.other++;
    });
    c.onlinePct = c.total ? Math.round((c.online / c.total) * 1000) / 10 : 0;
    return c;
  }, [lookups.stations]);

  if (booting) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><Loading label="Restoring session…" /></div>;
  if (!isAuthed) return <Navigate to="/portal/observer-login" replace />;

  const t = live.data?.turnout || live.data || {};
  const v = verif.data || {};
  const stationsReporting = (t.by_station || []).length;
  const verifTotal = v.total_attempts || 0;
  const pct = (n) => (verifTotal ? Math.round((n / verifTotal) * 1000) / 10 : 0);
  const trailRows = listItems(trail.data);

  const doLogout = async () => { await logout(); navigate("/portal/observer-login", { replace: true }); };

  return (
    <div className="obs">
      <header className="obs__top">
        <Link to="/portal"><img src={wordmark} alt="SecurePoll RW" /></Link>
        <span className="obs__ro"><Eye size={13} /> Observer · read-only</span>
        <div className="end">
          <span className="obs__live"><span className="pulse" /> Live · updated {fmtTime(new Date().toISOString())}</span>
          <div className="obs__idw">
            <span className="obs__av">{initials(user?.full_name)}</span>
            <div><div className="obs__nm">{user?.full_name}</div><div className="obs__org">{role?.name || "Observer"} · {user?.district_scope || "National"}</div></div>
          </div>
          <Button size="sm" variant="ghost" iconLeft={<LogOut size={15} />} onClick={doLogout}>Sign out</Button>
        </div>
      </header>

      <div className="obs__hd">
        <h1>Election transparency dashboard</h1>
        <p>A read-only, aggregated view of the live election. Every figure is anonymized and traceable to the public, tamper-evident audit chain. No individual voter records are accessible.</p>
      </div>

      {live.loading && !live.data ? <div style={{ padding: 36 }}><Loading label="Loading aggregated statistics…" /></div>
        : live.error ? <div style={{ padding: 36 }}><ErrorState error={live.error} onRetry={live.reload} /></div>
        : (
        <div className="obs__body">
          <div className="obs-kpis">
            <div className="obs-kpi"><div className="obs-kpi__l"><Users size={15} /> National turnout</div><div className="obs-kpi__v">{t.turnout_rate != null ? Number(t.turnout_rate).toFixed(1) : "—"}<small>%</small></div><div className="obs-kpi__d"><TrendingUp size={13} /> {fmtInt(t.total_voted)} ballots cast</div></div>
            <div className="obs-kpi"><div className="obs-kpi__l"><BadgeCheck size={15} /> Verified today</div><div className="obs-kpi__v">{fmtInt(t.total_verified)}</div><div className="obs-kpi__d"><Activity size={13} /> {fmtInt(verifTotal)} attempts</div></div>
            <div className="obs-kpi"><div className="obs-kpi__l"><RadioTower size={15} /> Stations reporting</div><div className="obs-kpi__v">{fmtInt(stationsReporting)}<small>/ {fmtInt(stationStatus.total)}</small></div><div className="obs-kpi__d"><Check size={13} /> {stationStatus.onlinePct}% online</div></div>
            <div className="obs-kpi"><div className="obs-kpi__l"><ShieldCheck size={15} /> Chain integrity</div><div className="obs-kpi__v">{chain.data ? chain.data.breaks_found : (chain.error ? "—" : "…")}<small>breaks</small></div><div className="obs-kpi__d"><Lock size={13} /> {chain.data ? `${fmtInt(chain.data.entries_walked)} entries verified` : "audit-restricted"}</div></div>
          </div>

          <div className="obs-grid">
            <div className="obs-panel">
              <div className="obs-panel__h">
                <div><div className="obs-panel__t">Turnout by district</div><div className="obs-panel__s">Top reporting districts · aggregated, anonymized</div></div>
                <Badge tone="green" size="sm" dot>LIVE</Badge>
              </div>
              <div className="obs-panel__b">
                <div className="obs-dist">
                  {districts.length === 0 && <div className="t-sm t-muted">Awaiting district data…</div>}
                  {districts.map((d) => (
                    <div className="obs-dist__row" key={d.n}>
                      <span className="obs-dist__n">{d.n}</span>
                      <span className="obs-dist__track"><span className="obs-dist__fill" style={{ width: d.v + "%" }} /></span>
                      <span className="obs-dist__v">{d.v}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="obs-panel">
              <div className="obs-panel__h"><div><div className="obs-panel__t">Station status</div><div className="obs-panel__s">All {fmtInt(stationStatus.total)} polling stations</div></div></div>
              <div className="obs-panel__b">
                <div className="obs-stat">
                  <div className="obs-donut" style={{ background: `conic-gradient(var(--green-500) 0 ${stationStatus.onlinePct}%, var(--amber-400) ${stationStatus.onlinePct}% ${stationStatus.onlinePct + (stationStatus.syncing / (stationStatus.total || 1)) * 100}%, var(--slate-300) 0 100%)` }}>
                    <div className="obs-donut__c"><div className="obs-donut__n">{stationStatus.onlinePct}%</div><div className="obs-donut__l">online</div></div>
                  </div>
                  <div className="obs-legend">
                    <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--green-500)" }} />Online &amp; reporting <b>{fmtInt(stationStatus.online)}</b></div>
                    <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--amber-400)" }} />Syncing <b>{fmtInt(stationStatus.syncing)}</b></div>
                    <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--slate-300)" }} />Not yet open <b>{fmtInt(stationStatus.other)}</b></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="obs-grid">
            <div className="obs-panel">
              <div className="obs-panel__h">
                <div><div className="obs-panel__t">Public audit trail</div><div className="obs-panel__s">Aggregated events · hash-chained &amp; independently verifiable</div></div>
                <Button size="sm" variant="secondary" iconLeft={<Download size={14} />} onClick={() => audit.exportCsv("csv").catch(() => {})}>Export</Button>
              </div>
              <div className="obs-panel__b">
                <div className="obs-trail">
                  {trail.error && <div className="t-sm t-muted">The detailed audit trail is restricted to accredited auditors.</div>}
                  {!trail.error && trailRows.length === 0 && <div className="t-sm t-muted">No recent events.</div>}
                  {trailRows.map((e) => {
                    const Ic = ACTION_ICON[e.action] || ACTION_ICON.default;
                    return (
                      <div className="obs-trail__row" key={e.id}>
                        <span className="obs-trail__ic"><Ic size={16} /></span>
                        <div className="obs-trail__tx"><div className="obs-trail__a">{prettyStatus(e.action)}</div><div className="obs-trail__m">{e.detail || e.service || "—"}</div></div>
                        <span className="obs-trail__h">{(e.entry_hash || "").slice(0, 6)}…</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="obs-panel">
              <div className="obs-panel__h"><div><div className="obs-panel__t">Authentication outcomes</div><div className="obs-panel__s">All verifications today</div></div></div>
              <div className="obs-panel__b" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="obs-legend">
                  <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--green-500)" }} />Auto-approved <b>{pct(v.approved)}%</b></div>
                  <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--amber-400)" }} />Manual review <b>{pct(v.manual_review)}%</b></div>
                  <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--red-500)" }} />Rejected <b>{pct(v.rejected)}%</b></div>
                </div>
                <div className="obs-verify">
                  <ShieldCheck size={19} />
                  <div>
                    <div className="t">{chain.data ? `Integrity verified at ${fmtTime(chain.data.verified_at)}` : "Hash chain sealed"}</div>
                    <div className="s">{chain.data ? `SHA-256 hash chain re-walked end to end · ${fmtInt(chain.data.entries_walked)} entries · ${chain.data.breaks_found} breaks detected.` : "Every aggregation is committed to the tamper-evident SHA-256 audit chain."}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="obs-pageft">Observer access is read-only and logged to the audit chain. Figures are aggregated and anonymized under Law 058/2021. Accredited under the NEC Observer Framework.</div>
        </div>
      )}
    </div>
  );
}
