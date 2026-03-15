# GlassHeader

Page or section header with a prominent title and optional subtitle. Styled to match the Telegram theme.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| title | string | yes | — | Main heading text |
| subtitle | string | no | — | Secondary line beneath the title |

## Example

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"daily-summary","title":"Daily Summary"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["page-header","divider-1","body-text"]},{"id":"page-header","component":"GlassHeader","title":"Daily Summary","subtitle":"Thursday, 14 March 2026"},{"id":"divider-1","component":"Divider"},{"id":"body-text","component":"Text","text":"Here is what happened today.","variant":"body"}]}}
```

## Notes

- GlassHeader is typically the first component in a page's root Column, above a Divider.
- It is not a form field — it emits no events and accepts no actions.
- For sub-section headings within a page, a `Text` with `variant: "h3"` is usually sufficient. Use GlassHeader once per page for the page-level title.
