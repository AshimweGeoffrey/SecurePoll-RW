/* viewport-fit.js — scales each fixed-size SecurePoll RW design to fill the screen.
   - "width" mode  : zoom so the design's width fills the viewport; page scrolls vertically.
   - "contain" mode: zoom so the whole fixed design fits within the viewport, centred by its parent.
   Applied via CSS `zoom`, which (unlike transform) preserves native scrolling, sticky
   positioning and hit-testing. Exposes the chosen scale as `--fit` for layout that must
   counter it (e.g. a 100vh sticky sidebar → height: calc(100vh / var(--fit))). */
(function () {
  var MAP = [
    { sel: ".admin", w: 1440, mode: "width" },
    { sel: ".reg",   w: 1180, mode: "width" },
    { sel: ".pub",   w: 1280, mode: "width" },
    { sel: ".page",  w: 1280, mode: "width" },
    { sel: ".auth",  w: 1280, mode: "width" },
    { sel: ".obs",   w: 1280, mode: "width" },
    { sel: ".kiosk", w: 1280, h: 800, mode: "contain", pad: 32 },
    { sel: ".fm-page > div", w: 412, h: 892, mode: "contain", pad: 48 }
  ];

  function pick() {
    for (var i = 0; i < MAP.length; i++) {
      var e = document.querySelector(MAP[i].sel);
      if (e) return { e: e, c: MAP[i] };
    }
    return null;
  }

  function apply() {
    var f = pick();
    if (!f) return false;
    var e = f.e, c = f.c;
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var s;
    if (c.mode === "contain") {
      var pad = c.pad || 0;
      s = Math.min((vw - pad) / c.w, (vh - pad) / c.h);
      s = Math.max(0.2, s);
    } else {
      s = vw / c.w;
      s = Math.max(0.3, s);
      e.style.margin = "0";                 // drop auto-centering so zoom fills exactly
      document.documentElement.style.overflowX = "hidden";
      document.body.style.overflowX = "hidden";
    }
    e.style.zoom = s;
    e.style.setProperty("--fit", s);
    return true;
  }

  function boot() {
    if (apply()) return;
    var n = 0;
    var iv = setInterval(function () { if (apply() || ++n > 100) clearInterval(iv); }, 40);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  var t;
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(apply, 60); });
})();
