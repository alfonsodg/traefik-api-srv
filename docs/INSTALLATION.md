# Installation Guide

## Docker Swarm (Production)

### 1. Generate bcrypt password hash

```bash
# Install htpasswd or use python
python3 -c "import bcrypt; print(bcrypt.hashpw(b'YOUR_PASSWORD', bcrypt.gensalt()).decode())"
# Output: $2b$12$xxxxx...
```

### 2. Create configuration files

```bash
mkdir -p /mnt/traefik/{certs,fileprovider,logs}
```

**Static config** (`/mnt/traefik/traefik-xp.yml`):

```yaml
entryPoints:
  http:
    address: ':80'
  https:
    address: ':443'
  traefik:
    address: ':8099'

providers:
  swarm:
    exposedByDefault: false
  file:
    filename: /fileprovider/custom.toml
    watch: true

certificatesResolvers:
  le:
    acme:
      email: your-email@example.com
      storage: /certificates/acme.json
      dnsChallenge:
        provider: cloudflare
        resolvers:
          - '1.1.1.1:53'
          - '8.8.8.8:53'

serversTransport:
  insecureSkipVerify: true

accessLog: {}

log:
  filePath: /var/log/traefik.log
  level: INFO

api:
  authUser: admin
  authPassword: "$2b$12$YOUR_BCRYPT_HASH_HERE"
  dashboard: true
  insecure: true
```

**Users file** (`/mnt/traefik/users.json`):

```json
[{"username":"admin","password":"$2b$12$YOUR_BCRYPT_HASH_HERE"}]
```

### 3. Deploy to Docker Swarm

```bash
docker service create \
  --name traefik-xp \
  --constraint 'node.role == manager' \
  --user 0:0 \
  --publish 80:80 \
  --publish 443:443 \
  --publish 8099:8099 \
  --network traefik-public \
  --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock,readonly \
  --mount type=bind,source=/mnt/traefik/certs,target=/certificates \
  --mount type=bind,source=/mnt/traefik/fileprovider,target=/fileprovider \
  --mount type=bind,source=/mnt/traefik/logs,target=/var/log \
  --mount type=bind,source=/mnt/traefik/traefik-xp.yml,target=/etc/traefik/traefik.yml \
  --mount type=bind,source=/mnt/traefik/users.json,target=/etc/traefik/users.json \
  --mount type=bind,source=/etc/localtime,target=/etc/localtime,readonly \
  --env CF_API_EMAIL=your-email@example.com \
  --env CF_API_KEY=your-cloudflare-api-key \
  alfonsodg/traefik-xp:v1.1.1 \
  --configFile=/etc/traefik/traefik.yml
```

### 4. Verify

```bash
# Check service
docker service ls --filter name=traefik-xp

# Check routers discovered
curl -s http://localhost:8099/api/overview

# Access dashboard
# https://your-domain/dashboard/
```

### Important notes

- `--user 0:0` is required for Docker socket access in Swarm mode
- `authPassword` accepts bcrypt hashes (prefix `$2a$`, `$2b$`, `$2y$`). Never use plain text passwords
- ACME certificates are stored in `/certificates/acme.json` and persist across restarts
- The file provider watches for changes automatically

## Docker Compose (Development)

```yaml
services:
  traefik-xp:
    image: alfonsodg/traefik-xp:v1.1.1
    command: --configFile=/etc/traefik/traefik.yml
    ports:
      - "80:80"
      - "443:443"
      - "8099:8099"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml
      - ./users.json:/etc/traefik/users.json
      - ./certs:/certificates
      - ./dynamic:/fileprovider
    environment:
      - CF_API_EMAIL=your-email@example.com
      - CF_API_KEY=your-cloudflare-api-key
```

## Binary (systemd)

```bash
# Download
wget https://github.com/alfonsodg/traefik-xp/releases/latest/download/traefik-xp-linux-amd64.tar.gz
tar xzf traefik-xp-linux-amd64.tar.gz
sudo mv traefik-xp /usr/local/bin/

# Config
sudo mkdir -p /etc/traefik
# Create traefik.yml and users.json as above

# Systemd service
sudo tee /etc/systemd/system/traefik-xp.service << 'EOF'
[Unit]
Description=Traefik-XP API Gateway
After=network.target

[Service]
ExecStart=/usr/local/bin/traefik-xp --configFile=/etc/traefik/traefik.yml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now traefik-xp
```

## Migration from Traefik v2

Key CLI changes:

| Traefik v2 | Traefik-XP v3 |
|-----------|--------------|
| `--providers.docker.swarmmode` | `--providers.swarm` |
| `--providers.docker.constraints=Label(...)` | `--providers.swarm.constraints=Label(...)` |
| `--providers.docker.exposedbydefault=false` | `--providers.swarm.exposedByDefault=false` |
| `--experimental.plugins.*` | Remove (v2 plugins incompatible) |

## Rollback

```bash
# Docker Swarm
docker service update traefik-xp --rollback

# Or revert to specific image
docker service update traefik-xp --image traefik:2.10.4
```
