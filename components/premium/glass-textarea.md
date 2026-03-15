# GlassTextarea

Multi-line text input with a label above. Use when you need more than one line of freeform input. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| label | string | yes | — | Field label displayed above the textarea |
| value | string or {path} | no | "" | Current value; use `{path: "/field"}` for data binding |
| placeholder | string | no | — | Placeholder text shown when empty |
| hint | string | no | — | Helper text shown below the textarea |
| rows | number | no | 3 | Initial visible row height |

## Data Binding

Set `value` to `{path: "/fieldName"}` to bind to a data model field. Seed an empty string in `updateDataModel` so the field exists in the submission even if the user leaves it blank.

```json
{"version":"v0.9","updateDataModel":{"value":{"notes":""}}}
```

```json
{"id":"notes","component":"GlassTextarea","label":"Notes","value":{"path":"/notes"},"rows":5}
```

## Example

```json
{"id":"bio","component":"GlassTextarea","label":"Short bio","value":{"path":"/bio"},"placeholder":"Tell us about yourself...","hint":"Max 500 characters","rows":4}
```

## Full Card Example

Feedback form with open-ended questions:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"feedback","title":"Share your feedback"}}
{"version":"v0.9","updateDataModel":{"value":{"liked":"","improve":"","recommend":""}}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","liked","improve","recommend","submit"]},{"id":"hdr","component":"GlassHeader","title":"How did we do?","subtitle":"Your feedback helps us improve"},{"id":"liked","component":"GlassTextarea","label":"What did you like most?","value":{"path":"/liked"},"placeholder":"e.g. Fast delivery, friendly staff...","rows":3},{"id":"improve","component":"GlassTextarea","label":"What could we improve?","value":{"path":"/improve"},"placeholder":"Any suggestions...","rows":3},{"id":"recommend","component":"GlassTextarea","label":"Anything else to add?","value":{"path":"/recommend"},"rows":2},{"id":"submit","component":"GlassButton","variant":"filled","children":["submit-label"],"action":{"name":"submit"}},{"id":"submit-label","component":"Text","text":"Submit feedback","variant":"body"}]}}
```

## Notes

- `rows` sets the initial height; the textarea is resizable by the user.
- Long submissions are fine — the encrypted payload is base64 and there is no field-level size limit imposed by Glass Claw (surface payload limit applies in total).
