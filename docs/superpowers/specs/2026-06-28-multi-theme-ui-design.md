# 分模块 UI 换肤 + shadcn 组件引入设计

**日期**: 2026-06-28  
**类型**: UI 风格 + 组件库引入（仅样式与组件层，业务逻辑不变）  
**基于**: 2026-06-26 门户/待办功能设计 + 2026-06-28 风格讨论与用户确认  
**状态**: 已实现（2026-06-28）

---

## 用户确认摘要

| # | 决策 | 选择 |
|---|------|------|
| 1 | 组件底座 | **shadcn/ui（Radix）** |
| 2 | 门户 Bento | **Magic UI `@magicui/bento-grid`** |
| 3 | Sheet | **shadcn Sheet（Vaul）替换自建 Sheet** |
| 4 | SwipeRow | **保留自建，仅换肤** |
| 5 | 字体 | **`@fontsource` 本地包** |
| 6 | 依赖安装 | **不允许 `--legacy-peer-deps`，不允许 pin Vite 7** |
| 7 | 路径 alias | **同意 `@/` 导入** |

### 分模块风格（已确认）

| 模块 | 风格 | 说明 |
|------|------|------|
| 门户 | **C — Apple Bento** | `#F5F5F7`、大圆角、Bento 入口 |
| 物品管理 | **B — Nature Distilled** | 暖家居色、陶土/橄榄状态色 |
| 待办列表/表单 | **A — Soft UI** | 轻阴影、现代工具感 |
| 待办时间轴 | **C — Bento Section** | 日期分组 = 大圆角 Card 块 |
| 登录 | **B 暖色** | 与家庭产品第一印象一致 |
| 设置 | **跟门户 C** | 从门户进入 |

---

## 目标与非目标

### 目标

1. 三套视觉皮肤共存，通过 `data-theme` 切换 CSS 变量
2. 用 shadcn/Radix 替换手写 Sheet 等交互组件，提升 a11y
3. 门户用 Magic UI Bento Grid，避免纯 CSS 仿造
4. PWA 友好：本地字体、控制 bundle 增量、不用重动画 Magic UI 组件

### 非目标

- 不改路由、hooks、Supabase、RLS、业务状态机
- 不引入 Mantine / Ant Design / Chakra 等整库
- 不使用 Magic UI 重动画组件（aurora、particles 等）
- 不统一三模块为同一套配色

---

## 技术约束：Vite 8 + 干净安装

当前栈：`Vite 8.1` + `Tailwind 4.3` + `React 19`。

**硬性约束（用户确认）：**

- 禁止 `npm install --legacy-peer-deps`
- 禁止为兼容 shadcn 而 pin `vite@^7`

**实施前预检（必须通过才继续）：**

```bash
cd web
npx shadcn@latest init -t vite -y   # 或交互式，以 CLI 实际支持为准
npm install                          # 必须零 error、零 peer 冲突
npm run build                        # 必须通过
```

**若 init 失败时的备选（仍遵守约束 6）：**

1. 查 shadcn / Radix / Vaul 最新版是否已声明支持 Vite 8，逐个升级冲突包到兼容版本
2. 若仅个别 `@radix-ui/*` peer 警告但 `npm install` 成功且无 runtime 问题，记录版本锁定到 `package.json`（精确版本，非 legacy-peer-deps）
3. 最后手段：从 shadcn registry **手动复制**组件源码 + 显式安装对应 Radix 依赖（跳过有 bug 的 CLI 步骤），仍禁止 legacy-peer-deps

**禁止项：** 为通过安装而降级 Vite 或开启 legacy-peer-deps。

---

## 架构：一套组件 + 三套主题

```
┌─────────────────────────────────────────────────────────┐
│  shadcn/ui + Radix（Button, Card, Input, Sheet, …）      │
│  Magic UI BentoGrid（仅门户）                             │
│  自建 SwipeRow（保留）                                    │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   data-theme=     data-theme=     data-theme=
     portal           items            todos
   (C Bento)      (B Nature)      (A Soft + C Timeline)
```

### Theme 挂载点

| 路由/Layout | `data-theme` | 字体 |
|-------------|--------------|------|
| `/login` | `auth` | Source Sans 3 |
| `/portal`, `/settings` | `portal` | Plus Jakarta Sans |
| `/items/*` | `items` | Source Sans 3 |
| `/todos/*` | `todos` | Plus Jakarta Sans |

实现方式：各 Layout 根节点 `<div data-theme="…">` 包裹 `{children}`；`body` 默认不设 theme，由 Layout 继承。

### CSS 变量策略

**保留现有语义 token**（`--color-primary` 等）作为模块内快捷引用，**映射自 shadcn 标准变量**，避免全项目一次性改 class：

```css
/* 示例：items theme */
[data-theme="items"] {
  --background: #faf5f2;
  --foreground: #0f172a;
  --card: #ffffff;
  --primary: #78716c;
  --border: #eeeded;
  --radius: 1rem;
  /* 映射到现有 token */
  --color-bg: var(--background);
  --color-primary: var(--primary);
  --color-bg-card: var(--card);
  /* … */
}
```

