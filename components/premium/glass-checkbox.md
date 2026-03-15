# GlassCheckbox

Checkbox with a label and optional description text below it. Suitable for boolean consent fields or multi-select option lists. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| label | string | yes | — | Primary label shown next to the checkbox |
| value | boolean or {path} | no | false | Checked state; use `{path: "/field"}` for data binding |
| description | string | no | — | Secondary text shown below the label, smaller and muted |

## Data Binding

Set `value` to `{path: "/fieldName"}` to bind the checked state to a data model field. Seed `false` (or `true` for pre-checked) in `updateDataModel`.

```json
{"version":"v0.9","updateDataModel":{"value":{"terms":false,"marketing":false}}}
```

```json
{"id":"terms","component":"GlassCheckbox","label":"I agree to the Terms of Service","value":{"path":"/terms"}}
```

## Example

```json
{"id":"marketing","component":"GlassCheckbox","label":"Send me product updates","value":{"path":"/marketing"},"description":"Occasional emails about new features and tips. Unsubscribe anytime."}
```

## Full Card Example

Registration form with consent checkboxes:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"create-account","title":"Create account"}}
{"version":"v0.9","updateDataModel":{"value":{"name":"","email":"","terms":false,"marketing":false}}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","name","email","terms","marketing","submit"]},{"id":"hdr","component":"GlassHeader","title":"Create your account"},{"id":"name","component":"GlassInput","label":"Full name","value":{"path":"/name"},"placeholder":"Jane Smith"},{"id":"email","component":"GlassInput","label":"Email","value":{"path":"/email"},"inputType":"email","placeholder":"jane@example.com"},{"id":"terms","component":"GlassCheckbox","label":"I agree to the Terms of Service and Privacy Policy","value":{"path":"/terms"}},{"id":"marketing","component":"GlassCheckbox","label":"Email me about new features","value":{"path":"/marketing"},"description":"No spam. Unsubscribe at any time."},{"id":"submit","component":"GlassButton","variant":"filled","children":["submit-label"],"action":{"name":"submit"}},{"id":"submit-label","component":"Text","text":"Create account","variant":"body"}]}}
```

## Notes

- The data model field is `true` or `false` (boolean), not `"on"`/`"off"`.
- For a multi-select pattern (choose several from a list), use one GlassCheckbox per option with separate data model paths (e.g. `/opt_a`, `/opt_b`).
- Validation (e.g. requiring `terms` to be `true`) must be done by the agent after decrypting the response.
