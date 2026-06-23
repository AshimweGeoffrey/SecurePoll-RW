import React from "react";

const SP_BADGE_CSS = `
.sp-badge{
  font-family:var(--font-sans); font-weight:var(--fw-semibold);
  display:inline-flex; align-items:center; gap:var(--space-1-5);
  border-radius:var(--radius-pill); border:1px solid transparent;
  line-height:1; white-space:nowrap; letter-spacing:var(--ls-snug);
}
.sp-badge--sm{ font-size:var(--text-2xs); padding:3px var(--space-2); }
.sp-badge--md{ font-size:var(--text-xs); padding:4px var(--space-2-5,10px); padding-left:10px; padding-right:10px; }
.sp-badge__dot{ width:6px;height:6px;border-radius:50%;background:currentColor; }

/* soft (default) */
.sp-badge--soft.t-neutral{ background:var(--bg-inset); color:var(--text-default); border-color:var(--border-subtle); }
.sp-badge--soft.t-green{ background:var(--status-approved-soft); color:var(--status-approved-text); }
.sp-badge--soft.t-blue{ background:var(--status-info-soft); color:var(--status-info-text); }
.sp-badge--soft.t-amber{ background:var(--status-review-soft); color:var(--status-review-text); }
.sp-badge--soft.t-red{ background:var(--status-rejected-soft); color:var(--status-rejected-text); }

/* solid */
.sp-badge--solid{ color:#fff; }
.sp-badge--solid.t-neutral{ background:var(--text-strong); }
.sp-badge--solid.t-green{ background:var(--status-approved); }
.sp-badge--solid.t-blue{ background:var(--status-info); }
.sp-badge--solid.t-amber{ background:var(--status-review); color:#3b2a07; }
.sp-badge--solid.t-red{ background:var(--status-rejected); }

/* outline */
.sp-badge--outline{ background:transparent; }
.sp-badge--outline.t-neutral{ color:var(--text-default); border-color:var(--border-default); }
.sp-badge--outline.t-green{ color:var(--status-approved-text); border-color:var(--status-approved); }
.sp-badge--outline.t-blue{ color:var(--status-info-text); border-color:var(--status-info); }
.sp-badge--outline.t-amber{ color:var(--status-review-text); border-color:var(--status-review); }
.sp-badge--outline.t-red{ color:var(--status-rejected-text); border-color:var(--status-rejected); }
`;
let spBadgeInjected = false;
function useSpBadgeCSS() {
  React.useEffect(() => {
    if (spBadgeInjected) return;
    spBadgeInjected = true;
    const s = document.createElement("style");
    s.setAttribute("data-sp", "badge");
    s.textContent = SP_BADGE_CSS;
    document.head.appendChild(s);
  }, []);
}

export function Badge({
  tone = "neutral",
  variant = "soft",
  size = "md",
  dot = false,
  className = "",
  children,
  ...rest
}) {
  useSpBadgeCSS();
  const cls = [
    "sp-badge",
    `sp-badge--${variant}`,
    `sp-badge--${size}`,
    `t-${tone}`,
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {dot && <span className="sp-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
