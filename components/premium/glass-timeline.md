# GlassTimeline

Vertical event timeline with status indicators. Each item shows a title, optional description, optional timestamp, and a status dot. Good for order tracking, project milestones, or process flows. **Pro tier only.**

**IMPORTANT:** Timeline items are passed as an inline `items` array property — NOT as separate child components. There is no `GlassTimelineItem` component. Do NOT use `children` on GlassTimeline.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| label | string | no | — | Timeline title displayed above the first item |
| items | array of item objects | yes | — | Ordered list of timeline events (top = most recent or first step) |

Each item object:

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| title | string | yes | Event title |
| description | string | no | Additional detail below the title |
| time | string | no | Timestamp or date string (displayed as-is) |
| status | "complete"\|"active"\|"pending" | no | Status indicator style |

Status styles:

| Status | Indicator |
|--------|-----------|
| `complete` | Filled dot (accent color) |
| `active` | Pulsing dot (accent color) |
| `pending` | Empty/muted dot |

## Example

```json
{"id":"timeline","component":"GlassTimeline","label":"Order status","items":[
  {"title":"Delivered","description":"Left with neighbour at door","time":"14 Mar, 14:22","status":"complete"},
  {"title":"Out for delivery","time":"14 Mar, 09:15","status":"complete"},
  {"title":"Dispatched","description":"Shipped from London warehouse","time":"13 Mar, 18:40","status":"complete"},
  {"title":"Processing","time":"13 Mar, 10:05","status":"complete"},
  {"title":"Order placed","time":"12 Mar, 22:31","status":"complete"}
]}
```

Project milestone view with an active step:

```json
{"id":"milestones","component":"GlassTimeline","label":"Project phases","items":[
  {"title":"Discovery","description":"Requirements gathered and signed off","time":"Jan 2026","status":"complete"},
  {"title":"Design","description":"Wireframes approved","time":"Feb 2026","status":"complete"},
  {"title":"Development","description":"Sprint 3 of 5 in progress","time":"Mar 2026","status":"active"},
  {"title":"QA & Testing","time":"Apr 2026","status":"pending"},
  {"title":"Launch","time":"May 2026","status":"pending"}
]}
```

## Full Card Example

Order tracking card:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"order-track","title":"Track your order"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","eta","timeline","contact"]},{"id":"hdr","component":"GlassHeader","title":"Order #48291","subtitle":"Estimated delivery: today by 18:00"},{"id":"eta","component":"GlassStat","value":"Today","label":"Estimated delivery","trend":"neutral"},{"id":"timeline","component":"GlassTimeline","label":"Shipment events","items":[{"title":"Out for delivery","description":"Driver: Alex - 3 stops ahead","time":"Today, 09:15","status":"active"},{"title":"Arrived at local depot","description":"Barking delivery centre","time":"Today, 06:42","status":"complete"},{"title":"In transit","description":"En route from Birmingham hub","time":"Yesterday, 23:10","status":"complete"},{"title":"Dispatched","description":"Picked and packed","time":"Yesterday, 16:05","status":"complete"},{"title":"Order placed","time":"12 Mar, 22:31","status":"complete"}]},{"id":"contact","component":"GlassButton","variant":"outlined","children":["contact-label"],"action":{"name":"support"}},{"id":"contact-label","component":"Text","text":"Contact support","variant":"body"}]}}
```

## Notes

- Items are rendered top-to-bottom in the order provided. Choose ordering that makes sense for your use case (most-recent-first for tracking, chronological for milestones).
- `time` is a display string — format it however is clearest for the user.
- Only one item should have `status: "active"` at a time.
- Items with no `status` field render the same as `"pending"`.
