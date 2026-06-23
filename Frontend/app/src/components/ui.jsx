import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button.jsx";

/* ───────── Modal ───────── */
export function Modal({ open, title, subtitle, onClose, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sp-modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`sp-modal ${size === "lg" ? "sp-modal--lg" : ""}`} role="dialog" aria-modal="true">
        <div className="sp-modal__head">
          <div>
            {title && <div className="sp-section-title">{title}</div>}
            {subtitle && <div className="t-sm t-muted" style={{ marginTop: 4 }}>{subtitle}</div>}
          </div>
          <button className="sp-iconbtn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="sp-modal__body">{children}</div>
        {footer && <div className="sp-modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

/* Confirm dialog — destructive actions get a danger button. */
export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", danger, onConfirm, onClose, busy }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="t-sm" style={{ color: "var(--text-default)", lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}

/* ───────── Textarea (matches Input styling) ───────── */
export function Textarea({ label, hint, error, required, id, rows = 4, className = "", ...rest }) {
  const fid = id || (label ? `sp-${String(label).replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className="sp-field">
      {label && (
        <label className="sp-field__label" htmlFor={fid}>
          {label}{required && <span className="sp-field__req">*</span>}
        </label>
      )}
      <textarea
        id={fid}
        rows={rows}
        className={`sp-input ${error ? "sp-input--err" : ""} ${className}`}
        style={{ height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
        {...rest}
      />
      {error ? <span className="sp-field__err">{error}</span> : hint ? <span className="sp-field__hint">{hint}</span> : null}
    </div>
  );
}

/* ───────── StatCard ───────── */
export function StatCard({ label, value, sub, icon, tone = "neutral", accent }) {
  return (
    <div className="sp-card sp-card--raised" style={{ position: "relative" }}>
      {accent && <div style={{ height: 3, background: `var(--status-${accent}, var(--primary))` }} />}
      <div style={{ padding: "var(--space-4) var(--space-5)" }}>
        <div className="sp-row-between" style={{ marginBottom: 6 }}>
          <span className="t-eyebrow">{label}</span>
          {icon && <span style={{ color: `var(--status-${tone}-text, var(--text-muted))` }}>{icon}</span>}
        </div>
        <div className="t-num" style={{ fontSize: "var(--text-3xl)", lineHeight: 1.05 }}>{value}</div>
        {sub && <div className="t-xs t-muted" style={{ marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ───────── Tabs ───────── */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="sp-row" style={{ gap: 2, borderBottom: "1px solid var(--border-subtle)", marginBottom: "var(--space-4)" }}>
      {tabs.map((t) => {
        const id = typeof t === "string" ? t : t.id;
        const label = typeof t === "string" ? t : t.label;
        const on = id === active;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 14px", fontSize: "var(--text-sm)", fontWeight: 600,
              fontFamily: "var(--font-sans)",
              color: on ? "var(--text-strong)" : "var(--text-muted)",
              borderBottom: `2px solid ${on ? "var(--primary)" : "transparent"}`,
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ───────── Pagination ───────── */
export function Pagination({ page, size, total, onPage }) {
  const pages = Math.max(1, Math.ceil((total || 0) / (size || 1)));
  const from = total === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, total);
  return (
    <div className="sp-row-between" style={{ marginTop: "var(--space-4)" }}>
      <span className="t-xs t-muted">{from}–{to} of {(total || 0).toLocaleString()}</span>
      <div className="sp-row sp-gap-2">
        <Button size="sm" variant="secondary" disabled={page <= 0} onClick={() => onPage(page - 1)}>Previous</Button>
        <span className="t-xs t-muted t-mono">Page {page + 1} / {pages}</span>
        <Button size="sm" variant="secondary" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

/* ───────── Empty / Loading / Error ───────── */
export function Empty({ icon, title, message }) {
  return (
    <div className="sp-empty">
      {icon && <div style={{ marginBottom: 8, opacity: 0.5 }}>{icon}</div>}
      {title && <div style={{ fontWeight: 600, color: "var(--text-default)" }}>{title}</div>}
      {message && <div className="t-sm" style={{ marginTop: 4 }}>{message}</div>}
    </div>
  );
}

/* Design-system skeleton placeholder — shimmer block while data loads. */
export function Skeleton({ w = "100%", h = 14, r = 6, style }) {
  return <span className="sp-skel" style={{ display: "block", width: w, height: h, borderRadius: r, ...style }} />;
}

export function Loading({ label = "Loading…", padded = true }) {
  return (
    <div className="sp-row sp-gap-2 t-muted t-sm" style={{ justifyContent: "center", padding: padded ? "var(--space-12)" : 0 }}>
      <span className="sp-spinner" /> {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="sp-empty">
      <div style={{ color: "var(--status-rejected-text)", fontWeight: 600 }}>Couldn’t load data</div>
      <div className="t-sm" style={{ marginTop: 4 }}>{error?.message || "Request failed"}</div>
      {onRetry && <div style={{ marginTop: 12 }}><Button size="sm" variant="secondary" onClick={onRetry}>Retry</Button></div>}
    </div>
  );
}

/* ───────── Avatar ───────── */
export function Avatar({ name, size = 34 }) {
  const init = (name || "··").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return (
    <span
      style={{
        width: size, height: size, borderRadius: "var(--radius-md)",
        background: "var(--primary-soft)", color: "var(--primary-text)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
        fontFamily: "var(--font-sans)",
      }}
    >
      {init}
    </span>
  );
}

/* ───────── Toolbar (search + actions row) ───────── */
export function Toolbar({ children }) {
  return <div className="sp-row-between sp-wrap sp-gap-3" style={{ marginBottom: "var(--space-4)" }}>{children}</div>;
}
