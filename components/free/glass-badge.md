# GlassBadge

Small colored pill used to convey status, category, or priority at a glance.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| text | string | yes | — | Label text displayed inside the badge |
| variant | string | no | "neutral" | Color scheme: "success", "warning", "danger", "info", "neutral" |

## Example

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"badge-demo","title":"Status Badges"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["badge-success","badge-warning","badge-danger","badge-info","badge-neutral"]},{"id":"badge-success","component":"GlassBadge","text":"Completed","variant":"success"},{"id":"badge-warning","component":"GlassBadge","text":"Pending Review","variant":"warning"},{"id":"badge-danger","component":"GlassBadge","text":"Failed","variant":"danger"},{"id":"badge-info","component":"GlassBadge","text":"New","variant":"info"},{"id":"badge-neutral","component":"GlassBadge","text":"Draft","variant":"neutral"}]}}
```

## Notes

- GlassBadge is an inline display element — it sizes to its text content.
- Place it in a Row alongside a Text or GlassListItem `trailing` area for status columns.
- GlassCard accepts a `badge` string property that renders a GlassBadge in the card's top-right corner — use that instead of manually composing a badge over a card.
- Keep badge text short (1–2 words). Long strings will overflow the pill on narrow screens.
