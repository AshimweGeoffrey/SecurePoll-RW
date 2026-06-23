import React from "react";

const SP_CARD_CSS = `
.sp-card{
  background:var(--bg-surface); border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg); overflow:hidden;
}
.sp-card--flat{ box-shadow:none; }
.sp-card--raised{ box-shadow:var(--shadow-sm); }
.sp-card--floating{ box-shadow:var(--shadow-lg); border-color:transparent; }
.sp-card--interactive{ transition:var(--transition-control); cursor:pointer; }
.sp-card--interactive:hover{ box-shadow:var(--shadow-md); border-color:var(--border-default); transform:translateY(-1px); }
.sp-card__accent{ height:var(--bw-accent); width:100%; }
.sp-card__hd{ padding:var(--space-4) var(--card-pad) var(--space-3); display:flex; align-items:flex-start; gap:var(--space-3); }
.sp-card__hd > div:first-child{ min-width:0; }
.sp-card__hd .sp-card__t{ font-family:var(--font-display); font-weight:var(--fw-semibold); font-size:var(--text-lg); color:var(--text-strong); letter-spacing:var(--ls-snug); line-height:1.2; }
.sp-card__hd .sp-card__sub{ font-size:var(--text-xs); color:var(--text-muted); margin-top:2px; }
.sp-card__hd .sp-card__hd-end{ margin-left:auto; flex-shrink:0; }
.sp-card__body{ padding:var(--card-pad); }
.sp-card__hd + .sp-card__body{ padding-top:0; }
`;
let spCardInjected = false;
function useSpCardCSS() {
  React.useEffect(() => {
    if (spCardInjected) return;
    spCardInjected = true;
    const s = document.createElement("style");
    s.setAttribute("data-sp", "card");
    s.textContent = SP_CARD_CSS;
    document.head.appendChild(s);
  }, []);
}

const ACCENT = {
  green: "var(--status-approved)",
  blue: "var(--status-info)",
  amber: "var(--status-review)",
  red: "var(--status-rejected)",
};

export function Card({
  elevation = "raised",
  interactive = false,
  accent,
  title,
  subtitle,
  headerEnd,
  className = "",
  bodyClassName = "",
  children,
  ...rest
}) {
  useSpCardCSS();
  const cls = [
    "sp-card",
    `sp-card--${elevation}`,
    interactive ? "sp-card--interactive" : "",
    className,
  ].filter(Boolean).join(" ");
  const hasHeader = title || subtitle || headerEnd;
  return (
    <div className={cls} {...rest}>
      {accent && <div className="sp-card__accent" style={{ background: ACCENT[accent] || accent }} />}
      {hasHeader && (
        <div className="sp-card__hd">
          <div>
            {title && <div className="sp-card__t">{title}</div>}
            {subtitle && <div className="sp-card__sub">{subtitle}</div>}
          </div>
          {headerEnd && <div className="sp-card__hd-end">{headerEnd}</div>}
        </div>
      )}
      <div className={["sp-card__body", bodyClassName].filter(Boolean).join(" ")}>{children}</div>
    </div>
  );
}
