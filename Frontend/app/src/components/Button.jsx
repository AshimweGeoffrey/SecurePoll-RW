import React from "react";

const SP_BUTTON_CSS = `
.sp-btn{
  font-family:var(--font-sans); font-weight:var(--fw-semibold);
  border:1px solid transparent; border-radius:var(--radius-md);
  display:inline-flex; align-items:center; justify-content:center; gap:var(--space-2);
  cursor:pointer; white-space:nowrap; text-decoration:none;
  transition:var(--transition-control); letter-spacing:var(--ls-snug);
}
.sp-btn:focus-visible{ outline:none; box-shadow:var(--focus-ring); }
.sp-btn[disabled]{ opacity:.5; cursor:not-allowed; }
.sp-btn--sm{ height:var(--control-h-sm); padding:0 var(--space-3); font-size:var(--text-sm); }
.sp-btn--md{ height:var(--control-h-md); padding:0 var(--space-4); font-size:var(--text-md); }
.sp-btn--lg{ height:var(--control-h-lg); padding:0 var(--space-5); font-size:var(--text-lg); }
.sp-btn--xl{ height:var(--control-h-xl); padding:0 var(--space-6); font-size:var(--text-lg); border-radius:var(--radius-lg); }
.sp-btn--full{ width:100%; }

.sp-btn--primary{ background:var(--primary); color:var(--text-on-accent); }
.sp-btn--primary:hover:not([disabled]){ background:var(--primary-hover); }
.sp-btn--primary:active:not([disabled]){ background:var(--primary-press); }

.sp-btn--secondary{ background:var(--bg-surface); color:var(--text-strong); border-color:var(--border-default); box-shadow:var(--shadow-xs); }
.sp-btn--secondary:hover:not([disabled]){ background:var(--bg-subtle); border-color:var(--border-strong); }

.sp-btn--ghost{ background:transparent; color:var(--text-default); }
.sp-btn--ghost:hover:not([disabled]){ background:var(--bg-subtle); }

.sp-btn--danger{ background:var(--status-rejected); color:#fff; }
.sp-btn--danger:hover:not([disabled]){ filter:brightness(.93); }

.sp-btn .sp-btn__ic{ width:1.1em; height:1.1em; display:inline-flex; }
.sp-btn .sp-btn__ic svg{ width:100%; height:100%; }
.sp-btn--spin .sp-btn__sp{ width:1em;height:1em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:sp-bspin .7s linear infinite; }
@keyframes sp-bspin{ to{ transform:rotate(360deg); } }
`;
let spButtonInjected = false;
function useSpButtonCSS() {
  React.useEffect(() => {
    if (spButtonInjected) return;
    spButtonInjected = true;
    const s = document.createElement("style");
    s.setAttribute("data-sp", "button");
    s.textContent = SP_BUTTON_CSS;
    document.head.appendChild(s);
  }, []);
}

export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  useSpButtonCSS();
  const cls = [
    "sp-btn",
    `sp-btn--${variant}`,
    `sp-btn--${size}`,
    fullWidth ? "sp-btn--full" : "",
    loading ? "sp-btn--spin" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className="sp-btn__sp" aria-hidden="true" />}
      {!loading && iconLeft && <span className="sp-btn__ic">{iconLeft}</span>}
      {children}
      {!loading && iconRight && <span className="sp-btn__ic">{iconRight}</span>}
    </button>
  );
}
