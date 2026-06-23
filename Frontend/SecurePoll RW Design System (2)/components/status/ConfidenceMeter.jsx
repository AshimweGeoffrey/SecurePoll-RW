import React from "react";

const SP_METER_CSS = `
.sp-meter{ font-family:var(--font-sans); display:flex; flex-direction:column; gap:var(--space-2); }
.sp-meter__top{ display:flex; align-items:baseline; justify-content:space-between; }
.sp-meter__val{ font-family:var(--font-mono); font-weight:var(--fw-bold); letter-spacing:var(--ls-tight); line-height:1; }
.sp-meter__val small{ font-size:0.45em; color:var(--text-muted); font-weight:var(--fw-medium); }
.sp-meter__lbl{ font-size:var(--text-xs); font-weight:var(--fw-bold); letter-spacing:var(--ls-caps); text-transform:uppercase; color:var(--text-muted); white-space:nowrap; }
.sp-meter__track{ position:relative; height:10px; border-radius:var(--radius-pill); background:var(--bg-inset); overflow:visible; box-shadow:var(--inset-hairline); }
.sp-meter__fill{ height:100%; border-radius:var(--radius-pill); transition:width var(--dur-slow) var(--ease-entrance); }
.sp-meter--lg .sp-meter__track{ height:14px; }
.sp-meter--lg .sp-meter__val{ font-size:var(--text-4xl); }
.sp-meter--md .sp-meter__val{ font-size:var(--text-2xl); }
.sp-meter--sm .sp-meter__track{ height:7px; }
.sp-meter--sm .sp-meter__val{ font-size:var(--text-lg); }
.sp-meter__thr{ position:absolute; top:-3px; bottom:-3px; width:2px; background:var(--text-strong); border-radius:2px; }
.sp-meter__thr::after{ content:attr(data-thr); position:absolute; top:-16px; left:50%; transform:translateX(-50%); font-family:var(--font-mono); font-size:9px; color:var(--text-muted); white-space:nowrap; }
.sp-meter__scale{ display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:9px; color:var(--text-subtle); }
.f-green{ background:linear-gradient(90deg, var(--green-400), var(--green-600)); }
.f-amber{ background:linear-gradient(90deg, var(--amber-300), var(--amber-500)); }
.f-red{ background:linear-gradient(90deg, var(--red-400), var(--red-600)); }
.c-green{ color:var(--status-approved-text); }
.c-amber{ color:var(--status-review-text); }
.c-red{ color:var(--status-rejected-text); }
`;
let spMeterInjected = false;
function useSpMeterCSS() {
  React.useEffect(() => {
    if (spMeterInjected) return;
    spMeterInjected = true;
    const s = document.createElement("style");
    s.setAttribute("data-sp", "meter");
    s.textContent = SP_METER_CSS;
    document.head.appendChild(s);
  }, []);
}

function bandOf(v, threshold) {
  if (v >= threshold) return "green";
  if (v >= 0.6) return "amber";
  return "red";
}

export function ConfidenceMeter({
  value,
  threshold = 0.8,
  size = "md",
  showValue = true,
  showScale = false,
  label = "Confidence",
  ...rest
}) {
  useSpMeterCSS();
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const band = bandOf(value, threshold);
  return (
    <div className={`sp-meter sp-meter--${size}`} {...rest}>
      {(showValue || label) && (
        <div className="sp-meter__top">
          {label && <span className="sp-meter__lbl">{label}</span>}
          {showValue && (
            <span className={`sp-meter__val c-${band}`}>
              {value.toFixed(2)}<small> / 1.00</small>
            </span>
          )}
        </div>
      )}
      <div className="sp-meter__track">
        <div className={`sp-meter__fill f-${band}`} style={{ width: `${pct}%` }} />
        {threshold != null && (
          <div className="sp-meter__thr" data-thr={threshold.toFixed(2)} style={{ left: `${threshold * 100}%` }} />
        )}
      </div>
      {showScale && (
        <div className="sp-meter__scale"><span>0.00</span><span>0.50</span><span>1.00</span></div>
      )}
    </div>
  );
}
