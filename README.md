# options-m dashboard

Admin dashboard for [options-m](../options-m-main), the autonomous options-trading
agent. A separate Next.js app that talks to options-m's FastAPI backend over
HTTP — it holds no broker credentials and no database connection of its own.

## What it shows

- **Overview** (`/`) — live account equity, day/total P/L, open positions
  (with greeks/IV where available), and the equity curve.
- **Decisions** (`/proposals`) — every trade the strategist has proposed and
  what happened to it; click through for the full intent/evidence/reasoning.
  Bull/bear/PM reasoning only appears once options-m's Phase 3 (the LLM
  crew) has run — until then the detail page says so explicitly rather than
  showing a blank section.
- **Risk events** (`/risk-events`) — every trade the risk engine rejected,
  and why.
- **Chat** (`/chat`) — read-only Q&A over the account and the agent's own
  decision history, answered by the backend's `/api/chat` endpoint. It
  cannot place, close, or modify anything — including the kill switch.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_API_BASE_URL / _ADMIN_TOKEN
npm run dev
```

`NEXT_PUBLIC_ADMIN_TOKEN` must match the backend's `ADMIN_TOKEN`. This is a
single shared secret suited to a judge-facing hackathon demo — it is not a
production auth system, and it is sent from the browser (`NEXT_PUBLIC_*`),
so treat it as public. The backend must also have
`CORS_ALLOWED_ORIGINS` set to include this app's origin
(`http://localhost:3000` in development).

## Deploying

Deployed independently of the backend — this app to Vercel, the backend to
Render. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend URL and
`NEXT_PUBLIC_ADMIN_TOKEN` to match the backend's `ADMIN_TOKEN` in the Vercel
project's environment variables, and set the backend's
`CORS_ALLOWED_ORIGINS` to the deployed Vercel URL.

## Styling

Tailwind v4, dark-first trading-terminal aesthetic, tokens in
`app/globals.css` sourced from Midas's real design system (brand blue,
navy/success/danger/warning scales) — values only, not an imported
dependency. Inter for text, JetBrains Mono for numeric figures
(`.font-mono-numeric`).
