Surface container for panels, list items, and dashboard tiles. Optional header and a semantic top accent bar.

```jsx
<Card title="Polling Station 014" subtitle="Nyarugenge · Kigali"
      headerEnd={<Badge tone="green" dot>Online</Badge>} accent="green">
  <p>62.4% turnout · 1,204 of 1,930 verified</p>
</Card>
```

`elevation`: `flat` · `raised` (default) · `floating`. Set `interactive` for clickable cards (hover lift). `accent` takes a semantic key or any color. Header is optional — omit `title`/`subtitle`/`headerEnd` for a plain surface.
