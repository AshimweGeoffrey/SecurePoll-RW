// FraudWidgets.jsx — geographic fraud heatmap + biometric voter-photo scan
// Shared by the Fraud detection and Reporting views.
const { useEffect: useEffectFW, useState: useStateFW } = React;
const Ifw = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lucideFW() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

/* Rwanda's 30 districts at their true geographic centroids [lon, lat].
   cases = open fraud cases; k = intensity level (0 none → 5 critical). */
const DISTRICTS = [
  // Kigali City
  { n: "Nyarugenge", lon: 30.06, lat: -1.95, cases: 6 },
  { n: "Gasabo",     lon: 30.10, lat: -1.90, cases: 9 },
  { n: "Kicukiro",   lon: 30.10, lat: -1.97, cases: 7 },
  // Northern
  { n: "Musanze",    lon: 29.63, lat: -1.50, cases: 2 },
  { n: "Burera",     lon: 29.86, lat: -1.47, cases: 0 },
  { n: "Gakenke",    lon: 29.78, lat: -1.68, cases: 1 },
  { n: "Rulindo",    lon: 30.06, lat: -1.77, cases: 0 },
  { n: "Gicumbi",    lon: 30.10, lat: -1.58, cases: 3 },
  // Southern
  { n: "Muhanga",    lon: 29.75, lat: -2.08, cases: 2 },
  { n: "Kamonyi",    lon: 29.90, lat: -2.00, cases: 1 },
  { n: "Ruhango",    lon: 29.78, lat: -2.23, cases: 1 },
  { n: "Nyanza",     lon: 29.75, lat: -2.35, cases: 2 },
  { n: "Huye",       lon: 29.74, lat: -2.53, cases: 3 },
  { n: "Gisagara",   lon: 29.83, lat: -2.60, cases: 1 },
  { n: "Nyaruguru",  lon: 29.55, lat: -2.66, cases: 0 },
  { n: "Nyamagabe",  lon: 29.40, lat: -2.40, cases: 1 },
  // Western
  { n: "Rubavu",     lon: 29.36, lat: -1.68, cases: 5 },
  { n: "Nyabihu",    lon: 29.50, lat: -1.65, cases: 2 },
  { n: "Ngororero",  lon: 29.52, lat: -1.87, cases: 1 },
  { n: "Rutsiro",    lon: 29.37, lat: -1.93, cases: 1 },
  { n: "Karongi",    lon: 29.38, lat: -2.06, cases: 0 },
  { n: "Nyamasheke", lon: 29.14, lat: -2.35, cases: 1 },
  { n: "Rusizi",     lon: 28.96, lat: -2.48, cases: 0 },
  // Eastern
  { n: "Nyagatare",  lon: 30.33, lat: -1.30, cases: 2 },
  { n: "Gatsibo",    lon: 30.43, lat: -1.58, cases: 3 },
  { n: "Kayonza",    lon: 30.62, lat: -1.88, cases: 1 },
  { n: "Rwamagana",  lon: 30.43, lat: -1.95, cases: 3 },
  { n: "Ngoma",      lon: 30.55, lat: -2.16, cases: 1 },
  { n: "Kirehe",     lon: 30.71, lat: -2.22, cases: 0 },
  { n: "Bugesera",   lon: 30.18, lat: -2.30, cases: 4 },
];
DISTRICTS.forEach((d) => { d.k = d.cases === 0 ? 0 : d.cases <= 1 ? 1 : d.cases <= 2 ? 2 : d.cases <= 3 ? 3 : d.cases <= 5 ? 4 : 5; });

/* Rwanda national border — real waypoints [lon, lat], clockwise from the north. */
const BORDER = [
  [29.55, -1.08], [29.80, -1.06], [30.00, -1.13], [30.22, -1.07], [30.35, -1.13],
  [30.42, -1.06], [30.48, -1.13], [30.60, -1.35], [30.71, -1.40], [30.83, -1.75],
  [30.88, -2.04], [30.86, -2.31], [30.70, -2.37], [30.53, -2.40], [30.46, -2.60],
  [30.34, -2.55], [30.10, -2.43], [29.98, -2.62], [29.91, -2.80], [29.76, -2.81],
  [29.63, -2.75], [29.40, -2.82], [29.22, -2.75], [29.02, -2.72], [28.91, -2.55],
  [28.96, -2.38], [29.11, -2.32], [29.16, -2.16], [29.27, -2.03], [29.21, -1.86],
  [29.25, -1.70], [29.36, -1.59], [29.45, -1.50], [29.53, -1.40], [29.49, -1.25],
];

