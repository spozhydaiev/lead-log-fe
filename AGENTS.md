## Lead Log frontend

- This repository is the Next.js, React, TypeScript frontend for Lead Log.
- Treat `docs/openapi.yaml` as the API source of truth.
- The backend uses HttpOnly opaque cookie sessions; every API request must use `credentials: "include"`.
- Do not add frontend Bearer tokens, auth tokens in browser storage, or secrets in `NEXT_PUBLIC_*` variables.
- Keep backend access in the shared typed API client under `lib/api`; do not scatter raw fetch calls in pages/components.
- Do not log passwords, cookies, private notes, Telegram URLs, or Telegram identifiers.
- Maintain the calm light workspace design: warm background, white surfaces, muted indigo accent, subtle borders/shadows.
- Railway deployment uses `npm run build` and `npm start`; configure only `NEXT_PUBLIC_API_BASE_URL` for the frontend.
- Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` before completion.
- Keep scope focused; do not add future product pages or speculative backend fields.
- Do not create commits or pull requests unless explicitly requested by higher-priority instructions.
