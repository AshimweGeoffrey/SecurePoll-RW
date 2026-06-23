# SecurePoll RW — Design System

A design system for **SecurePoll RW**, an AI-powered voter authentication and identity-verification platform built for the **National Electoral Commission (NEC) of Rwanda**. It covers two operational phases — pre-election registration/biometric enrollment, and election-day verification — across five user roles (Admin, Registration Officer, Polling Officer, Auditor, Observer) and four client surfaces.

This system was designed from a written system-architecture specification (final-year project by Ashimwe Geoffrey, 2026-06-07). **There was no pre-existing brand, codebase, or Figma file** — the visual identity, logo, color, type, and components here were authored fresh to fit the product's civic-tech, trust-first character. Treat everything as a proposed v1 to react to.

## Sources given
- A full prose architecture document: "SecurePoll RW — Full System Architecture" (12 modules, 11 microservices, 4 client apps, data layer, security zones, request flows). No links, repos, or design files were attached.

---

## What's in here (manifest)

| Path | What it is |
|---|---|
| `styles.css` | The entry point consumers link — `@import`s every token + font file. |
| `tokens/` | `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `motion.css`, `fonts.css`, `base.css`. |
| `assets/` | Logo wordmarks (light/dark) + monogram mark (SVG). |
| `guidelines/` | Foundation specimen cards (color, type, spacing, brand) shown in the Design System tab. |
| `architecture/` | **The architecture & data-flow visualizations** — 5 diagrams + an overview hub. The headline deliverable. |
| `components/` | Reusable React primitives: `core/` (Button, Badge, Card), `forms/` (Input, Select), `status/` (ConfidenceMeter, DecisionPanel). |
| `ui_kits/` | Full-screen product recreations — `polling-station/`, `registration/`, `admin-audit/`, `public-portal/` (each: README + index.html + JSX). |
| `SKILL.md` | Agent-Skills wrapper so this system can be used inside Claude Code. |

### Architecture diagrams (`architecture/`)
1. `01-system-architecture.html` — layered stack: clients → gateway → 11 microservices → data layer.
2. `02-verification-flow.html` — the <500ms election-day pipeline + explainable-AI decision gate.
3. `03-event-bus.html` — RabbitMQ topic exchange, routing keys, publishers/subscribers.
4. `04-security-zones.html` — DMZ / internal / isolated biometric zone + polling edge.
5. `05-offline-sync.html` — pre-load → offline verification → reconnect & reconcile.
6. `index.html` — navigable overview hub linking all five.

---

## CONTENT FUNDAMENTALS — how SecurePoll RW writes

**Voice:** calm, precise, institutional but human. This is election infrastructure — copy must earn trust through clarity, never hype.

- **Person:** Address officers and the public directly as *you* ("Check your registration status"). Refer to the system in the third person, never "I". Internal/system copy is impersonal and factual ("Templates fetched over mTLS").
- **Tone:** confident and plain. Short declaratives. State what happened and what to do next. No marketing adjectives, no exclamation marks in product UI.
- **Casing:** Sentence case for UI labels, buttons, and headings ("Grant ballot", "Manual review"). **ALL-CAPS is reserved** for verification verdicts and statuses that carry weight — `APPROVED`, `REJECTED`, `MANUAL REVIEW`, `VOTED`, `BLOCKED` — and for tiny overline/eyebrow labels (tracked +0.08em).
- **Numbers & data:** always monospace, tabular. Scores shown to two decimals (`0.91`) or as whole-percent in hero contexts (`91%`). IDs use grouped mono (`RW-2026-0F3A-91C7`). Time targets stated bluntly ("Target < 500 ms").
- **Explainability:** every AI decision is paired with a one-sentence, jargon-free reason ("Strong face match with high liveness confidence. Fingerprint confirms identity."). This is a product principle, not decoration — never show a score without a reason.
- **Emoji:** none. Ever. This is a government security context.
- **Examples of good copy:** "Voter already verified at this station.", "Officer decision required — log a justification.", "16 digits, as printed on the card.", "62.4% turnout · 1,204 of 1,930 verified".

---

## VISUAL FOUNDATIONS

**Overall character:** modern civic-tech. Clean, high-contrast, deliberate. Trustworthy without being stiff; precise without being cold. The system should feel like dependable public infrastructure.

**Color.** A neutral **slate** canvas carries the UI; an **electoral green** (`--green-500` `#16924f`) is the single primary — used for brand, primary actions, and the APPROVED state. Status semantics are strict and never decorative: **green = approved / verified**, **amber = manual review** (0.60–0.79), **red = rejected** (< 0.60), **civic blue** = info / secondary / "secure". Color always means something. Full light + dark token sets exist — **dark is the polling-station kiosk theme** (focus, big status colors pop on near-black slate).

