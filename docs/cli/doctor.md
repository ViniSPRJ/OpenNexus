---
summary: "CLI reference for `opennexus doctor` (health checks + guided repairs)"
read_when:
  - You have connectivity/auth issues and want guided fixes
  - You updated and want a sanity check
title: "doctor"
---

# `opennexus doctor`

Health checks + quick fixes for the gateway and channels.

Related:

- Troubleshooting: [Troubleshooting](/gateway/troubleshooting)
- Security audit: [Security](/gateway/security)

## Examples

```bash
opennexus doctor
opennexus doctor --repair
opennexus doctor --deep
```

Notes:

- Interactive prompts (like keychain/OAuth fixes) only run when stdin is a TTY and `--non-interactive` is **not** set. Headless runs (cron, Telegram, no terminal) will skip prompts.
- `--fix` (alias for `--repair`) writes a backup to `~/.opennexus/opennexus.json.bak` and drops unknown config keys, listing each removal.
- State integrity checks now detect orphan transcript files in the sessions directory and can archive them as `.deleted.<timestamp>` to reclaim space safely.

## macOS: `launchctl` env overrides

If you previously ran `launchctl setenv OPENNEXUS_GATEWAY_TOKEN ...` (or `...PASSWORD`), that value overrides your config file and can cause persistent “unauthorized” errors.

```bash
launchctl getenv OPENNEXUS_GATEWAY_TOKEN
launchctl getenv OPENNEXUS_GATEWAY_PASSWORD

launchctl unsetenv OPENNEXUS_GATEWAY_TOKEN
launchctl unsetenv OPENNEXUS_GATEWAY_PASSWORD
```
