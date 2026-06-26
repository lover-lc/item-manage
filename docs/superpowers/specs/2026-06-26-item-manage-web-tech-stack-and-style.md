# 物品整理 Web App 技术栈与风格设计

**日期**: 2026-06-26
**类型**: 技术选型 + UI风格定义
**基于**: 2026-06-25-item-manage-web-design.md 功能设计 + 2026-06-26 用户确认  
**目标**: 确定 React PWA 技术栈和极简主义视觉风格，Supabase 多设备同步（共享账号 Auth）

---

## 背景与目标

基于已完成的功能设计文档，本文档聚焦于：

1. **技术栈选型**：React 19 + Vite + Tailwind CSS + Supabase
2. **UI 风格定义**：极简主义风格（Things 3 / Notion 风格参考）
3. **数据同步方案**：Supabase 云端存储，替代纯本地 IndexedDB

**核心诉求**：
- 零成本长期使用（Gitee Pages + Supabase 免费套餐）
- 多设备自动同步（1 个共享 Supabase Auth 账号）
- 与 `desktop-pet-cc` 复用同一 Supabase 项目与连接方式
- 界面好看、无 AI 味儿

---

## 技术架构

### 核心技术栈

| 层级 | 技术选型 | 版本 | 用途说明 |
|------|---------|------|---------|
| **UI 框架** | React | 19.x | 组件化开发，生态成熟 |
| **类型系统** | TypeScript | 5.x | 类型安全，减少运行时错误 |
| **构建工具** | Vite | 6.x | 快速 HMR，优化构建产物 |
| **样式方案** | Tailwind CSS | 4.x | Utility-first，快速实现极简风格 |
| **路由** | React Router | 7.x | Tab 导航 + 详情/表单页面 |
| **图标** | Lucide React | 最新 | 极简 SVG 图标库（细腻、轻量） |

### 数据层技术

| 功能 | 技术选型 | 说明 |
|------|---------|------|
| **远程数据库** | Supabase PostgreSQL | 云端持久化，免费 500MB + 50K 月活 |
| **客户端 SDK** | @supabase/supabase-js | 官方 JavaScript SDK |
| **查询缓存** | TanStack Query (React Query) | 自动缓存、重新验证、乐观更新 |
| **UI 状态** | Zustand | 轻量状态管理（筛选、排序等临时状态） |
| **本地离线** | React Query 缓存 | 离线时显示缓存数据，联网后自动同步 |

**数据流**：

```
UI 组件
  ↓ (useQuery/useMutation)
React Query
  ↓ (缓存 + 请求)
Supabase Client
  ↓ (REST API / Realtime)
Supabase Cloud (PostgreSQL)
```

**同步策略**：
- 所有增删改操作直接写入 Supabase
- React Query 自动管理缓存失效和重新获取
- 可选：启用 Supabase Realtime 实现多标签页实时同步（Phase 2）

### 工具链

| 功能 | 工具 | 说明 |
|------|------|------|
| **PWA** | vite-plugin-pwa | Service Worker + manifest.json |
| **测试** | Vitest | 单元测试（成本计算、校验逻辑） |
| **代码规范** | ESLint + Prettier | 代码风格统一 |
| **部署** | GitHub Pages / Gitee Pages | 零成本静态托管 |

---

## 项目结构

