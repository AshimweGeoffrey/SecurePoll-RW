// FieldApp.jsx — mobile field-officer operations app (inside Android bezel)
const { useState: useFa, useEffect: useFaE } = React;
const FA = window.SecurePollRWDesignSystem_92875f;
const Ifa = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lfa() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

const PERF = [
  { d: "M", v: 38 }, { d: "T", v: 44 }, { d: "W", v: 41 }, { d: "T", v: 52 }, { d: "F", v: 47, today: true }, { d: "S", v: 0 }, { d: "S", v: 0 },
];
const RECENT = [
  { in: "CI", n: "Chantal Ingabire", m: "RW-2026-9F44 · 14:38 · GPS ✓" },
  { in: "JN", n: "Jean Niyonzima", m: "RW-2026-9F41 · 14:21 · GPS ✓" },
  { in: "AM", n: "Alice Mukamana", m: "RW-2026-9F38 · 14:05 · GPS ✓" },
];

function FieldHome() {
  useFaE(lfa);
  const max = 56;
  return (
    <div className="fm">
      <div className="fm__hd">
        <div className="fm__hr">
          <span className="fm__av">88</span>
          <div className="fm__who"><div className="nm">D. Habimana</div><div className="tm">Officer #88 · Kicukiro team</div></div>
          <span className="fm__bell"><Ifa n="bell" /><span className="dot"></span></span>
        </div>
        <div className="fm__sync">
          <Ifa n="upload-cloud" /><span><b>23 records</b> queued to sync</span>
          <span className="off"><Ifa n="cloud-off" /> Offline</span>
        </div>
      </div>

      <div className="fm__body">
        <div className="fm-sec">Today</div>
        <div className="fm-stats">
          <div className="fm-stat">
            <span className="fm-stat__ic" style={{ background: "var(--primary-soft)", color: "var(--primary-text)" }}><Ifa n="user-plus" /></span>
            <div className="fm-stat__v">47</div><div className="fm-stat__l">Registrations</div>
          </div>
          <div className="fm-stat">
            <span className="fm-stat__ic" style={{ background: "var(--status-review-soft)", color: "var(--status-review-text)" }}><Ifa n="copy-x" /></span>
            <div className="fm-stat__v">2</div><div className="fm-stat__l">Duplicates caught</div>
          </div>
          <div className="fm-stat">
            <span className="fm-stat__ic" style={{ background: "var(--secondary-soft)", color: "var(--secondary-text)" }}><Ifa n="timer" /></span>
            <div className="fm-stat__v">3:12</div><div className="fm-stat__l">Avg. capture time</div>
          </div>
          <div className="fm-stat">
            <span className="fm-stat__ic" style={{ background: "var(--status-approved-soft)", color: "var(--status-approved-text)" }}><Ifa n="scan-face" /></span>
            <div className="fm-stat__v">98%</div><div className="fm-stat__l">Biometric quality</div>
          </div>
        </div>

        <div className="fm-sec">Location</div>
        <div className="fm-card">
          <div className="fm-card__h"><Ifa n="map-pin" s={{ width: 17, height: 17, color: "var(--primary-text)" }} /><span className="t">GPS tagging</span><span className="badge"><FA.Badge tone="green" size="sm" dot>LOCKED</FA.Badge></span></div>
          <div className="fm-map">
            <div className="fm-map__grid"></div>
            <div className="fm-map__road" style={{ left: 0, right: 0, top: "58%", height: 7 }}></div>
            <div className="fm-map__road" style={{ top: 0, bottom: 0, left: "44%", width: 7 }}></div>
            <div className="fm-map__ring"></div>
            <div className="fm-map__pin"><div className="p"></div></div>
            <div className="fm-map__coord">-1.9874, 30.0913 · ±4m</div>
          </div>
          <div className="fm-geo-meta"><Ifa n="navigation" /> Niboye cell, Kicukiro · 12 registrations tagged at this site today</div>
        </div>

        <div className="fm-sec">Last duplicate check</div>
        <div className="fm-card">
          <div className="fm-dup">
            <span className="fm-dup__ring"><Ifa n="shield-check" /></span>
            <div><div className="fm-dup__t">No duplicate found</div><div className="fm-dup__s">1:N scan vs 8.42M templates · top match 0.31, well below the 0.85 threshold</div></div>
          </div>
          <div className="fm-dup__meter"><i style={{ width: "31%" }}></i><span className="thr" style={{ left: "85%" }}></span></div>
          <div className="fm-dup__scale"><span>0.00</span><span>threshold 0.85</span><span>1.00</span></div>
        </div>

        <div className="fm-sec">Your performance · this week</div>
        <div className="fm-card">
          <div className="fm-perf__top">
            <span className="fm-perf__big">222</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>registrations</span>
            <span className="fm-perf__rank"><Ifa n="trophy" s={{ width: 12, height: 12, display: "inline", verticalAlign: "-1px", marginRight: 3 }} />#2 in district</span>
          </div>
          <div className="fm-perf__bars">
            {PERF.map((p, i) => (
              <div className="fm-perf__col" key={i}>
                <div className={"fm-perf__bar " + (p.today ? "today" : p.v ? "on" : "")} style={{ height: Math.max(p.v / max * 60, 3) + "px" }}></div>
                <span className="fm-perf__d">{p.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fm-sec">Recent registrations</div>
        <div className="fm-card">
          {RECENT.map((r, i) => (
            <div className="fm-rec" key={i}>
              <span className="fm-rec__av">{r.in}</span>
              <div className="fm-rec__tx"><div className="fm-rec__n">{r.n}</div><div className="fm-rec__m">{r.m}</div></div>
              <FA.Badge tone="green" size="sm" dot>SYNCED</FA.Badge>
            </div>
          ))}
        </div>

        <div className="fm-cta">
          <a href="../registration/index.html" style={{ textDecoration: "none", display: "block" }}>
            <FA.Button variant="primary" size="lg" fullWidth iconLeft={<Ifa n="user-plus" />}>New registration</FA.Button>
          </a>
        </div>
      </div>

      <div className="fm__tabs">
        <button className="fm-tab on"><Ifa n="house" /><span>Home</span></button>
        <button className="fm-tab"><Ifa n="map" /><span>Map</span></button>
        <button className="fm-tab fab"><span className="b"><Ifa n="user-plus" /></span></button>
        <button className="fm-tab"><Ifa n="refresh-cw" /><span>Sync</span></button>
        <button className="fm-tab"><Ifa n="user" /><span>Profile</span></button>
      </div>
    </div>
  );
}

function FieldApp() {
  useFaE(lfa);
  return (
    <div className="fm-page">
      <AndroidDevice width={412} height={892}>
        <FieldHome />
      </AndroidDevice>
    </div>
  );
}
window.FieldApp = FieldApp;
