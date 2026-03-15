# GlassProgress

Horizontal progress bar showing a value against a maximum. Use for completion status, quota usage, or any linear scale where you want a single visual indicator. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| value | number | yes | — | Current value; fills the bar proportionally against 100 (or use min/max pattern via 0–100 scaling) |
| label | string | no | — | Text shown above the bar |
| suffix | string | no | "%" | Unit appended to the displayed value |

The bar fills to `value / 100` of the total width. To represent a value on a non-100 scale, convert to percentage before passing (e.g. 34/50 → pass `68`).

## Example

Course completion:

```json
{"id":"progress","component":"GlassProgress","value":68,"label":"Course completion","suffix":"%"}
```

Storage quota (pre-converted to percentage):

```json
{"id":"storage","component":"GlassProgress","value":74,"label":"Storage used","suffix":"% of 10 GB"}
```

Raw count with custom suffix (value must still be 0–100):

```json
{"id":"tasks","component":"GlassProgress","value":40,"label":"Tasks completed","suffix":" of 10"}
```

## Full Card Example

Onboarding checklist progress summary:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"onboarding","title":"Onboarding progress"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","overall","profile","integration","team","cta"]},{"id":"hdr","component":"GlassHeader","title":"Getting started","subtitle":"Complete these steps to activate your account"},{"id":"overall","component":"GlassProgress","value":60,"label":"Overall progress","suffix":"%"},{"id":"profile","component":"GlassProgress","value":100,"label":"Profile setup","suffix":"%"},{"id":"integration","component":"GlassProgress","value":50,"label":"Integrations","suffix":"%"},{"id":"team","component":"GlassProgress","value":0,"label":"Team members invited","suffix":"%"},{"id":"cta","component":"GlassButton","variant":"filled","children":["cta-label"],"action":{"name":"continue"}},{"id":"cta-label","component":"Text","text":"Continue setup","variant":"body"}]}}
```

## Notes

- `value` is always treated as a 0–100 scale. Convert to percentage before passing.
- Values above 100 render a full bar (no overflow). Values below 0 render an empty bar.
- A value of 100 renders the bar fully filled in the accent color.
