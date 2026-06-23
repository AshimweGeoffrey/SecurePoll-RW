// ReportBuilder.jsx — drag-and-drop custom report builder + turnout demographics
const { useState: useRb, useEffect: useRbE } = React;
const RB = window.SecurePollRWDesignSystem_92875f;
const Irb = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lrb() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

const RB_FIELDS = [
  { id: "district", label: "District", icon: "map-pin", role: "Dimension", tint: { bg: "var(--secondary-soft)", fg: "var(--secondary-text)" }, dim: true },
  { id: "station", label: "Polling station", icon: "building-2", role: "Dimension", tint: { bg: "var(--secondary-soft)", fg: "var(--secondary-text)" }, dim: true },
  { id: "age", label: "Age band", icon: "cake", role: "Dimension", tint: { bg: "var(--secondary-soft)", fg: "var(--secondary-text)" }, dim: true },
  { id: "gender", label: "Gender", icon: "venus-and-mars", role: "Dimension", tint: { bg: "var(--secondary-soft)", fg: "var(--secondary-text)" }, dim: true },
  { id: "hour", label: "Hour of day", icon: "clock", role: "Dimension", tint: { bg: "var(--secondary-soft)", fg: "var(--secondary-text)" }, dim: true },
  { id: "turnout", label: "Turnout %", icon: "users", role: "Measure", tint: { bg: "var(--primary-soft)", fg: "var(--primary-text)" } },
  { id: "verified", label: "Verifications", icon: "badge-check", role: "Measure", tint: { bg: "var(--primary-soft)", fg: "var(--primary-text)" } },
  { id: "rejected", label: "Rejections", icon: "user-x", role: "Measure", tint: { bg: "var(--primary-soft)", fg: "var(--primary-text)" } },
  { id: "cases", label: "Fraud cases", icon: "shield-alert", role: "Measure", tint: { bg: "var(--status-review-soft)", fg: "var(--status-review-text)" } },
  { id: "latency", label: "Avg. latency", icon: "timer", role: "Measure", tint: { bg: "var(--primary-soft)", fg: "var(--primary-text)" } },
];
const AGGRS = ["Sum", "Average", "Count", "Min", "Max"];

function ReportBuilder() {
  const [cols, setCols] = useRb(["district", "turnout", "verified"]);
  const [aggrs, setAggrs] = useRb({ turnout: "Average", verified: "Sum" });
  const [over, setOver] = useRb(false);
  const [dragId, setDragId] = useRb(null);
  useRbE(lrb, [cols, over]);

  const add = (id) => { if (id && !cols.includes(id)) { setCols([...cols, id]); } };
  const remove = (id) => setCols(cols.filter((c) => c !== id));
  const onDrop = (e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.getData("text/plain")); };
  const reorder = (from, to) => {
    if (from === to) return;
    const next = [...cols];
    const fi = next.indexOf(from), ti = next.indexOf(to);
    next.splice(fi, 1); next.splice(ti, 0, from);
    setCols(next);
  };

  return (
    <RB.Card title="Custom report builder" subtitle="Drag fields into the canvas to compose a report"
      headerEnd={<div style={{ display: "flex", gap: 8 }}><RB.Button size="sm" variant="ghost" iconLeft={<Irb n="rotate-ccw" />} onClick={() => { setCols([]); }}>Clear</RB.Button><RB.Button size="sm" iconLeft={<Irb n="play" />}>Run report</RB.Button></div>}>
      <div className="rb">
        <div className="rb__palette">
          <div className="rb__cap">Dimensions</div>
          {RB_FIELDS.filter((f) => f.dim).map((f) => (
            <PaletteField key={f.id} f={f} used={cols.includes(f.id)} setDragId={setDragId} />
          ))}
          <div className="rb__cap" style={{ marginTop: 8 }}>Measures</div>
          {RB_FIELDS.filter((f) => !f.dim).map((f) => (
            <PaletteField key={f.id} f={f} used={cols.includes(f.id)} setDragId={setDragId} />
          ))}
        </div>

        <div className={"rb__canvas" + (over ? " over" : "")}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)} onDrop={onDrop}>
          {cols.length === 0 ? (
            <div className="rb__empty">
              <Irb n="layout-template" />
              <div className="t">Drop fields here</div>
              <div className="s">Drag dimensions and measures from the left to build your report layout.</div>
            </div>
          ) : (
            <div>
              <div className="rb__rows">
                {cols.map((id, i) => {
                  const f = RB_FIELDS.find((x) => x.id === id);
                  return (
                    <div className="rb-chip" key={id} draggable
                      onDragStart={(e) => { e.dataTransfer.setData("text/plain", "__order__" + id); }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.stopPropagation(); const d = e.dataTransfer.getData("text/plain"); if (d.startsWith("__order__")) reorder(d.slice(9), id); else add(d); }}>
                      <span className="rb-chip__num">{i + 1}</span>
                      <span className="rb-chip__ic" style={{ background: f.tint.bg, color: f.tint.fg }}><Irb n={f.icon} /></span>
                      <div><div className="rb-chip__nm">{f.label}</div><div className="rb-chip__role">{f.role}</div></div>
                      {!f.dim && (
                        <span className="rb-chip__aggr">
                          <select value={aggrs[id] || "Sum"} onChange={(e) => setAggrs({ ...aggrs, [id]: e.target.value })}>
                            {AGGRS.map((a) => <option key={a}>{a}</option>)}
                          </select>
                        </span>
                      )}
                      <button className="rb-chip__x" onClick={() => remove(id)} aria-label="Remove"><Irb n="x" /></button>
                    </div>
                  );
                })}
              </div>
              <div className="rb__count" style={{ marginTop: 12 }}>{cols.filter((c) => RB_FIELDS.find((f) => f.id === c).dim).length} dimensions · {cols.filter((c) => !RB_FIELDS.find((f) => f.id === c).dim).length} measures · grouped &amp; ready to run</div>
            </div>
          )}
        </div>
      </div>
    </RB.Card>
  );
}

