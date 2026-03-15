# Form Responses

## How form submissions work

Any card with a `GlassButton` that has an `action` with a `name` field (not `functionCall`) is a server action. When the user taps it, the form data is submitted to Glass Claw.

```json
{"id":"submit","component":"GlassButton","children":["submit-label"],"variant":"filled","action":{"name":"submit"}},
{"id":"submit-label","component":"Text","text":"Submit"}
```

After creating a card with a submit button, call `poll_response` to wait for the user's submission:

```bash
node {baseDir}/tools/glassclaw.js poll_response --surfaceId <id> --userId <userId>
```

## After receiving a response: ALWAYS CONFIRM FIRST

**When you receive form data, do NOT immediately act on it.** Instead:

1. Summarize what the user submitted back to them in the chat
2. Ask the user to confirm the details are correct
3. Only proceed with the action (booking, sending, purchasing, etc.) after the user confirms

For example, if the user submits a dinner reservation form:
- ✅ "Got it! You'd like a table for 4 on Friday at 7:30 PM, outdoor seating. Shall I confirm this reservation?"
- ❌ "Done! Your reservation is confirmed for Friday at 7:30 PM." (never assume — always confirm)

## Response format

When a response arrives, it looks like this:

```json
{
  "surface_id": "my-form",
  "event": "submit",
  "component_id": "submit",
  "data_model": {
    "name": "Alice",
    "email": "alice@example.com",
    "agree": true
  }
}
```

- `event` — the `name` from the button's action
- `component_id` — the ID of the button that was tapped
- `data_model` — all form field values keyed by their data binding path

## Long-polling behaviour

`poll_response` uses HTTP long-polling. Each request blocks on the server for up to 30 seconds waiting for a submission. If no submission arrives within that window, the tool retries automatically. You do not need to loop manually.

## Response expiry

The server allows polling for a **limited time** after a card is created. After that window, polling is rate-limited and the background watcher will fall back to asking the user to confirm (see below). Submitted responses are kept for a generous window so the user has time to notify you.

This means:
- If you expect a prompt reply (user is actively chatting), this works naturally.
- If you are not sure when the user will reply, see the overnight forms guidance below.

## How response delivery works

When you send a card with a form, `create_card` automatically starts a background watcher. You don't need to set this up.

The watcher polls the server for form submissions. When the user submits:
1. The watcher decrypts the response
2. Reacts to the card message with a ⚡ emoji
3. Fires a **system event** containing the full form data

**You will receive the form data directly in a system event.** Process it immediately and respond to the user. There is no need to call `poll_response` — the data is already in the event.

Example system event you'll receive:
```
Glass Claw: Form response received for surface abc-123.

Form data:
{
  "surface_id": "abc-123",
  "event": "submit",
  "data_model": {
    "name": "Alice",
    "email": "alice@example.com"
  }
}

Process this response and reply to the user. Do NOT call poll_response — the data is above.
```

### Fallback: user confirmation

If the watcher reaches the server's poll limit before the user submits, it sends a message asking the user to let you know when they're done. When the user confirms, call `poll_response` with a short timeout:

```bash
node {baseDir}/tools/glassclaw.js poll_response --surfaceId <id> --userId <userId> --timeout 30
```

This is the only time you need to call `poll_response` manually.

## Overnight forms

If the user will not fill the form immediately (e.g., you send it in the evening), the polling window will have expired by morning. Options:

- **Recommended**: Create the card fresh when the user comes online rather than hours in advance.
- **Read-only overnight**: Send a read-only dashboard card now. When the user comes online and you detect activity, send the form version then.
- **Accept re-creation**: If the response window expires, delete the old card and create a new one. The user gets a fresh button.

## Multiple submissions

Each card can only have one pending response at a time. Once you consume a response (by calling `poll_response` and receiving a non-null result), the form resets — the user can submit again, which creates a new response for you to poll.
