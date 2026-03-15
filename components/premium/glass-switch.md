# GlassSwitch

Toggle switch with a label. Visually distinct from GlassCheckbox — use for settings-style on/off controls rather than consent fields. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| label | string | yes | — | Label displayed to the left of the switch |
| value | boolean or {path} | no | false | On/off state; use `{path: "/field"}` for data binding |

## Data Binding

Set `value` to `{path: "/fieldName"}` to bind the toggle state to a data model field. Seed `true` or `false` in `updateDataModel`.

```json
{"version":"v0.9","updateDataModel":{"value":{"notifications":true,"darkMode":false}}}
```

```json
{"id":"notifications","component":"GlassSwitch","label":"Push notifications","value":{"path":"/notifications"}}
```

## Example

```json
{"id":"darkMode","component":"GlassSwitch","label":"Dark mode","value":{"path":"/darkMode"}}
```

## Full Card Example

Preferences panel:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"notif-prefs","title":"Notification preferences"}}
{"version":"v0.9","updateDataModel":{"value":{"orders":true,"promotions":false,"reminders":true,"weekly_digest":false}}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","orders","promotions","reminders","digest","save"]},{"id":"hdr","component":"GlassHeader","title":"Notification settings","subtitle":"Choose what you hear about"},{"id":"orders","component":"GlassSwitch","label":"Order updates","value":{"path":"/orders"}},{"id":"promotions","component":"GlassSwitch","label":"Promotions and discounts","value":{"path":"/promotions"}},{"id":"reminders","component":"GlassSwitch","label":"Event reminders","value":{"path":"/reminders"}},{"id":"digest","component":"GlassSwitch","label":"Weekly digest","value":{"path":"/weekly_digest"}},{"id":"save","component":"GlassButton","variant":"filled","children":["save-label"],"action":{"name":"submit"}},{"id":"save-label","component":"Text","text":"Save preferences","variant":"body"}]}}
```

## Notes

- The data model field is `true` or `false` (boolean).
- GlassSwitch and GlassCheckbox both produce boolean values — the choice is purely visual. Use GlassSwitch for settings, GlassCheckbox for forms and consent.
