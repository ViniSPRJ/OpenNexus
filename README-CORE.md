# OpenNexus Core — Quickstart

## Start

```bash
pnpm install
pnpm build
pnpm opennexus gateway start
```

## Core endpoints (HTTP)

Base URL: `http://127.0.0.1:18789`

- `POST /core/exec`
- `POST /core/memory/write`
- `POST /core/memory/search`
- `POST /core/memory/compact`
- `POST /core/channels/status`
- `POST /core/browser`
- `POST /core/canvas`
- `POST /core/cron`

## Example

```bash
curl -X POST http://127.0.0.1:18789/core/exec \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"args":{"language":"python","code":"print(2+2)","timeout":30}}'
```

See `docs/CORE_API.md` for full payloads.
