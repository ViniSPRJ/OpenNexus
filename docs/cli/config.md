---
summary: "CLI reference for `opennexus config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `opennexus config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `opennexus configure`).

## Examples

```bash
opennexus config get browser.executablePath
opennexus config set browser.executablePath "/usr/bin/google-chrome"
opennexus config set agents.defaults.heartbeat.every "2h"
opennexus config set agents.list[0].tools.exec.node "node-id-or-name"
opennexus config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
opennexus config get agents.defaults.workspace
opennexus config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
opennexus config get agents.list
opennexus config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--strict-json` to require JSON5 parsing. `--json` remains supported as a legacy alias.

```bash
opennexus config set agents.defaults.heartbeat.every "0m"
opennexus config set gateway.port 19001 --strict-json
opennexus config set channels.whatsapp.groups '["*"]' --strict-json
```

Restart the gateway after edits.