// 0 none → 5 critical
const RAMP = [
  { bg: "var(--bg-inset)",  fg: "var(--text-subtle)", lbl: "None" },
  { bg: "var(--amber-200)", fg: "var(--amber-700)",   lbl: "Low" },
  { bg: "var(--amber-400)", fg: "var(--slate-900)",   lbl: "Moderate" },
  { bg: "var(--red-400)",   fg: "#fff",               lbl: "Elevated" },
  { bg: "var(--red-500)",   fg: "#fff",               lbl: "High" },
  { bg: "var(--red-600)",   fg: "#fff",               lbl: "Critical" },
];
const GLOW = ["", "var(--amber-300)", "var(--amber-400)", "var(--red-400)", "var(--red-500)", "var(--red-600)"];

// equirectangular projection into the viewBox
const MAP_W = 440, MAP_H = 400;
const LON_MIN = 28.86, LON_RANGE = 2.06, LAT_TOP = -1.02, LAT_RANGE = 1.86;
const px = (lon) => +(((lon - LON_MIN) / LON_RANGE) * MAP_W).toFixed(1);
const py = (lat) => +(((LAT_TOP - lat) / LAT_RANGE) * MAP_H).toFixed(1);
const BORDER_PATH = BORDER.map((p, i) => (i ? "L" : "M") + px(p[0]) + " " + py(p[1])).join(" ") + " Z";

/* ---- Voronoi tessellation: divide the territory into 30 district regions ----
   Each district's cell = the national polygon clipped by the perpendicular
   bisector half-plane against every other district centroid (Sutherland-Hodgman). */
const BORDER_PTS = BORDER.map((p) => ({ x: px(p[0]), y: py(p[1]) }));
const SITES = DISTRICTS.map((d) => ({ x: px(d.lon), y: py(d.lat) }));

function clipHalfPlane(poly, s, t) {
  const dx = t.x - s.x, dy = t.y - s.y;
  const c = (t.x * t.x + t.y * t.y - s.x * s.x - s.y * s.y) / 2; // inside: p·(t-s) <= c
  const f = (p) => p.x * dx + p.y * dy - c;
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const A = poly[i], B = poly[(i + 1) % poly.length];
    const fa = f(A), fb = f(B);
    if (fa <= 0) out.push(A);
    if ((fa <= 0) !== (fb <= 0)) {
      const tt = fa / (fa - fb);
      out.push({ x: A.x + tt * (B.x - A.x), y: A.y + tt * (B.y - A.y) });
    }
  }
  return out;
}
function voronoiCell(i) {
  let poly = BORDER_PTS;
  for (let j = 0; j < SITES.length; j++) {
    if (j === i) continue;
    poly = clipHalfPlane(poly, SITES[i], SITES[j]);
    if (poly.length < 3) break;
  }
  return poly;
}
const polyToPath = (poly) => poly.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ") + " Z";
const CELLS = DISTRICTS.map((d, i) => ({ d, path: polyToPath(voronoiCell(i)) }));

/* ---- Real district boundaries from geoBoundaries (gbOpen ADM2, CC-BY / GADM-class open data) ----
   Fetched once at runtime from GitHub raw (CORS-enabled), projected, then cached in
   localStorage. If the network is unavailable we fall back to the Voronoi tessellation. */
