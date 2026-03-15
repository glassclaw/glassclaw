# List with Detail View (Multi-Page Pattern)

**This is the standard pattern for any list where items have detail content.** Use it for emails, orders, products, files, articles, tickets — anything where the user taps an item to see more.

Each item in the list navigates to its own detail page. Telegram's Back button returns to the list automatically.

This is a **multi-page card** (Pro feature).

The example below shows an email inbox, but the pattern works for any list-to-detail navigation.

## Payload

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"inbox","title":"Inbox"}}
{"version":"v0.9","createSurface":{"surfaceId":"email-1"}}
{"version":"v0.9","createSurface":{"surfaceId":"email-2"}}
{"version":"v0.9","createSurface":{"surfaceId":"email-3"}}
{"version":"v0.9","updateComponents":{"surfaceId":"inbox","components":[{"id":"root","component":"Column","children":["header","msg-1","msg-2","msg-3"]},{"id":"header","component":"GlassHeader","title":"Inbox","subtitle":"3 messages"},{"id":"msg-1","component":"GlassNavigator","child":"msg-1-row","action":{"functionCall":{"call":"navigateTo","args":{"surfaceId":"email-1"}}}},{"id":"msg-1-row","component":"GlassListItem","primary":"Alice Chen","secondary":"Q3 Report — Hi, please find the quarterly report attached...","icon":"mark_email_unread","trailing":"2m ago"},{"id":"msg-2","component":"GlassNavigator","child":"msg-2-row","action":{"functionCall":{"call":"navigateTo","args":{"surfaceId":"email-2"}}}},{"id":"msg-2-row","component":"GlassListItem","primary":"GitHub","secondary":"[glass_claw] PR #42 merged — Performance improvements have been merged into main","icon":"mail","trailing":"1h ago"},{"id":"msg-3","component":"GlassNavigator","child":"msg-3-row","action":{"functionCall":{"call":"navigateTo","args":{"surfaceId":"email-3"}}}},{"id":"msg-3-row","component":"GlassListItem","primary":"Bob Martinez","secondary":"Lunch tomorrow? — Hey, are you free for lunch tomorrow around noon?","icon":"mail","trailing":"3h ago"}]}}
{"version":"v0.9","updateComponents":{"surfaceId":"email-1","components":[{"id":"root","component":"Column","children":["header","meta","divider","email-body"]},{"id":"header","component":"GlassHeader","title":"Q3 Report","subtitle":"From Alice Chen"},{"id":"meta","component":"GlassListItem","primary":"alice.chen@example.com","secondary":"To: you — Today at 2:34 PM","icon":"person"},{"id":"divider","component":"Divider","axis":"horizontal"},{"id":"email-body","component":"Text","text":"Hi,\n\nPlease find the quarterly report attached. Key highlights:\n\n• Revenue up 12% vs Q2\n• 3 new enterprise clients onboarded\n• Customer satisfaction score: 4.7/5\n\nLet me know if you have any questions.\n\nBest,\nAlice","variant":"body"}]}}
{"version":"v0.9","updateComponents":{"surfaceId":"email-2","components":[{"id":"root","component":"Column","children":["header","meta","divider","email-body"]},{"id":"header","component":"GlassHeader","title":"[glass_claw] PR #42 merged","subtitle":"From GitHub"},{"id":"meta","component":"GlassListItem","primary":"notifications@github.com","secondary":"To: you — Today at 1:15 PM","icon":"code"},{"id":"divider","component":"Divider","axis":"horizontal"},{"id":"email-body","component":"Text","text":"Performance improvements (#42) has been merged into main by @spiral-nights.\n\nChanges:\n• Pre-compressed static assets (gzip)\n• CSS bundling — single styles.css\n• Async font loading\n• Cache-busting asset URLs\n\nResult: 196 KB gzipped total (was 920 KB).","variant":"body"}]}}
{"version":"v0.9","updateComponents":{"surfaceId":"email-3","components":[{"id":"root","component":"Column","children":["header","meta","divider","email-body"]},{"id":"header","component":"GlassHeader","title":"Lunch tomorrow?","subtitle":"From Bob Martinez"},{"id":"meta","component":"GlassListItem","primary":"bob@example.com","secondary":"To: you — Today at 11:42 AM","icon":"person"},{"id":"divider","component":"Divider","axis":"horizontal"},{"id":"email-body","component":"Text","text":"Hey,\n\nAre you free for lunch tomorrow around noon? There's a new ramen place on 5th that got great reviews.\n\nLet me know!\n\nBob","variant":"body"}]}}
```

## How it works

- The **inbox** surface lists all emails using GlassListItem inside GlassNavigator
- Each GlassNavigator has `action.functionCall.call: "navigateTo"` pointing to an email surface
- Tapping an email navigates to its detail surface
- Telegram's **Back button** automatically appears on detail pages (handled by miniapp.js)
- Use `"icon": "mark_email_unread"` for unread, `"icon": "mail"` for read

## Customization

- Add/remove email surfaces and inbox list items to match the actual emails
- Add a reply button on detail pages using GlassButton with a form action
- Use GlassBadge in the inbox for labels like "Urgent" or "Starred"
- Change icons: `"drafts"` (read), `"mark_email_unread"` (unread), `"star"` (starred)
