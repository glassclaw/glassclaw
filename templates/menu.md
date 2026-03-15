# Restaurant Menu

Use this template to show a list of menu items with prices, descriptions, and category headers.

## Payload

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"menu","title":"Menu"}}
{"version":"v0.9","updateComponents":{"surfaceId":"menu","components":[{"id":"root","component":"Column","children":["header","callout","sec-mains","item-1","item-2","item-3","sec-sides","item-4","item-5","sec-drinks","item-6","item-7"]},{"id":"header","component":"GlassHeader","title":"The Glass Kitchen","subtitle":"Lunch Menu"},{"id":"callout","component":"GlassCallout","text":"All dishes made fresh to order. Ask about allergens.","variant":"info"},{"id":"sec-mains","component":"Text","text":"Mains","variant":"h3"},{"id":"item-1","component":"GlassListItem","primary":"Grilled Salmon","secondary":"With roasted vegetables and lemon butter sauce","trailing":"$18"},{"id":"item-2","component":"GlassListItem","primary":"Mushroom Risotto","secondary":"Arborio rice, wild mushrooms, parmesan","trailing":"$15"},{"id":"item-3","component":"GlassListItem","primary":"Wagyu Burger","secondary":"200g patty, brioche bun, truffle aioli","trailing":"$22"},{"id":"sec-sides","component":"Text","text":"Sides","variant":"h3"},{"id":"item-4","component":"GlassListItem","primary":"Sweet Potato Fries","trailing":"$6"},{"id":"item-5","component":"GlassListItem","primary":"Garden Salad","secondary":"Mixed greens, cherry tomatoes, balsamic","trailing":"$7"},{"id":"sec-drinks","component":"Text","text":"Drinks","variant":"h3"},{"id":"item-6","component":"GlassListItem","primary":"Fresh Lemonade","trailing":"$5"},{"id":"item-7","component":"GlassListItem","primary":"Espresso","trailing":"$4"}]}}
```

## Customization

- Use Text with `"variant":"h3"` as section dividers between categories
- Put prices in the `trailing` field
- Add `icon` field with a Material Symbols icon name (e.g. `"local_fire_department"` for spicy)
- Add `avatar` field with an image URL for item photos
