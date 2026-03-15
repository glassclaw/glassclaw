# GlassSlider

Range input with a draggable handle and a live value display. Good for numeric selections where users benefit from seeing the full range (budget, quantity, satisfaction score). **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| label | string | no | — | Label displayed above the slider |
| value | number or {path} | no | min | Current value; use `{path: "/field"}` for data binding |
| min | number | no | 0 | Minimum value |
| max | number | no | 100 | Maximum value |
| step | number | no | 1 | Increment size |
| suffix | string | no | — | Unit label appended to the live value display (e.g. "%" or "km") |
| hint | string | no | — | Helper text shown below the slider |

## Data Binding

Set `value` to `{path: "/fieldName"}` to bind the slider position to a data model field. Seed the initial numeric value in `updateDataModel`.

```json
{"version":"v0.9","updateDataModel":{"value":{"budget":1000}}}
```

```json
{"id":"budget","component":"GlassSlider","label":"Monthly budget","value":{"path":"/budget"},"min":100,"max":10000,"step":100,"suffix":"$"}
```

## Example

Satisfaction score:

```json
{"id":"satisfaction","component":"GlassSlider","label":"Satisfaction","value":{"path":"/satisfaction"},"min":0,"max":10,"step":1,"hint":"0 = very unsatisfied, 10 = very satisfied"}
```

Distance filter:

```json
{"id":"distance","component":"GlassSlider","label":"Maximum distance","value":{"path":"/distance"},"min":1,"max":50,"step":1,"suffix":"km"}
```

## Full Card Example

Loan calculator intake form:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"loan-calc","title":"Loan calculator"}}
{"version":"v0.9","updateDataModel":{"value":{"amount":5000,"term":12,"name":"","email":""}}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","amount","term","name","email","submit"]},{"id":"hdr","component":"GlassHeader","title":"Personal loan estimate","subtitle":"Adjust the sliders to find your preferred terms"},{"id":"amount","component":"GlassSlider","label":"Loan amount","value":{"path":"/amount"},"min":1000,"max":50000,"step":500,"suffix":"$","hint":"$1,000 - $50,000"},{"id":"term","component":"GlassSlider","label":"Repayment period","value":{"path":"/term"},"min":6,"max":60,"step":6,"suffix":" months"},{"id":"name","component":"GlassInput","label":"Full name","value":{"path":"/name"},"placeholder":"Jane Smith"},{"id":"email","component":"GlassInput","label":"Email","value":{"path":"/email"},"inputType":"email"},{"id":"submit","component":"GlassButton","variant":"filled","children":["submit-label"],"action":{"name":"submit"}},{"id":"submit-label","component":"Text","text":"Get my estimate","variant":"body"}]}}
```

## Notes

- The data model value is a number matching the step resolution.
- `suffix` is appended directly to the live value with no space — include a leading space in the string if you want separation (e.g. `" months"`).
