## Project

This repository contains the web frontend for **Lead Log**.

Lead Log is a personal work-memory application for capturing work notes, tracking actions, decisions, people, tickets, and generating daily and weekly summaries.

The backend is maintained in a separate repository.

## Technology

Use the existing repository stack and conventions.

Expected stack:

* Next.js
* TypeScript
* React
* the styling and component approach already present in the repository
* Railway for production deployment

Do not replace major libraries or restructure the application unless the task explicitly requires it.

## Backend API contract

The current backend OpenAPI snapshot is located at:

```text
docs/backend-openapi.yaml
```

Treat this file as the source of truth for:

* endpoint paths;
* HTTP methods;
* authentication;
* request schemas;
* response schemas;
* error envelopes;
* status codes;
* Telegram integration behavior.

Do not invent backend endpoints or fields that are absent from the OpenAPI contract.

If the specification is incomplete or inconsistent:

1. implement everything that is unambiguous;
2. isolate assumptions inside the shared API client;
3. document the exact missing contract details;
4. do not spread guessed response shapes through page components.

Do not assume access to the backend repository.

## Authentication

Lead Log uses server-side opaque sessions stored in secure cookies.

All authenticated API calls must use:

```ts
credentials: "include"
```

Do not:

* send static Bearer tokens;
* add an `Authorization` header unless the OpenAPI contract explicitly introduces a new supported mechanism;
* store authentication tokens in `localStorage`;
* store authentication tokens in `sessionStorage`;
* expose session cookies to JavaScript;
* include secrets in `NEXT_PUBLIC_*` variables.

The frontend may store harmless UI preferences in browser storage, but never authentication credentials or one-time Telegram linking URLs.

## API access

Use the shared typed API client for backend requests.

Do not scatter raw `fetch` calls across components and pages.

The API client must:

* use `NEXT_PUBLIC_API_BASE_URL`;
* include credentials;
* parse the standard backend envelopes;
* handle `204 No Content`;
* map errors into stable frontend error types;
* avoid logging request or response content;
* never log passwords, cookies, notes, or Telegram linking URLs.

Do not use `any` for API responses.

## Application architecture

Prefer the existing architecture and conventions.

Keep responsibilities separated:

```text
page or component
    ↓
feature hook / application state
    ↓
shared API client
    ↓
Lead Log backend
```

Avoid placing API response parsing, authentication logic, and business rules directly inside visual components.

Reuse existing components before creating alternatives.

## Existing functionality

The Today screen is an existing working product feature.

Changes must not break:

* Today loading;
* quick note capture;
* note detail display;
* action status updates;
* loading states;
* empty states;
* responsive layout.

Refactor Today only when required for the current task.

## Design direction

Maintain the established Lead Log visual direction:

* calm productivity workspace;
* light theme;
* warm white or light gray background;
* white surfaces;
* muted blue or indigo accent;
* subtle borders and shadows;
* restrained use of status chips;
* clear typography;
* no unnecessary gradients;
* no excessive AI-themed decoration.

Do not redesign unrelated screens during a focused implementation task.

## Accessibility

All new UI must support:

* semantic HTML;
* visible focus states;
* keyboard navigation;
* properly associated form labels;
* accessible validation errors;
* accessible dialogs;
* clear loading and disabled states;
* status communication that does not rely on color alone.

Prefer native elements or established accessible primitives over custom controls.

## Security and privacy

Do not log or expose:

* passwords;
* session tokens;
* cookies;
* internal user IDs;
* Telegram IDs;
* Telegram chat IDs;
* one-time Telegram link tokens;
* private note content;
* backend response bodies containing user data.

Do not use `dangerouslySetInnerHTML` for user or API content.

React escaping must remain enabled.

## Environment variables

The frontend may use:

```text
NEXT_PUBLIC_API_BASE_URL
```

This variable contains only the public backend origin and is not secret.

Do not add secrets under a `NEXT_PUBLIC_` prefix.

Update `.env.example` whenever environment requirements change.

## Deployment

The frontend is deployed to Railway.

Ensure production code:

* uses the Railway-provided `PORT`;
* binds to the correct host;
* supports the current Next.js deployment mode;
* does not hardcode Railway-generated domains;
* builds with the repository’s production build command.

Recommended production topology:

```text
app.<domain> → Lead Log frontend
api.<domain> → Lead Log backend
```

Authenticated frontend requests must include cookies.

The backend must allow the exact frontend origin.

## Verification

Before reporting completion, run the repository’s actual commands for:

* tests;
* lint;
* TypeScript type checking;
* production build.

Examples may include:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Use the package manager already present in the repository.

Do not claim a command passed unless it was actually run successfully.

## Scope discipline

Implement only the requested task.

Do not opportunistically add:

* unrelated pages;
* analytics;
* billing;
* organizations;
* major dependency replacements;
* broad redesigns;
* speculative backend contracts.

Document useful follow-up work instead of silently expanding scope.

## Git behavior

Modify files directly in the current repository.

Do not create a commit, push a branch, or open a pull request unless explicitly requested.
