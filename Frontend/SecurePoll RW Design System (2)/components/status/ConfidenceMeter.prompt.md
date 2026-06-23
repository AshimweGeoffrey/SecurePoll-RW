Confidence gauge (0–1) whose color encodes the decision band — green ≥ threshold, amber 0.60–0.79, red < 0.60 — with a tick at the auto-approve threshold.

```jsx
<ConfidenceMeter value={0.91} threshold={0.8} size="lg" />
<ConfidenceMeter value={0.72} label="Fused score" showScale />
```

Use inside the DecisionPanel or anywhere a match/fraud score is shown. `value` and `threshold` are 0–1 floats.
