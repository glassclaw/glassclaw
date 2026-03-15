# GlassCard

Card container with structured header content (image, title, subtitle, badge) and an optional children area for interactive components. On Pro, card children can include buttons and form inputs. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| children | array of strings | no | — | Component IDs to render inside the card body |
| image | string | no | — | URL of an image displayed at the top of the card |
| title | string | no | — | Card title in the header |
| subtitle | string | no | — | Secondary text below the title |
| badge | string | no | — | Short label rendered as a pill badge in the top-right corner |

## Example

Product listing card:

```json
{"id":"product","component":"GlassCard","image":"https://cdn.example.com/headphones.jpg","title":"Studio Pro Headphones","subtitle":"Wireless · 40h battery · ANC","badge":"In stock"}
```

Card with interactive children:

```json
{"id":"qty","component":"GlassInput","label":"Quantity","value":{"path":"/qty"},"inputType":"number"}
{"id":"buy","component":"GlassButton","variant":"filled","children":["buy-label"],"action":{"name":"addToCart"}}
{"id":"buy-label","component":"Text","text":"Add to cart","variant":"body"}
{"id":"product","component":"GlassCard","title":"Studio Pro Headphones","subtitle":"$129.00","badge":"Sale","children":["qty","buy"]}
```

## Full Card Example

Job listing with apply action:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"job-listing","title":"Job listing"}}
{"version":"v0.9","updateDataModel":{"value":{"cover_letter":"","start_date":""}}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","job"]},{"id":"hdr","component":"GlassHeader","title":"Open position","subtitle":"Applications close March 28"},{"id":"cover","component":"GlassTextarea","label":"Cover letter","value":{"path":"/cover_letter"},"placeholder":"Tell us why you're a great fit...","rows":5},{"id":"start","component":"GlassInput","label":"Earliest start date","value":{"path":"/start_date"},"placeholder":"e.g. April 1, 2026"},{"id":"apply_btn","component":"GlassButton","variant":"filled","children":["apply_btn-label"],"action":{"name":"submit"}},{"id":"apply_btn-label","component":"Text","text":"Submit application","variant":"body"},{"id":"job","component":"GlassCard","image":"https://cdn.example.com/office.jpg","title":"Senior Backend Engineer","subtitle":"Remote · Full-time · $140k-$180k","badge":"New","children":["cover","start","apply_btn"]}]}}
```

## Notes

- `image` should be a publicly accessible HTTPS URL. The image is displayed at natural aspect ratio; very tall images are cropped.
- `badge` is short — keep it under 12 characters for the pill to render neatly.
- Children are rendered in the order provided inside the card body, below the header content.
- A GlassCard with no `title`, `subtitle`, `image`, or `badge` renders as a plain bordered container for its children.
