# GlassBarChart

Horizontal bar chart with labeled rows. Each bar fills proportionally to the maximum value in the dataset. Good for comparing categories — revenue by product, traffic by source, scores by dimension. **Pro tier only.**

**IMPORTANT:** Chart data is passed as an inline `items` array property — NOT as separate child components. There is no `GlassBarChartItem` component.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| items | array of {label, value} | yes | — | Data rows; bars scale relative to the maximum value |
| label | string | no | — | Chart title displayed above the bars |
| suffix | string | no | — | Unit appended to each bar's value label (e.g. "%" or "k") |

Each item object:

| Key | Type | Description |
|-----|------|-------------|
| label | string | Row label on the left |
| value | number | Numeric value (determines bar width) |

## Example

Traffic sources:

```json
{"id":"traffic","component":"GlassBarChart","label":"Traffic by source","items":[{"label":"Organic","value":4821},{"label":"Direct","value":3104},{"label":"Referral","value":1892},{"label":"Social","value":987},{"label":"Email","value":543}]}
```

Quiz scores with percentage suffix:

```json
{"id":"scores","component":"GlassBarChart","label":"Section scores","suffix":"%","items":[{"label":"Reading","value":88},{"label":"Writing","value":74},{"label":"Math","value":91},{"label":"Science","value":67}]}
```

## Full Card Example

Monthly revenue breakdown by product line:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"revenue","title":"Revenue breakdown"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","chart","total"]},{"id":"hdr","component":"GlassHeader","title":"Revenue by product","subtitle":"February 2026 - All figures in USD"},{"id":"chart","component":"GlassBarChart","label":"Product revenue","suffix":"k","items":[{"label":"Starter plan","value":18},{"label":"Growth plan","value":41},{"label":"Enterprise plan","value":67},{"label":"Add-ons","value":12},{"label":"Professional services","value":8}]},{"id":"total","component":"GlassStat","value":"$146k","label":"Total revenue","trend":"up","delta":"+11% MoM"}]}}
```

## Notes

- Bars scale relative to the item with the highest value — you do not need to normalize data.
- Items are rendered in the order provided.
- `value` must be a non-negative number. Negative values are clamped to 0.
- `suffix` is appended to the displayed value with no space. Include a leading space in the string if you want separation (e.g. `" USD"`).
- There is no color customization; the bar color follows the Telegram theme accent.
