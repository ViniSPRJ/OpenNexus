# OpenNexus Core API (HTTP)

Base URL: `http(s)://<gateway-host>:<port>`
All endpoints require gateway auth (Bearer token) unless configured otherwise.

## Exec

**POST** `/core/exec`

Body:

```json
{
  "args": {
    "language": "python",
    "code": "print(1+1)",
    "timeout": 30,
    "allow_write": false
  }
}
```

Response:

```json
{ "ok": true, "result": { "stdout": "2\n", "stderr": "", "exit_code": 0 } }
```

## Memory

**POST** `/core/memory/write`

```json
{ "args": { "text": "insight", "category": "fact", "source": "opennexus" } }
```

**POST** `/core/memory/search`

```json
{ "args": { "query": "financai", "limit": 5 } }
```

**POST** `/core/memory/compact`

```json
{ "args": { "sessionKey": "main" } }
```

## Channels

**POST** `/core/channels/status`

```json
{ "args": {} }
```

## Browser

**POST** `/core/browser`

```json
{ "action": "status", "args": { "profile": "opennexus" } }
```

## Canvas

**POST** `/core/canvas`

```json
{ "action": "snapshot", "args": { "outputFormat": "png" } }
```

## Cron

**POST** `/core/cron`

```json
{ "action": "list", "args": {} }
```