function PaletteField({ f, used, setDragId }) {
  return (
    <div className={"rb-field" + (used ? " used" : "")} draggable={!used}
      onDragStart={(e) => { if (used) { e.preventDefault(); return; } e.dataTransfer.setData("text/plain", f.id); e.currentTarget.classList.add("dragging"); }}
      onDragEnd={(e) => e.currentTarget.classList.remove("dragging")}>
      <span className="rb-field__ic" style={{ background: f.tint.bg, color: f.tint.fg }}><Irb n={f.icon} /></span>
      {f.label}
      <span className="rb-field__grip"><Irb n={used ? "check" : "grip-vertical"} /></span>
    </div>
  );
}

/* ---------------------- Turnout demographics ---------------------- */
const AGE_BANDS = [
  { l: "18–24", f: 58, m: 54 },
  { l: "25–34", f: 71, m: 66 },
  { l: "35–44", f: 74, m: 69 },
  { l: "45–59", f: 68, m: 64 },
  { l: "60+", f: 61, m: 57 },
];

function TurnoutDemographics() {
  useRbE(lrb);
  const max = 80;
  return (
    <RB.Card title="Turnout by demographics" subtitle="Aggregated · age band & gender · anonymized"
      headerEnd={<RB.Badge tone="blue" size="sm">DEMOGRAPHICS</RB.Badge>}>
      <div className="demo">
        <div>
          <div className="demo__age">
            {AGE_BANDS.map((a) => (
              <div className="age-col" key={a.l}>
                <div className="age-col__bars">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    <span className="age-col__v">{a.f}</span>
                    <div className="age-col__bar f" style={{ height: (a.f / max * 130) + "px" }}></div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    <span className="age-col__v">{a.m}</span>
                    <div className="age-col__bar m" style={{ height: (a.m / max * 130) + "px" }}></div>
                  </div>
                </div>
                <span className="age-col__l">{a.l}</span>
              </div>
            ))}
          </div>
          <div className="demo__legend">
            <span className="li"><span className="k" style={{ background: "var(--secondary)" }}></span>Women</span>
            <span className="li"><span className="k" style={{ background: "var(--green-500)" }}></span>Men</span>
            <span className="li" style={{ marginLeft: "auto" }}>turnout % within band</span>
          </div>
        </div>
        <div className="demo__gender">
          <div className="gd-donut" style={{ background: "conic-gradient(var(--secondary) 0 51.3%, var(--green-500) 51.3% 100%)" }}>
            <div className="gd-donut__c"><div className="gd-donut__n">51 / 49</div><div className="obs-donut__l" style={{ fontSize: 10, color: "var(--text-muted)" }}>W / M share</div></div>
          </div>
          <div className="gd-rows">
            <div className="gd-row"><span className="k" style={{ background: "var(--secondary)" }}></span>Women · 67.8% turnout <b>944k</b></div>
            <div className="gd-row"><span className="k" style={{ background: "var(--green-500)" }}></span>Men · 63.1% turnout <b>896k</b></div>
          </div>
        </div>
      </div>
    </RB.Card>
  );
}

window.ReportBuilder = ReportBuilder;
window.TurnoutDemographics = TurnoutDemographics;
