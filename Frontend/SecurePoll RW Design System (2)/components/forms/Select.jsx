import React from "react";

const SP_SELECT_CSS = `
.sp-sel-wrap{ position:relative; display:flex; align-items:center; }
.sp-select{
  width:100%; font-family:var(--font-sans); font-size:var(--text-md); color:var(--text-strong);
  background:var(--bg-surface); border:1px solid var(--border-default); border-radius:var(--radius-md);
  height:var(--control-h-md); padding:0 36px 0 var(--field-pad-x); transition:var(--transition-control);
  outline:none; appearance:none; cursor:pointer;
}
.sp-select:hover{ border-color:var(--border-strong); }
.sp-select:focus{ border-color:var(--primary); box-shadow:var(--focus-ring); }
.sp-select:disabled{ background:var(--bg-subtle); color:var(--text-muted); cursor:not-allowed; }
.sp-select--lg{ height:var(--control-h-lg); font-size:var(--text-lg); }
.sp-select--err{ border-color:var(--status-rejected); }
.sp-sel-chev{ position:absolute; right:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:var(--text-muted); pointer-events:none; }
.sp-sel-chev svg{ width:100%; height:100%; }
`;
let spSelectInjected = false;
function useSpSelectCSS() {
  React.useEffect(() => {
    if (spSelectInjected) return;
    spSelectInjected = true;
    const s = document.createElement("style");
    s.setAttribute("data-sp", "select");
    s.textContent = SP_SELECT_CSS;
    document.head.appendChild(s);
  }, []);
}

const CHEVRON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export function Select({
  label,
  hint,
  error,
  required = false,
  size = "md",
  options,
  placeholder,
  id,
  className = "",
  children,
  ...rest
}) {
  useSpSelectCSS();
  const fid = id || (label ? `sp-${String(label).replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const selCls = [
    "sp-select",
    size === "lg" ? "sp-select--lg" : "",
    error ? "sp-select--err" : "",
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
      <div className="sp-sel-wrap">
        <select id={fid} className={selCls} aria-invalid={!!error} {...rest}>
          {placeholder && <option value="" disabled hidden>{placeholder}</option>}
          {options
            ? options.map((o) => {
                const val = typeof o === "string" ? o : o.value;
                const lab = typeof o === "string" ? o : o.label;
                return <option key={val} value={val}>{lab}</option>;
              })
            : children}
        </select>
        <span className="sp-sel-chev">{CHEVRON}</span>
      </div>
      {error ? (
        <span className="sp-field__err">{error}</span>
      ) : hint ? (
        <span className="sp-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}
