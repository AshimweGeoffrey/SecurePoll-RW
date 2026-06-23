import React from "react";
import { ConfidenceMeter } from "./ConfidenceMeter.jsx";

const SP_DECISION_CSS = `
.sp-decision{ font-family:var(--font-sans); background:var(--bg-surface); border:1px solid var(--border-default); border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-md); }
.sp-decision__hd{ display:flex; align-items:center; gap:var(--space-3); padding:var(--space-4) var(--space-5); color:#fff; }
.sp-decision__hd .ic{ width:34px; height:34px; border-radius:var(--radius-md); background:rgba(255,255,255,.22); display:grid; place-items:center; flex-shrink:0; }
.sp-decision__hd .ic svg{ width:20px; height:20px; }
.sp-decision__verdict{ font-family:var(--font-display); font-size:var(--text-2xl); font-weight:var(--fw-bold); letter-spacing:var(--ls-snug); line-height:1; }
.sp-decision__who{ font-size:var(--text-xs); opacity:.9; margin-top:3px; }
.sp-decision__hd-end{ margin-left:auto; text-align:right; font-family:var(--font-mono); }
.sp-decision__hd-end .n{ font-size:var(--text-3xl); font-weight:var(--fw-bold); line-height:1; }
.sp-decision__hd-end .u{ font-size:var(--text-xs); opacity:.85; }

.d-approved .sp-decision__hd{ background:linear-gradient(100deg, var(--green-500), var(--green-700)); }
.d-review .sp-decision__hd{ background:linear-gradient(100deg, var(--amber-400), var(--amber-600)); }
.d-rejected .sp-decision__hd{ background:linear-gradient(100deg, var(--red-500), var(--red-700)); }

.sp-decision__body{ padding:var(--space-5); display:flex; flex-direction:column; gap:var(--space-4); }
.sp-decision__bd{ display:flex; flex-direction:column; gap:0; }
.sp-decision__row{ display:flex; align-items:center; justify-content:space-between; padding:var(--space-2-5,9px) 0; padding-top:9px; padding-bottom:9px; border-bottom:1px solid var(--border-subtle); }
.sp-decision__row:last-child{ border-bottom:none; }
.sp-decision__row .k{ font-size:var(--text-sm); color:var(--text-muted); display:flex; align-items:center; gap:var(--space-2); white-space:nowrap; }
.sp-decision__row .k svg{ width:14px; height:14px; }
.sp-decision__row .v{ font-family:var(--font-mono); font-size:var(--text-sm); font-weight:var(--fw-semibold); color:var(--text-strong); }
.sp-decision__row .v.live{ color:var(--status-approved-text); }
.sp-decision__row .v.spoof{ color:var(--status-rejected-text); }

.sp-decision__expl{ display:flex; gap:var(--space-2-5,10px); background:var(--bg-inset); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:var(--space-3); font-size:var(--text-sm); line-height:1.5; color:var(--text-default); }
.sp-decision__expl svg{ width:16px; height:16px; color:var(--primary-text); flex-shrink:0; margin-top:1px; }
.sp-decision__flags{ display:flex; flex-wrap:wrap; gap:var(--space-2); }
.sp-decision__flag{ font-size:var(--text-2xs); font-weight:var(--fw-semibold); color:var(--status-review-text); background:var(--status-review-soft); border:1px solid var(--status-review); border-radius:var(--radius-sm); padding:3px 8px; display:inline-flex; align-items:center; gap:5px; }
.sp-decision__flag svg{ width:11px; height:11px; }
.sp-decision__review{ display:flex; align-items:center; gap:var(--space-2); font-size:var(--text-xs); font-weight:var(--fw-semibold); color:var(--status-review-text); }
.sp-decision__review svg{ width:14px; height:14px; }
`;
let spDecisionInjected = false;
function useSpDecisionCSS() {
  React.useEffect(() => {
    if (spDecisionInjected) return;
    spDecisionInjected = true;
    const s = document.createElement("style");
    s.setAttribute("data-sp", "decision");
    s.textContent = SP_DECISION_CSS;
    document.head.appendChild(s);
  }, []);
}

const ICONS = {
  approved: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  review: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>,
  rejected: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
};
const VERDICT = { approved: "APPROVED", review: "MANUAL REVIEW", rejected: "REJECTED" };
const FLAG_ICO = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>;
const BULB = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 18 9 18 8a6 6 0 0 0-12 0c0 1 .3 2.2 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>;

function decisionOf(d, confidence, threshold) {
  if (d) return d;
  if (confidence >= threshold) return "approved";
  if (confidence >= 0.6) return "review";
  return "rejected";
}

export function DecisionPanel({
  decision,
  confidence,
  threshold = 0.8,
  voterName,
  breakdown,
  explanation,
  flags,
  reviewRequired,
  className = "",
  ...rest
}) {
  useSpDecisionCSS();
  const d = decisionOf(decision, confidence, threshold);
  const rows = breakdown
    ? Array.isArray(breakdown)
      ? breakdown
      : Object.entries(breakdown).map(([k, v]) => ({ label: k, value: v }))
    : [];
  return (
    <div className={`sp-decision d-${d} ${className}`} {...rest}>
      <div className="sp-decision__hd">
        <span className="ic">{ICONS[d]}</span>
        <div>
          <div className="sp-decision__verdict">{VERDICT[d]}</div>
          {voterName && <div className="sp-decision__who">{voterName}</div>}
        </div>
        {confidence != null && (
          <div className="sp-decision__hd-end">
            <div className="n">{Math.round(confidence * 100)}%</div>
            <div className="u">confidence</div>
          </div>
        )}
      </div>
      <div className="sp-decision__body">
        {confidence != null && (
          <ConfidenceMeter value={confidence} threshold={threshold} size="sm" label="Fused score" />
        )}
        {rows.length > 0 && (
          <div className="sp-decision__bd">
            {rows.map((r, i) => {
              const isLive = String(r.value).toUpperCase() === "LIVE";
              const isSpoof = String(r.value).toUpperCase() === "SPOOFED";
              return (
                <div className="sp-decision__row" key={i}>
                  <span className="k">{r.label}</span>
                  <span className={`v${isLive ? " live" : ""}${isSpoof ? " spoof" : ""}`}>
                    {typeof r.value === "number" ? r.value.toFixed(2) : r.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {explanation && (
          <div className="sp-decision__expl">{BULB}<span>{explanation}</span></div>
        )}
        {flags && flags.length > 0 && (
          <div className="sp-decision__flags">
            {flags.map((f, i) => (
              <span className="sp-decision__flag" key={i}>{FLAG_ICO}{f}</span>
            ))}
          </div>
        )}
        {reviewRequired && (
          <div className="sp-decision__review">{ICONS.review}<span>Officer decision required — log a justification</span></div>
        )}
      </div>
    </div>
  );
}
