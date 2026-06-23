# Polling Station App — UI Kit

The election-day verification kiosk. Runs on a locked-down **Android tablet in kiosk mode** at polling stations; **dark theme** so the big APPROVED / REJECTED status colors carry the room. Large (≥56px) touch targets throughout.

**Used by:** Polling Officers · **Covers modules:** 2 (Biometric Auth), 4 (Real-Time Verification), 6 (Election Day Ops)

## Files
- `index.html` — the interactive click-through (start here).
- `PollingKiosk.jsx` — the full flow as a small state machine.
- `kiosk.css` — kiosk-specific layout/styling.

## The flow (demo is interactive)
1. **Idle** — "Scan voter ID card". Three demo cards seed the three outcomes.
2. **Voter found** — photo, name, NID, eligibility. Already-voted cards are blocked (double-vote prevention).
3. **Capture** — liveness → 1:1 face → fingerprint → fusion, with an animated scan.
4. **Result** — the explainable-AI `DecisionPanel`:
   - **≥ 0.80 → APPROVED** — green, "Grant ballot", marks VOTED.
   - **0.60–0.79 → MANUAL REVIEW** — amber, officer approves/rejects with a logged justification.
   - **< 0.60 → REJECTED** — red, supervisor alerted.

## Components used
`DecisionPanel`, `ConfidenceMeter`, `Button` (xl kiosk size), `Badge`.