```
web/
├── src/
│   ├── lib/
│   │   ├── supabase.ts              # Supabase 客户端初始化
│   │   ├── types.ts                  # TypeScript 类型定义
│   │   ├── cost-calculator.ts        # 成本计算逻辑（与 iOS 版对齐）
│   │   ├── validators.ts             # 表单校验规则
│   │   └── date-utils.ts             # 日期处理工具
│   ├── hooks/
│   │   ├── use-items.ts              # 物品 CRUD（useQuery/useMutation）
│   │   ├── use-areas.ts              # 区域 CRUD
│   │   ├── use-categories.ts         # 分类 CRUD
│   │   └── use-ui-store.ts           # UI 状态（筛选、排序）
│   ├── components/
│   │   ├── ui/                       # 通用 UI 组件（Button、Sheet 等）
│   │   ├── layout/                   # 布局组件（TabBar、Header）
│   │   ├── ItemCard.tsx              # 物品卡片
│   │   ├── ItemForm.tsx              # 添加/编辑表单
│   │   ├── YMDPicker.tsx             # 年月日滚轮选择器
│   │   └── DeleteConfirmSheet.tsx    # 删除确认弹窗
│   ├── pages/
│   │   ├── ItemsPage.tsx             # 物品列表（Tab 1）
│   │   ├── SearchPage.tsx            # 搜索页（Tab 2）
│   │   ├── ManagePage.tsx            # 管理页（Tab 3）
│   │   ├── ItemDetailPage.tsx        # 物品详情
│   │   └── OnboardingPage.tsx        # 引导页
│   ├── store/
│   │   └── ui-store.ts               # Zustand store（筛选、排序状态）
│   ├── App.tsx                       # 根组件 + 路由配置
│   ├── main.tsx                      # 入口文件
│   └── index.css                     # Tailwind 基础样式
├── public/
│   ├── manifest.json                 # PWA 配置
│   └── icons/                        # PWA 图标
├── supabase/
│   ├── migrations/                   # 数据库表结构 SQL
│   │   └── 20260626000000_initial.sql
│   └── seed.sql                      # 预置区域和分类数据
├── vite.config.ts                    # Vite 配置
├── tailwind.config.js                # Tailwind 主题配置（极简风格）
├── tsconfig.json                     # TypeScript 配置
└── package.json
```

---

## Supabase 数据库设计

### 表结构

**areas（区域表）**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | uuid | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE | 所属用户 |
| name | text | NOT NULL | 区域名称 |
| is_system_reserved | boolean | DEFAULT false | 系统保留标记 |
| created_at | timestamptz | DEFAULT now() | 创建时间 |

**categories（分类表）**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | uuid | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE | 所属用户 |
| name | text | NOT NULL | 分类名称 |
| is_system_reserved | boolean | DEFAULT false | 系统保留「未分类」 |
| created_at | timestamptz | DEFAULT now() | 创建时间 |

**items（物品表）**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| user_id | uuid | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE | 所属用户 |
| name | text | NOT NULL | 物品名称 |
| purchase_price | numeric(10,2) | NOT NULL CHECK (purchase_price >= 0) | 买入价格 |
| start_date | date | NOT NULL | 开始使用日期 |
| end_date | date | NULL | 用完日期 |
| expiry_date | date | NULL | 过期日期 |
| area_id | uuid | NOT NULL REFERENCES areas(id) | 所属区域 FK |
| category_id | uuid | NOT NULL REFERENCES categories(id) | 所属分类 FK |
| specific_location | text | NOT NULL | 具体位置描述 |
| created_at | timestamptz | DEFAULT now() | 创建时间 |
| updated_at | timestamptz | DEFAULT now() | 更新时间 |

**索引**：
- `items.area_id` + `items.category_id`（查询优化）
- `items.start_date`, `items.end_date`, `items.expiry_date`（排序优化）

**RLS（行级安全策略）**：
- Phase 1 **启用** Supabase Auth + RLS
- 1 个共享账号（2 人、4～5 设备同邮箱密码）
- 每张表策略：`auth.uid() = user_id`（SELECT / INSERT / UPDATE / DELETE）
- 未登录用户无法读写任何数据

### 预置数据（应用端 seed，非 SQL 全局 seed）

用户首次登录后，若该 `user_id` 下无区域记录，应用插入：

- 区域：客厅、卧室、厨房、卫生间、储藏室、未分类（系统）
- 分类：日用品、食品、宠物用品、清洁用品、未分类（系统）

每条记录带当前 `user_id`。

---

## UI 风格设计

### 设计原则：极简主义

