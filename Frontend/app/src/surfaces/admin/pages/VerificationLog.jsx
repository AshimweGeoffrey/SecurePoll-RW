import { useState } from "react";
import { ScanFace, RefreshCw, ShieldCheck } from "lucide-react";
import { verification, analytics, ai } from "../../../api/endpoints.js";
import { useApi } from "../../../lib/useApi.js";
import { useLookups } from "../../../lib/useLookups.js";
import { useToast } from "../../../lib/toast.jsx";
import { listItems, listTotal } from "../../../lib/list.js";
import { fmtDate, fmtScore, fmtPct, prettyStatus } from "../../../lib/format.js";
import {
  Button, Select, Pagination, StatusBadge, Loading, ErrorState, Empty, Modal, StatCard,
  DecisionPanel, Input,
} from "../../../components/index.js";
import PageHead from "./PageHead.jsx";

const PAGE_SIZE = 20;

function OverrideModal({ attempt, onClose, onDone }) {
  const toast = useToast();
  const [result, setResult] = useState("approved");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!reason.trim()) { toast.error("A justification is required"); return; }
    setBusy(true);
    try {
      await verification.override(attempt.id, result, reason.trim());
      toast.success("Decision overridden — logged to audit chain");
      onDone();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  return (
    <Modal
      open onClose={onClose} title="Override verification decision"
      subtitle="Supervisor action · written to the audit chain"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" loading={busy} onClick={submit}>Apply override</Button></>}
    >
      <div className="sp-stack sp-gap-4">
        <Select label="Override result" value={result} onChange={(e) => setResult(e.target.value)}
          options={[{ value: "approved", label: "APPROVED" }, { value: "manual_review", label: "MANUAL REVIEW" }, { value: "rejected", label: "REJECTED" }]} />
        <Input label="Justification" required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Officer decision rationale" />
      </div>
    </Modal>
  );
}

function DetailModal({ attempt, lookups, thresholds, onClose, onOverride }) {
  const breakdown = {
    "Face match": attempt.face_score != null ? Number(attempt.face_score) : Number(attempt.confidence),
    Liveness: String(attempt.liveness || "").toUpperCase(),
  };
  const decision = attempt.result === "manual_review" ? "review" : attempt.result;
  return (
    <Modal
      open onClose={onClose} size="lg" title="Verification attempt"
      subtitle={<span className="t-mono">{attempt.id}</span>}
      footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="secondary" iconLeft={<ShieldCheck size={15} />} onClick={onOverride}>Override decision</Button></>}
    >
      <div className="sp-stack sp-gap-4">
        <DecisionPanel
          decision={decision}
          confidence={Number(attempt.confidence)}
          threshold={thresholds?.face_match_threshold ?? 0.3}
          breakdown={breakdown}
          explanation={attempt.explanation}
          flags={attempt.flags}
          reviewRequired={attempt.review_required}
        />
        <dl className="sp-kv">
          <dt>Station</dt><dd>{lookups.byStation[attempt.polling_station_id]?.name || "—"}</dd>
          <dt>Officer</dt><dd>{lookups.byOfficer[attempt.officer_id]?.name || "—"}</dd>
          <dt>When</dt><dd>{fmtDate(attempt.created_at)}</dd>
        </dl>
      </div>
    </Modal>
  );
}

export default function VerificationLog() {
  const lookups = useLookups();
  const [page, setPage] = useState(0);
  const [station, setStation] = useState("");
  const [selected, setSelected] = useState(null);
  const [overriding, setOverriding] = useState(null);

  const query = { skip: page * PAGE_SIZE, limit: PAGE_SIZE, station_id: station || undefined };
  const { data, error, loading, reload } = useApi(() => verification.list(query), [page, station]);
  const stats = useApi(() => analytics.verification(), []);
  const thr = useApi(() => ai.thresholds(), []);

  const items = listItems(data);
  const total = listTotal(data);
  const s = stats.data || {};

  return (
    <>
      <PageHead title="Verification" sub="Election-day 1:1 biometric checks · live feed">
        <Button size="sm" variant="ghost" iconLeft={<RefreshCw size={15} />} onClick={reload}>Refresh</Button>
      </PageHead>

      <div className="sp-grid sp-grid-4" style={{ marginBottom: "var(--space-5)" }}>
        <StatCard label="Attempts today" value={(s.total_attempts ?? total).toLocaleString()} icon={<ScanFace size={18} />} />
        <StatCard label="Auto-approved" value={(s.approved ?? 0).toLocaleString()} accent="approved" sub={fmtPct(s.approval_rate)} />
        <StatCard label="Manual review" value={(s.manual_review ?? 0).toLocaleString()} accent="review" />
        <StatCard label="Rejected" value={(s.rejected ?? 0).toLocaleString()} accent="rejected" sub={`avg conf ${fmtScore(s.average_confidence)}`} />
      </div>

      <div className="section">
        <div className="section__hd sp-wrap sp-gap-3">
          <h3>Attempt log</h3>
          <Select value={station} onChange={(e) => { setStation(e.target.value); setPage(0); }}
            options={[{ value: "", label: "All stations" }, ...lookups.stations.map((st) => ({ value: st.id, label: `${st.code} · ${st.name}` }))]} />
        </div>
        <div className="section__bd section__bd--flush">
          {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : items.length === 0 ? (
            <Empty title="No verification attempts" message="Attempts appear here as voters are checked at kiosks." />
          ) : (
            <div className="table-wrap">
              <table className="sp-table">
                <thead><tr><th>When</th><th>Result</th><th>Confidence</th><th>Liveness</th><th>Station</th><th>Flags</th></tr></thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.id} className="sp-row-click" onClick={() => setSelected(a)}>
                      <td className="t-nowrap t-sm">{fmtDate(a.created_at)}</td>
                      <td><StatusBadge status={a.result} size="sm" /></td>
                      <td className="t-mono t-sm">{fmtScore(a.confidence)}</td>
                      <td className="t-mono t-sm">{prettyStatus(a.liveness)}</td>
                      <td className="t-sm">{lookups.byStation[a.polling_station_id]?.code || "—"}</td>
                      <td className="t-xs t-muted">{(a.flags || []).join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div style={{ padding: "0 var(--space-5) var(--space-4)" }}>
          <Pagination page={page} size={PAGE_SIZE} total={total} onPage={setPage} />
        </div>
      </div>

      {selected && (
        <DetailModal
          attempt={selected} lookups={lookups} thresholds={thr.data}
          onClose={() => setSelected(null)}
          onOverride={() => { setOverriding(selected); setSelected(null); }}
        />
      )}
      {overriding && (
        <OverrideModal attempt={overriding} onClose={() => setOverriding(null)} onDone={() => { setOverriding(null); reload(); stats.reload(); }} />
      )}
    </>
  );
}
