/* loader.js — SecurePoll RW Imigongo loading overlay.
   Builds the Ingabo emblem from converging Imigongo diamond tiles, shows it
   during page/app boot, and auto-hides once everything has loaded.
   API: window.SPLoader.show() / .hide(). Add data-sp-loader="off" to <html> to disable. */
(function () {
  // Apply the saved theme as early as possible (admin pages) so it survives navigation.
  try {
    if (location.pathname.indexOf("admin-audit") !== -1 && localStorage.getItem("sp-theme") === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch (e) {}

  if (document.documentElement.getAttribute("data-sp-loader") === "off") return;

  var BLACK = "#1c1813", CREAM = "#f2ece0";
  var SHIELD = "M24 2.5 C31 7 37 13 37 24 C37 35 31 41 24 45.5 C17 41 11 35 11 24 C11 13 17 7 24 2.5 Z";

  function dia(cx, cy, w, h) {
    return "M" + cx + " " + (cy - h) + " L" + (cx + w) + " " + cy + " L" + cx + " " + (cy + h) + " L" + (cx - w) + " " + cy + " Z";
  }

  // build tile list: central nested chain + side dot columns
  var tiles = [];
  [[24, 12], [24, 24], [24, 36]].forEach(function (p) {
    tiles.push({ cx: p[0], cy: p[1], w: 6.2, h: 6.0, fill: CREAM });
    tiles.push({ cx: p[0], cy: p[1], w: 3.6, h: 3.5, fill: BLACK });
  });
  [14, 34].forEach(function (x) {
    [9, 16.5, 24, 31.5, 39].forEach(function (y, i) {
      tiles.push({ cx: x, cy: y, w: 2.1, h: 2.1, fill: (i % 2 ? BLACK : CREAM), stroke: (i % 2 ? null : BLACK) });
    });
  });
  // stagger order: converge from centre outward
  tiles.forEach(function (t) { t.dist = Math.hypot(t.cx - 24, t.cy - 24); });
  var ordered = tiles.slice().sort(function (a, b) { return a.dist - b.dist; });
  ordered.forEach(function (t, i) { t.i = i; });

  var paths = tiles.map(function (t) {
    var ang = Math.atan2(t.cy - 24, t.cx - 24);
    var d = t.dist < 0.5 ? 0 : 34;            // central tile just scales
    var dx = Math.cos(ang) * d, dy = Math.sin(ang) * d;
    var st = t.stroke ? ' stroke="' + t.stroke + '" stroke-width="0.7"' : "";
    return '<path class="spd" style="--i:' + t.i + ';--dx:' + dx.toFixed(1) + 'px;--dy:' + dy.toFixed(1) + 'px" d="' + dia(t.cx, t.cy, t.w, t.h) + '" fill="' + t.fill + '"' + st + "></path>";
  }).join("");

  var svg =
    '<svg class="sp-loader__svg" viewBox="0 0 48 48" aria-hidden="true">' +
      '<defs><clipPath id="sp-clip"><path d="' + SHIELD + '"></path></clipPath></defs>' +
      '<g clip-path="url(#sp-clip)">' +
        '<rect class="sp-band" x="9" y="1" width="30" height="46" fill="' + CREAM + '"></rect>' +
        '<rect class="sp-band" x="18" y="1" width="12" height="46" fill="' + BLACK + '"></rect>' +
        paths +
        '<line class="sp-line" x1="18" y1="3" x2="18" y2="45"></line>' +
        '<line class="sp-line" x1="30" y1="3" x2="30" y2="45"></line>' +
      "</g>" +
      '<path class="sp-shield" d="' + SHIELD + '"></path>' +
    "</svg>";

  var el = document.createElement("div");
  el.className = "sp-loader";
  el.setAttribute("role", "status");
  el.setAttribute("aria-label", "Loading");
  el.innerHTML =
    '<div class="sp-loader__box">' +
      '<div class="sp-loader__emblem">' + svg + '<div class="sp-orbit"></div></div>' +
      '<div class="sp-loader__cap"><div class="sp-loader__wm">SecurePoll&nbsp;RW</div>' +
        '<div class="sp-loader__dots"><i></i><i></i><i></i></div></div>' +
    "</div>";

  function mount() { (document.body || document.documentElement).appendChild(el); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  var MIN = 5000, start = Date.now(), hidden = false;
  function hide() {
    if (hidden) return; hidden = true;
    el.classList.add("sp-hide");
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 600);
  }
  function show() {
    hidden = false; start = Date.now();
    if (!el.parentNode) mount();
    el.classList.remove("sp-hide");
  }
  function whenReady() {
    var wait = Math.max(0, MIN - (Date.now() - start));
    setTimeout(hide, wait);
  }
  if (document.readyState === "complete") whenReady();
  else window.addEventListener("load", whenReady);
  setTimeout(hide, 12000); // safety net

  window.SPLoader = { show: show, hide: hide };
})();
