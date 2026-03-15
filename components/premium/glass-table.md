# GlassTable

Data table with column headers and rows of cell values. Useful for pricing comparisons, structured data summaries, or any information that benefits from a grid layout. **Pro tier only.**

**IMPORTANT:** Table data is passed as inline `columns` and `rows` properties — NOT as separate child components. There is no `GlassTableRow` component.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| label | string | no | — | Table title displayed above the header row |
| columns | array of strings | yes | — | Column header labels, left to right |
| rows | array of arrays | yes | — | Table rows; each inner array contains cell values matching column order |
| striped | boolean | no | true | Alternate row background shading for readability |

Cell values in `rows` are strings. Numbers and other types should be pre-formatted as strings by the agent.

## Example

Simple two-column table:

```json
{"id":"specs","component":"GlassTable","label":"Product specifications","columns":["Property","Value"],"rows":[["Weight","320 g"],["Dimensions","180 × 75 × 8 mm"],["Battery","4,500 mAh"],["Camera","50 MP main + 12 MP ultra"],["Storage","128 GB / 256 GB"]]}
```

## Full Card Example

Pricing plan comparison:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"pricing","title":"Pricing comparison"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","table","note","cta"]},{"id":"hdr","component":"GlassHeader","title":"Choose your plan","subtitle":"All plans include a 14-day free trial"},{"id":"table","component":"GlassTable","label":"Feature comparison","columns":["Feature","Starter","Growth","Enterprise"],"rows":[["Price","$9/mo","$29/mo","$99/mo"],["Users","1","5","Unlimited"],["Projects","3","25","Unlimited"],["Storage","5 GB","50 GB","1 TB"],["API access","---","Yes","Yes"],["SSO","---","---","Yes"],["Priority support","---","---","Yes"],["SLA uptime","99.5%","99.9%","99.99%"]]},{"id":"note","component":"GlassCallout","text":"Enterprise plans include a dedicated account manager and custom onboarding.","variant":"info"},{"id":"cta","component":"GlassButton","variant":"filled","children":["cta-label"],"action":{"name":"trial"}},{"id":"cta-label","component":"Text","text":"Start free trial","variant":"body"}]}}
```

## Notes

- All cell values must be strings. Format numbers, currencies, and dates before building the payload.
- The number of values in each row array must match the number of columns. Mismatched rows render with empty trailing cells or truncate silently.
- `striped: false` renders all rows with the same background — use this for dense tables where alternating color feels distracting.
- Long cell text wraps within its column. There is no horizontal scrolling; narrow columns may cause tight wrapping on small screens.
- Column widths distribute evenly. There is no per-column width control.