shadcn init 会在 `index.css` 写入 `:root` 基础变量；三套 theme 块覆盖同名变量。

---

## 设计 Token 表

### 共享底层（全 theme）

| Token | 值 | 说明 |
|-------|-----|------|
| 动画时长 | `200ms` | hover / focus |
| 触控最小高度 | `44px` | 按钮、列表行 |
| 图标 | Lucide | 不变 |
| `prefers-reduced-motion` | 尊重 | shadcn + 自定义动画均降级 |

### `auth` + `items` — Nature Distilled (B)

| Token | 值 |
|-------|-----|
| `--background` | `#FAF5F2` |
| `--foreground` | `#0F172A` |
| `--card` | `#FFFFFF` |
| `--primary` | `#78716C` |
| `--accent` | `#D97706` |
| `--border` | `#EEEDED` |
| `--muted` | `#F5F0E1` |
| `--destructive` | `#C67B5C` |
| `--status-active` | `#6B7B3C` |
| `--status-expiring` | `#D97706` |
| `--status-expired` | `#C67B5C` |
| `--radius` | `1rem`（16px） |
| `--shadow-card` | `0 8px 32px rgba(0,0,0,0.06)` |

### `portal` — Apple Bento (C)

| Token | 值 |
|-------|-----|
| `--background` | `#F5F5F7` |
| `--foreground` | `#1D1D1F` |
| `--card` | `#FFFFFF` |
| `--muted-foreground` | `#86868B` |
| `--primary` | `#007AFF`（交互）或 `#1D1D1F`（文字强调） |
| `--border` | `rgba(0,0,0,0.06)` |
| `--radius` | `1.25rem`（20px） |
| `--shadow-card` | `0 4px 6px rgba(0,0,0,0.05)` |
| Bento hover | `scale(1.02)` + shadow 略加深 |

### `todos` — Soft UI (A) + Timeline Section (C)

**列表 / 表单 / Tab：**

| Token | 值 |
|-------|-----|
| `--background` | `#F8FAFC` |
| `--foreground` | `#0F172A` |
| `--card` | `#FFFFFF` |
| `--primary` | `#6366F1` |
| `--border` | `#E2E8F0` |
| `--radius` | `0.75rem`（12px） |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)` |

**时间轴日期块（在同一 `todos` theme 内用 modifier 或子 class）：**

| Token | 值 |
|-------|-----|
| Section 背景 | `#F5F5F7`（页底） |
| Section 卡片 | `#FFFFFF`，`--radius: 1.25rem` |
| 逾期 accent | `#DC2626` |
| 今天 accent | `var(--primary)` |

---

## 字体（@fontsource）

| 包名 | 用于 | 字重 |
|------|------|------|
| `@fontsource/source-sans-3` | `auth`, `items` | 400, 500, 600 |
| `@fontsource/plus-jakarta-sans` | `portal`, `todos` | 400, 500, 600, 700 |

在 `main.tsx` 按需 import 字体 CSS；各 theme 通过 `--font-sans` 切换：

```css
[data-theme="items"],
[data-theme="auth"] {
  --font-sans: "Source Sans 3", system-ui, sans-serif;
}
[data-theme="portal"],
[data-theme="todos"] {
  --font-sans: "Plus Jakarta Sans", system-ui, sans-serif;
}
```

---

## 组件引入清单

### shadcn init 后按需 add

```bash
npx shadcn@latest add button input label textarea card badge separator checkbox
npx shadcn@latest add sheet dialog popover dropdown-menu
npx shadcn@latest add @magicui/bento-grid
```

**预期新增依赖（由 CLI 安装，须通过干净 `npm install`）：**

- `class-variance-authority`, `clsx`, `tailwind-merge`
- `@radix-ui/react-*`（按组件）
- `vaul`（Sheet）
- Bento 若需 `motion`：仅在该包 peer 强制时安装，**不**额外引入 Magic UI 动画组件

### 目录与 alias

```
web/
├── components.json
├── src/
│   ├── lib/utils.ts              # cn()
│   ├── components/ui/            # shadcn + magic bento-grid
│   └── shared/components/ui/
│       └── SwipeRow.tsx          # 保留
```

**vite.config.ts + tsconfig：**

