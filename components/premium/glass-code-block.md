# GlassCodeBlock

Syntax-highlighted code display with a copy-to-clipboard button. Good for sharing commands, configuration snippets, API responses, or query results. **Pro tier only.**

## Format Rules

- Every component MUST have `"id"` and `"component"` fields (NOT `"type"`)
- `"children"` must be an array of string IDs, NOT nested objects
- Use plain strings for text properties, NOT `{"literalString": "..."}`
- All JSONL messages must include `"version": "v0.9"`

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| code | string | yes | — | The code or text to display |
| language | string | no | — | Language identifier for syntax highlighting |
| label | string | no | — | Title displayed above the code block |

Supported language identifiers:

`python`, `javascript`, `typescript`, `go`, `rust`, `java`, `bash`, `sql`, `json`, `yaml`, `toml`, `css`, `html`

Pass `language` as an empty string or omit it entirely for plain monospace text with no highlighting.

## Example

Python snippet:

```json
{"id":"code","component":"GlassCodeBlock","label":"Example usage","language":"python","code":"import glassclaw\n\nclient = glassclaw.Client(api_key=os.environ['GC_API_KEY'])\nsurface = client.surfaces.create(\n    title='My card',\n    encrypted_payload=encrypted_blob\n)"}
```

Shell command:

```json
{"id":"cmd","component":"GlassCodeBlock","label":"Install the CLI","language":"bash","code":"curl -sSL https://get.glassclaw.app | bash"}
```

JSON response display:

```json
{"id":"resp","component":"GlassCodeBlock","label":"API response","language":"json","code":"{\n  \"id\": \"surf_abc123\",\n  \"title\": \"Q1 report\",\n  \"expires_at\": \"2026-04-14T00:00:00Z\"\n}"}
```

## Full Card Example

Developer onboarding card with install instructions and a first API call:

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"quick-start","title":"Quick start"}}
{"version":"v0.9","updateComponents":{"components":[{"id":"root","component":"Column","children":["hdr","step1_note","install","step2_note","env","step3_note","example","docs"]},{"id":"hdr","component":"GlassHeader","title":"Get started in 2 minutes","subtitle":"Follow these steps to make your first API call"},{"id":"step1_note","component":"GlassCallout","text":"Step 1: Install the SDK","variant":"info"},{"id":"install","component":"GlassCodeBlock","language":"bash","code":"pip install glassclaw"},{"id":"step2_note","component":"GlassCallout","text":"Step 2: Set your API key","variant":"info"},{"id":"env","component":"GlassCodeBlock","language":"bash","code":"export GC_API_KEY=\"your_api_key_here\""},{"id":"step3_note","component":"GlassCallout","text":"Step 3: Create your first surface","variant":"info"},{"id":"example","component":"GlassCodeBlock","label":"hello_world.py","language":"python","code":"import glassclaw, os\n\nclient = glassclaw.Client(api_key=os.environ['GC_API_KEY'])\n\npayload = client.encrypt(my_a2ui_jsonl)\nsurface = client.surfaces.create(title='Hello world', encrypted_payload=payload)\n\nprint(f'Surface created: {surface.id}')"},{"id":"docs","component":"GlassButton","variant":"filled","children":["docs-label"],"action":{"name":"docs"}},{"id":"docs-label","component":"Text","text":"Open full documentation","variant":"body"}]}}
```

## Notes

- Newlines in `code` must be expressed as `\n` within the JSON string.
- Indentation must use spaces or `\t` (tab character) — choose whichever the language conventionally uses.
- The copy button copies the raw `code` string (no language prefix or label).
- If `language` is not in the supported list, the block renders in plain monospace without highlighting — no error is thrown.
- There is no maximum code length, but very long blocks scroll vertically within the component.
