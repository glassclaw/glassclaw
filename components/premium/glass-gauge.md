# GlassGauge

Circular progress ring with a centered value label. Good for capacity, completion percentage, or any single metric that belongs on a scale. Works well inside GlassBento. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| value | number | yes | — | Current value to display and fill the ring |
| min | number | no | 0 | Minimum value (empty ring) |
| max | number | no | 100 | Maximum value (full ring) |
| label | string | no | — | Text shown below the ring |
| suffix | string | no | "%" | Unit appended to the centered value (e.g. "%" or "°C") |
| span | number | no | 1 | Grid column span inside GlassBento |

## Example

CPU usage:

```json
{"id":"cpu","component":"GlassGauge","value":73,"label":"CPU","suffix":"%"}
```

Temperature with custom range:

```json
{"id":"temp","component":"GlassGauge","value":68,"min":0,"max":120,"label":"Engine temp","suffix":"°C"}
```

Wide gauge (full bento row):

```json
{"id":"capacity","component":"GlassGauge","value":840,"min":0,"max":1000,"label":"Storage used","suffix":" MB","span":2}
```

## Full Card Example

Server health dashboard:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"server-health","title":"Server health"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","bento"]},{"id":"hdr","component":"GlassHeader","title":"api-prod-1","subtitle":"Region: eu-west-1"},{"id":"cpu","component":"GlassGauge","value":73,"label":"CPU","suffix":"%"},{"id":"mem","component":"GlassGauge","value":58,"label":"Memory","suffix":"%"},{"id":"disk","component":"GlassGauge","value":41,"label":"Disk","suffix":"%"},{"id":"net","component":"GlassGauge","value":12,"max":100,"label":"Network","suffix":" Mbps"},{"id":"uptime","component":"GlassStat","value":"99.98%","label":"Uptime (30d)","trend":"up","span":2},{"id":"bento","component":"GlassBento","children":["cpu","mem","disk","net","uptime"]}]}}
```

## Notes

- The ring fills proportionally: `(value - min) / (max - min)`.
- `suffix` is appended directly to the displayed value with no space — include a leading space if needed (e.g. `" MB"`).
- Values outside `[min, max]` are clamped; no error is thrown.
- `span` only has effect when GlassGauge is a child of GlassBento.
