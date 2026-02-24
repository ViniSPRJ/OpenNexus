---
summary: "CLI reference for `opennexus logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `opennexus logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
opennexus logs
opennexus logs --follow
opennexus logs --json
opennexus logs --limit 500
opennexus logs --local-time
opennexus logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
