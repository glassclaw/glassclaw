# Stats Dashboard

Use this template when an agent needs to display a read-only metrics overview — for example a daily business summary, a system health snapshot, or a project status report. No form is included.

## Payload

The JSONL below creates a dashboard with a bento grid of stats and a gauge, a progress bar, and a bar chart. Replace all numeric values and labels before posting.

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"dash","title":"Dashboard"}}
{"version":"v0.9","updateComponents":{"surfaceId":"dash","components":[{"id":"root","component":"Column","children":["header","bento","progress","chart"]},{"id":"header","component":"GlassHeader","title":"Dashboard","subtitle":"Updated just now"},{"id":"bento","component":"GlassBento","children":["stat-revenue","stat-orders","stat-refunds","stat-users","gauge-load"]},{"id":"stat-revenue","component":"GlassStat","label":"Revenue","value":"$12,400","delta":"+8%","deltaPositive":true},{"id":"stat-orders","component":"GlassStat","label":"Orders","value":"348","delta":"+12","deltaPositive":true},{"id":"stat-refunds","component":"GlassStat","label":"Refunds","value":"7","delta":"-3","deltaPositive":true},{"id":"stat-users","component":"GlassStat","label":"New Users","value":"94","delta":"+21%","deltaPositive":true},{"id":"gauge-load","component":"GlassGauge","label":"Server Load","value":63,"max":100,"unit":"%"},{"id":"progress","component":"GlassProgress","label":"Monthly target","value":78,"max":100,"suffix":"%"},{"id":"chart","component":"GlassBarChart","label":"Orders by day","data":[{"label":"Mon","value":42},{"label":"Tue","value":58},{"label":"Wed","value":51},{"label":"Thu","value":67},{"label":"Fri","value":73},{"label":"Sat","value":39},{"label":"Sun","value":18}]}]}}
```

## Customization

- Replace each `GlassStat` `label`, `value`, `delta`, and `deltaPositive` with your actual metric names and values.
- Set `GlassGauge` `value` and `max` to match your metric (e.g. CPU %, queue depth).
- Update `GlassProgress` `label`, `value`, and `max` to reflect your target KPI.
- Replace `GlassBarChart` `data` array entries with your own time labels and values. The chart works with any number of bars.
- Change the `GlassHeader` subtitle to reflect the actual last-updated timestamp.

This template is read-only — no response relay is needed.
