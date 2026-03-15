---
name: glassclaw
description: Send interactive cards to Telegram users via Glass Claw — forms, dashboards, maps, tables, and more.
homepage: https://glassclaw.app
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"noble-ciphers","kind":"node","packages":["@noble/ciphers"],"label":"Install Glass Claw dependencies"}]}}
---

# Glass Claw

Glass Claw lets you send interactive cards to Telegram — forms, dashboards, maps, and more.

## Tool location

The glassclaw tool is at `{baseDir}/tools/glassclaw.js`

## Quick setup

Before sending any cards, complete these steps once:

1. **Get a Glass Claw API key** — tell the user to message [@GlassClawBot](https://t.me/GlassClawBot) on Telegram and send `/apikey`. They should copy the key and give it to you.
2. **Configure Glass Claw**:
   ```bash
   node {baseDir}/tools/glassclaw.js config set apiKey <the key from step 1>
   ```
   The Telegram bot token is auto-detected from `~/.openclaw/openclaw.json`. If it's not there, set it manually:
   ```bash
   node {baseDir}/tools/glassclaw.js config set telegram.botToken <your bot token>
   ```
   All config is stored in `~/.glassclaw/glassclaw.json`.
3. **Run setup once per user** — in private chats, call `setup` with the user's chat ID before sending the first card. This sends a button the user taps once to complete setup. See `{baseDir}/instructions/getting-started.md` for details.

## Tool usage

The tool is invoked via CLI:

```bash
node {baseDir}/tools/glassclaw.js <command> [--param value ...]
```

### Commands

| Command | Required params | Description |
|---------|----------------|-------------|
| `setup` | `--chatId --userId` | One-time key exchange for private chats |
| `create_card` | `--chatId --userId --title --payloadFile` | Create card and send button to chat |
| `update_card` | `--surfaceId --userId --payloadFile` | Update existing card |
| `delete_card` | `--surfaceId` | Delete a card |
| `poll_response` | `--surfaceId --userId` | Wait for form submission (30s long-poll) |
| `get_account` | (none) | Check tier and usage limits |

Add `--group true` to `create_card`/`update_card`/`poll_response` for group chats (skips encryption).

### Quick example

1. Write the card payload to a JSONL file (one JSON object per line):

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"hello"}}
{"version":"v0.9","updateComponents":{"surfaceId":"hello","components":[{"id":"root","component":"Column","children":["header","btn"]},{"id":"header","component":"GlassHeader","title":"Hello!","subtitle":"Your first Glass Claw card"},{"id":"btn","component":"GlassButton","children":["btn-text"],"variant":"filled","action":{"name":"tap"}},{"id":"btn-text","component":"Text","text":"Tap me"}]}}
```

2. Send the card:

```bash
node {baseDir}/tools/glassclaw.js create_card \
  --chatId 123456789 \
  --userId 123456789 \
  --title "Hello" \
  --payloadFile hello.jsonl
```

## UX guidelines (IMPORTANT)

Follow these rules to create the best experience for users:

**Use cards when they add value.** Cards are great for dashboards, forms, maps, tables, and anything with rich visuals or interactive input. But if a simple text reply answers the user's question, just respond normally — don't create a card for a one-line answer. Cards should enhance the experience, not slow it down.

**Never share card URLs directly.** Cards are delivered as buttons inside Telegram — the `create_card` tool handles this automatically. Never paste a card URL into the chat. Card URLs only work inside Telegram's mini-app viewer and may be encrypted.

**Use multi-page navigation for lists with details.** When showing a list of items where each item has more content to show (emails, orders, products, files), ALWAYS use GlassNavigator to let the user tap an item and navigate to a detail page. Never cram all detail content into a single scrolling page. See `{baseDir}/templates/list-with-details.md` for the pattern.

**After receiving a form submission, confirm the details with the user before taking action.** When you receive form data (via direct message or `poll_response`), summarize what the user submitted and ask for confirmation. Do NOT immediately act on the submission (e.g., don't book a reservation, send an email, or make a purchase without the user confirming first).

**Pick the right template.** Before building a card from scratch, check `{baseDir}/templates/` for a ready-made pattern:
- List of items with detail views → `list-with-details.md` pattern (multi-page)
- Collecting user input → `contact-form.md`, `feedback-form.md`, `dinner-reservation.md`
- Showing data/metrics → `dashboard.md`
- Showing status/progress → `order-tracker.md`
- Displaying a menu or catalog → `menu.md`
- Task tracking → `todo-list.md`
- Plan comparison → `pricing-table.md`

## JSONL format rules (IMPORTANT)

Every component in the JSONL payload MUST follow these rules. The tool will reject payloads that violate them:

- Every component MUST have `"id"` and `"component"` fields — NOT `"type"`
- `"children"` must be an array of **string IDs**, NOT nested objects
- Use **plain strings** for text properties — NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`
- `createSurface` uses `"surfaceId"` — NOT `"id"`
- Components are a **flat list** — parent references children by ID
- There is **no template variable system** — text like `{{name}}` renders literally. Substitute real values into the JSONL before sending.
- Component IDs must NOT match ANY string value used elsewhere in the payload — data model keys, action names, variant values, or any other string property. This causes circular dependency crashes. Always use prefixed IDs: `"txt-body"` not `"body"`, `"btn-submit"` not `"submit"`, `"chk-milk"` not `"milk"`

