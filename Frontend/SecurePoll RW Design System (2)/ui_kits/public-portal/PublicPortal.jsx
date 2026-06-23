// PublicPortal.jsx — read-only public-facing portal
const { useState: useStateP, useEffect: useEffectP } = React;
const P = window.SecurePollRWDesignSystem_92875f;
const Ip = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lucideP() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

function StatusLookup() {
  const [done, setDone] = useStateP(false);
  useEffectP(lucideP, [done]);
  return (
    <div>
      <div className="lookup">
        <div className="f"><P.Input label="Check your registration status" mono iconLeft={<Ip n="id-card" />} placeholder="Enter your National ID" defaultValue="1 1994 7 0098765 4 32" /></div>
        <P.Button variant="primary" size="lg" iconLeft={<Ip n="search" />} onClick={() => setDone(true)}>Check status</P.Button>
      </div>
      {done && (
        <div className="lookup-result">
          <P.Card accent="green" elevation="raised"
            title="You're registered to vote"
            subtitle="National ID ending · 4 32"
            headerEnd={<P.Badge tone="green" dot>REGISTERED</P.Badge>}>
            <div style={{ display: "flex", gap: 28, fontSize: 14, color: "var(--text-default)" }}>
              <div><div style={{ color: "var(--text-muted)", fontSize: 12 }}>Polling station</div><b>PS-014 · Nyarugenge</b></div>
              <div><div style={{ color: "var(--text-muted)", fontSize: 12 }}>Constituency</div><b>Nyarugenge</b></div>
              <div><div style={{ color: "var(--text-muted)", fontSize: 12 }}>Status</div><b>Not yet voted</b></div>
            </div>
          </P.Card>
        </div>
      )}
    </div>
  );
}

function PublicPortal() {
  useEffectP(lucideP);
  return (
    <div className="pub">
      <nav className="pub__nav">
        <img src="../../assets/logo-wordmark.svg" alt="SecurePoll RW" style={{ height: 30 }} />
        <div className="links">
          <a href="check-status.html">Check status</a><a href="report-incident.html">Report an incident</a>
        </div>
        <div className="end">
          <span className="lang"><Ip n="globe" /> EN / KIN / FR</span>
          <a href="../admin-audit/admin-login.html" style={{ textDecoration: "none" }}><P.Button size="sm" variant="ghost" iconLeft={<Ip n="lock" />}>Admin login</P.Button></a>
          <a href="observer-login.html" style={{ textDecoration: "none" }}><P.Button size="sm" variant="secondary" iconLeft={<Ip n="eye" />}>Observer login</P.Button></a>
        </div>
      </nav>

      <header className="hero">
        <div className="hero__in">
          <span className="eyebrow"><Ip n="shield-check" s={{ width: 14, height: 14 }} /> National Electoral Commission · Rwanda</span>
          <h1>A transparent, verifiable election — open to every citizen.</h1>
          <p>Check your registration, find your polling station, and follow turnout as it happens. All figures are aggregated and anonymized.</p>
          <StatusLookup />
        </div>
      </header>

      <section className="band-stats">
        <div className="sect-t">Live turnout</div>
        <div className="sect-s">Aggregated nationwide · updates every 30 seconds · no individual data shown</div>
        <div className="stat-grid">
          <div className="stat"><div className="sv">62.4%</div><div className="sl">National turnout</div><div className="sd"><Ip n="trending-up" /> +4.2% this hour</div></div>
          <div className="stat"><div className="sv">1.84M</div><div className="sl">Voters verified today</div><div className="sd"><Ip n="check" /> across 2,410 stations</div></div>
          <div className="stat"><div className="sv">2,391</div><div className="sl">Stations reporting</div><div className="sd"><Ip n="radio-tower" /> 99.2% online</div></div>
          <div className="stat"><div className="sv">11:42</div><div className="sl">Last updated</div><div className="sd"><Ip n="clock" /> live feed</div></div>
        </div>
      </section>

      <section className="feat">
        <div className="feat-card">
          <div className="fi"><Ip n="map-pin" /></div>
          <h3>Find your polling station</h3>
          <p>Look up where to vote by National ID or district. Stations open 06:00–18:00.</p>
          <div className="map">
            <div className="map-grid"></div>
            <div className="map-pin" style={{ top: "40%", left: "30%" }}></div>
            <div className="map-pin" style={{ top: "60%", left: "55%" }}></div>
            <div className="map-pin" style={{ top: "30%", left: "70%" }}></div>
          </div>
        </div>
        <div className="feat-card">
          <div className="fi"><Ip n="megaphone" /></div>
          <h3>Report an incident</h3>
          <p>Submit an anonymous report about any issue at a polling station. Reports route directly to NEC monitoring.</p>
          <div style={{ marginTop: 4 }}>
            <div className="station-row"><div className="si"><Ip n="building-2" /></div><div><div className="sn">PS-014 · Nyarugenge</div><div className="sm">1.2 km away · open · ~12 min wait</div></div><span className="se"><P.Badge tone="green" size="sm" dot>Open</P.Badge></span></div>
            <div className="station-row"><div className="si"><Ip n="building-2" /></div><div><div className="sn">PS-021 · Nyamirambo</div><div className="sm">2.8 km away · open · ~25 min wait</div></div><span className="se"><P.Badge tone="amber" size="sm" dot>Busy</P.Badge></span></div>
            <div style={{ marginTop: 14 }}><a href="report-incident.html" style={{ textDecoration: "none", display: "block" }}><P.Button variant="secondary" fullWidth iconLeft={<Ip n="megaphone" />}>Submit anonymous report</P.Button></a></div>
          </div>
        </div>
      </section>

      <footer className="pub__foot">
        <div className="ft"><img src="../../assets/logo-wordmark-dark.svg" alt="SecurePoll RW" /></div>
        <div className="fl"><a href="check-status.html">Check status</a><a href="report-incident.html">Report an incident</a><a href="observer-login.html">Observer login</a><a href="../admin-audit/admin-login.html">Admin login</a><a>Data protection (Law 058/2021)</a></div>
        <div className="fc">© 2026 National Electoral Commission of Rwanda. Public data is aggregated and anonymized. This portal has no access to individual voter records or biometric data.</div>
      </footer>
    </div>
  );
}
window.PublicPortal = PublicPortal;
