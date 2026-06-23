import { useState } from "react";
import { ScanFace, Fingerprint, ShieldAlert, Ban, Archive, RotateCcw, Flag, Save, Trash2, RefreshCw } from "lucide-react";
import { voters as votersApi, biometrics } from "../../../api/endpoints.js";
import { useApi } from "../../../lib/useApi.js";
import { useToast } from "../../../lib/toast.jsx";
import { fmtDate, fmtScore, maskNid, maskPhone, fullName, ageFrom, prettyStatus } from "../../../lib/format.js";
import {
  Modal, Tabs, Button, Input, Badge, StatusBadge, ConfidenceMeter, ConfirmDialog, Loading, Empty,
} from "../../../components/index.js";
import { BiometricCapture } from "../../../components/BiometricCapture.jsx";

function Overview({ voter, lookups }) {
  const d = lookups.byDistrict[voter.district_id];
  const s = lookups.byStation[voter.polling_station_id];
  const o = lookups.byOfficer[voter.enrolled_by_officer_id];
  return (
    <dl className="sp-kv">
      <dt>Full name</dt><dd>{fullName(voter)}</dd>
      <dt>Voter token</dt><dd className="t-mono">{voter.voter_token}</dd>
      <dt>Registration</dt><dd className="t-mono">{voter.registration_ref}</dd>
      <dt>National ID</dt><dd className="t-mono">{maskNid(voter.national_id)}</dd>
      <dt>Sex · DOB</dt><dd>{prettyStatus(voter.sex)} · {voter.date_of_birth} {ageFrom(voter.date_of_birth) != null && `(${ageFrom(voter.date_of_birth)})`}</dd>
      <dt>Phone</dt><dd className="t-mono">{maskPhone(voter.phone)}</dd>
      <dt>District</dt><dd>{d?.name || "—"}{d?.province ? ` · ${d.province}` : ""}</dd>
      <dt>Polling station</dt><dd>{s ? `${s.code} · ${s.name}` : "—"}</dd>
      <dt>Roll position</dt><dd className="t-mono">{voter.roll_position ?? "—"}</dd>
      <dt>Data quality</dt><dd className="t-mono">{voter.data_quality_score ?? 0}/100</dd>
      <dt>Enrolled</dt><dd>{fmtDate(voter.enrolled_at)}{o ? ` · ${o.name}` : ""}</dd>
      <dt>Last verified</dt><dd>{fmtDate(voter.last_verified_at)}</dd>
    </dl>
  );
}

function EditTab({ voter, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    first_name: voter.first_name || "", last_name: voter.last_name || "",
    phone: voter.phone || "", roll_position: voter.roll_position ?? "",
  });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...form, roll_position: form.roll_position === "" ? null : Number(form.roll_position) };
      const updated = await votersApi.update(voter.id, payload);
      toast.success("Voter updated");
      onSaved(updated);
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  return (
    <div className="sp-stack sp-gap-4">
      <div className="sp-grid sp-grid-2">
        <Input label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
        <Input label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
      </div>
      <div className="sp-grid sp-grid-2">
        <Input label="Phone" mono value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+2507…" />
        <Input label="Roll position" mono type="number" value={form.roll_position} onChange={(e) => setForm({ ...form, roll_position: e.target.value })} />
      </div>
      <div><Button variant="primary" iconLeft={<Save size={15} />} loading={busy} onClick={save}>Save changes</Button></div>
    </div>
  );
}

