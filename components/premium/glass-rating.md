# GlassRating

Interactive star rating input. Users tap to select a rating. Supports data binding so the selected value is captured in the form response. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| label | string | no | — | Label displayed above the stars |
| value | number or {path} | no | 0 | Current rating (1–max); use `{path: "/field"}` for data binding |
| max | number | no | 5 | Number of stars to display |
| hint | string | no | — | Helper text shown below the stars |

## Data Binding

Set `value` to `{path: "/fieldName"}` to capture the selected rating in the data model. Seed `0` for no initial selection.

```json
{"version":"v0.9","updateDataModel":{"value":{"rating":0}}}
```

```json
{"id":"rating","component":"GlassRating","label":"Overall rating","value":{"path":"/rating"},"max":5}
```

## Example

```json
{"id":"quality","component":"GlassRating","label":"Product quality","value":{"path":"/quality"},"max":5,"hint":"1 = poor, 5 = excellent"}
```

10-point scale:

```json
{"id":"nps","component":"GlassRating","label":"How likely are you to recommend us?","value":{"path":"/nps"},"max":10,"hint":"1 = not at all, 10 = definitely"}
```

## Full Card Example

Post-purchase review form:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"order-review","title":"Rate your order"}}
{"version":"v0.9","updateDataModel":{"value":{"overall":0,"delivery":0,"packaging":0,"comment":""}}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","overall","delivery","packaging","comment","submit"]},{"id":"hdr","component":"GlassHeader","title":"How was your order?","subtitle":"Order #48291 - Delivered yesterday"},{"id":"overall","component":"GlassRating","label":"Overall experience","value":{"path":"/overall"},"max":5},{"id":"delivery","component":"GlassRating","label":"Delivery speed","value":{"path":"/delivery"},"max":5},{"id":"packaging","component":"GlassRating","label":"Packaging quality","value":{"path":"/packaging"},"max":5},{"id":"comment","component":"GlassTextarea","label":"Leave a comment (optional)","value":{"path":"/comment"},"placeholder":"Tell us more...","rows":3},{"id":"submit","component":"GlassButton","variant":"filled","children":["submit-label"],"action":{"name":"submit"}},{"id":"submit-label","component":"Text","text":"Submit review","variant":"body"}]}}
```

## Notes

- The data model value is an integer (1–max). A value of `0` means no rating selected.
- Validate that the value is greater than 0 in the agent after decrypting the response if the rating is required.
