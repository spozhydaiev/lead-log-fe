# lead-log-fe

Production-ready Next.js frontend for Lead Log, a private work-memory app for notes, actions, decisions, people, tickets, and daily context.

## Stack

- Next.js App Router
- React + TypeScript
- Plain CSS with reusable component classes
- Vitest + Testing Library

## API contract

`docs/openapi.yaml` is the frontend source of truth for backend endpoints. Browser code calls the same-origin Next.js BFF proxy at `/api/backend`, and the proxy forwards requests server-side to the configured backend with `credentials: "include"` semantics for the HttpOnly `lead_log_session` cookie. Unsafe methods are accepted by the proxy only from the frontend origin, then forwarded with that allowed Origin; the frontend does not use Bearer tokens.

## Environment

Copy `.env.example` to `.env.local`:

```bash
BACKEND_API_BASE_URL=http://localhost:8080
```

This server-only backend origin is read by Next.js route handlers. Do not expose backend URLs or secrets through `NEXT_PUBLIC_*` variables.

## Commands

```bash
npm install
npm run dev
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

## Railway deployment

Use Node.js 20+. Current Railway topology:

- `https://lead-log-fe-production.up.railway.app` → this frontend Railway service
- `https://lead-log-production.up.railway.app` → Lead Log backend Railway service

Production browser requests use relative `/api/backend/...` URLs. Browser code no longer needs `NEXT_PUBLIC_API_BASE_URL` for production API requests.

Frontend service:

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Environment: `BACKEND_API_BASE_URL=https://lead-log-production.up.railway.app`

Backend service must allow the exact frontend origin, for example:

```bash
FRONTEND_ORIGINS=https://lead-log-fe-production.up.railway.app
AUTH_SESSION_SECURE=true
```

The Next start script binds to `0.0.0.0` and uses Railway's `PORT` automatically.
