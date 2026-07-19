# lead-log-fe

Production-ready Next.js frontend for Lead Log, a private work-memory app for notes, actions, decisions, people, tickets, and daily context.

## Stack

- Next.js App Router
- React + TypeScript
- Plain CSS with reusable component classes
- Vitest + Testing Library

## API contract

`docs/openapi.yaml` is the frontend source of truth. The backend uses an HttpOnly `lead_log_session` cookie; all API requests use `credentials: "include"`. Unsafe methods rely on the browser-sent `Origin` matching backend `FRONTEND_ORIGINS`; the frontend does not forge Origin headers or use Bearer tokens.

## Environment

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

This is a public backend origin only. Do not put secrets or tokens in `NEXT_PUBLIC_*` variables.

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

Use Node.js 20+. Recommended topology:

- `app.<domain>` → this frontend Railway service
- `api.<domain>` → Lead Log backend Railway service

Frontend service:

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Environment: `NEXT_PUBLIC_API_BASE_URL=https://api.<domain>`

Backend service must allow the exact frontend origin, for example:

```bash
FRONTEND_ORIGINS=https://app.<domain>
AUTH_SESSION_SECURE=true
```

The Next start script binds to `0.0.0.0` and uses Railway's `PORT` automatically.
