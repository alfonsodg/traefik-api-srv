# Bot Detection

Block scrapers, vulnerability scanners, and automated attacks by User-Agent patterns and request rate.

## Setup

No external files needed. Create the middleware from the dashboard or config file.

### From dashboard

Security → + Add Bot Detect

### From config

```yaml
http:
  middlewares:
    anti-bot:
      botDetect:
        blockKnownBots: true
        allowGoodBots: true
        rateThreshold: 60
        challengeMode: false
```

### Apply to a router

```yaml
labels:
  traefik.http.routers.myapp-https.middlewares: "anti-bot@file"
```

## Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `blockKnownBots` | bool | false | Block 20+ known malicious User-Agents |
| `allowGoodBots` | bool | false | Allow Googlebot, Bingbot, Cloudflare, etc. |
| `rateThreshold` | int | 0 (disabled) | Max requests per minute per IP before blocking |
| `challengeMode` | bool | false | Return 429 + Retry-After instead of 403 |
| `customBlockPatterns` | []string | [] | Additional regex patterns to block |
| `customAllowPatterns` | []string | [] | Additional regex patterns to always allow |

## Default blocked patterns

sqlmap, nikto, nmap, masscan, zgrab, censys, shodan, scrapy, python-requests, python-urllib, go-http-client, java/, libwww-perl, wget/, semrush, ahrefsbot, mj12bot, dotbot, petalbot

## Default allowed patterns

Googlebot, Bingbot, Slurp (Yahoo), DuckDuckBot, FacebookExternalHit, TwitterBot, LinkedInBot, Cloudflare, UptimeRobot, Pingdom

## Behavior

- Empty User-Agent → blocked (403)
- Matches allow pattern → always passes
- Matches block pattern → blocked (403)
- Exceeds rate threshold → blocked (403) or challenged (429)
- Challenge mode returns `Retry-After: 60` header

## Examples

### Block everything except good bots

```yaml
botDetect:
  blockKnownBots: true
  allowGoodBots: true
  rateThreshold: 30
```

### Custom patterns

```yaml
botDetect:
  blockKnownBots: true
  allowGoodBots: true
  customBlockPatterns:
    - "my-competitor-scraper"
    - "BadBot/1.0"
  customAllowPatterns:
    - "my-internal-monitor"
```

### Challenge mode for rate limiting

```yaml
botDetect:
  blockKnownBots: false
  rateThreshold: 100
  challengeMode: true
```

Returns 429 instead of 403 when rate exceeded — allows legitimate users to retry.
