import React from "react";

const SP_FIELD_CSS = `
.sp-field{ display:flex; flex-direction:column; gap:var(--space-1-5); font-family:var(--font-sans); }
.sp-field__label{ font-size:var(--text-sm); font-weight:var(--fw-semibold); color:var(--text-strong); display:flex; gap:var(--space-1); align-items:center; }
.sp-field__req{ color:var(--status-rejected); }
.sp-field__hint{ font-size:var(--text-xs); color:var(--text-muted); }
.sp-field__err{ font-size:var(--text-xs); color:var(--status-rejected-text); display:flex; align-items:center; gap:var(--space-1); }

.sp-input-wrap{ position:relative; display:flex; align-items:center; }
.sp-input{
  width:100%; font-family:var(--font-sans); font-size:var(--text-md); color:var(--text-strong);
  background:var(--bg-surface); border:1px solid var(--border-default); border-radius:var(--radius-md);
  height:var(--control-h-md); padding:0 var(--field-pad-x); transition:var(--transition-control); outline:none;
}
.sp-input::placeholder{ color:var(--text-subtle); }
.sp-input:hover{ border-color:var(--border-strong); }
.sp-input:focus{ border-color:var(--primary); box-shadow:var(--focus-ring); }
.sp-input:disabled{ background:var(--bg-subtle); color:var(--text-muted); cursor:not-allowed; }
.sp-input--mono{ font-family:var(--font-mono); letter-spacing:var(--ls-snug); }
.sp-input--lg{ height:var(--control-h-lg); font-size:var(--text-lg); }
.sp-input--err{ border-color:var(--status-rejected); }
.sp-input--err:focus{ box-shadow:0 0 0 3px color-mix(in oklab, var(--status-rejected) 30%, transparent); }
.sp-input--has-ic-l{ padding-left:38px; }
.sp-input--has-ic-r{ padding-right:38px; }
.sp-input__ic{ position:absolute; top:50%; transform:translateY(-50%); width:17px; height:17px; color:var(--text-muted); pointer-events:none; }
.sp-input__ic--l{ left:12px; } .sp-input__ic--r{ right:12px; }
.sp-input__ic svg{ width:100%; height:100%; }
`;
let spFieldInjected = false;
function useSpFieldCSS() {
  React.useEffect(() => {
    if (spFieldInjected) return;
    spFieldInjected = true;
    const s = document.createElement("style");
    s.setAttribute("data-sp", "field");
    s.textContent = SP_FIELD_CSS;
    document.head.appendChild(s);
  }, []);
}

export function Input({
  label,
  hint,
  error,
  required = false,
  iconLeft,
  iconRight,
  mono = false,
  size = "md",
  id,
  className = "",
  ...rest
}) {
  useSpFieldCSS();
  const fid = id || (label ? `sp-${String(label).replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const inputCls = [
    "sp-input",
    mono ? "sp-input--mono" : "",
    size === "lg" ? "sp-input--lg" : "",
    error ? "sp-input--err" : "",
    iconLeft ? "sp-input--has-ic-l" : "",
    iconRight ? "sp-input--has-ic-r" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <div className="sp-field">
      {label && (
        <label className="sp-field__label" htmlFor={fid}>
          {label}
          {required && <span className="sp-field__req" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="sp-input-wrap">
        {iconLeft && <span className="sp-input__ic sp-input__ic--l">{iconLeft}</span>}
        <input id={fid} className={inputCls} aria-invalid={!!error} {...rest} />
        {iconRight && <span className="sp-input__ic sp-input__ic--r">{iconRight}</span>}
      </div>
      {error ? (
        <span className="sp-field__err">{error}</span>
      ) : hint ? (
        <span className="sp-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}
