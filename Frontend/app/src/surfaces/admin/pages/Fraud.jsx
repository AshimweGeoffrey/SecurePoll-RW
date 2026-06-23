import { useState } from "react";
import { ShieldAlert, RefreshCw, GitMerge, BellOff, Check, ChevronUp } from "lucide-react";
import { fraud, duplicates, anomalies, voters as votersApi, analytics } from "../../../api/endpoints.js";
import { useApi } from "../../../lib/useApi.js";
import { useToast } from "../../../lib/toast.jsx";
import { listItems, listTotal } from "../../../lib/list.js";
import { fmtDate, fmtScore, prettyStatus } from "../../../lib/format.js";
import {
  Button, Tabs, Pagination, Badge, StatusBadge, Loading, ErrorState, Empty, Modal, StatCard, ConfidenceMeter, Select,
} from "../../../components/index.js";
import PageHead from "./PageHead.jsx";

const PAGE_SIZE = 15;
const riskTone = (r) => (r === "critical" ? "red" : "amber");

/* ───────── Cases ───────── */
function CaseDetail({ id, onClose, onChanged }) {
  const toast = useToast();
  const { data: c, loading } = useApi(() => fraud.case(id), [id]);
  const [busy, setBusy] = useState(false);
  const act = async (which) => {
    setBusy(true);
    try {
      if (which === "dismiss") await fraud.dismissCase(id);
      if (which === "escalate") await fraud.escalateCase(id);
      toast.success(`Case ${which}ed`);
      onChanged();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  const resolved = c && (c.resolution || c.resolved_at);
  return (
    <Modal
      open onClose={onClose} size="lg"
      title={c ? c.title : "Fraud case"} subtitle={c ? <span className="t-mono">{c.id} · {c.type}</span> : ""}
      footer={c && !resolved && (
        <><Button variant="ghost" loading={busy} onClick={() => act("dismiss")}>Dismiss</Button>
          <Button variant="danger" iconLeft={<ChevronUp size={15} />} loading={busy} onClick={() => act("escalate")}>Escalate</Button></>
      )}
    >
      {loading || !c ? <Loading /> : (
        <div className="sp-stack sp-gap-4">
          <div className="sp-row sp-gap-2 sp-wrap">
            <Badge tone={riskTone(c.risk_level)} variant="solid" size="sm">{String(c.risk_level).toUpperCase()}</Badge>
            {c.verdict && <StatusBadge status={c.verdict} size="sm" />}
            {c.resolution && <Badge tone="neutral" size="sm">Resolved · {prettyStatus(c.resolution)}</Badge>}
          </div>
          {c.face_score != null && <ConfidenceMeter value={Number(c.face_score)} threshold={0.4} label="Primary metric" size="sm" />}
          {Array.isArray(c.breakdown) && c.breakdown.length > 0 && (
            <div className="section" style={{ boxShadow: "none" }}>
              <div className="section__bd">
                <div className="t-eyebrow" style={{ marginBottom: 8 }}>Evidence breakdown</div>
                {c.breakdown.map((b, i) => (
                  <div key={i} className="sp-row-between" style={{ padding: "6px 0", borderBottom: i < c.breakdown.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <span className="t-sm t-muted">{b.label}</span><span className="t-mono t-sm t-strong">{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {c.assessment && (c.assessment.explanation || c.assessment.detected_by) && (
            <div className="sp-decision__expl" style={{ display: "flex", gap: 10, background: "var(--bg-inset)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 12, fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
              <span>{c.assessment.explanation || `Detected by ${c.assessment.detected_by}`}</span>
            </div>
          )}
          <dl className="sp-kv">
            <dt>Detected by</dt><dd>{c.detected_by || "—"}</dd>
            <dt>Registration</dt><dd className="t-mono">{c.registration_ref || "—"}</dd>
            {c.duplicate_of_registration_ref && (<><dt>Duplicate of</dt><dd className="t-mono">{c.duplicate_of_registration_ref} · sim {fmtScore(c.similarity)}</dd></>)}
            <dt>Opened</dt><dd>{fmtDate(c.opened_at)}</dd>
            {c.resolved_at && (<><dt>Resolved</dt><dd>{fmtDate(c.resolved_at)}</dd></>)}
          </dl>
          {Array.isArray(c.timeline) && c.timeline.length > 0 && (
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 8 }}>Case history</div>
              {c.timeline.map((t, i) => (
                <div key={i} className="sp-row sp-gap-3" style={{ padding: "6px 0" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.state === "current" ? "var(--primary)" : "var(--border-strong)", marginTop: 6, flexShrink: 0 }} />
                  <div><div className="t-sm t-strong">{t.title || t.label}</div><div className="t-xs t-muted">{t.subtitle || ""} {t.time || t.at ? fmtDate(t.time || t.at) : ""}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function CasesTab() {
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState(null);
  const { data, error, loading, reload } = useApi(() => fraud.cases({ skip: page * PAGE_SIZE, limit: PAGE_SIZE }), [page]);
  const items = listItems(data), total = listTotal(data);
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!items.length) return <Empty title="No fraud cases" />;
  return (
    <>
      <div className="table-wrap">
        <table className="sp-table">
          <thead><tr><th>Case</th><th>Type</th><th>Risk</th><th>Detected by</th><th>Status</th><th>Opened</th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="sp-row-click" onClick={() => setSel(c.id)}>
                <td><div style={{ fontWeight: 600, color: "var(--text-strong)" }}>{c.title}</div><div className="t-xs t-mono t-muted">{c.id}</div></td>
                <td className="t-sm">{c.type}</td>
                <td><Badge tone={riskTone(c.risk_level)} size="sm">{String(c.risk_level).toUpperCase()}</Badge></td>
                <td className="t-xs t-muted">{c.detected_by || "—"}</td>
                <td>{c.resolution ? <StatusBadge status={c.resolution} size="sm" /> : <Badge tone="amber" size="sm" dot>OPEN</Badge>}</td>
                <td className="t-sm t-nowrap">{fmtDate(c.opened_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "var(--space-3) var(--space-5)" }}><Pagination page={page} size={PAGE_SIZE} total={total} onPage={setPage} /></div>
      {sel && <CaseDetail id={sel} onClose={() => setSel(null)} onChanged={() => { setSel(null); reload(); }} />}
    </>
  );
}

/* ───────── Duplicates ───────── */
function MergeModal({ match, onClose, onDone }) {
  const toast = useToast();
  const [survivor, setSurvivor] = useState(match.record_a_id);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await duplicates.merge(match.id, survivor); toast.success("Records merged · other archived"); onDone(); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title="Merge duplicate records" subtitle={`Similarity ${fmtScore(match.similarity)}`}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" iconLeft={<GitMerge size={15} />} loading={busy} onClick={submit}>Merge</Button></>}>
      <div className="sp-stack sp-gap-4">
        <p className="t-sm t-muted">Choose the surviving record. The other becomes <b>archived</b> (never hard-deleted); a <span className="t-mono">RECORD_MERGED</span> audit entry is written.</p>
        <Select label="Surviving record" value={survivor} onChange={(e) => setSurvivor(e.target.value)}
          options={[{ value: match.record_a_id, label: `A · ${match.record_a_id.slice(0, 8)}…` }, { value: match.record_b_id, label: `B · ${match.record_b_id.slice(0, 8)}…` }]} />
      </div>
    </Modal>
  );
}

function DuplicatesTab() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [merge, setMerge] = useState(null);
  const { data, error, loading, reload } = useApi(() => duplicates.list({ skip: page * PAGE_SIZE, limit: PAGE_SIZE, status: status || undefined }), [page, status]);
  const items = listItems(data), total = listTotal(data);
  return (
    <>
      <div className="sp-row-between" style={{ marginBottom: 12 }}>
        <span className="t-sm t-muted">1:N biometric duplicate matches</span>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          options={[{ value: "", label: "All" }, { value: "pending", label: "Pending" }, { value: "merged", label: "Merged" }, { value: "dismissed", label: "Dismissed" }]} />
      </div>
      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !items.length ? <Empty title="No duplicate matches" /> : (
        <div className="table-wrap">
          <table className="sp-table">
            <thead><tr><th>Match</th><th>Record A</th><th>Record B</th><th>Similarity</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td className="t-mono t-xs">{m.id.slice(0, 8)}…</td>
                  <td className="t-mono t-xs">{m.record_a_id.slice(0, 8)}…</td>
                  <td className="t-mono t-xs">{m.record_b_id.slice(0, 8)}…</td>
                  <td className="t-mono t-sm" style={{ color: m.similarity > 0.9 ? "var(--status-rejected-text)" : "var(--text-strong)" }}>{fmtScore(m.similarity)}</td>
                  <td><StatusBadge status={m.status} size="sm" /></td>
                  <td className="t-right">{m.status === "pending" && <Button size="sm" variant="secondary" iconLeft={<GitMerge size={13} />} onClick={() => setMerge(m)}>Merge</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ padding: "var(--space-3) 0" }}><Pagination page={page} size={PAGE_SIZE} total={total} onPage={setPage} /></div>
      {merge && <MergeModal match={merge} onClose={() => setMerge(null)} onDone={() => { setMerge(null); reload(); }} />}
    </>
  );
}

/* ───────── Anomalies ───────── */
function AnomaliesTab() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const { data, error, loading, reload } = useApi(() => anomalies.list({ skip: page * PAGE_SIZE, limit: PAGE_SIZE }), [page]);
  const items = listItems(data), total = listTotal(data);
  const sevTone = (s) => (s === "critical" ? "red" : s === "warning" ? "amber" : "blue");
  const act = async (id, which) => {
    try {
      if (which === "ack") await anomalies.acknowledge(id);
      if (which === "mute") await anomalies.mute(id);
      toast.success(`Anomaly ${which === "ack" ? "acknowledged" : "muted"}`);
      reload();
    } catch (e) { toast.error(e); }
  };
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!items.length) return <Empty title="No active anomalies" message="Real-time detectors report clean." />;
  return (
    <>
      <div className="sp-stack sp-gap-3">
        {items.map((a) => (
          <div key={a.id} className="section" style={{ boxShadow: "none" }}>
            <div className="section__bd">
              <div className="sp-row-between sp-wrap sp-gap-2">
                <div className="sp-row sp-gap-2">
                  <Badge tone={sevTone(a.severity)} variant="solid" size="sm">{String(a.severity).toUpperCase()}</Badge>
                  <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{a.title}</span>
                  <span className="t-xs t-mono t-muted">{a.id}</span>
                </div>
                <div className="sp-row sp-gap-2">
                  <StatusBadge status={a.status} size="sm" dot={false} />
                  {a.status === "active" && <>
                    <Button size="sm" variant="ghost" iconLeft={<Check size={13} />} onClick={() => act(a.id, "ack")}>Ack</Button>
                    <Button size="sm" variant="ghost" iconLeft={<BellOff size={13} />} onClick={() => act(a.id, "mute")}>Mute</Button>
                  </>}
                </div>
              </div>
              {a.description && <p className="t-sm t-muted" style={{ marginTop: 8 }}>{a.description}</p>}
              {(a.baseline != null || a.observed != null) && (
                <div className="t-xs t-mono t-muted" style={{ marginTop: 6 }}>
                  {a.signal_name}: baseline {a.baseline} → observed <b style={{ color: "var(--status-rejected-text)" }}>{a.observed}</b> {a.unit}
                </div>
              )}
              {a.recommendation && <div className="t-xs" style={{ marginTop: 6, color: "var(--secondary-text)" }}>→ {a.recommendation}</div>}
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} size={PAGE_SIZE} total={total} onPage={setPage} />
    </>
  );
}

export default function Fraud() {
  const [tab, setTab] = useState("cases");
  const stats = useApi(() => analytics.fraud(), []);
  const f = stats.data || {};
  return (
    <>
      <PageHead title="Fraud detection" sub="AI-flagged cases · risk-ranked" />
      <div className="sp-grid sp-grid-4" style={{ marginBottom: "var(--space-5)" }}>
        <StatCard label="Open cases" value={(f.open_cases ?? 0).toLocaleString()} icon={<ShieldAlert size={18} />} accent="rejected" />
        <StatCard label="Total cases" value={(f.total_cases ?? 0).toLocaleString()} sub={`${f.resolved_cases ?? 0} resolved`} />
        <StatCard label="Duplicate matches" value={(f.total_duplicates ?? 0).toLocaleString()} accent="review" />
        <StatCard label="Active anomalies" value={(f.active_anomalies ?? 0).toLocaleString()} accent="info" />
      </div>
      <div className="section">
        <div className="section__bd">
          <Tabs tabs={[{ id: "cases", label: "Cases" }, { id: "duplicates", label: "Duplicates" }, { id: "anomalies", label: "Anomalies" }]} active={tab} onChange={setTab} />
          {tab === "cases" && <CasesTab />}
          {tab === "duplicates" && <DuplicatesTab />}
          {tab === "anomalies" && <AnomaliesTab />}
        </div>
      </div>
    </>
  );
}
