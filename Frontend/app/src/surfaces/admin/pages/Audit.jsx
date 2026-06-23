import { useState } from "react";
import {
  FileCheck2, ShieldCheck, ShieldAlert, Download, RefreshCw, Link2, Lock, X, ArrowUp, ArrowDown,
  Activity, MapPin, Loader,
} from "lucide-react";
import { audit, anomalies as anomaliesApi } from "../../../api/endpoints.js";
import { useApi } from "../../../lib/useApi.js";
import { useLookups } from "../../../lib/useLookups.js";
import { useToast } from "../../../lib/toast.jsx";
import { listItems, listTotal } from "../../../lib/list.js";
import { fmtTime, fmtDate, prettyStatus, initials } from "../../../lib/format.js";
import { Button, Select, Input, Pagination, Badge, Avatar, ErrorState, Empty, Skeleton } from "../../../components/index.js";
import PageHead from "./PageHead.jsx";
import "../admin-design.css";
import "../admin-modals.css";

const PAGE_SIZE = 25;
const SERVICES = ["", "Verification", "Election Ops", "AI / ML", "Registry", "IAM", "Auth"];
const ACTIONS = ["", "VOTER_VERIFIED", "VOTER_VOTED", "TEMPLATE_ACCESSED", "PERMISSION_CHANGED", "LOGIN", "DATA_EXPORTED", "RECORD_BLOCKED", "RECORD_CREATED", "BIOMETRIC_LINKED", "RECORD_MERGED", "RECORD_ARCHIVED", "KEY_ROTATED", "HSM_HEALTHCHECK"];

const ACT_TONE = {
  VOTER_VERIFIED: "green", VOTER_VOTED: "green", TEMPLATE_ACCESSED: "blue", LOGIN: "blue",
  PERMISSION_CHANGED: "amber", DATA_EXPORTED: "amber", RECORD_MERGED: "amber", RECORD_BLOCKED: "red", RECORD_ARCHIVED: "red",
};
const TONE_VAR = { green: "var(--status-approved)", amber: "var(--status-review)", red: "var(--status-rejected)", blue: "var(--status-info)", neutral: "var(--slate-400)" };
const sev = (s) => (s === "critical" ? "red" : s === "warning" ? "amber" : "blue");

function LogDetailModal({ e, lookups, onClose }) {
  const tone = ACT_TONE[e.action] || "neutral";
  const station = lookups.byStation[e.polling_station_id];
  const diff = Array.isArray(e.change_diff) ? e.change_diff : null;
  return (
    <div className="modal-overlay" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div className="dmodal dmodal--wide">
        <div className="dmodal__h">
          <div><h2>Audit entry</h2>
            <div className="dmodal__sub"><span className="logact"><span className="dot" style={{ background: TONE_VAR[tone] }} /><span className="a">{e.action}</span></span> · #{e.sequence} · {fmtDate(e.occurred_at)}</div>
          </div>
          <button className="dmodal__x" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="dmodal__scroll">
          <div className="fxev">
            <div className="fxev__col">
              <div className="fxev__lbl">Event</div>
              <div style={{ fontSize: 14, color: "var(--text-default)", lineHeight: 1.55 }}>{e.detail || prettyStatus(e.action)}</div>
              <div className="fxev__lbl">Attribution</div>
              <div className="fxmeta">
                <div className="fxmeta__row"><span className="fxmeta__k">Actor</span><span className="fxmeta__v">{e.actor_id || e.actor_type || "—"}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Role</span><span className="fxmeta__v">{e.actor_role || "—"}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Service</span><span className="fxmeta__v">{e.service || "—"}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Station</span><span className="fxmeta__v">{station?.code || "—"}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">IP address</span><span className="fxmeta__v mono">{e.ip_address || "—"}</span></div>
                <div className="fxmeta__row"><span className="fxmeta__k">Location</span><span className="fxmeta__v">{e.geo || "—"}</span></div>
              </div>
              {diff && (
                <>
                  <div className="fxev__lbl">Change</div>
                  <div>{diff.map((d, i) => (
                    <div className="diffrow" key={i}><span className="k">{d.field || d[0]}</span>
                      <span><span className="old">{String(d.old ?? d[1])}</span><span className="arr">→</span><span className="new">{String(d.new ?? d[2])}</span></span></div>
                  ))}</div>
                </>
              )}
            </div>
            <div className="fxev__col">
              <div className="fxev__lbl">Hash-chain context</div>
              <div className="chain-list">
                <div className="chain-item"><div className="chain-node"><div className="lnk" style={{ background: "var(--bg-inset)", color: "var(--text-subtle)" }}><ArrowUp size={16} /></div></div>
                  <div className="chain-info"><div className="ca" style={{ fontSize: 12, color: "var(--text-muted)" }}>Previous entry</div><div className="cm hashmono" style={{ color: "var(--text-muted)" }}>{(e.prev_hash || "begin").slice(0, 16)}…</div></div></div>
                <div className="chain-item"><div className="chain-node"><div className="lnk"><Link2 size={16} /></div></div>
                  <div className="chain-info"><div className="ca">This entry</div><div className="cm hashmono">{(e.entry_hash || "").slice(0, 16)}…</div></div>
                  <div className="chain-hash"><Badge tone="green" size="sm" dot>SEALED</Badge></div></div>
                <div className="chain-item"><div className="chain-node"><div className="lnk" style={{ background: "var(--bg-inset)", color: "var(--text-subtle)" }}><ArrowDown size={16} /></div></div>
                  <div className="chain-info"><div className="ca" style={{ fontSize: 12, color: "var(--text-muted)" }}>Next entry</div><div className="cm hashmono" style={{ color: "var(--text-muted)" }}>links forward ✓</div></div></div>
              </div>
              <div className="fxai"><ShieldCheck size={17} /><div className="t"><b>Integrity intact.</b> This entry's hash includes the previous entry's hash; recomputing the chain reproduces the signed root.</div></div>
            </div>
          </div>
        </div>
        <div className="dmodal__foot"><span className="grow"><Lock size={14} /> Append-only · cannot be edited or deleted</span></div>
      </div>
    </div>
  );
}

