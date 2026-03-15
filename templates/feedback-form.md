# Feedback Form

Use this template when an agent needs to collect a structured satisfaction rating, a numeric satisfaction score, and free-text comments — for example after a support interaction, a delivery, or a demo.

## Payload

The JSONL below creates a feedback form with a star rating, a percentage slider, a comments field, and a submit button. All fields start at neutral/empty defaults.

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"feedback","title":"Your Feedback"}}
{"version":"v0.9","updateDataModel":{"surfaceId":"feedback","path":"/","value":{"rating":0,"satisfaction":50,"comments":""}}}
{"version":"v0.9","updateComponents":{"surfaceId":"feedback","components":[{"id":"root","component":"Column","children":["header","inp-rating","slider","inp-comments","btn"]},{"id":"header","component":"GlassHeader","title":"Your Feedback","subtitle":"Tell us how we did"},{"id":"inp-rating","component":"GlassRating","label":"Overall rating","value":{"path":"/rating"},"max":5},{"id":"slider","component":"GlassSlider","label":"Satisfaction score","value":{"path":"/satisfaction"},"min":0,"max":100,"suffix":"%"},{"id":"inp-comments","component":"GlassTextarea","label":"Comments","placeholder":"What went well? What could be better?","value":{"path":"/comments"},"rows":4},{"id":"btn","component":"GlassButton","variant":"filled","action":{"name":"submit"},"children":["btn-label"]},{"id":"btn-label","component":"Text","text":"Submit feedback"}]}}
```

## Customization

- Change the `GlassHeader` subtitle to match the context (e.g. "Rate your recent delivery").
- Adjust `GlassRating` `max` if you prefer a 10-point scale (`"max":10`).
- Change `GlassSlider` `min`, `max`, and `suffix` to match your scale (e.g. `0`–`10`, no suffix for NPS).
- Update `GlassTextarea` placeholder text to prompt for the specific feedback you need.
- Change the `updateDataModel` default for `satisfaction` if a different midpoint is more appropriate.

**Expected form response format:**

When the user submits, the encrypted response decrypts to a data model with:

```json
{
  "rating": 4,
  "satisfaction": 82,
  "comments": "Fast response, but the solution took a couple of tries."
}
```
