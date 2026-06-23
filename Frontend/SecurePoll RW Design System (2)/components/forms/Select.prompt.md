Styled native select with the same label/hint/error chrome as Input.

```jsx
<Select label="District" placeholder="Select a district"
        options={["Nyarugenge", "Gasabo", "Kicukiro"]} />
<Select label="Status" options={[
  {value:"registered", label:"Registered"},
  {value:"voted", label:"Voted"},
  {value:"blocked", label:"Blocked"},
]} />
```

Pass `options` (strings or `{value,label}`) or `<option>` children. `size="lg"` for field/kiosk forms.
