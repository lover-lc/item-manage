# Supabase 配置（物品整理独立项目）

**Project URL:** `https://liedowqqnzrklygdaqkw.supabase.co`  
**Project ref:** `liedowqqnzrklygdaqkw`

## 环境变量

`web/.env.local`（本地开发，不进 git）：

```
VITE_SUPABASE_URL=https://liedowqqnzrklygdaqkw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...   # Dashboard → Settings → API → Publishable key
```

生产构建见 [`deploy-github-pages.md`](./deploy-github-pages.md)（GitHub Actions 自动部署；本地 build 用同一套 `.env.local`）。

## 数据库初始化

首次在新项目执行 migration：

```bash
cd web
SUPABASE_DB_PASSWORD='你的数据库密码' npm run db:migrate
```

或复制 `web/supabase/migrations/20260626100000_initial.sql` 到 Supabase Dashboard → SQL Editor 执行。

## 访问模式

- **无登录**：家人直接使用，打开即用
- **数据共享**：全 household 共用一份数据（无 `user_id`）
- **RLS**：`anon` 角色可读写（依赖 URL 不公开 + publishable key 在前端）

## 安全说明

Publishable key 会打包进前端静态资源。请勿公开仓库 URL；若需更强隔离，后续可加简单访问密码或 Auth。
