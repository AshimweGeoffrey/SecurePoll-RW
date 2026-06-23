import { useEffect, useRef, useState } from "react";
import { Search, UserPlus, Upload, Download, RefreshCw, HeartPulse } from "lucide-react";
import { voters as votersApi, registry } from "../../../api/endpoints.js";
import { useApi } from "../../../lib/useApi.js";
import { useLookups } from "../../../lib/useLookups.js";
import { useToast } from "../../../lib/toast.jsx";
import { listItems, listTotal } from "../../../lib/list.js";
import { fullName, maskNid } from "../../../lib/format.js";
import {
  Button, Input, Select, Pagination, StatusBadge, Loading, ErrorState, Empty, Modal, StatCard,
} from "../../../components/index.js";
import PageHead from "./PageHead.jsx";
import VoterDetail from "./VoterDetail.jsx";

const PAGE_SIZE = 20;
const STATUSES = ["", "registered", "voted", "flagged", "blocked", "archived"];

function AddVoterModal({ lookups, onClose, onAdded }) {
  const toast = useToast();
  const [f, setF] = useState({
    first_name: "", last_name: "", national_id: "", sex: "male", date_of_birth: "",
    phone: "", district_id: "", polling_station_id: "", roll_position: "",
  });
  const [busy, setBusy] = useState(false);
  const stationsForDistrict = lookups.stations.filter((s) => !f.district_id || s.district_id === f.district_id);

  const gen = () => {
    const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `RW-${new Date().getFullYear()}-${rand.slice(0, 4)}-${rand.slice(4, 8)}`;
  };

  const submit = async () => {
    if (!f.first_name || !f.last_name || !f.national_id || !f.date_of_birth || !f.district_id || !f.polling_station_id) {
      toast.error("Fill all required fields"); return;
    }
    setBusy(true);
    try {
      const token = gen();
      const payload = {
        voter_token: token,
        registration_ref: `#${Math.floor(10000 + Math.random() * 89999)}`,
        national_id: f.national_id,
        first_name: f.first_name, last_name: f.last_name, sex: f.sex,
        date_of_birth: f.date_of_birth, phone: f.phone || null,
        district_id: f.district_id, polling_station_id: f.polling_station_id,
        roll_position: f.roll_position ? Number(f.roll_position) : null,
      };
      const v = await votersApi.create(payload);
      toast.success(`Registered ${fullName(v)} · ${v.voter_token}`);
      onAdded();
    } catch (e) { toast.error(e); } finally { setBusy(false); }
  };

  return (
    <Modal
      open size="lg" onClose={onClose} title="Register voter" subtitle="Adds a record to the certified roll"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" loading={busy} onClick={submit}>Register voter</Button></>}
    >
      <div className="sp-stack sp-gap-4">
        <div className="sp-grid sp-grid-2">
          <Input label="First name" required value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} />
          <Input label="Last name" required value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} />
        </div>
        <div className="sp-grid sp-grid-2">
          <Input label="National ID" required mono value={f.national_id} onChange={(e) => setF({ ...f, national_id: e.target.value })} hint="16 digits, as printed on the card" />
          <Select label="Sex" required value={f.sex} onChange={(e) => setF({ ...f, sex: e.target.value })} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
        </div>
        <div className="sp-grid sp-grid-2">
          <Input label="Date of birth" required type="date" value={f.date_of_birth} onChange={(e) => setF({ ...f, date_of_birth: e.target.value })} />
          <Input label="Phone" mono value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+2507…" />
        </div>
        <div className="sp-grid sp-grid-2">
          <Select label="District" required placeholder="Select district" value={f.district_id}
            onChange={(e) => setF({ ...f, district_id: e.target.value, polling_station_id: "" })}
            options={lookups.districts.map((d) => ({ value: d.id, label: `${d.name} · ${d.province}` }))} />
          <Select label="Polling station" required placeholder="Select station" value={f.polling_station_id}
            onChange={(e) => setF({ ...f, polling_station_id: e.target.value })}
            options={stationsForDistrict.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))} />
        </div>
      </div>
    </Modal>
  );
}

