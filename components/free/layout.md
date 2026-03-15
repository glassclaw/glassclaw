# Layout: Column, Row, Divider

Primitive layout containers. Use these to arrange all other components on a surface.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Column

Flex column container. Children are stacked vertically.

### Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| children | array of string | yes | — | Component IDs to stack vertically |
| justify | string | no | "start" | Cross-axis distribution: "start", "center", "end", "between", "around" |
| align | string | no | "start" | Alignment: "start", "center", "end", "stretch" |

## Row

Flex row container. Children are laid out horizontally.

### Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| children | array of string | yes | — | Component IDs to lay out horizontally |
| justify | string | no | "start" | Cross-axis distribution: "start", "center", "end", "between", "around" |
| align | string | no | "start" | Alignment: "start", "center", "end", "stretch" |

## Divider

Horizontal or vertical line separator.

### Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| axis | string | no | "horizontal" | "horizontal" or "vertical" |

## Example

Column with a nested Row — a common pattern for a header row above body content.

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"dashboard","title":"Dashboard"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["header-row","divider-1","body-text"]},{"id":"header-row","component":"Row","children":["icon-home","page-title"],"align":"center"},{"id":"icon-home","component":"Icon","name":"home"},{"id":"page-title","component":"Text","text":"Dashboard","variant":"h2"},{"id":"divider-1","component":"Divider","axis":"horizontal"},{"id":"body-text","component":"Text","text":"Welcome back.","variant":"body"}]}}
```

## Notes

- The root of any surface must be a single component (typically a Column).
- `between` and `around` on `justify` are most useful in Row to space items across the full width.
- Use `align: "center"` on Row to vertically centre items like icon + label pairs.
- Divider respects the layout axis it is placed in — a Divider with `axis: "vertical"` inside a Row renders as a thin vertical rule.
