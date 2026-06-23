import { useMemo } from "react";
import { Users, BadgeCheck, ShieldAlert, RadioTower, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { analytics, audit } from "../../../api/endpoints.js";
import { usePoll, useApi } from "../../../lib/useApi.js";
import { useLookups } from "../../../lib/useLookups.js";
import { listItems } from "../../../lib/list.js";
import { fmtInt, fmtPct, fmtScore, fmtTime, prettyStatus } from "../../../lib/format.js";
import { Button, Badge, StatusBadge, ErrorState, Skeleton } from "../../../components/index.js";
import PageHead from "./PageHead.jsx";
import "../admin-design.css";

function Kpi({ label, icon, tint, value, unit, delta, dir }) {
  return (
    <div className="kpi">
      <div className="kpi__top">
        <span className="kpi__lbl">{label}</span>
        <span className="kpi__ic" style={{ background: tint.bg, color: tint.fg }}>{icon}</span>
      </div>
      <div className="kpi__val">{value}{unit && <small> {unit}</small>}</div>
      {delta && <span className={"kpi__delta " + (dir || "up")}>{dir === "down" ? <TrendingDown size={13} /> : <TrendingUp size={13} />}{delta}</span>}
    </div>
  );
}

function DsCard({ title, subtitle, headerEnd, children, flush }) {
  return (
    <div className="dscard">
      <div className="dscard__hd">
        <div><div className="dscard__t">{title}</div>{subtitle && <div className="dscard__sub">{subtitle}</div>}</div>
        {headerEnd && <div className="dscard__hd-end">{headerEnd}</div>}
      </div>
      <div className={"dscard__body" + (flush ? " dscard__body--flush" : "")}>{children}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="kpis">
        {[0, 1, 2, 3].map((i) => (
          <div className="kpi" key={i}>
            <div className="kpi__top"><Skeleton w="90px" h={12} /><Skeleton w={30} h={30} r={8} /></div>
            <div style={{ margin: "12px 0 8px" }}><Skeleton w="70%" h={30} /></div>
            <Skeleton w="50%" h={12} />
          </div>
        ))}
      </div>
      <div className="cols">
        <div className="dscard"><div className="dscard__hd"><Skeleton w="40%" h={18} /></div><div className="dscard__body"><Skeleton h={200} r={8} /></div></div>
        <div className="dscard"><div className="dscard__hd"><Skeleton w="50%" h={18} /></div><div className="dscard__body"><Skeleton h={140} r={8} /></div></div>
      </div>
    </>
  );
}

// Map an audit action to a verification-style outcome status (matches the mock:
// APPROVED / MANUAL REVIEW / REJECTED / INFO).
const STATUS_MAP = {
  VOTER_VERIFIED: ["APPROVED", "green"], VOTER_VOTED: ["APPROVED", "green"], BIOMETRIC_LINKED: ["APPROVED", "green"],
  BIOMETRIC_RE_ENROLLED: ["APPROVED", "green"], RECORD_CREATED: ["APPROVED", "green"], KEY_ROTATED: ["APPROVED", "green"],
  HSM_HEALTHCHECK: ["APPROVED", "green"], ANOMALY_RESOLVED: ["APPROVED", "green"],
  VOTER_FLAGGED: ["REVIEW", "amber"], PERMISSION_CHANGED: ["REVIEW", "amber"], RECORD_MERGED: ["REVIEW", "amber"],
  DATA_EXPORTED: ["REVIEW", "amber"], THRESHOLD_UPDATED: ["REVIEW", "amber"],
  RECORD_BLOCKED: ["REJECTED", "red"], RECORD_ARCHIVED: ["REJECTED", "red"], RECORD_DELETED: ["REJECTED", "red"],
  USER_DELETED: ["REJECTED", "red"], CASE_CREATED: ["REJECTED", "red"], ANOMALY_CREATED: ["REJECTED", "red"],
};
const auditStatus = (action) => STATUS_MAP[action] || ["INFO", "blue"];

export default function Dashboard() {
  const lookups = useLookups();
  const live = usePoll(() => analytics.live(), 30000, []);
  const verif = usePoll(() => analytics.verification(), 30000, []);
  const fraud = usePoll(() => analytics.fraud(), 30000, []);
  const activity = useApi(() => audit.entries({ limit: 6 }), []);

  const t = live.data?.turnout || live.data || {};
  const v = verif.data || {};
  const f = fraud.data || {};

  // Stations online (real) from the stations lookup.
  const stations = useMemo(() => {
    const c = { online: 0, syncing: 0, total: lookups.stations.length };
    lookups.stations.forEach((s) => { if (s.status === "online") c.online++; else if (s.status === "syncing") c.syncing++; });
    return c;
  }, [lookups.stations]);

  // Top stations by turnout → bar chart (real; the backend has no hourly series).
  const bars = useMemo(() => {
    const list = (t.by_station || []).slice().sort((a, b) => b.turnout_pct - a.turnout_pct).slice(0, 7);
    return list.map((s) => ({ label: (s.station_name || "").replace(/ Station/, "").split(" ").slice(-2).join(" "), v: Math.round(s.turnout_pct) }));
  }, [t]);

  // Auth-outcomes donut (real).
  const total = v.total_attempts || 0;
  const aPct = total ? (v.approved / total) * 100 : 0;
  const rEnd = total ? ((v.approved + v.manual_review) / total) * 100 : 0;
  const donutBg = `conic-gradient(var(--green-500) 0 ${aPct}%, var(--amber-400) ${aPct}% ${rEnd}%, var(--red-500) ${rEnd}% 100%)`;

  const rows = listItems(activity.data);

  if (live.loading && !live.data) {
    return (<><PageHead title="Dashboard" sub="Real-time national overview" /><DashboardSkeleton /></>);
  }
  if (live.error) return (<><PageHead title="Dashboard" sub="Real-time national overview" /><ErrorState error={live.error} onRetry={live.reload} /></>);

  return (
    <>
      <PageHead title="Dashboard" sub="Real-time national overview · 30s refresh">
        <Badge tone="green" variant="soft" dot>Live</Badge>
        <Button size="sm" variant="secondary" iconLeft={<RefreshCw size={15} />} onClick={() => { live.reload(); verif.reload(); fraud.reload(); activity.reload(); }}>Refresh</Button>
      </PageHead>

      <div className="kpis">
        <Kpi label="National turnout" icon={<Users size={16} />} tint={{ bg: "var(--primary-soft)", fg: "var(--primary-text)" }}
          value={t.turnout_rate != null ? Number(t.turnout_rate).toFixed(1) : "—"} unit="%" delta={`${fmtInt(t.total_voted)} ballots cast`} dir="up" />
        <Kpi label="Verified today" icon={<BadgeCheck size={16} />} tint={{ bg: "var(--secondary-soft)", fg: "var(--secondary-text)" }}
          value={fmtInt(t.total_verified)} delta={`${fmtInt(v.total_attempts)} attempts`} dir="up" />
        <Kpi label="Fraud alerts" icon={<ShieldAlert size={16} />} tint={{ bg: "var(--status-review-soft)", fg: "var(--status-review-text)" }}
          value={fmtInt(f.open_cases)} delta={`${fmtInt(f.by_risk_level?.critical || 0)} critical`} dir="down" />
        <Kpi label="Stations online" icon={<RadioTower size={16} />} tint={{ bg: "var(--status-approved-soft)", fg: "var(--status-approved-text)" }}
          value={fmtInt(stations.online)} unit={`/ ${fmtInt(stations.total)}`} delta={`${fmtInt(stations.syncing)} syncing`} dir="up" />
      </div>

      <div className="cols">
        <DsCard title="Turnout by station" subtitle="Top reporting stations · live, 30s refresh" headerEnd={<Badge tone="green" dot>Live</Badge>}>
          {bars.length === 0 ? <div className="sp-empty t-sm">Awaiting station data…</div> : (
            <div className="bars">
              {bars.map((b, i) => (
                <div className="bar-col" key={i}>
                  <span className="bv">{b.v}%</span>
                  <div className="bar" style={{ height: Math.max(b.v * 1.7, 4) + "px" }} />
                  <span className="bl">{b.label}</span>
                </div>
              ))}
            </div>
          )}
        </DsCard>

        <DsCard title="Authentication outcomes" subtitle={`All verifications today · avg conf ${fmtScore(v.average_confidence)}`}>
          <div className="donut-wrap">
            <div className="donut" style={{ background: donutBg }}>
              <div className="donut__c"><div className="n">{fmtPct(v.approval_rate, 0)}</div><div className="l">auto-approved</div></div>
            </div>
            <div className="legend-list">
              <div className="li"><span className="k" style={{ background: "var(--green-500)" }} />Approved <b>{fmtInt(v.approved)}</b></div>
              <div className="li"><span className="k" style={{ background: "var(--amber-400)" }} />Manual review <b>{fmtInt(v.manual_review)}</b></div>
              <div className="li"><span className="k" style={{ background: "var(--red-500)" }} />Rejected <b>{fmtInt(v.rejected)}</b></div>
            </div>
          </div>
        </DsCard>
      </div>

      <div style={{ height: 16 }} />

      <DsCard title="Recent activity" subtitle="Across all services" flush>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Time</th><th>Service</th><th>Event</th><th>Actor</th><th>Status</th></tr></thead>
            <tbody>
              {activity.loading && !activity.data && [0, 1, 2, 3].map((i) => (
                <tr key={i}><td colSpan={5}><Skeleton h={14} /></td></tr>
              ))}
              {rows.map((e) => {
                const [label, tone] = auditStatus(e.action);
                return (
                  <tr key={e.id}>
                    <td className="mono">{fmtTime(e.occurred_at)}</td>
                    <td>{e.service || "—"}</td>
                    <td>{prettyStatus(e.action)}</td>
                    <td className="t-sm">{e.actor_role || e.actor_type || "—"}</td>
                    <td><Badge tone={tone} size="sm" dot>{label}</Badge></td>
                  </tr>
                );
              })}
              {!activity.loading && rows.length === 0 && <tr><td colSpan={5} className="t-muted t-sm" style={{ textAlign: "center", padding: 20 }}>No recent activity.</td></tr>}
            </tbody>
          </table>
        </div>
      </DsCard>
    </>
  );
}
