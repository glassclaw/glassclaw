# GlassCard

GlassCard is available on both Free and Pro tiers. On Free tier, cards are display-only (no action buttons). On Pro tier, cards can include interactive children.

Elevated card container with an optional header image, title, subtitle, status badge, and body content.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| children | array of string | no | — | Component IDs rendered in the card body |
| image | string | no | — | URL of a header image displayed at the top of the card |
| title | string | no | — | Card title |
| subtitle | string | no | — | Smaller text beneath the title |
| badge | string | no | — | Short label shown as a badge in the top-right corner of the card |

## Example

A simple display card with a title, subtitle, and a text body — suitable for free tier.

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"sales-report","title":"Q1 Sales Report"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["summary-card"]},{"id":"summary-card","component":"GlassCard","title":"Q1 Sales Report","subtitle":"January – March 2026","badge":"Final","children":["card-body"]},{"id":"card-body","component":"Text","text":"Total revenue exceeded target by 12%. Three regions outperformed projections. Full breakdown available on request.","variant":"body"}]}}
```

## Example: Card with header image

```json
{
  "id": "product-card",
  "component": "GlassCard",
  "image": "https://example.com/product.jpg",
  "title": "Wireless Headphones",
  "subtitle": "Model XR-200",
  "badge": "In Stock",
  "children": ["product-desc"]
},
{
  "id": "product-desc",
  "component": "Text",
  "text": "40-hour battery life. Active noise cancellation. USB-C charging.",
  "variant": "body"
}
```

## Notes

- All properties are optional — a card with only `children` renders as a plain elevated surface.
- On the free tier, do not place GlassButton or other interactive components inside `children`. The card will render, but interactive children are a Pro-tier feature.
- `badge` renders a GlassBadge in the top-right corner of the card. It is a convenience shorthand — you do not need to add a separate GlassBadge component.
- Cards can be nested inside a GlassCarousel to create a swipeable card deck.
