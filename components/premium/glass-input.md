# GlassInput

Single-line text input with a label above. Supports data binding for form submissions and optional validation. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| label | string | yes | — | Field label displayed above the input |
| value | string or {path} | no | "" | Current value; use `{path: "/field"}` for data binding |
| inputType | "text"\|"number"\|"email"\|"password"\|"tel"\|"url" | no | "text" | HTML input type |
| placeholder | string | no | — | Placeholder text shown when empty |
| hint | string | no | — | Helper text shown below the input |
| validationRegexp | string | no | — | Regex pattern; input shows error styling when value does not match |

## Data Binding

Set `value` to `{path: "/fieldName"}` to bind the input to a data model field. The renderer seeds initial values from `updateDataModel` and tracks changes as the user types. On form submission, the current data model is included in the encrypted response.

Seed the initial value in `updateDataModel`:

```json
{"version":"v0.9","updateDataModel":{"value":{"email":""}}}
```

Then reference it in the component:

```json
{"id":"email","component":"GlassInput","label":"Email","value":{"path":"/email"},"inputType":"email"}
```

## Example

```json
{"id":"name","component":"GlassInput","label":"Full name","value":{"path":"/name"},"placeholder":"Jane Smith","hint":"As it appears on your ID"}
```

```json
{"id":"age","component":"GlassInput","label":"Age","value":{"path":"/age"},"inputType":"number","validationRegexp":"^[0-9]+$"}
```

## Full Card Example

Contact form:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"contact-form","title":"Contact us"}}
{"version":"v0.9","updateDataModel":{"value":{"name":"","email":"","message":""}}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","name","email","msg","submit"]},{"id":"hdr","component":"GlassHeader","title":"Get in touch","subtitle":"We'll reply within 24 hours"},{"id":"name","component":"GlassInput","label":"Your name","value":{"path":"/name"},"placeholder":"Jane Smith"},{"id":"email","component":"GlassInput","label":"Email","value":{"path":"/email"},"inputType":"email","placeholder":"jane@example.com"},{"id":"msg","component":"GlassTextarea","label":"Message","value":{"path":"/message"},"placeholder":"How can we help?","rows":4},{"id":"submit","component":"GlassButton","variant":"filled","children":["submit-label"],"action":{"name":"submit"}},{"id":"submit-label","component":"Text","text":"Send message","variant":"body"}]}}
```

## Notes

- `validationRegexp` only applies visual feedback; server-side validation happens when the agent decrypts the response.
- `inputType: "password"` masks the value in the UI but the plaintext is still included in the encrypted submission — use only for UX, not security.
- Number inputs return a string in the data model; parse in the agent after decryption.
