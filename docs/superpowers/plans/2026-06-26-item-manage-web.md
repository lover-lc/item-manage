# 物品整理 Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Web PWA for household item management with Supabase sync, shared-account auth, and minimalist UI—feature parity with the approved Web functional spec.

**Architecture:** React SPA in `web/` talks to Supabase (same project as desktop-pet-cc) via React Query; RLS scopes all rows by `user_id`; Zustand holds filter/sort UI state; static build deploys to Gitee Pages at `/item-manage/`.

**Tech Stack:** React 19, Vite 6, TypeScript, Tailwind CSS 4, React Router 7, TanStack Query, Zustand, @supabase/supabase-js, Lucide React, vite-plugin-pwa, Vitest

**Spec:** `docs/superpowers/specs/2026-06-26-item-manage-web-final-design.md`

---

## File Map

| Path | Responsibility |
|------|----------------|
| `web/src/lib/supabase.ts` | Client init (mirror desktop-pet-cc) |
| `web/src/lib/types.ts` | DB + app types |
| `web/src/lib/cost-calculator.ts` | Port from iOS `ItemCostCalculator.swift` |
| `web/src/lib/validators.ts` | Port from iOS + category required |
| `web/src/lib/date-utils.ts` | ISO date helpers, day diff |
| `web/src/lib/item-status.ts` | Status priority logic |
| `web/src/lib/sort-filter.ts` | Sort + filter pure functions |
| `web/src/lib/seed-defaults.ts` | Default areas/categories for new user |
| `web/src/hooks/use-auth.ts` | Session + sign in/out |
| `web/src/hooks/use-seed.ts` | First-login seed mutation |
| `web/src/hooks/use-items.ts` | Items CRUD queries |
| `web/src/hooks/use-areas.ts` | Areas CRUD |
| `web/src/hooks/use-categories.ts` | Categories CRUD |
| `web/src/store/ui-store.ts` | Filter + sort state |
| `web/src/pages/LoginPage.tsx` | Email/password login |
| `web/src/pages/ItemsPage.tsx` | Tab 1 list |
| `web/src/pages/SearchPage.tsx` | Tab 2 search |
| `web/src/pages/ManagePage.tsx` | Tab 3 area/category mgmt |
| `web/src/pages/ItemDetailPage.tsx` | Detail + mark used up |
| `web/src/pages/ItemFormPage.tsx` | Add/edit |
| `web/supabase/migrations/20260626100000_initial.sql` | Tables + RLS |

**Reference (read-only):** `ItemManage/Utilities/*.swift`, `desktop-pet-cc/src/management/supabase.js`

---

## Task 1: Project Scaffold

**Files:**
- Create: `web/package.json`, `web/vite.config.ts`, `web/tsconfig.json`, `web/index.html`
- Create: `web/src/main.tsx`, `web/src/App.tsx`, `web/src/index.css`
- Create: `web/.env.example`, `web/.gitignore`

- [ ] **Step 1: Initialize Vite React TS project**

```bash
cd /Users/wind/Documents/Project/P_WorkSpace/item-manage
npm create vite@latest web -- --template react-ts
cd web && npm install
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @tanstack/react-query zustand react-router-dom lucide-react
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa vitest @testing-library/react jsdom
```

- [ ] **Step 3: Configure Vite**

`web/vite.config.ts` — set `base: '/item-manage/'`, add Tailwind + PWA plugins.

- [ ] **Step 4: Configure Tailwind theme**

Extend colors per spec: `primary`, `bg`, `text`, `status`, plus `cost: '#f59e0b'` for daily cost orange.

- [ ] **Step 5: Add `.env.example`**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 6: Verify dev server**

```bash
npm run dev
```

Expected: app loads at `http://localhost:5173/item-manage/`

---

## Task 2: Supabase Client + Auth

**Files:**
- Create: `web/src/lib/supabase.ts`
- Create: `web/src/hooks/use-auth.ts`
- Create: `web/src/pages/LoginPage.tsx`
- Modify: `web/src/App.tsx`

- [ ] **Step 1: Create supabase client**

Mirror `desktop-pet-cc/src/management/supabase.js`:

```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseConfig = Boolean(url && anonKey)

export const supabase = hasSupabaseConfig
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
```

- [ ] **Step 2: Implement useAuth hook**

`getSession`, `onAuthStateChange`, `signInWithPassword`, `signOut`.

- [ ] **Step 3: Build LoginPage**

