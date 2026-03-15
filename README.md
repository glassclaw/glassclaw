# Glass Claw — OpenClaw Skill

Send interactive cards to Telegram users via [Glass Claw](https://glassclaw.app) — forms, dashboards, maps, tables, and more.

## Install

```bash
clawhub install glassclaw/glassclaw
```

## Prerequisites

1. A Telegram bot (via [@BotFather](https://t.me/BotFather))
2. A Glass Claw API key (message [@GlassClawBot](https://t.me/GlassClawBot) → `/apikey`)

## Configuration

```bash
node tools/glassclaw.js config set apiKey <your-api-key>
```

The Telegram bot token is auto-detected from `~/.openclaw/openclaw.json`. If not available:
```bash
node tools/glassclaw.js config set telegram.botToken <your-bot-token>
```

All config is stored in `~/.glassclaw/glassclaw.json`.

## What it does

Your AI agent can:
- **Create cards** — forms, dashboards, maps, tables, code blocks, timelines
- **Send them as buttons** in Telegram chats — users tap to open
- **Receive form responses** — long-poll for encrypted submissions
- **Manage cards** — update, delete, check account limits

Cards in private chats are end-to-end encrypted. Cards in group chats are visible to all members.

## Components

21 components across free and premium tiers. See `components/free/` and `components/premium/` for full reference.

**Free**: Column, Row, Divider, Text, Icon, Image, GlassButton, GlassNavigator, GlassCarousel, GlassHeader, GlassListItem, GlassBadge

**Premium (Pro)**: GlassCard, GlassInput, GlassTextarea, GlassSelect, GlassCheckbox, GlassSwitch, GlassRating, GlassSlider, GlassStat, GlassGauge, GlassBarChart, GlassProgress, GlassBento, GlassCallout, GlassMap, GlassTimeline, GlassTable, GlassCodeBlock

## Templates

Pre-made card templates in `templates/` — ready to use for common patterns like weather cards, contact forms, dashboards, order trackers, and more.

## Development

```bash
npm install
npm test
```

## License

MIT