function BiometricsTab({ voter, thresholds, onChanged }) {
  const toast = useToast();
  const quality = useApi(() => biometrics.quality(voter.id), [voter.id]);
  const [capture, setCapture] = useState(null);
  const [busy, setBusy] = useState(false);

  const enrolled = quality.data && quality.data.quality_score != null && !quality.error;

  const doEnroll = async () => {
    if (!capture) { toast.error("Capture or upload a face image first"); return; }
    setBusy(true);
    try {
      const fn = enrolled ? biometrics.reEnroll : biometrics.enroll;
      const res = await fn(voter.id, capture.base64);
      toast.success(`Face enrolled · quality ${fmtScore(res.quality_score)} · liveness ${res.liveness_passed ? "passed" : "failed"}`);
      setCapture(null);
      quality.reload();
      onChanged?.();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  const dedup = async () => {
    setBusy(true);
    try {
      const res = await biometrics.dedupScan(voter.id);
      const matches = res.matches?.length ?? res.duplicate_count ?? res.match_count ?? 0;
      toast.success(matches ? `Dedup scan: ${matches} potential match(es)` : "Dedup scan: no duplicates found");
      onChanged?.();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  const del = async () => {
    setBusy(true);
    try { await biometrics.deleteTemplate(voter.id); toast.success("Template deleted"); quality.reload(); onChanged?.(); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };

  return (
    <div className="sp-stack sp-gap-4">
      <div className="sp-row-between">
        <div className="sp-row sp-gap-2">
          <Badge tone={enrolled ? "green" : "neutral"} dot><ScanFace size={13} style={{ marginRight: 4 }} />Face {enrolled ? "enrolled" : "not enrolled"}</Badge>
          <Badge tone="neutral" dot={false}><Fingerprint size={13} style={{ marginRight: 4 }} />Fingerprint n/a</Badge>
        </div>
        {enrolled && <Button size="sm" variant="ghost" iconLeft={<RefreshCw size={14} />} onClick={() => quality.reload()}>Refresh</Button>}
      </div>

      {quality.loading ? <Loading padded={false} /> : enrolled ? (
        <div className="section" style={{ boxShadow: "none" }}>
          <div className="section__bd sp-stack sp-gap-3">
            <ConfidenceMeter value={Number(quality.data.quality_score)} threshold={thresholds?.dedup_threshold ?? 0.4} label="Capture quality" size="sm" />
            <dl className="sp-kv">
              <dt>Liveness</dt><dd>{quality.data.liveness_passed ? <Badge tone="green" size="sm">PASSED</Badge> : <Badge tone="red" size="sm">FAILED</Badge>}</dd>
              <dt>Captured</dt><dd>{fmtDate(quality.data.captured_at)}</dd>
            </dl>
          </div>
        </div>
      ) : (
        <Empty message="No face template on file. Capture one below." />
      )}

      <div className="sp-divider" />
      <div className="t-eyebrow">{enrolled ? "Re-enrol face" : "Enrol face"}</div>
      <BiometricCapture onCapture={setCapture} onClear={() => setCapture(null)} height={220} />
      <div className="sp-row sp-gap-2 sp-wrap">
        <Button variant="primary" iconLeft={<ScanFace size={15} />} loading={busy} disabled={!capture} onClick={doEnroll}>
          {enrolled ? "Re-enrol" : "Enrol"} face
        </Button>
        {enrolled && <Button variant="secondary" iconLeft={<ShieldAlert size={15} />} loading={busy} onClick={dedup}>Run 1:N dedup scan</Button>}
        {enrolled && <Button variant="ghost" iconLeft={<Trash2 size={15} />} loading={busy} onClick={del}>Delete template</Button>}
      </div>
    </div>
  );
}

function HistoryTab({ voter, lookups }) {
  const hist = useApi(() => votersApi.verifications(voter.id), [voter.id]);
  if (hist.loading) return <Loading padded={false} />;
  const attempts = hist.data?.attempts || [];
  if (!attempts.length) return <Empty message="No verification attempts recorded." />;
  return (
    <div className="table-wrap">
      <table className="sp-table">
        <thead><tr><th>When</th><th>Result</th><th>Confidence</th><th>Liveness</th><th>Station</th></tr></thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a.id}>
              <td className="t-nowrap">{fmtDate(a.created_at)}</td>
              <td><StatusBadge status={a.result} size="sm" /></td>
              <td className="t-mono">{fmtScore(a.confidence)}</td>
              <td className="t-mono">{prettyStatus(a.liveness)}</td>
              <td className="t-sm">{lookups.byStation[a.polling_station_id]?.code || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VoterDetail({ voterId, lookups, thresholds, onClose, onChanged }) {
  const toast = useToast();
  const { data: voter, loading, reload, setData } = useApi(() => votersApi.get(voterId), [voterId]);
  const [tab, setTab] = useState("overview");
  const [confirm, setConfirm] = useState(null); // {action, ...}
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const runAction = async () => {
    setBusy(true);
    try {
      const id = voter.id;
      if (confirm.action === "flag") await votersApi.flag(id, reason || "Manual review");
      if (confirm.action === "block") await votersApi.block(id, reason || "Administrative block", null);
      if (confirm.action === "archive") await votersApi.archive(id);
      if (confirm.action === "restore") await votersApi.restore(id);
      toast.success(`Voter ${confirm.action}ed`);
      setConfirm(null); setReason("");
      reload(); onChanged?.();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };

  const canRestore = voter && ["blocked", "archived"].includes(voter.status);

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={voter ? fullName(voter) : "Voter"}
      subtitle={voter ? <span className="t-mono">{voter.voter_token}</span> : ""}
      footer={
        voter && (
          <div className="sp-row-between" style={{ width: "100%" }}>
            <div className="sp-row sp-gap-2"><StatusBadge status={voter.status} /></div>
            <div className="sp-row sp-gap-2 sp-wrap">
              {voter.status === "registered" && <Button size="sm" variant="secondary" iconLeft={<Flag size={14} />} onClick={() => setConfirm({ action: "flag" })}>Flag</Button>}
              {!["blocked", "archived"].includes(voter.status) && <Button size="sm" variant="secondary" iconLeft={<Ban size={14} />} onClick={() => setConfirm({ action: "block" })}>Block</Button>}
              {voter.status !== "archived" && <Button size="sm" variant="ghost" iconLeft={<Archive size={14} />} onClick={() => setConfirm({ action: "archive" })}>Archive</Button>}
              {canRestore && <Button size="sm" variant="primary" iconLeft={<RotateCcw size={14} />} onClick={() => setConfirm({ action: "restore" })}>Restore</Button>}
            </div>
          </div>
        )
      }
    >
      {loading || !voter ? <Loading /> : (
        <>
          <Tabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "biometrics", label: "Biometrics" },
              { id: "history", label: "Verifications" },
              { id: "edit", label: "Edit" },
            ]}
            active={tab}
            onChange={setTab}
          />
          {tab === "overview" && <Overview voter={voter} lookups={lookups} />}
          {tab === "biometrics" && <BiometricsTab voter={voter} thresholds={thresholds} onChanged={onChanged} />}
          {tab === "history" && <HistoryTab voter={voter} lookups={lookups} />}
          {tab === "edit" && <EditTab voter={voter} onSaved={(u) => { setData(u); onChanged?.(); }} />}
        </>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm ? `${confirm.action[0].toUpperCase()}${confirm.action.slice(1)} voter` : ""}
        danger={confirm?.action === "block" || confirm?.action === "archive"}
        busy={busy}
        confirmLabel={confirm ? confirm.action[0].toUpperCase() + confirm.action.slice(1) : "Confirm"}
        onClose={() => { setConfirm(null); setReason(""); }}
        onConfirm={runAction}
        message={
          <div className="sp-stack sp-gap-3">
            <span>This action is written to the tamper-evident audit chain.</span>
            {(confirm?.action === "flag" || confirm?.action === "block") && (
              <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Justification (audit-logged)" autoFocus />
            )}
          </div>
        }
      />
    </Modal>
  );
}