Email + password form; show error for invalid credentials (Chinese messages like desktop-pet).

- [ ] **Step 4: Wrap App with auth guard**

No session → LoginPage; session → main layout with React Query provider.

- [ ] **Step 5: Manual test**

Copy `.env.local` from desktop-pet-cc; sign in with shared household account.

---

## Task 3: Database Migration

**Files:**
- Create: `web/supabase/migrations/20260626100000_initial.sql`

- [ ] **Step 1: Write migration SQL**

Tables: `areas`, `categories`, `items` with `user_id uuid not null references auth.users(id) on delete cascade`.

Snake_case columns matching 06-26 spec + indexes on FKs and date columns.

- [ ] **Step 2: Enable RLS + policies**

For each table, policies for SELECT/INSERT/UPDATE/DELETE where `auth.uid() = user_id`.

- [ ] **Step 3: Apply migration**

Run SQL in Supabase Dashboard SQL editor (same project as desktop-pet-cc), or via Supabase CLI if linked.

- [ ] **Step 4: Verify in Dashboard**

Tables visible; RLS enabled; test insert fails without auth.

---

## Task 4: Core Lib + Unit Tests (TDD)

**Files:**
- Create: `web/src/lib/cost-calculator.ts`
- Create: `web/src/lib/validators.ts`
- Create: `web/src/lib/date-utils.ts`
- Create: `web/src/lib/item-status.ts`
- Create: `web/tests/cost-calculator.test.ts`
- Create: `web/tests/validators.test.ts`
- Create: `web/vitest.config.ts`

- [ ] **Step 1: Write failing cost-calculator tests**

Port cases from `ItemManageTests/ItemCostCalculatorTests.swift`:
- same-day use → usedDays = 1
- price 0 → dailyCost 0
- format `¥12.50/天`

- [ ] **Step 2: Implement cost-calculator**

Match iOS inclusive day counting: `max(days, 0) + 1`.

- [ ] **Step 3: Write failing validator tests**

empty name, invalid price, missing area/category, start after end.

- [ ] **Step 4: Implement validators**

- [ ] **Step 5: Run tests**

```bash
cd web && npm run test
```

Expected: all PASS

---

## Task 5: Types + Seed + Data Hooks

**Files:**
- Create: `web/src/lib/types.ts`
- Create: `web/src/lib/seed-defaults.ts`
- Create: `web/src/hooks/use-seed.ts`
- Create: `web/src/hooks/use-areas.ts`
- Create: `web/src/hooks/use-categories.ts`
- Create: `web/src/hooks/use-items.ts`

- [ ] **Step 1: Define TypeScript types**

Map snake_case DB rows ↔ camelCase app models.

- [ ] **Step 2: seed-defaults.ts**

Arrays matching spec: 5 areas + 未分类, 4 categories + 未分类 with `is_system_reserved`.

- [ ] **Step 3: useSeed hook**

On login, if `areas` count for user = 0, batch insert defaults with `user_id = session.user.id`.

- [ ] **Step 4: CRUD hooks**

React Query `useQuery` / `useMutation` for areas, categories, items; invalidate on mutation.

All inserts include `user_id` from session.

- [ ] **Step 5: Manual test**

Fresh user sees preset areas/categories after first login.

---

## Task 6: Layout + Tab Navigation

**Files:**
- Create: `web/src/components/layout/TabLayout.tsx`
- Create: `web/src/components/layout/Header.tsx`
- Create: `web/src/store/ui-store.ts`
- Modify: `web/src/App.tsx`

- [ ] **Step 1: TabLayout**

Bottom tab bar: 物品 (Home), 搜索 (Search), 管理 (Settings) — Lucide icons, safe-area padding.

- [ ] **Step 2: React Router routes**

```
/           → ItemsPage
/search     → SearchPage
/manage     → ManagePage
/items/new  → ItemFormPage
/items/:id  → ItemDetailPage
/items/:id/edit → ItemFormPage
```

- [ ] **Step 3: Zustand ui-store**

`areaFilterId`, `categoryFilterId`, `sortField`, `sortOrder` with defaults (name asc).

---

## Task 7: Items List Page

**Files:**
- Create: `web/src/components/ItemCard.tsx`
- Create: `web/src/pages/ItemsPage.tsx`
- Create: `web/src/components/FilterSortMenu.tsx`

- [ ] **Step 1: ItemCard**

Layout per spec; cost in orange; subtitle `{area} > {location} · {category}`; status icon via Lucide.

