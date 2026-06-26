# Deploy item-manage Web to GitHub Pages

Production URL: **https://\<你的GitHub用户名\>.github.io/item-manage/**

Example: `https://WLL1011.github.io/item-manage/`

## One-time setup

### 1. Create GitHub repository

1. On GitHub, create a **public** repo named `item-manage` (same name as Gitee).
2. Add GitHub as a second remote (keep Gitee if you want):

```bash
git remote add github https://github.com/<你的GitHub用户名>/item-manage.git
git push -u github main
```

Or switch `origin` to GitHub only — your choice.

### 2. Repository secrets

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Value |
|--------|--------|
| `VITE_SUPABASE_URL` | `https://liedowqqnzrklygdaqkw.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your `sb_publishable_...` key |

Same values as `web/.env.local`. Publishable key is safe to store here (already public in frontend bundle).

### 3. Enable GitHub Pages

GitHub repo → **Settings** → **Pages**

- **Source**: **GitHub Actions** (not “Deploy from a branch”)

Save. No branch selection needed — workflow `.github/workflows/deploy-pages.yml` handles deploy.

### 4. First deploy

Push to `main` (or run workflow manually: **Actions** → **Deploy Web to GitHub Pages** → **Run workflow**).

After success, open **Settings → Pages** for the live URL.

## Local development

One env file is enough:

```bash
# web/.env.local — used by npm run dev AND npm run build locally
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

See [`supabase-setup.md`](./supabase-setup.md).

## Manual build (optional)

```bash
cd web && npm run build
```

Output: `web/dist/` with base path `/item-manage/`.

## Phone / PWA

1. Open the GitHub Pages URL in **Safari** (iOS) or **Chrome** (Android).
2. **Add to Home Screen** → full-screen app icon「物品整理」.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Workflow fails on build | Check Actions secrets are set |
| 404 on refresh (e.g. `/search`) | `404.html` is copied from `index.html` in build — redeploy |
| Blank page | Confirm Pages source is **GitHub Actions**, not an empty branch |
| Supabase errors | Secrets missing or wrong; re-run workflow after fixing |
