# GlassBento

CSS Grid bento layout container. Arranges children in a responsive 2-column grid. Children can set `span: 2` to take the full row width. Best used with GlassStat and GlassGauge for dashboard cards. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| children | array of strings | yes | — | Ordered list of component IDs to place in the grid |

## Child span control

Any child component that has a `span` property set to `2` takes the full grid row width. A `span` of `1` (or no `span`) places the component in one column (half width).

Components that support `span`: GlassStat, GlassGauge.

## Example

Four stats in a 2×2 grid:

```json
{"id":"bento","component":"GlassBento","children":["stat1","stat2","stat3","stat4"]}
```

Mixed layout — two half-width stats then one full-width stat:

```json
{"id":"s1","component":"GlassStat","value":"1,240","label":"Orders","trend":"up","delta":"+5%"}
{"id":"s2","component":"GlassStat","value":"98.2%","label":"Uptime","trend":"neutral"}
{"id":"s3","component":"GlassStat","value":"$82,400","label":"Revenue this month","trend":"up","delta":"+18%","span":2}
{"id":"bento","component":"GlassBento","children":["s1","s2","s3"]}
```

## Full Card Example

E-commerce operations dashboard:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"ops-dashboard","title":"Operations dashboard"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","bento"]},{"id":"hdr","component":"GlassHeader","title":"Today's snapshot","subtitle":"Live - refreshes every 5 min"},{"id":"orders","component":"GlassStat","value":"284","label":"Orders","trend":"up","delta":"+32"},{"id":"returns","component":"GlassStat","value":"7","label":"Returns","trend":"down","delta":"-2"},{"id":"fulfil","component":"GlassGauge","value":91,"label":"Fulfillment","suffix":"%"},{"id":"sla","component":"GlassGauge","value":78,"label":"SLA met","suffix":"%"},{"id":"revenue","component":"GlassStat","value":"$14,820","label":"Revenue today","trend":"up","delta":"+11% vs yesterday","span":2},{"id":"bento","component":"GlassBento","children":["orders","returns","fulfil","sla","revenue"]}]}}
```

## Notes

- Children are rendered in the order provided.
- Components not listed in `children` are ignored by GlassBento but still exist in the component tree — they will not render unless also listed in the top-level `updateComponents` array and referenced somewhere else.
- To avoid double-rendering, only list each child ID in one place: either as a GlassBento child or as a top-level component, not both.
- An odd number of `span: 1` children leaves the last grid cell empty — place a `span: 2` child last to fill the row.
