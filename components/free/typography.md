# Typography: Text, Icon, Image

Core display primitives for text content, iconography, and images.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Text

Renders a string with variant-based styling.

### Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| text | string or {path: "/..."} | yes | — | The content to display. Use a string literal or a data-binding path object. |
| variant | string | no | "body" | Visual style: "h1", "h2", "h3", "body", "caption" |

## Icon

Renders a Material Symbols Outlined icon.

### Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| name | string | yes | — | Material Symbol name (e.g. "search", "settings", "home", "check_circle") |

## Image

Displays an image from a URL.

### Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| url | string | yes | — | Full URL of the image to display |
| fit | string | no | "cover" | How the image fills its container: "cover", "contain", "fill" |

## Example

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"order-confirmed","title":"Order Confirmed"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hero-image","heading","subheading","status-icon","caption-text"]},{"id":"hero-image","component":"Image","url":"https://example.com/banner.jpg","fit":"cover"},{"id":"heading","component":"Text","text":"Order Confirmed","variant":"h1"},{"id":"subheading","component":"Text","text":"Your request is being processed.","variant":"h3"},{"id":"status-icon","component":"Icon","name":"check_circle"},{"id":"caption-text","component":"Text","text":"Estimated delivery: 2–3 business days","variant":"caption"}]}}
```

### Data-bound Text

Bind Text content to a data model value using `updateDataModel` and a path object:

```jsonl
{"version":"v0.9","updateDataModel":{"value":{"user":{"name":"Alice"}}}}
```

Then reference the data-bound value in a component:

```json
{"id":"greeting","component":"Text","text":{"path":"/user/name"},"variant":"h2"}
```

## Notes

- Icon names come from [Material Symbols](https://fonts.google.com/icons). Use the exact symbol name as shown in the catalogue (underscores, lowercase).
- `variant` controls semantic heading level and font sizing — use it consistently so surfaces have visual hierarchy.
- For Image, `contain` preserves the full image without cropping; `cover` fills the container and may crop edges.
- Images are not resized server-side. Use appropriately sized URLs to avoid slow loads on mobile connections.
