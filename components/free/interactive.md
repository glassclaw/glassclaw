# Interactive: GlassButton, GlassNavigator, GlassCarousel

Components for user interaction, navigation, and multi-page layout.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## GlassButton

Themed button. Content is composed from child components (typically a Text, or an Icon + Text Row).

### Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| children | array of string | yes | — | Component IDs rendered inside the button |
| variant | string | no | "filled" | Visual style: "filled", "outlined", "text" |
| action | object | no | — | What happens when tapped — see Action below |

### Action object

For form submission (fires a named server event):
```json
{ "name": "submit_form" }
```

For in-surface navigation:
```json
{ "functionCall": { "call": "navigateTo", "args": { "surfaceId": "page-id" } } }
```

## GlassNavigator

Wraps any component and makes it tappable. **This is the standard way to build list-to-detail navigation.** When showing a list of items where each item has more content (emails, orders, products, files), wrap each GlassListItem in a GlassNavigator that navigates to a detail surface.

See `{baseDir}/templates/list-with-details.md` for a complete multi-page example.

### Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| child | string | yes | — | ID of the single component to wrap |
| action | object | yes | — | Navigation action: `{"functionCall":{"call":"navigateTo","args":{"surfaceId":"detail-page"}}}` |

### Pattern: List item with detail navigation

```json
{"id":"nav-item","component":"GlassNavigator","child":"item-row","action":{"functionCall":{"call":"navigateTo","args":{"surfaceId":"item-detail"}}}},
{"id":"item-row","component":"GlassListItem","primary":"Item title","secondary":"Tap to view details","icon":"chevron_right"}
```

## GlassCarousel

Swipeable pages with dot indicators. Each direct child is a full page.

### Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| children | array of string | yes | — | Component IDs — each is a separate swipeable page |

## Example: Filled submit button

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"submit-example","title":"Submit Example"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["btn-submit"]},{"id":"btn-submit","component":"GlassButton","variant":"filled","children":["btn-submit-label"],"action":{"name":"submit_form"}},{"id":"btn-submit-label","component":"Text","text":"Submit","variant":"body"}]}}
```

## Example: Outlined navigation button

```json
{
  "id": "btn-next",
  "component": "GlassButton",
  "variant": "outlined",
  "children": ["btn-next-label"],
  "action": {
    "functionCall": { "call": "navigateTo", "args": { "surfaceId": "page-2" } }
  }
},
{
  "id": "btn-next-label",
  "component": "Text",
  "text": "Next",
  "variant": "body"
}
```

## Example: Button with icon and text

```json
{
  "id": "btn-icon-row",
  "component": "Row",
  "children": ["ic-send", "lbl-send"],
  "align": "center"
},
{
  "id": "ic-send",
  "component": "Icon",
  "name": "send"
},
{
  "id": "lbl-send",
  "component": "Text",
  "text": "Send Report",
  "variant": "body"
},
{
  "id": "btn-send",
  "component": "GlassButton",
  "variant": "filled",
  "children": ["btn-icon-row"],
  "action": { "name": "send_report" }
}
```

## Example: 3-page GlassCarousel

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"onboarding","title":"Getting Started"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"GlassCarousel","children":["page-1","page-2","page-3"]},{"id":"page-1","component":"Column","children":["p1-heading","p1-body"]},{"id":"p1-heading","component":"Text","text":"Step 1: Overview","variant":"h2"},{"id":"p1-body","component":"Text","text":"Swipe to continue.","variant":"body"},{"id":"page-2","component":"Column","children":["p2-heading","p2-body"]},{"id":"p2-heading","component":"Text","text":"Step 2: Details","variant":"h2"},{"id":"p2-body","component":"Text","text":"Fill in the required fields.","variant":"body"},{"id":"page-3","component":"Column","children":["p3-heading","p3-btn"]},{"id":"p3-heading","component":"Text","text":"Step 3: Confirm","variant":"h2"},{"id":"p3-btn","component":"GlassButton","variant":"filled","children":["p3-btn-label"],"action":{"name":"confirm"}},{"id":"p3-btn-label","component":"Text","text":"Confirm","variant":"body"}]}}
```

## Notes

- GlassButton's `children` are rendered inside the button element — do not nest buttons.
- `variant: "text"` renders a button with no background or border, suitable for low-emphasis actions like "Cancel".
- GlassNavigator is for wrapping non-button components (e.g. a GlassListItem) so they respond to taps. Do not nest GlassNavigator inside GlassButton.
- GlassCarousel renders dot indicators automatically. The number of dots equals the number of children.
- Each child of GlassCarousel should be a Column (or other container) — the child fills the full carousel viewport.
