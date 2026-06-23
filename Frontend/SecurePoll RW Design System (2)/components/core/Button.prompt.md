Primary action control — use for any button across SecurePoll RW surfaces; `primary` for the main commit action, `secondary`/`ghost` for supporting actions, `danger` for destructive or REJECT actions.

```jsx
<Button variant="primary" size="lg" iconLeft={<i data-lucide="check" />}>
  Grant ballot
</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger" size="sm">Block voter</Button>
```

Variants: `primary` (electoral green) · `secondary` (outlined) · `ghost` (quiet) · `danger` (red).
Sizes: `sm` (dense tables) · `md` (default) · `lg` · `xl` (kiosk touch targets, ≥56px).
Props: `loading` shows a spinner + disables; `fullWidth`; `iconLeft` / `iconRight` take any node.
