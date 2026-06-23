import { Link } from "react-router-dom";
import markUrl from "../assets/mark.svg";
import { Badge } from "./Badge.jsx";
import { statusTone, prettyStatus } from "../lib/format.js";

/* Brand lockup: civic-shield mark + Zilla Slab wordmark + "RW" badge.
   - tone="light" renders white text for dark / green backgrounds (login panel, kiosk).
   - `to` makes the whole lockup a link (home, or /portal on the public portal). */
export function Brand({ size = 30, showText = true, subtitle, tone = "dark", to, className = "" }) {
  const light = tone === "light";
  const textColor = light ? "#ffffff" : "var(--text-strong)";
  const subColor = light ? "rgba(255,255,255,0.72)" : "var(--text-muted)";
  const rwBg = light ? "rgba(255,255,255,0.18)" : "var(--slate-800)";

  const content = (
    <>
      <img src={markUrl} width={size} height={size} alt="SecurePoll RW" style={{ flexShrink: 0 }} />
      {showText && (
        <div style={{ lineHeight: 1.1, minWidth: 0 }}>
          <div className="sp-row sp-gap-2" style={{ alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: textColor, letterSpacing: "-0.01em" }}>
              SecurePoll
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", background: rwBg, color: "#fff", padding: "2px 5px", borderRadius: 4 }}>
              RW
            </span>
          </div>
          {subtitle && <div style={{ fontSize: "var(--text-xs)", color: subColor, marginTop: 1 }}>{subtitle}</div>}
        </div>
      )}
    </>
  );

  const cls = ("sp-row sp-gap-3 " + className).trim();
  const baseStyle = { minWidth: 0 };
  if (to) {
    return (
      <Link to={to} className={cls} style={{ ...baseStyle, textDecoration: "none", cursor: "pointer" }} aria-label="SecurePoll RW — home">
        {content}
      </Link>
    );
  }
  return <div className={cls} style={baseStyle}>{content}</div>;
}

/* Maps any domain status string to the correct tone + readable label. */
export function StatusBadge({ status, dot = true, variant = "soft", size = "md" }) {
  if (!status) return <span className="t-muted">—</span>;
  return (
    <Badge tone={statusTone(status)} variant={variant} size={size} dot={dot}>
      {prettyStatus(status)}
    </Badge>
  );
}
