# Contact Form

Use this template when an agent needs to collect a name, email address, and message from the user — for example to route a support request, capture a lead, or let a user leave feedback with a reply address.

## Payload

The JSONL below creates a contact form with three input fields and a submit button. All fields start empty; the agent reads the filled values from the encrypted response.

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"contact","title":"Contact Us"}}
{"version":"v0.9","updateDataModel":{"surfaceId":"contact","path":"/","value":{"name":"","email":"","message":""}}}
{"version":"v0.9","updateComponents":{"surfaceId":"contact","components":[{"id":"root","component":"Column","children":["header","callout","inp-name","inp-email","inp-message","btn"]},{"id":"header","component":"GlassHeader","title":"Contact Us","subtitle":"We'll get back to you shortly"},{"id":"callout","component":"GlassCallout","variant":"info","text":"Fill in your details below and tap Send. We aim to respond within 24 hours."},{"id":"inp-name","component":"GlassInput","label":"Your name","placeholder":"Jane Smith","value":{"path":"/name"}},{"id":"inp-email","component":"GlassInput","label":"Email address","placeholder":"jane@example.com","inputType":"email","value":{"path":"/email"}},{"id":"inp-message","component":"GlassTextarea","label":"Message","placeholder":"How can we help?","value":{"path":"/message"},"rows":5},{"id":"btn","component":"GlassButton","variant":"filled","action":{"name":"submit"},"children":["btn-label"]},{"id":"btn-label","component":"Text","text":"Send"}]}}
```

## Customization

- Change the `GlassHeader` subtitle to match your response SLA.
- Update the `GlassCallout` text with your actual response timeframe or contact policy.
- Add or remove fields by duplicating / deleting `GlassInput` / `GlassTextarea` entries and adding matching keys to `updateDataModel`.

**Expected form response format:**

When the user submits, the encrypted response decrypts to a data model with:

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "message": "I have a question about my order..."
}
```
