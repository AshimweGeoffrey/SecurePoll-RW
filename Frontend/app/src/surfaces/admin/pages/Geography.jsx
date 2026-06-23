import { useState } from "react";
import { MapPin, Radio, UserCog, Plus, Power, PowerOff, RefreshCw, Trash2 } from "lucide-react";
import { districts as districtsApi, stations as stationsApi, officers as officersApi } from "../../../api/endpoints.js";
import { useApi } from "../../../lib/useApi.js";
import { invalidateLookups } from "../../../lib/useLookups.js";
import { useToast } from "../../../lib/toast.jsx";
import { listItems } from "../../../lib/list.js";
import { fmtInt, prettyStatus } from "../../../lib/format.js";
import {
  Button, Tabs, Input, Select, Badge, StatusBadge, Loading, ErrorState, Empty, Modal, StatCard, ConfirmDialog,
} from "../../../components/index.js";
import PageHead from "./PageHead.jsx";

const PROVINCES = ["Kigali City", "Northern", "Southern", "Eastern", "Western"];

/* ───────── Districts ───────── */
function DistrictsTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => districtsApi.list({ limit: 200 }), []);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", province: "Kigali City" });
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(null);

  const items = listItems(data);
  const add = async () => {
    if (!form.code || !form.name) { toast.error("Code and name required"); return; }
    setBusy(true);
    try { await districtsApi.create(form); toast.success("District created"); invalidateLookups(); setAdding(false); setForm({ code: "", name: "", province: "Kigali City" }); reload(); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await districtsApi.remove(del.id); toast.success("District deleted"); invalidateLookups(); setDel(null); reload(); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <>
      <div className="sp-row-between" style={{ marginBottom: 12 }}>
        <span className="t-sm t-muted">{items.length} districts</span>
        <Button size="sm" variant="primary" iconLeft={<Plus size={15} />} onClick={() => setAdding(true)}>Add district</Button>
      </div>
      <div className="table-wrap">
        <table className="sp-table">
          <thead><tr><th>Code</th><th>Name</th><th>Province</th><th></th></tr></thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td className="t-mono t-sm">{d.code}</td>
                <td style={{ fontWeight: 600, color: "var(--text-strong)" }}>{d.name}</td>
                <td className="t-sm">{d.province}</td>
                <td className="t-right"><Button size="sm" variant="ghost" iconLeft={<Trash2 size={13} />} onClick={() => setDel(d)}>Delete</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adding && (
        <Modal open onClose={() => setAdding(false)} title="Add district"
          footer={<><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button variant="primary" loading={busy} onClick={add}>Create</Button></>}>
          <div className="sp-stack sp-gap-4">
            <Input label="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. KGL-GAS" mono />
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gasabo" />
            <Select label="Province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} options={PROVINCES} />
          </div>
        </Modal>
      )}
      <ConfirmDialog open={!!del} danger busy={busy} title="Delete district" confirmLabel="Delete"
        message={`Delete ${del?.name}? This cannot be undone.`} onClose={() => setDel(null)} onConfirm={remove} />
    </>
  );
}

/* ───────── Stations ───────── */
function StationsTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => stationsApi.list({ limit: 300 }), []);
  const dist = useApi(() => districtsApi.list({ limit: 200 }), []);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", district_id: "" });

  const items = listItems(data);
  const districts = listItems(dist.data);
  const byDistrict = Object.fromEntries(districts.map((d) => [d.id, d.name]));

  const toggle = async (st) => {
    try {
      if (st.status === "online") { await stationsApi.close(st.id); toast.success(`${st.code} closed`); }
      else { await stationsApi.open(st.id); toast.success(`${st.code} opened`); }
      reload();
    } catch (e) { toast.error(e); }
  };
  const add = async () => {
    if (!form.code || !form.name || !form.district_id) { toast.error("All fields required"); return; }
    setBusy(true);
    try { await stationsApi.create(form); toast.success("Station created"); invalidateLookups(); setAdding(false); setForm({ code: "", name: "", district_id: "" }); reload(); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <>
      <div className="sp-row-between" style={{ marginBottom: 12 }}>
        <span className="t-sm t-muted">{items.length} polling stations</span>
        <Button size="sm" variant="primary" iconLeft={<Plus size={15} />} onClick={() => setAdding(true)}>Add station</Button>
      </div>
      <div className="table-wrap">
        <table className="sp-table">
          <thead><tr><th>Code</th><th>Name</th><th>District</th><th>Status</th><th className="t-right">Registered</th><th className="t-right">Verified</th><th></th></tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td className="t-mono t-sm">{s.code}</td>
                <td style={{ fontWeight: 600, color: "var(--text-strong)" }}>{s.name}</td>
                <td className="t-sm">{byDistrict[s.district_id] || "—"}</td>
                <td><StatusBadge status={s.status} size="sm" /></td>
                <td className="t-right t-mono t-sm">{fmtInt(s.registered_count)}</td>
                <td className="t-right t-mono t-sm">{fmtInt(s.verified_today)}</td>
                <td className="t-right">
                  {s.status === "online"
                    ? <Button size="sm" variant="ghost" iconLeft={<PowerOff size={13} />} onClick={() => toggle(s)}>Close</Button>
                    : <Button size="sm" variant="secondary" iconLeft={<Power size={13} />} onClick={() => toggle(s)}>Open</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adding && (
        <Modal open onClose={() => setAdding(false)} title="Add polling station"
          footer={<><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button variant="primary" loading={busy} onClick={add}>Create</Button></>}>
          <div className="sp-stack sp-gap-4">
            <Input label="Code" required mono value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. PS-014" />
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nyarugenge Station 1" />
            <Select label="District" required placeholder="Select district" value={form.district_id}
              onChange={(e) => setForm({ ...form, district_id: e.target.value })} options={districts.map((d) => ({ value: d.id, label: d.name }))} />
          </div>
        </Modal>
      )}
    </>
  );
}

