The signature explainable-AI result card — use wherever a biometric verification or fraud decision is shown (polling kiosk, audit log, fraud case). It surfaces the verdict, confidence, signal breakdown, and a plain-language reason so every AI decision is auditable.

```jsx
<DecisionPanel
  voterName="Jean Baptiste · RW-2026-0F3A"
  confidence={0.91}
  threshold={0.8}
  breakdown={{ "Face match": 0.94, "Fingerprint": 0.87, "Liveness": "LIVE" }}
  explanation="Strong face match with high liveness confidence. Fingerprint confirms identity."
  flags={[]}
/>
```

Verdict is derived from `confidence` vs `threshold` (≥ threshold → approved, ≥ 0.60 → review, else rejected) unless you pass `decision`. `breakdown` accepts an object or an array of `{label, value}`. Set `reviewRequired` to show the officer-justification footer; pass `flags` for fraud/anomaly chips.
