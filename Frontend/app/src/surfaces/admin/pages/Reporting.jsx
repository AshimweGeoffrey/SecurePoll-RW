import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Download, RefreshCw } from "lucide-react";
import { analytics, voters as votersApi, audit } from "../../../api/endpoints.js";
import { useApi } from "../../../lib/useApi.js";
import { useToast } from "../../../lib/toast.jsx";
import { fmtInt, fmtPct, fmtScore } from "../../../lib/format.js";
import { StatCard, Loading, ErrorState, Button, Badge } from "../../../components/index.js";
import PageHead from "./PageHead.jsx";

const GREEN = "#357551", AMBER = "#c0982f", RED = "#b3443b", BLUE = "#386f8d", PINK = "#9d5d7a";

function Panel({ title, sub, children, action }) {
  return (
    <div className="section">
      <div className="section__hd"><div><h3>{title}</h3>{sub && <div className="t-xs t-muted" style={{ marginTop: 2 }}>{sub}</div>}</div>{action}</div>
      <div className="section__bd">{children}</div>
    </div>
  );
}

export default function Reporting() {
  const toast = useToast();
  const turnout = useApi(() => analytics.turnout(), []);
  const demo = useApi(() => analytics.demographics(), []);
  const verif = useApi(() => analytics.verification(), []);
  const enroll = useApi(() => analytics.enrollment(), []);

  const t = turnout.data || {};
  const d = demo.data || {};
  const v = verif.data || {};
  const e = enroll.data || {};

  const sexData = d.by_sex ? [
    { name: "Male", value: d.by_sex.male || 0, color: BLUE },
    { name: "Female", value: d.by_sex.female || 0, color: PINK },
  ] : [];

  const districtEnroll = (e.by_district || []).filter((x) => x.registered > 0).slice(0, 14)
    .map((x) => ({ name: x.district, rate: x.rate, registered: x.registered, enrolled: x.enrolled }));

  const stationTurnout = (t.by_station || []).slice().sort((a, b) => b.turnout_pct - a.turnout_pct).slice(0, 12)
    .map((s) => ({ name: s.station_name?.replace(/ Station/, " St"), turnout: s.turnout_pct }));

  const verifData = [
    { name: "Approved", value: v.approved || 0, color: GREEN },
    { name: "Manual review", value: v.manual_review || 0, color: AMBER },
    { name: "Rejected", value: v.rejected || 0, color: RED },
  ];

  if (turnout.loading && !turnout.data) return <Loading label="Compiling reports…" />;
  if (turnout.error) return <ErrorState error={turnout.error} onRetry={turnout.reload} />;

  const exportVoters = async () => { try { await votersApi.exportCsv("csv"); toast.success("Voter roll exported"); } catch (err) { toast.error(err); } };
  const exportAudit = async () => { try { await audit.exportCsv("csv"); toast.success("Audit log exported"); } catch (err) { toast.error(err); } };

  return (
    <>
      <PageHead title="Reporting" sub="Turnout · demographics · verification · enrolment">
        <Button size="sm" variant="secondary" iconLeft={<Download size={15} />} onClick={exportVoters}>Voter roll CSV</Button>
        <Button size="sm" variant="secondary" iconLeft={<Download size={15} />} onClick={exportAudit}>Audit CSV</Button>
      </PageHead>

      <div className="sp-grid sp-grid-4" style={{ marginBottom: "var(--space-5)" }}>
        <StatCard label="National turnout" value={fmtPct(t.turnout_rate)} accent="approved" sub={`${fmtInt(t.total_voted)} of ${fmtInt(t.total_registered)}`} />
        <StatCard label="Verified" value={fmtInt(t.total_verified)} accent="info" />
        <StatCard label="Enrolment rate" value={fmtPct(e.enrollment_rate)} sub={`${fmtInt(e.enrolled)} of ${fmtInt(e.total_voters)}`} />
        <StatCard label="Approval rate" value={fmtPct(v.approval_rate)} sub={`avg conf ${fmtScore(v.average_confidence)}`} />
      </div>

      <div className="sp-grid sp-grid-2" style={{ marginBottom: "var(--space-5)", alignItems: "start" }}>
        <Panel title="Gender split" sub={`${fmtInt((d.by_sex?.male || 0) + (d.by_sex?.female || 0))} registered`}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={sexData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={86} paddingAngle={2}>
                {sexData.map((x, i) => <Cell key={i} fill={x.color} />)}
              </Pie>
              <Tooltip formatter={(val) => fmtInt(val)} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Verification outcomes" sub={`${fmtInt(v.total_attempts)} attempts`}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={verifData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={86} paddingAngle={2}>
                {verifData.map((x, i) => <Cell key={i} fill={x.color} />)}
              </Pie>
              <Tooltip formatter={(val) => fmtInt(val)} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="sp-grid sp-grid-2" style={{ alignItems: "start" }}>
        <Panel title="Enrolment by district" sub="Biometric enrolment completion">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={districtEnroll} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--text-muted)" interval={0} angle={-35} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--text-muted)" unit="%" domain={[0, 100]} />
              <Tooltip formatter={(val, n) => (n === "rate" ? `${val}%` : val)} />
              <Bar dataKey="rate" fill={GREEN} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Turnout by station" sub="Top 12 stations">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stationTurnout} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <Tooltip formatter={(val) => `${val}%`} />
              <Bar dataKey="turnout" fill={BLUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </>
  );
}
