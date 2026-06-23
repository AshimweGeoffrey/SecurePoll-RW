---
name: securepoll-rw-design
description: Use this skill to generate well-branded interfaces and assets for SecurePoll RW — the AI-powered voter authentication & identity-verification platform for Rwanda's National Electoral Commission — either for production or throwaway prototypes/mocks/architecture visuals. Contains essential design guidelines, colors, type, fonts, assets, architecture-diagram patterns, and UI-kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

SecurePoll RW is modern civic-tech: a neutral **slate** canvas, a single **electoral-green** primary, and strict status semantics (green = approved, amber = manual review, red = rejected, blue = info). Type is **Zilla Slab** (display/official) + **Hanken Grotesk** (UI/body) + **JetBrains Mono** (scores, IDs, hashes). Light + dark (kiosk) themes. Icons are Lucide. Calm, deliberate motion — never bouncy. Read `readme.md` → CONTENT FUNDAMENTALS, VISUAL FOUNDATIONS, and ICONOGRAPHY before designing.

Key surfaces and patterns to reuse:
- `styles.css` — link this one file to inherit every token + webfont.
- `tokens/` — the full token system (colors, type, spacing, elevation, motion).
- `components/` — React primitives (Button, Badge, Card, Input, Select, ConfidenceMeter, DecisionPanel). The **DecisionPanel** is the signature explainable-AI result component — reuse it anywhere a verification or fraud decision is shown.
- `architecture/` — the boxes-and-bands diagram language (layered system, verification flow, event bus, security zones, offline sync). Reuse `architecture/diagram.css` for any new system/data-flow visual.
- `ui_kits/` — full recreations of the four client apps (Registration, Polling Station kiosk, Admin & Audit, Public Portal).

If creating visual artifacts (slides, mocks, throwaway prototypes, architecture diagrams, etc.), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
