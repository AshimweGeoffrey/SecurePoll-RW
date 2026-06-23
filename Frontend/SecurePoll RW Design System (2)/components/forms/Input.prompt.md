Labelled text input with hint/error states and optional inline icons. Use `mono` for National IDs, voter IDs, and codes.

```jsx
<Input label="National ID" required mono placeholder="1 1990 8 0012345 6 78"
       iconLeft={<i data-lucide="id-card" />} hint="16 digits, as printed on the card" />
<Input label="Search voters" iconLeft={<i data-lucide="search" />} />
<Input label="Constituency" error="This field is required" />
```

Passes through all native input props (`type`, `value`, `onChange`, …). `size="lg"` for kiosk/field forms.
