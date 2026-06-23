// ObserverDashboard.jsx — read-only aggregated transparency portal for accredited observers
const { useEffect: useEd } = React;
const OD = window.SecurePollRWDesignSystem_92875f;
const Iod = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lod() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

const DISTRICTS = [
  { n: "Gasabo", v: 71 }, { n: "Kicukiro", v: 68 }, { n: "Nyarugenge", v: 66 },
  { n: "Musanze", v: 61 }, { n: "Huye", v: 58 }, { n: "Rubavu", v: 55 },
  { n: "Rwamagana", v: 52 }, { n: "Burera", v: 48 },
];
const TRAIL = [
  { ic: "git-commit-horizontal", a: "Turnout aggregation committed", m: "National counter +12,480 · 14:00 snapshot", h: "a3f9c2…" },
  { ic: "badge-check", a: "Verification batch sealed", m: "PS-014 · 1,284 verifications · signed", h: "7c21be…" },
  { ic: "radio-tower", a: "Station status sync", m: "2,391 / 2,410 stations reporting", h: "0d44a1…" },
  { ic: "file-check-2", a: "Hourly audit export published", m: "06:00–14:00 · signed CSV + JWS", h: "f188e0…" },
];

function ObserverDashboard() {
  useEd(lod);
  return (
    <div className="obs">
      <header className="obs__top">
        <img src="../../assets/logo-wordmark.svg" alt="SecurePoll RW" />
        <span className="obs__ro"><Iod n="eye" /> Observer · read-only</span>
        <div className="end">
          <span className="obs__live"><span className="pulse"></span> Live · updated 14:41</span>
          <div className="obs__idw">
            <span className="obs__av">AM</span>
            <div><div className="obs__nm">Aline Mukamana</div><div className="obs__org">Transparency Int'l Rwanda</div></div>
          </div>
          <a href="observer-login.html" style={{ textDecoration: "none" }}><OD.Button size="sm" variant="ghost" iconLeft={<Iod n="log-out" />}>Sign out</OD.Button></a>
        </div>
      </header>

      <div className="obs__hd">
        <h1>Election transparency dashboard</h1>
        <p>A read-only, aggregated view of the live election. Every figure is anonymized and traceable to the public, tamper-evident audit chain. No individual voter records are accessible.</p>
      </div>

      <div className="obs__body">
        <div className="obs-kpis">
          <div className="obs-kpi"><div className="obs-kpi__l"><Iod n="users" /> National turnout</div><div className="obs-kpi__v">62.4<small>%</small></div><div className="obs-kpi__d"><Iod n="trending-up" /> +4.2% this hour</div></div>
          <div className="obs-kpi"><div className="obs-kpi__l"><Iod n="badge-check" /> Verified today</div><div className="obs-kpi__v">1.84<small>M</small></div><div className="obs-kpi__d"><Iod n="activity" /> 12.1k / min</div></div>
          <div className="obs-kpi"><div className="obs-kpi__l"><Iod n="radio-tower" /> Stations reporting</div><div className="obs-kpi__v">2,391<small>/ 2,410</small></div><div className="obs-kpi__d"><Iod n="check" /> 99.2% online</div></div>
          <div className="obs-kpi"><div className="obs-kpi__l"><Iod n="shield-check" /> Chain integrity</div><div className="obs-kpi__v">0<small>breaks</small></div><div className="obs-kpi__d"><Iod n="lock" /> 8.41M entries verified</div></div>
        </div>

        <div className="obs-grid">
          <div className="obs-panel">
            <div className="obs-panel__h">
              <div><div className="obs-panel__t">Turnout by district</div><div className="obs-panel__s">Top reporting districts · aggregated, anonymized</div></div>
              <OD.Badge tone="green" size="sm" dot>LIVE</OD.Badge>
            </div>
            <div className="obs-panel__b">
              <div className="obs-dist">
                {DISTRICTS.map((d) => (
                  <div className="obs-dist__row" key={d.n}>
                    <span className="obs-dist__n">{d.n}</span>
                    <span className="obs-dist__track"><span className="obs-dist__fill" style={{ width: d.v + "%" }}></span></span>
                    <span className="obs-dist__v">{d.v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="obs-panel">
            <div className="obs-panel__h">
              <div><div className="obs-panel__t">Station status</div><div className="obs-panel__s">All 2,410 polling stations</div></div>
            </div>
            <div className="obs-panel__b">
              <div className="obs-stat">
                <div className="obs-donut" style={{ background: "conic-gradient(var(--green-500) 0 99.2%, var(--amber-400) 99.2% 100%)" }}>
                  <div className="obs-donut__c"><div className="obs-donut__n">99.2%</div><div className="obs-donut__l">online</div></div>
                </div>
                <div className="obs-legend">
                  <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--green-500)" }}></span>Online &amp; reporting <b>2,391</b></div>
                  <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--amber-400)" }}></span>Syncing <b>19</b></div>
                  <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--slate-300)" }}></span>Not yet open <b>0</b></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="obs-grid">
          <div className="obs-panel">
            <div className="obs-panel__h">
              <div><div className="obs-panel__t">Public audit trail</div><div className="obs-panel__s">Aggregated events · hash-chained &amp; independently verifiable</div></div>
              <OD.Button size="sm" variant="secondary" iconLeft={<Iod n="download" />}>Export</OD.Button>
            </div>
            <div className="obs-panel__b">
              <div className="obs-trail">
                {TRAIL.map((t, i) => (
                  <div className="obs-trail__row" key={i}>
                    <span className="obs-trail__ic"><Iod n={t.ic} /></span>
                    <div className="obs-trail__tx"><div className="obs-trail__a">{t.a}</div><div className="obs-trail__m">{t.m}</div></div>
                    <span className="obs-trail__h">{t.h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="obs-panel">
            <div className="obs-panel__h">
              <div><div className="obs-panel__t">Authentication outcomes</div><div className="obs-panel__s">All verifications today</div></div>
            </div>
            <div className="obs-panel__b" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="obs-legend">
                <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--green-500)" }}></span>Auto-approved <b>93.0%</b></div>
                <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--amber-400)" }}></span>Manual review <b>5.5%</b></div>
                <div className="obs-legend__i"><span className="obs-legend__k" style={{ background: "var(--red-500)" }}></span>Rejected <b>1.5%</b></div>
              </div>
              <div className="obs-verify">
                <Iod n="shield-check" />
                <div><div className="t">Integrity verified at 14:41:30</div><div className="s">SHA-256 hash chain re-walked end to end · 8,412,556 entries · 0 breaks detected.</div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="obs-pageft">Observer access is read-only and logged to the audit chain. Figures are aggregated and anonymized under Law 058/2021. Accredited under the NEC Observer Framework.</div>
      </div>
    </div>
  );
}
window.ObserverDashboard = ObserverDashboard;
