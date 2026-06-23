# Public Portal — UI Kit

The public-facing, **read-only** website. Serves anonymized, aggregated data only — it has zero access to biometric data or individual voter records. This is the most "marketing site"-like surface in the system.

**Used by:** Public, Observers, Media · **Covers module:** 12 (Election Monitoring & Public Portal)

## Files
- `index.html` — the portal page (start here).
- `PublicPortal.jsx` — nav, hero + status lookup, turnout band, feature cards, footer.
- `portal.css` — portal layout/styling.

## Sections
- **Nav** — links + trilingual toggle (EN / KIN / FR) + observer login.
- **Hero + status lookup** — enter a National ID, get a registration-status card.
- **Live turnout** — four aggregated stat tiles (national %, verified count, stations online, last-updated). Updates every 30s; no individual data.
- **Find your station / report an incident** — locator with a simple map + station list, and an anonymous incident report CTA.
- **Footer** — dark, with the data-protection notice (Law 058/2021) and observer API link.

## Components used
`Input`, `Button`, `Badge`, `Card`.