- [ ] **Step 2: ItemsPage**

Group by area (show empty areas); apply filter AND sort from ui-store.

- [ ] **Step 3: Toolbar**

+ button, filter menu (area + category), sort menu.

- [ ] **Step 4: Empty states**

No items / no filter results messages.

- [ ] **Step 5: Delete interaction**

Swipe on mobile or trash icon; confirm before delete.

---

## Task 8: Item Detail + Form + YMD Picker

**Files:**
- Create: `web/src/pages/ItemDetailPage.tsx`
- Create: `web/src/pages/ItemFormPage.tsx`
- Create: `web/src/components/YMDPicker.tsx`
- Create: `web/src/components/ui/Sheet.tsx`

- [ ] **Step 1: YMDPicker**

Three scroll columns: year | month (01-12) | day (01-31); mirror iOS wheel UX with CSS scroll-snap.

- [ ] **Step 2: ItemFormPage**

Three sections: basic, location+category (pickers + quick add), dates with toggles for end/expiry.

Validate before submit; support create + edit.

- [ ] **Step 3: ItemDetailPage**

All fields, cost stats, status; Edit / Mark used up (set end_date today) / Delete with confirm.

---

## Task 9: Search Page

**Files:**
- Create: `web/src/lib/search.ts`
- Create: `web/src/pages/SearchPage.tsx`

- [ ] **Step 1: search.ts pure function**

Match against name, area name, category name, specificLocation (case-insensitive).

- [ ] **Step 2: SearchPage**

Realtime input, highlight name matches, shared sort menu.

---

## Task 10: Manage Page + Delete Sheet

**Files:**
- Create: `web/src/pages/ManagePage.tsx`
- Create: `web/src/components/DeleteConfirmSheet.tsx`
- Create: `web/src/components/ManageList.tsx`

- [ ] **Step 1: Segmented control**

Toggle 区域 | 分类.

- [ ] **Step 2: List CRUD**

Add, rename (inline or modal), delete with item count.

- [ ] **Step 3: DeleteConfirmSheet**

When deleting area/category with items: 迁到其他 / 删除全部 / 移至未分类.

- [ ] **Step 4: Help button**

Placeholder link/modal for onboarding (Phase 2 full pages; Phase 1 stub OK).

- [ ] **Step 5: Export / Import section**

At bottom of ManagePage.

---

## Task 11: Export / Import

**Files:**
- Create: `web/src/lib/backup.ts`
- Modify: `web/src/pages/ManagePage.tsx`

- [ ] **Step 1: exportBackup()**

Fetch all areas, categories, items for current user; download `item-manage-backup-YYYYMMDD.json`.

- [ ] **Step 2: importBackup()**

File picker → confirm dialog「导入将覆盖云端所有数据」→ delete user rows → insert JSON → invalidate queries.

- [ ] **Step 3: Manual test**

Export → clear data → import → verify integrity.

---

## Task 12: PWA + Gitee Pages Deploy

**Files:**
- Modify: `web/vite.config.ts`
- Create: `web/public/manifest.json`
- Create: `web/public/icons/` (192, 512)
- Create: `docs/deploy-gitee-pages.md` (brief steps)

- [ ] **Step 1: vite-plugin-pwa config**

Cache static assets only; app name「物品整理」.

- [ ] **Step 2: Build**

```bash
cd web && npm run build
```

Expected: `web/dist/` with assets under `/item-manage/`.

- [ ] **Step 3: Document Gitee Pages deploy**

Push `dist/` to pages branch or enable Gitee Pages on repo; URL `https://wll1011.gitee.io/item-manage/`.

- [ ] **Step 4: Manual smoke test on phone**

Login, add item, refresh, data persists.

---

## Manual Test Checklist (Phase 1 Done)

- [ ] Login with shared account on 2 devices; same data visible
- [ ] Unauthenticated API calls blocked by RLS
- [ ] First login seeds areas/categories
- [ ] CRUD items / areas / categories
- [ ] Delete area/category three-choice sheet
- [ ] Dual filter + sort
- [ ] Search includes category name
- [ ] Export / import round-trip
- [ ] Daily cost orange + correct calculation
- [ ] Mobile Safari layout + add to home screen

---

## Execution Handoff

Plan complete. Choose:

1. **Subagent-Driven** — fresh subagent per task, review between tasks  
2. **Inline Execution** — implement in this session with checkpoints