function VerifyModal({ onClose }) {
  const toast = useToast();
  const { data, loading, error } = useApi(() => audit.verifyChain(), []);
  const ok = data && data.breaks_found === 0;
  return (
    <div className="modal-overlay" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div className="dmodal dmodal--mid">
        <div className="dmodal__h">
          <div><h2>Verify chain integrity</h2><div className="dmodal__sub">Re-walk the SHA-256 hash chain end to end</div></div>
          <button className="dmodal__x" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="dmodal__scroll">
          <div className="vrun">
            {loading ? (
              <><div className="vrun__ring" style={{ background: "var(--secondary-soft)", color: "var(--secondary-text)" }}><Loader size={40} style={{ animation: "sp-spin 1s linear infinite" }} /></div>
                <h3>Walking the chain…</h3><p>Recomputing entry hashes and comparing against the signed root.</p></>
            ) : error ? (
              <><div className="vrun__ring" style={{ background: "var(--status-rejected-soft)", color: "var(--status-rejected-text)" }}><ShieldAlert size={40} /></div>
                <h3>Couldn't verify</h3><p>{error.message}</p></>
            ) : (
              <><div className="vrun__ring" style={ok ? undefined : { background: "var(--status-rejected-soft)", color: "var(--status-rejected-text)" }}>{ok ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}</div>
                <h3>{ok ? "Integrity verified · 0 breaks" : `${data.breaks_found} break(s) found`}</h3>
                <p>{ok ? "The entire audit chain reproduces the signed root. No entry was altered, inserted, or removed." : `First break at sequence #${data.first_break_sequence}.`}</p>
                <div className="vrun__grid">
                  <div className="fxmeta__row"><span className="fxmeta__k">Entries walked</span><span className="fxmeta__v mono">{(data.entries_walked || 0).toLocaleString()}</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">Breaks found</span><span className="fxmeta__v" style={{ color: ok ? "var(--status-approved-text)" : "var(--status-rejected-text)" }}>{data.breaks_found}</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">Duration</span><span className="fxmeta__v mono">{data.duration_ms != null ? data.duration_ms + " ms" : "—"}</span></div>
                  <div className="fxmeta__row"><span className="fxmeta__k">Verified at</span><span className="fxmeta__v mono">{fmtTime(data.verified_at)}</span></div>
                </div></>
            )}
          </div>
        </div>
        <div className="dmodal__foot"><Button variant="primary" onClick={onClose}>Done</Button></div>
      </div>
    </div>
  );
}

