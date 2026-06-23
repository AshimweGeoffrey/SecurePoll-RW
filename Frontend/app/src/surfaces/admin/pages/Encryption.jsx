import { useState } from "react";
import { Lock, KeyRound, RotateCw, Plus, Trash2, ShieldCheck, RefreshCw } from "lucide-react";
import { keys as keysApi } from "../../../api/endpoints.js";
import { useApi } from "../../../lib/useApi.js";
import { useToast } from "../../../lib/toast.jsx";
import { listItems, listTotal } from "../../../lib/list.js";
import { fmtDate } from "../../../lib/format.js";
import {
  Button, Input, Badge, StatCard, Loading, ErrorState, Empty, Modal, ConfirmDialog,
} from "../../../components/index.js";
import PageHead from "./PageHead.jsx";

function KeyModal({ onClose, onDone }) {
  const toast = useToast();
  const [f, setF] = useState({ title: "", algorithm: "AES-256-GCM", scope: "" });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!f.title) { toast.error("Title required"); return; }
    setBusy(true);
    try { await keysApi.create({ title: f.title, algorithm: f.algorithm, scope: f.scope || null }); toast.success("Key registered"); onDone(); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title="Register encryption key"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" loading={busy} onClick={submit}>Register</Button></>}>
      <div className="sp-stack sp-gap-4">
        <Input label="Title" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Biometric template key" />
        <Input label="Algorithm" value={f.algorithm} onChange={(e) => setF({ ...f, algorithm: e.target.value })} mono />
        <Input label="Scope" value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })} placeholder="e.g. face / archive / backups" />
      </div>
    </Modal>
  );
}

export default function Encryption() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => keysApi.list(), []);
  const health = useApi(() => keysApi.health(), []);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const items = listItems(data);
  const total = listTotal(data);
  const h = health.data || {};

  const rotate = async (k) => {
    try { const r = await keysApi.rotate(k.id); toast.success(`${k.title} rotated → v${r.current_version}`); reload(); }
    catch (e) { toast.error(e); }
  };
  const remove = async () => {
    setBusy(true);
    try { await keysApi.remove(del.id); toast.success("Key deleted"); setDel(null); reload(); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHead title="Encryption" sub="Key custody · HSM · AES-256-GCM template protection">
        <Button size="sm" variant="ghost" iconLeft={<RefreshCw size={15} />} onClick={() => { reload(); health.reload(); }}>Refresh</Button>
        <Button size="sm" variant="primary" iconLeft={<Plus size={15} />} onClick={() => setAdding(true)}>Register key</Button>
      </PageHead>

      <div className="sp-grid sp-grid-3" style={{ marginBottom: "var(--space-5)" }}>
        <StatCard label="HSM status" value={h.healthy ? "Healthy" : (health.loading ? "…" : "Degraded")} icon={<ShieldCheck size={18} />} accent={h.healthy ? "approved" : "rejected"} />
        <StatCard label="Keys under custody" value={(h.key_count ?? total).toLocaleString()} icon={<KeyRound size={18} />} />
        <StatCard label="Default algorithm" value="AES-256-GCM" icon={<Lock size={18} />} accent="info" />
      </div>

      <div className="section">
        <div className="section__hd"><h3>Key registry</h3></div>
        <div className="section__bd section__bd--flush">
          {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : !items.length ? <Empty title="No keys registered" /> : (
            <div className="table-wrap">
              <table className="sp-table">
                <thead><tr><th>Title</th><th>Algorithm</th><th>Scope</th><th>Version</th><th>Rotated</th><th></th></tr></thead>
                <tbody>
                  {items.map((k) => (
                    <tr key={k.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-strong)" }}>{k.title}</td>
                      <td><Badge tone="blue" size="sm" dot={false}>{k.algorithm}</Badge></td>
                      <td className="t-sm t-mono">{k.scope || "—"}</td>
                      <td className="t-mono t-sm">v{k.current_version}</td>
                      <td className="t-xs t-muted t-nowrap">{fmtDate(k.updated_at)}</td>
                      <td className="t-right">
                        <div className="sp-row sp-gap-1" style={{ justifyContent: "flex-end" }}>
                          <Button size="sm" variant="secondary" iconLeft={<RotateCw size={13} />} onClick={() => rotate(k)}>Rotate</Button>
                          <button className="sp-iconbtn" title="Delete" onClick={() => setDel(k)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {adding && <KeyModal onClose={() => setAdding(false)} onDone={() => { setAdding(false); reload(); health.reload(); }} />}
      <ConfirmDialog open={!!del} danger busy={busy} title="Delete key" confirmLabel="Delete"
        message={`Delete ${del?.title}? Previous versions are retained for decrypt elsewhere.`} onClose={() => setDel(null)} onConfirm={remove} />
    </>
  );
}