const ADM2_URLS = [
  "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/RWA/ADM2/geoBoundaries-RWA-ADM2_simplified.geojson",
  "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/RWA/ADM2/geoBoundaries-RWA-ADM2.geojson",
];
const GEO_CACHE_KEY = "rw_adm2_geo_v1";
const CASE_BY = {};
DISTRICTS.forEach((d) => { CASE_BY[d.n.toLowerCase()] = d; });
const PROVINCE = {
  Nyarugenge: "Kigali City", Gasabo: "Kigali City", Kicukiro: "Kigali City",
  Musanze: "Northern Province", Burera: "Northern Province", Gakenke: "Northern Province", Rulindo: "Northern Province", Gicumbi: "Northern Province",
  Muhanga: "Southern Province", Kamonyi: "Southern Province", Ruhango: "Southern Province", Nyanza: "Southern Province", Huye: "Southern Province", Gisagara: "Southern Province", Nyaruguru: "Southern Province", Nyamagabe: "Southern Province",
  Rubavu: "Western Province", Nyabihu: "Western Province", Ngororero: "Western Province", Rutsiro: "Western Province", Karongi: "Western Province", Nyamasheke: "Western Province", Rusizi: "Western Province",
  Nyagatare: "Eastern Province", Gatsibo: "Eastern Province", Kayonza: "Eastern Province", Rwamagana: "Eastern Province", Ngoma: "Eastern Province", Kirehe: "Eastern Province", Bugesera: "Eastern Province",
};
const RANKED = [...DISTRICTS].sort((a, b) => b.cases - a.cases);

function makeProject(bbox, pad) {
  const [minX, minY, maxX, maxY] = bbox;
  const s = Math.min((MAP_W - 2 * pad) / (maxX - minX), (MAP_H - 2 * pad) / (maxY - minY));
  const ox = (MAP_W - s * (maxX - minX)) / 2, oy = (MAP_H - s * (maxY - minY)) / 2;
  return (lon, lat) => [ox + (lon - minX) * s, oy + (maxY - lat) * s];
}

function useRwandaGeo() {
  const [geo, setGeo] = useStateFW(null);
  useEffectFW(() => {
    try { const c = localStorage.getItem(GEO_CACHE_KEY); if (c) { setGeo(JSON.parse(c)); return; } } catch (e) {}
    let alive = true;
    (async () => {
      for (const url of ADM2_URLS) {
        try {
          const r = await fetch(url);
          if (!r.ok) continue;
          const json = await r.json();
          const features = (json.features || []).map((f) => {
            const g = f.geometry || {};
            const polys = g.type === "MultiPolygon" ? g.coordinates : g.type === "Polygon" ? [g.coordinates] : [];
            const rings = polys.map((p) => p[0].map((pt) => [+pt[0].toFixed(4), +pt[1].toFixed(4)]));
            const props = f.properties || {};
            return { name: props.shapeName || props.ADM2_EN || props.NAME_2 || "", rings };
          }).filter((f) => f.rings.length);
          if (features.length < 10) continue;
          let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
          features.forEach((f) => f.rings.forEach((ring) => ring.forEach(([x, y]) => {
            if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
          })));
          const data = { features, bbox: [minX, minY, maxX, maxY] };
          if (!alive) return;
          try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(data)); } catch (e) {}
          setGeo(data);
          return;
        } catch (e) { /* try next url */ }
      }
    })();
    return () => { alive = false; };
  }, []);
  return geo;
}

