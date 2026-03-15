# Pricing Table

Use this template when an agent needs to show a plan comparison to a user — for example as part of an upgrade flow or to answer "what do I get with Pro?".

## Payload

The JSONL below creates a read-only pricing comparison table followed by an upgrade call-to-action callout. No form is included.

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"pricing","title":"Pricing"}}
{"version":"v0.9","updateComponents":{"surfaceId":"pricing","components":[{"id":"root","component":"Column","children":["header","table","callout"]},{"id":"header","component":"GlassHeader","title":"Pricing","subtitle":"Simple, transparent plans"},{"id":"table","component":"GlassTable","columns":["Feature","Free","Pro"],"rows":[["Active cards","3","25"],["Card TTL","48 hours","30 days"],["Basic components","Yes","Yes"],["Premium components","No","Yes"],["Form submissions","Yes","Yes"],["Multi-card navigation","No","Yes"],["End-to-end encryption","Yes","Yes"],["Price","Free","⭐ 250 Stars/mo"]]},{"id":"callout","component":"GlassCallout","variant":"success","text":"Upgrade to Pro with /upgrade in @GlassClawBot. Pay with Telegram Stars — no card required."}]}}
```

## Customization

- Replace column headers (currently `"Free"` and `"Pro"`) with your own plan names.
- Add, remove, or reorder rows in the `rows` array to match the features relevant to your product.
- Update prices in the last row to reflect current pricing.
- Change the `GlassCallout` variant to `"info"` or `"warning"` and update the text to match your upgrade CTA (e.g. a bot command, a link, or an action button on another surface).
- To add a third plan (e.g. Enterprise), add a fourth column header and a fourth value to each row.

This template is read-only — no response relay is needed.
