# Weather Card

Use this template when an agent needs to display current weather conditions for a city and accept a search query so the user can request a different city.

## Payload

The JSONL below creates a weather display card with a city search form. **Replace the placeholder values with real data before sending** — there is no template variable system. The text values are rendered exactly as written.

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"weather","title":"Weather Forecast"}}
{"version":"v0.9","updateDataModel":{"surfaceId":"weather","path":"/","value":{"query-city":""}}}
{"version":"v0.9","updateComponents":{"surfaceId":"weather","components":[{"id":"root","component":"Column","children":["hdr","stat-temp","row-details","divider","inp-search","btn-search"]},{"id":"hdr","component":"GlassHeader","title":"London","subtitle":"Partly Cloudy"},{"id":"stat-temp","component":"GlassStat","value":"14°C","label":"Temperature","trend":"neutral"},{"id":"row-details","component":"Row","children":["stat-humidity","stat-wind"]},{"id":"stat-humidity","component":"GlassStat","value":"72%","label":"Humidity"},{"id":"stat-wind","component":"GlassStat","value":"18 km/h","label":"Wind"},{"id":"divider","component":"Divider"},{"id":"inp-search","component":"GlassInput","label":"Search city","placeholder":"e.g. Tokyo","value":{"path":"/query-city"}},{"id":"btn-search","component":"GlassButton","variant":"filled","action":{"name":"search_city"},"children":["btn-search-label"]},{"id":"btn-search-label","component":"Text","text":"Search"}]}}
```

## Customization

- In `updateDataModel`, replace `city`, `temp`, `condition`, `humidity`, and `wind` with live values from your weather API before posting.
- The `query-city` field starts empty — the user fills it in.
- Change the `GlassHeader` subtitle to reflect the data source (e.g. "via OpenWeatherMap").

**Expected form response format:**

When the user submits, the encrypted response decrypts to a data model with:

```json
{
  "query-city": "Tokyo"
}
```

Use `query-city` to fetch updated weather data and re-`POST` the surface with a fresh `updateDataModel`.