```ts
// vite
resolve: { alias: { "@": path.resolve(__dirname, "./src") } }

// tsconfig.app.json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

---

## 组件迁移对照表

| 现有 | 动作 | 新组件/方案 | 模块 |
|------|------|-------------|------|
| `shared/.../Sheet.tsx` | **删除**，调用方改 import | `@/components/ui/sheet` | 全局 |
| `AppCard.tsx` | 重写 UI 层 | `BentoGrid` + `BentoCard`（适配 stats） | portal |
| `TodoCard.tsx` | 换肤 + Checkbox | shadcn `Checkbox` + 布局 | todos |
| `TimelineView.tsx` | 日期组外包 | shadcn `Card` section | todos |
| `StatusBadge.tsx` | 换 implementation | shadcn `Badge` + variant | todos |
| `ItemCard.tsx` | 换肤 | shadcn `Card` | items |
| `LoginPage` 表单 | 换组件 | `Input`, `Button`, `Label` | auth |
| `MemberSwitcher` | 换组件 | `DropdownMenu` | 共享（随 host theme） |
| `NotificationCenter` | 换组件 | `Popover` | 共享 |
| `SwipeRow.tsx` | **保留** | 仅 class 改用 theme token | items/todos |
| `DeleteConfirmSheet` | 改 import | shadcn `Dialog` 或 `Sheet` | items |
| `ItemFormPage` / `TodoFormPage` picker Sheet | 改 import | shadcn `Sheet` | items/todos |
| `TabLayout` / `TodoTabLayout` | 换肤 | NavLink + theme token，FAB 用 shadcn `Button` | items/todos |
| `react-mobile-picker` | **不动** | 仅 `.ymd-picker` 改用 theme 变量 | items/todos |

### 门户 Bento 适配说明

Magic UI `BentoCard` API 偏 marketing（`name`, `cta`, `href`, `background`）。`AppCard` 迁移时：

- `name` ← `title`
- `description` ← 不变
- `href` ← `to`（React Router `Link` 包裹或 BentoCard 内用 `asChild`）
- `background` ← stats 迷你 grid（2 列数字 tile）
- `Icon` ← 现有 lucide icon
- 移动端：`grid-cols-1`，两卡 `col-span-1` 纵向堆叠（非 desktop 3 列）

**不引入** Bento 自带的 heavy background 动画。

---

## PWA / Manifest 更新

| 字段 | 现值 | 新值（建议） |
|------|------|-------------|
| `theme_color` | `#2c3e50` | `#F5F5F7`（门户主色）或 `#78716C`（偏暖） |
| `background_color` | `#fafafa` | `#FAF5F2` |

实施时与用户确认 manifest 以哪个 module 为主（建议门户 `#F5F5F7`）。

---

## 实施阶段（确认 spec 后执行）

### Phase 0 — 预检

- [ ] `shadcn init` + `npm install` + `npm run build` 无 peer 冲突
- [ ] 若失败：按「技术约束」备选路径处理，仍不违反约束 6

### Phase 1 — 基础设施

- [ ] `@/` alias、`lib/utils.ts`、`components.json`
- [ ] `index.css`：shadcn base + 4 套 `data-theme` token
- [ ] `@fontsource` 字体接入
- [ ] Theme wrapper 挂到各 Layout

### Phase 2 — 共享组件替换

- [ ] Sheet → shadcn Sheet（所有引用点）
- [ ] Login、Settings、MemberSwitcher、NotificationCenter

### Phase 3 — 分模块换肤

- [ ] Portal：`AppCard` → Bento
- [ ] Items：Card、Badge、表单、Tab、ItemCard、SwipeRow 皮肤
- [ ] Todos：TodoCard、TimelineView section、Badge、Tab、FAB

### Phase 4 — 清理与验证

- [ ] 删除旧 `Sheet.tsx`、`animate-sheet-up`（若 Vaul 接管）
- [ ] `npm run build` + `npm run test`
- [ ] 手动走查：375px 登录 / 门户 / 物品 Tab / 待办列表 / 时间轴 / Sheet 表单

---

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| shadcn init 与 Vite 8 peer 冲突 | Phase 0 预检；手动复制组件备选 |
| Bento 引入 `motion` 增包 | 仅安装 Bento 必需依赖；不 add 其他 Magic UI |
| 三套 theme 下 Badge/Status 色不一致 | 各 theme 定义 `--status-*`，Badge variant 读 CSS 变量 |
| 旧 class（`bg-bg-card`）与 shadcn（`bg-card`）并存 | 过渡期保留映射；逐步迁移，Phase 4 前不强制全改 |
| SwipeRow 与 shadcn Card 嵌套 | SwipeRow 外层不变，内层 ItemCard 换 Card |

---

## 验收标准

1. 门户、物品、待办、登录四套视觉可区分，符合 B / A+C / C / B 定义
2. 无业务逻辑变更；所有 CRUD、成员切换、通知、Swipe 删除行为与改前一致
3. Sheet/Dialog 键盘 Esc、焦点 trap、屏幕阅读器 aria 正常
4. `npm run build` 通过；无 `--legacy-peer-deps`；Vite 保持 8.x
5. 字体离线可用（不依赖 Google Fonts CDN）
6. Lighthouse PWA / 移动端无回归（手动抽查）

---

## 参考

- [shadcn/ui Vite 安装](https://ui.shadcn.com/docs/installation/vite)
- [Magic UI Bento Grid](https://magicui.design/docs/components/bento-grid)
- UI UX Pro Max：Soft UI Evolution、Nature Distilled、Bento Grids 风格定义
- 项目既有 spec：`2026-06-26-todo-portal-design.md`

---

**请审阅本文档。确认无误后回复「spec 通过」，再进入 implementation plan 与代码改动。**
