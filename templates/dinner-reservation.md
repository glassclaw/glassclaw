# Dinner Reservation

Use this template when a user wants to book a table at a restaurant. Collects party size, date/time preference, and special requests.

## Payload

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"reservation","title":"Reserve a Table"}}
{"version":"v0.9","updateDataModel":{"surfaceId":"reservation","path":"/","value":{"guests":"2","date":"","time":"","seating":"","requests":""}}}
{"version":"v0.9","updateComponents":{"surfaceId":"reservation","components":[{"id":"root","component":"Column","children":["header","callout","sel-guests","inp-date","inp-time","sel-seating","inp-requests","divider","btn-submit"]},{"id":"header","component":"GlassHeader","title":"Reserve a Table","subtitle":"The Glass Kitchen — Downtown"},{"id":"callout","component":"GlassCallout","text":"Reservations available for tonight and the next 7 days. We'll confirm by text.","variant":"info"},{"id":"sel-guests","component":"GlassSelect","label":"Party size","value":{"path":"/guests"},"options":[{"label":"1 guest","value":"1"},{"label":"2 guests","value":"2"},{"label":"3 guests","value":"3"},{"label":"4 guests","value":"4"},{"label":"5 guests","value":"5"},{"label":"6 guests","value":"6"},{"label":"7+ guests","value":"7+"}]},{"id":"inp-date","component":"GlassInput","label":"Date","value":{"path":"/date"},"placeholder":"e.g. Friday, March 21"},{"id":"inp-time","component":"GlassInput","label":"Preferred time","value":{"path":"/time"},"placeholder":"e.g. 7:30 PM"},{"id":"sel-seating","component":"GlassSelect","label":"Seating preference","value":{"path":"/seating"},"options":[{"label":"No preference","value":""},{"label":"Indoor","value":"indoor"},{"label":"Outdoor patio","value":"outdoor"},{"label":"Bar area","value":"bar"},{"label":"Private dining","value":"private"}]},{"id":"inp-requests","component":"GlassTextarea","label":"Special requests","value":{"path":"/requests"},"placeholder":"Allergies, celebrations, highchair needed...","rows":3,"hint":"Optional"},{"id":"divider","component":"Divider","axis":"horizontal"},{"id":"btn-submit","component":"GlassButton","children":["btn-submit-label"],"variant":"filled","action":{"name":"reservation_submitted"}},{"id":"btn-submit-label","component":"Text","text":"Request Reservation"}]}}
```

## Expected response

```json
{
  "surface_id": "reservation",
  "event": "reservation_submitted",
  "data_model": {
    "guests": "4",
    "date": "Friday, March 21",
    "time": "7:30 PM",
    "seating": "outdoor",
    "requests": "Birthday celebration, window seat if possible"
  }
}
```

## Customization

- Change restaurant name and subtitle in the GlassHeader
- Adjust the party size options in the guests GlassSelect
- Add a GlassRating below the form for "How did you hear about us?"
- Replace free-text date/time with specific slot options using GlassSelect if you have fixed availability
