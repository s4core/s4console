# S4 Console — Web Admin UI

Next.js 14 admin panel for the S4 storage server.

![Demo](assets/screenshot.png)

> **Demo**: [s4console](http://63.141.251.44:24490) · **Login**: `root` / `password12345` · Resets every 10 min

---

## Quick Start

```bash
docker run -d -p 3000:3000 \
  -e S4_BACKEND_URL=http://YOUR-S4-SERVER:9000 \
  --restart unless-stopped \
  s4core/s4console:latest
```

```
services:
  s4console:
  image: s4core/s4console:latest
  ports:
    - "3000:3000"
  environment:
    - S4_BACKEND_URL=http://S4-CORE-SERVER:9000
  depends_on:
    - s4-server
  restart: unless-stopped 
```

Open `http://localhost:3000` and log in with your root password (`S4_ROOT_PASSWORD`).

---

## Running with docker compose

| Mode | Command |
|------|---------|
| Development (hot reload) | `docker compose up dev` |
| Production | `docker compose up prod --build` |
| Without Docker | `npm install && npm run dev` |
| Full Stack (S4 + Console) | `S4_ROOT_PASSWORD=... docker compose --profile full up` |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `S4_BACKEND_URL` | S4 server URL | `http://127.0.0.1:9000` |
| `PORT` | Console port | `3000` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | `0` for self-signed certs (dev only) | — |

---

## Pages

| Route | Purpose |
|-------|---------|
| `/login` | Authentication (JWT) |
| `/` | Dashboard — system health, counters, storage distribution |
| `/buckets` | Bucket management |
| `/buckets/[name]` | Object browser with breadcrumb navigation |
| `/users` | IAM user management |
| `/keys` | S3 API key generation and management |

---

## Architecture

```
Browser → Next.js (:3000) → S4 Server (:9000)
                |
                └── /api/* → proxied to S4_BACKEND_URL
```

---

## Tech Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · Recharts · Lucide React · SWR · React Hot Toast

---

## Docker Image

Multi-stage build: **deps** → **builder** → **runner** (Alpine, ~50MB).

Security: non-root user, read-only FS compatible, no dev dependencies in final image.
