# GlassStat

Single-number display with a label and an optional trend indicator. Designed to be placed inside GlassBento for dashboard layouts. Works standalone but looks best in a grid. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| value | string | yes | — | The primary number or text to display prominently |
| label | string | yes | — | Descriptor shown below the value |
| trend | "up"\|"down"\|"neutral" | no | — | Trend arrow direction; omit if not relevant |
| delta | string | no | — | Change indicator shown next to the trend arrow (e.g. "+12%" or "−3") |
| span | number | no | 1 | Grid column span inside GlassBento (1 = half width, 2 = full width) |

## Example

```json
{"id":"revenue","component":"GlassStat","value":"$48,200","label":"Monthly revenue","trend":"up","delta":"+8%"}
```

```json
{"id":"churn","component":"GlassStat","value":"2.1%","label":"Churn rate","trend":"down","delta":"−0.4pp"}
```

Wide stat (full bento row):

```json
{"id":"arr","component":"GlassStat","value":"$578,400","label":"Annual recurring revenue","trend":"up","delta":"+22% YoY","span":2}
```

## Full Card Example

SaaS metrics dashboard inside GlassBento:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"biz-metrics","title":"Business metrics"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","bento"]},{"id":"hdr","component":"GlassHeader","title":"This month","subtitle":"Updated 5 minutes ago"},{"id":"mrr","component":"GlassStat","value":"$48,200","label":"MRR","trend":"up","delta":"+8%"},{"id":"users","component":"GlassStat","value":"3,841","label":"Active users","trend":"up","delta":"+142"},{"id":"churn","component":"GlassStat","value":"2.1%","label":"Churn","trend":"down","delta":"-0.4pp"},{"id":"nps","component":"GlassStat","value":"67","label":"NPS score","trend":"neutral"},{"id":"arr","component":"GlassStat","value":"$578,400","label":"ARR","trend":"up","delta":"+22% YoY","span":2},{"id":"bento","component":"GlassBento","children":["mrr","users","churn","nps","arr"]}]}}
```

## Notes

- `value` is a string — format numbers, currencies, and percentages before passing (e.g. `"$48,200"` not `48200`).
- `trend` color: `"up"` renders green, `"down"` renders red. Use `"neutral"` for grey with no arrow.
- `delta` is rendered as-is; include the sign character in the string (`+`, `−`, `↑`).
- `span` only has effect when GlassStat is a child of GlassBento.
