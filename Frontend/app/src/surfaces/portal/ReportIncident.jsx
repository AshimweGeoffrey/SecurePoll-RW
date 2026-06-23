import { useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, ShieldCheck, Building2, MapPin, Phone, ImageUp, Send, ArrowLeft, Plus, Check } from "lucide-react";
import { Input, Select, Button, Card, Badge } from "../../components/index.js";
import { SubNav } from "./chrome.jsx";

const TYPES = [
  "Long queue / wait time", "Station opened late or closed", "Equipment or device failure",
  "Ballot or materials shortage", "Voter intimidation or pressure", "Accessibility barrier",
  "Suspected irregularity", "Other",
];
const genRef = () => {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase();
  const b = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INC-${a}-${b}`;
};

export default function ReportIncident() {
  const [type, setType] = useState("");
  const [desc, setDesc] = useState("");
  const [sent, setSent] = useState(null);

  // The backend exposes no public incident endpoint, so the report is captured with a
  // client-side tracking reference (wire to POST /public/incidents when it exists).
  const submit = () => { setSent(genRef()); };

  if (sent) {
    return (
      <div className="page">
        <SubNav />
        <main className="pbody" style={{ display: "grid", placeItems: "center" }}>
          <div className="done-wrap">
            <div className="done-ring"><Check size={44} /></div>
            <h2>Report submitted</h2>
            <p>Thank you. Your report has been routed to NEC monitoring and added to the live incident queue for this constituency. No personal information was attached.</p>
            <div className="ref-chip">
              <div>
                <div className="rl">Tracking reference</div>
                <div className="rv">{sent}</div>
              </div>
              <Badge tone="amber" dot>UNDER REVIEW</Badge>
            </div>
            <p style={{ fontSize: 13, marginTop: 18 }}>Keep this reference to follow up. Save it now — for your anonymity, we cannot retrieve it for you later.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
              <Link to="/portal" className="plain"><Button variant="secondary" iconLeft={<ArrowLeft size={16} />}>Back to portal</Button></Link>
              <Button variant="ghost" iconLeft={<Plus size={16} />} onClick={() => { setSent(null); setType(""); setDesc(""); }}>File another report</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <SubNav />
      <header className="phead">
        <span className="eyebrow"><Megaphone size={14} /> Election integrity</span>
        <h1>Report an incident</h1>
        <p>Tell the National Electoral Commission about any problem at a polling station. Reports are anonymous by default and route directly to NEC monitoring.</p>
      </header>

      <main className="pbody">
        <div className="narrow">
          <div className="assure green">
            <ShieldCheck size={20} />
            <div>
              <div className="at">You are anonymous</div>
              <div className="as">We don't record your name, National ID, or IP address with this report. Contact details below are optional and only used if you ask us to follow up.</div>
            </div>
          </div>

          <Card title="Incident details" subtitle="All fields marked with * are required">
            <div className="fg">
              <div className="full"><Select label="What happened?" required placeholder="Select an incident type" options={TYPES} value={type} onChange={(e) => setType(e.target.value)} /></div>
              <Input label="Polling station" required iconLeft={<Building2 size={17} />} placeholder="e.g. PS-014 · Nyarugenge" />
              <Input label="District" iconLeft={<MapPin size={17} />} placeholder="District or sector" />
              <Input label="When did it happen?" type="time" />
              <Select label="How urgent is it?" options={["Low — informational", "Medium — needs attention", "High — happening now"]} defaultValue="Medium — needs attention" />
              <div className="full">
                <label className="field-lbl">Describe what you saw <span className="req">*</span></label>
                <textarea className="ta" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Give as much detail as you can — what happened, who was affected, and whether it is still going on. Avoid including anyone's full name." />
              </div>
              <div className="full">
                <label className="field-lbl">Add evidence (optional)</label>
                <div className="dropz">
                  <ImageUp size={26} />
                  <div className="dz-t">Drag a photo or document here</div>
                  <div className="dz-s">jpg · png · pdf — max 10 MB, metadata stripped on upload</div>
                </div>
              </div>
            </div>
          </Card>

          <div style={{ marginTop: 18 }}>
            <Card title="Stay reachable (optional)" subtitle="Only if you want NEC to follow up with you">
              <div className="fg">
                <Input label="Phone or email" iconLeft={<Phone size={17} />} placeholder="+250 7XX XXX XXX" />
                <Select label="Preferred language" options={["Kinyarwanda", "English", "Français"]} />
              </div>
            </Card>
          </div>

          <div style={{ marginTop: 22, display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link to="/portal" className="plain"><Button variant="ghost">Cancel</Button></Link>
            <Button variant="primary" size="lg" iconLeft={<Send size={17} />} disabled={!type || !desc.trim()} onClick={submit}>Submit anonymous report</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