**核心理念**：
- **留白优先**：组件间距充足，呼吸感强
- **色彩克制**：2-3 种主色 + 大量灰阶
- **扁平化**：无渐变、无重阴影、无拟物
- **字体层级清晰**：有限的字号和字重组合
- **动画微妙**：仅用于状态反馈，不做花哨过渡

**参考对象**：Things 3, Notion, Linear

### Tailwind 主题配置

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // 主色调：深蓝灰
        primary: {
          DEFAULT: '#2c3e50',
          light: '#34495e',
        },
        // 背景色：温暖浅灰
        bg: {
          DEFAULT: '#fafafa',
          card: '#ffffff',
          hover: '#f5f5f5',
        },
        // 文字色
        text: {
          DEFAULT: '#1a1a1a',
          secondary: '#6b7280',
          tertiary: '#9ca3af',
        },
        // 成本强调色（与 iOS 橙色一致）
        cost: '#f59e0b',
        // 功能色（状态提示）
        status: {
          expired: '#ef4444',      // 已过期：红
          expiring: '#f59e0b',     // 即将过期：橙
          active: '#10b981',       // 使用中：绿
          usedUp: '#6b7280',       // 已用完：灰
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        'xs': '0.75rem',      // 12px - 次要信息
        'sm': '0.875rem',     // 14px - 正文
        'base': '1rem',       // 16px - 标题
        'lg': '1.125rem',     // 18px - 大标题
        'xl': '1.25rem',      // 20px - 页面标题
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
    },
  },
}
```

### 组件视觉规范

**物品卡片（ItemCard）**：

```
┌─────────────────────────────────────────┐
│ 猫粮                          ¥12.50/天 │  ← 16px 字号，600 字重
│ 卧室 > 衣柜第二层 · 宠物用品       🟡    │  ← 14px 字号，400 字重，灰色
└─────────────────────────────────────────┘
  ↑ 白色背景，12px 圆角，无边框，hover 时背景变为 #f5f5f5
  ↑ 内边距：16px 上下，20px 左右