function FraudHeatmap({ compact }) {
  useEffectFW(lucideFW);
  const geo = useRwandaGeo();
  const total = DISTRICTS.reduce((a, d) => a + d.cases, 0);
  const top = RANKED.slice(0, 5);
  const [hover, setHover] = useStateFW(null);   // { name, x, y }
  const [sel, setSel] = useStateFW(null);        // district name
  const wrapRef = React.useRef(null);
  const ANCHORS = [
    { n: "Kigali", lon: 30.09, lat: -1.89, hot: true },
    { n: "Rubavu", lon: 29.36, lat: -1.68, hot: true },
    { n: "Bugesera", lon: 30.18, lat: -2.34, hot: false },
    { n: "Musanze", lon: 29.63, lat: -1.47, hot: false },
    { n: "Huye", lon: 29.74, lat: -2.57, hot: false },
  ];
  const proj = geo ? makeProject(geo.bbox, 8) : (lon, lat) => [px(lon), py(lat)];
  const dataFor = (name) => CASE_BY[(name || "").toLowerCase()];

  const onMove = (name, e) => {
    const r = wrapRef.current && wrapRef.current.getBoundingClientRect();
    if (!r) return;
    setHover({ name, x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const selData = sel ? dataFor(sel) : null;
  const hoverData = hover ? dataFor(hover.name) : null;

  const handlers = (name) => ({
    style: { cursor: "pointer", transition: "opacity .15s ease" },
    onMouseMove: (e) => onMove(name, e),
    onMouseEnter: (e) => onMove(name, e),
    onMouseLeave: () => setHover(null),
    onClick: () => setSel((s) => (s === name ? null : name)),
  });
  const opacityFor = (name) => (sel && sel !== name && (!hover || hover.name !== name) ? 0.45 : 1);
  const strokeFor = (name) => (sel === name ? "var(--slate-900)" : "#fff");
  const strokeWFor = (name) => (sel === name ? 2.2 : hover && hover.name === name ? 1.6 : 0.7);

  return (
    <div className={"heat" + (compact ? " heat--compact" : "")}>
      <div className="heat__map" ref={wrapRef} style={{ position: "relative" }} onMouseLeave={() => setHover(null)}>
        <svg className="heat-svg" viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="Interactive geographic heatmap of fraud cases across Rwanda's 30 districts">
          {geo ? (
            geo.features.map((f) => {
              const cd = dataFor(f.name);
              const k = cd ? cd.k : 0;
              const d = f.rings.map((ring) => ring.map((pt, i) => { const [x, y] = proj(pt[0], pt[1]); return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }).join(" ") + " Z").join(" ");
              return (
                <path key={f.name} d={d} fill={RAMP[k].bg} stroke={strokeFor(f.name)} strokeWidth={strokeWFor(f.name)} strokeLinejoin="round" opacity={opacityFor(f.name)} {...handlers(f.name)} />
              );
            })
          ) : (
            <React.Fragment>
              {CELLS.map(({ d, path }) => (
                <path key={d.n} d={path} fill={RAMP[d.k].bg} stroke={strokeFor(d.n)} strokeWidth={strokeWFor(d.n)} strokeLinejoin="round" opacity={opacityFor(d.n)} {...handlers(d.n)} />
              ))}
              <path d={BORDER_PATH} fill="none" stroke="var(--slate-500)" strokeWidth="1.6" strokeLinejoin="round" style={{ pointerEvents: "none" }} />
            </React.Fragment>
          )}
          {/* district centroids */}
          {DISTRICTS.map((d) => { const [x, y] = proj(d.lon, d.lat); return <circle key={d.n} cx={x} cy={y} r={sel === d.n ? 2.6 : 1.5} fill={sel === d.n ? "var(--slate-900)" : d.k >= 3 ? "rgba(255,255,255,.85)" : "var(--text-muted)"} style={{ pointerEvents: "none" }} />; })}
          {/* sparse orientation labels */}
          {ANCHORS.map((a) => { const [x, y] = proj(a.lon, a.lat); return <text key={a.n} x={x} y={y - 8} textAnchor="middle" className={"heat-lbl" + (a.hot ? " hot" : "")} style={{ pointerEvents: "none" }}>{a.n}</text>; })}
        </svg>

        {hover && hoverData && (
          <div className="heat-tip" style={{ left: hover.x, top: hover.y }}>
            <div className="heat-tip__n">{hover.name}</div>
            <div className="heat-tip__p">{PROVINCE[hover.name] || "Rwanda"}</div>
            <div className="heat-tip__r"><span className="heat-tip__sw" style={{ background: RAMP[hoverData.k].bg }}></span>{hoverData.cases} case{hoverData.cases === 1 ? "" : "s"} · {RAMP[hoverData.k].lbl}</div>
          </div>
        )}

        <div className="heat__legend">
          <span className="hl-cap">Fewer</span>
          {RAMP.map((t, i) => <span key={i} className="hl-sw" style={{ background: t.bg, borderColor: i === 0 ? "var(--border-default)" : "transparent" }} title={t.lbl}></span>)}
          <span className="hl-cap">More cases</span>
          <span className="heat__hint"><Ifw n="mouse-pointer-click" s={{ width: 12, height: 12 }} /> click a district</span>
        </div>
      </div>

      <div className="heat__side">
        {selData ? (
          <div className="heat-detail">
            <div className="heat-detail__top">
              <div>
                <div className="heat-detail__n">{sel}</div>
                <div className="heat-detail__p">{PROVINCE[sel] || "Rwanda"}</div>
              </div>
              <button className="heat-detail__x" onClick={() => setSel(null)} aria-label="Close"><Ifw n="x" s={{ width: 15, height: 15 }} /></button>
            </div>
            <div className="heat-detail__big" style={{ color: selData.k >= 3 ? "var(--status-rejected-text)" : selData.k >= 1 ? "var(--status-review-text)" : "var(--text-muted)" }}>
              {selData.cases}<small>open case{selData.cases === 1 ? "" : "s"}</small>
            </div>
            <div className="heat-detail__lvl"><span className="heat-tip__sw" style={{ background: RAMP[selData.k].bg }}></span>{RAMP[selData.k].lbl} intensity · level {selData.k}/5</div>
            <div className="heat-detail__rk">Ranked #{RANKED.findIndex((d) => d.n === sel) + 1} of 30 · {total ? Math.round(selData.cases / total * 100) : 0}% of national caseload</div>
            <div className="heat-detail__act">
              <button className="heat-detail__btn"><Ifw n="folder-open" s={{ width: 14, height: 14 }} /> View cases</button>
              <button className="heat-detail__btn ghost"><Ifw n="map-pin" s={{ width: 14, height: 14 }} /> Stations</button>
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div className="heat__stat">
              <div className="hs-n">{total}</div>
              <div className="hs-l">flagged cases · 30 districts</div>
            </div>
            <div className="heat__note"><Ifw n="info" s={{ width: 13, height: 13 }} />Kigali City (Gasabo, Kicukiro, Nyarugenge) accounts for {Math.round((9 + 7 + 6) / total * 100)}% of flagged cases.</div>
          </React.Fragment>
        )}
        <div className="heat__toplbl">Highest concentration</div>
        <div className="heat__top">
          {top.map((d, i) => (
            <button className={"ht-row" + (sel === d.n ? " on" : "")} key={d.n} onClick={() => setSel((s) => (s === d.n ? null : d.n))}
              onMouseEnter={(e) => onMove(d.n, e)} onMouseLeave={() => setHover(null)}>
              <span className="ht-rank">{i + 1}</span>
              <span className="ht-name">{d.n}</span>
              <span className="ht-bar"><i style={{ width: (d.cases / top[0].cases * 100) + "%", background: GLOW[d.k] || "var(--slate-300)" }}></i></span>
              <span className="ht-ct">{d.cases}</span>
            </button>
          ))}
        </div>
        <div className="heat__credit">District boundaries · geoBoundaries (gbOpen, CC-BY)</div>
      </div>
    </div>
  );
}

/* ---------- Biometric voter-photo scan (captured vs. on file) ---------- */
const PERSON_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12.6a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6Zm0 1.7c-3.5 0-8 1.8-8 5.2V21h16v-1.5c0-3.4-4.5-5.2-8-5.2Z"/></svg>
);

function Portrait({ kind, tone, scan }) {
  return (
    <div className={"vp vp--" + tone}>
      <div className="vp__img">
        <span className="vp__face">{PERSON_SVG}</span>
        {scan && <span className="vp__brackets"></span>}
        {scan && <span className="vp__scanline"></span>}
      </div>
      <div className="vp__cap">{kind}</div>
    </div>
  );
}

function VoterScan({ score, verdict }) {
  useEffectFW(lucideFW, [score]);
  const pct = Math.round(score * 100);
  const tone = verdict === "rejected" ? "red" : verdict === "review" ? "amber" : "green";
  const label = verdict === "rejected" ? "FACE MISMATCH" : verdict === "review" ? "NEEDS REVIEW" : "FACE MATCH";
  return (
    <div className="vscan">
      <div className="vscan__pair">
        <Portrait kind="Captured at station" tone={tone} scan />
        <div className="vscan__vs">
          <span className={"vscan__pct vscan__pct--" + tone}>{pct}<small>%</small></span>
          <span className="vscan__plbl">similarity</span>
          <Ifw n={verdict === "approved" ? "check" : "arrow-left-right"} s={{ width: 16, height: 16 }} />
        </div>
        <Portrait kind="On file · registry" tone="neutral" />
      </div>
      <div className={"vscan__verdict vscan__verdict--" + tone}>
        <Ifw n={verdict === "rejected" ? "user-x" : verdict === "review" ? "user-search" : "user-check"} s={{ width: 15, height: 15 }} />
        {label}
        <span className="vscan__meta">1:1 face · liveness {verdict === "rejected" ? "passed (spoof ruled out)" : "passed"} · captured 14:40</span>
      </div>
    </div>
  );
}

window.FraudWidgets = { FraudHeatmap, VoterScan };
