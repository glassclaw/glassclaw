# GlassSelect

Dropdown select with a label above. Users pick one option from a predefined list. **Pro tier only.**

**IMPORTANT:** Options are passed as an inline `options` array property — NOT as separate child components. There is no `GlassOption` component.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| label | string | yes | — | Field label displayed above the dropdown |
| value | string or {path} | no | "" | Selected option value; use `{path: "/field"}` for data binding |
| options | array of {label, value} | yes | — | List of options to display |

Each option object:

| Key | Type | Description |
|-----|------|-------------|
| label | string | Text shown to the user |
| value | string | Value written to the data model on selection |

## Data Binding

Set `value` to `{path: "/fieldName"}` to bind selection to a data model field. Seed the initial value in `updateDataModel` — use an empty string for no pre-selection, or a valid option value to pre-select.

```json
{"version":"v0.9","updateDataModel":{"value":{"country":""}}}
```

```json
{"id":"country","component":"GlassSelect","label":"Country","value":{"path":"/country"},"options":[{"label":"United States","value":"us"},{"label":"United Kingdom","value":"uk"},{"label":"Germany","value":"de"}]}
```

## Example

```json
{"id":"plan","component":"GlassSelect","label":"Subscription plan","value":{"path":"/plan"},"options":[{"label":"Starter — $9/mo","value":"starter"},{"label":"Growth — $29/mo","value":"growth"},{"label":"Enterprise — $99/mo","value":"enterprise"}]}
```

## Full Card Example

Support ticket form with category and priority dropdowns:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"support-ticket","title":"Open a support ticket"}}
{"version":"v0.9","updateDataModel":{"value":{"category":"","priority":"normal","description":""}}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","category","priority","desc","submit"]},{"id":"hdr","component":"GlassHeader","title":"New support request","subtitle":"We aim to respond within 4 hours"},{"id":"category","component":"GlassSelect","label":"Category","value":{"path":"/category"},"options":[{"label":"Billing","value":"billing"},{"label":"Technical issue","value":"technical"},{"label":"Account access","value":"account"},{"label":"Feature request","value":"feature"},{"label":"Other","value":"other"}]},{"id":"priority","component":"GlassSelect","label":"Priority","value":{"path":"/priority"},"options":[{"label":"Low","value":"low"},{"label":"Normal","value":"normal"},{"label":"High","value":"high"},{"label":"Urgent","value":"urgent"}]},{"id":"desc","component":"GlassTextarea","label":"Describe the issue","value":{"path":"/description"},"rows":5,"placeholder":"Steps to reproduce, what you expected, what happened..."},{"id":"submit","component":"GlassButton","variant":"filled","children":["submit-label"],"action":{"name":"submit"}},{"id":"submit-label","component":"Text","text":"Submit ticket","variant":"body"}]}}
```

## Notes

- The `value` written to the data model is the option's `value` key, not its `label`.
- Options are rendered in the order provided; no automatic sorting.
- There is no multi-select variant — use multiple GlassCheckbox components for multi-select patterns.
