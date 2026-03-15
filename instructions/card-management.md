# Card Management

## Creating cards

Build a JSONL payload — one JSON object per line, each with `"version": "v0.9"`. Every payload needs at least:

- A `createSurface` message declaring the surface ID and title
- An `updateComponents` message listing all the UI components for that surface

```jsonl
{"version":"v0.9","message":"createSurface","surface":{"id":"status","title":"Project Status"}}
{"version":"v0.9","message":"updateComponents","surfaceId":"status","components":[{"type":"GlassStat","label":{"literalString":"Tasks done"},"value":{"literalString":"12"}}]}
```

Then call `create_card`:

```js
const card = await use("{baseDir}/tools/glassclaw.js", {
  tool: "create_card",
  chatId: user.chatId,
  userId: user.id,
  title: "Project Status",
  payload: jsonlPayload
});
// card.surfaceId — save this to update or delete the card later
```

Check the component reference in `{baseDir}/components/` for all available component types and their fields.

## Updating cards

Call `update_card` with the surface ID and a new full payload. The updated card is shown to the user the next time they open it.

```js
await use("{baseDir}/tools/glassclaw.js", {
  tool: "update_card",
  surfaceId: card.surfaceId,
  title: "Project Status",
  payload: newJsonlPayload
});
```

On Pro tier, updating a card resets its TTL to 30 days from now. This means regularly-updated dashboards effectively never expire as long as you keep updating them. On Free tier, updating does not reset the TTL.

## Deleting cards

```js
await use("{baseDir}/tools/glassclaw.js", {
  tool: "delete_card",
  surfaceId: card.surfaceId
});
```

## TTL and limits

| Tier | Active cards | TTL |
|------|-------------|-----|
| Free | 3 | 48 hours |
| Pro | 25 | 30 days |

Cards auto-expire and are deleted when their TTL passes. When you hit the active card limit, the oldest card is automatically deleted to make room (FIFO eviction). Call `get_account` to check how many active cards the account currently has before creating more.

## Multi-page cards

Include multiple `createSurface` messages in one payload to build a multi-page card. Add a `GlassButton` on each page with a `navigateTo` action to link between pages.

```jsonl
{"version":"v0.9","message":"createSurface","surface":{"id":"page-1","title":"Page 1"}}
{"version":"v0.9","message":"updateComponents","surfaceId":"page-1","components":[{"type":"Text","text":{"literalString":"This is page 1."}},{"type":"GlassButton","id":"btn-next","text":{"literalString":"Next"},"action":{"functionCall":{"call":"navigateTo","args":{"surfaceId":"page-2"}}}}]}
{"version":"v0.9","message":"createSurface","surface":{"id":"page-2","title":"Page 2"}}
{"version":"v0.9","message":"updateComponents","surfaceId":"page-2","components":[{"type":"Text","text":{"literalString":"This is page 2."}}]}
```

Telegram's native back button works automatically when navigating between pages. Multi-page cards require Pro tier.

## Data binding

Use `updateDataModel` to seed form field values before the user sees the card. Reference them in components using `dataPath`.

```jsonl
{"version":"v0.9","message":"updateDataModel","surfaceId":"my-form","data":{"/email":"user@example.com"}}
```

Components reference the value with `"dataPath": "/email"`. When the user submits, the current value of each bound field is included in the response under the same path key.

## Checking your account

```js
const account = await use("{baseDir}/tools/glassclaw.js", {
  tool: "get_account"
});
// account.tier — "free" or "pro"
// account.activeSurfaces — number of active cards right now
```

## Reuse pattern

If you create a layout the user is likely to want again — dashboards, status pages, recurring forms — save the JSONL as a template file in `{baseDir}/templates/` with a descriptive name (e.g., `weekly-standup.jsonl`). Load and customize it next time instead of rebuilding from scratch. This saves tokens and keeps card structure consistent.
