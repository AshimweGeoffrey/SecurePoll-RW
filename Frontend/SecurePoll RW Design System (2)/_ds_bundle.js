/* @ds-bundle: {"format":3,"namespace":"SecurePollRWDesignSystem_92875f","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"ConfidenceMeter","sourcePath":"components/status/ConfidenceMeter.jsx"},{"name":"DecisionPanel","sourcePath":"components/status/DecisionPanel.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"4ba5a5059c24","components/core/Button.jsx":"95808efc7b47","components/core/Card.jsx":"ab8c2a08a9ef","components/forms/Input.jsx":"532820f3d7fa","components/forms/Select.jsx":"3c7cfbb50ba1","components/status/ConfidenceMeter.jsx":"bf3a2ae0e515","components/status/DecisionPanel.jsx":"12f194e5f78c","loader.js":"d673aece936b","ui_kits/admin-audit/AdminLogin.jsx":"e0fb7b192ba7","ui_kits/admin-audit/AdminScreens.jsx":"f12ec96983c5","ui_kits/admin-audit/AdminScreensExtra.jsx":"ceca7a246796","ui_kits/admin-audit/AdminSettings.jsx":"5373f9f988f4","ui_kits/admin-audit/AdminShell.jsx":"f9dcdff3121c","ui_kits/admin-audit/AuditView.jsx":"4d5c7bb8ea59","ui_kits/admin-audit/FraudWidgets.jsx":"98481ddd18e0","ui_kits/admin-audit/RegistryView.jsx":"99acd97f35c0","ui_kits/admin-audit/ReportBuilder.jsx":"03bef9684e78","ui_kits/admin-audit/tweaks-panel.jsx":"6591467622ed","ui_kits/field-mobile/FieldApp.jsx":"420ca23b4375","ui_kits/field-mobile/android-frame.jsx":"70c8c3059eeb","ui_kits/polling-station/PollingKiosk.jsx":"008d24579da1","ui_kits/public-portal/CheckStatus.jsx":"7c5436f4d3ca","ui_kits/public-portal/ObserverDashboard.jsx":"926da823c3eb","ui_kits/public-portal/ObserverLogin.jsx":"1809222483f8","ui_kits/public-portal/ObserverRegister.jsx":"eaf8d102a19d","ui_kits/public-portal/PublicPortal.jsx":"62e40474f250","ui_kits/public-portal/ReportIncident.jsx":"05f70a0f3475","ui_kits/registration/RegistrationApp.jsx":"57cb8ccb5264","viewport-fit.js":"15f6e6b4103c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SecurePollRWDesignSystem_92875f = window.SecurePollRWDesignSystem_92875f || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Badge({
  tone = "neutral",
  variant = "soft",
  size = "md",
  dot = false,
  className = "",
  children,
  ...rest
}) {
  useSpBadgeCSS();
  const cls = ["sp-badge", `sp-badge--${variant}`, `sp-badge--${size}`, `t-${tone}`, className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "sp-badge__dot",
    "aria-hidden": "true"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Button({
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
  const cls = ["sp-btn", `sp-btn--${variant}`, `sp-btn--${size}`, fullWidth ? "sp-btn--full" : "", loading ? "sp-btn--spin" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled || loading
  }, rest), loading && /*#__PURE__*/React.createElement("span", {
    className: "sp-btn__sp",
    "aria-hidden": "true"
  }), !loading && iconLeft && /*#__PURE__*/React.createElement("span", {
    className: "sp-btn__ic"
  }, iconLeft), children, !loading && iconRight && /*#__PURE__*/React.createElement("span", {
    className: "sp-btn__ic"
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  red: "var(--status-rejected)"
};
function Card({
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
  const cls = ["sp-card", `sp-card--${elevation}`, interactive ? "sp-card--interactive" : "", className].filter(Boolean).join(" ");
  const hasHeader = title || subtitle || headerEnd;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), accent && /*#__PURE__*/React.createElement("div", {
    className: "sp-card__accent",
    style: {
      background: ACCENT[accent] || accent
    }
  }), hasHeader && /*#__PURE__*/React.createElement("div", {
    className: "sp-card__hd"
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("div", {
    className: "sp-card__t"
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    className: "sp-card__sub"
  }, subtitle)), headerEnd && /*#__PURE__*/React.createElement("div", {
    className: "sp-card__hd-end"
  }, headerEnd)), /*#__PURE__*/React.createElement("div", {
    className: ["sp-card__body", bodyClassName].filter(Boolean).join(" ")
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Input({
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
  const inputCls = ["sp-input", mono ? "sp-input--mono" : "", size === "lg" ? "sp-input--lg" : "", error ? "sp-input--err" : "", iconLeft ? "sp-input--has-ic-l" : "", iconRight ? "sp-input--has-ic-r" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    className: "sp-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "sp-field__label",
    htmlFor: fid
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "sp-field__req",
    "aria-hidden": "true"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "sp-input-wrap"
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    className: "sp-input__ic sp-input__ic--l"
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    className: inputCls,
    "aria-invalid": !!error
  }, rest)), iconRight && /*#__PURE__*/React.createElement("span", {
    className: "sp-input__ic sp-input__ic--r"
  }, iconRight)), error ? /*#__PURE__*/React.createElement("span", {
    className: "sp-field__err"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "sp-field__hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
const CHEVRON = /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "m6 9 6 6 6-6"
}));
function Select({
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
  const selCls = ["sp-select", size === "lg" ? "sp-select--lg" : "", error ? "sp-select--err" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    className: "sp-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "sp-field__label",
    htmlFor: fid
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "sp-field__req",
    "aria-hidden": "true"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "sp-sel-wrap"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    className: selCls,
    "aria-invalid": !!error
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true,
    hidden: true
  }, placeholder), options ? options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lab = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lab);
  }) : children), /*#__PURE__*/React.createElement("span", {
    className: "sp-sel-chev"
  }, CHEVRON)), error ? /*#__PURE__*/React.createElement("span", {
    className: "sp-field__err"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "sp-field__hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/status/ConfidenceMeter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SP_METER_CSS = `
.sp-meter{ font-family:var(--font-sans); display:flex; flex-direction:column; gap:var(--space-2); }
.sp-meter__top{ display:flex; align-items:baseline; justify-content:space-between; }
.sp-meter__val{ font-family:var(--font-mono); font-weight:var(--fw-bold); letter-spacing:var(--ls-tight); line-height:1; }
.sp-meter__val small{ font-size:0.45em; color:var(--text-muted); font-weight:var(--fw-medium); }
.sp-meter__lbl{ font-size:var(--text-xs); font-weight:var(--fw-bold); letter-spacing:var(--ls-caps); text-transform:uppercase; color:var(--text-muted); white-space:nowrap; }
.sp-meter__track{ position:relative; height:10px; border-radius:var(--radius-pill); background:var(--bg-inset); overflow:visible; box-shadow:var(--inset-hairline); }
.sp-meter__fill{ height:100%; border-radius:var(--radius-pill); transition:width var(--dur-slow) var(--ease-entrance); }
.sp-meter--lg .sp-meter__track{ height:14px; }
.sp-meter--lg .sp-meter__val{ font-size:var(--text-4xl); }
.sp-meter--md .sp-meter__val{ font-size:var(--text-2xl); }
.sp-meter--sm .sp-meter__track{ height:7px; }
.sp-meter--sm .sp-meter__val{ font-size:var(--text-lg); }
.sp-meter__thr{ position:absolute; top:-3px; bottom:-3px; width:2px; background:var(--text-strong); border-radius:2px; }
.sp-meter__thr::after{ content:attr(data-thr); position:absolute; top:-16px; left:50%; transform:translateX(-50%); font-family:var(--font-mono); font-size:9px; color:var(--text-muted); white-space:nowrap; }
.sp-meter__scale{ display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:9px; color:var(--text-subtle); }
.f-green{ background:linear-gradient(90deg, var(--green-400), var(--green-600)); }
.f-amber{ background:linear-gradient(90deg, var(--amber-300), var(--amber-500)); }
.f-red{ background:linear-gradient(90deg, var(--red-400), var(--red-600)); }
.c-green{ color:var(--status-approved-text); }
.c-amber{ color:var(--status-review-text); }
.c-red{ color:var(--status-rejected-text); }
`;
let spMeterInjected = false;
function useSpMeterCSS() {
  React.useEffect(() => {
    if (spMeterInjected) return;
    spMeterInjected = true;
    const s = document.createElement("style");
    s.setAttribute("data-sp", "meter");
    s.textContent = SP_METER_CSS;
    document.head.appendChild(s);
  }, []);
}
function bandOf(v, threshold) {
  if (v >= threshold) return "green";
  if (v >= 0.6) return "amber";
  return "red";
}
function ConfidenceMeter({
  value,
  threshold = 0.8,
  size = "md",
  showValue = true,
  showScale = false,
  label = "Confidence",
  ...rest
}) {
  useSpMeterCSS();
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const band = bandOf(value, threshold);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `sp-meter sp-meter--${size}`
  }, rest), (showValue || label) && /*#__PURE__*/React.createElement("div", {
    className: "sp-meter__top"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "sp-meter__lbl"
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    className: `sp-meter__val c-${band}`
  }, value.toFixed(2), /*#__PURE__*/React.createElement("small", null, " / 1.00"))), /*#__PURE__*/React.createElement("div", {
    className: "sp-meter__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: `sp-meter__fill f-${band}`,
    style: {
      width: `${pct}%`
    }
  }), threshold != null && /*#__PURE__*/React.createElement("div", {
    className: "sp-meter__thr",
    "data-thr": threshold.toFixed(2),
    style: {
      left: `${threshold * 100}%`
    }
  })), showScale && /*#__PURE__*/React.createElement("div", {
    className: "sp-meter__scale"
  }, /*#__PURE__*/React.createElement("span", null, "0.00"), /*#__PURE__*/React.createElement("span", null, "0.50"), /*#__PURE__*/React.createElement("span", null, "1.00")));
}
Object.assign(__ds_scope, { ConfidenceMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/ConfidenceMeter.jsx", error: String((e && e.message) || e) }); }

// components/status/DecisionPanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SP_DECISION_CSS = `
.sp-decision{ font-family:var(--font-sans); background:var(--bg-surface); border:1px solid var(--border-default); border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-md); }
.sp-decision__hd{ display:flex; align-items:center; gap:var(--space-3); padding:var(--space-4) var(--space-5); color:#fff; }
.sp-decision__hd .ic{ width:34px; height:34px; border-radius:var(--radius-md); background:rgba(255,255,255,.22); display:grid; place-items:center; flex-shrink:0; }
.sp-decision__hd .ic svg{ width:20px; height:20px; }
.sp-decision__verdict{ font-family:var(--font-display); font-size:var(--text-2xl); font-weight:var(--fw-bold); letter-spacing:var(--ls-snug); line-height:1; }
.sp-decision__who{ font-size:var(--text-xs); opacity:.9; margin-top:3px; }
.sp-decision__hd-end{ margin-left:auto; text-align:right; font-family:var(--font-mono); }
.sp-decision__hd-end .n{ font-size:var(--text-3xl); font-weight:var(--fw-bold); line-height:1; }
.sp-decision__hd-end .u{ font-size:var(--text-xs); opacity:.85; }

.d-approved .sp-decision__hd{ background:linear-gradient(100deg, var(--green-500), var(--green-700)); }
.d-review .sp-decision__hd{ background:linear-gradient(100deg, var(--amber-400), var(--amber-600)); }
.d-rejected .sp-decision__hd{ background:linear-gradient(100deg, var(--red-500), var(--red-700)); }

.sp-decision__body{ padding:var(--space-5); display:flex; flex-direction:column; gap:var(--space-4); }
.sp-decision__bd{ display:flex; flex-direction:column; gap:0; }
.sp-decision__row{ display:flex; align-items:center; justify-content:space-between; padding:var(--space-2-5,9px) 0; padding-top:9px; padding-bottom:9px; border-bottom:1px solid var(--border-subtle); }
.sp-decision__row:last-child{ border-bottom:none; }
.sp-decision__row .k{ font-size:var(--text-sm); color:var(--text-muted); display:flex; align-items:center; gap:var(--space-2); white-space:nowrap; }
.sp-decision__row .k svg{ width:14px; height:14px; }
.sp-decision__row .v{ font-family:var(--font-mono); font-size:var(--text-sm); font-weight:var(--fw-semibold); color:var(--text-strong); }
.sp-decision__row .v.live{ color:var(--status-approved-text); }
.sp-decision__row .v.spoof{ color:var(--status-rejected-text); }

.sp-decision__expl{ display:flex; gap:var(--space-2-5,10px); background:var(--bg-inset); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:var(--space-3); font-size:var(--text-sm); line-height:1.5; color:var(--text-default); }
.sp-decision__expl svg{ width:16px; height:16px; color:var(--primary-text); flex-shrink:0; margin-top:1px; }
.sp-decision__flags{ display:flex; flex-wrap:wrap; gap:var(--space-2); }
.sp-decision__flag{ font-size:var(--text-2xs); font-weight:var(--fw-semibold); color:var(--status-review-text); background:var(--status-review-soft); border:1px solid var(--status-review); border-radius:var(--radius-sm); padding:3px 8px; display:inline-flex; align-items:center; gap:5px; }
.sp-decision__flag svg{ width:11px; height:11px; }
.sp-decision__review{ display:flex; align-items:center; gap:var(--space-2); font-size:var(--text-xs); font-weight:var(--fw-semibold); color:var(--status-review-text); }
.sp-decision__review svg{ width:14px; height:14px; }
`;
let spDecisionInjected = false;
function useSpDecisionCSS() {
  React.useEffect(() => {
    if (spDecisionInjected) return;
    spDecisionInjected = true;
    const s = document.createElement("style");
    s.setAttribute("data-sp", "decision");
    s.textContent = SP_DECISION_CSS;
    document.head.appendChild(s);
  }, []);
}
const ICONS = {
  approved: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })),
  review: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8v4M12 16h.01"
  })),
  rejected: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))
};
const VERDICT = {
  approved: "APPROVED",
  review: "MANUAL REVIEW",
  rejected: "REJECTED"
};
const FLAG_ICO = /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 22v-7"
}));
const BULB = /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 18 9 18 8a6 6 0 0 0-12 0c0 1 .3 2.2 1.5 3.5.8.8 1.3 1.5 1.5 2.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 18h6M10 22h4"
}));
function decisionOf(d, confidence, threshold) {
  if (d) return d;
  if (confidence >= threshold) return "approved";
  if (confidence >= 0.6) return "review";
  return "rejected";
}
function DecisionPanel({
  decision,
  confidence,
  threshold = 0.8,
  voterName,
  breakdown,
  explanation,
  flags,
  reviewRequired,
  className = "",
  ...rest
}) {
  useSpDecisionCSS();
  const d = decisionOf(decision, confidence, threshold);
  const rows = breakdown ? Array.isArray(breakdown) ? breakdown : Object.entries(breakdown).map(([k, v]) => ({
    label: k,
    value: v
  })) : [];
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `sp-decision d-${d} ${className}`
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "sp-decision__hd"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ic"
  }, ICONS[d]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sp-decision__verdict"
  }, VERDICT[d]), voterName && /*#__PURE__*/React.createElement("div", {
    className: "sp-decision__who"
  }, voterName)), confidence != null && /*#__PURE__*/React.createElement("div", {
    className: "sp-decision__hd-end"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, Math.round(confidence * 100), "%"), /*#__PURE__*/React.createElement("div", {
    className: "u"
  }, "confidence"))), /*#__PURE__*/React.createElement("div", {
    className: "sp-decision__body"
  }, confidence != null && /*#__PURE__*/React.createElement(__ds_scope.ConfidenceMeter, {
    value: confidence,
    threshold: threshold,
    size: "sm",
    label: "Fused score"
  }), rows.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "sp-decision__bd"
  }, rows.map((r, i) => {
    const isLive = String(r.value).toUpperCase() === "LIVE";
    const isSpoof = String(r.value).toUpperCase() === "SPOOFED";
    return /*#__PURE__*/React.createElement("div", {
      className: "sp-decision__row",
      key: i
    }, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, r.label), /*#__PURE__*/React.createElement("span", {
      className: `v${isLive ? " live" : ""}${isSpoof ? " spoof" : ""}`
    }, typeof r.value === "number" ? r.value.toFixed(2) : r.value));
  })), explanation && /*#__PURE__*/React.createElement("div", {
    className: "sp-decision__expl"
  }, BULB, /*#__PURE__*/React.createElement("span", null, explanation)), flags && flags.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "sp-decision__flags"
  }, flags.map((f, i) => /*#__PURE__*/React.createElement("span", {
    className: "sp-decision__flag",
    key: i
  }, FLAG_ICO, f))), reviewRequired && /*#__PURE__*/React.createElement("div", {
    className: "sp-decision__review"
  }, ICONS.review, /*#__PURE__*/React.createElement("span", null, "Officer decision required \u2014 log a justification"))));
}
Object.assign(__ds_scope, { DecisionPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/DecisionPanel.jsx", error: String((e && e.message) || e) }); }

// loader.js
try { (() => {
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
  var BLACK = "#1c1813",
    CREAM = "#f2ece0";
  var SHIELD = "M24 2.5 C31 7 37 13 37 24 C37 35 31 41 24 45.5 C17 41 11 35 11 24 C11 13 17 7 24 2.5 Z";
  function dia(cx, cy, w, h) {
    return "M" + cx + " " + (cy - h) + " L" + (cx + w) + " " + cy + " L" + cx + " " + (cy + h) + " L" + (cx - w) + " " + cy + " Z";
  }

  // build tile list: central nested chain + side dot columns
  var tiles = [];
  [[24, 12], [24, 24], [24, 36]].forEach(function (p) {
    tiles.push({
      cx: p[0],
      cy: p[1],
      w: 6.2,
      h: 6.0,
      fill: CREAM
    });
    tiles.push({
      cx: p[0],
      cy: p[1],
      w: 3.6,
      h: 3.5,
      fill: BLACK
    });
  });
  [14, 34].forEach(function (x) {
    [9, 16.5, 24, 31.5, 39].forEach(function (y, i) {
      tiles.push({
        cx: x,
        cy: y,
        w: 2.1,
        h: 2.1,
        fill: i % 2 ? BLACK : CREAM,
        stroke: i % 2 ? null : BLACK
      });
    });
  });
  // stagger order: converge from centre outward
  tiles.forEach(function (t) {
    t.dist = Math.hypot(t.cx - 24, t.cy - 24);
  });
  var ordered = tiles.slice().sort(function (a, b) {
    return a.dist - b.dist;
  });
  ordered.forEach(function (t, i) {
    t.i = i;
  });
  var paths = tiles.map(function (t) {
    var ang = Math.atan2(t.cy - 24, t.cx - 24);
    var d = t.dist < 0.5 ? 0 : 34; // central tile just scales
    var dx = Math.cos(ang) * d,
      dy = Math.sin(ang) * d;
    var st = t.stroke ? ' stroke="' + t.stroke + '" stroke-width="0.7"' : "";
    return '<path class="spd" style="--i:' + t.i + ';--dx:' + dx.toFixed(1) + 'px;--dy:' + dy.toFixed(1) + 'px" d="' + dia(t.cx, t.cy, t.w, t.h) + '" fill="' + t.fill + '"' + st + "></path>";
  }).join("");
  var svg = '<svg class="sp-loader__svg" viewBox="0 0 48 48" aria-hidden="true">' + '<defs><clipPath id="sp-clip"><path d="' + SHIELD + '"></path></clipPath></defs>' + '<g clip-path="url(#sp-clip)">' + '<rect class="sp-band" x="9" y="1" width="30" height="46" fill="' + CREAM + '"></rect>' + '<rect class="sp-band" x="18" y="1" width="12" height="46" fill="' + BLACK + '"></rect>' + paths + '<line class="sp-line" x1="18" y1="3" x2="18" y2="45"></line>' + '<line class="sp-line" x1="30" y1="3" x2="30" y2="45"></line>' + "</g>" + '<path class="sp-shield" d="' + SHIELD + '"></path>' + "</svg>";
  var el = document.createElement("div");
  el.className = "sp-loader";
  el.setAttribute("role", "status");
  el.setAttribute("aria-label", "Loading");
  el.innerHTML = '<div class="sp-loader__box">' + '<div class="sp-loader__emblem">' + svg + '<div class="sp-orbit"></div></div>' + '<div class="sp-loader__cap"><div class="sp-loader__wm">SecurePoll&nbsp;RW</div>' + '<div class="sp-loader__dots"><i></i><i></i><i></i></div></div>' + "</div>";
  function mount() {
    (document.body || document.documentElement).appendChild(el);
  }
  if (document.body) mount();else document.addEventListener("DOMContentLoaded", mount);
  var MIN = 5000,
    start = Date.now(),
    hidden = false;
  function hide() {
    if (hidden) return;
    hidden = true;
    el.classList.add("sp-hide");
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 600);
  }
  function show() {
    hidden = false;
    start = Date.now();
    if (!el.parentNode) mount();
    el.classList.remove("sp-hide");
  }
  function whenReady() {
    var wait = Math.max(0, MIN - (Date.now() - start));
    setTimeout(hide, wait);
  }
  if (document.readyState === "complete") whenReady();else window.addEventListener("load", whenReady);
  setTimeout(hide, 12000); // safety net

  window.SPLoader = {
    show: show,
    hide: hide
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "loader.js", error: String((e && e.message) || e) }); }

// ui_kits/admin-audit/AdminLogin.jsx
try { (() => {
// AdminLogin.jsx — admin sign-in with two-factor authentication
const {
  useState: useSt,
  useRef: useRf,
  useEffect: useEf
} = React;
const LG = window.SecurePollRWDesignSystem_92875f;
const Il = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function llg() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
function LoginBrand() {
  return /*#__PURE__*/React.createElement("aside", {
    className: "login__brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "login__logo"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark.svg",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", null, "SecurePoll RW")), /*#__PURE__*/React.createElement("div", {
    className: "login__sp"
  }), /*#__PURE__*/React.createElement("h2", null, "Secure access to the national election platform."), /*#__PURE__*/React.createElement("p", {
    className: "login__lede"
  }, "The administration & audit console for the National Electoral Commission. Every session is role-scoped, multi-factor protected, and written to the tamper-evident audit chain."), /*#__PURE__*/React.createElement("div", {
    className: "login__pills"
  }, /*#__PURE__*/React.createElement("span", {
    className: "login__pill"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "key-round"
  }), " Role-based access"), /*#__PURE__*/React.createElement("span", {
    className: "login__pill"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "smartphone"
  }), " MFA required"), /*#__PURE__*/React.createElement("span", {
    className: "login__pill"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "file-check-2"
  }), " Audit-logged")), /*#__PURE__*/React.createElement("div", {
    className: "login__sp"
  }), /*#__PURE__*/React.createElement("div", {
    className: "login__seal"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "lock"
  }), " Authorised personnel only \xB7 activity is monitored & recorded"));
}
function CredStep({
  onContinue
}) {
  const [show, setShow] = useSt(false);
  useEf(llg, [show]);
  return /*#__PURE__*/React.createElement("div", {
    className: "login__card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "login__eyebrow"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "shield-check"
  }), " Administrator portal"), /*#__PURE__*/React.createElement("h1", null, "Sign in"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Use your National Electoral Commission credentials."), /*#__PURE__*/React.createElement("div", {
    className: "login__fields"
  }, /*#__PURE__*/React.createElement(LG.Input, {
    label: "Work email",
    iconLeft: /*#__PURE__*/React.createElement(Il, {
      n: "mail"
    }),
    placeholder: "you@nec.gov.rw",
    defaultValue: "m.kanyana@nec.gov.rw"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(LG.Input, {
    label: "Password",
    type: show ? "text" : "password",
    iconLeft: /*#__PURE__*/React.createElement(Il, {
      n: "lock"
    }),
    iconRight: /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer",
        display: "grid",
        placeItems: "center"
      },
      onClick: () => setShow(!show)
    }, /*#__PURE__*/React.createElement(Il, {
      n: show ? "eye-off" : "eye"
    })),
    defaultValue: "dummy-password"
  }), /*#__PURE__*/React.createElement("div", {
    className: "login__row",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "login__check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  }), " Trust this device for 12h"), /*#__PURE__*/React.createElement("a", {
    className: "login__link",
    href: "#"
  }, "Forgot password?")))), /*#__PURE__*/React.createElement("div", {
    className: "login__cta"
  }, /*#__PURE__*/React.createElement(LG.Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    iconRight: /*#__PURE__*/React.createElement(Il, {
      n: "arrow-right"
    }),
    onClick: onContinue
  }, "Continue")), /*#__PURE__*/React.createElement("div", {
    className: "login__note"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "info"
  }), " Multi-factor authentication is required for every administrator. You'll confirm a 6-digit code next."), /*#__PURE__*/React.createElement("div", {
    className: "login__alt"
  }, "Trouble signing in? ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Contact the IT desk")));
}
function OtpStep({
  onBack,
  onVerify
}) {
  const [code, setCode] = useSt(["", "", "", "", "", ""]);
  const [err, setErr] = useSt(false);
  const refs = useRf([]);
  useEf(llg);
  const setDigit = (i, val) => {
    const v = val.replace(/\D/g, "");
    setErr(false);
    setCode(c => {
      const next = [...c];
      if (v.length > 1) {
        // paste
        v.slice(0, 6).split("").forEach((ch, k) => {
          if (i + k < 6) next[i + k] = ch;
        });
      } else {
        next[i] = v;
      }
      return next;
    });
    if (v && i < 5) refs.current[i + 1] && refs.current[i + 1].focus();
  };
  const onKey = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1] && refs.current[i - 1].focus();
  };
  const filled = code.every(d => d !== "");
  const verify = () => {
    if (!filled) {
      setErr(true);
      return;
    }
    onVerify();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "login__card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "login__eyebrow"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "smartphone"
  }), " Step 2 of 2"), /*#__PURE__*/React.createElement("h1", null, "Two-factor authentication"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Enter the 6-digit code from your authenticator app to finish signing in."), /*#__PURE__*/React.createElement("div", {
    className: "otp-id"
  }, /*#__PURE__*/React.createElement("span", {
    className: "otp-id__av"
  }, "MK"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "otp-id__n"
  }, "M. Kanyana"), /*#__PURE__*/React.createElement("div", {
    className: "otp-id__e"
  }, "m.kanyana@nec.gov.rw")), /*#__PURE__*/React.createElement("button", {
    className: "login__link otp-id__chg",
    onClick: onBack
  }, "Change")), /*#__PURE__*/React.createElement("div", {
    className: "otp-boxes",
    style: {
      marginTop: 18
    }
  }, code.map((d, i) => /*#__PURE__*/React.createElement("input", {
    key: i,
    ref: el => refs.current[i] = el,
    className: "otp-box" + (d ? " filled" : "") + (err ? " err" : ""),
    inputMode: "numeric",
    maxLength: i === 0 ? 6 : 1,
    value: d,
    autoFocus: i === 0,
    onChange: e => setDigit(i, e.target.value),
    onKeyDown: e => onKey(i, e),
    "aria-label": "Digit " + (i + 1)
  }))), err && /*#__PURE__*/React.createElement("div", {
    className: "otp-err"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "alert-circle"
  }), " Enter all 6 digits of your authentication code."), /*#__PURE__*/React.createElement("div", {
    className: "login__cta"
  }, /*#__PURE__*/React.createElement(LG.Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    iconRight: /*#__PURE__*/React.createElement(Il, {
      n: "log-in"
    }),
    onClick: verify
  }, "Verify & sign in")), /*#__PURE__*/React.createElement("div", {
    className: "otp-resend"
  }, "Didn't get a code? ", /*#__PURE__*/React.createElement("button", null, "Resend"), " \xB7 ", /*#__PURE__*/React.createElement("button", null, "Use a recovery code")), /*#__PURE__*/React.createElement("div", {
    className: "otp-app"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "shield-check"
  }), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "Open your authenticator app (any TOTP app) to read the rotating code for SecurePoll RW. Codes refresh every 30 seconds.")));
}
function AdminLogin() {
  const [step, setStep] = useSt("creds");
  useEf(llg, [step]);
  return /*#__PURE__*/React.createElement("div", {
    className: "login"
  }, /*#__PURE__*/React.createElement(LoginBrand, null), /*#__PURE__*/React.createElement("section", {
    className: "login__form"
  }, step === "creds" ? /*#__PURE__*/React.createElement(CredStep, {
    onContinue: () => setStep("otp")
  }) : /*#__PURE__*/React.createElement(OtpStep, {
    onBack: () => setStep("creds"),
    onVerify: () => {
      window.location.href = "index.html";
    }
  })));
}
window.AdminLogin = AdminLogin;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-audit/AdminLogin.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-audit/AdminScreens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// AdminScreens.jsx — dashboard views for the Admin & Audit web app
const {
  useEffect: useEffectA,
  useState: useStateA
} = React;
const DS = window.SecurePollRWDesignSystem_92875f;
const FW = window.FraudWidgets;
const I = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lucideA() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
function Kpi({
  label,
  icon,
  tint,
  value,
  unit,
  delta,
  dir
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kpi__lbl"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "kpi__ic",
    style: {
      background: tint.bg,
      color: tint.fg
    }
  }, /*#__PURE__*/React.createElement(I, {
    n: icon
  }))), /*#__PURE__*/React.createElement("div", {
    className: "kpi__val"
  }, value, unit && /*#__PURE__*/React.createElement("small", null, " ", unit)), delta && /*#__PURE__*/React.createElement("span", {
    className: "kpi__delta " + dir
  }, /*#__PURE__*/React.createElement(I, {
    n: dir === "up" ? "trending-up" : "trending-down"
  }), delta));
}
function DashboardView() {
  useEffectA(lucideA);
  const turnout = [{
    d: "06:00",
    v: 8
  }, {
    d: "08:00",
    v: 22
  }, {
    d: "10:00",
    v: 41
  }, {
    d: "12:00",
    v: 58
  }, {
    d: "14:00",
    v: 71,
    now: true
  }, {
    d: "16:00",
    v: 0,
    m: true
  }, {
    d: "18:00",
    v: 0,
    m: true
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "kpis"
  }, /*#__PURE__*/React.createElement(Kpi, {
    label: "National turnout",
    icon: "users",
    tint: {
      bg: "var(--primary-soft)",
      fg: "var(--primary-text)"
    },
    value: "62.4",
    unit: "%",
    delta: "4.2% vs last hour",
    dir: "up"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Verified today",
    icon: "badge-check",
    tint: {
      bg: "var(--secondary-soft)",
      fg: "var(--secondary-text)"
    },
    value: "1.84",
    unit: "M",
    delta: "12.1k / min",
    dir: "up"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Fraud alerts",
    icon: "shield-alert",
    tint: {
      bg: "var(--status-review-soft)",
      fg: "var(--status-review-text)"
    },
    value: "37",
    delta: "9 critical",
    dir: "down"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Stations online",
    icon: "radio-tower",
    tint: {
      bg: "var(--status-approved-soft)",
      fg: "var(--status-approved-text)"
    },
    value: "2,391",
    unit: "/ 2,410",
    delta: "19 syncing",
    dir: "up"
  })), /*#__PURE__*/React.createElement("div", {
    className: "cols"
  }, /*#__PURE__*/React.createElement(DS.Card, {
    title: "Turnout through the day",
    subtitle: "National \xB7 live, 30s refresh",
    headerEnd: /*#__PURE__*/React.createElement(DS.Badge, {
      tone: "green",
      dot: true
    }, "Live")
  }, /*#__PURE__*/React.createElement("div", {
    className: "bars"
  }, turnout.map((t, i) => /*#__PURE__*/React.createElement("div", {
    className: "bar-col",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "bv"
  }, t.m ? "—" : t.v + "%"), /*#__PURE__*/React.createElement("div", {
    className: "bar" + (t.m ? " muted" : ""),
    style: {
      height: (t.m ? 6 : Math.max(t.v, 4) * 2) + "px",
      opacity: t.m ? .5 : 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "bl"
  }, t.d))))), /*#__PURE__*/React.createElement(DS.Card, {
    title: "Authentication outcomes",
    subtitle: "All verifications today"
  }, /*#__PURE__*/React.createElement("div", {
    className: "donut-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "donut",
    style: {
      background: "conic-gradient(var(--green-500) 0 93%, var(--amber-400) 93% 98.5%, var(--red-500) 98.5% 100%)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "donut__c"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, "93%"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "auto-approved"))), /*#__PURE__*/React.createElement("div", {
    className: "legend-list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "li"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k",
    style: {
      background: "var(--green-500)"
    }
  }), "Approved ", /*#__PURE__*/React.createElement("b", null, "1.71M")), /*#__PURE__*/React.createElement("div", {
    className: "li"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k",
    style: {
      background: "var(--amber-400)"
    }
  }), "Manual review ", /*#__PURE__*/React.createElement("b", null, "101k")), /*#__PURE__*/React.createElement("div", {
    className: "li"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k",
    style: {
      background: "var(--red-500)"
    }
  }), "Rejected ", /*#__PURE__*/React.createElement("b", null, "27.4k")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(DS.Card, {
    title: "Recent activity",
    subtitle: "Across all services"
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Time"), /*#__PURE__*/React.createElement("th", null, "Service"), /*#__PURE__*/React.createElement("th", null, "Event"), /*#__PURE__*/React.createElement("th", null, "Station"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, "14:41:22"), /*#__PURE__*/React.createElement("td", null, "Verification"), /*#__PURE__*/React.createElement("td", null, "Voter verified"), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, "PS-014"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(DS.Badge, {
    tone: "green",
    size: "sm",
    dot: true
  }, "APPROVED"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, "14:41:19"), /*#__PURE__*/React.createElement("td", null, "AI / ML"), /*#__PURE__*/React.createElement("td", null, "Duplicate scan flagged"), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, "PS-203"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(DS.Badge, {
    tone: "amber",
    size: "sm",
    dot: true
  }, "REVIEW"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, "14:41:05"), /*#__PURE__*/React.createElement("td", null, "Election Ops"), /*#__PURE__*/React.createElement("td", null, "Turnout counter sync"), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, "District"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(DS.Badge, {
    tone: "blue",
    size: "sm"
  }, "INFO"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, "14:40:58"), /*#__PURE__*/React.createElement("td", null, "Verification"), /*#__PURE__*/React.createElement("td", null, "Match below threshold"), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, "PS-077"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(DS.Badge, {
    tone: "red",
    size: "sm",
    dot: true
  }, "REJECTED")))))));
}
const CASES = [{
  id: "FR-4471",
  risk: "var(--red-500)",
  title: "Possible impersonation",
  type: "Impersonation",
  desc: "PS-077 · face 0.38 · 14:40",
  score: "0.38",
  tone: "red",
  v: "rejected",
  face: 0.38,
  station: "PS-077 · Kicukiro",
  voter: "Unverified subject",
  officer: "#318",
  detectedBy: "AI Verification (1:1)",
  reg: "#20512",
  opened: "14:40 · today",
  bk: [{
    k: "Face match (1:1)",
    v: 0.38,
    col: "var(--red-500)"
  }, {
    k: "Fingerprint",
    v: 0.45,
    col: "var(--red-500)"
  }, {
    k: "Liveness",
    v: 0.97,
    col: "var(--green-500)"
  }],
  tl: [{
    t: "Capture at station",
    s: "Live capture · device cam-02",
    m: "14:40:02",
    state: "done"
  }, {
    t: "Auto-flagged by AI",
    s: "Face similarity 0.38 — below 0.85 threshold",
    m: "14:40:03",
    state: "done"
  }, {
    t: "Routed to fraud queue",
    s: "Priority: critical · impersonation",
    m: "14:40:05",
    state: "done"
  }, {
    t: "Awaiting investigator decision",
    s: "Dismiss, escalate, or request manual re-capture",
    m: "now",
    state: "current"
  }],
  panel: {
    confidence: 0.38,
    breakdown: {
      "Face match": 0.38,
      "Fingerprint": 0.45,
      "Liveness": "LIVE"
    },
    explanation: "Low similarity to the stored template. No reliable identity match.",
    flags: ["Possible impersonation"]
  }
}, {
  id: "FR-4468",
  risk: "var(--amber-400)",
  title: "Duplicate registration",
  type: "Duplicate",
  desc: "1:N · #20451 ↔ #18992",
  score: "0.88",
  tone: "amber",
  v: "review",
  face: 0.92,
  station: "PS-203 · Gasabo",
  voter: "Eric Niyonsaba",
  officer: "#221",
  detectedBy: "1:N de-duplication",
  reg: "#20451",
  opened: "13:12 · today",
  bk: [{
    k: "1:N top match",
    v: 0.88,
    col: "var(--amber-500)"
  }, {
    k: "Name similarity",
    v: 0.91,
    col: "var(--amber-500)"
  }, {
    k: "DOB match",
    v: 1,
    col: "var(--green-500)"
  }],
  tl: [{
    t: "Registration submitted",
    s: "Reg #20451 · officer #221",
    m: "13:11",
    state: "done"
  }, {
    t: "1:N scan flagged",
    s: "Top match reg #18992 at 0.88 similarity",
    m: "13:12",
    state: "done"
  }, {
    t: "Queued for review",
    s: "Likely duplicate enrollment",
    m: "13:12",
    state: "done"
  }, {
    t: "Under investigation",
    s: "Compare both records before merging or rejecting",
    m: "now",
    state: "current"
  }],
  panel: {
    decision: "review",
    confidence: 0.88,
    breakdown: {
      "1:N top match": 0.88,
      "Name similarity": 0.91,
      "DOB match": "EXACT"
    },
    explanation: "High biometric + demographic overlap with an existing record. Likely duplicate enrollment.",
    flags: ["Duplicate detected"],
    reviewRequired: true
  }
}, {
  id: "FR-4455",
  risk: "var(--amber-400)",
  title: "Document forgery suspected",
  type: "Forgery",
  desc: "Reg #20388 · metadata anomaly",
  score: "SUSP",
  tone: "amber",
  v: "review",
  face: 0.71,
  station: "PS-118 · Rubavu",
  voter: "Claudine Uwineza",
  officer: "#142",
  detectedBy: "Forgery classifier",
  reg: "#20388",
  opened: "11:48 · today",
  bk: [{
    k: "Forgery classifier",
    v: 0.74,
    col: "var(--amber-500)"
  }, {
    k: "Metadata integrity",
    v: 0.32,
    col: "var(--red-500)"
  }, {
    k: "Face match",
    v: 0.71,
    col: "var(--amber-500)"
  }],
  tl: [{
    t: "ID document uploaded",
    s: "Scanned at enrollment",
    m: "11:46",
    state: "done"
  }, {
    t: "Forgery classifier hit",
    s: "Compression + metadata inconsistencies",
    m: "11:48",
    state: "done"
  }, {
    t: "Queued for review",
    s: "Possible tampering",
    m: "11:48",
    state: "done"
  }, {
    t: "Awaiting document re-check",
    s: "Request original document at station",
    m: "now",
    state: "current"
  }],
  panel: {
    decision: "review",
    confidence: 0.61,
    breakdown: {
      "Forgery classifier": "SUSPICIOUS",
      "Metadata check": "ANOMALY"
    },
    explanation: "ID document shows compression and metadata inconsistencies typical of tampering.",
    flags: ["Document forgery"],
    reviewRequired: true
  }
}, {
  id: "FR-4440",
  risk: "var(--slate-400)",
  title: "Registration pattern anomaly",
  type: "Anomaly",
  desc: "Officer #88 · 41 regs / 20 min",
  score: "0.72",
  tone: "neutral",
  v: "review",
  face: 0.83,
  station: "PS-014 · Nyarugenge",
  voter: "Batch · 41 records",
  officer: "#88",
  detectedBy: "Isolation forest",
  reg: "batch",
  opened: "10:30 · today",
  bk: [{
    k: "Isolation forest",
    v: 0.72,
    col: "var(--slate-500)"
  }, {
    k: "Rate z-score",
    v: 0.9,
    col: "var(--amber-500)"
  }, {
    k: "Geo consistency",
    v: 0.6,
    col: "var(--slate-500)"
  }],
  tl: [{
    t: "Burst of registrations",
    s: "41 records in 20 minutes by officer #88",
    m: "10:10–10:30",
    state: "done"
  }, {
    t: "Rate anomaly flagged",
    s: "+3.1σ above officer baseline",
    m: "10:30",
    state: "done"
  }, {
    t: "Queued for spot-check",
    s: "No individual fraud confirmed yet",
    m: "10:30",
    state: "done"
  }, {
    t: "Pending field spot-check",
    s: "Assign supervisor to verify a sample",
    m: "now",
    state: "current"
  }],
  panel: {
    decision: "review",
    confidence: 0.72,
    breakdown: {
      "Isolation forest": 0.72,
      "Rate z-score": "+3.1σ"
    },
    explanation: "Enrollment rate far above the officer's baseline. Recommend spot-check.",
    reviewRequired: true
  }
}];
const RISK_DOT = {
  red: "var(--status-rejected)",
  amber: "var(--status-review)",
  neutral: "var(--slate-400)"
};
function CaseEvidenceModal({
  c,
  onClose,
  onEscalate,
  onDismiss
}) {
  useEffectA(lucideA);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--wide",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Case evidence \xB7 ", c.id), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, c.title, " \xB7 ", c.station, " \xB7 opened ", c.opened)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(I, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Biometric comparison"), /*#__PURE__*/React.createElement(FW.VoterScan, {
    score: c.face,
    verdict: c.v
  }), /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "ID document on file"), /*#__PURE__*/React.createElement("div", {
    className: "fxdoc"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxdoc__tag"
  }, c.reg), /*#__PURE__*/React.createElement("div", {
    className: "fxdoc__sheet"
  }), /*#__PURE__*/React.createElement("div", {
    className: "fxdoc__photo"
  }, /*#__PURE__*/React.createElement(I, {
    n: "user-round"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "fxev__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Match breakdown"), /*#__PURE__*/React.createElement("div", {
    className: "fxbk"
  }, c.bk.map((b, i) => /*#__PURE__*/React.createElement("div", {
    className: "fxbk__row",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, b.k), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, Math.round(b.v * 100), "%")), /*#__PURE__*/React.createElement("div", {
    className: "fxbk__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxbk__fill",
    style: {
      width: b.v * 100 + "%",
      background: b.col
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "AI assessment"), /*#__PURE__*/React.createElement("div", {
    className: "fxai"
  }, /*#__PURE__*/React.createElement(I, {
    n: "sparkles"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, /*#__PURE__*/React.createElement("b", null, c.detectedBy, "."), " ", c.panel.explanation)), /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Case metadata"), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Type"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, c.type)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Station"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, c.station.split(" · ")[0])), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Officer"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, c.officer)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Reg ref"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, c.reg)))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }, /*#__PURE__*/React.createElement(I, {
    n: "lock"
  }), " Viewing is logged to the audit chain"), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "ghost",
    onClick: onDismiss
  }, "Dismiss case"), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(I, {
      n: "flag"
    }),
    onClick: onEscalate
  }, "Escalate"))));
}
function EscalateModal({
  c,
  onClose,
  onConfirm
}) {
  const [assignee, setAssignee] = useStateA("Fraud Investigation Unit");
  const [priority, setPriority] = useStateA("high");
  const [note, setNote] = useStateA("");
  const [notifyNec, setNotifyNec] = useStateA(true);
  const [notifySup, setNotifySup] = useStateA(true);
  useEffectA(lucideA);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Escalate case ", c.id), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, c.title, " \xB7 ", c.station)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(I, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Assign to ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement(DS.Select, {
    value: assignee,
    onChange: e => setAssignee(e.target.value),
    options: ["Fraud Investigation Unit", "District supervisor · " + c.station.split(" · ")[1], "NEC monitoring desk", "Senior auditor (M. Kanyana)"]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Priority"), /*#__PURE__*/React.createElement("div", {
    className: "fx-seg"
  }, ["normal", "high", "urgent"].map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    className: priority === p ? "on " + p : "",
    onClick: () => setPriority(p)
  }, p[0].toUpperCase() + p.slice(1))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Investigation note"), /*#__PURE__*/React.createElement("textarea", {
    className: "fx-ta",
    placeholder: "Add context for the investigator \u2014 what to verify, who to contact, deadlines\u2026",
    value: note,
    onChange: e => setNote(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Notify"), /*#__PURE__*/React.createElement("div", {
    className: "fx-checks"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: notifyNec,
    onChange: e => setNotifyNec(e.target.checked)
  }), " NEC monitoring desk"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: notifySup,
    onChange: e => setNotifySup(e.target.checked)
  }), " Station supervisor (", c.station.split(" · ")[0], ")"))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(DS.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(I, {
      n: "flag"
    }),
    onClick: onConfirm
  }, "Escalate case"))));
}
function DismissModal({
  c,
  onClose,
  onConfirm
}) {
  const [reason, setReason] = useStateA("False positive — identity confirmed");
  const [note, setNote] = useStateA("");
  useEffectA(lucideA);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--narrow",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Dismiss case ", c.id), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, c.title)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(I, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fx-warn"
  }, /*#__PURE__*/React.createElement(I, {
    n: "alert-triangle"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Dismissing closes this case and removes it from the active fraud queue. The action and reason are recorded in the audit chain.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Reason ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement(DS.Select, {
    value: reason,
    onChange: e => setReason(e.target.value),
    options: ["False positive — identity confirmed", "Resolved offline at station", "Duplicate of another case", "Insufficient evidence"]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Note (optional)"), /*#__PURE__*/React.createElement("textarea", {
    className: "fx-ta",
    placeholder: "Add any supporting detail for the record\u2026",
    value: note,
    onChange: e => setNote(e.target.value)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(DS.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(I, {
      n: "check"
    }),
    onClick: onConfirm
  }, "Dismiss case"))));
}
function FraudView() {
  const [sel, setSel] = useStateA(CASES[0].id);
  const [riskFilter, setRiskFilter] = useStateA("all");
  const [modal, setModal] = useStateA(null); // null | evidence | escalate | dismiss
  const [toast, setToast] = useStateA(null);
  useEffectA(lucideA, [sel, riskFilter, modal]);
  const counts = {
    all: CASES.length,
    critical: CASES.filter(x => x.tone === "red").length,
    review: CASES.filter(x => x.tone !== "red").length
  };
  const visible = CASES.filter(x => riskFilter === "all" || (riskFilter === "critical" ? x.tone === "red" : x.tone !== "red"));
  const c = CASES.find(x => x.id === sel) || CASES[0];
  const act = verb => {
    setModal(null);
    setToast(verb + " · " + c.id);
    setTimeout(() => setToast(null), 2600);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fraudx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpis"
  }, /*#__PURE__*/React.createElement(Kpi, {
    label: "Open cases",
    icon: "folder-open",
    tint: {
      bg: "var(--status-review-soft)",
      fg: "var(--status-review-text)"
    },
    value: "37",
    delta: "9 critical \xB7 28 review",
    dir: "down"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Duplicates caught",
    icon: "copy-x",
    tint: {
      bg: "var(--secondary-soft)",
      fg: "var(--secondary-text)"
    },
    value: "12",
    unit: "today",
    delta: "1:N matches",
    dir: "up"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Impersonation blocked",
    icon: "user-x",
    tint: {
      bg: "var(--status-rejected-soft)",
      fg: "var(--status-rejected-text)"
    },
    value: "5",
    unit: "today",
    delta: "sub-threshold faces",
    dir: "down"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Median resolution",
    icon: "timer",
    tint: {
      bg: "var(--status-approved-soft)",
      fg: "var(--status-approved-text)"
    },
    value: "3.4",
    unit: "h",
    delta: "18% faster vs last wk",
    dir: "up"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxbar__sr"
  }, /*#__PURE__*/React.createElement(DS.Input, {
    iconLeft: /*#__PURE__*/React.createElement(I, {
      n: "search"
    }),
    placeholder: "Search cases by ID, voter, station or officer\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxbar__seg"
  }, [["all", "All"], ["critical", "Critical"], ["review", "Review"]].map(([k, lbl]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: "fxbar__chip" + (riskFilter === k ? " on" : ""),
    onClick: () => setRiskFilter(k)
  }, lbl, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, counts[k])))), /*#__PURE__*/React.createElement("div", {
    className: "fxbar__sel"
  }, /*#__PURE__*/React.createElement(DS.Select, {
    options: ["All types", "Impersonation", "Duplicate", "Forgery", "Anomaly"]
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxbar__sel"
  }, /*#__PURE__*/React.createElement(DS.Select, {
    options: ["All stations", "PS-077", "PS-203", "PS-118", "PS-014"]
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fxmain"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxq"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxq__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Case queue"), /*#__PURE__*/React.createElement("div", {
    className: "c"
  }, visible.length, " of ", CASES.length, " cases")), /*#__PURE__*/React.createElement("button", {
    className: "fxq__sort"
  }, /*#__PURE__*/React.createElement(I, {
    n: "arrow-down-wide-narrow"
  }), " Risk")), /*#__PURE__*/React.createElement("div", {
    className: "fxq__list"
  }, visible.map(x => /*#__PURE__*/React.createElement("button", {
    key: x.id,
    className: "fxcase" + (x.id === sel ? " on" : ""),
    onClick: () => setSel(x.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxcase__dot",
    style: {
      background: RISK_DOT[x.tone],
      color: RISK_DOT[x.tone]
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "fxcase__tx"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxcase__top"
  }, /*#__PURE__*/React.createElement(DS.Badge, {
    tone: x.tone === "neutral" ? "neutral" : x.tone,
    size: "sm"
  }, x.type), /*#__PURE__*/React.createElement("span", {
    className: "fxcase__t"
  }, x.title)), /*#__PURE__*/React.createElement("span", {
    className: "fxcase__m"
  }, x.id, " \xB7 ", x.desc)), /*#__PURE__*/React.createElement("span", {
    className: "fxcase__sc"
  }, /*#__PURE__*/React.createElement("span", {
    className: "v",
    style: {
      color: RISK_DOT[x.tone]
    }
  }, x.score), /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "score")))))), /*#__PURE__*/React.createElement("div", {
    className: "fxd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxd__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxd__hl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxd__hid"
  }, c.id, " \xB7 ", c.station), /*#__PURE__*/React.createElement("h2", null, c.title), /*#__PURE__*/React.createElement("div", {
    className: "fxd__badges"
  }, /*#__PURE__*/React.createElement(DS.Badge, {
    tone: c.tone === "neutral" ? "neutral" : c.tone,
    dot: true
  }, c.v === "rejected" ? "CRITICAL" : "NEEDS REVIEW"), /*#__PURE__*/React.createElement(DS.Badge, {
    tone: "neutral",
    size: "sm"
  }, c.type), /*#__PURE__*/React.createElement(DS.Badge, {
    tone: "blue",
    size: "sm"
  }, c.detectedBy))), /*#__PURE__*/React.createElement("div", {
    className: "fxd__act"
  }, /*#__PURE__*/React.createElement(DS.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(I, {
      n: "image"
    }),
    onClick: () => setModal("evidence")
  }, "View evidence"), /*#__PURE__*/React.createElement(DS.Button, {
    size: "sm",
    variant: "ghost",
    onClick: () => setModal("dismiss")
  }, "Dismiss"), /*#__PURE__*/React.createElement(DS.Button, {
    size: "sm",
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(I, {
      n: "flag"
    }),
    onClick: () => setModal("escalate")
  }, "Escalate"))), /*#__PURE__*/React.createElement("div", {
    className: "fxd__grid"
  }, /*#__PURE__*/React.createElement(DS.Card, {
    title: "Biometric face scan",
    subtitle: c.station + " · device cam-02",
    headerEnd: /*#__PURE__*/React.createElement(DS.Badge, {
      tone: "blue",
      size: "sm",
      dot: true
    }, "1:1 VERIFY")
  }, /*#__PURE__*/React.createElement(FW.VoterScan, {
    score: c.face,
    verdict: c.v
  })), /*#__PURE__*/React.createElement(DS.DecisionPanel, _extends({
    voterName: c.title
  }, c.panel))), /*#__PURE__*/React.createElement("div", {
    className: "fxd__grid"
  }, /*#__PURE__*/React.createElement(DS.Card, {
    title: "Case details",
    subtitle: "Origin & attribution"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxmeta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Type"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, c.type)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Subject"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, c.voter)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Station"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, c.station.split(" · ")[0])), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Officer"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, c.officer)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Reg ref"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, c.reg)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Opened"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, c.opened))), /*#__PURE__*/React.createElement("div", {
    className: "fxflags"
  }, (c.panel.flags || ["Pattern anomaly"]).map((f, i) => /*#__PURE__*/React.createElement(DS.Badge, {
    key: i,
    tone: c.tone === "neutral" ? "neutral" : c.tone,
    size: "sm",
    dot: true
  }, f)))), /*#__PURE__*/React.createElement(DS.Card, {
    title: "Investigation timeline",
    subtitle: "Audit-logged events"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxtl"
  }, c.tl.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "fxtl-step " + s.state,
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxtl-dot"
  }, /*#__PURE__*/React.createElement(I, {
    n: s.state === "done" ? "check" : "loader"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxtl-bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tt"
  }, s.t), /*#__PURE__*/React.createElement("div", {
    className: "ts"
  }, s.s), /*#__PURE__*/React.createElement("div", {
    className: "tm"
  }, s.m))))))))), /*#__PURE__*/React.createElement(DS.Card, {
    title: "Fraud cases by district",
    subtitle: "Live geographic distribution \xB7 all open cases",
    headerEnd: /*#__PURE__*/React.createElement(DS.Badge, {
      tone: "red",
      size: "sm",
      dot: true
    }, "HEATMAP")
  }, /*#__PURE__*/React.createElement(FW.FraudHeatmap, null)), modal === "evidence" && /*#__PURE__*/React.createElement(CaseEvidenceModal, {
    c: c,
    onClose: () => setModal(null),
    onEscalate: () => setModal("escalate"),
    onDismiss: () => setModal("dismiss")
  }), modal === "escalate" && /*#__PURE__*/React.createElement(EscalateModal, {
    c: c,
    onClose: () => setModal(null),
    onConfirm: () => act("Escalated")
  }), modal === "dismiss" && /*#__PURE__*/React.createElement(DismissModal, {
    c: c,
    onClose: () => setModal(null),
    onConfirm: () => act("Dismissed")
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "fx-toast"
  }, /*#__PURE__*/React.createElement(I, {
    n: "check-circle",
    s: {
      width: 16,
      height: 16
    }
  }), toast));
}
window.AdminScreens = {
  DashboardView,
  FraudView
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-audit/AdminScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-audit/AdminScreensExtra.jsx
try { (() => {
// AdminScreensExtra.jsx — Reporting, Users & roles, Encryption views
const {
  useEffect: useEffectX,
  useState: useStateX
} = React;
const DSX = window.SecurePollRWDesignSystem_92875f;
const FWX = window.FraudWidgets;
const IX = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lucideX() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}

/* ============================= REPORTING ============================= */
const RPT_CATS = [{
  id: "turnout",
  label: "Turnout report",
  icon: "users",
  desc: "By district & hour",
  tint: {
    bg: "var(--primary-soft)",
    fg: "var(--primary-text)"
  }
}, {
  id: "verify",
  label: "Verification",
  icon: "badge-check",
  desc: "Outcomes & throughput",
  tint: {
    bg: "var(--secondary-soft)",
    fg: "var(--secondary-text)"
  }
}, {
  id: "fraud",
  label: "Fraud & cases",
  icon: "shield-alert",
  desc: "Flagged & resolved",
  tint: {
    bg: "var(--status-review-soft)",
    fg: "var(--status-review-text)"
  }
}, {
  id: "audit",
  label: "Audit export",
  icon: "file-check-2",
  desc: "Signed log range",
  tint: {
    bg: "var(--status-approved-soft)",
    fg: "var(--status-approved-text)"
  }
}];
const RPT_PREVIEW = {
  turnout: {
    stats: [["Total turnout", "62.4%"], ["Peak hour", "12:00–13:00"], ["Highest district", "Gasabo · 71%"], ["Lowest district", "Burera · 48%"]],
    bars: [41, 58, 71, 66, 52, 38, 29]
  },
  verify: {
    stats: [["Verifications", "1.84M"], ["Auto-approved", "93.0%"], ["Manual review", "101k"], ["Avg. latency", "1.4s"]],
    bars: [62, 70, 88, 91, 84, 60, 44]
  },
  fraud: {
    stats: [["Cases opened", "37"], ["Critical", "9"], ["Resolved", "21"], ["False-positive rate", "11%"]],
    bars: [9, 14, 22, 18, 12, 7, 5]
  },
  audit: {
    stats: [["Entries in range", "8.41M"], ["Chain breaks", "0"], ["Format", "Signed CSV + JWS"], ["Coverage", "All services"]],
    bars: [50, 55, 60, 58, 62, 66, 70]
  }
};
const RPT_RECENT = [{
  name: "National turnout — 14:00 snapshot",
  who: "M. Kanyana",
  when: "14:05",
  fmt: "PDF",
  tone: "green",
  st: "READY"
}, {
  name: "Verification outcomes — daily",
  who: "Scheduled",
  when: "12:00",
  fmt: "XLSX",
  tone: "green",
  st: "READY"
}, {
  name: "Fraud case digest — week 21",
  who: "A. Uwase",
  when: "11:42",
  fmt: "PDF",
  tone: "amber",
  st: "GENERATING"
}, {
  name: "Audit export — 06:00–12:00",
  who: "Scheduled",
  when: "12:00",
  fmt: "CSV",
  tone: "green",
  st: "READY"
}];
function ReportingView() {
  const [cat, setCat] = useStateX("turnout");
  const [fmt, setFmt] = useStateX("PDF");
  useEffectX(lucideX, [cat, fmt]);
  const pv = RPT_PREVIEW[cat];
  const active = RPT_CATS.find(c => c.id === cat);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "rpt-cats"
  }, RPT_CATS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    className: "rpt-cat" + (c.id === cat ? " sel" : ""),
    onClick: () => setCat(c.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "rpt-cat__ic",
    style: {
      background: c.tint.bg,
      color: c.tint.fg
    }
  }, /*#__PURE__*/React.createElement(IX, {
    n: c.icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "rpt-cat__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, c.label), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, c.desc)), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check",
    className: "rpt-cat__chk"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "cols",
    style: {
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(DSX.Card, {
    title: "Configure report",
    subtitle: active.label
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement(DSX.Select, {
    label: "Date range",
    options: ["Today (live)", "Yesterday", "Last 7 days", "Custom range…"]
  }), /*#__PURE__*/React.createElement(DSX.Select, {
    label: "Region",
    options: ["All districts", "Kigali City", "Northern", "Southern", "Eastern", "Western"]
  }), /*#__PURE__*/React.createElement(DSX.Select, {
    label: "Granularity",
    options: ["By district", "By constituency", "By polling station", "Hourly"]
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "fld-lbl"
  }, "Format"), /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, ["PDF", "XLSX", "CSV"].map(f => /*#__PURE__*/React.createElement("button", {
    key: f,
    className: "seg__b" + (fmt === f ? " on" : ""),
    onClick: () => setFmt(f)
  }, f))))), /*#__PURE__*/React.createElement("div", {
    className: "opt-row"
  }, /*#__PURE__*/React.createElement("label", {
    className: "chk"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("span", {
    className: "chk__box"
  }), /*#__PURE__*/React.createElement("span", {
    className: "chk__t"
  }, "Include signed integrity hash")), /*#__PURE__*/React.createElement("label", {
    className: "chk"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  }), /*#__PURE__*/React.createElement("span", {
    className: "chk__box"
  }), /*#__PURE__*/React.createElement("span", {
    className: "chk__t"
  }, "Schedule daily at 12:00"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(DSX.Button, {
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "file-down"
    })
  }, "Generate ", fmt), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "calendar-clock"
    })
  }, "Schedule"))), /*#__PURE__*/React.createElement(DSX.Card, {
    title: "Preview",
    subtitle: "Estimated \xB7 refreshes on generate",
    headerEnd: /*#__PURE__*/React.createElement(DSX.Badge, {
      tone: "blue",
      size: "sm"
    }, "DRAFT")
  }, /*#__PURE__*/React.createElement("div", {
    className: "mini-bars"
  }, pv.bars.map((v, i) => {
    const mx = Math.max(...pv.bars);
    return /*#__PURE__*/React.createElement("div", {
      className: "mb-col",
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      className: "mb",
      style: {
        height: Math.round(Math.max(v / mx, 0.06) * 100) + "%"
      }
    }));
  })), /*#__PURE__*/React.createElement("div", {
    className: "stat-lines"
  }, pv.stats.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "stat-line",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, s[0]), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, s[1])))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), window.TurnoutDemographics ? /*#__PURE__*/React.createElement(window.TurnoutDemographics, null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), window.ReportBuilder ? /*#__PURE__*/React.createElement(window.ReportBuilder, null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(DSX.Card, {
    title: "Geographic distribution",
    subtitle: "Fraud cases by district \xB7 feeds the fraud & cases report",
    headerEnd: /*#__PURE__*/React.createElement(DSX.Badge, {
      tone: "red",
      size: "sm",
      dot: true
    }, "HEATMAP")
  }, /*#__PURE__*/React.createElement(FWX.FraudHeatmap, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(DSX.Card, {
    title: "Recent reports",
    subtitle: "Generated & scheduled",
    headerEnd: /*#__PURE__*/React.createElement(DSX.Button, {
      size: "sm",
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(IX, {
        n: "history"
      })
    }, "View all")
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Report"), /*#__PURE__*/React.createElement("th", null, "Requested by"), /*#__PURE__*/React.createElement("th", null, "Time"), /*#__PURE__*/React.createElement("th", null, "Format"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, RPT_RECENT.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    className: "row-hover",
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "nm"
  }, r.name), /*#__PURE__*/React.createElement("td", null, r.who), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.when), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(DSX.Badge, {
    tone: "neutral",
    size: "sm"
  }, r.fmt)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(DSX.Badge, {
    tone: r.tone,
    size: "sm",
    dot: true
  }, r.st)), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement(IX, {
    n: r.st === "READY" ? "download" : "loader",
    s: {
      width: 15,
      height: 15,
      color: "var(--text-subtle)"
    }
  }))))))));
}

/* ============================= USERS & ROLES ============================= */
const ROLES = [{
  id: "super",
  name: "Super Admin",
  n: 3,
  tone: "red",
  perms: "Full control · key custody · user mgmt"
}, {
  id: "auditor",
  name: "Auditor",
  n: 11,
  tone: "green",
  perms: "Read-all · verify chain · export"
}, {
  id: "officer",
  name: "Election Officer",
  n: 26,
  tone: "blue",
  perms: "Registry · verification · stations"
}, {
  id: "observer",
  name: "Observer",
  n: 6,
  tone: "neutral",
  perms: "Read-only dashboards"
}, {
  id: "support",
  name: "Support",
  n: 2,
  tone: "amber",
  perms: "Reset sessions · device mgmt"
}];
const USERS = [{
  in: "MK",
  name: "M. Kanyana",
  email: "m.kanyana@nec.gov.rw",
  role: "Auditor",
  tone: "green",
  dist: "National",
  mfa: true,
  last: "now"
}, {
  in: "AU",
  name: "Aline Uwase",
  email: "a.uwase@nec.gov.rw",
  role: "Election Officer",
  tone: "blue",
  dist: "Nyarugenge",
  mfa: true,
  last: "4m ago"
}, {
  in: "EM",
  name: "Eric Mugisha",
  email: "e.mugisha@nec.gov.rw",
  role: "Super Admin",
  tone: "red",
  dist: "National",
  mfa: true,
  last: "22m ago"
}, {
  in: "CI",
  name: "Chantal Ingabire",
  email: "c.ingabire@nec.gov.rw",
  role: "Observer",
  tone: "neutral",
  dist: "Kicukiro",
  mfa: true,
  last: "1h ago"
}, {
  in: "PH",
  name: "Patrick Habimana",
  email: "p.habimana@nec.gov.rw",
  role: "Support",
  tone: "amber",
  dist: "Gasabo",
  mfa: false,
  last: "3h ago"
}];
const PERM_GROUPS = [{
  k: "registry",
  t: "Voter registry",
  s: "View & edit voter records",
  ic: "users"
}, {
  k: "verify",
  t: "Verification",
  s: "Approve / reject at stations",
  ic: "badge-check"
}, {
  k: "fraud",
  t: "Fraud & cases",
  s: "Investigate, escalate, dismiss",
  ic: "shield-alert"
}, {
  k: "audit",
  t: "Audit & chain",
  s: "Read log, verify integrity, export",
  ic: "file-check-2"
}, {
  k: "users",
  t: "Users & roles",
  s: "Manage admins & permissions",
  ic: "user-cog"
}, {
  k: "keys",
  t: "Keys & encryption",
  s: "Key custody, rotation, HSM",
  ic: "key-round"
}];
const ROLE_PERMS = {
  super: ["registry", "verify", "fraud", "audit", "users", "keys"],
  auditor: ["audit", "registry"],
  officer: ["registry", "verify", "fraud"],
  observer: ["audit"],
  support: ["users"]
};
function InviteUserModal({
  onClose,
  onConfirm
}) {
  useEffectX(lucideX);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Invite administrator"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, "They'll receive an email to set a password & enroll MFA")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IX, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(DSX.Input, {
    label: "Full name",
    placeholder: "Given & family name"
  }), /*#__PURE__*/React.createElement(DSX.Input, {
    label: "Work email",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "mail"
    }),
    placeholder: "name@nec.gov.rw"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Role"), /*#__PURE__*/React.createElement(DSX.Select, {
    options: ["Auditor", "Election Officer", "Super Admin", "Observer", "Support"]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "District scope"), /*#__PURE__*/React.createElement(DSX.Select, {
    options: ["National", "Nyarugenge", "Gasabo", "Kicukiro", "Musanze"]
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fx-warn"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "shield-check"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "MFA enrollment is mandatory. The account stays inactive until the invitee verifies their email and sets up an authenticator.")))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "send"
    }),
    onClick: onConfirm
  }, "Send invitation"))));
}
function UserDetailModal({
  u,
  onClose,
  onEdit,
  onReset,
  onSuspend
}) {
  useEffectX(lucideX);
  const sessions = [{
    ic: "monitor",
    t: "Chrome · Windows 11",
    m: "10.2.5.4 · " + u.dist + " · current",
    current: true
  }, {
    ic: "smartphone",
    t: "SecurePoll mobile · Android",
    m: "Kigali · " + u.last,
    current: false
  }];
  const activity = [{
    t: "Signed in",
    s: "MFA verified (TOTP)",
    m: u.last,
    state: "done"
  }, {
    t: "Exported registry slice",
    s: "4,812 rows · signed CSV",
    m: "14:38",
    state: "done"
  }, {
    t: "Edited a permission set",
    s: "Support role scope",
    m: "13:50",
    state: "done"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--wide",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "User account"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, u.email)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IX, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "vprof"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vprof__av",
    style: {
      background: "var(--secondary-soft)",
      color: "var(--secondary-text)",
      fontFamily: "var(--font-display)",
      fontSize: 24,
      fontWeight: 700
    }
  }, u.in), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "vprof__n"
  }, u.name), /*#__PURE__*/React.createElement("div", {
    className: "vprof__id"
  }, u.email), /*#__PURE__*/React.createElement("div", {
    className: "vprof__badges"
  }, /*#__PURE__*/React.createElement(DSX.Badge, {
    tone: u.tone,
    dot: true
  }, u.role), /*#__PURE__*/React.createElement(DSX.Badge, {
    tone: "neutral",
    size: "sm"
  }, u.dist), /*#__PURE__*/React.createElement(DSX.Badge, {
    tone: u.mfa ? "green" : "amber",
    size: "sm",
    dot: true
  }, u.mfa ? "MFA ON" : "MFA PENDING"))), /*#__PURE__*/React.createElement(DSX.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "pencil"
    }),
    onClick: onEdit
  }, "Edit role")), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Active sessions"), /*#__PURE__*/React.createElement("div", null, sessions.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "sess-row",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "sess-row__ic"
  }, /*#__PURE__*/React.createElement(IX, {
    n: s.ic
  })), /*#__PURE__*/React.createElement("div", {
    className: "sess-row__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sess-row__t"
  }, s.t, s.current && /*#__PURE__*/React.createElement(DSX.Badge, {
    tone: "green",
    size: "sm",
    dot: true
  }, "CURRENT")), /*#__PURE__*/React.createElement("div", {
    className: "sess-row__m"
  }, s.m)), !s.current && /*#__PURE__*/React.createElement("button", {
    className: "sess-revoke"
  }, "Revoke"))))), /*#__PURE__*/React.createElement("div", {
    className: "fxev__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Recent activity"), /*#__PURE__*/React.createElement("div", {
    className: "fxtl"
  }, activity.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "fxtl-step done",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxtl-dot"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "check"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxtl-bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tt"
  }, s.t), /*#__PURE__*/React.createElement("div", {
    className: "ts"
  }, s.s), /*#__PURE__*/React.createElement("div", {
    className: "tm"
  }, s.m)))))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "lock"
  }), " Account actions are audit-logged"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "key-round"
    }),
    onClick: onReset
  }, "Reset MFA"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "user-x"
    }),
    onClick: onSuspend
  }, "Suspend"))));
}
function EditUserModal({
  u,
  onClose,
  onSave
}) {
  const [mfa, setMfa] = useStateX(u.mfa);
  useEffectX(lucideX, [mfa]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Edit user"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, u.name, " \xB7 ", u.email)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IX, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Role"), /*#__PURE__*/React.createElement(DSX.Select, {
    defaultValue: u.role,
    options: ["Auditor", "Election Officer", "Super Admin", "Observer", "Support"]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "District scope"), /*#__PURE__*/React.createElement(DSX.Select, {
    defaultValue: u.dist,
    options: ["National", "Nyarugenge", "Gasabo", "Kicukiro", "Musanze"]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Account status"), /*#__PURE__*/React.createElement(DSX.Select, {
    options: ["Active", "Suspended", "Invitation pending"]
  })), /*#__PURE__*/React.createElement("div", {
    className: "perm-row",
    style: {
      borderBottom: "none",
      padding: "4px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "perm-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "perm-row__ic"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "shield-check"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "perm-row__t"
  }, "Require MFA"), /*#__PURE__*/React.createElement("div", {
    className: "perm-row__s"
  }, "Authenticator app at every sign-in"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "set-switch",
    "data-on": mfa ? "1" : "0",
    role: "switch",
    "aria-checked": mfa,
    onClick: () => setMfa(!mfa)
  }, /*#__PURE__*/React.createElement("i", null))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "check"
    }),
    onClick: onSave
  }, "Save changes"))));
}
function RoleModal({
  role,
  onClose,
  onSave
}) {
  const init = {};
  PERM_GROUPS.forEach(g => {
    init[g.k] = role ? (ROLE_PERMS[role.id] || []).includes(g.k) : false;
  });
  const [perms, setPerms] = useStateX(init);
  useEffectX(lucideX, [perms]);
  const toggle = k => setPerms(p => ({
    ...p,
    [k]: !p[k]
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--mid",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, role ? "Edit role · " + role.name : "Create role"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, role ? role.n + " users assigned" : "Define a new permission set")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IX, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(DSX.Input, {
    label: "Role name",
    defaultValue: role ? role.name : "",
    placeholder: "e.g. District auditor"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Base template"), /*#__PURE__*/React.createElement(DSX.Select, {
    options: ["Custom", "Auditor", "Election Officer", "Observer"]
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Permissions"), /*#__PURE__*/React.createElement("div", null, PERM_GROUPS.map(g => /*#__PURE__*/React.createElement("div", {
    className: "perm-row",
    key: g.k
  }, /*#__PURE__*/React.createElement("div", {
    className: "perm-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "perm-row__ic"
  }, /*#__PURE__*/React.createElement(IX, {
    n: g.ic
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "perm-row__t"
  }, g.t), /*#__PURE__*/React.createElement("div", {
    className: "perm-row__s"
  }, g.s))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "set-switch",
    "data-on": perms[g.k] ? "1" : "0",
    role: "switch",
    "aria-checked": perms[g.k],
    onClick: () => toggle(g.k)
  }, /*#__PURE__*/React.createElement("i", null)))))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "check"
    }),
    onClick: onSave
  }, role ? "Save role" : "Create role"))));
}
function ConfirmUserModal({
  kind,
  u,
  onClose,
  onConfirm
}) {
  const reset = kind === "resetmfa";
  useEffectX(lucideX);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--narrow",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, reset ? "Reset MFA" : "Suspend user"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, u.name, " \xB7 ", u.email)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IX, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fx-warn"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "alert-triangle"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, reset ? "This clears the user's authenticator enrollment. They must re-enroll MFA on next sign-in before regaining access." : "Suspending immediately ends all active sessions and blocks sign-in until an admin re-activates the account.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Reason ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement(DSX.Select, {
    options: reset ? ["Lost device", "Suspected compromise", "Routine reset", "User request"] : ["Suspected compromise", "Role ended", "Policy violation", "Extended leave"]
  })))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: reset ? "key-round" : "user-x"
    }),
    onClick: onConfirm
  }, reset ? "Reset MFA" : "Suspend user"))));
}
function UsersView() {
  const [modal, setModal] = useStateX(null);
  const [selUser, setSelUser] = useStateX(null);
  const [selRole, setSelRole] = useStateX(null);
  const [toast, setToast] = useStateX(null);
  const uFire = m => {
    setModal(null);
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };
  useEffectX(lucideX, [modal]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "kpis"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kpi__lbl"
  }, "Admin users"), /*#__PURE__*/React.createElement("span", {
    className: "kpi__ic",
    style: {
      background: "var(--primary-soft)",
      color: "var(--primary-text)"
    }
  }, /*#__PURE__*/React.createElement(IX, {
    n: "users"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "kpi__val"
  }, "48"), /*#__PURE__*/React.createElement("span", {
    className: "kpi__delta up"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "user-plus"
  }), "3 this week")), /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kpi__lbl"
  }, "Active sessions"), /*#__PURE__*/React.createElement("span", {
    className: "kpi__ic",
    style: {
      background: "var(--secondary-soft)",
      color: "var(--secondary-text)"
    }
  }, /*#__PURE__*/React.createElement(IX, {
    n: "monitor-dot"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "kpi__val"
  }, "12"), /*#__PURE__*/React.createElement("span", {
    className: "kpi__delta up"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "circle"
  }), "all MFA-verified")), /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kpi__lbl"
  }, "Pending invites"), /*#__PURE__*/React.createElement("span", {
    className: "kpi__ic",
    style: {
      background: "var(--status-review-soft)",
      color: "var(--status-review-text)"
    }
  }, /*#__PURE__*/React.createElement(IX, {
    n: "mail"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "kpi__val"
  }, "3"), /*#__PURE__*/React.createElement("span", {
    className: "kpi__delta down"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "clock"
  }), "awaiting accept")), /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kpi__lbl"
  }, "MFA coverage"), /*#__PURE__*/React.createElement("span", {
    className: "kpi__ic",
    style: {
      background: "var(--status-approved-soft)",
      color: "var(--status-approved-text)"
    }
  }, /*#__PURE__*/React.createElement(IX, {
    n: "shield-check"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "kpi__val"
  }, "98", /*#__PURE__*/React.createElement("small", null, "%")), /*#__PURE__*/React.createElement("span", {
    className: "kpi__delta down"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "alert-triangle"
  }), "1 user pending"))), /*#__PURE__*/React.createElement("div", {
    className: "cols",
    style: {
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(DSX.Card, {
    title: "Administrators",
    subtitle: "48 users \xB7 5 roles",
    headerEnd: /*#__PURE__*/React.createElement(DSX.Button, {
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(IX, {
        n: "user-plus"
      }),
      onClick: () => setModal("invite")
    }, "Invite user")
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "User"), /*#__PURE__*/React.createElement("th", null, "Role"), /*#__PURE__*/React.createElement("th", null, "Scope"), /*#__PURE__*/React.createElement("th", null, "MFA"), /*#__PURE__*/React.createElement("th", null, "Last active"))), /*#__PURE__*/React.createElement("tbody", null, USERS.map((u, i) => /*#__PURE__*/React.createElement("tr", {
    className: "row-hover clk",
    key: i,
    onClick: () => {
      setSelUser(u);
      setModal("user");
    }
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "usr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "usr__av"
  }, u.in), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "usr__n"
  }, u.name), /*#__PURE__*/React.createElement("div", {
    className: "usr__e"
  }, u.email)))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(DSX.Badge, {
    tone: u.tone,
    size: "sm",
    dot: true
  }, u.role)), /*#__PURE__*/React.createElement("td", null, u.dist), /*#__PURE__*/React.createElement("td", null, u.mfa ? /*#__PURE__*/React.createElement("span", {
    className: "mfa on"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "check"
  }), "On") : /*#__PURE__*/React.createElement("span", {
    className: "mfa off"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "x"
  }), "Off")), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, u.last)))))), /*#__PURE__*/React.createElement(DSX.Card, {
    title: "Roles",
    subtitle: "Permission sets",
    headerEnd: /*#__PURE__*/React.createElement(DSX.Button, {
      size: "sm",
      variant: "ghost",
      iconLeft: /*#__PURE__*/React.createElement(IX, {
        n: "plus"
      }),
      onClick: () => {
        setSelRole(null);
        setModal("role");
      }
    }, "New")
  }, /*#__PURE__*/React.createElement("div", {
    className: "role-list"
  }, ROLES.map(r => /*#__PURE__*/React.createElement("div", {
    className: "role role-clk",
    key: r.id,
    onClick: () => {
      setSelRole(r);
      setModal("role");
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "role__dot",
    style: {
      background: "var(--status-" + (r.tone === "green" ? "approved" : r.tone === "red" ? "rejected" : r.tone === "amber" ? "review" : r.tone === "blue" ? "info" : "info") + ")",
      opacity: r.tone === "neutral" ? .3 : 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "role__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "role__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "role__n"
  }, r.name), /*#__PURE__*/React.createElement("span", {
    className: "role__c"
  }, r.n)), /*#__PURE__*/React.createElement("div", {
    className: "role__p"
  }, r.perms)), /*#__PURE__*/React.createElement(IX, {
    n: "chevron-right",
    s: {
      width: 15,
      height: 15,
      color: "var(--text-subtle)"
    }
  })))))), modal === "invite" && /*#__PURE__*/React.createElement(InviteUserModal, {
    onClose: () => setModal(null),
    onConfirm: () => uFire("Invitation sent")
  }), modal === "user" && selUser && /*#__PURE__*/React.createElement(UserDetailModal, {
    u: selUser,
    onClose: () => setModal(null),
    onEdit: () => setModal("edituser"),
    onReset: () => setModal("resetmfa"),
    onSuspend: () => setModal("suspend")
  }), modal === "edituser" && selUser && /*#__PURE__*/React.createElement(EditUserModal, {
    u: selUser,
    onClose: () => setModal(null),
    onSave: () => uFire("User updated · " + selUser.name)
  }), modal === "role" && /*#__PURE__*/React.createElement(RoleModal, {
    role: selRole,
    onClose: () => setModal(null),
    onSave: () => uFire(selRole ? "Role saved · " + selRole.name : "Role created")
  }), modal === "resetmfa" && selUser && /*#__PURE__*/React.createElement(ConfirmUserModal, {
    kind: "resetmfa",
    u: selUser,
    onClose: () => setModal(null),
    onConfirm: () => uFire("MFA reset · " + selUser.name)
  }), modal === "suspend" && selUser && /*#__PURE__*/React.createElement(ConfirmUserModal, {
    kind: "suspend",
    u: selUser,
    onClose: () => setModal(null),
    onConfirm: () => uFire("User suspended · " + selUser.name)
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "fx-toast"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "check-circle",
    s: {
      width: 16,
      height: 16
    }
  }), toast));
}

/* ============================= ENCRYPTION ============================= */
const KEYS = [{
  icon: "fingerprint",
  title: "Biometric template key",
  algo: "AES-256-GCM",
  scope: "Voter biometric vault",
  rotated: "12 days ago",
  next: 0.13,
  status: "ACTIVE",
  tone: "green",
  hsm: true
}, {
  icon: "database",
  title: "Data-at-rest key",
  algo: "AES-256-XTS",
  scope: "Registry & audit store",
  rotated: "12 days ago",
  next: 0.13,
  status: "ACTIVE",
  tone: "green",
  hsm: true
}, {
  icon: "network",
  title: "Transit / service mesh",
  algo: "TLS 1.3 · mTLS",
  scope: "All inter-service traffic",
  rotated: "2 days ago",
  next: 0.02,
  status: "ACTIVE",
  tone: "green",
  hsm: false
}, {
  icon: "key-round",
  title: "Master key (KEK)",
  algo: "RSA-4096 · split",
  scope: "Wraps all data keys",
  rotated: "89 days ago",
  next: 0.98,
  status: "ROTATE SOON",
  tone: "amber",
  hsm: true
}];
const KEY_EVENTS = [{
  a: "KEY_ROTATED",
  m: "Transit mesh certificate renewed · auto",
  t: "2d ago",
  tone: "green"
}, {
  a: "HSM_HEALTHCHECK",
  m: "Cluster kigali-hsm-01 · 3/3 nodes healthy",
  t: "6h ago",
  tone: "green"
}, {
  a: "ROTATION_DUE",
  m: "Master KEK reaches 90-day policy in 1 day",
  t: "1h ago",
  tone: "amber"
}, {
  a: "TEMPLATE_ACCESSED",
  m: "Biometric key unwrapped by AI Service · mTLS",
  t: "3m ago",
  tone: "blue"
}];
function KeyCard({
  k,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "keycard clk",
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "keycard__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "keycard__ic"
  }, /*#__PURE__*/React.createElement(IX, {
    n: k.icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "keycard__t"
  }, k.title), /*#__PURE__*/React.createElement(DSX.Badge, {
    tone: k.tone,
    size: "sm",
    dot: true
  }, k.status)), /*#__PURE__*/React.createElement("div", {
    className: "keycard__algo mono"
  }, k.algo, k.hsm && /*#__PURE__*/React.createElement("span", {
    className: "hsm-tag"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "cpu"
  }), "HSM")), /*#__PURE__*/React.createElement("div", {
    className: "keycard__scope"
  }, k.scope), /*#__PURE__*/React.createElement("div", {
    className: "keycard__rot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rot-meta"
  }, /*#__PURE__*/React.createElement("span", null, "Rotated ", k.rotated), /*#__PURE__*/React.createElement("span", null, Math.round(k.next * 100), "% of cycle")), /*#__PURE__*/React.createElement("div", {
    className: "rot-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rot-fill",
    style: {
      width: k.next * 100 + "%",
      background: k.tone === "amber" ? "var(--status-review)" : "var(--status-approved)"
    }
  }))));
}
function KeyDetailModal({
  k,
  onClose,
  onRotate
}) {
  useEffectX(lucideX);
  const versions = [{
    t: "v" + (k.tone === "amber" ? "12" : "47") + " · current",
    s: "Active · wraps " + k.scope.toLowerCase(),
    m: "Rotated " + k.rotated,
    state: "current"
  }, {
    t: "v" + (k.tone === "amber" ? "11" : "46"),
    s: "Retired · retained for decrypt",
    m: "102 days ago",
    state: "done"
  }, {
    t: "v" + (k.tone === "amber" ? "10" : "45"),
    s: "Retired",
    m: "194 days ago",
    state: "done"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--wide",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, k.title), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, k.algo, " \xB7 ", k.scope)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IX, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Key details"), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Algorithm"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, k.algo)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Scope"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, k.scope)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Custody"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, k.hsm ? "HSM · 2-of-3 quorum" : "Service mesh")), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Status"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, k.status)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Last rotated"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, k.rotated)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Policy"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, "90-day rotation"))), /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Cycle progress"), /*#__PURE__*/React.createElement("div", {
    className: "dqbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, Math.round(k.next * 100), "% of rotation cycle"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, k.tone === "amber" ? "due in 1d" : "healthy")), /*#__PURE__*/React.createElement("div", {
    className: "dqbar__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dqbar__fill",
    style: {
      width: k.next * 100 + "%",
      background: k.tone === "amber" ? "var(--status-review)" : "var(--status-approved)"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    className: "fxev__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Version history"), /*#__PURE__*/React.createElement("div", {
    className: "fxtl"
  }, versions.map((v, i) => /*#__PURE__*/React.createElement("div", {
    className: "fxtl-step " + v.state,
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxtl-dot"
  }, /*#__PURE__*/React.createElement(IX, {
    n: v.state === "current" ? "key-round" : "check"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxtl-bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tt"
  }, v.t), /*#__PURE__*/React.createElement("div", {
    className: "ts"
  }, v.s), /*#__PURE__*/React.createElement("div", {
    className: "tm"
  }, v.m))))), /*#__PURE__*/React.createElement("div", {
    className: "fxai"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "shield-check"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, /*#__PURE__*/React.createElement("b", null, "Custody intact."), " ", k.hsm ? "Key material never leaves the HSM; only wrapped data keys are issued under 2-of-3 quorum." : "Certificates are issued per-service over mTLS and auto-rotated."))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "lock"
  }), " Key operations require quorum & are logged"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "refresh-cw"
    }),
    onClick: onRotate
  }, "Rotate now"))));
}
function RotateKeyModal({
  k,
  onClose,
  onConfirm
}) {
  const [timing, setTiming] = useStateX("now");
  useEffectX(lucideX, [timing]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--mid",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Rotate key"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, k.title, " \xB7 ", k.algo)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IX, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fx-warn"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "alert-triangle"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Rotation issues a new key version and re-wraps dependent data keys. The previous version is retained for decryption \u2014 no data is lost. HSM quorum approval (2-of-3) is required to proceed.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Timing"), /*#__PURE__*/React.createElement("div", {
    className: "fx-seg"
  }, [["now", "Immediate"], ["maint", "Next window"], ["sched", "Scheduled"]].map(([key, l]) => /*#__PURE__*/React.createElement("button", {
    key: key,
    className: timing === key ? "on normal" : "",
    onClick: () => setTiming(key)
  }, l)))), /*#__PURE__*/React.createElement("div", {
    className: "fx-checks"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Re-wrap all dependent data keys"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Retain previous version for decrypt"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Notify key-custody officers")))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "refresh-cw"
    }),
    onClick: onConfirm
  }, "Request rotation"))));
}
function IntegrityCheckModal({
  onClose
}) {
  const [done, setDone] = useStateX(false);
  useEffectX(() => {
    lucideX();
    const t = setTimeout(() => setDone(true), 1400);
    return () => clearTimeout(t);
  }, []);
  useEffectX(lucideX, [done]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--mid",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Encryption integrity check"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, "Verify every store is sealed & HSM-attested")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IX, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vrun"
  }, !done ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "vrun__ring",
    style: {
      background: "var(--secondary-soft)",
      color: "var(--secondary-text)"
    }
  }, /*#__PURE__*/React.createElement(IX, {
    n: "loader"
  })), /*#__PURE__*/React.createElement("h3", null, "Checking encryption\u2026"), /*#__PURE__*/React.createElement("p", null, "Scanning data stores for plaintext and validating HSM attestation.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "vrun__ring"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "shield-check"
  })), /*#__PURE__*/React.createElement("h3", null, "All stores sealed"), /*#__PURE__*/React.createElement("p", null, "Every data store is encrypted with an HSM-backed key. No plaintext at rest detected."), /*#__PURE__*/React.createElement("div", {
    className: "vrun__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Stores scanned"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, "14")), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Plaintext found"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v",
    style: {
      color: "var(--status-approved-text)"
    }
  }, "0")), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "HSM attestation"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, "Valid")), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Tamper events"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, "0")))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Close"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "primary",
    disabled: !done,
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "file-down"
    }),
    onClick: onClose
  }, "Download attestation"))));
}
function KeyExportModal({
  onClose,
  onConfirm
}) {
  const [fmt, setFmt] = useStateX("csv");
  useEffectX(lucideX, [fmt]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--mid",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Export key & HSM activity"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, "Signed log of key operations")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IX, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Format"), /*#__PURE__*/React.createElement("div", {
    className: "fx-seg"
  }, [["csv", "CSV"], ["json", "JSON"], ["pdf", "PDF report"]].map(([key, l]) => /*#__PURE__*/React.createElement("button", {
    key: key,
    className: fmt === key ? "on normal" : "",
    onClick: () => setFmt(key)
  }, l)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Date range"), /*#__PURE__*/React.createElement(DSX.Select, {
    options: ["Last 24 hours", "Last 7 days", "Last 30 days", "Custom…"]
  })), /*#__PURE__*/React.createElement("div", {
    className: "fx-checks"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Rotation & re-wrap events"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " HSM health & attestation"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Signed integrity hash")))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "lock"
  }), " Watermarked & logged"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(DSX.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "download"
    }),
    onClick: onConfirm
  }, "Export"))));
}
function EncryptionView() {
  const [modal, setModal] = useStateX(null);
  const [selKey, setSelKey] = useStateX(null);
  const [toast, setToast] = useStateX(null);
  const eFire = m => {
    setModal(null);
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };
  useEffectX(lucideX, [modal]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "verified-banner"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "lock",
    s: {
      width: 22,
      height: 22
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "vt"
  }, "All data encrypted end-to-end"), /*#__PURE__*/React.createElement("div", {
    className: "vs"
  }, "Biometric templates, registry & audit store sealed \xB7 HSM-backed key custody \xB7 0 plaintext at rest")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(DSX.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(IX, {
      n: "shield-check"
    }),
    onClick: () => setModal("integrity")
  }, "Run integrity check"))), /*#__PURE__*/React.createElement("div", {
    className: "keys"
  }, KEYS.map((k, i) => /*#__PURE__*/React.createElement(KeyCard, {
    k: k,
    key: i,
    onClick: () => {
      setSelKey(k);
      setModal("key");
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "cols",
    style: {
      gridTemplateColumns: "1.6fr 1fr",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(DSX.Card, {
    title: "Key & HSM activity",
    subtitle: "Append-only \xB7 last 24h",
    headerEnd: /*#__PURE__*/React.createElement(DSX.Button, {
      size: "sm",
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(IX, {
        n: "download"
      }),
      onClick: () => setModal("export")
    }, "Export")
  }, /*#__PURE__*/React.createElement("div", {
    className: "chain-list"
  }, KEY_EVENTS.map((e, i) => /*#__PURE__*/React.createElement("div", {
    className: "chain-item",
    key: i,
    style: {
      gridTemplateColumns: "auto 1fr auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "chain-node"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lnk",
    style: {
      background: "var(--status-" + (e.tone === "green" ? "approved" : e.tone === "amber" ? "review" : "info") + "-soft)",
      color: "var(--status-" + (e.tone === "green" ? "approved" : e.tone === "amber" ? "review" : "info") + "-text)"
    }
  }, /*#__PURE__*/React.createElement(IX, {
    n: e.tone === "amber" ? "alert-triangle" : "key-round"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "chain-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ca"
  }, e.a), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, e.m)), /*#__PURE__*/React.createElement("div", {
    className: "chain-hash"
  }, e.t))))), /*#__PURE__*/React.createElement(DSX.Card, {
    title: "HSM cluster",
    subtitle: "kigali-hsm-01",
    headerEnd: /*#__PURE__*/React.createElement(DSX.Badge, {
      tone: "green",
      size: "sm",
      dot: true
    }, "HEALTHY")
  }, /*#__PURE__*/React.createElement("div", {
    className: "hsm-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hsm-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, "3/3"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Nodes online")), /*#__PURE__*/React.createElement("div", {
    className: "hsm-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, "FIPS 140-2"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Level 3")), /*#__PURE__*/React.createElement("div", {
    className: "hsm-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, "2-of-3"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Quorum custody")), /*#__PURE__*/React.createElement("div", {
    className: "hsm-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, "4,196"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Ops / min"))), /*#__PURE__*/React.createElement("div", {
    className: "stat-lines",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Rotation policy"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "90 days")), /*#__PURE__*/React.createElement("div", {
    className: "stat-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Last attestation"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "14:30:02")), /*#__PURE__*/React.createElement("div", {
    className: "stat-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Tamper events"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "0"))))), modal === "key" && selKey && /*#__PURE__*/React.createElement(KeyDetailModal, {
    k: selKey,
    onClose: () => setModal(null),
    onRotate: () => setModal("rotate")
  }), modal === "rotate" && selKey && /*#__PURE__*/React.createElement(RotateKeyModal, {
    k: selKey,
    onClose: () => setModal(null),
    onConfirm: () => eFire("Rotation requested · " + selKey.title)
  }), modal === "integrity" && /*#__PURE__*/React.createElement(IntegrityCheckModal, {
    onClose: () => setModal(null)
  }), modal === "export" && /*#__PURE__*/React.createElement(KeyExportModal, {
    onClose: () => setModal(null),
    onConfirm: () => eFire("Key activity exported")
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "fx-toast"
  }, /*#__PURE__*/React.createElement(IX, {
    n: "check-circle",
    s: {
      width: 16,
      height: 16
    }
  }), toast));
}
Object.assign(window.AdminScreens, {
  ReportingView,
  UsersView,
  EncryptionView
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-audit/AdminScreensExtra.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-audit/AdminSettings.jsx
try { (() => {
// AdminSettings.jsx — full Settings pages + notifications modal
const {
  useState: useStateSet
} = React;
const DST = window.SecurePollRWDesignSystem_92875f;
const Ico = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
const SET_TABS = [{
  id: "account",
  label: "Account & profile",
  icon: "user-cog"
}, {
  id: "notifications",
  label: "Notifications",
  icon: "sliders-horizontal"
}, {
  id: "security",
  label: "Security & MFA",
  icon: "shield-check"
}];
function Switch({
  on,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "set-switch",
    "data-on": on ? "1" : "0",
    role: "switch",
    "aria-checked": on,
    onClick: onClick
  }, /*#__PURE__*/React.createElement("i", null));
}
function Field({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "sf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sf__l"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "sf__c"
  }, children));
}

/* ---------- Account ---------- */
function AccountTab() {
  return /*#__PURE__*/React.createElement("div", {
    className: "set-stack"
  }, /*#__PURE__*/React.createElement(DST.Card, {
    title: "Profile",
    subtitle: "How you appear across the platform"
  }, /*#__PURE__*/React.createElement("div", {
    className: "prof-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "prof-av"
  }, "MK"), /*#__PURE__*/React.createElement("div", {
    className: "prof-av__act"
  }, /*#__PURE__*/React.createElement(DST.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ico, {
      n: "upload"
    })
  }, "Change photo"), /*#__PURE__*/React.createElement("span", {
    className: "prof-av__hint"
  }, "PNG or JPG \xB7 max 2\xA0MB"))), /*#__PURE__*/React.createElement("div", {
    className: "set-form"
  }, /*#__PURE__*/React.createElement(DST.Input, {
    label: "Full name",
    defaultValue: "M. Kanyana"
  }), /*#__PURE__*/React.createElement(DST.Input, {
    label: "Work email",
    defaultValue: "m.kanyana@nec.gov.rw",
    iconLeft: /*#__PURE__*/React.createElement(Ico, {
      n: "mail"
    })
  }), /*#__PURE__*/React.createElement(DST.Input, {
    label: "Phone",
    defaultValue: "+250 788 000 000",
    mono: true
  }), /*#__PURE__*/React.createElement(DST.Select, {
    label: "Preferred language",
    options: ["English", "Kinyarwanda", "Français"]
  }), /*#__PURE__*/React.createElement(DST.Select, {
    label: "Time zone",
    options: ["CAT — Kigali (UTC+2)", "UTC", "EAT — Nairobi (UTC+3)"]
  }), /*#__PURE__*/React.createElement(DST.Select, {
    label: "Default region",
    options: ["National", "Kigali City", "Northern", "Southern", "Eastern", "Western"]
  }))), /*#__PURE__*/React.createElement(DST.Card, {
    title: "Role & access",
    subtitle: "Managed by a Super Admin"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ro-grid"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Assigned role"
  }, /*#__PURE__*/React.createElement(DST.Badge, {
    tone: "green",
    dot: true
  }, "Auditor")), /*#__PURE__*/React.createElement(Field, {
    label: "Clearance"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ro-v"
  }, "Tier 3 \xB7 read-all + verify")), /*#__PURE__*/React.createElement(Field, {
    label: "Member since"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ro-v mono"
  }, "2024-03-11")), /*#__PURE__*/React.createElement(Field, {
    label: "Approver"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ro-v"
  }, "E. Mugisha (Super Admin)"))), /*#__PURE__*/React.createElement("div", {
    className: "set-actions"
  }, /*#__PURE__*/React.createElement(DST.Button, {
    iconLeft: /*#__PURE__*/React.createElement(Ico, {
      n: "check"
    })
  }, "Save changes"), /*#__PURE__*/React.createElement(DST.Button, {
    variant: "ghost"
  }, "Discard"))));
}

/* ---------- Notifications ---------- */
const NOTIF_CHANNELS = [{
  k: "inApp",
  label: "In-app",
  desc: "Bell menu & badges",
  icon: "bell"
}, {
  k: "email",
  label: "Email",
  desc: "m.kanyana@nec.gov.rw",
  icon: "mail"
}, {
  k: "sms",
  label: "SMS",
  desc: "Critical alerts only",
  icon: "message-square"
}];
const NOTIF_CATS = [{
  k: "catFraud",
  label: "Fraud & critical alerts",
  desc: "Impersonation, escalations",
  icon: "shield-alert",
  tone: "red"
}, {
  k: "catDuplicate",
  label: "Duplicate registrations",
  desc: "1:N biometric matches",
  icon: "users",
  tone: "amber"
}, {
  k: "catStation",
  label: "Station status",
  desc: "Offline / sync events",
  icon: "radio-tower",
  tone: "blue"
}, {
  k: "catReports",
  label: "Reports",
  desc: "Generation & schedules",
  icon: "file-check-2",
  tone: "green"
}, {
  k: "catAudit",
  label: "Audit & integrity",
  desc: "Chain checks, exports",
  icon: "shield-check",
  tone: "green"
}];
function NotificationsTab({
  prefs,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "set-stack"
  }, /*#__PURE__*/React.createElement(DST.Card, {
    title: "Channels",
    subtitle: "Where alerts are delivered"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ch-grid"
  }, NOTIF_CHANNELS.map(c => /*#__PURE__*/React.createElement("div", {
    className: "ch" + (prefs[c.k] ? " on" : ""),
    key: c.k
  }, /*#__PURE__*/React.createElement("span", {
    className: "ch__ic"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: c.icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "ch__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ch__l"
  }, c.label), /*#__PURE__*/React.createElement("div", {
    className: "ch__d"
  }, c.desc)), /*#__PURE__*/React.createElement(Switch, {
    on: prefs[c.k],
    onClick: () => onToggle(c.k)
  }))))), /*#__PURE__*/React.createElement(DST.Card, {
    title: "Categories",
    subtitle: "Choose what you get notified about"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-list"
  }, NOTIF_CATS.map(c => /*#__PURE__*/React.createElement("div", {
    className: "cat",
    key: c.k
  }, /*#__PURE__*/React.createElement("span", {
    className: "cat__ic",
    style: {
      background: "var(--status-" + (c.tone === "green" ? "approved" : c.tone === "red" ? "rejected" : c.tone === "amber" ? "review" : "info") + "-soft)",
      color: "var(--status-" + (c.tone === "green" ? "approved" : c.tone === "red" ? "rejected" : c.tone === "amber" ? "review" : "info") + "-text)"
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    n: c.icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "cat__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat__l"
  }, c.label), /*#__PURE__*/React.createElement("div", {
    className: "cat__d"
  }, c.desc)), /*#__PURE__*/React.createElement(Switch, {
    on: prefs[c.k],
    onClick: () => onToggle(c.k)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "set-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cat",
    style: {
      padding: "4px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat__l"
  }, "Critical alerts only"), /*#__PURE__*/React.createElement("div", {
    className: "cat__d"
  }, "Mute everything below escalation level")), /*#__PURE__*/React.createElement(Switch, {
    on: prefs.criticalOnly,
    onClick: () => onToggle("criticalOnly")
  })), /*#__PURE__*/React.createElement("div", {
    className: "cat",
    style: {
      padding: "10px 0 4px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat__l"
  }, "Daily email digest"), /*#__PURE__*/React.createElement("div", {
    className: "cat__d"
  }, "A summary at 18:00 each day")), /*#__PURE__*/React.createElement(Switch, {
    on: prefs.digest,
    onClick: () => onToggle("digest")
  }))));
}

/* ---------- Security ---------- */
const SESSIONS = [{
  dev: "MacBook Pro · Chrome",
  loc: "Kigali, RW · 41.75.x.x",
  last: "Active now",
  cur: true
}, {
  dev: "iPhone 15 · SecurePoll app",
  loc: "Kigali, RW",
  last: "12m ago",
  cur: false
}, {
  dev: "Windows · Edge",
  loc: "Musanze, RW",
  last: "Yesterday 19:04",
  cur: false
}];
function SecurityTab() {
  return /*#__PURE__*/React.createElement("div", {
    className: "set-stack"
  }, /*#__PURE__*/React.createElement(DST.Card, {
    title: "Multi-factor authentication",
    subtitle: "Required for all admin roles",
    headerEnd: /*#__PURE__*/React.createElement(DST.Badge, {
      tone: "green",
      dot: true
    }, "Enabled")
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-row__ic"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "smartphone"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-row__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-row__l"
  }, "Authenticator app"), /*#__PURE__*/React.createElement("div", {
    className: "sec-row__d"
  }, "TOTP \xB7 added 2024-03-11")), /*#__PURE__*/React.createElement(DST.Button, {
    size: "sm",
    variant: "secondary"
  }, "Reconfigure")), /*#__PURE__*/React.createElement("div", {
    className: "sec-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-row__ic"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "key-round"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-row__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-row__l"
  }, "Recovery codes"), /*#__PURE__*/React.createElement("div", {
    className: "sec-row__d"
  }, "8 of 10 unused")), /*#__PURE__*/React.createElement(DST.Button, {
    size: "sm",
    variant: "ghost"
  }, "View codes")), /*#__PURE__*/React.createElement("div", {
    className: "sec-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-row__ic"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "lock"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-row__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-row__l"
  }, "Password"), /*#__PURE__*/React.createElement("div", {
    className: "sec-row__d"
  }, "Last changed 38 days ago")), /*#__PURE__*/React.createElement(DST.Button, {
    size: "sm",
    variant: "ghost"
  }, "Change"))), /*#__PURE__*/React.createElement(DST.Card, {
    title: "Active sessions",
    subtitle: "Devices signed in to your account",
    headerEnd: /*#__PURE__*/React.createElement(DST.Button, {
      size: "sm",
      variant: "danger",
      iconLeft: /*#__PURE__*/React.createElement(Ico, {
        n: "log-out"
      })
    }, "Revoke all others")
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Device"), /*#__PURE__*/React.createElement("th", null, "Location"), /*#__PURE__*/React.createElement("th", null, "Last active"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, SESSIONS.map((s, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "nm"
  }, s.dev, s.cur && /*#__PURE__*/React.createElement(DST.Badge, {
    tone: "green",
    size: "sm",
    style: {
      marginLeft: 8
    }
  }, "THIS DEVICE")), /*#__PURE__*/React.createElement("td", null, s.loc), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, s.last), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right"
    }
  }, !s.cur && /*#__PURE__*/React.createElement("button", {
    className: "link-btn"
  }, "Revoke"))))))));
}

/* ---------- API ---------- */
const API_KEYS = [{
  name: "Tally service (prod)",
  key: "sk_live_••••••••4f9c",
  created: "2025-11-02",
  used: "2m ago",
  tone: "green"
}, {
  name: "Observer dashboard (read)",
  key: "sk_live_••••••••a18e",
  created: "2025-12-14",
  used: "1h ago",
  tone: "green"
}, {
  name: "Legacy export script",
  key: "sk_live_••••••••0d22",
  created: "2024-08-01",
  used: "94 days ago",
  tone: "amber"
}];
const WEBHOOKS = [{
  url: "https://ops.nec.gov.rw/hooks/fraud",
  ev: "fraud.flagged",
  tone: "green",
  st: "ACTIVE"
}, {
  url: "https://tally.nec.gov.rw/hooks/turnout",
  ev: "turnout.synced",
  tone: "green",
  st: "ACTIVE"
}];
function ApiTab() {
  return /*#__PURE__*/React.createElement("div", {
    className: "set-stack"
  }, /*#__PURE__*/React.createElement(DST.Card, {
    title: "API keys",
    subtitle: "Server-to-server access \xB7 scoped & revocable",
    headerEnd: /*#__PURE__*/React.createElement(DST.Button, {
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Ico, {
        n: "plus"
      })
    }, "Generate key")
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Key"), /*#__PURE__*/React.createElement("th", null, "Created"), /*#__PURE__*/React.createElement("th", null, "Last used"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, API_KEYS.map((k, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "nm"
  }, k.name), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, k.key), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, k.created), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(DST.Badge, {
    tone: k.tone,
    size: "sm",
    dot: true
  }, k.used)), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "link-btn danger"
  }, "Revoke"))))))), /*#__PURE__*/React.createElement(DST.Card, {
    title: "Webhooks",
    subtitle: "Outbound event delivery",
    headerEnd: /*#__PURE__*/React.createElement(DST.Button, {
      size: "sm",
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ico, {
        n: "plus"
      })
    }, "Add endpoint")
  }, /*#__PURE__*/React.createElement("div", {
    className: "hook-list"
  }, WEBHOOKS.map((w, i) => /*#__PURE__*/React.createElement("div", {
    className: "hook",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "hook__ic"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "webhook"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hook__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hook__url mono"
  }, w.url), /*#__PURE__*/React.createElement("div", {
    className: "hook__ev"
  }, "on ", /*#__PURE__*/React.createElement("b", null, w.ev))), /*#__PURE__*/React.createElement(DST.Badge, {
    tone: w.tone,
    size: "sm",
    dot: true
  }, w.st))))));
}

/* ---------- Help ---------- */
const HELP_LINKS = [{
  icon: "book-open",
  t: "Admin handbook",
  d: "Workflows, roles & escalation paths"
}, {
  icon: "code-2",
  t: "API reference",
  d: "Endpoints, auth & webhooks"
}, {
  icon: "graduation-cap",
  t: "Training & onboarding",
  d: "Guided tours for new auditors"
}, {
  icon: "scale",
  t: "Compliance & legal",
  d: "Data handling & retention policy"
}];
function HelpTab() {
  return /*#__PURE__*/React.createElement("div", {
    className: "set-stack"
  }, /*#__PURE__*/React.createElement(DST.Card, {
    title: "Documentation",
    subtitle: "Guides for the SecurePoll RW platform"
  }, /*#__PURE__*/React.createElement("div", {
    className: "help-grid"
  }, HELP_LINKS.map((h, i) => /*#__PURE__*/React.createElement("button", {
    className: "help-card",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "help-card__ic"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: h.icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "help-card__t"
  }, h.t), /*#__PURE__*/React.createElement("div", {
    className: "help-card__d"
  }, h.d), /*#__PURE__*/React.createElement(Ico, {
    n: "arrow-up-right",
    s: {
      width: 15,
      height: 15,
      position: "absolute",
      top: 14,
      right: 14,
      color: "var(--text-subtle)"
    }
  }))))), /*#__PURE__*/React.createElement(DST.Card, {
    title: "Contact support",
    subtitle: "Election Commission IT desk",
    headerEnd: /*#__PURE__*/React.createElement(DST.Badge, {
      tone: "green",
      dot: true
    }, "Online")
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-row__ic"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "headset"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-row__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-row__l"
  }, "Priority line \u2014 critical incidents"), /*#__PURE__*/React.createElement("div", {
    className: "sec-row__d mono"
  }, "+250 788 100 100 \xB7 24/7 during polls")), /*#__PURE__*/React.createElement(DST.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ico, {
      n: "message-circle"
    })
  }, "Open ticket")), /*#__PURE__*/React.createElement("div", {
    className: "sec-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-row__ic"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "info"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-row__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-row__l"
  }, "System status"), /*#__PURE__*/React.createElement("div", {
    className: "sec-row__d"
  }, "All services operational \xB7 v3.8.1")), /*#__PURE__*/React.createElement(DST.Button, {
    size: "sm",
    variant: "ghost"
  }, "Status page"))));
}
function SettingsView({
  tab,
  setTab,
  prefs,
  onToggle
}) {
  React.useEffect(() => {
    setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
  }, [tab]);
  return /*#__PURE__*/React.createElement("div", {
    className: "set-page"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "set-nav"
  }, SET_TABS.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    className: "set-nav__i" + (tab === s.id ? " active" : ""),
    onClick: () => setTab(s.id)
  }, /*#__PURE__*/React.createElement(Ico, {
    n: s.icon
  }), s.label))), /*#__PURE__*/React.createElement("div", {
    className: "set-body"
  }, tab === "account" && /*#__PURE__*/React.createElement(AccountTab, null), tab === "notifications" && /*#__PURE__*/React.createElement(NotificationsTab, {
    prefs: prefs,
    onToggle: onToggle
  }), tab === "security" && /*#__PURE__*/React.createElement(SecurityTab, null)));
}

/* ---------- Settings modal ---------- */
function SettingsModal({
  tab,
  setTab,
  prefs,
  onToggle,
  onClose
}) {
  React.useEffect(() => {
    setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
  }, [tab]);
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const active = SET_TABS.find(s => s.id === tab) || SET_TABS[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("aside", {
    className: "set-modal__nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-modal__brand"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "settings"
  }), /*#__PURE__*/React.createElement("span", null, "Settings")), /*#__PURE__*/React.createElement("div", {
    className: "set-modal__list"
  }, SET_TABS.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    className: "set-nav__i" + (tab === s.id ? " active" : ""),
    onClick: () => setTab(s.id)
  }, /*#__PURE__*/React.createElement(Ico, {
    n: s.icon
  }), s.label))), /*#__PURE__*/React.createElement("div", {
    className: "set-modal__id"
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-modal__av"
  }, "MK"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "set-modal__n"
  }, "M. Kanyana"), /*#__PURE__*/React.createElement("div", {
    className: "set-modal__r"
  }, "Auditor \xB7 MFA on")))), /*#__PURE__*/React.createElement("section", {
    className: "set-modal__main"
  }, /*#__PURE__*/React.createElement("header", {
    className: "set-modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, active.label), /*#__PURE__*/React.createElement("div", {
    className: "set-modal__sub"
  }, SET_SUBS[tab])), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose,
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "set-modal__body"
  }, tab === "account" && /*#__PURE__*/React.createElement(AccountTab, null), tab === "notifications" && /*#__PURE__*/React.createElement(NotificationsTab, {
    prefs: prefs,
    onToggle: onToggle
  }), tab === "security" && /*#__PURE__*/React.createElement(SecurityTab, null)))));
}
const SET_SUBS = {
  account: "Manage your profile, role & regional defaults",
  notifications: "Channels and categories you get alerted on",
  security: "MFA, recovery and active sessions"
};

/* ---------- Notifications modal ---------- */
const N_TINTS = {
  red: {
    bg: "var(--status-rejected-soft)",
    fg: "var(--status-rejected-text)"
  },
  amber: {
    bg: "var(--status-review-soft)",
    fg: "var(--status-review-text)"
  },
  blue: {
    bg: "var(--status-info-soft)",
    fg: "var(--status-info-text)"
  },
  green: {
    bg: "var(--status-approved-soft)",
    fg: "var(--status-approved-text)"
  }
};
function NotificationsModal({
  notifs,
  onMarkAll,
  onRead,
  onClose,
  onSettings
}) {
  const [filter, setFilter] = useStateSet("all");
  React.useEffect(() => {
    setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
  }, [filter]);
  const unread = notifs.filter(n => !n.read).length;
  const shown = notifs.filter(n => filter === "all" || filter === "unread" && !n.read || filter === "critical" && n.tone === "red");
  const FILTERS = [["all", "All", notifs.length], ["unread", "Unread", unread], ["critical", "Critical", notifs.filter(n => n.tone === "red").length]];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Notifications"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, unread, " unread \xB7 ", notifs.length, " total")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose,
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nfilters"
  }, FILTERS.map(([id, lbl, ct]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: "nfilter" + (filter === id ? " on" : ""),
    onClick: () => setFilter(id)
  }, lbl, /*#__PURE__*/React.createElement("span", {
    className: "nfilter__c"
  }, ct)))), /*#__PURE__*/React.createElement("button", {
    className: "pop__act",
    onClick: onMarkAll,
    disabled: unread === 0
  }, "Mark all read")), /*#__PURE__*/React.createElement("div", {
    className: "modal__body"
  }, shown.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "modal__empty"
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "inbox",
    s: {
      width: 26,
      height: 26
    }
  }), /*#__PURE__*/React.createElement("p", null, "Nothing here \u2014 you're all caught up.")), shown.map(n => /*#__PURE__*/React.createElement("button", {
    className: "notif" + (n.read ? "" : " unread"),
    key: n.id,
    onClick: () => onRead(n.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "notif__ic",
    style: {
      background: N_TINTS[n.tone].bg,
      color: N_TINTS[n.tone].fg
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    n: n.icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "notif__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "notif__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "notif__title"
  }, n.title), /*#__PURE__*/React.createElement("span", {
    className: "notif__time"
  }, n.time)), /*#__PURE__*/React.createElement("div", {
    className: "notif__desc"
  }, n.desc)), !n.read && /*#__PURE__*/React.createElement("span", {
    className: "notif__dot"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "modal__f"
  }, /*#__PURE__*/React.createElement("button", {
    className: "pop__link",
    onClick: onSettings
  }, /*#__PURE__*/React.createElement(Ico, {
    n: "sliders-horizontal",
    s: {
      width: 15,
      height: 15,
      marginRight: 7,
      verticalAlign: "-2px"
    }
  }), "Notification preferences"))));
}
window.AdminSettings = {
  SettingsView,
  SettingsModal,
  NotificationsModal,
  SET_TABS
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-audit/AdminSettings.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-audit/AdminShell.jsx
try { (() => {
// AdminShell.jsx — sidebar + topbar shell with view switching
const {
  useState: useStateS,
  useEffect: useEffectS,
  useRef: useRefS
} = React;
const {
  Input: ShellInput
} = window.SecurePollRWDesignSystem_92875f;
const Icn = ({
  n
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n
});
const ACCENTS = {
  "#16924f": ["#16924f", "#0f7740", "#0c5f34"],
  // electoral green (default)
  "#2563d9": ["#2563d9", "#1b4cb3", "#163d8f"],
  // civic blue
  "#6b3fd6": ["#6b3fd6", "#5a32bd", "#4a28a0"] // violet
};
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "#16924f",
  "density": "comfortable",
  "radius": 12
} /*EDITMODE-END*/;
const NAV = [{
  grp: "Monitor",
  items: [{
    id: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard"
  }, {
    id: "fraud",
    label: "Fraud detection",
    icon: "shield-alert",
    count: 9
  }]
}, {
  grp: "Manage",
  items: [{
    id: "registry",
    label: "Voter registry",
    icon: "users"
  }, {
    id: "audit",
    label: "Audit log",
    icon: "file-check-2"
  }]
}];
const EXTRA = [{
  id: "reporting",
  label: "Reporting",
  icon: "bar-chart-3"
}, {
  id: "users",
  label: "Users & roles",
  icon: "key-round"
}, {
  id: "encryption",
  label: "Encryption",
  icon: "lock"
}];
const TITLES = {
  dashboard: ["Dashboard", "Real-time national overview"],
  fraud: ["Fraud detection", "AI-flagged cases · risk-ranked"],
  registry: ["Voter registry", "Single source of truth · 8.42M records"],
  audit: ["Audit log", "Append-only · cryptographically verified"],
  reporting: ["Reporting", "Build, schedule & export official reports"],
  users: ["Users & roles", "Administrators · permission sets · MFA"],
  encryption: ["Encryption", "Key custody · HSM · data protection"]
};
// Topbar search only appears where it adds value. Registry, Reporting and
// Encryption omit it — Registry has its own dedicated search field, the others
// have nothing to search.
const SEARCH = {
  dashboard: "Search across all services…",
  fraud: "Search cases by ID or station…",
  audit: "Search audit entries…",
  users: "Search users by name or email…"
};
const NOTIF_TINTS = {
  red: {
    bg: "var(--status-rejected-soft)",
    fg: "var(--status-rejected-text)"
  },
  amber: {
    bg: "var(--status-review-soft)",
    fg: "var(--status-review-text)"
  },
  blue: {
    bg: "var(--status-info-soft)",
    fg: "var(--status-info-text)"
  },
  green: {
    bg: "var(--status-approved-soft)",
    fg: "var(--status-approved-text)"
  }
};
const NOTIFS_INIT = [{
  id: 1,
  tone: "red",
  icon: "shield-alert",
  title: "Critical fraud alert",
  desc: "FR-4471 · possible impersonation at PS-077",
  time: "2m",
  read: false
}, {
  id: 2,
  tone: "amber",
  icon: "users",
  title: "Duplicate registration flagged",
  desc: "1:N match · reg #20451 ↔ #18992",
  time: "8m",
  read: false
}, {
  id: 3,
  tone: "blue",
  icon: "radio-tower",
  title: "Station back online",
  desc: "PS-203 resumed sync after 4 min offline",
  time: "21m",
  read: false
}, {
  id: 4,
  tone: "green",
  icon: "file-check-2",
  title: "Report ready",
  desc: "National turnout — 14:00 snapshot (PDF)",
  time: "1h",
  read: true
}, {
  id: 5,
  tone: "green",
  icon: "shield-check",
  title: "Chain integrity verified",
  desc: "8.41M audit entries · 0 breaks detected",
  time: "2h",
  read: true
}];
const SETTINGS_MENU = [{
  icon: "user-cog",
  label: "Account & profile",
  tab: "account"
}, {
  icon: "sliders-horizontal",
  label: "Notification preferences",
  tab: "notifications"
}, {
  icon: "shield-check",
  label: "Security & MFA",
  note: "On",
  tab: "security"
}];
function NotifPanel({
  notifs,
  onMarkAll,
  onRead,
  onViewAll
}) {
  const unread = notifs.filter(n => !n.read).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "pop pop--notif",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "pop__h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pop__t"
  }, "Notifications ", unread > 0 && /*#__PURE__*/React.createElement("span", {
    className: "pop__count"
  }, unread, " new")), /*#__PURE__*/React.createElement("button", {
    className: "pop__act",
    onClick: onMarkAll,
    disabled: unread === 0
  }, "Mark all read")), /*#__PURE__*/React.createElement("div", {
    className: "notif-list"
  }, notifs.map(n => /*#__PURE__*/React.createElement("button", {
    className: "notif" + (n.read ? "" : " unread"),
    key: n.id,
    onClick: () => onRead(n.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "notif__ic",
    style: {
      background: NOTIF_TINTS[n.tone].bg,
      color: NOTIF_TINTS[n.tone].fg
    }
  }, /*#__PURE__*/React.createElement(Icn, {
    n: n.icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "notif__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "notif__h"
  }, /*#__PURE__*/React.createElement("span", {
    className: "notif__title"
  }, n.title), /*#__PURE__*/React.createElement("span", {
    className: "notif__time"
  }, n.time)), /*#__PURE__*/React.createElement("div", {
    className: "notif__desc"
  }, n.desc)), !n.read && /*#__PURE__*/React.createElement("span", {
    className: "notif__dot"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "pop__f"
  }, /*#__PURE__*/React.createElement("button", {
    className: "pop__link",
    onClick: onViewAll
  }, "View all notifications")));
}
function SettingsPanel({
  prefs,
  onToggle,
  onNavigate,
  theme,
  onTheme
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "pop pop--settings",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-id"
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-id__av"
  }, "MK"), /*#__PURE__*/React.createElement("div", {
    className: "set-id__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-id__n"
  }, "M. Kanyana"), /*#__PURE__*/React.createElement("div", {
    className: "set-id__e"
  }, "m.kanyana@nec.gov.rw"))), /*#__PURE__*/React.createElement("div", {
    className: "set-role"
  }, /*#__PURE__*/React.createElement("span", {
    className: "set-role__b"
  }, "Auditor"), /*#__PURE__*/React.createElement("span", {
    className: "set-role__mfa"
  }, /*#__PURE__*/React.createElement(Icn, {
    n: "shield-check"
  }), "MFA on")), /*#__PURE__*/React.createElement("div", {
    className: "set-menu"
  }, SETTINGS_MENU.map((m, i) => /*#__PURE__*/React.createElement("button", {
    className: "set-item",
    key: i,
    onClick: () => onNavigate(m.tab)
  }, /*#__PURE__*/React.createElement(Icn, {
    n: m.icon
  }), /*#__PURE__*/React.createElement("span", null, m.label), m.note ? /*#__PURE__*/React.createElement("span", {
    className: "set-item__note"
  }, m.note) : /*#__PURE__*/React.createElement(Icn, {
    n: "chevron-right"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "set-sec"
  }, "Appearance"), /*#__PURE__*/React.createElement("div", {
    className: "set-theme"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "set-theme__opt" + (theme !== "dark" ? " on" : ""),
    onClick: () => onTheme("light")
  }, /*#__PURE__*/React.createElement("span", {
    className: "set-theme__sw set-theme__sw--light"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "2",
    x2: "12",
    y2: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "20",
    x2: "12",
    y2: "22"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4.93",
    y1: "4.93",
    x2: "6.34",
    y2: "6.34"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "17.66",
    y1: "17.66",
    x2: "19.07",
    y2: "19.07"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "2",
    y1: "12",
    x2: "4",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "20",
    y1: "12",
    x2: "22",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4.93",
    y1: "19.07",
    x2: "6.34",
    y2: "17.66"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "17.66",
    y1: "6.34",
    x2: "19.07",
    y2: "4.93"
  }))), "Light"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "set-theme__opt" + (theme === "dark" ? " on" : ""),
    onClick: () => onTheme("dark")
  }, /*#__PURE__*/React.createElement("span", {
    className: "set-theme__sw set-theme__sw--dark"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
  }))), "Dark")), /*#__PURE__*/React.createElement("div", {
    className: "set-sec"
  }, "Quick preferences"), /*#__PURE__*/React.createElement("label", {
    className: "set-toggle"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Critical alerts only"), /*#__PURE__*/React.createElement("small", null, "Mute info-level notifications")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "set-switch",
    "data-on": prefs.criticalOnly ? "1" : "0",
    role: "switch",
    "aria-checked": prefs.criticalOnly,
    onClick: () => onToggle("criticalOnly")
  }, /*#__PURE__*/React.createElement("i", null))), /*#__PURE__*/React.createElement("label", {
    className: "set-toggle"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Daily email digest"), /*#__PURE__*/React.createElement("small", null, "Summary at 18:00 each day")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "set-switch",
    "data-on": prefs.digest ? "1" : "0",
    role: "switch",
    "aria-checked": prefs.digest,
    onClick: () => onToggle("digest")
  }, /*#__PURE__*/React.createElement("i", null))), /*#__PURE__*/React.createElement("div", {
    className: "set-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "set-signout",
    onClick: () => {
      window.location.href = "admin-login.html";
    }
  }, /*#__PURE__*/React.createElement(Icn, {
    n: "log-out"
  }), "Sign out")));
}
function AdminShell() {
  const [view, setView] = useStateS("dashboard");
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [panel, setPanel] = useStateS(null); // null | "notif" | "settings"
  const [notifs, setNotifs] = useStateS(NOTIFS_INIT);
  const [prefs, setPrefs] = useStateS({
    criticalOnly: false,
    digest: true,
    inApp: true,
    email: true,
    sms: false,
    catFraud: true,
    catDuplicate: true,
    catStation: true,
    catReports: true,
    catAudit: false
  });
  const [settingsTab, setSettingsTab] = useStateS("account");
  const [modal, setModal] = useStateS(null); // null | "notifs" | "settings"
  const rootRef = useRefS(null);
  useEffectS(() => {
    setTimeout(() => window.lucide && window.lucide.createIcons(), 30);
  }, [view, panel, modal, t.theme]);
  const unreadCount = notifs.filter(n => !n.read).length;
  const markAll = () => setNotifs(ns => ns.map(n => ({
    ...n,
    read: true
  })));
  const readOne = id => setNotifs(ns => ns.map(n => n.id === id ? {
    ...n,
    read: true
  } : n));
  const togglePref = k => setPrefs(p => ({
    ...p,
    [k]: !p[k]
  }));
  const openSettings = tab => {
    setSettingsTab(tab || "account");
    setModal("settings");
    setPanel(null);
  };

  // apply tweaks
  useEffectS(() => {
    const dark = t.theme === "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "";
    try {
      localStorage.setItem("sp-theme", dark ? "dark" : "light");
    } catch (e) {}
  }, [t.theme]);
  useEffectS(() => {
    const el = rootRef.current;
    if (!el) return;
    const [p, h, pr] = ACCENTS[t.accent] || ACCENTS["#16924f"];
    el.style.setProperty("--primary", p);
    el.style.setProperty("--primary-hover", h);
    el.style.setProperty("--primary-press", pr);
    el.style.setProperty("--primary-soft", `color-mix(in srgb, ${p} 12%, var(--bg-surface))`);
    el.style.setProperty("--primary-soft-border", `color-mix(in srgb, ${p} 32%, var(--bg-surface))`);
    el.style.setProperty("--primary-text", `color-mix(in srgb, ${p} 66%, var(--text-strong))`);
    el.style.setProperty("--ring", `color-mix(in oklab, ${p} 55%, transparent)`);
  }, [t.accent, t.theme]);
  useEffectS(() => {
    const el = rootRef.current;
    if (!el) return;
    const r = t.radius;
    el.style.setProperty("--radius-lg", r + "px");
    el.style.setProperty("--radius-md", Math.round(r * 0.66) + "px");
    el.style.setProperty("--radius-sm", Math.round(r * 0.42) + "px");
  }, [t.radius]);
  const S = window.AdminScreens;
  const [title, sub] = TITLES[view] || ["Reporting", ""];
  return /*#__PURE__*/React.createElement("div", {
    className: "admin" + (t.density === "compact" ? " dense" : ""),
    ref: rootRef
  }, /*#__PURE__*/React.createElement("aside", {
    className: "side"
  }, /*#__PURE__*/React.createElement("button", {
    className: "side__brand",
    onClick: () => setView("dashboard"),
    "aria-label": "Go to dashboard"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark.svg",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    className: "nm"
  }, "SecurePoll")), NAV.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.grp
  }, /*#__PURE__*/React.createElement("div", {
    className: "side__grp"
  }, g.grp), g.items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    className: "side__item" + (view === it.id ? " active" : ""),
    onClick: () => setView(it.id)
  }, /*#__PURE__*/React.createElement(Icn, {
    n: it.icon
  }), it.label, it.count && /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, it.count))))), /*#__PURE__*/React.createElement("div", {
    className: "side__grp"
  }, "Analyze"), EXTRA.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    className: "side__item" + (view === it.id ? " active" : ""),
    onClick: () => setView(it.id)
  }, /*#__PURE__*/React.createElement(Icn, {
    n: it.icon
  }), it.label)), /*#__PURE__*/React.createElement("div", {
    className: "side__user"
  }, /*#__PURE__*/React.createElement("div", {
    className: "av"
  }, "MK"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "un"
  }, "M. Kanyana"), /*#__PURE__*/React.createElement("div", {
    className: "ur"
  }, "Auditor \xB7 MFA")))), /*#__PURE__*/React.createElement("div", {
    className: "main"
  }, /*#__PURE__*/React.createElement("header", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, title), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, sub)), /*#__PURE__*/React.createElement("div", {
    className: "topbar__end"
  }, SEARCH[view] && /*#__PURE__*/React.createElement("div", {
    className: "topbar__search"
  }, /*#__PURE__*/React.createElement(ShellInput, {
    iconLeft: /*#__PURE__*/React.createElement(Icn, {
      n: "search"
    }),
    placeholder: SEARCH[view]
  })), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn" + (panel === "notif" ? " on" : ""),
    onClick: () => setPanel(p => p === "notif" ? null : "notif"),
    "aria-label": "Notifications"
  }, /*#__PURE__*/React.createElement(Icn, {
    n: "bell"
  }), unreadCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge-dot"
  }, unreadCount)), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn" + (panel === "settings" ? " on" : ""),
    onClick: () => setPanel(p => p === "settings" ? null : "settings"),
    "aria-label": "Settings"
  }, /*#__PURE__*/React.createElement(Icn, {
    n: "settings"
  }))), panel && /*#__PURE__*/React.createElement("div", {
    className: "pop-overlay",
    onClick: () => setPanel(null)
  }), panel === "notif" && /*#__PURE__*/React.createElement(NotifPanel, {
    notifs: notifs,
    onMarkAll: markAll,
    onRead: readOne,
    onViewAll: () => {
      setModal("notifs");
      setPanel(null);
    }
  }), panel === "settings" && /*#__PURE__*/React.createElement(SettingsPanel, {
    prefs: prefs,
    onToggle: togglePref,
    onNavigate: openSettings,
    theme: t.theme,
    onTheme: v => setTweak("theme", v)
  })), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, view === "dashboard" && /*#__PURE__*/React.createElement(S.DashboardView, null), view === "fraud" && /*#__PURE__*/React.createElement(S.FraudView, null), view === "registry" && /*#__PURE__*/React.createElement(S.RegistryView, null), view === "audit" && /*#__PURE__*/React.createElement(S.AuditView, null), view === "reporting" && /*#__PURE__*/React.createElement(S.ReportingView, null), view === "users" && /*#__PURE__*/React.createElement(S.UsersView, null), view === "encryption" && /*#__PURE__*/React.createElement(S.EncryptionView, null))), modal === "settings" && /*#__PURE__*/React.createElement(window.AdminSettings.SettingsModal, {
    tab: settingsTab,
    setTab: setSettingsTab,
    prefs: prefs,
    onToggle: togglePref,
    onClose: () => setModal(null)
  }), modal === "notifs" && /*#__PURE__*/React.createElement(window.AdminSettings.NotificationsModal, {
    notifs: notifs,
    onMarkAll: markAll,
    onRead: readOne,
    onClose: () => setModal(null),
    onSettings: () => {
      setModal(null);
      openSettings("notifications");
    }
  }), /*#__PURE__*/React.createElement(window.TweaksPanel, {
    title: "Tweaks"
  }, /*#__PURE__*/React.createElement(window.TweakSection, {
    label: "Theme"
  }), /*#__PURE__*/React.createElement(window.TweakRadio, {
    label: "Mode",
    value: t.theme,
    options: ["light", "dark"],
    onChange: v => setTweak("theme", v)
  }), /*#__PURE__*/React.createElement(window.TweakColor, {
    label: "Accent",
    value: t.accent,
    options: Object.keys(ACCENTS),
    onChange: v => setTweak("accent", v)
  }), /*#__PURE__*/React.createElement(window.TweakSection, {
    label: "Layout"
  }), /*#__PURE__*/React.createElement(window.TweakRadio, {
    label: "Density",
    value: t.density,
    options: ["comfortable", "compact"],
    onChange: v => setTweak("density", v)
  }), /*#__PURE__*/React.createElement(window.TweakSlider, {
    label: "Corner radius",
    value: t.radius,
    min: 0,
    max: 18,
    unit: "px",
    onChange: v => setTweak("radius", v)
  })));
}
window.AdminShell = AdminShell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-audit/AdminShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-audit/AuditView.jsx
try { (() => {
// AuditView.jsx — Audit & Transparency (Module 7) workspace + modals
const {
  useEffect: useEffectAu,
  useState: useStateAu
} = React;
const AU = window.SecurePollRWDesignSystem_92875f;
const Ia = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lau() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
function KpiA({
  label,
  icon,
  tint,
  value,
  unit,
  delta,
  dir
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kpi__lbl"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "kpi__ic",
    style: {
      background: tint.bg,
      color: tint.fg
    }
  }, /*#__PURE__*/React.createElement(Ia, {
    n: icon
  }))), /*#__PURE__*/React.createElement("div", {
    className: "kpi__val"
  }, value, unit && /*#__PURE__*/React.createElement("small", null, " ", unit)), delta && /*#__PURE__*/React.createElement("span", {
    className: "kpi__delta " + dir
  }, /*#__PURE__*/React.createElement(Ia, {
    n: dir === "up" ? "trending-up" : "trending-down"
  }), delta));
}
const ACT_TONE = {
  VOTER_VERIFIED: "green",
  VOTER_VOTED: "green",
  TEMPLATE_ACCESSED: "blue",
  PERMISSION_CHANGED: "amber",
  LOGIN: "blue",
  RECORD_BLOCKED: "red",
  DATA_EXPORTED: "amber",
  RECORD_MERGED: "amber"
};
const TONE_VAR = {
  green: "var(--status-approved)",
  amber: "var(--status-review)",
  red: "var(--status-rejected)",
  blue: "var(--status-info)",
  neutral: "var(--slate-400)"
};
const LOG = [{
  t: "14:41:22",
  action: "VOTER_VERIFIED",
  actor: "Officer #221",
  role: "Polling officer",
  init: "PO",
  service: "Verification",
  station: "PS-014",
  ip: "10.4.21.7",
  geo: "Nyarugenge",
  h: "a3f9c2",
  p: "7c21be",
  detail: "Voter Jean Baptiste verified · face score 0.91 · fingerprint pass",
  diff: null
}, {
  t: "14:41:19",
  action: "VOTER_VOTED",
  actor: "System",
  role: "Election service",
  init: "SY",
  service: "Election Ops",
  station: "PS-014",
  ip: "10.4.21.7",
  geo: "Nyarugenge",
  h: "7c21be",
  p: "0d44a1",
  detail: "Registry status transition · row-locked write",
  diff: [["Status", "REGISTERED", "VOTED"]]
}, {
  t: "14:40:58",
  action: "TEMPLATE_ACCESSED",
  actor: "AI Service",
  role: "ML pipeline",
  init: "AI",
  service: "AI / ML",
  station: "—",
  ip: "10.8.0.3",
  geo: "Kigali DC",
  h: "0d44a1",
  p: "f188e0",
  detail: "Biometric reference read for 1:1 match · mTLS · purpose: verification",
  diff: null
}, {
  t: "14:39:30",
  action: "PERMISSION_CHANGED",
  actor: "E. Mugisha",
  role: "Administrator",
  init: "EM",
  service: "IAM",
  station: "—",
  ip: "10.2.5.9",
  geo: "Kigali City",
  h: "f188e0",
  p: "5b9d3a",
  detail: "Support role scope edited",
  diff: [["Registry access", "read", "read+write"], ["Scope", "Gasabo", "Gasabo, Kicukiro"]]
}, {
  t: "14:38:02",
  action: "DATA_EXPORTED",
  actor: "M. Kanyana",
  role: "Auditor",
  init: "MK",
  service: "Registry",
  station: "—",
  ip: "10.2.5.4",
  geo: "Kigali City",
  h: "5b9d3a",
  p: "2c77ad",
  detail: "Signed CSV export · 4,812 rows · watermarked",
  diff: null
}, {
  t: "14:36:44",
  action: "RECORD_BLOCKED",
  actor: "M. Kanyana",
  role: "Auditor",
  init: "MK",
  service: "Registry",
  station: "PS-203",
  ip: "10.2.5.4",
  geo: "Kigali City",
  h: "2c77ad",
  p: "91ee0c",
  detail: "Voter #11998 blocked · reason: confirmed fraud",
  diff: [["Status", "REGISTERED", "BLOCKED"]]
}, {
  t: "14:35:10",
  action: "LOGIN",
  actor: "M. Kanyana",
  role: "Auditor",
  init: "MK",
  service: "Auth",
  station: "—",
  ip: "10.2.5.4",
  geo: "Kigali City",
  h: "91ee0c",
  p: "begin",
  detail: "Sign-in · MFA verified (TOTP) · trusted device",
  diff: null
}];
const ANOMS = [{
  id: "AN-21",
  tone: "red",
  icon: "shield-alert",
  t: "Impersonation spike",
  live: true,
  d: "4 sub-threshold face scores at PS-077 in 9 min · +3.4σ over baseline",
  when: "live · 14:40",
  signal: "Face-match rejection rate",
  baseline: 1.5,
  observed: 11.8,
  unit: "%",
  entities: ["PS-077 · Kicukiro", "Device cam-02", "4 capture sessions"],
  rec: "Dispatch supervisor to PS-077 and review the 4 flagged captures.",
  cases: "FR-4471"
}, {
  id: "AN-20",
  tone: "amber",
  icon: "activity",
  t: "Enrollment rate anomaly",
  d: "Officer #88 logged 41 registrations in 20 min — isolation-forest flag",
  when: "14:21",
  signal: "Registrations / 20 min",
  baseline: 9,
  observed: 41,
  unit: "",
  entities: ["Officer #88", "PS-014 · Nyarugenge"],
  rec: "Spot-check a sample of officer #88's recent enrollments.",
  cases: "FR-4440"
}, {
  id: "AN-19",
  tone: "blue",
  icon: "map-pin",
  t: "New access geography",
  d: "Admin session from Musanze — first sign-in from this district",
  when: "13:58",
  signal: "Distance from usual location",
  baseline: 4,
  observed: 92,
  unit: "km",
  entities: ["Admin: J. Uwimana", "Musanze", "New device"],
  rec: "Confirm the session with the administrator; revoke if unrecognised.",
  cases: null
}];

/* ---------- Log entry detail ---------- */
function LogDetailModal({
  e,
  onClose
}) {
  useEffectAu(lau);
  const tone = ACT_TONE[e.action] || "neutral";
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--wide",
    onClick: ev => ev.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Audit entry"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, /*#__PURE__*/React.createElement("span", {
    className: "logact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: TONE_VAR[tone]
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "a"
  }, e.action)), " \xB7 ", e.t, " today")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Event"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--text-default)",
      lineHeight: 1.55
    }
  }, e.detail), /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Attribution"), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Actor"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, e.actor)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Role"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, e.role)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Service"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, e.service)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Station"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, e.station)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "IP address"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, e.ip)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Location"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, e.geo))), e.diff && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Change"), /*#__PURE__*/React.createElement("div", null, e.diff.map((d, i) => /*#__PURE__*/React.createElement("div", {
    className: "diffrow",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, d[0]), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "old"
  }, d[1]), /*#__PURE__*/React.createElement("span", {
    className: "arr"
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "new"
  }, d[2]))))))), /*#__PURE__*/React.createElement("div", {
    className: "fxev__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxev__lbl"
  }, "Hash-chain context"), /*#__PURE__*/React.createElement("div", {
    className: "chain-list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chain-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chain-node"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lnk",
    style: {
      background: "var(--bg-inset)",
      color: "var(--text-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "arrow-up"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "chain-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ca",
    style: {
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, "Previous entry"), /*#__PURE__*/React.createElement("div", {
    className: "cm hashmono",
    style: {
      color: "var(--text-muted)"
    }
  }, e.p, "\u2026"))), /*#__PURE__*/React.createElement("div", {
    className: "chain-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chain-node"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lnk"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "link"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "chain-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ca"
  }, "This entry"), /*#__PURE__*/React.createElement("div", {
    className: "cm hashmono"
  }, e.h, "\u2026")), /*#__PURE__*/React.createElement("div", {
    className: "chain-hash"
  }, /*#__PURE__*/React.createElement(AU.Badge, {
    tone: "green",
    size: "sm",
    dot: true
  }, "VERIFIED"))), /*#__PURE__*/React.createElement("div", {
    className: "chain-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chain-node"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lnk",
    style: {
      background: "var(--bg-inset)",
      color: "var(--text-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "arrow-down"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "chain-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ca",
    style: {
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, "Next entry"), /*#__PURE__*/React.createElement("div", {
    className: "cm hashmono",
    style: {
      color: "var(--text-muted)"
    }
  }, "links forward \u2713")))), /*#__PURE__*/React.createElement("div", {
    className: "fxai"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "shield-check"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, /*#__PURE__*/React.createElement("b", null, "Integrity intact."), " This entry's hash includes the previous entry's hash; recomputing the chain reproduces the signed Merkle root."))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "lock"
  }), " Append-only \xB7 cannot be edited or deleted"), /*#__PURE__*/React.createElement(AU.Button, {
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ia, {
      n: "download"
    }),
    onClick: onClose
  }, "Export entry"))));
}

/* ---------- Chain verification ---------- */
function VerifyModal({
  onClose
}) {
  const [done, setDone] = useStateAu(false);
  useEffectAu(() => {
    lau();
    const t = setTimeout(() => setDone(true), 1400);
    return () => clearTimeout(t);
  }, []);
  useEffectAu(lau, [done]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--mid",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Verify chain integrity"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, "Re-walk the SHA-256 hash chain end to end")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vrun"
  }, !done ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "vrun__ring",
    style: {
      background: "var(--secondary-soft)",
      color: "var(--secondary-text)"
    }
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "loader"
  })), /*#__PURE__*/React.createElement("h3", null, "Walking the chain\u2026"), /*#__PURE__*/React.createElement("p", null, "Recomputing entry hashes and comparing against the signed Merkle root.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "vrun__ring"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "shield-check"
  })), /*#__PURE__*/React.createElement("h3", null, "Integrity verified \xB7 0 breaks"), /*#__PURE__*/React.createElement("p", null, "The entire audit chain reproduces the signed root. No entry was altered, inserted, or removed."), /*#__PURE__*/React.createElement("div", {
    className: "vrun__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Entries walked"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, "8,412,556")), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Breaks found"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v",
    style: {
      color: "var(--status-approved-text)"
    }
  }, "0")), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Merkle root"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, "a3f9\u2026c21b")), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Signed by"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, "NEC HSM-01")), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Duration"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, "1.31s")), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Verified at"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, "14:41:30")))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(AU.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Close"), /*#__PURE__*/React.createElement(AU.Button, {
    variant: "primary",
    disabled: !done,
    iconLeft: /*#__PURE__*/React.createElement(Ia, {
      n: "file-down"
    }),
    onClick: onClose
  }, "Download proof"))));
}

/* ---------- Export / audit report ---------- */
function ExportAuditModal({
  onClose,
  onConfirm
}) {
  const [fmt, setFmt] = useStateAu("csv");
  useEffectAu(lau, [fmt]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--mid",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Export audit report"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, "Signed, tamper-evident extract")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Format"), /*#__PURE__*/React.createElement("div", {
    className: "fx-seg"
  }, [["csv", "CSV"], ["json", "JSON"], ["pdf", "PDF report"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: fmt === k ? "on normal" : "",
    onClick: () => setFmt(k)
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Date range"), /*#__PURE__*/React.createElement(AU.Select, {
    options: ["Today", "Last 24 hours", "Last 7 days", "Custom…"]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Service"), /*#__PURE__*/React.createElement(AU.Select, {
    options: ["All services", "Verification", "AI / ML", "Registry", "IAM", "Auth"]
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Include"), /*#__PURE__*/React.createElement("div", {
    className: "fx-checks"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Full event payloads"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Hash-chain references"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Signed Merkle proof"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  }), " Actor IP & device"))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "lock"
  }), " Exports are watermarked & logged"), /*#__PURE__*/React.createElement(AU.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(AU.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ia, {
      n: "download"
    }),
    onClick: onConfirm
  }, "Generate report"))));
}

/* ---------- Anomaly detail ---------- */
function AnomalyModal({
  a,
  onClose,
  onAck,
  onCase
}) {
  useEffectAu(lau);
  const max = Math.max(a.baseline, a.observed) * 1.15;
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, a.t), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, a.id, " \xB7 ", a.when)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", {
    className: "anom anom--" + a.tone,
    style: {
      cursor: "default",
      boxShadow: "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "anom__ic"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: a.icon
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "anom__t"
  }, a.t, a.live && /*#__PURE__*/React.createElement("span", {
    className: "anom__live"
  }, "LIVE")), /*#__PURE__*/React.createElement("div", {
    className: "anom__d"
  }, a.d))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, a.signal, " \xB7 observed vs baseline"), /*#__PURE__*/React.createElement("div", {
    className: "cmp"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cmp__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cmp__lbl"
  }, "Baseline"), /*#__PURE__*/React.createElement("span", {
    className: "cmp__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cmp__fill",
    style: {
      width: a.baseline / max * 100 + "%",
      background: "var(--slate-400)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "cmp__v"
  }, a.baseline, a.unit)), /*#__PURE__*/React.createElement("div", {
    className: "cmp__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cmp__lbl"
  }, "Observed"), /*#__PURE__*/React.createElement("span", {
    className: "cmp__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cmp__fill",
    style: {
      width: a.observed / max * 100 + "%",
      background: TONE_VAR[a.tone]
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "cmp__v"
  }, a.observed, a.unit)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Affected entities"), /*#__PURE__*/React.createElement("div", {
    className: "fxflags"
  }, a.entities.map((en, i) => /*#__PURE__*/React.createElement(AU.Badge, {
    key: i,
    tone: "neutral",
    size: "sm"
  }, en)))), /*#__PURE__*/React.createElement("div", {
    className: "fxai"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "lightbulb"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, /*#__PURE__*/React.createElement("b", null, "Recommended action."), " ", a.rec)))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(AU.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Mute signal"), a.cases && /*#__PURE__*/React.createElement(AU.Button, {
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ia, {
      n: "folder-open"
    }),
    onClick: onCase
  }, "Open case ", a.cases), /*#__PURE__*/React.createElement(AU.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ia, {
      n: "check"
    }),
    onClick: onAck
  }, "Acknowledge"))));
}

/* ============================ MAIN VIEW ============================ */
function AuditView() {
  const [modal, setModal] = useStateAu(null); // verify | export | entry | anomaly
  const [entry, setEntry] = useStateAu(null);
  const [anom, setAnom] = useStateAu(null);
  const [toast, setToast] = useStateAu(null);
  useEffectAu(lau, [modal]);
  const fire = m => {
    setModal(null);
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };
  const stations = [{
    ps: "PS-014",
    n: 1284,
    pct: 0.96
  }, {
    ps: "PS-203",
    n: 1102,
    pct: 0.82
  }, {
    ps: "PS-077",
    n: 884,
    pct: 0.66
  }, {
    ps: "PS-118",
    n: 741,
    pct: 0.55
  }];
  const geo = [{
    l: "Kigali City",
    d: "9 admins · 6 services",
    n: "61%",
    ic: "building-2"
  }, {
    l: "Northern · Musanze",
    d: "2 admins · 1 new device",
    n: "14%",
    ic: "map-pin"
  }, {
    l: "Eastern · Rwamagana",
    d: "3 admins",
    n: "13%",
    ic: "map-pin"
  }, {
    l: "Western · Rubavu",
    d: "2 admins",
    n: "12%",
    ic: "map-pin"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "audit2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpis"
  }, /*#__PURE__*/React.createElement(KpiA, {
    label: "Chain entries",
    icon: "link",
    tint: {
      bg: "var(--primary-soft)",
      fg: "var(--primary-text)"
    },
    value: "8.41",
    unit: "M",
    delta: "append-only",
    dir: "up"
  }), /*#__PURE__*/React.createElement(KpiA, {
    label: "Events today",
    icon: "activity",
    tint: {
      bg: "var(--secondary-soft)",
      fg: "var(--secondary-text)"
    },
    value: "124k",
    delta: "2.1k / min",
    dir: "up"
  }), /*#__PURE__*/React.createElement(KpiA, {
    label: "Active anomalies",
    icon: "shield-alert",
    tint: {
      bg: "var(--status-review-soft)",
      fg: "var(--status-review-text)"
    },
    value: "3",
    delta: "1 critical",
    dir: "down"
  }), /*#__PURE__*/React.createElement(KpiA, {
    label: "Chain integrity",
    icon: "shield-check",
    tint: {
      bg: "var(--status-approved-soft)",
      fg: "var(--status-approved-text)"
    },
    value: "0",
    unit: "breaks",
    delta: "verified 14:41",
    dir: "up"
  })), /*#__PURE__*/React.createElement("div", {
    className: "verified-banner"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "shield-check",
    s: {
      width: 22,
      height: 22
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "vt"
  }, "Chain integrity verified"), /*#__PURE__*/React.createElement("div", {
    className: "vs"
  }, "8,412,556 entries \xB7 SHA-256 hash chain \xB7 last verified 14:41:30 \xB7 0 breaks detected")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(AU.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ia, {
      n: "download"
    }),
    onClick: () => setModal("export")
  }, "Export report"), /*#__PURE__*/React.createElement(AU.Button, {
    size: "sm",
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ia, {
      n: "refresh-cw"
    }),
    onClick: () => setModal("verify")
  }, "Re-verify chain"))), /*#__PURE__*/React.createElement("div", {
    className: "sect-h"
  }, /*#__PURE__*/React.createElement("h2", null, "Real-time anomaly detection"), /*#__PURE__*/React.createElement("div", {
    className: "end"
  }, /*#__PURE__*/React.createElement(AU.Badge, {
    tone: "amber",
    dot: true
  }, "3 active signals"))), /*#__PURE__*/React.createElement("div", {
    className: "anoms"
  }, ANOMS.map(x => /*#__PURE__*/React.createElement("div", {
    className: "anom anom--" + x.tone,
    key: x.id,
    onClick: () => {
      setAnom(x);
      setModal("anomaly");
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "anom__ic"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: x.icon
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "anom__t"
  }, x.t, x.live && /*#__PURE__*/React.createElement("span", {
    className: "anom__live"
  }, "LIVE")), /*#__PURE__*/React.createElement("div", {
    className: "anom__d"
  }, x.d), /*#__PURE__*/React.createElement("div", {
    className: "anom__when"
  }, x.when))))), /*#__PURE__*/React.createElement("div", {
    className: "fxbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxbar__sr"
  }, /*#__PURE__*/React.createElement(AU.Input, {
    iconLeft: /*#__PURE__*/React.createElement(Ia, {
      n: "search"
    }),
    placeholder: "Search by actor, action, hash or station\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxbar__sel"
  }, /*#__PURE__*/React.createElement(AU.Select, {
    options: ["All actions", "VOTER_VERIFIED", "VOTER_VOTED", "TEMPLATE_ACCESSED", "PERMISSION_CHANGED", "LOGIN"]
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxbar__sel"
  }, /*#__PURE__*/React.createElement(AU.Select, {
    options: ["All services", "Verification", "AI / ML", "Registry", "IAM", "Auth"]
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxbar__sel"
  }, /*#__PURE__*/React.createElement(AU.Select, {
    options: ["Today (live)", "Last hour", "Last 24h", "Custom…"]
  })), /*#__PURE__*/React.createElement(AU.Button, {
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ia, {
      n: "download"
    }),
    onClick: () => setModal("export")
  }, "Export")), /*#__PURE__*/React.createElement("div", {
    className: "cols",
    style: {
      gridTemplateColumns: "1.62fr 1fr",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(AU.Card, {
    title: "Audit log explorer",
    subtitle: "Append-only \xB7 tamper-evident \xB7 7 of 8.41M shown",
    bodyClassName: "p0",
    headerEnd: /*#__PURE__*/React.createElement(AU.Badge, {
      tone: "green",
      size: "sm",
      dot: true
    }, "SIGNED")
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Time"), /*#__PURE__*/React.createElement("th", null, "Action"), /*#__PURE__*/React.createElement("th", null, "Actor"), /*#__PURE__*/React.createElement("th", null, "Station"), /*#__PURE__*/React.createElement("th", null, "Entry hash"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, LOG.map((e, i) => /*#__PURE__*/React.createElement("tr", {
    className: "row-hover clk",
    key: i,
    onClick: () => {
      setEntry(e);
      setModal("entry");
    }
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      fontSize: 12
    }
  }, e.t), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "logact"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: TONE_VAR[ACT_TONE[e.action] || "neutral"]
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "a"
  }, e.action))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "actor"
  }, /*#__PURE__*/React.createElement("span", {
    className: "actor__av"
  }, e.init), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "actor__n"
  }, e.actor), /*#__PURE__*/React.createElement("div", {
    className: "actor__r"
  }, e.role)))), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      fontSize: 12
    }
  }, e.station), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "hashmono"
  }, e.h, "\u2026")), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right"
    },
    onClick: ev => ev.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "rowact",
    onClick: () => {
      setEntry(e);
      setModal("entry");
    },
    "aria-label": "Open entry"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "chevron-right"
  })))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(AU.Card, {
    title: "Verification history",
    subtitle: "By polling station \xB7 today"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vbs"
  }, stations.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "vbs__row",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "vbs__ps"
  }, s.ps), /*#__PURE__*/React.createElement("span", {
    className: "vbs__meter"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: s.pct * 100 + "%"
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "vbs__n"
  }, /*#__PURE__*/React.createElement("b", null, s.n.toLocaleString()), " \xB7 ", Math.round(s.pct * 100), "%"))))), /*#__PURE__*/React.createElement(AU.Card, {
    title: "Access by location",
    subtitle: "Admin activity \xB7 geo-mapped"
  }, /*#__PURE__*/React.createElement("div", {
    className: "geo-list"
  }, geo.map((g, i) => /*#__PURE__*/React.createElement("div", {
    className: "geo",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "geo__ic"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: g.ic
  })), /*#__PURE__*/React.createElement("div", {
    className: "geo__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "geo__l"
  }, g.l), /*#__PURE__*/React.createElement("div", {
    className: "geo__d"
  }, g.d)), /*#__PURE__*/React.createElement("span", {
    className: "geo__n"
  }, g.n))))))), modal === "entry" && entry && /*#__PURE__*/React.createElement(LogDetailModal, {
    e: entry,
    onClose: () => setModal(null)
  }), modal === "verify" && /*#__PURE__*/React.createElement(VerifyModal, {
    onClose: () => setModal(null)
  }), modal === "export" && /*#__PURE__*/React.createElement(ExportAuditModal, {
    onClose: () => setModal(null),
    onConfirm: () => fire("Audit report generated")
  }), modal === "anomaly" && anom && /*#__PURE__*/React.createElement(AnomalyModal, {
    a: anom,
    onClose: () => setModal(null),
    onAck: () => fire("Anomaly acknowledged · " + anom.id),
    onCase: () => fire("Opening case " + anom.cases)
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "fx-toast"
  }, /*#__PURE__*/React.createElement(Ia, {
    n: "check-circle",
    s: {
      width: 16,
      height: 16
    }
  }), toast));
}
window.AdminScreens = window.AdminScreens || {};
window.AdminScreens.AuditView = AuditView;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-audit/AuditView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-audit/FraudWidgets.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// FraudWidgets.jsx — geographic fraud heatmap + biometric voter-photo scan
// Shared by the Fraud detection and Reporting views.
const {
  useEffect: useEffectFW,
  useState: useStateFW
} = React;
const Ifw = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lucideFW() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}

/* Rwanda's 30 districts at their true geographic centroids [lon, lat].
   cases = open fraud cases; k = intensity level (0 none → 5 critical). */
const DISTRICTS = [
// Kigali City
{
  n: "Nyarugenge",
  lon: 30.06,
  lat: -1.95,
  cases: 6
}, {
  n: "Gasabo",
  lon: 30.10,
  lat: -1.90,
  cases: 9
}, {
  n: "Kicukiro",
  lon: 30.10,
  lat: -1.97,
  cases: 7
},
// Northern
{
  n: "Musanze",
  lon: 29.63,
  lat: -1.50,
  cases: 2
}, {
  n: "Burera",
  lon: 29.86,
  lat: -1.47,
  cases: 0
}, {
  n: "Gakenke",
  lon: 29.78,
  lat: -1.68,
  cases: 1
}, {
  n: "Rulindo",
  lon: 30.06,
  lat: -1.77,
  cases: 0
}, {
  n: "Gicumbi",
  lon: 30.10,
  lat: -1.58,
  cases: 3
},
// Southern
{
  n: "Muhanga",
  lon: 29.75,
  lat: -2.08,
  cases: 2
}, {
  n: "Kamonyi",
  lon: 29.90,
  lat: -2.00,
  cases: 1
}, {
  n: "Ruhango",
  lon: 29.78,
  lat: -2.23,
  cases: 1
}, {
  n: "Nyanza",
  lon: 29.75,
  lat: -2.35,
  cases: 2
}, {
  n: "Huye",
  lon: 29.74,
  lat: -2.53,
  cases: 3
}, {
  n: "Gisagara",
  lon: 29.83,
  lat: -2.60,
  cases: 1
}, {
  n: "Nyaruguru",
  lon: 29.55,
  lat: -2.66,
  cases: 0
}, {
  n: "Nyamagabe",
  lon: 29.40,
  lat: -2.40,
  cases: 1
},
// Western
{
  n: "Rubavu",
  lon: 29.36,
  lat: -1.68,
  cases: 5
}, {
  n: "Nyabihu",
  lon: 29.50,
  lat: -1.65,
  cases: 2
}, {
  n: "Ngororero",
  lon: 29.52,
  lat: -1.87,
  cases: 1
}, {
  n: "Rutsiro",
  lon: 29.37,
  lat: -1.93,
  cases: 1
}, {
  n: "Karongi",
  lon: 29.38,
  lat: -2.06,
  cases: 0
}, {
  n: "Nyamasheke",
  lon: 29.14,
  lat: -2.35,
  cases: 1
}, {
  n: "Rusizi",
  lon: 28.96,
  lat: -2.48,
  cases: 0
},
// Eastern
{
  n: "Nyagatare",
  lon: 30.33,
  lat: -1.30,
  cases: 2
}, {
  n: "Gatsibo",
  lon: 30.43,
  lat: -1.58,
  cases: 3
}, {
  n: "Kayonza",
  lon: 30.62,
  lat: -1.88,
  cases: 1
}, {
  n: "Rwamagana",
  lon: 30.43,
  lat: -1.95,
  cases: 3
}, {
  n: "Ngoma",
  lon: 30.55,
  lat: -2.16,
  cases: 1
}, {
  n: "Kirehe",
  lon: 30.71,
  lat: -2.22,
  cases: 0
}, {
  n: "Bugesera",
  lon: 30.18,
  lat: -2.30,
  cases: 4
}];
DISTRICTS.forEach(d => {
  d.k = d.cases === 0 ? 0 : d.cases <= 1 ? 1 : d.cases <= 2 ? 2 : d.cases <= 3 ? 3 : d.cases <= 5 ? 4 : 5;
});

/* Rwanda national border — real waypoints [lon, lat], clockwise from the north. */
const BORDER = [[29.55, -1.08], [29.80, -1.06], [30.00, -1.13], [30.22, -1.07], [30.35, -1.13], [30.42, -1.06], [30.48, -1.13], [30.60, -1.35], [30.71, -1.40], [30.83, -1.75], [30.88, -2.04], [30.86, -2.31], [30.70, -2.37], [30.53, -2.40], [30.46, -2.60], [30.34, -2.55], [30.10, -2.43], [29.98, -2.62], [29.91, -2.80], [29.76, -2.81], [29.63, -2.75], [29.40, -2.82], [29.22, -2.75], [29.02, -2.72], [28.91, -2.55], [28.96, -2.38], [29.11, -2.32], [29.16, -2.16], [29.27, -2.03], [29.21, -1.86], [29.25, -1.70], [29.36, -1.59], [29.45, -1.50], [29.53, -1.40], [29.49, -1.25]];

// 0 none → 5 critical
const RAMP = [{
  bg: "var(--bg-inset)",
  fg: "var(--text-subtle)",
  lbl: "None"
}, {
  bg: "var(--amber-200)",
  fg: "var(--amber-700)",
  lbl: "Low"
}, {
  bg: "var(--amber-400)",
  fg: "var(--slate-900)",
  lbl: "Moderate"
}, {
  bg: "var(--red-400)",
  fg: "#fff",
  lbl: "Elevated"
}, {
  bg: "var(--red-500)",
  fg: "#fff",
  lbl: "High"
}, {
  bg: "var(--red-600)",
  fg: "#fff",
  lbl: "Critical"
}];
const GLOW = ["", "var(--amber-300)", "var(--amber-400)", "var(--red-400)", "var(--red-500)", "var(--red-600)"];

// equirectangular projection into the viewBox
const MAP_W = 440,
  MAP_H = 400;
const LON_MIN = 28.86,
  LON_RANGE = 2.06,
  LAT_TOP = -1.02,
  LAT_RANGE = 1.86;
const px = lon => +((lon - LON_MIN) / LON_RANGE * MAP_W).toFixed(1);
const py = lat => +((LAT_TOP - lat) / LAT_RANGE * MAP_H).toFixed(1);
const BORDER_PATH = BORDER.map((p, i) => (i ? "L" : "M") + px(p[0]) + " " + py(p[1])).join(" ") + " Z";

/* ---- Voronoi tessellation: divide the territory into 30 district regions ----
   Each district's cell = the national polygon clipped by the perpendicular
   bisector half-plane against every other district centroid (Sutherland-Hodgman). */
const BORDER_PTS = BORDER.map(p => ({
  x: px(p[0]),
  y: py(p[1])
}));
const SITES = DISTRICTS.map(d => ({
  x: px(d.lon),
  y: py(d.lat)
}));
function clipHalfPlane(poly, s, t) {
  const dx = t.x - s.x,
    dy = t.y - s.y;
  const c = (t.x * t.x + t.y * t.y - s.x * s.x - s.y * s.y) / 2; // inside: p·(t-s) <= c
  const f = p => p.x * dx + p.y * dy - c;
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const A = poly[i],
      B = poly[(i + 1) % poly.length];
    const fa = f(A),
      fb = f(B);
    if (fa <= 0) out.push(A);
    if (fa <= 0 !== fb <= 0) {
      const tt = fa / (fa - fb);
      out.push({
        x: A.x + tt * (B.x - A.x),
        y: A.y + tt * (B.y - A.y)
      });
    }
  }
  return out;
}
function voronoiCell(i) {
  let poly = BORDER_PTS;
  for (let j = 0; j < SITES.length; j++) {
    if (j === i) continue;
    poly = clipHalfPlane(poly, SITES[i], SITES[j]);
    if (poly.length < 3) break;
  }
  return poly;
}
const polyToPath = poly => poly.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ") + " Z";
const CELLS = DISTRICTS.map((d, i) => ({
  d,
  path: polyToPath(voronoiCell(i))
}));

/* ---- Real district boundaries from geoBoundaries (gbOpen ADM2, CC-BY / GADM-class open data) ----
   Fetched once at runtime from GitHub raw (CORS-enabled), projected, then cached in
   localStorage. If the network is unavailable we fall back to the Voronoi tessellation. */
const ADM2_URLS = ["https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/RWA/ADM2/geoBoundaries-RWA-ADM2_simplified.geojson", "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/RWA/ADM2/geoBoundaries-RWA-ADM2.geojson"];
const GEO_CACHE_KEY = "rw_adm2_geo_v1";
const CASE_BY = {};
DISTRICTS.forEach(d => {
  CASE_BY[d.n.toLowerCase()] = d;
});
const PROVINCE = {
  Nyarugenge: "Kigali City",
  Gasabo: "Kigali City",
  Kicukiro: "Kigali City",
  Musanze: "Northern Province",
  Burera: "Northern Province",
  Gakenke: "Northern Province",
  Rulindo: "Northern Province",
  Gicumbi: "Northern Province",
  Muhanga: "Southern Province",
  Kamonyi: "Southern Province",
  Ruhango: "Southern Province",
  Nyanza: "Southern Province",
  Huye: "Southern Province",
  Gisagara: "Southern Province",
  Nyaruguru: "Southern Province",
  Nyamagabe: "Southern Province",
  Rubavu: "Western Province",
  Nyabihu: "Western Province",
  Ngororero: "Western Province",
  Rutsiro: "Western Province",
  Karongi: "Western Province",
  Nyamasheke: "Western Province",
  Rusizi: "Western Province",
  Nyagatare: "Eastern Province",
  Gatsibo: "Eastern Province",
  Kayonza: "Eastern Province",
  Rwamagana: "Eastern Province",
  Ngoma: "Eastern Province",
  Kirehe: "Eastern Province",
  Bugesera: "Eastern Province"
};
const RANKED = [...DISTRICTS].sort((a, b) => b.cases - a.cases);
function makeProject(bbox, pad) {
  const [minX, minY, maxX, maxY] = bbox;
  const s = Math.min((MAP_W - 2 * pad) / (maxX - minX), (MAP_H - 2 * pad) / (maxY - minY));
  const ox = (MAP_W - s * (maxX - minX)) / 2,
    oy = (MAP_H - s * (maxY - minY)) / 2;
  return (lon, lat) => [ox + (lon - minX) * s, oy + (maxY - lat) * s];
}
function useRwandaGeo() {
  const [geo, setGeo] = useStateFW(null);
  useEffectFW(() => {
    try {
      const c = localStorage.getItem(GEO_CACHE_KEY);
      if (c) {
        setGeo(JSON.parse(c));
        return;
      }
    } catch (e) {}
    let alive = true;
    (async () => {
      for (const url of ADM2_URLS) {
        try {
          const r = await fetch(url);
          if (!r.ok) continue;
          const json = await r.json();
          const features = (json.features || []).map(f => {
            const g = f.geometry || {};
            const polys = g.type === "MultiPolygon" ? g.coordinates : g.type === "Polygon" ? [g.coordinates] : [];
            const rings = polys.map(p => p[0].map(pt => [+pt[0].toFixed(4), +pt[1].toFixed(4)]));
            const props = f.properties || {};
            return {
              name: props.shapeName || props.ADM2_EN || props.NAME_2 || "",
              rings
            };
          }).filter(f => f.rings.length);
          if (features.length < 10) continue;
          let minX = 1e9,
            minY = 1e9,
            maxX = -1e9,
            maxY = -1e9;
          features.forEach(f => f.rings.forEach(ring => ring.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          })));
          const data = {
            features,
            bbox: [minX, minY, maxX, maxY]
          };
          if (!alive) return;
          try {
            localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(data));
          } catch (e) {}
          setGeo(data);
          return;
        } catch (e) {/* try next url */}
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  return geo;
}
function FraudHeatmap({
  compact
}) {
  useEffectFW(lucideFW);
  const geo = useRwandaGeo();
  const total = DISTRICTS.reduce((a, d) => a + d.cases, 0);
  const top = RANKED.slice(0, 5);
  const [hover, setHover] = useStateFW(null); // { name, x, y }
  const [sel, setSel] = useStateFW(null); // district name
  const wrapRef = React.useRef(null);
  const ANCHORS = [{
    n: "Kigali",
    lon: 30.09,
    lat: -1.89,
    hot: true
  }, {
    n: "Rubavu",
    lon: 29.36,
    lat: -1.68,
    hot: true
  }, {
    n: "Bugesera",
    lon: 30.18,
    lat: -2.34,
    hot: false
  }, {
    n: "Musanze",
    lon: 29.63,
    lat: -1.47,
    hot: false
  }, {
    n: "Huye",
    lon: 29.74,
    lat: -2.57,
    hot: false
  }];
  const proj = geo ? makeProject(geo.bbox, 8) : (lon, lat) => [px(lon), py(lat)];
  const dataFor = name => CASE_BY[(name || "").toLowerCase()];
  const onMove = (name, e) => {
    const r = wrapRef.current && wrapRef.current.getBoundingClientRect();
    if (!r) return;
    setHover({
      name,
      x: e.clientX - r.left,
      y: e.clientY - r.top
    });
  };
  const selData = sel ? dataFor(sel) : null;
  const hoverData = hover ? dataFor(hover.name) : null;
  const handlers = name => ({
    style: {
      cursor: "pointer",
      transition: "opacity .15s ease"
    },
    onMouseMove: e => onMove(name, e),
    onMouseEnter: e => onMove(name, e),
    onMouseLeave: () => setHover(null),
    onClick: () => setSel(s => s === name ? null : name)
  });
  const opacityFor = name => sel && sel !== name && (!hover || hover.name !== name) ? 0.45 : 1;
  const strokeFor = name => sel === name ? "var(--slate-900)" : "#fff";
  const strokeWFor = name => sel === name ? 2.2 : hover && hover.name === name ? 1.6 : 0.7;
  return /*#__PURE__*/React.createElement("div", {
    className: "heat" + (compact ? " heat--compact" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "heat__map",
    ref: wrapRef,
    style: {
      position: "relative"
    },
    onMouseLeave: () => setHover(null)
  }, /*#__PURE__*/React.createElement("svg", {
    className: "heat-svg",
    viewBox: `0 0 ${MAP_W} ${MAP_H}`,
    role: "img",
    "aria-label": "Interactive geographic heatmap of fraud cases across Rwanda's 30 districts"
  }, geo ? geo.features.map(f => {
    const cd = dataFor(f.name);
    const k = cd ? cd.k : 0;
    const d = f.rings.map(ring => ring.map((pt, i) => {
      const [x, y] = proj(pt[0], pt[1]);
      return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ") + " Z").join(" ");
    return /*#__PURE__*/React.createElement("path", _extends({
      key: f.name,
      d: d,
      fill: RAMP[k].bg,
      stroke: strokeFor(f.name),
      strokeWidth: strokeWFor(f.name),
      strokeLinejoin: "round",
      opacity: opacityFor(f.name)
    }, handlers(f.name)));
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, CELLS.map(({
    d,
    path
  }) => /*#__PURE__*/React.createElement("path", _extends({
    key: d.n,
    d: path,
    fill: RAMP[d.k].bg,
    stroke: strokeFor(d.n),
    strokeWidth: strokeWFor(d.n),
    strokeLinejoin: "round",
    opacity: opacityFor(d.n)
  }, handlers(d.n)))), /*#__PURE__*/React.createElement("path", {
    d: BORDER_PATH,
    fill: "none",
    stroke: "var(--slate-500)",
    strokeWidth: "1.6",
    strokeLinejoin: "round",
    style: {
      pointerEvents: "none"
    }
  })), DISTRICTS.map(d => {
    const [x, y] = proj(d.lon, d.lat);
    return /*#__PURE__*/React.createElement("circle", {
      key: d.n,
      cx: x,
      cy: y,
      r: sel === d.n ? 2.6 : 1.5,
      fill: sel === d.n ? "var(--slate-900)" : d.k >= 3 ? "rgba(255,255,255,.85)" : "var(--text-muted)",
      style: {
        pointerEvents: "none"
      }
    });
  }), ANCHORS.map(a => {
    const [x, y] = proj(a.lon, a.lat);
    return /*#__PURE__*/React.createElement("text", {
      key: a.n,
      x: x,
      y: y - 8,
      textAnchor: "middle",
      className: "heat-lbl" + (a.hot ? " hot" : ""),
      style: {
        pointerEvents: "none"
      }
    }, a.n);
  })), hover && hoverData && /*#__PURE__*/React.createElement("div", {
    className: "heat-tip",
    style: {
      left: hover.x,
      top: hover.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "heat-tip__n"
  }, hover.name), /*#__PURE__*/React.createElement("div", {
    className: "heat-tip__p"
  }, PROVINCE[hover.name] || "Rwanda"), /*#__PURE__*/React.createElement("div", {
    className: "heat-tip__r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "heat-tip__sw",
    style: {
      background: RAMP[hoverData.k].bg
    }
  }), hoverData.cases, " case", hoverData.cases === 1 ? "" : "s", " \xB7 ", RAMP[hoverData.k].lbl)), /*#__PURE__*/React.createElement("div", {
    className: "heat__legend"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hl-cap"
  }, "Fewer"), RAMP.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "hl-sw",
    style: {
      background: t.bg,
      borderColor: i === 0 ? "var(--border-default)" : "transparent"
    },
    title: t.lbl
  })), /*#__PURE__*/React.createElement("span", {
    className: "hl-cap"
  }, "More cases"), /*#__PURE__*/React.createElement("span", {
    className: "heat__hint"
  }, /*#__PURE__*/React.createElement(Ifw, {
    n: "mouse-pointer-click",
    s: {
      width: 12,
      height: 12
    }
  }), " click a district"))), /*#__PURE__*/React.createElement("div", {
    className: "heat__side"
  }, selData ? /*#__PURE__*/React.createElement("div", {
    className: "heat-detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "heat-detail__top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "heat-detail__n"
  }, sel), /*#__PURE__*/React.createElement("div", {
    className: "heat-detail__p"
  }, PROVINCE[sel] || "Rwanda")), /*#__PURE__*/React.createElement("button", {
    className: "heat-detail__x",
    onClick: () => setSel(null),
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(Ifw, {
    n: "x",
    s: {
      width: 15,
      height: 15
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "heat-detail__big",
    style: {
      color: selData.k >= 3 ? "var(--status-rejected-text)" : selData.k >= 1 ? "var(--status-review-text)" : "var(--text-muted)"
    }
  }, selData.cases, /*#__PURE__*/React.createElement("small", null, "open case", selData.cases === 1 ? "" : "s")), /*#__PURE__*/React.createElement("div", {
    className: "heat-detail__lvl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "heat-tip__sw",
    style: {
      background: RAMP[selData.k].bg
    }
  }), RAMP[selData.k].lbl, " intensity \xB7 level ", selData.k, "/5"), /*#__PURE__*/React.createElement("div", {
    className: "heat-detail__rk"
  }, "Ranked #", RANKED.findIndex(d => d.n === sel) + 1, " of 30 \xB7 ", total ? Math.round(selData.cases / total * 100) : 0, "% of national caseload"), /*#__PURE__*/React.createElement("div", {
    className: "heat-detail__act"
  }, /*#__PURE__*/React.createElement("button", {
    className: "heat-detail__btn"
  }, /*#__PURE__*/React.createElement(Ifw, {
    n: "folder-open",
    s: {
      width: 14,
      height: 14
    }
  }), " View cases"), /*#__PURE__*/React.createElement("button", {
    className: "heat-detail__btn ghost"
  }, /*#__PURE__*/React.createElement(Ifw, {
    n: "map-pin",
    s: {
      width: 14,
      height: 14
    }
  }), " Stations"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "heat__stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hs-n"
  }, total), /*#__PURE__*/React.createElement("div", {
    className: "hs-l"
  }, "flagged cases \xB7 30 districts")), /*#__PURE__*/React.createElement("div", {
    className: "heat__note"
  }, /*#__PURE__*/React.createElement(Ifw, {
    n: "info",
    s: {
      width: 13,
      height: 13
    }
  }), "Kigali City (Gasabo, Kicukiro, Nyarugenge) accounts for ", Math.round((9 + 7 + 6) / total * 100), "% of flagged cases.")), /*#__PURE__*/React.createElement("div", {
    className: "heat__toplbl"
  }, "Highest concentration"), /*#__PURE__*/React.createElement("div", {
    className: "heat__top"
  }, top.map((d, i) => /*#__PURE__*/React.createElement("button", {
    className: "ht-row" + (sel === d.n ? " on" : ""),
    key: d.n,
    onClick: () => setSel(s => s === d.n ? null : d.n),
    onMouseEnter: e => onMove(d.n, e),
    onMouseLeave: () => setHover(null)
  }, /*#__PURE__*/React.createElement("span", {
    className: "ht-rank"
  }, i + 1), /*#__PURE__*/React.createElement("span", {
    className: "ht-name"
  }, d.n), /*#__PURE__*/React.createElement("span", {
    className: "ht-bar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: d.cases / top[0].cases * 100 + "%",
      background: GLOW[d.k] || "var(--slate-300)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "ht-ct"
  }, d.cases)))), /*#__PURE__*/React.createElement("div", {
    className: "heat__credit"
  }, "District boundaries \xB7 geoBoundaries (gbOpen, CC-BY)")));
}

/* ---------- Biometric voter-photo scan (captured vs. on file) ---------- */
const PERSON_SVG = /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 12.6a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6Zm0 1.7c-3.5 0-8 1.8-8 5.2V21h16v-1.5c0-3.4-4.5-5.2-8-5.2Z"
}));
function Portrait({
  kind,
  tone,
  scan
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "vp vp--" + tone
  }, /*#__PURE__*/React.createElement("div", {
    className: "vp__img"
  }, /*#__PURE__*/React.createElement("span", {
    className: "vp__face"
  }, PERSON_SVG), scan && /*#__PURE__*/React.createElement("span", {
    className: "vp__brackets"
  }), scan && /*#__PURE__*/React.createElement("span", {
    className: "vp__scanline"
  })), /*#__PURE__*/React.createElement("div", {
    className: "vp__cap"
  }, kind));
}
function VoterScan({
  score,
  verdict
}) {
  useEffectFW(lucideFW, [score]);
  const pct = Math.round(score * 100);
  const tone = verdict === "rejected" ? "red" : verdict === "review" ? "amber" : "green";
  const label = verdict === "rejected" ? "FACE MISMATCH" : verdict === "review" ? "NEEDS REVIEW" : "FACE MATCH";
  return /*#__PURE__*/React.createElement("div", {
    className: "vscan"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vscan__pair"
  }, /*#__PURE__*/React.createElement(Portrait, {
    kind: "Captured at station",
    tone: tone,
    scan: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "vscan__vs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "vscan__pct vscan__pct--" + tone
  }, pct, /*#__PURE__*/React.createElement("small", null, "%")), /*#__PURE__*/React.createElement("span", {
    className: "vscan__plbl"
  }, "similarity"), /*#__PURE__*/React.createElement(Ifw, {
    n: verdict === "approved" ? "check" : "arrow-left-right",
    s: {
      width: 16,
      height: 16
    }
  })), /*#__PURE__*/React.createElement(Portrait, {
    kind: "On file \xB7 registry",
    tone: "neutral"
  })), /*#__PURE__*/React.createElement("div", {
    className: "vscan__verdict vscan__verdict--" + tone
  }, /*#__PURE__*/React.createElement(Ifw, {
    n: verdict === "rejected" ? "user-x" : verdict === "review" ? "user-search" : "user-check",
    s: {
      width: 15,
      height: 15
    }
  }), label, /*#__PURE__*/React.createElement("span", {
    className: "vscan__meta"
  }, "1:1 face \xB7 liveness ", verdict === "rejected" ? "passed (spoof ruled out)" : "passed", " \xB7 captured 14:40")));
}
window.FraudWidgets = {
  FraudHeatmap,
  VoterScan
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-audit/FraudWidgets.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-audit/RegistryView.jsx
try { (() => {
// RegistryView.jsx — Voter Database Management (Module 5) + full modal set
const {
  useEffect: useEffectR2,
  useState: useStateR2
} = React;
const R2 = window.SecurePollRWDesignSystem_92875f;
const Ir = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lr2() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
function KpiR({
  label,
  icon,
  tint,
  value,
  unit,
  delta,
  dir
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kpi__lbl"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "kpi__ic",
    style: {
      background: tint.bg,
      color: tint.fg
    }
  }, /*#__PURE__*/React.createElement(Ir, {
    n: icon
  }))), /*#__PURE__*/React.createElement("div", {
    className: "kpi__val"
  }, value, unit && /*#__PURE__*/React.createElement("small", null, " ", unit)), delta && /*#__PURE__*/React.createElement("span", {
    className: "kpi__delta " + dir
  }, /*#__PURE__*/React.createElement(Ir, {
    n: dir === "up" ? "trending-up" : "trending-down"
  }), delta));
}
const STATUS = {
  registered: {
    tone: "blue",
    label: "REGISTERED"
  },
  voted: {
    tone: "green",
    label: "VOTED"
  },
  blocked: {
    tone: "red",
    label: "BLOCKED"
  },
  flagged: {
    tone: "amber",
    label: "FLAGGED"
  },
  archived: {
    tone: "neutral",
    label: "ARCHIVED"
  }
};
const VOTERS = [{
  nid: "1 1990 8 0012345 6 78",
  name: "Jean Baptiste Niyonzima",
  init: "JN",
  sex: "Male",
  dob: "12 Aug 1990",
  district: "Nyarugenge",
  station: "PS-014",
  s: "voted",
  biom: {
    face: true,
    print: true
  },
  last: "Voted · 14:41 today",
  reg: "#18992",
  enrolled: "08 Mar 2024",
  phone: "+250 7•• ••• 142",
  quality: 100
}, {
  nid: "1 1994 7 0098765 4 32",
  name: "Aline Uwase",
  init: "AU",
  sex: "Female",
  dob: "03 Jul 1994",
  district: "Nyarugenge",
  station: "PS-014",
  s: "registered",
  biom: {
    face: true,
    print: true
  },
  last: "Verified · 09 Jun",
  reg: "#20104",
  enrolled: "21 Apr 2024",
  phone: "+250 7•• ••• 887",
  quality: 100
}, {
  nid: "1 1988 2 0044556 7 89",
  name: "Eric Mugisha",
  init: "EM",
  sex: "Male",
  dob: "19 Feb 1988",
  district: "Gasabo",
  station: "PS-203",
  s: "voted",
  biom: {
    face: true,
    print: false
  },
  last: "Voted · 11:20 today",
  reg: "#15007",
  enrolled: "02 Feb 2024",
  phone: "+250 7•• ••• 410",
  quality: 92
}, {
  nid: "1 2001 5 0077123 9 14",
  name: "Chantal Ingabire",
  init: "CI",
  sex: "Female",
  dob: "27 May 2001",
  district: "Kicukiro",
  station: "PS-118",
  s: "flagged",
  biom: {
    face: true,
    print: true
  },
  last: "Dedup review · today",
  reg: "#20451",
  enrolled: "30 May 2024",
  phone: "+250 7•• ••• 233",
  quality: 78
}, {
  nid: "1 1979 3 0011998 2 55",
  name: "Patrick Habimana",
  init: "PH",
  sex: "Male",
  dob: "11 Mar 1979",
  district: "Gasabo",
  station: "PS-203",
  s: "blocked",
  biom: {
    face: true,
    print: true
  },
  last: "Blocked · 02 Jun",
  reg: "#11998",
  enrolled: "18 Jan 2024",
  phone: "+250 7•• ••• 019",
  quality: 88
}, {
  nid: "1 1996 9 0066274 1 07",
  name: "Diane Mukamana",
  init: "DM",
  sex: "Female",
  dob: "05 Sep 1996",
  district: "Musanze",
  station: "PS-061",
  s: "registered",
  biom: {
    face: true,
    print: true
  },
  last: "Verified · 07 Jun",
  reg: "#19872",
  enrolled: "14 Mar 2024",
  phone: "+250 7•• ••• 556",
  quality: 100
}];

/* ---------------- Voter detail (tabbed) ---------------- */
function VoterDetail({
  v,
  onClose,
  onEdit,
  onBlock,
  onArchive,
  onMerge
}) {
  const [tab, setTab] = useStateR2("overview");
  useEffectR2(lr2, [tab]);
  const st = STATUS[v.s];
  const history = [{
    t: "Enrolled in field",
    s: v.station + " · officer #221 · biometrics captured",
    m: v.enrolled,
    state: "done"
  }, {
    t: "Biometrics verified",
    s: "Face + fingerprint quality passed",
    m: v.enrolled,
    state: "done"
  }, {
    t: "Added to certified roll",
    s: "District: " + v.district,
    m: "12 Apr 2024",
    state: "done"
  }, {
    t: v.s === "voted" ? "Voted at station" : "Most recent activity",
    s: v.last,
    m: "today",
    state: v.s === "voted" ? "done" : "current"
  }];
  const audit = [{
    a: "RECORD_CREATED",
    m: "Field enrollment · officer #221",
    h: "a3f9c2…"
  }, {
    a: "BIOMETRIC_LINKED",
    m: "Template stored · HSM-sealed",
    h: "7c21be…"
  }, {
    a: "ADDRESS_UPDATED",
    m: "Sector corrected by support · E. Mugisha",
    h: "0d44a1…"
  }, {
    a: v.s === "blocked" ? "RECORD_BLOCKED" : "STATUS_SYNCED",
    m: v.last,
    h: "f188e0…"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--wide",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Voter record"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, v.reg, " \xB7 ", v.district)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "vprof"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vprof__av"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "user-round"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "vprof__n"
  }, v.name), /*#__PURE__*/React.createElement("div", {
    className: "vprof__id"
  }, v.nid), /*#__PURE__*/React.createElement("div", {
    className: "vprof__badges"
  }, /*#__PURE__*/React.createElement(R2.Badge, {
    tone: st.tone,
    dot: true
  }, st.label), /*#__PURE__*/React.createElement(R2.Badge, {
    tone: v.biom.face && v.biom.print ? "green" : "amber",
    size: "sm"
  }, v.biom.face && v.biom.print ? "BIOMETRICS COMPLETE" : "BIOMETRICS PARTIAL"), /*#__PURE__*/React.createElement(R2.Badge, {
    tone: "neutral",
    size: "sm"
  }, v.station))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(R2.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "pencil"
    }),
    onClick: onEdit
  }, "Edit"), /*#__PURE__*/React.createElement(R2.Button, {
    size: "sm",
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "git-merge"
    }),
    onClick: onMerge
  }, "Merge"))), /*#__PURE__*/React.createElement("div", {
    className: "mtabs"
  }, [["overview", "Overview"], ["history", "Registration history"], ["audit", "Audit trail"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: "mtab" + (tab === k ? " on" : ""),
    onClick: () => setTab(k)
  }, l))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll",
    style: {
      padding: 20
    }
  }, tab === "overview" && /*#__PURE__*/React.createElement("div", {
    className: "fxmeta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Full name"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, v.name)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "National ID"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, v.nid)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Date of birth"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, v.dob)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Sex"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, v.sex)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "District"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, v.district)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Polling station"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, v.station)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Phone"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v mono"
  }, v.phone)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Enrolled"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, v.enrolled)), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Face template"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, v.biom.face ? "On file ✓" : "Missing")), /*#__PURE__*/React.createElement("div", {
    className: "fxmeta__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__k"
  }, "Fingerprint"), /*#__PURE__*/React.createElement("span", {
    className: "fxmeta__v"
  }, v.biom.print ? "On file ✓" : "Missing"))), tab === "history" && /*#__PURE__*/React.createElement("div", {
    className: "fxtl"
  }, history.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "fxtl-step " + s.state,
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "fxtl-dot"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: s.state === "done" ? "check" : "loader"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxtl-bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tt"
  }, s.t), /*#__PURE__*/React.createElement("div", {
    className: "ts"
  }, s.s), /*#__PURE__*/React.createElement("div", {
    className: "tm"
  }, s.m))))), tab === "audit" && /*#__PURE__*/React.createElement("div", {
    className: "chain-list"
  }, audit.map((it, i) => /*#__PURE__*/React.createElement("div", {
    className: "chain-item",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "chain-node"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lnk"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "link"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "chain-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ca"
  }, it.a), /*#__PURE__*/React.createElement("div", {
    className: "cm"
  }, it.m)), /*#__PURE__*/React.createElement("div", {
    className: "chain-hash"
  }, /*#__PURE__*/React.createElement("span", {
    className: "h"
  }, it.h)))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "lock"
  }), " All changes are audit-logged"), /*#__PURE__*/React.createElement(R2.Button, {
    variant: "ghost",
    onClick: onArchive
  }, "Archive"), /*#__PURE__*/React.createElement(R2.Button, {
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "ban"
    }),
    onClick: onBlock
  }, "Block voter"))));
}

/* ---------------- Edit / Add form ---------------- */
function VoterForm({
  v,
  mode,
  onClose,
  onSave
}) {
  useEffectR2(lr2);
  const add = mode === "add";
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, add ? "Add voter record" : "Edit voter"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, add ? "Create a new registry entry" : v.name + " · " + v.reg)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(R2.Input, {
    label: "First name",
    defaultValue: add ? "" : v.name.split(" ")[0],
    placeholder: "First name"
  }), /*#__PURE__*/React.createElement(R2.Input, {
    label: "Last name",
    defaultValue: add ? "" : v.name.split(" ").slice(1).join(" "),
    placeholder: "Last name"
  })), /*#__PURE__*/React.createElement(R2.Input, {
    label: "National ID",
    mono: true,
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "id-card"
    }),
    defaultValue: add ? "" : v.nid,
    placeholder: "16 digits"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(R2.Input, {
    label: "Date of birth",
    type: "date",
    defaultValue: "1994-07-03"
  }), /*#__PURE__*/React.createElement(R2.Select, {
    label: "Sex",
    options: ["Female", "Male"],
    defaultValue: add ? "Female" : v.sex
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(R2.Select, {
    label: "District",
    options: ["Nyarugenge", "Gasabo", "Kicukiro", "Musanze", "Rubavu"],
    defaultValue: add ? "Nyarugenge" : v.district
  }), /*#__PURE__*/React.createElement(R2.Input, {
    label: "Polling station",
    defaultValue: add ? "" : v.station,
    placeholder: "PS-000"
  })), /*#__PURE__*/React.createElement(R2.Input, {
    label: "Phone",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "phone"
    }),
    defaultValue: add ? "" : v.phone,
    placeholder: "+250 7XX XXX XXX"
  }), !add && /*#__PURE__*/React.createElement(R2.Select, {
    label: "Status",
    options: ["Registered", "Voted", "Flagged", "Blocked", "Archived"],
    defaultValue: STATUS[v.s].label[0] + STATUS[v.s].label.slice(1).toLowerCase()
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(R2.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(R2.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "check"
    }),
    onClick: onSave
  }, add ? "Create record" : "Save changes"))));
}

/* ---------------- Batch import (stepper) ---------------- */
function ImportModal({
  onClose,
  onDone
}) {
  const [step, setStep] = useStateR2(1);
  useEffectR2(lr2, [step]);
  const steps = ["Upload", "Map columns", "Validate", "Import"];
  const maps = [["national_id", "National ID"], ["full_name", "Full name"], ["dob", "Date of birth"], ["district", "District"], ["station", "Polling station"]];
  const vals = [{
    ic: "check",
    tone: "green",
    t: "4,812 rows ready to import",
    s: "All required fields present"
  }, {
    ic: "alert-triangle",
    tone: "amber",
    t: "63 rows need review",
    s: "Missing polling station — will default to district HQ"
  }, {
    ic: "x",
    tone: "red",
    t: "12 rows rejected",
    s: "Invalid or duplicate National ID"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--wide",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Batch import voters"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, "Bulk enrollment from a verified CSV file")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "stepper"
  }, steps.map((s, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: s
  }, /*#__PURE__*/React.createElement("div", {
    className: "step" + (step === i + 1 ? " on" : step > i + 1 ? " done" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "step__n"
  }, step > i + 1 ? "✓" : i + 1), /*#__PURE__*/React.createElement("span", {
    className: "step__l"
  }, s)), i < steps.length - 1 && /*#__PURE__*/React.createElement("span", {
    className: "step__line" + (step > i + 1 ? " done" : "")
  })))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll",
    style: {
      padding: 20
    }
  }, step === 1 && /*#__PURE__*/React.createElement("div", {
    className: "reg-drop"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "file-up"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Drag a CSV file here, or click to browse"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "voters.csv \xB7 UTF-8 \xB7 max 50,000 rows \xB7 16-digit National IDs")), step === 2 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "msec",
    style: {
      marginBottom: 8
    }
  }, "Map CSV columns \u2192 registry fields"), maps.map(([src, dst]) => /*#__PURE__*/React.createElement("div", {
    className: "maprow",
    key: src
  }, /*#__PURE__*/React.createElement("span", {
    className: "src"
  }, src), /*#__PURE__*/React.createElement(Ir, {
    n: "arrow-right"
  }), /*#__PURE__*/React.createElement(R2.Select, {
    options: [dst, "— ignore —"]
  })))), step === 3 && /*#__PURE__*/React.createElement("div", null, vals.map((v, i) => /*#__PURE__*/React.createElement("div", {
    className: "valrow",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "valrow__ic",
    style: {
      background: `var(--status-${v.tone === "green" ? "approved" : v.tone === "amber" ? "review" : "rejected"}-soft)`,
      color: `var(--status-${v.tone === "green" ? "approved" : v.tone === "amber" ? "review" : "rejected"}-text)`
    }
  }, /*#__PURE__*/React.createElement(Ir, {
    n: v.ic
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, v.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, v.s)), /*#__PURE__*/React.createElement(R2.Badge, {
    tone: v.tone,
    size: "sm"
  }, ["4,812", "63", "12"][i])))), step === 4 && /*#__PURE__*/React.createElement("div", {
    className: "import-done"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ring"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "check"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 20,
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, "4,875 records imported"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      marginTop: 8,
      fontSize: 13.5
    }
  }, "4,812 added \xB7 63 flagged for review \xB7 12 rejected. Every record was written to the audit chain."))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, step > 1 && step < 4 && /*#__PURE__*/React.createElement(R2.Button, {
    variant: "ghost",
    onClick: () => setStep(step - 1)
  }, "Back"), step < 3 && /*#__PURE__*/React.createElement(R2.Button, {
    variant: "primary",
    iconRight: /*#__PURE__*/React.createElement(Ir, {
      n: "arrow-right"
    }),
    onClick: () => setStep(step + 1)
  }, "Continue"), step === 3 && /*#__PURE__*/React.createElement(R2.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "upload"
    }),
    onClick: () => setStep(4)
  }, "Import 4,875 rows"), step === 4 && /*#__PURE__*/React.createElement(R2.Button, {
    variant: "primary",
    onClick: onDone
  }, "Done"))));
}

/* ---------------- Merge duplicates ---------------- */
function MergeModal({
  onClose,
  onConfirm
}) {
  const [win, setWin] = useStateR2("a");
  useEffectR2(lr2, [win]);
  const A = {
    reg: "#20451",
    name: "Chantal Ingabire",
    nid: "1 2001 5 0077123 9 14",
    enrolled: "30 May 2024",
    station: "PS-118",
    biom: "Complete"
  };
  const B = {
    reg: "#17220",
    name: "Chantal Ingabiré",
    nid: "1 2001 5 0077123 9 14",
    enrolled: "12 Feb 2024",
    station: "PS-014",
    biom: "Face only"
  };
  const col = (rec, key, other) => /*#__PURE__*/React.createElement("div", {
    className: "mcol" + (win === key ? " win" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "mcol__h",
    onClick: () => setWin(key)
  }, /*#__PURE__*/React.createElement("span", {
    className: "mcol__radio"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mcol__t"
  }, rec.name), /*#__PURE__*/React.createElement("div", {
    className: "mcol__s"
  }, rec.reg)), win === key && /*#__PURE__*/React.createElement("span", {
    className: "mcol__win"
  }, "Keep")), /*#__PURE__*/React.createElement("div", {
    className: "mrow" + (rec.name !== other.name ? " diff" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Name"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, rec.name)), /*#__PURE__*/React.createElement("div", {
    className: "mrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "National ID"), /*#__PURE__*/React.createElement("span", {
    className: "v",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11
    }
  }, rec.nid)), /*#__PURE__*/React.createElement("div", {
    className: "mrow" + (rec.enrolled !== other.enrolled ? " diff" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Enrolled"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, rec.enrolled)), /*#__PURE__*/React.createElement("div", {
    className: "mrow" + (rec.station !== other.station ? " diff" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Station"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, rec.station)), /*#__PURE__*/React.createElement("div", {
    className: "mrow" + (rec.biom !== other.biom ? " diff" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Biometrics"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, rec.biom)));
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--wide",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Merge duplicate records"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, "1:N match \xB7 0.88 similarity \xB7 pick the record to keep")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "merge"
  }, col(A, "a", B), col(B, "b", A)), /*#__PURE__*/React.createElement("div", {
    className: "merge-note"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "info"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "The kept record absorbs verified history from both. The other record is archived (never deleted) and the merge is recorded in the audit chain. Highlighted rows differ between records."))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(R2.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(R2.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "git-merge"
    }),
    onClick: onConfirm
  }, "Merge into ", win === "a" ? A.reg : B.reg))));
}

/* ---------------- Block / Archive confirms ---------------- */
function ConfirmModal({
  kind,
  v,
  onClose,
  onConfirm
}) {
  const block = kind === "block";
  const [reason, setReason] = useStateR2(block ? "Confirmed fraud / impersonation" : "Deceased — verified");
  useEffectR2(lr2);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--narrow",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, block ? "Block voter" : "Archive record"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, v.name, " \xB7 ", v.reg)), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fx-warn"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "alert-triangle"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, block ? "Blocking prevents this voter from being verified at any station. The roll position is retained and the action is fully audit-logged." : "Archiving removes the record from active rolls but never deletes it. It can be restored by an administrator.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Reason ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement(R2.Select, {
    value: reason,
    onChange: e => setReason(e.target.value),
    options: block ? ["Confirmed fraud / impersonation", "Court order", "Duplicate enrollment", "Other (see note)"] : ["Deceased — verified", "Relocated abroad", "Duplicate of another record", "Ineligible"]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Note (optional)"), /*#__PURE__*/React.createElement("textarea", {
    className: "fx-ta",
    placeholder: "Supporting detail for the record\u2026"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement(R2.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(R2.Button, {
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: block ? "ban" : "archive"
    }),
    onClick: onConfirm
  }, block ? "Block voter" : "Archive record"))));
}

/* ---------------- Export ---------------- */
function ExportModal({
  onClose,
  onConfirm
}) {
  const [fmt, setFmt] = useStateR2("csv");
  useEffectR2(lr2, [fmt]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal modal--mid",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Export registry"), /*#__PURE__*/React.createElement("div", {
    className: "modal__sub"
  }, "Generate a signed extract of the current filter")), /*#__PURE__*/React.createElement("button", {
    className: "modal__x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal__scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxform"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Format"), /*#__PURE__*/React.createElement("div", {
    className: "fx-seg"
  }, [["csv", "CSV"], ["xlsx", "Excel"], ["pdf", "PDF report"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: fmt === k ? "on normal" : "",
    onClick: () => setFmt(k)
  }, l)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Scope"), /*#__PURE__*/React.createElement(R2.Select, {
    options: ["Current filter (6 shown)", "All Nyarugenge district", "Entire roll (8.42M)"]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "fxf__l"
  }, "Include fields"), /*#__PURE__*/React.createElement("div", {
    className: "fx-checks"
  }, /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Identity & demographics"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Station & status"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox"
  }), " Biometric quality scores"), /*#__PURE__*/React.createElement("label", {
    className: "fx-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Signed integrity hash"))))), /*#__PURE__*/React.createElement("div", {
    className: "modal__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grow"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "lock"
  }), " Exports are watermarked & logged"), /*#__PURE__*/React.createElement(R2.Button, {
    variant: "ghost",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(R2.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "download"
    }),
    onClick: onConfirm
  }, "Export"))));
}

/* ============================ MAIN VIEW ============================ */
function RegistryView() {
  const [sel, setSel] = useStateR2(null);
  const [modal, setModal] = useStateR2(null); // detail|edit|add|import|merge|block|archive|export
  const [toast, setToast] = useStateR2(null);
  const [loading, setLoading] = useStateR2(true);
  useEffectR2(function () {
    var t = setTimeout(function () {
      setLoading(false);
    }, 1100);
    return function () {
      clearTimeout(t);
    };
  }, []);
  useEffectR2(lr2, [modal, sel, loading]);
  const open = (m, v) => {
    if (v) setSel(v);
    setModal(m);
  };
  const fire = msg => {
    setModal(null);
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };
  const dq = [{
    k: "Biometrics on file",
    v: 99.2
  }, {
    k: "Photo captured",
    v: 98.7
  }, {
    k: "Address complete",
    v: 96.4
  }, {
    k: "Contact on file",
    v: 88.1
  }];
  const dupes = [{
    a: "#20451 Chantal Ingabire",
    b: "#17220 Chantal Ingabiré",
    sc: "0.88"
  }, {
    a: "#20388 Claudine U.",
    b: "#17220 Claudine Uwineza",
    sc: "0.84"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "reg2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpis"
  }, /*#__PURE__*/React.createElement(KpiR, {
    label: "Total registered",
    icon: "users",
    tint: {
      bg: "var(--primary-soft)",
      fg: "var(--primary-text)"
    },
    value: "8.42",
    unit: "M",
    delta: "+4,875 imported today",
    dir: "up"
  }), /*#__PURE__*/React.createElement(KpiR, {
    label: "Biometrics on file",
    icon: "fingerprint",
    tint: {
      bg: "var(--secondary-soft)",
      fg: "var(--secondary-text)"
    },
    value: "99.2",
    unit: "%",
    delta: "56k missing",
    dir: "up"
  }), /*#__PURE__*/React.createElement(KpiR, {
    label: "Flagged / blocked",
    icon: "user-x",
    tint: {
      bg: "var(--status-rejected-soft)",
      fg: "var(--status-rejected-text)"
    },
    value: "1,204",
    delta: "312 pending dedup",
    dir: "down"
  }), /*#__PURE__*/React.createElement(KpiR, {
    label: "Data quality",
    icon: "badge-check",
    tint: {
      bg: "var(--status-approved-soft)",
      fg: "var(--status-approved-text)"
    },
    value: "98.6",
    unit: "%",
    delta: "+0.4 this week",
    dir: "up"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fxbar__sr"
  }, /*#__PURE__*/React.createElement(R2.Input, {
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "search"
    }),
    placeholder: "Search by name, National ID or voter ID\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxbar__sel"
  }, /*#__PURE__*/React.createElement(R2.Select, {
    options: ["All districts", "Nyarugenge", "Gasabo", "Kicukiro", "Musanze"]
  })), /*#__PURE__*/React.createElement("div", {
    className: "fxbar__sel"
  }, /*#__PURE__*/React.createElement(R2.Select, {
    options: ["Any status", "Registered", "Voted", "Flagged", "Blocked", "Archived"]
  })), /*#__PURE__*/React.createElement(R2.Button, {
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "upload"
    }),
    onClick: () => open("import")
  }, "Import"), /*#__PURE__*/React.createElement(R2.Button, {
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "download"
    }),
    onClick: () => open("export")
  }, "Export"), /*#__PURE__*/React.createElement(R2.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "user-plus"
    }),
    onClick: () => open("add")
  }, "Add voter")), /*#__PURE__*/React.createElement("div", {
    className: "reg2__main"
  }, /*#__PURE__*/React.createElement(R2.Card, {
    title: "Voter records",
    subtitle: loading ? "Loading records…" : "8,420,114 total · showing 6",
    bodyClassName: "p0",
    headerEnd: /*#__PURE__*/React.createElement(R2.Button, {
      size: "sm",
      variant: "ghost",
      iconLeft: /*#__PURE__*/React.createElement(Ir, {
        n: "refresh-cw"
      }),
      onClick: () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1100);
      }
    }, "Refresh")
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Voter"), /*#__PURE__*/React.createElement("th", null, "District \xB7 station"), /*#__PURE__*/React.createElement("th", null, "Biometrics"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Last activity"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, loading ? [0, 1, 2, 3, 4, 5].map(function (i) {
    return /*#__PURE__*/React.createElement("tr", {
      key: "sk" + i
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "sk-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sk sk-circle",
      style: {
        "--sz": "36px"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "sk-grow sk-stack",
      style: {
        "--g": "7px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "sk sk-line w-70"
    }), /*#__PURE__*/React.createElement("span", {
      className: "sk sk-line w-40"
    })))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "sk sk-line w-60",
      style: {
        display: "block"
      }
    })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "sk sk-line w-30",
      style: {
        display: "block"
      }
    })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "sk sk-chip"
    })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "sk sk-line w-50",
      style: {
        display: "block"
      }
    })), /*#__PURE__*/React.createElement("td", null));
  }) : VOTERS.map((v, i) => /*#__PURE__*/React.createElement("tr", {
    className: "row-hover clk",
    key: i,
    onClick: () => open("detail", v)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "vcell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "vcell__av"
  }, v.init), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "vcell__n"
  }, v.name), /*#__PURE__*/React.createElement("div", {
    className: "vcell__id"
  }, v.nid)))), /*#__PURE__*/React.createElement("td", null, v.district, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-muted)",
      fontFamily: "var(--font-mono)"
    }
  }, v.station)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "biom"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "scan-face",
    className: v.biom.face ? "ok" : "no"
  }), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "fingerprint",
    className: v.biom.print ? "ok" : "no"
  }))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(R2.Badge, {
    tone: STATUS[v.s].tone,
    size: "sm",
    dot: true
  }, STATUS[v.s].label)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 12.5,
      color: "var(--text-muted)"
    }
  }, v.last), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right"
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "rowact",
    onClick: () => open("detail", v),
    "aria-label": "Open record"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "chevron-right"
  })))))))), /*#__PURE__*/React.createElement("div", {
    className: "reg-side"
  }, /*#__PURE__*/React.createElement(R2.Card, {
    title: "Data quality",
    subtitle: "Registry health"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dq"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dq__score"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dq__ring",
    style: {
      background: "conic-gradient(var(--green-500) 0 98.6%, var(--bg-inset) 98.6% 100%)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "98.6")), /*#__PURE__*/React.createElement("div", {
    className: "dq__st"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Healthy"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "8.31M complete records"))), dq.map((d, i) => /*#__PURE__*/React.createElement("div", {
    className: "dqbar",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, d.k), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, d.v, "%")), /*#__PURE__*/React.createElement("div", {
    className: "dqbar__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dqbar__fill",
    style: {
      width: d.v + "%"
    }
  })))))), /*#__PURE__*/React.createElement(R2.Card, {
    title: "Duplicate review",
    subtitle: "312 pending",
    headerEnd: /*#__PURE__*/React.createElement(R2.Badge, {
      tone: "amber",
      size: "sm",
      dot: true
    }, "312")
  }, /*#__PURE__*/React.createElement("div", {
    className: "dupq"
  }, dupes.map((d, i) => /*#__PURE__*/React.createElement("div", {
    className: "dupq__i",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "dupq__top"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, "Likely duplicate"), /*#__PURE__*/React.createElement("span", {
    className: "dupq__sc"
  }, d.sc)), /*#__PURE__*/React.createElement("div", {
    className: "dupq__pair"
  }, /*#__PURE__*/React.createElement("b", null, d.a), /*#__PURE__*/React.createElement("br", null), "\u2194 ", d.b), /*#__PURE__*/React.createElement(R2.Button, {
    size: "sm",
    variant: "secondary",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "git-merge"
    }),
    onClick: () => open("merge")
  }, "Review & merge"))))))), modal === "detail" && sel && /*#__PURE__*/React.createElement(VoterDetail, {
    v: sel,
    onClose: () => setModal(null),
    onEdit: () => setModal("edit"),
    onBlock: () => setModal("block"),
    onArchive: () => setModal("archive"),
    onMerge: () => setModal("merge")
  }), modal === "edit" && sel && /*#__PURE__*/React.createElement(VoterForm, {
    v: sel,
    mode: "edit",
    onClose: () => setModal(null),
    onSave: () => fire("Record updated · " + sel.reg)
  }), modal === "add" && /*#__PURE__*/React.createElement(VoterForm, {
    mode: "add",
    onClose: () => setModal(null),
    onSave: () => fire("Voter record created")
  }), modal === "import" && /*#__PURE__*/React.createElement(ImportModal, {
    onClose: () => setModal(null),
    onDone: () => fire("4,875 records imported")
  }), modal === "merge" && /*#__PURE__*/React.createElement(MergeModal, {
    onClose: () => setModal(null),
    onConfirm: () => fire("Records merged")
  }), modal === "block" && sel && /*#__PURE__*/React.createElement(ConfirmModal, {
    kind: "block",
    v: sel,
    onClose: () => setModal(null),
    onConfirm: () => fire("Voter blocked · " + sel.reg)
  }), modal === "archive" && sel && /*#__PURE__*/React.createElement(ConfirmModal, {
    kind: "archive",
    v: sel,
    onClose: () => setModal(null),
    onConfirm: () => fire("Record archived · " + sel.reg)
  }), modal === "export" && /*#__PURE__*/React.createElement(ExportModal, {
    onClose: () => setModal(null),
    onConfirm: () => fire("Export started — you'll be notified")
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "fx-toast"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "check-circle",
    s: {
      width: 16,
      height: 16
    }
  }), toast));
}
window.AdminScreens = window.AdminScreens || {};
window.AdminScreens.RegistryView = RegistryView;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-audit/RegistryView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-audit/ReportBuilder.jsx
try { (() => {
// ReportBuilder.jsx — drag-and-drop custom report builder + turnout demographics
const {
  useState: useRb,
  useEffect: useRbE
} = React;
const RB = window.SecurePollRWDesignSystem_92875f;
const Irb = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lrb() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
const RB_FIELDS = [{
  id: "district",
  label: "District",
  icon: "map-pin",
  role: "Dimension",
  tint: {
    bg: "var(--secondary-soft)",
    fg: "var(--secondary-text)"
  },
  dim: true
}, {
  id: "station",
  label: "Polling station",
  icon: "building-2",
  role: "Dimension",
  tint: {
    bg: "var(--secondary-soft)",
    fg: "var(--secondary-text)"
  },
  dim: true
}, {
  id: "age",
  label: "Age band",
  icon: "cake",
  role: "Dimension",
  tint: {
    bg: "var(--secondary-soft)",
    fg: "var(--secondary-text)"
  },
  dim: true
}, {
  id: "gender",
  label: "Gender",
  icon: "venus-and-mars",
  role: "Dimension",
  tint: {
    bg: "var(--secondary-soft)",
    fg: "var(--secondary-text)"
  },
  dim: true
}, {
  id: "hour",
  label: "Hour of day",
  icon: "clock",
  role: "Dimension",
  tint: {
    bg: "var(--secondary-soft)",
    fg: "var(--secondary-text)"
  },
  dim: true
}, {
  id: "turnout",
  label: "Turnout %",
  icon: "users",
  role: "Measure",
  tint: {
    bg: "var(--primary-soft)",
    fg: "var(--primary-text)"
  }
}, {
  id: "verified",
  label: "Verifications",
  icon: "badge-check",
  role: "Measure",
  tint: {
    bg: "var(--primary-soft)",
    fg: "var(--primary-text)"
  }
}, {
  id: "rejected",
  label: "Rejections",
  icon: "user-x",
  role: "Measure",
  tint: {
    bg: "var(--primary-soft)",
    fg: "var(--primary-text)"
  }
}, {
  id: "cases",
  label: "Fraud cases",
  icon: "shield-alert",
  role: "Measure",
  tint: {
    bg: "var(--status-review-soft)",
    fg: "var(--status-review-text)"
  }
}, {
  id: "latency",
  label: "Avg. latency",
  icon: "timer",
  role: "Measure",
  tint: {
    bg: "var(--primary-soft)",
    fg: "var(--primary-text)"
  }
}];
const AGGRS = ["Sum", "Average", "Count", "Min", "Max"];
function ReportBuilder() {
  const [cols, setCols] = useRb(["district", "turnout", "verified"]);
  const [aggrs, setAggrs] = useRb({
    turnout: "Average",
    verified: "Sum"
  });
  const [over, setOver] = useRb(false);
  const [dragId, setDragId] = useRb(null);
  useRbE(lrb, [cols, over]);
  const add = id => {
    if (id && !cols.includes(id)) {
      setCols([...cols, id]);
    }
  };
  const remove = id => setCols(cols.filter(c => c !== id));
  const onDrop = e => {
    e.preventDefault();
    setOver(false);
    add(e.dataTransfer.getData("text/plain"));
  };
  const reorder = (from, to) => {
    if (from === to) return;
    const next = [...cols];
    const fi = next.indexOf(from),
      ti = next.indexOf(to);
    next.splice(fi, 1);
    next.splice(ti, 0, from);
    setCols(next);
  };
  return /*#__PURE__*/React.createElement(RB.Card, {
    title: "Custom report builder",
    subtitle: "Drag fields into the canvas to compose a report",
    headerEnd: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(RB.Button, {
      size: "sm",
      variant: "ghost",
      iconLeft: /*#__PURE__*/React.createElement(Irb, {
        n: "rotate-ccw"
      }),
      onClick: () => {
        setCols([]);
      }
    }, "Clear"), /*#__PURE__*/React.createElement(RB.Button, {
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Irb, {
        n: "play"
      })
    }, "Run report"))
  }, /*#__PURE__*/React.createElement("div", {
    className: "rb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rb__palette"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rb__cap"
  }, "Dimensions"), RB_FIELDS.filter(f => f.dim).map(f => /*#__PURE__*/React.createElement(PaletteField, {
    key: f.id,
    f: f,
    used: cols.includes(f.id),
    setDragId: setDragId
  })), /*#__PURE__*/React.createElement("div", {
    className: "rb__cap",
    style: {
      marginTop: 8
    }
  }, "Measures"), RB_FIELDS.filter(f => !f.dim).map(f => /*#__PURE__*/React.createElement(PaletteField, {
    key: f.id,
    f: f,
    used: cols.includes(f.id),
    setDragId: setDragId
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rb__canvas" + (over ? " over" : ""),
    onDragOver: e => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: onDrop
  }, cols.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "rb__empty"
  }, /*#__PURE__*/React.createElement(Irb, {
    n: "layout-template"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Drop fields here"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "Drag dimensions and measures from the left to build your report layout.")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "rb__rows"
  }, cols.map((id, i) => {
    const f = RB_FIELDS.find(x => x.id === id);
    return /*#__PURE__*/React.createElement("div", {
      className: "rb-chip",
      key: id,
      draggable: true,
      onDragStart: e => {
        e.dataTransfer.setData("text/plain", "__order__" + id);
      },
      onDragOver: e => e.preventDefault(),
      onDrop: e => {
        e.stopPropagation();
        const d = e.dataTransfer.getData("text/plain");
        if (d.startsWith("__order__")) reorder(d.slice(9), id);else add(d);
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "rb-chip__num"
    }, i + 1), /*#__PURE__*/React.createElement("span", {
      className: "rb-chip__ic",
      style: {
        background: f.tint.bg,
        color: f.tint.fg
      }
    }, /*#__PURE__*/React.createElement(Irb, {
      n: f.icon
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "rb-chip__nm"
    }, f.label), /*#__PURE__*/React.createElement("div", {
      className: "rb-chip__role"
    }, f.role)), !f.dim && /*#__PURE__*/React.createElement("span", {
      className: "rb-chip__aggr"
    }, /*#__PURE__*/React.createElement("select", {
      value: aggrs[id] || "Sum",
      onChange: e => setAggrs({
        ...aggrs,
        [id]: e.target.value
      })
    }, AGGRS.map(a => /*#__PURE__*/React.createElement("option", {
      key: a
    }, a)))), /*#__PURE__*/React.createElement("button", {
      className: "rb-chip__x",
      onClick: () => remove(id),
      "aria-label": "Remove"
    }, /*#__PURE__*/React.createElement(Irb, {
      n: "x"
    })));
  })), /*#__PURE__*/React.createElement("div", {
    className: "rb__count",
    style: {
      marginTop: 12
    }
  }, cols.filter(c => RB_FIELDS.find(f => f.id === c).dim).length, " dimensions \xB7 ", cols.filter(c => !RB_FIELDS.find(f => f.id === c).dim).length, " measures \xB7 grouped & ready to run")))));
}
function PaletteField({
  f,
  used,
  setDragId
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rb-field" + (used ? " used" : ""),
    draggable: !used,
    onDragStart: e => {
      if (used) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData("text/plain", f.id);
      e.currentTarget.classList.add("dragging");
    },
    onDragEnd: e => e.currentTarget.classList.remove("dragging")
  }, /*#__PURE__*/React.createElement("span", {
    className: "rb-field__ic",
    style: {
      background: f.tint.bg,
      color: f.tint.fg
    }
  }, /*#__PURE__*/React.createElement(Irb, {
    n: f.icon
  })), f.label, /*#__PURE__*/React.createElement("span", {
    className: "rb-field__grip"
  }, /*#__PURE__*/React.createElement(Irb, {
    n: used ? "check" : "grip-vertical"
  })));
}

/* ---------------------- Turnout demographics ---------------------- */
const AGE_BANDS = [{
  l: "18–24",
  f: 58,
  m: 54
}, {
  l: "25–34",
  f: 71,
  m: 66
}, {
  l: "35–44",
  f: 74,
  m: 69
}, {
  l: "45–59",
  f: 68,
  m: 64
}, {
  l: "60+",
  f: 61,
  m: 57
}];
function TurnoutDemographics() {
  useRbE(lrb);
  const max = 80;
  return /*#__PURE__*/React.createElement(RB.Card, {
    title: "Turnout by demographics",
    subtitle: "Aggregated \xB7 age band & gender \xB7 anonymized",
    headerEnd: /*#__PURE__*/React.createElement(RB.Badge, {
      tone: "blue",
      size: "sm"
    }, "DEMOGRAPHICS")
  }, /*#__PURE__*/React.createElement("div", {
    className: "demo"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "demo__age"
  }, AGE_BANDS.map(a => /*#__PURE__*/React.createElement("div", {
    className: "age-col",
    key: a.l
  }, /*#__PURE__*/React.createElement("div", {
    className: "age-col__bars"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "age-col__v"
  }, a.f), /*#__PURE__*/React.createElement("div", {
    className: "age-col__bar f",
    style: {
      height: a.f / max * 130 + "px"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "age-col__v"
  }, a.m), /*#__PURE__*/React.createElement("div", {
    className: "age-col__bar m",
    style: {
      height: a.m / max * 130 + "px"
    }
  }))), /*#__PURE__*/React.createElement("span", {
    className: "age-col__l"
  }, a.l)))), /*#__PURE__*/React.createElement("div", {
    className: "demo__legend"
  }, /*#__PURE__*/React.createElement("span", {
    className: "li"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k",
    style: {
      background: "var(--secondary)"
    }
  }), "Women"), /*#__PURE__*/React.createElement("span", {
    className: "li"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k",
    style: {
      background: "var(--green-500)"
    }
  }), "Men"), /*#__PURE__*/React.createElement("span", {
    className: "li",
    style: {
      marginLeft: "auto"
    }
  }, "turnout % within band"))), /*#__PURE__*/React.createElement("div", {
    className: "demo__gender"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gd-donut",
    style: {
      background: "conic-gradient(var(--secondary) 0 51.3%, var(--green-500) 51.3% 100%)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gd-donut__c"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gd-donut__n"
  }, "51 / 49"), /*#__PURE__*/React.createElement("div", {
    className: "obs-donut__l",
    style: {
      fontSize: 10,
      color: "var(--text-muted)"
    }
  }, "W / M share"))), /*#__PURE__*/React.createElement("div", {
    className: "gd-rows"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gd-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k",
    style: {
      background: "var(--secondary)"
    }
  }), "Women \xB7 67.8% turnout ", /*#__PURE__*/React.createElement("b", null, "944k")), /*#__PURE__*/React.createElement("div", {
    className: "gd-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k",
    style: {
      background: "var(--green-500)"
    }
  }), "Men \xB7 63.1% turnout ", /*#__PURE__*/React.createElement("b", null, "896k"))))));
}
window.ReportBuilder = ReportBuilder;
window.TurnoutDemographics = TurnoutDemographics;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-audit/ReportBuilder.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-audit/tweaks-panel.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-audit/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field-mobile/FieldApp.jsx
try { (() => {
// FieldApp.jsx — mobile field-officer operations app (inside Android bezel)
const {
  useState: useFa,
  useEffect: useFaE
} = React;
const FA = window.SecurePollRWDesignSystem_92875f;
const Ifa = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lfa() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
const PERF = [{
  d: "M",
  v: 38
}, {
  d: "T",
  v: 44
}, {
  d: "W",
  v: 41
}, {
  d: "T",
  v: 52
}, {
  d: "F",
  v: 47,
  today: true
}, {
  d: "S",
  v: 0
}, {
  d: "S",
  v: 0
}];
const RECENT = [{
  in: "CI",
  n: "Chantal Ingabire",
  m: "RW-2026-9F44 · 14:38 · GPS ✓"
}, {
  in: "JN",
  n: "Jean Niyonzima",
  m: "RW-2026-9F41 · 14:21 · GPS ✓"
}, {
  in: "AM",
  n: "Alice Mukamana",
  m: "RW-2026-9F38 · 14:05 · GPS ✓"
}];
function FieldHome() {
  useFaE(lfa);
  const max = 56;
  return /*#__PURE__*/React.createElement("div", {
    className: "fm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fm__hd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fm__hr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fm__av"
  }, "88"), /*#__PURE__*/React.createElement("div", {
    className: "fm__who"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, "D. Habimana"), /*#__PURE__*/React.createElement("div", {
    className: "tm"
  }, "Officer #88 \xB7 Kicukiro team")), /*#__PURE__*/React.createElement("span", {
    className: "fm__bell"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "bell"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "fm__sync"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "upload-cloud"
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "23 records"), " queued to sync"), /*#__PURE__*/React.createElement("span", {
    className: "off"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "cloud-off"
  }), " Offline"))), /*#__PURE__*/React.createElement("div", {
    className: "fm__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fm-sec"
  }, "Today"), /*#__PURE__*/React.createElement("div", {
    className: "fm-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fm-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fm-stat__ic",
    style: {
      background: "var(--primary-soft)",
      color: "var(--primary-text)"
    }
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "user-plus"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat__v"
  }, "47"), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat__l"
  }, "Registrations")), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fm-stat__ic",
    style: {
      background: "var(--status-review-soft)",
      color: "var(--status-review-text)"
    }
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "copy-x"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat__v"
  }, "2"), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat__l"
  }, "Duplicates caught")), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fm-stat__ic",
    style: {
      background: "var(--secondary-soft)",
      color: "var(--secondary-text)"
    }
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "timer"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat__v"
  }, "3:12"), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat__l"
  }, "Avg. capture time")), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fm-stat__ic",
    style: {
      background: "var(--status-approved-soft)",
      color: "var(--status-approved-text)"
    }
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "scan-face"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat__v"
  }, "98%"), /*#__PURE__*/React.createElement("div", {
    className: "fm-stat__l"
  }, "Biometric quality"))), /*#__PURE__*/React.createElement("div", {
    className: "fm-sec"
  }, "Location"), /*#__PURE__*/React.createElement("div", {
    className: "fm-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fm-card__h"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "map-pin",
    s: {
      width: 17,
      height: 17,
      color: "var(--primary-text)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "GPS tagging"), /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, /*#__PURE__*/React.createElement(FA.Badge, {
    tone: "green",
    size: "sm",
    dot: true
  }, "LOCKED"))), /*#__PURE__*/React.createElement("div", {
    className: "fm-map"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fm-map__grid"
  }), /*#__PURE__*/React.createElement("div", {
    className: "fm-map__road",
    style: {
      left: 0,
      right: 0,
      top: "58%",
      height: 7
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "fm-map__road",
    style: {
      top: 0,
      bottom: 0,
      left: "44%",
      width: 7
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "fm-map__ring"
  }), /*#__PURE__*/React.createElement("div", {
    className: "fm-map__pin"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fm-map__coord"
  }, "-1.9874, 30.0913 \xB7 \xB14m")), /*#__PURE__*/React.createElement("div", {
    className: "fm-geo-meta"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "navigation"
  }), " Niboye cell, Kicukiro \xB7 12 registrations tagged at this site today")), /*#__PURE__*/React.createElement("div", {
    className: "fm-sec"
  }, "Last duplicate check"), /*#__PURE__*/React.createElement("div", {
    className: "fm-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fm-dup"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fm-dup__ring"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "shield-check"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "fm-dup__t"
  }, "No duplicate found"), /*#__PURE__*/React.createElement("div", {
    className: "fm-dup__s"
  }, "1:N scan vs 8.42M templates \xB7 top match 0.31, well below the 0.85 threshold"))), /*#__PURE__*/React.createElement("div", {
    className: "fm-dup__meter"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: "31%"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "thr",
    style: {
      left: "85%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "fm-dup__scale"
  }, /*#__PURE__*/React.createElement("span", null, "0.00"), /*#__PURE__*/React.createElement("span", null, "threshold 0.85"), /*#__PURE__*/React.createElement("span", null, "1.00"))), /*#__PURE__*/React.createElement("div", {
    className: "fm-sec"
  }, "Your performance \xB7 this week"), /*#__PURE__*/React.createElement("div", {
    className: "fm-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fm-perf__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fm-perf__big"
  }, "222"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, "registrations"), /*#__PURE__*/React.createElement("span", {
    className: "fm-perf__rank"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "trophy",
    s: {
      width: 12,
      height: 12,
      display: "inline",
      verticalAlign: "-1px",
      marginRight: 3
    }
  }), "#2 in district")), /*#__PURE__*/React.createElement("div", {
    className: "fm-perf__bars"
  }, PERF.map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "fm-perf__col",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "fm-perf__bar " + (p.today ? "today" : p.v ? "on" : ""),
    style: {
      height: Math.max(p.v / max * 60, 3) + "px"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "fm-perf__d"
  }, p.d))))), /*#__PURE__*/React.createElement("div", {
    className: "fm-sec"
  }, "Recent registrations"), /*#__PURE__*/React.createElement("div", {
    className: "fm-card"
  }, RECENT.map((r, i) => /*#__PURE__*/React.createElement("div", {
    className: "fm-rec",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "fm-rec__av"
  }, r.in), /*#__PURE__*/React.createElement("div", {
    className: "fm-rec__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fm-rec__n"
  }, r.n), /*#__PURE__*/React.createElement("div", {
    className: "fm-rec__m"
  }, r.m)), /*#__PURE__*/React.createElement(FA.Badge, {
    tone: "green",
    size: "sm",
    dot: true
  }, "SYNCED")))), /*#__PURE__*/React.createElement("div", {
    className: "fm-cta"
  }, /*#__PURE__*/React.createElement("a", {
    href: "../registration/index.html",
    style: {
      textDecoration: "none",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement(FA.Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Ifa, {
      n: "user-plus"
    })
  }, "New registration")))), /*#__PURE__*/React.createElement("div", {
    className: "fm__tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: "fm-tab on"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "house"
  }), /*#__PURE__*/React.createElement("span", null, "Home")), /*#__PURE__*/React.createElement("button", {
    className: "fm-tab"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "map"
  }), /*#__PURE__*/React.createElement("span", null, "Map")), /*#__PURE__*/React.createElement("button", {
    className: "fm-tab fab"
  }, /*#__PURE__*/React.createElement("span", {
    className: "b"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "user-plus"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "fm-tab"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "refresh-cw"
  }), /*#__PURE__*/React.createElement("span", null, "Sync")), /*#__PURE__*/React.createElement("button", {
    className: "fm-tab"
  }, /*#__PURE__*/React.createElement(Ifa, {
    n: "user"
  }), /*#__PURE__*/React.createElement("span", null, "Profile"))));
}
function FieldApp() {
  useFaE(lfa);
  return /*#__PURE__*/React.createElement("div", {
    className: "fm-page"
  }, /*#__PURE__*/React.createElement(AndroidDevice, {
    width: 412,
    height: 892
  }, /*#__PURE__*/React.createElement(FieldHome, null)));
}
window.FieldApp = FieldApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field-mobile/FieldApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field-mobile/android-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// Android.jsx — Simplified Android (Material 3) device frame
// Status bar + top app bar + content + gesture nav + keyboard.
// Based on Figma M3 spec. No dependencies, no image assets.
// Exports (to window): AndroidDevice, AndroidStatusBar, AndroidAppBar, AndroidListItem, AndroidNavBar, AndroidKeyboard
//
// Usage — wrap your screen content in <AndroidDevice> to get the bezel, status
// bar and gesture nav (props: title, large, keyboard, dark):
//
//   <AndroidDevice title="Inbox" large>
//     ...your screen content...
//   </AndroidDevice>
//   <AndroidDevice title="Compose" keyboard>…</AndroidDevice>
/* END USAGE */

const MD_C = {
  surface: '#f4fbf8',
  surfaceVariant: '#dae5e1',
  inverseOnSurface: '#ecf2ef',
  secondaryContainer: '#cde8e1',
  primaryFixedDim: '#83d5c6',
  onSurface: '#171d1b',
  onSurfaceVar: '#49454f',
  onPrimaryContainer: '#00201c',
  primary: '#006a60',
  frameBorder: 'rgba(116,119,117,0.5)'
};

// ─────────────────────────────────────────────────────────────
// Status bar (time left, wifi/cell/battery right)
// ─────────────────────────────────────────────────────────────
function AndroidStatusBar({
  dark = false
}) {
  const c = dark ? '#fff' : MD_C.onSurface;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      position: 'relative',
      fontFamily: 'Roboto, system-ui, sans-serif'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 128,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 400,
      letterSpacing: 0.25,
      lineHeight: '20px',
      color: c
    }
  }, "9:30")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: 8,
      transform: 'translateX(-50%)',
      width: 24,
      height: 24,
      borderRadius: 100,
      background: '#2e2e2e'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      paddingRight: 2
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    style: {
      marginRight: -2
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 13.3L.67 5.97a10.37 10.37 0 0114.66 0L8 13.3z",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    style: {
      marginRight: -2
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14.67 14.67V1.33L1.33 14.67h13.34z",
    fill: c
  }))), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3.75",
    y: "2",
    width: "8.5",
    height: "13",
    rx: "1.5",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5.5",
    y: "0.9",
    width: "5",
    height: "2",
    rx: "0.5",
    fill: c
  }))));
}

// ─────────────────────────────────────────────────────────────
// Top app bar (Material 3 small/medium)
// ─────────────────────────────────────────────────────────────
function AndroidAppBar({
  title = 'Title',
  large = false
}) {
  const iconDot = /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: MD_C.onSurfaceVar,
      opacity: 0.3
    }
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: MD_C.surface,
      padding: '4px 4px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, iconDot, !large && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 22,
      fontWeight: 400,
      color: MD_C.onSurface,
      fontFamily: 'Roboto, system-ui, sans-serif'
    }
  }, title), large && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), iconDot), large && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 20px',
      fontSize: 28,
      fontWeight: 400,
      color: MD_C.onSurface,
      fontFamily: 'Roboto, system-ui, sans-serif'
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// List item (Material 3)
// ─────────────────────────────────────────────────────────────
function AndroidListItem({
  headline,
  supporting,
  leading
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '12px 16px',
      minHeight: 56,
      boxSizing: 'border-box',
      fontFamily: 'Roboto, system-ui, sans-serif'
    }
  }, leading && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: MD_C.primary,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      fontWeight: 500,
      flexShrink: 0
    }
  }, leading), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: MD_C.onSurface,
      lineHeight: '24px'
    }
  }, headline), supporting && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: MD_C.onSurfaceVar,
      lineHeight: '20px'
    }
  }, supporting)));
}

// ─────────────────────────────────────────────────────────────
// Gesture nav bar (pill)
// ─────────────────────────────────────────────────────────────
function AndroidNavBar({
  dark = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 108,
      height: 4,
      borderRadius: 2,
      background: dark ? '#fff' : MD_C.onSurface,
      opacity: 0.4
    }
  }));
}

// ─────────────────────────────────────────────────────────────
// Device frame — wraps everything
// ─────────────────────────────────────────────────────────────
function AndroidDevice({
  children,
  width = 412,
  height = 892,
  dark = false,
  title,
  large = false,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 18,
      overflow: 'hidden',
      background: dark ? '#1d1b20' : MD_C.surface,
      border: `8px solid ${MD_C.frameBorder}`,
      boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement(AndroidStatusBar, {
    dark: dark
  }), title !== undefined && /*#__PURE__*/React.createElement(AndroidAppBar, {
    title: title,
    large: large
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(AndroidKeyboard, null), /*#__PURE__*/React.createElement(AndroidNavBar, {
    dark: dark
  }));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — Gboard (Material 3)
// ─────────────────────────────────────────────────────────────
function AndroidKeyboard() {
  let _k = 0;
  const key = (l, {
    flex = 1,
    bg = MD_C.surface,
    r = 6,
    minW,
    fs = 21
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: _k++,
    style: {
      height: 46,
      borderRadius: r,
      flex,
      minWidth: minW,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Roboto, system-ui',
      fontSize: fs,
      color: MD_C.onPrimaryContainer
    }
  }, l);
  const row = (keys, style = {}) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      justifyContent: 'center',
      ...style
    }
  }, keys.map(l => key(l)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: MD_C.inverseOnSurface,
      padding: '0 8px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], {
    padding: '0 20px'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, key('', {
    bg: MD_C.surfaceVariant
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flex: 7,
      minWidth: 274
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l))), key('', {
    bg: MD_C.surfaceVariant
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, key('?123', {
    bg: MD_C.secondaryContainer,
    r: 100,
    minW: 58,
    fs: 14
  }), key(',', {
    bg: MD_C.surfaceVariant
  }), key('', {
    flex: 3,
    minW: 154
  }), key('.', {
    bg: MD_C.surfaceVariant
  }), key('', {
    bg: MD_C.primaryFixedDim,
    r: 100,
    minW: 58
  }))));
}
Object.assign(window, {
  AndroidDevice,
  AndroidStatusBar,
  AndroidAppBar,
  AndroidListItem,
  AndroidNavBar,
  AndroidKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field-mobile/android-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/polling-station/PollingKiosk.jsx
try { (() => {
// PollingKiosk.jsx — election-day verification kiosk (dark theme)
// Screens: idle → voter found → capture → result, driven by a small state machine.
const {
  useState,
  useEffect,
  useRef
} = React;
const {
  Button,
  Badge,
  DecisionPanel,
  ConfidenceMeter
} = window.SecurePollRWDesignSystem_92875f;
const Ic = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function relucide() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}

// fake roster
const VOTERS = {
  "RW-2026-0F3A-91C7": {
    name: "Jean Baptiste Niyonzima",
    nid: "1 1990 8 0012345 6 78",
    station: "PS-014",
    constituency: "Nyarugenge",
    age: 35,
    status: "registered",
    result: {
      confidence: 0.91,
      breakdown: {
        "Face match": 0.94,
        "Fingerprint": 0.87,
        "Liveness": "LIVE"
      },
      explanation: "Strong face match with high liveness confidence. Fingerprint confirms identity."
    }
  },
  "RW-2026-7C12-44AB": {
    name: "Aline Uwase",
    nid: "1 1994 7 0098765 4 32",
    station: "PS-014",
    constituency: "Nyarugenge",
    age: 31,
    status: "registered",
    result: {
      confidence: 0.72,
      reviewRequired: true,
      breakdown: {
        "Face match": 0.74,
        "Fingerprint": 0.69,
        "Liveness": "LIVE"
      },
      explanation: "Moderate match. Lighting reduced face confidence — officer review advised."
    }
  },
  "RW-2026-22D9-1188": {
    name: "Eric Mugisha",
    nid: "1 1988 2 0044556 7 89",
    station: "PS-014",
    constituency: "Nyarugenge",
    age: 37,
    status: "voted",
    result: null
  }
};
function KioskChrome({
  children,
  officer
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kiosk",
    "data-theme": "dark"
  }, /*#__PURE__*/React.createElement("header", {
    className: "kiosk__bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kiosk__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark.svg",
    alt: ""
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "kiosk__ttl"
  }, "SecurePoll RW"), /*#__PURE__*/React.createElement("div", {
    className: "kiosk__sub"
  }, "Polling Station 014 \xB7 Nyarugenge"))), /*#__PURE__*/React.createElement("div", {
    className: "kiosk__bar-end"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kiosk__pill"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "wifi"
  }), " Online"), /*#__PURE__*/React.createElement("span", {
    className: "kiosk__pill"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "clock"
  }), " 11:42"), /*#__PURE__*/React.createElement("span", {
    className: "kiosk__officer"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "shield"
  }), " ", officer))), /*#__PURE__*/React.createElement("main", {
    className: "kiosk__stage"
  }, children), /*#__PURE__*/React.createElement("footer", {
    className: "kiosk__foot"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "1,204"), " verified today"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "62.4%"), " turnout"), /*#__PURE__*/React.createElement("span", {
    className: "kiosk__foot-q"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "users"
  }), " 18 in queue")));
}
function IdleScreen({
  onScan
}) {
  useEffect(relucide);
  return /*#__PURE__*/React.createElement("div", {
    className: "scr scr--idle"
  }, /*#__PURE__*/React.createElement("div", {
    className: "idle-ring"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "qr-code",
    s: {
      width: 64,
      height: 64
    }
  })), /*#__PURE__*/React.createElement("h1", null, "Scan voter ID card"), /*#__PURE__*/React.createElement("p", null, "Present the QR code on the voter card to the scanner, or enter the voter ID manually."), /*#__PURE__*/React.createElement("div", {
    className: "idle-demo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "idle-demo__lbl"
  }, "Demo \u2014 pick a card to scan"), /*#__PURE__*/React.createElement("div", {
    className: "idle-demo__row"
  }, /*#__PURE__*/React.createElement(Button, {
    size: "xl",
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "scan-line"
    }),
    onClick: () => onScan("RW-2026-0F3A-91C7")
  }, "Strong match"), /*#__PURE__*/React.createElement(Button, {
    size: "xl",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "scan-line"
    }),
    onClick: () => onScan("RW-2026-7C12-44AB")
  }, "Borderline"), /*#__PURE__*/React.createElement(Button, {
    size: "xl",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "scan-line"
    }),
    onClick: () => onScan("RW-2026-22D9-1188")
  }, "Already voted"))));
}
function VoterScreen({
  voter,
  onBack,
  onVerify
}) {
  useEffect(relucide);
  const voted = voter.status === "voted";
  return /*#__PURE__*/React.createElement("div", {
    className: "scr scr--voter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "voter-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "voter-photo"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "user",
    s: {
      width: 52,
      height: 52
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "voter-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "voter-name"
  }, voter.name), /*#__PURE__*/React.createElement("div", {
    className: "voter-rows"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "National ID"), /*#__PURE__*/React.createElement("b", {
    className: "mono"
  }, voter.nid)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Constituency"), /*#__PURE__*/React.createElement("b", null, voter.constituency)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Assigned station"), /*#__PURE__*/React.createElement("b", null, voter.station))), /*#__PURE__*/React.createElement("div", {
    className: "voter-status"
  }, voted ? /*#__PURE__*/React.createElement(Badge, {
    tone: "red",
    variant: "solid",
    dot: true
  }, "ALREADY VOTED") : /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    dot: true
  }, "Eligible \xB7 registered"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    variant: "outline"
  }, "Station matches")))), voted ? /*#__PURE__*/React.createElement("div", {
    className: "voter-block"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "shield-x",
    s: {
      width: 22,
      height: 22
    }
  }), /*#__PURE__*/React.createElement("div", null, "This voter was already verified at ", /*#__PURE__*/React.createElement("b", null, "11:06"), " today. Double-voting is blocked. Refer to the supervisor if this is disputed.")) : /*#__PURE__*/React.createElement("p", {
    className: "voter-hint"
  }, "Confirm the photo and details match the person, then begin biometric verification."), /*#__PURE__*/React.createElement("div", {
    className: "scr__actions"
  }, /*#__PURE__*/React.createElement(Button, {
    size: "xl",
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "arrow-left"
    }),
    onClick: onBack
  }, "Back"), !voted && /*#__PURE__*/React.createElement(Button, {
    size: "xl",
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "scan-face"
    }),
    onClick: onVerify
  }, "Begin face verification")));
}
function CaptureScreen({
  onDone
}) {
  const [phase, setPhase] = useState("framing");
  useEffect(relucide);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("matching"), 1400);
    const t2 = setTimeout(() => onDone(), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "scr scr--capture"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cap-frame " + (phase === "matching" ? "cap-frame--scan" : "")
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "user",
    s: {
      width: 90,
      height: 90
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "cap-corners"
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), phase === "matching" && /*#__PURE__*/React.createElement("div", {
    className: "cap-laser"
  })), /*#__PURE__*/React.createElement("div", {
    className: "cap-status"
  }, phase === "framing" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "cap-dot pulse"
  }), " Hold still \u2014 centering face\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "cap-dot scan"
  }), " Matching against stored template\u2026")), /*#__PURE__*/React.createElement("div", {
    className: "cap-steps"
  }, /*#__PURE__*/React.createElement("span", {
    className: "done"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "check"
  }), " Liveness"), /*#__PURE__*/React.createElement("span", {
    className: phase === "matching" ? "active" : ""
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "scan-face"
  }), " 1:1 face"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Ic, {
    n: "fingerprint"
  }), " Fingerprint"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Ic, {
    n: "sigma"
  }), " Fusion")));
}
function ResultScreen({
  voter,
  onNext
}) {
  useEffect(relucide);
  const r = voter.result;
  const approved = r.confidence >= 0.8;
  return /*#__PURE__*/React.createElement("div", {
    className: "scr scr--result"
  }, /*#__PURE__*/React.createElement("div", {
    className: "result-grid"
  }, /*#__PURE__*/React.createElement(DecisionPanel, {
    voterName: voter.name + " · " + voter.station,
    confidence: r.confidence,
    breakdown: r.breakdown,
    explanation: r.explanation,
    reviewRequired: r.reviewRequired
  }), /*#__PURE__*/React.createElement("div", {
    className: "result-side"
  }, approved ? /*#__PURE__*/React.createElement("div", {
    className: "result-cta result-cta--ok"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "badge-check",
    s: {
      width: 40,
      height: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "result-cta__big"
  }, "Grant ballot"), /*#__PURE__*/React.createElement("p", null, "Voter marked ", /*#__PURE__*/React.createElement("b", null, "VOTED"), " \xB7 turnout updated \xB7 logged to audit.")) : r.reviewRequired ? /*#__PURE__*/React.createElement("div", {
    className: "result-cta result-cta--rv"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "user-cog",
    s: {
      width: 40,
      height: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "result-cta__big"
  }, "Officer decision"), /*#__PURE__*/React.createElement("p", null, "Review the breakdown, then approve or reject with a logged justification."), /*#__PURE__*/React.createElement("div", {
    className: "result-cta__row"
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "check"
    })
  }, "Approve"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "danger",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "x"
    })
  }, "Reject"))) : /*#__PURE__*/React.createElement("div", {
    className: "result-cta result-cta--no"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "shield-x",
    s: {
      width: 40,
      height: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "result-cta__big"
  }, "Do not grant"), /*#__PURE__*/React.createElement("p", null, "Supervisor alerted. Logged to audit.")), /*#__PURE__*/React.createElement(Button, {
    size: "xl",
    variant: "secondary",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "arrow-right"
    }),
    onClick: onNext
  }, "Next voter"))));
}
function PollingKiosk() {
  const [screen, setScreen] = useState("idle");
  const [voterId, setVoterId] = useState(null);
  const voter = voterId ? VOTERS[voterId] : null;
  useEffect(relucide, [screen]);
  return /*#__PURE__*/React.createElement(KioskChrome, {
    officer: "P. Officer \xB7 #221"
  }, screen === "idle" && /*#__PURE__*/React.createElement(IdleScreen, {
    onScan: id => {
      setVoterId(id);
      setScreen("voter");
    }
  }), screen === "voter" && /*#__PURE__*/React.createElement(VoterScreen, {
    voter: voter,
    onBack: () => setScreen("idle"),
    onVerify: () => setScreen("capture")
  }), screen === "capture" && /*#__PURE__*/React.createElement(CaptureScreen, {
    onDone: () => setScreen("result")
  }), screen === "result" && /*#__PURE__*/React.createElement(ResultScreen, {
    voter: voter,
    onNext: () => {
      setVoterId(null);
      setScreen("idle");
    }
  }));
}
window.PollingKiosk = PollingKiosk;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/polling-station/PollingKiosk.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-portal/CheckStatus.jsx
try { (() => {
// CheckStatus.jsx — citizen registration & voting-status lookup
const {
  useState: useS,
  useEffect: useE
} = React;
const C = window.SecurePollRWDesignSystem_92875f;
const Ic = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lc() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
function CheckStatus() {
  const [done, setDone] = useS(false);
  useE(lc, [done]);
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "snav"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark.svg",
    alt: "SecurePoll RW"
  }), /*#__PURE__*/React.createElement("a", {
    className: "back",
    href: "index.html"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "arrow-left"
  }), " Back to portal"), /*#__PURE__*/React.createElement("div", {
    className: "end"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lang"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "globe"
  }), " EN / KIN / FR"), /*#__PURE__*/React.createElement("a", {
    className: "plain",
    href: "observer-login.html"
  }, /*#__PURE__*/React.createElement(C.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "eye"
    })
  }, "Observer login")))), /*#__PURE__*/React.createElement("header", {
    className: "phead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "id-card",
    s: {
      width: 14,
      height: 14
    }
  }), " Voter services"), /*#__PURE__*/React.createElement("h1", null, "Check your registration status"), /*#__PURE__*/React.createElement("p", null, "Enter your National ID to confirm you are registered, find your assigned polling station, and see whether your vote has been recorded.")), /*#__PURE__*/React.createElement("main", {
    className: "pbody"
  }, /*#__PURE__*/React.createElement("div", {
    className: "narrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "assure blue"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "lock"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "at"
  }, "This lookup is private"), /*#__PURE__*/React.createElement("div", {
    className: "as"
  }, "We never display your name, biometric data, or how you voted \u2014 only your registration and turnout status. Sessions are not logged against your identity."))), /*#__PURE__*/React.createElement("div", {
    className: "lk-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement(C.Input, {
    label: "National ID",
    mono: true,
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "id-card"
    }),
    placeholder: "1 1994 7 0098765 4 32",
    defaultValue: "1 1994 7 0098765 4 32",
    hint: "16 digits, as printed on your card"
  })), /*#__PURE__*/React.createElement(C.Button, {
    variant: "primary",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "search"
    }),
    onClick: () => setDone(true)
  }, "Check")), done && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(C.Card, {
    accent: "green",
    elevation: "raised",
    title: "You're registered to vote",
    subtitle: "National ID ending \xB7 4 32",
    headerEnd: /*#__PURE__*/React.createElement(C.Badge, {
      tone: "green",
      dot: true
    }, "REGISTERED")
  }, /*#__PURE__*/React.createElement("div", {
    className: "detail-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "detail-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Polling station"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "PS-014 \xB7 Nyarugenge")), /*#__PURE__*/React.createElement("div", {
    className: "detail-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Constituency"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Nyarugenge")), /*#__PURE__*/React.createElement("div", {
    className: "detail-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "District"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Nyarugenge")), /*#__PURE__*/React.createElement("div", {
    className: "detail-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Station hours"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "06:00 \u2013 18:00")), /*#__PURE__*/React.createElement("div", {
    className: "detail-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Roll position"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "00482")), /*#__PURE__*/React.createElement("div", {
    className: "detail-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Last verified"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "07 Jun 2026")))), /*#__PURE__*/React.createElement(C.Card, {
    title: "Voting status",
    subtitle: "Live for today's election",
    headerEnd: /*#__PURE__*/React.createElement(C.Badge, {
      tone: "amber",
      dot: true
    }, "NOT YET VOTED")
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-step done"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-dot"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "check"
  })), /*#__PURE__*/React.createElement("div", {
    className: "tl-bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tt"
  }, "Registration confirmed"), /*#__PURE__*/React.createElement("div", {
    className: "ts"
  }, "On the certified voter roll for Nyarugenge"))), /*#__PURE__*/React.createElement("div", {
    className: "tl-step done"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-dot"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "check"
  })), /*#__PURE__*/React.createElement("div", {
    className: "tl-bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tt"
  }, "Station assigned"), /*#__PURE__*/React.createElement("div", {
    className: "ts"
  }, "PS-014 \xB7 Nyarugenge \u2014 currently open"))), /*#__PURE__*/React.createElement("div", {
    className: "tl-step current"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-dot"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "user-round"
  })), /*#__PURE__*/React.createElement("div", {
    className: "tl-bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tt"
  }, "Awaiting your vote"), /*#__PURE__*/React.createElement("div", {
    className: "ts"
  }, "Bring your National ID. Average wait right now: ~12 min"))), /*#__PURE__*/React.createElement("div", {
    className: "tl-step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-dot"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "flag"
  })), /*#__PURE__*/React.createElement("div", {
    className: "tl-bd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tt"
  }, "Vote recorded"), /*#__PURE__*/React.createElement("div", {
    className: "ts"
  }, "A receipt code will appear here once you've cast your ballot"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "plain",
    href: "report-incident.html",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(C.Button, {
    variant: "secondary",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "megaphone"
    })
  }, "Report a problem at this station")), /*#__PURE__*/React.createElement(C.Button, {
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "rotate-ccw"
    }),
    onClick: () => setDone(false)
  }, "Check another ID"))))));
}
window.CheckStatus = CheckStatus;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-portal/CheckStatus.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-portal/ObserverDashboard.jsx
try { (() => {
// ObserverDashboard.jsx — read-only aggregated transparency portal for accredited observers
const {
  useEffect: useEd
} = React;
const OD = window.SecurePollRWDesignSystem_92875f;
const Iod = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lod() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
const DISTRICTS = [{
  n: "Gasabo",
  v: 71
}, {
  n: "Kicukiro",
  v: 68
}, {
  n: "Nyarugenge",
  v: 66
}, {
  n: "Musanze",
  v: 61
}, {
  n: "Huye",
  v: 58
}, {
  n: "Rubavu",
  v: 55
}, {
  n: "Rwamagana",
  v: 52
}, {
  n: "Burera",
  v: 48
}];
const TRAIL = [{
  ic: "git-commit-horizontal",
  a: "Turnout aggregation committed",
  m: "National counter +12,480 · 14:00 snapshot",
  h: "a3f9c2…"
}, {
  ic: "badge-check",
  a: "Verification batch sealed",
  m: "PS-014 · 1,284 verifications · signed",
  h: "7c21be…"
}, {
  ic: "radio-tower",
  a: "Station status sync",
  m: "2,391 / 2,410 stations reporting",
  h: "0d44a1…"
}, {
  ic: "file-check-2",
  a: "Hourly audit export published",
  m: "06:00–14:00 · signed CSV + JWS",
  h: "f188e0…"
}];
function ObserverDashboard() {
  useEd(lod);
  return /*#__PURE__*/React.createElement("div", {
    className: "obs"
  }, /*#__PURE__*/React.createElement("header", {
    className: "obs__top"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark.svg",
    alt: "SecurePoll RW"
  }), /*#__PURE__*/React.createElement("span", {
    className: "obs__ro"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: "eye"
  }), " Observer \xB7 read-only"), /*#__PURE__*/React.createElement("div", {
    className: "end"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs__live"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pulse"
  }), " Live \xB7 updated 14:41"), /*#__PURE__*/React.createElement("div", {
    className: "obs__idw"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs__av"
  }, "AM"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "obs__nm"
  }, "Aline Mukamana"), /*#__PURE__*/React.createElement("div", {
    className: "obs__org"
  }, "Transparency Int'l Rwanda"))), /*#__PURE__*/React.createElement("a", {
    href: "observer-login.html",
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(OD.Button, {
    size: "sm",
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(Iod, {
      n: "log-out"
    })
  }, "Sign out")))), /*#__PURE__*/React.createElement("div", {
    className: "obs__hd"
  }, /*#__PURE__*/React.createElement("h1", null, "Election transparency dashboard"), /*#__PURE__*/React.createElement("p", null, "A read-only, aggregated view of the live election. Every figure is anonymized and traceable to the public, tamper-evident audit chain. No individual voter records are accessible.")), /*#__PURE__*/React.createElement("div", {
    className: "obs__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-kpis"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__l"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: "users"
  }), " National turnout"), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__v"
  }, "62.4", /*#__PURE__*/React.createElement("small", null, "%")), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__d"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: "trending-up"
  }), " +4.2% this hour")), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__l"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: "badge-check"
  }), " Verified today"), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__v"
  }, "1.84", /*#__PURE__*/React.createElement("small", null, "M")), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__d"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: "activity"
  }), " 12.1k / min")), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__l"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: "radio-tower"
  }), " Stations reporting"), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__v"
  }, "2,391", /*#__PURE__*/React.createElement("small", null, "/ 2,410")), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__d"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: "check"
  }), " 99.2% online")), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__l"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: "shield-check"
  }), " Chain integrity"), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__v"
  }, "0", /*#__PURE__*/React.createElement("small", null, "breaks")), /*#__PURE__*/React.createElement("div", {
    className: "obs-kpi__d"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: "lock"
  }), " 8.41M entries verified"))), /*#__PURE__*/React.createElement("div", {
    className: "obs-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__t"
  }, "Turnout by district"), /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__s"
  }, "Top reporting districts \xB7 aggregated, anonymized")), /*#__PURE__*/React.createElement(OD.Badge, {
    tone: "green",
    size: "sm",
    dot: true
  }, "LIVE")), /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-dist"
  }, DISTRICTS.map(d => /*#__PURE__*/React.createElement("div", {
    className: "obs-dist__row",
    key: d.n
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs-dist__n"
  }, d.n), /*#__PURE__*/React.createElement("span", {
    className: "obs-dist__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs-dist__fill",
    style: {
      width: d.v + "%"
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "obs-dist__v"
  }, d.v, "%")))))), /*#__PURE__*/React.createElement("div", {
    className: "obs-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__t"
  }, "Station status"), /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__s"
  }, "All 2,410 polling stations"))), /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-donut",
    style: {
      background: "conic-gradient(var(--green-500) 0 99.2%, var(--amber-400) 99.2% 100%)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-donut__c"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-donut__n"
  }, "99.2%"), /*#__PURE__*/React.createElement("div", {
    className: "obs-donut__l"
  }, "online"))), /*#__PURE__*/React.createElement("div", {
    className: "obs-legend"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-legend__i"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs-legend__k",
    style: {
      background: "var(--green-500)"
    }
  }), "Online & reporting ", /*#__PURE__*/React.createElement("b", null, "2,391")), /*#__PURE__*/React.createElement("div", {
    className: "obs-legend__i"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs-legend__k",
    style: {
      background: "var(--amber-400)"
    }
  }), "Syncing ", /*#__PURE__*/React.createElement("b", null, "19")), /*#__PURE__*/React.createElement("div", {
    className: "obs-legend__i"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs-legend__k",
    style: {
      background: "var(--slate-300)"
    }
  }), "Not yet open ", /*#__PURE__*/React.createElement("b", null, "0"))))))), /*#__PURE__*/React.createElement("div", {
    className: "obs-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__t"
  }, "Public audit trail"), /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__s"
  }, "Aggregated events \xB7 hash-chained & independently verifiable")), /*#__PURE__*/React.createElement(OD.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Iod, {
      n: "download"
    })
  }, "Export")), /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__b"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-trail"
  }, TRAIL.map((t, i) => /*#__PURE__*/React.createElement("div", {
    className: "obs-trail__row",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs-trail__ic"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: t.ic
  })), /*#__PURE__*/React.createElement("div", {
    className: "obs-trail__tx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-trail__a"
  }, t.a), /*#__PURE__*/React.createElement("div", {
    className: "obs-trail__m"
  }, t.m)), /*#__PURE__*/React.createElement("span", {
    className: "obs-trail__h"
  }, t.h)))))), /*#__PURE__*/React.createElement("div", {
    className: "obs-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__h"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__t"
  }, "Authentication outcomes"), /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__s"
  }, "All verifications today"))), /*#__PURE__*/React.createElement("div", {
    className: "obs-panel__b",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-legend"
  }, /*#__PURE__*/React.createElement("div", {
    className: "obs-legend__i"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs-legend__k",
    style: {
      background: "var(--green-500)"
    }
  }), "Auto-approved ", /*#__PURE__*/React.createElement("b", null, "93.0%")), /*#__PURE__*/React.createElement("div", {
    className: "obs-legend__i"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs-legend__k",
    style: {
      background: "var(--amber-400)"
    }
  }), "Manual review ", /*#__PURE__*/React.createElement("b", null, "5.5%")), /*#__PURE__*/React.createElement("div", {
    className: "obs-legend__i"
  }, /*#__PURE__*/React.createElement("span", {
    className: "obs-legend__k",
    style: {
      background: "var(--red-500)"
    }
  }), "Rejected ", /*#__PURE__*/React.createElement("b", null, "1.5%"))), /*#__PURE__*/React.createElement("div", {
    className: "obs-verify"
  }, /*#__PURE__*/React.createElement(Iod, {
    n: "shield-check"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Integrity verified at 14:41:30"), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, "SHA-256 hash chain re-walked end to end \xB7 8,412,556 entries \xB7 0 breaks detected.")))))), /*#__PURE__*/React.createElement("div", {
    className: "obs-pageft"
  }, "Observer access is read-only and logged to the audit chain. Figures are aggregated and anonymized under Law 058/2021. Accredited under the NEC Observer Framework.")));
}
window.ObserverDashboard = ObserverDashboard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-portal/ObserverDashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-portal/ObserverLogin.jsx
try { (() => {
// ObserverLogin.jsx — accredited election-observer sign-in
const {
  useState: useSl,
  useEffect: useEl
} = React;
const L = window.SecurePollRWDesignSystem_92875f;
const Il = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function ll() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
function AuthBrand() {
  return /*#__PURE__*/React.createElement("aside", {
    className: "auth__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark-dark.svg",
    alt: "SecurePoll RW"
  }), /*#__PURE__*/React.createElement("div", {
    className: "bspacer"
  }), /*#__PURE__*/React.createElement("h2", null, "Observer access to the live election dashboard."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Accredited domestic and international observers get a transparent, read-only window into the count \u2014 aggregated turnout, station status, and the public audit trail."), /*#__PURE__*/React.createElement("div", {
    className: "auth__feats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__feat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fi"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "activity"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ft"
  }, "Real-time turnout"), /*#__PURE__*/React.createElement("div", {
    className: "fs"
  }, "Nationwide and by constituency, updated every 30 seconds"))), /*#__PURE__*/React.createElement("div", {
    className: "auth__feat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fi"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "file-search"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ft"
  }, "Public audit log"), /*#__PURE__*/React.createElement("div", {
    className: "fs"
  }, "Every aggregation is hash-chained and independently verifiable"))), /*#__PURE__*/React.createElement("div", {
    className: "auth__feat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fi"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "shield-check"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ft"
  }, "Read-only by design"), /*#__PURE__*/React.createElement("div", {
    className: "fs"
  }, "Observers can see everything and change nothing")))), /*#__PURE__*/React.createElement("div", {
    className: "bspacer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "auth__seal"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "lock"
  }), " Accredited under NEC Observer Framework \xB7 Law 058/2021"));
}
function ObserverLogin() {
  const [show, setShow] = useSl(false);
  useEl(ll, [show]);
  return /*#__PURE__*/React.createElement("div", {
    className: "auth"
  }, /*#__PURE__*/React.createElement(AuthBrand, null), /*#__PURE__*/React.createElement("section", {
    className: "auth__form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__eyebrow"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "eye"
  }), " Observer portal"), /*#__PURE__*/React.createElement("h1", null, "Sign in"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Use the credentials issued with your NEC accreditation."), /*#__PURE__*/React.createElement("div", {
    className: "auth__fields"
  }, /*#__PURE__*/React.createElement(L.Input, {
    label: "Observer ID or email",
    iconLeft: /*#__PURE__*/React.createElement(Il, {
      n: "user-round"
    }),
    placeholder: "OBS-2026-00481 or you@org.org",
    defaultValue: "OBS-2026-00481"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(L.Input, {
    label: "Password",
    type: show ? "text" : "password",
    iconLeft: /*#__PURE__*/React.createElement(Il, {
      n: "key-round"
    }),
    iconRight: /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer",
        display: "grid",
        placeItems: "center"
      },
      onClick: () => setShow(!show)
    }, /*#__PURE__*/React.createElement(Il, {
      n: show ? "eye-off" : "eye"
    })),
    defaultValue: "dummy-password"
  }), /*#__PURE__*/React.createElement("div", {
    className: "auth__row",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "auth__check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Keep me signed in"), /*#__PURE__*/React.createElement("a", {
    className: "auth__link",
    href: "#"
  }, "Forgot password?")))), /*#__PURE__*/React.createElement("div", {
    className: "auth__cta"
  }, /*#__PURE__*/React.createElement("a", {
    className: "plain",
    href: "observer-dashboard.html",
    style: {
      display: "block",
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(L.Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    iconRight: /*#__PURE__*/React.createElement(Il, {
      n: "arrow-right"
    })
  }, "Sign in to dashboard"))), /*#__PURE__*/React.createElement("div", {
    className: "auth__note"
  }, /*#__PURE__*/React.createElement(Il, {
    n: "info"
  }), " First time here? Your organisation must be accredited by the NEC before observers can be registered."), /*#__PURE__*/React.createElement("div", {
    className: "auth__alt"
  }, "New observer? ", /*#__PURE__*/React.createElement("a", {
    href: "observer-register.html"
  }, "Request accreditation access")))));
}
window.ObserverLogin = ObserverLogin;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-portal/ObserverLogin.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-portal/ObserverRegister.jsx
try { (() => {
// ObserverRegister.jsx — accreditation request for new election observers
const {
  useState: useSg,
  useEffect: useEg
} = React;
const G = window.SecurePollRWDesignSystem_92875f;
const Ig = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lg() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
function RegBrand() {
  return /*#__PURE__*/React.createElement("aside", {
    className: "auth__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark-dark.svg",
    alt: "SecurePoll RW"
  }), /*#__PURE__*/React.createElement("div", {
    className: "bspacer"
  }), /*#__PURE__*/React.createElement("h2", null, "Request observer accreditation."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Create an account for a domestic monitor, party agent, or international observer mission. Access is granted once the NEC verifies your accreditation."), /*#__PURE__*/React.createElement("div", {
    className: "auth__feats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__feat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fi"
  }, /*#__PURE__*/React.createElement(Ig, {
    n: "building"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ft"
  }, "Tied to your organisation"), /*#__PURE__*/React.createElement("div", {
    className: "fs"
  }, "Each observer is linked to an accredited body and mission"))), /*#__PURE__*/React.createElement("div", {
    className: "auth__feat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fi"
  }, /*#__PURE__*/React.createElement(Ig, {
    n: "badge-check"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ft"
  }, "Verified before access"), /*#__PURE__*/React.createElement("div", {
    className: "fs"
  }, "NEC reviews each request \u2014 usually within one working day"))), /*#__PURE__*/React.createElement("div", {
    className: "auth__feat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fi"
  }, /*#__PURE__*/React.createElement(Ig, {
    n: "eye"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ft"
  }, "Read-only dashboard"), /*#__PURE__*/React.createElement("div", {
    className: "fs"
  }, "See aggregated results and the public audit trail in real time")))), /*#__PURE__*/React.createElement("div", {
    className: "bspacer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "auth__seal"
  }, /*#__PURE__*/React.createElement(Ig, {
    n: "lock"
  }), " Accredited under NEC Observer Framework \xB7 Law 058/2021"));
}
function ObserverRegister() {
  const [sent, setSent] = useSg(false);
  const [agree, setAgree] = useSg(false);
  useEg(lg, [sent]);
  if (sent) {
    return /*#__PURE__*/React.createElement("div", {
      className: "auth"
    }, /*#__PURE__*/React.createElement(RegBrand, null), /*#__PURE__*/React.createElement("section", {
      className: "auth__form"
    }, /*#__PURE__*/React.createElement("div", {
      className: "inner",
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "done-ring",
      style: {
        margin: "0 auto 18px"
      }
    }, /*#__PURE__*/React.createElement(Ig, {
      n: "mail-check"
    })), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 26,
        color: "var(--text-strong)",
        margin: 0
      }
    }, "Request received"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 10,
        lineHeight: 1.55
      }
    }, "Your accreditation request has been sent to the NEC for review. We've emailed a confirmation to your address \u2014 you'll be notified once your account is approved, usually within one working day."), /*#__PURE__*/React.createElement("div", {
      className: "ref-chip",
      style: {
        marginTop: 22
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "rl"
    }, "Application reference"), /*#__PURE__*/React.createElement("div", {
      className: "rv"
    }, "OBS-REQ-3F90")), /*#__PURE__*/React.createElement(G.Badge, {
      tone: "amber",
      dot: true
    }, "PENDING REVIEW")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 26
      }
    }, /*#__PURE__*/React.createElement("a", {
      className: "plain",
      href: "observer-login.html"
    }, /*#__PURE__*/React.createElement(G.Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ig, {
        n: "arrow-left"
      })
    }, "Back to sign in"))))));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "auth"
  }, /*#__PURE__*/React.createElement(RegBrand, null), /*#__PURE__*/React.createElement("section", {
    className: "auth__form",
    style: {
      paddingTop: 40,
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "inner",
    style: {
      maxWidth: 460
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__eyebrow"
  }, /*#__PURE__*/React.createElement(Ig, {
    n: "user-plus"
  }), " Observer portal"), /*#__PURE__*/React.createElement("h1", null, "Create your account"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Tell us who you are and which body accredited you."), /*#__PURE__*/React.createElement("div", {
    className: "auth__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement(G.Input, {
    label: "First name",
    required: true,
    defaultValue: "Aline"
  }), /*#__PURE__*/React.createElement(G.Input, {
    label: "Last name",
    required: true,
    defaultValue: "Mukamana"
  })), /*#__PURE__*/React.createElement(G.Input, {
    label: "Work email",
    required: true,
    type: "email",
    iconLeft: /*#__PURE__*/React.createElement(Ig, {
      n: "mail"
    }),
    placeholder: "you@organisation.org"
  }), /*#__PURE__*/React.createElement(G.Select, {
    label: "Observer category",
    required: true,
    placeholder: "Select a category",
    options: ["Domestic civil-society monitor", "Political party agent", "International observer mission", "Media / press"]
  }), /*#__PURE__*/React.createElement(G.Input, {
    label: "Accredited organisation",
    required: true,
    iconLeft: /*#__PURE__*/React.createElement(Ig, {
      n: "building"
    }),
    placeholder: "e.g. Transparency International Rwanda"
  }), /*#__PURE__*/React.createElement(G.Input, {
    label: "NEC accreditation number",
    required: true,
    mono: true,
    iconLeft: /*#__PURE__*/React.createElement(Ig, {
      n: "badge-check"
    }),
    placeholder: "ACC-2026-XXXXX",
    defaultValue: "ACC-2026-01928",
    hint: "Found on your accreditation letter from the NEC"
  }), /*#__PURE__*/React.createElement(G.Input, {
    label: "Create password",
    required: true,
    type: "password",
    iconLeft: /*#__PURE__*/React.createElement(Ig, {
      n: "key-round"
    }),
    hint: "At least 12 characters, with a number and a symbol",
    defaultValue: "dummy-password"
  }), /*#__PURE__*/React.createElement("label", {
    className: "auth__check",
    style: {
      alignItems: "flex-start",
      lineHeight: 1.45
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: agree,
    onChange: e => setAgree(e.target.checked),
    style: {
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("span", null, "I confirm the details above are accurate and I agree to the ", /*#__PURE__*/React.createElement("a", {
    className: "auth__link",
    href: "#"
  }, "Observer Code of Conduct"), " and data-protection terms (Law 058/2021)."))), /*#__PURE__*/React.createElement("div", {
    className: "auth__cta"
  }, /*#__PURE__*/React.createElement(G.Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    disabled: !agree,
    iconRight: /*#__PURE__*/React.createElement(Ig, {
      n: "arrow-right"
    }),
    onClick: () => setSent(true)
  }, "Submit for accreditation")), /*#__PURE__*/React.createElement("div", {
    className: "auth__alt"
  }, "Already have an account? ", /*#__PURE__*/React.createElement("a", {
    href: "observer-login.html"
  }, "Sign in")))));
}
window.ObserverRegister = ObserverRegister;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-portal/ObserverRegister.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-portal/PublicPortal.jsx
try { (() => {
// PublicPortal.jsx — read-only public-facing portal
const {
  useState: useStateP,
  useEffect: useEffectP
} = React;
const P = window.SecurePollRWDesignSystem_92875f;
const Ip = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lucideP() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
function StatusLookup() {
  const [done, setDone] = useStateP(false);
  useEffectP(lucideP, [done]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lookup"
  }, /*#__PURE__*/React.createElement("div", {
    className: "f"
  }, /*#__PURE__*/React.createElement(P.Input, {
    label: "Check your registration status",
    mono: true,
    iconLeft: /*#__PURE__*/React.createElement(Ip, {
      n: "id-card"
    }),
    placeholder: "Enter your National ID",
    defaultValue: "1 1994 7 0098765 4 32"
  })), /*#__PURE__*/React.createElement(P.Button, {
    variant: "primary",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement(Ip, {
      n: "search"
    }),
    onClick: () => setDone(true)
  }, "Check status")), done && /*#__PURE__*/React.createElement("div", {
    className: "lookup-result"
  }, /*#__PURE__*/React.createElement(P.Card, {
    accent: "green",
    elevation: "raised",
    title: "You're registered to vote",
    subtitle: "National ID ending \xB7 4 32",
    headerEnd: /*#__PURE__*/React.createElement(P.Badge, {
      tone: "green",
      dot: true
    }, "REGISTERED")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 28,
      fontSize: 14,
      color: "var(--text-default)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-muted)",
      fontSize: 12
    }
  }, "Polling station"), /*#__PURE__*/React.createElement("b", null, "PS-014 \xB7 Nyarugenge")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-muted)",
      fontSize: 12
    }
  }, "Constituency"), /*#__PURE__*/React.createElement("b", null, "Nyarugenge")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-muted)",
      fontSize: 12
    }
  }, "Status"), /*#__PURE__*/React.createElement("b", null, "Not yet voted"))))));
}
function PublicPortal() {
  useEffectP(lucideP);
  return /*#__PURE__*/React.createElement("div", {
    className: "pub"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "pub__nav"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark.svg",
    alt: "SecurePoll RW",
    style: {
      height: 30
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "links"
  }, /*#__PURE__*/React.createElement("a", {
    href: "check-status.html"
  }, "Check status"), /*#__PURE__*/React.createElement("a", {
    href: "report-incident.html"
  }, "Report an incident")), /*#__PURE__*/React.createElement("div", {
    className: "end"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lang"
  }, /*#__PURE__*/React.createElement(Ip, {
    n: "globe"
  }), " EN / KIN / FR"), /*#__PURE__*/React.createElement("a", {
    href: "../admin-audit/admin-login.html",
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(P.Button, {
    size: "sm",
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(Ip, {
      n: "lock"
    })
  }, "Admin login")), /*#__PURE__*/React.createElement("a", {
    href: "observer-login.html",
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(P.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Ip, {
      n: "eye"
    })
  }, "Observer login")))), /*#__PURE__*/React.createElement("header", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero__in"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, /*#__PURE__*/React.createElement(Ip, {
    n: "shield-check",
    s: {
      width: 14,
      height: 14
    }
  }), " National Electoral Commission \xB7 Rwanda"), /*#__PURE__*/React.createElement("h1", null, "A transparent, verifiable election \u2014 open to every citizen."), /*#__PURE__*/React.createElement("p", null, "Check your registration, find your polling station, and follow turnout as it happens. All figures are aggregated and anonymized."), /*#__PURE__*/React.createElement(StatusLookup, null))), /*#__PURE__*/React.createElement("section", {
    className: "band-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sect-t"
  }, "Live turnout"), /*#__PURE__*/React.createElement("div", {
    className: "sect-s"
  }, "Aggregated nationwide \xB7 updates every 30 seconds \xB7 no individual data shown"), /*#__PURE__*/React.createElement("div", {
    className: "stat-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv"
  }, "62.4%"), /*#__PURE__*/React.createElement("div", {
    className: "sl"
  }, "National turnout"), /*#__PURE__*/React.createElement("div", {
    className: "sd"
  }, /*#__PURE__*/React.createElement(Ip, {
    n: "trending-up"
  }), " +4.2% this hour")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv"
  }, "1.84M"), /*#__PURE__*/React.createElement("div", {
    className: "sl"
  }, "Voters verified today"), /*#__PURE__*/React.createElement("div", {
    className: "sd"
  }, /*#__PURE__*/React.createElement(Ip, {
    n: "check"
  }), " across 2,410 stations")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv"
  }, "2,391"), /*#__PURE__*/React.createElement("div", {
    className: "sl"
  }, "Stations reporting"), /*#__PURE__*/React.createElement("div", {
    className: "sd"
  }, /*#__PURE__*/React.createElement(Ip, {
    n: "radio-tower"
  }), " 99.2% online")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv"
  }, "11:42"), /*#__PURE__*/React.createElement("div", {
    className: "sl"
  }, "Last updated"), /*#__PURE__*/React.createElement("div", {
    className: "sd"
  }, /*#__PURE__*/React.createElement(Ip, {
    n: "clock"
  }), " live feed")))), /*#__PURE__*/React.createElement("section", {
    className: "feat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "feat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fi"
  }, /*#__PURE__*/React.createElement(Ip, {
    n: "map-pin"
  })), /*#__PURE__*/React.createElement("h3", null, "Find your polling station"), /*#__PURE__*/React.createElement("p", null, "Look up where to vote by National ID or district. Stations open 06:00\u201318:00."), /*#__PURE__*/React.createElement("div", {
    className: "map"
  }, /*#__PURE__*/React.createElement("div", {
    className: "map-grid"
  }), /*#__PURE__*/React.createElement("div", {
    className: "map-pin",
    style: {
      top: "40%",
      left: "30%"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "map-pin",
    style: {
      top: "60%",
      left: "55%"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "map-pin",
    style: {
      top: "30%",
      left: "70%"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "feat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fi"
  }, /*#__PURE__*/React.createElement(Ip, {
    n: "megaphone"
  })), /*#__PURE__*/React.createElement("h3", null, "Report an incident"), /*#__PURE__*/React.createElement("p", null, "Submit an anonymous report about any issue at a polling station. Reports route directly to NEC monitoring."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "station-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "si"
  }, /*#__PURE__*/React.createElement(Ip, {
    n: "building-2"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sn"
  }, "PS-014 \xB7 Nyarugenge"), /*#__PURE__*/React.createElement("div", {
    className: "sm"
  }, "1.2 km away \xB7 open \xB7 ~12 min wait")), /*#__PURE__*/React.createElement("span", {
    className: "se"
  }, /*#__PURE__*/React.createElement(P.Badge, {
    tone: "green",
    size: "sm",
    dot: true
  }, "Open"))), /*#__PURE__*/React.createElement("div", {
    className: "station-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "si"
  }, /*#__PURE__*/React.createElement(Ip, {
    n: "building-2"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sn"
  }, "PS-021 \xB7 Nyamirambo"), /*#__PURE__*/React.createElement("div", {
    className: "sm"
  }, "2.8 km away \xB7 open \xB7 ~25 min wait")), /*#__PURE__*/React.createElement("span", {
    className: "se"
  }, /*#__PURE__*/React.createElement(P.Badge, {
    tone: "amber",
    size: "sm",
    dot: true
  }, "Busy"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "report-incident.html",
    style: {
      textDecoration: "none",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement(P.Button, {
    variant: "secondary",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Ip, {
      n: "megaphone"
    })
  }, "Submit anonymous report")))))), /*#__PURE__*/React.createElement("footer", {
    className: "pub__foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ft"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark-dark.svg",
    alt: "SecurePoll RW"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fl"
  }, /*#__PURE__*/React.createElement("a", {
    href: "check-status.html"
  }, "Check status"), /*#__PURE__*/React.createElement("a", {
    href: "report-incident.html"
  }, "Report an incident"), /*#__PURE__*/React.createElement("a", {
    href: "observer-login.html"
  }, "Observer login"), /*#__PURE__*/React.createElement("a", {
    href: "../admin-audit/admin-login.html"
  }, "Admin login"), /*#__PURE__*/React.createElement("a", null, "Data protection (Law 058/2021)")), /*#__PURE__*/React.createElement("div", {
    className: "fc"
  }, "\xA9 2026 National Electoral Commission of Rwanda. Public data is aggregated and anonymized. This portal has no access to individual voter records or biometric data.")));
}
window.PublicPortal = PublicPortal;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-portal/PublicPortal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-portal/ReportIncident.jsx
try { (() => {
// ReportIncident.jsx — anonymous polling-station incident report
const {
  useState: useSr,
  useEffect: useEr
} = React;
const RI = window.SecurePollRWDesignSystem_92875f;
const Iri = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lri() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
const TYPES = ["Long queue / wait time", "Station opened late or closed", "Equipment or device failure", "Ballot or materials shortage", "Voter intimidation or pressure", "Accessibility barrier", "Suspected irregularity", "Other"];
function ReportIncident() {
  const [sent, setSent] = useSr(false);
  useEr(lri, [sent]);
  if (sent) {
    return /*#__PURE__*/React.createElement("div", {
      className: "page"
    }, /*#__PURE__*/React.createElement(Nav, null), /*#__PURE__*/React.createElement("main", {
      className: "pbody",
      style: {
        display: "grid",
        placeItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "done-wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "done-ring"
    }, /*#__PURE__*/React.createElement(Iri, {
      n: "check"
    })), /*#__PURE__*/React.createElement("h2", null, "Report submitted"), /*#__PURE__*/React.createElement("p", null, "Thank you. Your report has been routed to NEC monitoring and added to the live incident queue for this constituency. No personal information was attached."), /*#__PURE__*/React.createElement("div", {
      className: "ref-chip"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "rl"
    }, "Tracking reference"), /*#__PURE__*/React.createElement("div", {
      className: "rv"
    }, "INC-7K42-9PQX")), /*#__PURE__*/React.createElement(RI.Badge, {
      tone: "amber",
      dot: true
    }, "UNDER REVIEW")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 13,
        marginTop: 18
      }
    }, "Keep this reference to follow up. Save it now \u2014 for your anonymity, we cannot retrieve it for you later."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        justifyContent: "center",
        marginTop: 24
      }
    }, /*#__PURE__*/React.createElement("a", {
      className: "plain",
      href: "index.html"
    }, /*#__PURE__*/React.createElement(RI.Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Iri, {
        n: "arrow-left"
      })
    }, "Back to portal")), /*#__PURE__*/React.createElement(RI.Button, {
      variant: "ghost",
      iconLeft: /*#__PURE__*/React.createElement(Iri, {
        n: "plus"
      }),
      onClick: () => setSent(false)
    }, "File another report")))));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(Nav, null), /*#__PURE__*/React.createElement("header", {
    className: "phead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, /*#__PURE__*/React.createElement(Iri, {
    n: "megaphone",
    s: {
      width: 14,
      height: 14
    }
  }), " Election integrity"), /*#__PURE__*/React.createElement("h1", null, "Report an incident"), /*#__PURE__*/React.createElement("p", null, "Tell the National Electoral Commission about any problem at a polling station. Reports are anonymous by default and route directly to NEC monitoring.")), /*#__PURE__*/React.createElement("main", {
    className: "pbody"
  }, /*#__PURE__*/React.createElement("div", {
    className: "narrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "assure green"
  }, /*#__PURE__*/React.createElement(Iri, {
    n: "shield-check"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "at"
  }, "You are anonymous"), /*#__PURE__*/React.createElement("div", {
    className: "as"
  }, "We don't record your name, National ID, or IP address with this report. Contact details below are optional and only used if you ask us to follow up."))), /*#__PURE__*/React.createElement(RI.Card, {
    title: "Incident details",
    subtitle: "All fields marked with * are required"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "full"
  }, /*#__PURE__*/React.createElement(RI.Select, {
    label: "What happened?",
    required: true,
    placeholder: "Select an incident type",
    options: TYPES
  })), /*#__PURE__*/React.createElement(RI.Input, {
    label: "Polling station",
    required: true,
    iconLeft: /*#__PURE__*/React.createElement(Iri, {
      n: "building-2"
    }),
    placeholder: "e.g. PS-014 \xB7 Nyarugenge",
    defaultValue: "PS-014 \xB7 Nyarugenge"
  }), /*#__PURE__*/React.createElement(RI.Input, {
    label: "District",
    iconLeft: /*#__PURE__*/React.createElement(Iri, {
      n: "map-pin"
    }),
    placeholder: "District or sector",
    defaultValue: "Nyarugenge"
  }), /*#__PURE__*/React.createElement(RI.Input, {
    label: "When did it happen?",
    type: "time",
    defaultValue: "11:20"
  }), /*#__PURE__*/React.createElement(RI.Select, {
    label: "How urgent is it?",
    options: ["Low — informational", "Medium — needs attention", "High — happening now"],
    defaultValue: "Medium \u2014 needs attention"
  }), /*#__PURE__*/React.createElement("div", {
    className: "full"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-lbl"
  }, "Describe what you saw ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("textarea", {
    className: "ta",
    placeholder: "Give as much detail as you can \u2014 what happened, who was affected, and whether it is still going on. Avoid including anyone's full name."
  })), /*#__PURE__*/React.createElement("div", {
    className: "full"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-lbl"
  }, "Add evidence (optional)"), /*#__PURE__*/React.createElement("div", {
    className: "dropz"
  }, /*#__PURE__*/React.createElement(Iri, {
    n: "image-up"
  }), /*#__PURE__*/React.createElement("div", {
    className: "dz-t"
  }, "Drag a photo or document here"), /*#__PURE__*/React.createElement("div", {
    className: "dz-s"
  }, "jpg \xB7 png \xB7 pdf \u2014 max 10 MB, metadata stripped on upload"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(RI.Card, {
    title: "Stay reachable (optional)",
    subtitle: "Only if you want NEC to follow up with you"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fg"
  }, /*#__PURE__*/React.createElement(RI.Input, {
    label: "Phone or email",
    iconLeft: /*#__PURE__*/React.createElement(Iri, {
      n: "phone"
    }),
    placeholder: "+250 7XX XXX XXX"
  }), /*#__PURE__*/React.createElement(RI.Select, {
    label: "Preferred language",
    options: ["Kinyarwanda", "English", "Français"]
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      display: "flex",
      gap: 12,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "plain",
    href: "index.html"
  }, /*#__PURE__*/React.createElement(RI.Button, {
    variant: "ghost"
  }, "Cancel")), /*#__PURE__*/React.createElement(RI.Button, {
    variant: "primary",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement(Iri, {
      n: "send"
    }),
    onClick: () => setSent(true)
  }, "Submit anonymous report")))));
}
function Nav() {
  useEr(lri);
  return /*#__PURE__*/React.createElement("nav", {
    className: "snav"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark.svg",
    alt: "SecurePoll RW"
  }), /*#__PURE__*/React.createElement("a", {
    className: "back",
    href: "index.html"
  }, /*#__PURE__*/React.createElement(Iri, {
    n: "arrow-left"
  }), " Back to portal"), /*#__PURE__*/React.createElement("div", {
    className: "end"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lang"
  }, /*#__PURE__*/React.createElement(Iri, {
    n: "globe"
  }), " EN / KIN / FR"), /*#__PURE__*/React.createElement("a", {
    className: "plain",
    href: "observer-login.html"
  }, /*#__PURE__*/React.createElement(RI.Button, {
    size: "sm",
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(Iri, {
      n: "eye"
    })
  }, "Observer login"))));
}
window.ReportIncident = ReportIncident;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-portal/ReportIncident.jsx", error: String((e && e.message) || e) }); }

// ui_kits/registration/RegistrationApp.jsx
try { (() => {
// RegistrationApp.jsx — offline-first field enrollment wizard
const {
  useState: useStateR,
  useEffect: useEffectR
} = React;
const R = window.SecurePollRWDesignSystem_92875f;
const Ir = ({
  n,
  s
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n,
  style: s
});
function lucideR() {
  setTimeout(() => window.lucide && window.lucide.createIcons(), 20);
}
const STEPS = ["Details", "Biometrics", "Duplicate check", "Issue ID"];
function Stepper({
  step
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "stepper"
  }, STEPS.map((s, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: s
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    className: "step-line" + (i <= step ? " done" : "")
  }), /*#__PURE__*/React.createElement("div", {
    className: "step-dot " + (i === step ? "active" : i < step ? "done" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, i < step ? /*#__PURE__*/React.createElement(Ir, {
    n: "check",
    s: {
      width: 15,
      height: 15
    }
  }) : i + 1), /*#__PURE__*/React.createElement("span", {
    className: "lb"
  }, s)))));
}
function DetailsStep() {
  useEffectR(lucideR);
  return /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "full"
  }, /*#__PURE__*/React.createElement(R.Input, {
    label: "National ID",
    required: true,
    mono: true,
    placeholder: "1 1990 8 0012345 6 78",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "id-card"
    }),
    hint: "16 digits, as printed on the card",
    defaultValue: "1 1996 8 0073391 4 21"
  })), /*#__PURE__*/React.createElement(R.Input, {
    label: "Given name",
    required: true,
    defaultValue: "Chantal"
  }), /*#__PURE__*/React.createElement(R.Input, {
    label: "Family name",
    required: true,
    defaultValue: "Ingabire"
  }), /*#__PURE__*/React.createElement(R.Input, {
    label: "Date of birth",
    type: "date",
    required: true,
    defaultValue: "1996-04-12"
  }), /*#__PURE__*/React.createElement(R.Select, {
    label: "Sex",
    options: ["Female", "Male"]
  }), /*#__PURE__*/React.createElement(R.Select, {
    label: "District",
    required: true,
    options: ["Kicukiro", "Nyarugenge", "Gasabo"]
  }), /*#__PURE__*/React.createElement(R.Select, {
    label: "Constituency",
    required: true,
    options: ["Niboye", "Gatenga", "Kanombe"]
  }), /*#__PURE__*/React.createElement("div", {
    className: "full"
  }, /*#__PURE__*/React.createElement(R.Input, {
    label: "Residential address",
    placeholder: "Village, cell, sector",
    defaultValue: "Niboye \xB7 Kicukiro",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "map-pin"
    })
  })));
}
function BiometricsStep({
  state,
  setState
}) {
  useEffectR(lucideR, [state]);
  return /*#__PURE__*/React.createElement("div", {
    className: "bio-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bio-pane"
  }, /*#__PURE__*/React.createElement("h3", null, /*#__PURE__*/React.createElement(Ir, {
    n: "scan-face"
  }), " Face capture"), /*#__PURE__*/React.createElement("div", {
    className: "bio-frame" + (state.face ? " captured" : "")
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "user",
    s: {
      width: 64,
      height: 64
    }
  }), state.face && /*#__PURE__*/React.createElement("span", {
    className: "ok"
  }, /*#__PURE__*/React.createElement(R.Badge, {
    tone: "green",
    size: "sm",
    dot: true
  }, "Captured"))), state.face ? /*#__PURE__*/React.createElement("div", {
    className: "bio-quality"
  }, /*#__PURE__*/React.createElement(R.ConfidenceMeter, {
    value: 0.93,
    threshold: 0.7,
    size: "sm",
    label: "Sample quality"
  }), /*#__PURE__*/React.createElement("div", {
    className: "bio-q-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "scan-eye"
  }), " Liveness"), /*#__PURE__*/React.createElement(R.Badge, {
    tone: "green",
    size: "sm"
  }, "LIVE"))) : /*#__PURE__*/React.createElement(R.Button, {
    variant: "primary",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "camera"
    }),
    onClick: () => setState({
      ...state,
      face: true
    })
  }, "Capture face")), /*#__PURE__*/React.createElement("div", {
    className: "bio-pane"
  }, /*#__PURE__*/React.createElement("h3", null, /*#__PURE__*/React.createElement(Ir, {
    n: "fingerprint"
  }), " Fingerprint"), /*#__PURE__*/React.createElement("div", {
    className: "bio-frame" + (state.print ? " captured" : "")
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "fingerprint",
    s: {
      width: 64,
      height: 64
    }
  }), state.print && /*#__PURE__*/React.createElement("span", {
    className: "ok"
  }, /*#__PURE__*/React.createElement(R.Badge, {
    tone: "green",
    size: "sm",
    dot: true
  }, "Captured"))), state.print ? /*#__PURE__*/React.createElement("div", {
    className: "bio-quality"
  }, /*#__PURE__*/React.createElement(R.ConfidenceMeter, {
    value: 0.88,
    threshold: 0.7,
    size: "sm",
    label: "Minutiae quality"
  }), /*#__PURE__*/React.createElement("div", {
    className: "bio-q-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "check-circle-2"
  }), " Index finger"), /*#__PURE__*/React.createElement(R.Badge, {
    tone: "blue",
    size: "sm"
  }, "RIGHT"))) : /*#__PURE__*/React.createElement(R.Button, {
    variant: "primary",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "scan-line"
    }),
    onClick: () => setState({
      ...state,
      print: true
    })
  }, "Scan fingerprint")));
}
function DuplicateStep() {
  useEffectR(lucideR);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dup-banner clean"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "shield-check",
    s: {
      width: 24,
      height: 24
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dt"
  }, "No duplicate found"), /*#__PURE__*/React.createElement("div", {
    className: "ds"
  }, "1:N scan against 8.42M templates \xB7 top match 0.31 \xB7 well below the 0.85 threshold")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(R.Badge, {
    tone: "green",
    dot: true
  }, "CLEAR"))), /*#__PURE__*/React.createElement(R.Card, {
    title: "Review enrollment",
    subtitle: "Confirm before issuing the voter ID"
  }, /*#__PURE__*/React.createElement("div", {
    className: "summary-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "summary-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Name"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Chantal Ingabire")), /*#__PURE__*/React.createElement("div", {
    className: "summary-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "National ID"), /*#__PURE__*/React.createElement("span", {
    className: "v mono"
  }, "1 1996 8 0073391 4 21")), /*#__PURE__*/React.createElement("div", {
    className: "summary-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Date of birth"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "12 Apr 1996")), /*#__PURE__*/React.createElement("div", {
    className: "summary-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Constituency"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Niboye \xB7 Kicukiro")), /*#__PURE__*/React.createElement("div", {
    className: "summary-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Biometrics"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Face 0.93 \xB7 Fingerprint 0.88 \xB7 LIVE")), /*#__PURE__*/React.createElement("div", {
    className: "summary-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Captured by"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Officer #88 \xB7 GPS tagged")))));
}
function IssueStep() {
  useEffectR(lucideR);
  return /*#__PURE__*/React.createElement("div", {
    className: "issue"
  }, /*#__PURE__*/React.createElement("div", {
    className: "issue__ring"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "badge-check",
    s: {
      width: 46,
      height: 46
    }
  })), /*#__PURE__*/React.createElement("h2", null, "Voter ID issued"), /*#__PURE__*/React.createElement("p", null, "Chantal Ingabire is registered. The card below is queued to print, and the record will sync when the device is back online."), /*#__PURE__*/React.createElement("div", {
    className: "voter-id-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vc-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vc-brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark-dark.svg",
    style: {
      height: 24
    },
    alt: "SecurePoll RW"
  })), /*#__PURE__*/React.createElement("div", {
    className: "vc-qr"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "qr-code",
    s: {
      width: 48,
      height: 48
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "vc-name"
  }, "Chantal Ingabire"), /*#__PURE__*/React.createElement("div", {
    className: "vc-id"
  }, "RW-2026-9F44-21A0"), /*#__PURE__*/React.createElement("div", {
    className: "vc-meta"
  }, /*#__PURE__*/React.createElement("div", null, "Constituency", /*#__PURE__*/React.createElement("b", null, "Niboye")), /*#__PURE__*/React.createElement("div", null, "District", /*#__PURE__*/React.createElement("b", null, "Kicukiro")), /*#__PURE__*/React.createElement("div", null, "Issued", /*#__PURE__*/React.createElement("b", null, "07 Jun 2026")))));
}
function RegistrationApp() {
  const [step, setStep] = useStateR(0);
  const [bio, setBio] = useStateR({
    face: false,
    print: false
  });
  useEffectR(lucideR, [step]);
  const canNext = step !== 1 || bio.face && bio.print;
  return /*#__PURE__*/React.createElement("div", {
    className: "reg"
  }, /*#__PURE__*/React.createElement("header", {
    className: "reg__bar"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark.svg",
    alt: ""
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ttl"
  }, "Field Registration"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Mobile enrollment \xB7 Kicukiro team")), /*#__PURE__*/React.createElement("div", {
    className: "reg__bar-end"
  }, /*#__PURE__*/React.createElement("span", {
    className: "reg__offline"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "cloud-off"
  }), " Offline"), /*#__PURE__*/React.createElement("span", {
    className: "reg__queue"
  }, /*#__PURE__*/React.createElement(Ir, {
    n: "upload-cloud"
  }), " 23 queued to sync"))), /*#__PURE__*/React.createElement(Stepper, {
    step: step
  }), /*#__PURE__*/React.createElement("main", {
    className: "reg__stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "reg__inner"
  }, step === 0 && /*#__PURE__*/React.createElement(DetailsStep, null), step === 1 && /*#__PURE__*/React.createElement(BiometricsStep, {
    state: bio,
    setState: setBio
  }), step === 2 && /*#__PURE__*/React.createElement(DuplicateStep, null), step === 3 && /*#__PURE__*/React.createElement(IssueStep, null))), /*#__PURE__*/React.createElement("footer", {
    className: "reg__foot"
  }, /*#__PURE__*/React.createElement(R.Button, {
    variant: "ghost",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "arrow-left"
    }),
    disabled: step === 0,
    onClick: () => setStep(Math.max(0, step - 1))
  }, "Back"), step < 3 ? /*#__PURE__*/React.createElement(R.Button, {
    variant: "primary",
    iconRight: /*#__PURE__*/React.createElement(Ir, {
      n: "arrow-right"
    }),
    disabled: !canNext,
    onClick: () => setStep(step + 1)
  }, step === 2 ? "Issue voter ID" : "Continue") : /*#__PURE__*/React.createElement(R.Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Ir, {
      n: "user-plus"
    }),
    onClick: () => {
      setStep(0);
      setBio({
        face: false,
        print: false
      });
    }
  }, "New registration")));
}
window.RegistrationApp = RegistrationApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/registration/RegistrationApp.jsx", error: String((e && e.message) || e) }); }

// viewport-fit.js
try { (() => {
/* viewport-fit.js — scales each fixed-size SecurePoll RW design to fill the screen.
   - "width" mode  : zoom so the design's width fills the viewport; page scrolls vertically.
   - "contain" mode: zoom so the whole fixed design fits within the viewport, centred by its parent.
   Applied via CSS `zoom`, which (unlike transform) preserves native scrolling, sticky
   positioning and hit-testing. Exposes the chosen scale as `--fit` for layout that must
   counter it (e.g. a 100vh sticky sidebar → height: calc(100vh / var(--fit))). */
(function () {
  var MAP = [{
    sel: ".admin",
    w: 1440,
    mode: "width"
  }, {
    sel: ".reg",
    w: 1180,
    mode: "width"
  }, {
    sel: ".pub",
    w: 1280,
    mode: "width"
  }, {
    sel: ".page",
    w: 1280,
    mode: "width"
  }, {
    sel: ".auth",
    w: 1280,
    mode: "width"
  }, {
    sel: ".obs",
    w: 1280,
    mode: "width"
  }, {
    sel: ".kiosk",
    w: 1280,
    h: 800,
    mode: "contain",
    pad: 32
  }, {
    sel: ".fm-page > div",
    w: 412,
    h: 892,
    mode: "contain",
    pad: 48
  }];
  function pick() {
    for (var i = 0; i < MAP.length; i++) {
      var e = document.querySelector(MAP[i].sel);
      if (e) return {
        e: e,
        c: MAP[i]
      };
    }
    return null;
  }
  function apply() {
    var f = pick();
    if (!f) return false;
    var e = f.e,
      c = f.c;
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
      e.style.margin = "0"; // drop auto-centering so zoom fills exactly
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
    var iv = setInterval(function () {
      if (apply() || ++n > 100) clearInterval(iv);
    }, 40);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);else boot();
  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(apply, 60);
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "viewport-fit.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.ConfidenceMeter = __ds_scope.ConfidenceMeter;

__ds_ns.DecisionPanel = __ds_scope.DecisionPanel;

})();
