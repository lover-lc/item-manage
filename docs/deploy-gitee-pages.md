# Deploy item-manage Web to Gitee Pages

Production URL: **https://wll1011.gitee.io/item-manage/**

Repository: https://gitee.com/WLL1011/item-manage

## Prerequisites

- Node.js 18+ and npm
- Supabase env vars for a production build (see below)

### Local development env

Copy `.env.local` from the **desktop-pet-cc** project into `web/.env.local` (same Supabase URL and anon key). This file is gitignored.

### Production build env

`VITE_*` variables are embedded at **build time**, not read when users open the static site.

Before `npm run build`, either:

1. Create `web/.env.production.local` from `web/.env.production.example` and fill in values (file is gitignored), or
2. Export variables in your shell:

```bash
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
```

Do not commit real credentials. Only `.env.production.example` belongs in git.

## Build

```bash
cd web && npm run build
```

Output: `web/dist/` (assets use base path `/item-manage/`).

Verify PWA artifacts exist:

- `dist/manifest.webmanifest`
- `dist/sw.js`
- `dist/registerSW.js`
- `dist/icons/icon-192.png`, `dist/icons/icon-512.png`

## Deploy to Gitee Pages

1. Build locally (steps above).
2. Upload the **contents** of `web/dist/` to Gitee Pages for repo **item-manage**.

   Common options on Gitee:

   - **Pages from branch**: push `dist/` to a branch (e.g. `gh-pages` or `pages`) and enable Gitee Pages for that branch / `docs` folder as your setup requires.
   - **Manual upload**: Gitee repo → **服务** → **Gitee Pages** → deploy static files from `dist/`.

3. Ensure the site is served at path `/item-manage/` (matches `base` in `web/vite.config.ts`).

4. Open https://wll1011.gitee.io/item-manage/ and smoke-test login, list, and add item.

## PWA

The app registers a service worker (`registerSW.js`) and ships a web manifest. On mobile, use **Add to Home Screen** to install as a standalone app.

Manifest highlights:

| Field | Value |
|-------|-------|
| name | 物品整理 |
| short_name | 物品整理 |
| theme_color | `#2c3e50` |
| background_color | `#fafafa` |
| display | standalone |
| start_url | `/item-manage/` |
