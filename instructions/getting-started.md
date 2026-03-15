# Getting Started with Glass Claw

## Prerequisites

Before you can send cards, you need:

- A Telegram bot created via [@BotFather](https://t.me/BotFather)
- Node.js available in your environment

## 1. Get a Glass Claw account

Message [@GlassClawBot](https://t.me/GlassClawBot) on Telegram and send `/start`. It will register your account automatically.

## 2. Get an API key

Send `/apikey` to [@GlassClawBot](https://t.me/GlassClawBot). Copy the key it gives you.

## 3. Configure Glass Claw

Set your API key:

```bash
node {baseDir}/tools/glassclaw.js config set apiKey <your api key from @GlassClawBot>
```

The Telegram bot token is auto-detected from `~/.openclaw/openclaw.json`. If it can't be found, set it manually:

```bash
node {baseDir}/tools/glassclaw.js config set telegram.botToken <your bot token>
```

## 4. First interaction with a user (private chat only)

Before sending a card to a user for the first time, you must run setup. This is a one-time step per user — you do not need to repeat it.

```js
await use("{baseDir}/tools/glassclaw.js", {
  tool: "setup",
  chatId: user.chatId,
  userId: user.id
});
```

This sends a "Tap to set up" button to the user in Telegram. The user taps it, which completes the setup. Wait until the user confirms before sending any cards.

You can check whether setup is already complete by tracking it yourself — store a flag per user ID once setup succeeds.

**Group chats**: skip this step entirely. Do not run `setup` in group chats.

## 5. Create your first card

Build a JSONL payload — one JSON object per line. Each object must have `"version": "v0.9"`. At minimum you need a `createSurface` message and an `updateComponents` message.

```jsonl
{"version":"v0.9","message":"createSurface","surface":{"id":"hello","title":"Hello"}}
{"version":"v0.9","message":"updateComponents","surfaceId":"hello","components":[{"type":"Text","text":{"literalString":"What is your name?"}},{"type":"GlassInput","id":"name","label":{"literalString":"Your name"},"dataPath":"/name"},{"type":"GlassButton","id":"btn-submit","text":{"literalString":"Submit"},"action":{"name":"submit"}}]}
```

Then call `create_card`:

```js
const card = await use("{baseDir}/tools/glassclaw.js", {
  tool: "create_card",
  chatId: user.chatId,
  userId: user.id,
  title: "Hello",
  payload: jsonlPayload
});
// card.surfaceId — save this if you need to update or delete the card later
```

The user receives a button in Telegram. When they tap it, the card opens.

## 6. Handle form responses (optional)

If the card has a form (a submit button), you don't need to do anything special. When the user submits, you'll receive a system event with the form data. Process it and respond to the user.

See `{baseDir}/instructions/form-responses.md` for full details on how response delivery works, including the fallback for timed-out polls.
