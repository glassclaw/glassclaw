# GlassListItem

A single row with optional leading icon or avatar, primary and secondary text, and optional trailing content. Use to build menus, contact lists, settings screens, and data lists.

**For lists where items have detail views** (emails, orders, products), wrap each GlassListItem in a GlassNavigator and create a separate surface for each detail page. See `{baseDir}/templates/list-with-details.md` for the full pattern.

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| primary | string | yes | — | Main label text |
| secondary | string | no | — | Subtitle text beneath the primary label |
| icon | string | no | — | Material Symbol name for a leading icon. Mutually exclusive with `avatar`. |
| avatar | string | no | — | Image URL for a leading circular avatar. Mutually exclusive with `icon`. |
| trailing | string | no | — | Short text rendered on the right side (e.g. a count, status word, or shortcut) |
| action | object | no | — | Tap action — same format as GlassButton action |

## Example: Settings menu item with icon

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"settings-menu","title":"Settings"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["item-notifications","item-privacy","item-help"]},{"id":"item-notifications","component":"GlassListItem","primary":"Notifications","secondary":"Manage alerts and reminders","icon":"notifications","action":{"functionCall":{"call":"navigateTo","args":{"surfaceId":"notifications-page"}}}},{"id":"item-privacy","component":"GlassListItem","primary":"Privacy","icon":"lock"},{"id":"item-help","component":"GlassListItem","primary":"Help","icon":"help_outline"}]}}
```

## Example: Contact list item with avatar

```json
{
  "id": "contact-alice",
  "component": "GlassListItem",
  "primary": "Alice Chen",
  "secondary": "Last active 2h ago",
  "avatar": "https://example.com/avatars/alice.jpg"
}
```

## Example: Item with trailing content

```json
{
  "id": "item-messages",
  "component": "GlassListItem",
  "primary": "Messages",
  "icon": "chat",
  "trailing": "12"
}
```

## Notes

- `icon` and `avatar` are mutually exclusive. If both are set, behaviour is undefined — use only one.
- `trailing` is plain text only. For a colored status badge, place a GlassBadge in a separate column entry alongside the list item.
- Wrap GlassListItem in a GlassNavigator if you need the entire row to be tappable without using the `action` property directly, for example when the tap target is controlled externally.
- Build a list by placing multiple GlassListItem IDs in a Column's `children` array. Add Divider components between them if visual separation is needed.
