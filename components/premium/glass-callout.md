# GlassCallout

Alert or notice banner with a colored left border. Use to draw attention to important information, warnings, or status messages inside a card. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| text | string | yes | — | The message to display inside the callout |
| variant | "info"\|"success"\|"warning"\|"danger" | no | "info" | Color scheme of the callout |

Variant colors:

| Variant | Use case |
|---------|----------|
| `info` | Neutral information, tips, context |
| `success` | Confirmation, completed actions |
| `warning` | Caution, reversible risks |
| `danger` | Errors, irreversible actions, critical alerts |

## Example

```json
{"id":"note","component":"GlassCallout","text":"Your trial expires in 3 days. Upgrade to keep your data.","variant":"warning"}
```

```json
{"id":"ok","component":"GlassCallout","text":"Payment processed successfully. Your Pro plan is now active.","variant":"success"}
```

```json
{"id":"err","component":"GlassCallout","text":"Could not connect to your calendar. Check your OAuth permissions.","variant":"danger"}
```

## Full Card Example

Account status card with contextual callout:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"account-status","title":"Account status"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","warn","seats","storage","tip","manage"]},{"id":"hdr","component":"GlassHeader","title":"Your account","subtitle":"Acme Corp · Pro plan"},{"id":"warn","component":"GlassCallout","text":"Your Pro subscription renews on March 28. Ensure your payment method is up to date.","variant":"warning"},{"id":"seats","component":"GlassStat","value":"12 / 25","label":"Seats used","trend":"neutral"},{"id":"storage","component":"GlassProgress","value":62,"label":"Storage used","suffix":"% of 50 GB"},{"id":"tip","component":"GlassCallout","text":"Tip: you can export all your data at any time from Settings → Data export.","variant":"info"},{"id":"manage","component":"GlassButton","variant":"filled","children":["manage-label"],"action":{"name":"billing"}},{"id":"manage-label","component":"Text","text":"Manage billing","variant":"body"}]}}
```

## Notes

- `text` is plain text only; no markdown or HTML rendering.
- Callouts are not interactive — they have no click or dismiss behavior.
- For a full-width notice at the top of a form, place the GlassCallout before the first input component.
