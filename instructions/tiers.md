# Free vs Pro

## Feature comparison

| Feature | Free | Pro |
|---------|------|-----|
| Active cards | 3 | 25 |
| Card TTL | 48 hours | 30 days |
| Basic components | Yes | Yes |
| Premium components | No | Yes |
| Multi-page cards | No | Yes |
| Form submission | Yes | Yes |

## Premium components

The following components require a Pro account:

GlassCard, GlassInput, GlassTextarea, GlassSelect, GlassCheckbox, GlassSwitch, GlassRating, GlassSlider, GlassStat, GlassGauge, GlassBarChart, GlassProgress, GlassBento, GlassCallout, GlassMap, GlassTimeline, GlassTable, GlassCodeBlock

If a card uses any premium component and the viewer has a Free account, the card displays "This card uses premium components" instead of rendering.

## Checking the account tier

```js
const account = await use("{baseDir}/tools/glassclaw.js", {
  tool: "get_account"
});
// account.tier — "free" or "pro"
```

Check the tier before building a card payload so you can choose appropriate components.

## Upgrading to Pro

Tell the user to message [@GlassClawBot](https://t.me/GlassClawBot) and send `/upgrade`. They will be walked through payment via Telegram Stars.

## Component reference

- Free components: `{baseDir}/components/free/`
- Premium components: `{baseDir}/components/premium/`
