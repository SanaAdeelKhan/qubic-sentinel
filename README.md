# Qubic Sentinel Lite

Real-time whale & token alerting with EasyConnect integrations — a 24-hour MVP for the Qubic Hackathon (Track 2).

## What it does

- Polls Qubic RPC for tick updates
- Fetches transactions for ticks
- Detects whale transfers (configurable threshold)
- Forwards alerts to EasyConnect webhook(s)
- Exposes a minimal HTTP API

## Quickstart (local)

1. Copy `.env.example` to `.env` and edit values.
2. Install deps:
   ```bash
   npm ci
   ```

Start in dev:

bash
Copy code
npm run dev
Health: GET http://localhost:3000/api/health

Test webhook: POST http://localhost:3000/api/webhook/test

Recent alerts: GET http://localhost:3000/api/alerts/recent

Docker
bash
Copy code
docker build -t qubic-sentinel-lite:latest .
docker run --env-file .env -p 3000:3000 qubic-sentinel-lite:latest
Or:

bash
Copy code
docker compose up --build
Config
See .env.example. Key vars:

RPC_BASE_URL — base RPC endpoint

POLL_INTERVAL_MS — how often to poll (ms)

WHALE_THRESHOLD_QU — threshold for alerts

EASYCONNECT_WEBHOOK_URL — webhook where alerts are posted

Notes
This is an MVP: alert storage is in-memory. For production, add a DB (Postgres), auth, rate-limits, and robust RPC backoff.

yaml
Copy code

---

## Final instructions

1. Paste each block into the corresponding file in your repo.
2. In the repo root run:
   ```powershell
   npm ci
   npm run dev
   ```

Open http://localhost:3000/api/health to confirm server is up.

Edit .env with a valid EASYCONNECT_WEBHOOK_URL to see forwarded alerts.

To test end-to-end use /api/webhook/test which sends a sample alert to EasyConnect and stores it locally.