/* ───────── Officers ───────── */
function OfficersTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => officersApi.list({ limit: 200 }), []);
  const dist = useApi(() => districtsApi.list({ limit: 200 }), []);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", team: "", assigned_district_id: "" });
  const [stats, setStats] = useState(null);

  const items = listItems(data);
  const districts = listItems(dist.data);
  const byDistrict = Object.fromEntries(districts.map((d) => [d.id, d.name]));

  const add = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    setBusy(true);
    try { await officersApi.create({ ...form, assigned_district_id: form.assigned_district_id || null }); toast.success("Officer created"); invalidateLookups(); setAdding(false); setForm({ name: "", team: "", assigned_district_id: "" }); reload(); }
    catch (e) { toast.error(e); } finally { setBusy(false); }
  };
  const viewStats = async (o) => {
    try { const s = await officersApi.stats(o.id); setStats({ officer: o, ...s }); } catch (e) { toast.error(e); }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <>
      <div className="sp-row-between" style={{ marginBottom: 12 }}>
        <span className="t-sm t-muted">{items.length} field officers</span>
        <Button size="sm" variant="primary" iconLeft={<Plus size={15} />} onClick={() => setAdding(true)}>Add officer</Button>
      </div>
      <div className="table-wrap">
        <table className="sp-table">
          <thead><tr><th>Name</th><th>Team</th><th>District</th><th></th></tr></thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="sp-row-click" onClick={() => viewStats(o)}>
                <td style={{ fontWeight: 600, color: "var(--text-strong)" }}>{o.name}</td>
                <td className="t-sm">{o.team || "—"}</td>
                <td className="t-sm">{byDistrict[o.assigned_district_id] || "—"}</td>
                <td className="t-right"><span className="sp-link">View stats</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adding && (
        <Modal open onClose={() => setAdding(false)} title="Add field officer"
          footer={<><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button variant="primary" loading={busy} onClick={add}>Create</Button></>}>
          <div className="sp-stack sp-gap-4">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Team" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="e.g. Kicukiro field team" />
            <Select label="Assigned district" placeholder="Unassigned" value={form.assigned_district_id}
              onChange={(e) => setForm({ ...form, assigned_district_id: e.target.value })} options={[{ value: "", label: "Unassigned" }, ...districts.map((d) => ({ value: d.id, label: d.name }))]} />
          </div>
        </Modal>
      )}
      {stats && (
        <Modal open onClose={() => setStats(null)} title={stats.officer.name} subtitle="Verification statistics"
          footer={<Button variant="primary" onClick={() => setStats(null)}>Close</Button>}>
          <div className="sp-grid sp-grid-2">
            <StatCard label="Total verifications" value={fmtInt(stats.total)} />
            <StatCard label="Approved" value={fmtInt(stats.approved)} accent="approved" />
            <StatCard label="Manual review" value={fmtInt(stats.manual_review)} accent="review" />
            <StatCard label="Rejected" value={fmtInt(stats.rejected)} accent="rejected" />
          </div>
        </Modal>
      )}
    </>
  );
}

export default function Geography() {
  const [tab, setTab] = useState("districts");
  return (
    <>
      <PageHead title="Geography & operations" sub="Districts · polling stations · field officers" />
      <div className="section">
        <div className="section__bd">
          <Tabs tabs={[{ id: "districts", label: "Districts" }, { id: "stations", label: "Polling stations" }, { id: "officers", label: "Officers" }]} active={tab} onChange={setTab} />
          {tab === "districts" && <DistrictsTab />}
          {tab === "stations" && <StationsTab />}
          {tab === "officers" && <OfficersTab />}
        </div>
      </div>
    </>
  );
}
