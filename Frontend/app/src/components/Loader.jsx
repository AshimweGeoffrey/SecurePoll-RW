import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/* SecurePoll RW loading overlay — ported from the design system's loader.js/.css.
   Imigongo black-and-white diamond tiles converge to assemble the Ingabo emblem,
   with the wordmark and pulsing dots. Styled by styles/loader.css. */

const BLACK = "#1c1813";
const CREAM = "#f2ece0";
const SHIELD = "M24 2.5 C31 7 37 13 37 24 C37 35 31 41 24 45.5 C17 41 11 35 11 24 C11 13 17 7 24 2.5 Z";

function diamond(cx, cy, w, h) {
  return `M${cx} ${cy - h} L${cx + w} ${cy} L${cx} ${cy + h} L${cx - w} ${cy} Z`;
}

// Build the tile list once: central nested diamond chain + two side dot columns.
function buildTiles() {
  const tiles = [];
  [[24, 12], [24, 24], [24, 36]].forEach(([cx, cy]) => {
    tiles.push({ cx, cy, w: 6.2, h: 6.0, fill: CREAM });
    tiles.push({ cx, cy, w: 3.6, h: 3.5, fill: BLACK });
  });
  [14, 34].forEach((x) => {
    [9, 16.5, 24, 31.5, 39].forEach((y, i) => {
      tiles.push({ cx: x, cy: y, w: 2.1, h: 2.1, fill: i % 2 ? BLACK : CREAM, stroke: i % 2 ? null : BLACK });
    });
  });
  tiles.forEach((t) => { t.dist = Math.hypot(t.cx - 24, t.cy - 24); });
  // converge from centre outward: stagger order by distance
  const ordered = tiles.slice().sort((a, b) => a.dist - b.dist);
  ordered.forEach((t, i) => { t.i = i; });
  return tiles.map((t) => {
    const ang = Math.atan2(t.cy - 24, t.cx - 24);
    const d = t.dist < 0.5 ? 0 : 34;
    return { ...t, dx: +(Math.cos(ang) * d).toFixed(1), dy: +(Math.sin(ang) * d).toFixed(1), d: diamond(t.cx, t.cy, t.w, t.h) };
  });
}

function Emblem() {
  const tiles = useMemo(buildTiles, []);
  return (
    <svg className="sp-loader__svg" viewBox="0 0 48 48" aria-hidden="true">
      <defs><clipPath id="sp-clip"><path d={SHIELD} /></clipPath></defs>
      <g clipPath="url(#sp-clip)">
        <rect className="sp-band" x="9" y="1" width="30" height="46" fill={CREAM} />
        <rect className="sp-band" x="18" y="1" width="12" height="46" fill={BLACK} />
        {tiles.map((t, idx) => (
          <path
            key={idx}
            className="spd"
            style={{ "--i": t.i, "--dx": `${t.dx}px`, "--dy": `${t.dy}px` }}
            d={t.d}
            fill={t.fill}
            stroke={t.stroke || undefined}
            strokeWidth={t.stroke ? 0.7 : undefined}
          />
        ))}
        <line className="sp-line" x1="18" y1="3" x2="18" y2="45" />
        <line className="sp-line" x1="30" y1="3" x2="30" y2="45" />
      </g>
      <path className="sp-shield" d={SHIELD} />
    </svg>
  );
}

/* The overlay itself. `hiding` triggers the fade-out transition. */
export function Loader({ hiding }) {
  return (
    <div className={"sp-loader" + (hiding ? " sp-hide" : "")} role="status" aria-label="Loading">
      <div className="sp-loader__box">
        <div className="sp-loader__emblem"><Emblem /><div className="sp-orbit" /></div>
        <div className="sp-loader__cap">
          <div className="sp-loader__wm">SecurePoll&nbsp;RW</div>
          <div className="sp-loader__dots"><i /><i /><i /></div>
        </div>
      </div>
    </div>
  );
}

// Applied accordingly: the full branded intro on cold/first load; a brief cue
// on subsequent in-app navigation so it never feels like a 5s wait everywhere.
const INITIAL_MS = 4500; // first paint / cold boot
const NAV_MS = 850;      // client-side route changes

/* Shows the loader on first load (long) and on every route change (brief). */
export default function RouteLoader() {
  const location = useLocation();
  const [mounted, setMounted] = useState(true); // overlay in the DOM
  const [hiding, setHiding] = useState(false);   // fade-out class
  const firstRun = useRef(true);
  const timers = useRef([]);

  useEffect(() => {
    const hold = firstRun.current ? INITIAL_MS : NAV_MS;
    firstRun.current = false;
    timers.current.forEach(clearTimeout);
    setMounted(true);
    setHiding(false);
    const t1 = setTimeout(() => setHiding(true), hold);
    const t2 = setTimeout(() => setMounted(false), hold + 600); // fade-out transition
    timers.current = [t1, t2];
    return () => timers.current.forEach(clearTimeout);
  }, [location.pathname]);

  if (!mounted) return null;
  return <Loader hiding={hiding} />;
}
