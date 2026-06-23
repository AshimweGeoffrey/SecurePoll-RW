import { useEffect, useState } from "react";
import { Cpu, Activity, RefreshCw, Database, SlidersHorizontal, Save, Stethoscope } from "lucide-react";
import { ai } from "../../../api/endpoints.js";
import { useApi } from "../../../lib/useApi.js";
import { useToast } from "../../../lib/toast.jsx";
import { fmtInt, fmtScore } from "../../../lib/format.js";
import {
  Button, Input, Badge, StatCard, Loading, ErrorState,
} from "../../../components/index.js";
import PageHead from "./PageHead.jsx";

function Panel({ title, sub, children, action }) {
  return (
    <div className="section">
      <div className="section__hd"><div><h3>{title}</h3>{sub && <div className="t-xs t-muted" style={{ marginTop: 2 }}>{sub}</div>}</div>{action}</div>
      <div className="section__bd">{children}</div>
    </div>
  );
}

export default function AiModels() {
  const toast = useToast();
  const status = useApi(() => ai.status(), []);
  const thr = useApi(() => ai.thresholds(), []);
  const [form, setForm] = useState({ face_match_threshold: "", review_floor: "", dedup_threshold: "" });
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (thr.data) setForm({
      face_match_threshold: thr.data.face_match_threshold ?? "",
      review_floor: thr.data.review_floor ?? "",
      dedup_threshold: thr.data.dedup_threshold ?? "",
    });
  }, [thr.data]);

  const s = status.data || {};

  const saveThresholds = async () => {
    setBusy("save");
    try {
      const payload = {
        face_match_threshold: Number(form.face_match_threshold),
        review_floor: Number(form.review_floor),
        dedup_threshold: Number(form.dedup_threshold),
      };
      await ai.setThresholds(payload);
      toast.success("Thresholds updated at runtime");
      status.reload(); thr.reload();
    } catch (e) { toast.error(e); } finally { setBusy(""); }
  };
  const rebuild = async () => {
    setBusy("rebuild");
    try { const r = await ai.rebuildIndex(); toast.success(`FAISS index rebuilt · ${fmtInt(r.templates_indexed ?? r.indexed ?? 0)} templates indexed`); status.reload(); }
    catch (e) { toast.error(e); } finally { setBusy(""); }
  };
  const healthcheck = async () => {
    setBusy("health");
    try { const r = await ai.healthcheck(); toast.success(r.status ? `Model healthy · ${r.status}` : "AI model responded"); status.reload(); }
    catch (e) { toast.error(e); } finally { setBusy(""); }
  };

  if (status.loading && !status.data) return <Loading label="Querying AI service…" />;
  if (status.error) return <ErrorState error={status.error} onRetry={status.reload} />;

  return (
    <>
      <PageHead title="AI & models" sub="Face recognition · liveness · 1:N dedup index">
        <Button size="sm" variant="secondary" iconLeft={<Stethoscope size={15} />} loading={busy === "health"} onClick={healthcheck}>Run healthcheck</Button>
        <Button size="sm" variant="ghost" iconLeft={<RefreshCw size={15} />} onClick={() => { status.reload(); thr.reload(); }}>Refresh</Button>
      </PageHead>

      <div className="sp-grid sp-grid-4" style={{ marginBottom: "var(--space-5)" }}>
        <StatCard label="Model" value={s.model_loaded ? "Loaded" : "Not loaded"} icon={<Cpu size={18} />} accent={s.model_loaded ? "approved" : "rejected"} sub={`backend: ${s.backend || "—"}`} />
        <StatCard label="FAISS index" value={fmtInt(s.faiss_index_size)} icon={<Database size={18} />} sub="vectors indexed" />
        <StatCard label="Match threshold" value={fmtScore(s.face_match_threshold)} accent="info" sub={`review floor ${fmtScore(s.review_floor)}`} />
        <StatCard label="Dedup threshold" value={fmtScore(s.dedup_threshold)} accent="review" />
      </div>

      <div className="sp-grid sp-grid-2" style={{ alignItems: "start" }}>
        <Panel title="Decision thresholds" sub="Tuned on the LFW cross-session benchmark · runtime-tunable" action={<SlidersHorizontal size={18} color="var(--text-muted)" />}>
          <div className="sp-stack sp-gap-4">
            <Input label="Face match threshold" mono type="number" step="0.01" min="0" max="1"
              value={form.face_match_threshold} onChange={(e) => setForm({ ...form, face_match_threshold: e.target.value })}
              hint="Cosine ≥ this ⇒ APPROVED" />
            <Input label="Review floor" mono type="number" step="0.01" min="0" max="1"
              value={form.review_floor} onChange={(e) => setForm({ ...form, review_floor: e.target.value })}
              hint="Between floor and match ⇒ MANUAL REVIEW" />
            <Input label="Dedup threshold" mono type="number" step="0.01" min="0" max="1"
              value={form.dedup_threshold} onChange={(e) => setForm({ ...form, dedup_threshold: e.target.value })}
              hint="1:N similarity ≥ this ⇒ fraud case" />
            <div><Button variant="primary" iconLeft={<Save size={15} />} loading={busy === "save"} onClick={saveThresholds}>Apply thresholds</Button></div>
          </div>
        </Panel>

        <Panel title="1:N deduplication index" sub="FAISS inner-product (cosine) index" action={<Database size={18} color="var(--text-muted)" />}>
          <div className="sp-stack sp-gap-4">
            <p className="t-sm t-muted" style={{ lineHeight: 1.6 }}>
              The index is reconstructed from the encrypted templates. Rebuild it if the index drifts out of
              sync with stored templates (the backend also auto-repairs on startup).
            </p>
            <dl className="sp-kv">
              <dt>Backend</dt><dd><Badge tone="blue" size="sm">{s.backend}</Badge></dd>
              <dt>Index path</dt><dd className="t-mono t-xs">{s.faiss_index_path}</dd>
              <dt>Vectors</dt><dd className="t-mono">{fmtInt(s.faiss_index_size)}</dd>
            </dl>
            <div><Button variant="secondary" iconLeft={<Activity size={15} />} loading={busy === "rebuild"} onClick={rebuild}>Rebuild index</Button></div>
          </div>
        </Panel>
      </div>
    </>
  );
}