**Type.** Three families: **Zilla Slab** (display/headlines/official documents — sturdy, civic, slightly editorial), **Hanken Grotesk** (all UI, body, forms, tables — neutral and screen-legible), **JetBrains Mono** (scores, IDs, hashes, API endpoints, any tabular number). Display is set tight (−2% tracking, line-height 1.08); body is generous (1.65). Eyebrows/overlines are 11px, 700 weight, uppercase, +0.08em.

**Spacing & layout.** 8px base grid with 2/4px half-steps for dense admin tables. Touch targets never below 44px; kiosk controls are 56px (`--control-h-xl`). Layout is calm and gridded — generous gutters, clear bands, no decorative crowding.

**Backgrounds.** Mostly flat surfaces. The only gradients are (a) subtle, near-invisible radial green tints at the top of hero/architecture canvases, and (b) the decision-panel header bars (a 100° green/amber/red gradient that reinforces the verdict). No photographic backgrounds, no noise/grain, no busy patterns. The isolated-biometric zone uses a deep navy fill (`#11243f` / `--band-secure`) to read as "locked down".

**Corners.** Restrained. 8px default controls, 12px cards, 16px panels/modals, pill for badges and the confidence meter. Nothing is over-rounded.

**Borders.** Hairline 1px is the workhorse (`--border-subtle` / `--border-default`). A 3px accent (`--bw-accent`) is used for status edges (card top accents). Dashed borders denote zones/subnets in diagrams.

**Shadows.** Cool, slate-tinted, low-spread ("civic-soft"). `--shadow-sm` on resting cards, `--shadow-md`/`lg` on hover and floating panels. Dark theme uses deeper black shadows. A colored focus/glow ring (`--glow-approved` etc.) marks active verified states.

**Elevation & cards.** Cards = white surface + 1px subtle border + `--shadow-sm` + 12px radius. Interactive cards lift 1px and deepen the shadow on hover. An optional top accent bar colors the card by status.

**Motion.** Calm and purposeful — **never bouncy**. Standard ease `cubic-bezier(0.2,0,0,1)`, entrances decelerate (`0.16,1,0.3,1`). Durations 140–360ms. Confidence meters animate their fill on mount (360ms). Honors `prefers-reduced-motion` (all durations → 0).

**Hover / press.** Primary buttons darken (green-500 → 600 → 700). Secondary/ghost fill with `--bg-subtle`. Cards lift. Press states deepen color rather than shrink. Focus is always a 3px green ring.

**Transparency & blur.** Used sparingly — overlay scrims (`--bg-overlay`) behind modals, and translucent soft-status fills in dark mode. No frosted-glass everywhere.

**Imagery vibe.** Where real photos/ID images appear they're functional, not stylized — neutral, well-lit, no filters. Document/face captures are shown in plain framed slots.

---

## ICONOGRAPHY

- **Icon set:** **[Lucide](https://lucide.dev)** — clean, consistent ~1.75px stroke, rounded joins. It matches the modern civic-tech tone and pairs well with Hanken Grotesk. Loaded from CDN (`unpkg.com/lucide`) in diagrams, cards, and kits via `<i data-lucide="name">` + `lucide.createIcons()`.
  - ⚠️ **Substitution flag:** there was no bespoke icon set to copy, so Lucide is a chosen stand-in. If NEC has or wants a custom set, swap the CDN reference.
- **Style rules:** line icons only (no filled/duotone), single-color (inherit `currentColor`), sized 14–20px in UI, 30–34px in feature contexts. Common glyphs in this system: `fingerprint`, `scan-face`, `scan-eye`, `shield-check`, `badge-check`, `key-round`, `file-check-2`, `radio-tower`, `database`, `cpu`, `activity`.
- **Logo / mark:** `assets/mark.svg` — a civic shield enclosing a verification check (green gradient). Wordmark in Zilla Slab with a slate "RW" badge. Light + dark lockups provided. Minimum clear space = the height of the mark. This is the only hand-built SVG brand asset.
- **Emoji & unicode icons:** never used.

---

## ⚠️ Caveats / things to confirm
- **Fonts are loaded from Google Fonts CDN** (Hanken Grotesk, Zilla Slab, JetBrains Mono) — see `tokens/fonts.css`. For production/offline use, self-host as woff2 and replace the `@import` with local `@font-face` rules. Send updated font files if NEC has licensed alternatives.
- **Icons (Lucide) are a substitution**, as noted above.
- The **logo** is an original proposal — happy to iterate on the mark, wordmark, or the "RW" treatment.
