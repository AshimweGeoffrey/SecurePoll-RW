// ReportIncident.jsx — anonymous polling-station incident report
const { useState: useSr, useEffect: useEr } = React;
const RI = window.SecurePollRWDesignSystem_92875f;
const Iri = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lri() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

const TYPES = [
  "Long queue / wait time", "Station opened late or closed", "Equipment or device failure",
  "Ballot or materials shortage", "Voter intimidation or pressure", "Accessibility barrier",
  "Suspected irregularity", "Other"
];

function ReportIncident() {
  const [sent, setSent] = useSr(false);
  useEr(lri, [sent]);

  if (sent) {
    return (
      <div className="page">
        <Nav />
        <main className="pbody" style={{ display: "grid", placeItems: "center" }}>
          <div className="done-wrap">
            <div className="done-ring"><Iri n="check" /></div>
            <h2>Report submitted</h2>
            <p>Thank you. Your report has been routed to NEC monitoring and added to the live incident queue for this constituency. No personal information was attached.</p>
            <div className="ref-chip">
              <div>
                <div className="rl">Tracking reference</div>
                <div className="rv">INC-7K42-9PQX</div>
              </div>
              <RI.Badge tone="amber" dot>UNDER REVIEW</RI.Badge>
            </div>
            <p style={{ fontSize: 13, marginTop: 18 }}>Keep this reference to follow up. Save it now — for your anonymity, we cannot retrieve it for you later.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
              <a className="plain" href="index.html"><RI.Button variant="secondary" iconLeft={<Iri n="arrow-left" />}>Back to portal</RI.Button></a>
              <RI.Button variant="ghost" iconLeft={<Iri n="plus" />} onClick={() => setSent(false)}>File another report</RI.Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Nav />
      <header className="phead">
        <span className="eyebrow"><Iri n="megaphone" s={{ width: 14, height: 14 }} /> Election integrity</span>
        <h1>Report an incident</h1>
        <p>Tell the National Electoral Commission about any problem at a polling station. Reports are anonymous by default and route directly to NEC monitoring.</p>
      </header>

      <main className="pbody">
        <div className="narrow">
          <div className="assure green">
            <Iri n="shield-check" />
            <div>
              <div className="at">You are anonymous</div>
              <div className="as">We don't record your name, National ID, or IP address with this report. Contact details below are optional and only used if you ask us to follow up.</div>
            </div>
          </div>

          <RI.Card title="Incident details" subtitle="All fields marked with * are required">
            <div className="fg">
              <div className="full"><RI.Select label="What happened?" required placeholder="Select an incident type" options={TYPES} /></div>
              <RI.Input label="Polling station" required iconLeft={<Iri n="building-2" />} placeholder="e.g. PS-014 · Nyarugenge" defaultValue="PS-014 · Nyarugenge" />
              <RI.Input label="District" iconLeft={<Iri n="map-pin" />} placeholder="District or sector" defaultValue="Nyarugenge" />
              <RI.Input label="When did it happen?" type="time" defaultValue="11:20" />
              <RI.Select label="How urgent is it?" options={["Low — informational", "Medium — needs attention", "High — happening now"]} defaultValue="Medium — needs attention" />
              <div className="full">
                <label className="field-lbl">Describe what you saw <span className="req">*</span></label>
                <textarea className="ta" placeholder="Give as much detail as you can — what happened, who was affected, and whether it is still going on. Avoid including anyone's full name."></textarea>
              </div>
              <div className="full">
                <label className="field-lbl">Add evidence (optional)</label>
                <div className="dropz">
                  <Iri n="image-up" />
                  <div className="dz-t">Drag a photo or document here</div>
                  <div className="dz-s">jpg · png · pdf — max 10 MB, metadata stripped on upload</div>
                </div>
              </div>
            </div>
          </RI.Card>

          <div style={{ marginTop: 18 }}>
            <RI.Card title="Stay reachable (optional)" subtitle="Only if you want NEC to follow up with you">
              <div className="fg">
                <RI.Input label="Phone or email" iconLeft={<Iri n="phone" />} placeholder="+250 7XX XXX XXX" />
                <RI.Select label="Preferred language" options={["Kinyarwanda", "English", "Français"]} />
              </div>
            </RI.Card>
          </div>

          <div style={{ marginTop: 22, display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <a className="plain" href="index.html"><RI.Button variant="ghost">Cancel</RI.Button></a>
            <RI.Button variant="primary" size="lg" iconLeft={<Iri n="send" />} onClick={() => setSent(true)}>Submit anonymous report</RI.Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Nav() {
  useEr(lri);
  return (
    <nav className="snav">
      <img src="../../assets/logo-wordmark.svg" alt="SecurePoll RW" />
      <a className="back" href="index.html"><Iri n="arrow-left" /> Back to portal</a>
      <div className="end">
        <span className="lang"><Iri n="globe" /> EN / KIN / FR</span>
        <a className="plain" href="observer-login.html"><RI.Button size="sm" variant="secondary" iconLeft={<Iri n="eye" />}>Observer login</RI.Button></a>
      </div>
    </nav>
  );
}
window.ReportIncident = ReportIncident;
