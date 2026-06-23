# Registration App — UI Kit

The field enrollment app. **Offline-first** — officers collect registrations on an Android tablet (or web fallback) into local encrypted storage, then batch-sync when connected. The chrome always shows the offline state and the pending sync queue.

**Used by:** Registration Officers, Admins · **Covers modules:** 1 (Voter Registration), 11 (Mobile Field Ops)

## Files
- `index.html` — the interactive wizard (start here).
- `RegistrationApp.jsx` — the four-step flow + stepper.
- `reg.css` — wizard layout/styling.

## The flow (interactive)
1. **Details** — NID (mono, validated format), name, DOB, sex, district/constituency, address.
2. **Biometrics** — face + fingerprint capture, each with a sample-quality `ConfidenceMeter` and a liveness badge. "Continue" is gated until both are captured.
3. **Duplicate check** — the 1:N dedup result (clean banner) and a full enrollment review.
4. **Issue ID** — success state with the printed voter-ID card (QR), queued to sync.

## Components used
`Input`, `Select`, `ConfidenceMeter`, `Badge`, `Button`, `Card`.
