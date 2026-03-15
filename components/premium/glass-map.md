# GlassMap

Google Maps embed with a location pin and optional metadata (name, address, distance, rating, hours). Opens the native maps app when tapped. Good for venue, delivery, or appointment cards. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| latitude | number | yes | — | Decimal latitude of the location |
| longitude | number | yes | — | Decimal longitude of the location |
| zoom | number | no | 15 | Map zoom level (1 = world, 20 = building) |
| label | string | no | — | Location name displayed above the map |
| address | string | no | — | Street address shown below the label |
| distance | string | no | — | Distance from user (pre-calculated by agent, e.g. "0.3 km") |
| rating | string | no | — | Rating string (e.g. "4.7 ★") |
| hours | string | no | — | Operating hours (e.g. "Open · closes 22:00") |

## Example

Restaurant location:

```json
{"id":"map","component":"GlassMap","latitude":51.5074,"longitude":-0.1278,"zoom":16,"label":"The Ivy","address":"1–5 West St, London WC2H 9NQ","distance":"0.4 km","rating":"4.6 ★","hours":"Open · closes 23:00"}
```

Delivery drop point (minimal):

```json
{"id":"map","component":"GlassMap","latitude":48.8566,"longitude":2.3522,"label":"Delivery address","address":"12 Rue de Rivoli, Paris"}
```

## Full Card Example

Restaurant recommendation card:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"reservation","title":"Tonight's reservation"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","map","note","cancel"]},{"id":"hdr","component":"GlassHeader","title":"Your table is confirmed","subtitle":"Friday 14 March - 19:30 - 2 guests"},{"id":"map","component":"GlassMap","latitude":51.5033,"longitude":-0.1196,"zoom":16,"label":"Aqua Shard","address":"Level 31, The Shard, 31 St Thomas St, London SE1 9RY","distance":"1.2 km","rating":"4.5","hours":"Open - closes 01:00"},{"id":"note","component":"GlassCallout","text":"Mention your booking reference (REF-7829) at the host desk.","variant":"info"},{"id":"cancel","component":"GlassButton","variant":"outlined","children":["cancel-label"],"action":{"name":"cancel"}},{"id":"cancel-label","component":"Text","text":"Cancel reservation","variant":"body"}]}}
```

## Notes

- Tapping the map opens the device's default maps application with the coordinates pre-filled.
- `zoom` 15 is appropriate for neighborhood context; 17–18 for precise building location; 12–13 for city overview.
- `distance`, `rating`, and `hours` are purely display strings — the agent calculates them before building the payload.
- Requires an active internet connection to load the map tile.
