# 物品整理 Web App 定稿设计

**日期**: 2026-06-26  
**状态**: 已批准（用户确认「可以」）  
**基于**: `2026-06-25-item-manage-web-design.md`（功能）+ `2026-06-26-item-manage-web-tech-stack-and-style.md`（技术/UI）

---

## 背景

将物品整理 App 从 iOS 原生迁移为 Web PWA，作为唯一维护目标。业务逻辑与 06-25 Web 功能 spec 保持一致（含分类维度），仅变更技术栈与 UI 风格。iOS 数据不迁移。

---

## 已批准决策汇总

| 主题 | 决策 |
|------|------|
| 平台 | Web PWA，取代 iOS 为唯一维护目标 |
| 技术栈 | React 19 + Vite 6 + TypeScript 5 + Tailwind CSS 4 + React Router 7 |
| 数据层 | Supabase PostgreSQL + @supabase/supabase-js + TanStack Query + Zustand |
| Supabase 项目 | **独立项目** `liedowqqnzrklygdaqkw`（非 desktop-pet-cc） |
| 连接方式 | `VITE_SUPABASE_URL` + publishable key（`sb_publishable_...`） |
| Auth | **无登录**；家人打开即用，数据 household 共享 |
| RLS | `anon` 可读写（URL 不公开；publishable key 在前端） |
| 业务逻辑 | 与 06-25 Web spec 一致（分类、筛选、搜索、三选一删除、成本计算等） |
| iOS 数据 | 不迁移 |
| UI 风格 | 极简主义（Things 3 / Notion）；**每日成本保持橙色** |
| 部署 | **GitHub Pages**，`base: '/item-manage/'`，GitHub Actions 自动部署 |
| 离线 | Phase 1：离线只读缓存，写操作需联网 |
| Onboarding | 管理页「帮助」可打开；首次启动多页引导放 Phase 2 |
| 备份 | JSON 导出/导入（全量覆盖，导入前二次确认） |

---

## 架构

```
web/
├── src/
│   ├── lib/           # supabase、types、cost-calculator、validators、date-utils
│   ├── hooks/         # use-items、use-areas、use-categories、use-auth、use-seed
│   ├── components/    # ui/、layout/、ItemCard、ItemForm、YMDPicker 等
│   ├── pages/         # Items、Search、Manage、Detail、Login
│   ├── store/         # Zustand（筛选、排序）
│   └── App.tsx
├── supabase/migrations/
└── public/            # manifest、icons
```

**数据流**：

```
UI → React Query → Supabase Client → PostgreSQL（RLS）
         ↑
    Zustand（筛选/排序 UI 状态）
```

**Auth 流**：打开 App → 检测 seed → 直接进入 Tab 导航（无登录页）。

---

## Supabase 表结构（相对 06-26 的变更）

所有表**无 `user_id`**，全 household 共享一份数据。

### areas / categories / items

字段见 migration 文件；RLS 对 `anon` / `authenticated` 开放读写。

### Seed 策略

- **不用**全局 `seed.sql`
- 用户首次登录后，若该 `user_id` 下无区域记录，应用端插入预置区域/分类（与功能 spec 列表一致）

---

## 环境变量

```
VITE_SUPABASE_URL=https://liedowqqnzrklygdaqkw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

详见 [`docs/supabase-setup.md`](../../../supabase-setup.md)。

---

## 功能范围

完整功能定义见 `2026-06-25-item-manage-web-design.md`（UI、业务规则、CRUD、搜索、管理 Tab 等）。

UI 风格定义见 `2026-06-26-item-manage-web-tech-stack-and-style.md`；成本数字使用橙色（`#f59e0b` 或 Tailwind `text-amber-500`），与 iOS 逻辑一致。

---

## Phase 1 交付清单

1. `web/` 脚手架
2. Supabase migration（已应用于新项目）
3. ~~登录页~~ 无登录，打开即用
4. 首次登录 seed
5. 物品列表 / 详情 / 表单 / YMD 选择器
6. 搜索页
7. 管理 Tab（区域 + 分类 Segmented）
8. 筛选 / 排序 / 三选一删除 Sheet
9. JSON 导出 / 导入
10. PWA + GitHub Pages 部署（GitHub Actions）

---

## Phase 2（后续）

Onboarding 首次引导、深色模式、Supabase Realtime、动画 polish、响应式双栏、虚拟滚动等。

---

## 不做（YAGNI）

- iOS 新功能 / iOS 数据自动迁移
- 多账号共享组（当前用 1 个共享账号即可）
- 微信小程序、CSV、多语言、推送通知

---

## 风险

| 风险 | 缓解 |
|------|------|
| 共享账号密码泄露 | 强密码；RLS 阻止未登录访问 |
| 离线无法写入 | Phase 1 接受；Toast 提示 |
| 与桌宠共用 Supabase 项目 | 表名独立、migration 分文件管理 |
