---
name: verify
description: How to launch and verify the OpenEAM app end-to-end (web + api + db).
---

# Verifying OpenEAM

## Launch

- `pnpm dev` at the repo root builds `@openeam/db` then starts api (NestJS, dotenv from `.env`) and web (Vite) in parallel.
- Web dev server: **http://localhost:3000** (`strictPort: true` — if the port is busy, a dev server is already running and serves the current working tree via HMR; verify against it instead of starting another).
- API is proxied by Vite at `/graphql` and `/health`; needs Postgres per `DATABASE_URL` in `.env` (Docker Compose service).

## Drive the UI headlessly

No Playwright browsers are installed. Use `playwright-core` with the system Edge instead (no download):

```js
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
```

Install `playwright-core` in the scratchpad, not the repo.

## Gotchas

- Screenshot PNGs of the dark UI can read deceptively in previews; when a color looks wrong, sample pixels (`System.Drawing.Bitmap.GetPixel`) or query `getComputedStyle` in the page — trust those over the thumbnail.
- Theme is persisted in `localStorage.theme` (`'light' | 'dark'`, absent = system); an inline script in `apps/web/index.html` applies `.dark` on `<html>` pre-hydration.
- Routes with data (value-streams, building-blocks, …) query GraphQL; they render error states if the API/Postgres is down, so the shell can still be verified without the backend.