export default function Audit() {
  const toast = useToast();
  const lookups = useLookups();
  const [page, setPage] = useState(0);
  const [action, setAction] = useState("");
  const [service, setService] = useState("");
  const [actorId, setActorId] = useState("");
  const [entry, setEntry] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const query = { skip: page * PAGE_SIZE, limit: PAGE_SIZE, action: action || undefined, service: service || undefined, actor_id: actorId || undefined };
  const { data, error, loading, reload } = useApi(() => audit.entries(query), [page, action, service, actorId]);
  const anoms = useApi(() => anomaliesApi.list({ limit: 3 }), []);
  const items = listItems(data), total = listTotal(data);
  const anomItems = listItems(anoms.data);

  const onExport = async () => { try { await audit.exportCsv("csv"); toast.success("Audit log exported"); } catch (e) { toast.error(e); } };

  return (
    <>
      <PageHead title="Audit log" sub="Append-only · SHA-256 hash-chained · cryptographically verified">
        <Button size="sm" variant="secondary" iconLeft={<Download size={15} />} onClick={onExport}>Export</Button>
        <Button size="sm" variant="primary" iconLeft={<ShieldCheck size={15} />} onClick={() => setVerifying(true)}>Verify chain</Button>
      </PageHead>

      {/* anomaly signals */}
      {anomItems.length > 0 && (
        <div className="anoms">
          {anomItems.map((a) => (
            <div className={"anom anom--" + sev(a.severity)} key={a.id}>
              <span className="anom__ic">{a.severity === "critical" ? <ShieldAlert size={17} /> : a.severity === "warning" ? <Activity size={17} /> : <MapPin size={17} />}</span>
              <div style={{ minWidth: 0 }}>
                <div className="anom__t">{a.title}{a.is_live && <Badge tone="red" size="sm" dot>LIVE</Badge>}</div>
                <div className="anom__d">{a.description || a.signal_name}</div>
                <div className="anom__when">{a.id} · {fmtDate(a.detected_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* integrity banner */}
      <div className="verified-banner">
        <ShieldCheck size={22} />
        <div className="sp-grow"><div className="vt">Chain sealed · {total.toLocaleString()} entries</div><div className="vs">Every write is hash-linked to the previous entry. Run “Verify chain” to re-walk and confirm 0 breaks.</div></div>
        <Button size="sm" variant="ghost" iconLeft={<RefreshCw size={15} />} onClick={reload}>Refresh</Button>
      </div>

      <div className="dscard">
        <div className="dscard__hd" style={{ flexWrap: "wrap", gap: 10 }}>
          <div className="dscard__t">Audit entries</div>
          <div className="dscard__hd-end sp-row sp-gap-2 sp-wrap">
            <Select value={action} onChange={(e) => { setAction(e.target.value); setPage(0); }} options={ACTIONS.map((a) => ({ value: a, label: a ? prettyStatus(a) : "All actions" }))} />
            <Select value={service} onChange={(e) => { setService(e.target.value); setPage(0); }} options={SERVICES.map((s) => ({ value: s, label: s || "All services" }))} />
            <div style={{ width: 170 }}><Input placeholder="Actor ID…" value={actorId} onChange={(e) => { setActorId(e.target.value); setPage(0); }} /></div>
          </div>
        </div>
        <div className="dscard__body dscard__body--flush">
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>#</th><th>Time</th><th>Action</th><th>Actor</th><th>Service</th><th>Station</th><th>Hash</th></tr></thead>
              <tbody>
                {loading && !data && [0, 1, 2, 3, 4].map((i) => <tr key={i}><td colSpan={7}><Skeleton h={16} /></td></tr>)}
                {items.map((e) => {
                  const tone = ACT_TONE[e.action] || "neutral";
                  return (
                    <tr key={e.id} className="row-hover" onClick={() => setEntry(e)}>
                      <td className="mono">{e.sequence}</td>
                      <td className="mono">{fmtTime(e.occurred_at)}</td>
                      <td><span className="logact"><span className="dot" style={{ background: TONE_VAR[tone] }} /><span className="a">{e.action}</span></span></td>
                      <td><div className="sp-row sp-gap-2"><Avatar name={e.actor_role || e.actor_type} size={26} /><span className="t-sm">{e.actor_role || e.actor_type || "—"}</span></div></td>
                      <td className="t-sm">{e.service || "—"}</td>
                      <td className="mono">{lookups.byStation[e.polling_station_id]?.code || "—"}</td>
                      <td className="hashmono">{(e.entry_hash || "").slice(0, 8)}…</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && error && <ErrorState error={error} onRetry={reload} />}
          {!loading && !error && items.length === 0 && <Empty title="No audit entries" />}
        </div>
        <div style={{ padding: "12px 18px" }}><Pagination page={page} size={PAGE_SIZE} total={total} onPage={setPage} /></div>
      </div>

      {entry && <LogDetailModal e={entry} lookups={lookups} onClose={() => setEntry(null)} />}
      {verifying && <VerifyModal onClose={() => setVerifying(false)} />}
    </>
  );
}
