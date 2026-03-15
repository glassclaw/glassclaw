# Todo List

Use this template to show a task list with checkmarks, descriptions, and status indicators. Read-only — the agent controls what's checked.

## Payload

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"todos","title":"My Tasks"}}
{"version":"v0.9","updateComponents":{"surfaceId":"todos","components":[{"id":"root","component":"Column","children":["header","item-1","item-2","item-3","item-4","item-5"]},{"id":"header","component":"GlassHeader","title":"Today's Tasks","subtitle":"3 of 5 complete"},{"id":"item-1","component":"GlassListItem","primary":"Buy groceries","secondary":"Milk, eggs, bread","icon":"check_circle","trailing":"Done"},{"id":"item-2","component":"GlassListItem","primary":"Review pull request","secondary":"glass_claw #42 — performance fixes","icon":"check_circle","trailing":"Done"},{"id":"item-3","component":"GlassListItem","primary":"Call dentist","secondary":"Reschedule appointment","icon":"check_circle","trailing":"Done"},{"id":"item-4","component":"GlassListItem","primary":"Write weekly report","secondary":"Due by 5 PM","icon":"radio_button_unchecked","trailing":"Pending"},{"id":"item-5","component":"GlassListItem","primary":"Plan weekend trip","secondary":"Look at train tickets","icon":"radio_button_unchecked","trailing":"Pending"}]}}
```

## Customization

- Change `icon` to `"check_circle"` for done items and `"radio_button_unchecked"` for pending
- Use `trailing` for status text like "Done", "Pending", "Overdue"
- Add more items by adding GlassListItem components and referencing them in root's children
- Use GlassBadge in place of trailing text for colored status indicators
