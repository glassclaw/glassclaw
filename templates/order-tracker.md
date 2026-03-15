# Order Tracker

Use this template when an agent needs to show a user the current status of an order, shipment, or multi-step workflow as a visual timeline. No form is included.

## Payload

The JSONL below creates an order status card with a five-step timeline and a callout showing order details. Mark the appropriate step as active/completed and supply real order data before posting.

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"order","title":"Order Status"}}
{"version":"v0.9","updateComponents":{"surfaceId":"order","components":[{"id":"root","component":"Column","children":["header","tl-status","callout"]},{"id":"header","component":"GlassHeader","title":"Order Status","subtitle":"Order #GC-20481"},{"id":"tl-status","component":"GlassTimeline","label":"Order Progress","items":[{"title":"Order Placed","description":"Mar 14 at 09:12","status":"complete"},{"title":"Confirmed","description":"Mar 14 at 09:15","status":"complete"},{"title":"Preparing","description":"Mar 14 at 10:30","status":"active"},{"title":"Out for Delivery","description":"Estimated 14:00–16:00","status":"pending"},{"title":"Delivered","status":"pending"}]},{"id":"callout","component":"GlassCallout","variant":"info","text":"Your order is being prepared at the store. You'll receive a notification when it's on its way."}]}}
```

## Customization

- Update the `GlassHeader` subtitle with the real order number.
- For each item in the `GlassTimeline` `items` array, set:
  - `title` — step name (e.g. "Confirmed", "Shipped", "Delivered")
  - `description` — timestamp or estimated time window (optional)
  - `status` — one of `"complete"`, `"active"`, or `"pending"`
- Only one step should be `"active"` at a time. All steps before it should be `"complete"`; all after should be `"pending"`.
- Update the `GlassCallout` text with the current status message relevant to the active step.
- Add or remove entries in the `items` array to match your workflow (e.g. a digital delivery might have fewer steps).

This template is read-only — no response relay is needed.