## Read more

- **First-time setup**: `{baseDir}/instructions/getting-started.md`
- **Creating and managing cards**: `{baseDir}/instructions/card-management.md`
- **Handling form responses**: `{baseDir}/instructions/form-responses.md`
- **Group chat cards**: `{baseDir}/instructions/group-chats.md`
- **Free vs Pro features**: `{baseDir}/instructions/tiers.md`
- **Pre-made card templates** (copy-paste ready): `{baseDir}/templates/`

**Component reference**: Read the full doc for any component you plan to use — each file has properties, examples, and a full working card. Do NOT use the catalog JSON files (`catalogs/*.json`) as format reference.

### Available components

**Layout & basic (free):** `{baseDir}/components/free/`

| Component | What it does |
|-----------|-------------|
| Column | Vertical stack — use as root container |
| Row | Horizontal stack |
| Divider | Horizontal line separator |
| Text | Text block (variants: body, h3, caption) |
| Icon | Material Symbols icon |
| Image | Image from URL |
| GlassButton | Tappable button — filled or outlined, triggers actions |
| GlassNavigator | Wraps a component to make it tappable for page navigation |
| GlassCarousel | Swipeable multi-page container |
| GlassHeader | Title + subtitle header bar |
| GlassListItem | List row with icon, primary/secondary text, trailing |
| GlassBadge | Small colored label |

**Premium (Pro tier):** `{baseDir}/components/premium/`

| Component | What it does | Best for |
|-----------|-------------|----------|
| GlassInput | Text input field | Forms — names, emails, search |
| GlassTextarea | Multi-line text input | Forms — messages, comments |
| GlassSelect | Dropdown picker | Forms — choosing from options |
| GlassCheckbox | Checkbox with label | Forms — toggles, agreements |
| GlassSwitch | Toggle switch | Settings, on/off controls |
| GlassRating | Star rating (1-N) | Reviews, feedback |
| GlassSlider | Range slider with live value | Amounts, percentages |
| GlassStat | Single metric with trend arrow | KPIs, dashboard numbers |
| GlassGauge | Circular progress ring | Percentages, scores, load |
| GlassBarChart | Horizontal bar chart | Comparisons, rankings |
| GlassProgress | Horizontal progress bar | Completion, loading |
| GlassBento | 2-column grid layout | Dashboards with multiple stats |
| GlassCallout | Alert/notice banner | Warnings, tips, info |
| GlassCard | Card with image, title, children | Product cards, profiles |
| GlassMap | Google Maps embed | Locations, directions |
| GlassTimeline | Vertical event timeline | Order tracking, milestones |
| GlassTable | Data table with rows/columns | Pricing, comparisons, data |
| GlassCodeBlock | Syntax-highlighted code | Code snippets, configs |

**Choose the right component for the job.** For example: showing a percentage? Use GlassGauge, not Text. Tracking an order? Use GlassTimeline, not a list. Comparing values? Use GlassBarChart, not a table.

## Key rules

- Run `setup` once per new user in private chats before sending cards. Group chat cards skip setup.
- **Free tier**: 3 active cards, 48-hour TTL. **Pro**: 25 active cards, 30-day TTL.
- **Form responses**: Cards with forms automatically start a background watcher. When the user submits, you'll receive a message containing the form data — process it directly and respond to the user. Only call `poll_response` if the user explicitly lets you know they've submitted the form. See `{baseDir}/instructions/form-responses.md`.
- **Pre-create dashboards**: If you build a card the user might request again (dashboards, status pages, menus), save the JSONL payload to a file so you can reuse it without rebuilding from scratch. Update just the dynamic data (values, items) before sending.
- **Start from templates**: Check `{baseDir}/templates/` before building a card from scratch. Copy a template and customize it — this is faster and avoids format mistakes.
- All cards use A2UI v0.9 JSONL format — read component docs and templates for correct format.
