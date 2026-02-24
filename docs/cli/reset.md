---
summary: "CLI reference for `opennexus reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `opennexus reset`

Reset local config/state (keeps the CLI installed).

```bash
opennexus reset
opennexus reset --dry-run
opennexus reset --scope config+creds+sessions --yes --non-interactive
```