export default function Registry() {
  const toast = useToast();
  const lookups = useLookups();
  const fileRef = useRef(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [district, setDistrict] = useState("");
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { const t = setTimeout(() => { setDebounced(search); setPage(0); }, 350); return () => clearTimeout(t); }, [search]);

  const query = { skip: page * PAGE_SIZE, limit: PAGE_SIZE, search: debounced || undefined, status: status || undefined, district: district || undefined };
  const { data, error, loading, reload } = useApi(() => votersApi.list(query), [page, debounced, status, district]);
  const health = useApi(() => registry.health(), []);

  const items = listItems(data);
  const total = listTotal(data);

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await votersApi.importCsv(file);
      toast.success(`Import complete: ${res.added ?? 0} added · ${res.flagged ?? 0} flagged · ${res.rejected ?? 0} rejected`);
      reload();
    } catch (e2) { toast.error(e2); } finally { if (fileRef.current) fileRef.current.value = ""; }
  };
  const onExport = async () => { try { await votersApi.exportCsv("csv"); toast.success("Export downloaded"); } catch (e) { toast.error(e); } };

  const h = health.data || {};
  return (
    <>
      <PageHead title="Voter registry" sub={`Single source of truth · ${total.toLocaleString()} records`}>
        <Button size="sm" variant="secondary" iconLeft={<Upload size={15} />} onClick={() => fileRef.current?.click()}>Import CSV</Button>
        <Button size="sm" variant="secondary" iconLeft={<Download size={15} />} onClick={onExport}>Export</Button>
        <Button size="sm" variant="primary" iconLeft={<UserPlus size={15} />} onClick={() => setAdding(true)}>Register voter</Button>
        <input ref={fileRef} type="file" accept=".csv" hidden onChange={onImport} />
      </PageHead>

      <div className="sp-grid sp-grid-4" style={{ marginBottom: "var(--space-5)" }}>
        <StatCard label="Total voters" value={(h.total_voters ?? total).toLocaleString()} icon={<HeartPulse size={18} />} />
        <StatCard label="Registered" value={(h.registered ?? 0).toLocaleString()} accent="info" />
        <StatCard label="Voted" value={(h.voted ?? 0).toLocaleString()} accent="approved" />
        <StatCard label="Blocked / flagged" value={`${h.blocked ?? 0} / ${h.flagged ?? 0}`} accent="rejected" />
      </div>

      <div className="section">
        <div className="section__hd sp-wrap sp-gap-3">
          <div className="sp-row sp-gap-3 sp-wrap sp-grow">
            <div style={{ minWidth: 240, flex: 1 }}>
              <Input iconLeft={<Search size={16} />} placeholder="Search by name, token, NID…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              options={STATUSES.map((s) => ({ value: s, label: s ? s[0].toUpperCase() + s.slice(1) : "All statuses" }))} />
            <Select value={district} onChange={(e) => { setDistrict(e.target.value); setPage(0); }}
              options={[{ value: "", label: "All districts" }, ...lookups.districts.map((d) => ({ value: d.id, label: d.name }))]} />
          </div>
          <Button size="sm" variant="ghost" iconLeft={<RefreshCw size={15} />} onClick={reload}>Refresh</Button>
        </div>
        <div className="section__bd section__bd--flush">
          {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : items.length === 0 ? (
            <Empty title="No voters found" message="Try a different search or filter." />
          ) : (
            <div className="table-wrap">
              <table className="sp-table">
                <thead>
                  <tr><th>Voter</th><th>Token</th><th>National ID</th><th>District</th><th>Station</th><th>Status</th><th className="t-right">Quality</th></tr>
                </thead>
                <tbody>
                  {items.map((v) => (
                    <tr key={v.id} className="sp-row-click" onClick={() => setSelected(v.id)}>
                      <td><div style={{ fontWeight: 600, color: "var(--text-strong)" }}>{fullName(v)}</div><div className="t-xs t-muted">{v.registration_ref}</div></td>
                      <td className="t-mono t-sm">{v.voter_token}</td>
                      <td className="t-mono t-sm">{maskNid(v.national_id)}</td>
                      <td className="t-sm">{lookups.byDistrict[v.district_id]?.name || "—"}</td>
                      <td className="t-sm">{lookups.byStation[v.polling_station_id]?.code || "—"}</td>
                      <td><StatusBadge status={v.status} size="sm" /></td>
                      <td className="t-right t-mono t-sm">{v.data_quality_score ?? 0}</td>
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

      {adding && <AddVoterModal lookups={lookups} onClose={() => setAdding(false)} onAdded={() => { setAdding(false); reload(); health.reload(); }} />}
      {selected && (
        <VoterDetail
          voterId={selected}
          lookups={lookups}
          onClose={() => setSelected(null)}
          onChanged={() => { reload(); health.reload(); }}
        />
      )}
    </>
  );
}