```

**状态图标**：
- 已用完：灰色圆点 `⚫`
- 已过期：红色警告 `🔴`
- 即将过期：橙色时钟 `🟡`
- 使用中：无图标

**按钮样式**：
- 主按钮：`bg-primary text-white rounded-button px-6 py-3`
- 次要按钮：`bg-bg-hover text-text rounded-button px-6 py-3`
- 文字按钮：`text-primary hover:underline`

**表单输入**：
- 背景：`bg-bg-card border border-gray-200 rounded-button`
- 聚焦：`border-primary ring-2 ring-primary/20`
- 内边距：`px-4 py-3`

**Tab Bar**：
- 固定底部，白色背景，上边框（`border-t border-gray-200`）
- 未选中：灰色图标 + 文字（`text-text-secondary`）
- 选中：主色图标 + 文字（`text-primary`）
- 图标大小：24px
- 高度：64px + `safe-bottom`

### 动画规范

**过渡动画**：
```css
.transition-default {
  @apply transition-all duration-200 ease-in-out;
}
```

**使用场景**：
- 按钮 hover 状态
- 列表项点击反馈
- 弹窗/Sheet 出现/消失（`slide-up` 动画）
- 筛选/排序切换

**禁止使用**：
- 页面切换无过渡（即时切换，保持轻快）
- 列表加载无骨架屏（直接显示，避免抖动）

### 响应式设计

**断点**：
- 移动端优先（默认 < 640px）
- 平板适配（640px - 1024px）：双栏布局
- 桌面端（> 1024px）：居中卡片容器（max-width: 768px）

**移动端特殊处理**：
- 顶部留出 `safe-area-inset-top`（刘海屏适配）
- 底部 Tab Bar 留出 `safe-area-inset-bottom`（Home Indicator）
- 列表项支持左滑删除（`touch-action: pan-x`）

---

## 数据同步方案

### Supabase 配置

**项目设置**：
1. **复用** `desktop-pet-cc` 同一 Supabase 项目（不新建项目）
2. 运行 `web/supabase/migrations/` 下的 SQL 文件（新建 areas/categories/items 表）
3. 复制 `.env.local`（与 desktop-pet-cc 相同的 URL + anon key）
4. 注册 1 个共享 Auth 账号供家庭使用

**环境变量**（`.env.local`）：
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### React Query 集成

**查询示例**（`use-items.ts`）：

```ts
export function useItems(areaId?: string, categoryId?: string) {
  return useQuery({
    queryKey: ['items', areaId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select('*, area:areas(*), category:categories(*)')

      if (areaId) query = query.eq('area_id', areaId)
      if (categoryId) query = query.eq('category_id', categoryId)

      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60, // 1分钟内不重新请求
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: NewItem) => {
      const { data, error } = await supabase
        .from('items')
        .insert(item)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}
```

### 离线处理

**策略**：
- 离线时显示 React Query 缓存的数据
- 写操作失败时显示 Toast 提示：「网络异常，请稍后重试」
- 暂不实现离线队列（Phase 1 简化方案）

**PWA 缓存**：
- Service Worker 仅缓存静态资源（HTML/CSS/JS）
- 数据请求（Supabase API）不缓存，依赖 React Query

---

## 开发与部署

### 开发环境

**启动开发服务器**：
```bash
cd web
npm install
npm run dev  # http://localhost:5173
```

**环境要求**：
- Node.js 18+
- npm 或 pnpm

### 构建与部署

**构建命令**：
```bash
npm run build  # 输出到 dist/
```

**部署到 Gitee Pages**：
1. 在 `vite.config.ts` 设置 `base: '/item-manage/'`
2. 构建后部署 `dist/` 到 Gitee Pages
3. 访问 URL：`https://wll1011.gitee.io/item-manage/`

**零成本确认**：
- Supabase 免费套餐：500MB 数据库 + 50K 月活用户
- Gitee Pages：免费静态托管

---

## 数据备份与迁移

### 导出/导入功能

**导出**（管理页底部按钮）：
- 调用 Supabase API 获取全量数据（areas, categories, items）
- 生成 JSON 文件（格式与 iOS 版对齐）
- 浏览器下载 `item-manage-backup-YYYYMMDD.json`

**导入**（管理页底部按钮）：
- 选择 JSON 文件
- **弹窗二次确认**：「导入将覆盖云端所有数据，是否继续？」
- 确认后执行：清空 Supabase 数据库 → 插入 JSON 数据
- 刷新 React Query 缓存

**策略**：
- Phase 1: 全量覆盖（不合并）
- Phase 2（可选）: 智能合并（按 UUID 去重）

### 从 iOS 版迁移

**手动方式**：
1. iOS 版暂无导出功能，需要手工录入
2. 或编写转换脚本（读取 iOS SwiftData 导出的 JSON → Supabase 格式）

**自动方式（后续）**：
- iOS 版添加 JSON 导出功能
- Web 版导入时自动识别字段映射

---

## 测试策略

### 单元测试（Vitest）

**测试范围**：
- `cost-calculator.ts`：成本计算、天数计算、边界情况
- `validators.ts`：表单校验规则
- 日期工具函数

**运行命令**：
```bash
npm run test
npm run test:ui  # 可视化界面
```

### 手动测试清单

**功能测试**：
- [ ] 首次打开显示预置区域和分类
- [ ] 添加/编辑/删除物品
- [ ] 区域/分类 CRUD
- [ ] 删除区域/分类时三选一 Sheet
- [ ] 双维度筛选（区域 + 分类）
- [ ] 排序切换
- [ ] 搜索含分类名
- [ ] 导出再导入数据完整
- [ ] 每日成本计算正确
- [ ] 状态图标显示正确

**UI 测试**：
- [ ] 移动端 Safari 布局正常
- [ ] 移动端 Chrome 布局正常
- [ ] 添加到主屏幕后全屏运行
- [ ] 刘海屏/Home Indicator 适配
- [ ] 暗色模式（Phase 2）

**同步测试**：
- [ ] 多设备同时打开，数据自动同步
- [ ] 一个设备修改，另一个刷新后显示最新数据
- [ ] 网络断开时显示缓存数据
- [ ] 网络恢复后自动同步

---

## 开发优先级

### Phase 1 — Web MVP（核心功能）

**目标**：功能与 iOS 版 Phase 1+2 对齐 + 分类 + Supabase 同步

**任务清单**：
1. 项目脚手架（Vite + React + TS + Tailwind）
2. Supabase migration + **登录页** + 首次登录 seed
3. React Query + Zustand 集成
4. 数据 hooks（use-items, use-areas, use-categories）
5. 物品列表页（区域分组、卡片、筛选、排序）
6. 物品详情页
7. 添加/编辑表单 + YMD 日期选择器
8. 搜索页
9. 管理页（区域 + 分类 Segmented）
10. 删除确认 Sheet（三选一）
11. 导出/导入功能
12. PWA 配置（manifest + service worker）
13. 部署到 Pages

### Phase 2 — 体验完善

1. Onboarding 多页引导
2. 深色模式
3. Supabase Realtime（多标签页实时同步）
4. 动画 polish（列表项删除动画、Sheet 滑入动画）
5. 空状态插画
6. 响应式优化（平板/桌面端双栏布局）
7. 性能优化（虚拟滚动、图片懒加载）

### 不做（YAGNI）

- 用户认证（单用户 RLS）— **Phase 1 已含共享账号登录**
- 推送通知
- 微信小程序
- iOS 版新功能开发
- CSV 格式（JSON 足够）
- 多语言支持

---

## 风险与限制

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Supabase 免费套餐超限 | 无法访问数据 | 单用户使用不太可能超限；监控用量 |
| 网络依赖 | 离线无法编辑 | Phase 1 接受此限制；Phase 2 可加离线队列 |
| PWA 在 iOS Safari 限制 | 推送通知不可用 | 不依赖推送，接受限制 |
| 浏览器清除数据 | React Query 缓存丢失 | 数据在云端，刷新即可恢复 |
| 从 iOS 迁移 | 不迁移，Web 从零开始 |
| 共享账号密码 | 强密码 + RLS |

---

## 已确认决策汇总

| 主题 | 决策 |
|------|------|
| **技术栈** | React 19 + Vite + Tailwind CSS |
| **数据存储** | Supabase PostgreSQL（云端） |
| **查询缓存** | React Query |
| **UI 状态** | Zustand |
| **UI 风格** | 极简主义（Things 3 风格） |
| **配色** | 深蓝灰主色 + 大量留白 + 灰阶 |
| **图标** | Lucide React |
| **Auth** | 1 个共享账号 + RLS（Phase 1） |
| **Supabase 项目** | 与 desktop-pet-cc 同一项目 |
| **同步方案** | Supabase 自动同步 |
| **离线策略** | Phase 1 显示缓存，Phase 2 加队列 |
| **部署** | Gitee Pages |
| **成本数字** | 橙色（与 iOS 一致） |
| **iOS 数据** | 不迁移 |
| **成本** | 完全零成本 |

---

## 总结

本设计在功能设计文档基础上，确定了以下关键点：

1. **技术方案**：React + Vite + Tailwind + Supabase，成熟稳定，开发效率高
2. **视觉风格**：极简主义，大量留白，克制配色，扁平化设计
3. **数据同步**：Supabase 云端存储，多设备自动同步，零成本
4. **开发路径**：Phase 1 实现核心功能 + PWA + 同步，Phase 2 体验完善

Web 版在功能上完全覆盖 iOS 版，同时增加多设备同步能力，通过极简风格设计提升用户体验，通过静态托管 + Supabase 免费套餐实现零成本长期使用。
