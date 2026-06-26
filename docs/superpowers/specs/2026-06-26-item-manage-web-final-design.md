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
| Supabase 项目 | **与 `desktop-pet-cc` 同一项目**（复用 URL + anon key） |
| 数据库 | 新建 `areas` / `categories` / `items` 表，与桌宠表独立 |
| 连接方式 | 对齐 `desktop-pet-cc/src/management/supabase.js` |
| Auth | Supabase Auth；**1 个共享账号**（2 人、4～5 设备同邮箱密码） |
| RLS | Phase 1 启用：`auth.uid() = user_id`，禁止未登录访问 |
| 业务逻辑 | 与 06-25 Web spec 一致（分类、筛选、搜索、三选一删除、成本计算等） |
| iOS 数据 | 不迁移 |
| UI 风格 | 极简主义（Things 3 / Notion）；**每日成本保持橙色** |
| 部署 | **Gitee Pages**，`base: '/item-manage/'` |
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

**Auth 流**：未登录 → LoginPage → `signInWithPassword` → session 持久化 → 检测 seed → 进入 Tab 导航。

---

## Supabase 表结构（相对 06-26 的变更）

所有表增加 `user_id uuid not null references auth.users(id) on delete cascade`。

### areas / categories / items

字段与 `2026-06-26-item-manage-web-tech-stack-and-style.md` 一致，另加 `user_id`。

### RLS 策略

每张表启用 RLS，策略模式：

- `SELECT` / `INSERT` / `UPDATE` / `DELETE`：`auth.uid() = user_id`

### Seed 策略

- **不用**全局 `seed.sql`
- 用户首次登录后，若该 `user_id` 下无区域记录，应用端插入预置区域/分类（与功能 spec 列表一致）

---

## 环境变量

与 `desktop-pet-cc` 相同：

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

本地开发：复制 `desktop-pet-cc/.env.local` 到 `web/.env.local`（不进 git）。

---

## 功能范围

完整功能定义见 `2026-06-25-item-manage-web-design.md`（UI、业务规则、CRUD、搜索、管理 Tab 等）。

UI 风格定义见 `2026-06-26-item-manage-web-tech-stack-and-style.md`；成本数字使用橙色（`#f59e0b` 或 Tailwind `text-amber-500`），与 iOS 逻辑一致。

---

## Phase 1 交付清单

1. `web/` 脚手架
2. Supabase migration（user_id + RLS）
3. 登录页 + Auth 守卫
4. 首次登录 seed
5. 物品列表 / 详情 / 表单 / YMD 选择器
6. 搜索页
7. 管理 Tab（区域 + 分类 Segmented）
8. 筛选 / 排序 / 三选一删除 Sheet
9. JSON 导出 / 导入
10. PWA + Gitee Pages 部署配置

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
