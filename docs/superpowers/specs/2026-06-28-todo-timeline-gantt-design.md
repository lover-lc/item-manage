# 待办时间轴（方案 B + 颗粒 C）设计

**日期**: 2026-06-28  
**类型**: 待办时间轴视图重构（纯 UI，业务逻辑不变）  
**基于**: `2026-06-26-todo-portal-design.md`、`2026-06-28-multi-theme-ui-design.md`  
**状态**: 已实现（2026-06-28）

---

## 用户确认摘要

| # | 决策 | 选择 |
|---|------|------|
| 1 | 布局方案 | **B — 竖向时间刻度 + 横向 pill** |
| 2 | 时间颗粒 | **C — 可切换「总览 / 跨度」** |
| 3 | 合并策略 | **不合并**：每条待办独立一行 |
| 4 | 交互定位 | **纯展示总览**，操作留在列表视图 |
| 5 | 数据范围 | **分配给我的待办**（与「分配给我」Tab 同源） |

---

## 目标与非目标

### 目标

1. 一屏快速总览「我负责的」待办在时间上的分布与先后顺序
2. 紧凑布局：行高 32px，同一天多条任务各占一行
3. 零必要交互：打开即读；视图模式切换为唯一主动操作
4. 两种读法：总览看「哪天要交 + 空档占位」；跨度看「任务占多久」

### 非目标

- 不在时间轴内拖拽改期、勾选完成、编辑（列表视图承担）
- 不引入甘特库或新 npm 依赖
- 不改 Supabase 表结构、hooks、RLS
- 不做任务合并、折叠、「+N 更多」

---

## 现状问题（为何重做）

当前 `TimelineView` 为「日期 Card 块 → 嵌套待办 Card」，存在：

| 问题 | 影响 |
|------|------|
| 竖向清单而非时间关系图 | 无法感知任务跨度与并行密度 |
| Bento 大 Card 分组 | 垂直空间浪费，一屏条目少 |
| 拖拽 / 勾选 / 描述 / 优先级 badge | 与「纯总览」目标冲突 |
| 数据范围为全部待办 | 与「我负责的」诉求不一致 |

---

## 信息架构

### 页面结构

```
TodosPage（/todos/timeline）
├── 搜索框（保留，过滤标题/描述）
├── 视图切换 Segmented Control
│     [ 总览 ] [ 跨度 ]
└── TimelineView
      ├── TimelineOverview（总览：左时间轴 + 右待办 + 空档占位）
      ├── TimelineGanttChart（跨度：横向甘特）
      └── 无日期分区（底部）
```

### 数据范围

- 路由：`/todos/timeline`
- 数据源：`useTodos('assigned')` — 仅 `assigneeId = 当前成员` 的待办
- 搜索：客户端 filter，逻辑与列表页一致
- 排序基线：未完成优先 → 已完成置底（两种视图共用）

### 视图模式持久化

- `localStorage` 键：`todo-timeline-mode`
- 值：`'due' | 'span'`，默认 `'due'`
- 切换后立即生效，无需确认

---

## 方案 B：竖向时间刻度 + 横向 pill

### 共用布局

```
┌─────────────────────────────────────────┐
│ spine │  content                         │
│  6/26 │  ▌ 任务 A标题 truncate…          │
│  逾期 │                                  │
│       │  ▌ 任务 B标题 truncate…          │
│  ─────│─────────────────────────────────│
│  6/28 │  ▌ 任务 C标题 truncate…    ●     │
│  今天 │                                  │
│       │  ▌ 任务 D标题 truncate…  ████    │
└─────────────────────────────────────────┘
```

- **左侧 spine（固定 52px）**：日期刻度、今天/逾期语义色
- **右侧 content（flex-1）**：待办行，每行 32px
- **优先级**：行左侧 2px 色条（高 `#DC2626` / 中 `#F59E0B` / 低 `#94A3B8`），无优先级时不显示
- **已完成**：整行 `opacity-45`，标题 `line-through`
- **今天**：spine 上 `6/28` 旁加「今天」标签；spine 右侧画 1px 竖线（`--primary` 40%）贯穿该日期所有行

**禁止**：每个日期外包 shadcn `Card`；行内 checkbox、拖拽 handle、描述、优先级文字 badge。

---

## 颗粒 C：两种视图模式

### 模式 1 — 总览（`due`，UI 文案「总览」）

**读法**：「哪一天截止」；左时间轴 + 右待办

| 规则 | 说明 |
|------|------|
| 布局 | 左栏 56px：日期 + 语义 + 圆点 + 贯穿竖线；右栏该日全部待办 |
| 行数 | 每个待办 exactly 1 行，不合并；右侧 **仅标题** |
| 空档 | ≤3 天细占位；4–14 天「M/D — M/D · 无待办」；>14 天跨月加「M 月」+「约 N 周无安排」 |
| 无 `dueDate` | 底部「无日期」分区 |

### 模式 2 — 跨度视图（`span`）

**读法**：「从开始到截止占多久」

采用 **横向甘特图**：

```
        6/26  6/27  6/28  6/29  6/30
              ┃今天┃
任务A   ████████████
任务B           ●
```

| 规则 | 说明 |
|------|------|
| 布局 | 左栏 sticky 标题（96px）+ 右栏横向滚动时间轴 |
| 列宽 | 每 day 40px；顶栏日期刻度 |
| 排序 | `effectiveStart` 升序 → `dueDate` → 标题 |
| 条形 | 有 `startDate` 为横条；无则为 8px 圆点 |
| 今天 | 贯穿全表的 primary 竖线；打开时自动滚到 today 居中 |
| 无 `dueDate` | 底部「无日期」分区（与截止视图一致） |

---

## 视觉规范（Soft UI + 数据密度）

沿用 `data-theme="todos"` token，时间轴区域 **不用 Bento Section Card**：

| 元素 | 样式 |
|------|------|
| 页面底 | `bg-background`（`#F8FAFC`） |
| spine 文字 | 逾期 `--status-expired`；今天 `--primary`；默认 `--muted-foreground` |
| 行分隔 | `border-b border-border/50` |
| 行 hover | `bg-muted/30`（仅视觉反馈，无必点操作） |
| 无日期分区头 | `text-xs text-muted-foreground`，上边框虚线 |
| Segmented Control | shadcn `ToggleGroup` 或等效，高 32px，贴搜索框下方 |

**行高**：`h-8`（32px），`text-sm`，标题 `truncate`。

---

## 交互规范

| 操作 | 时间轴 | 列表视图 |
|------|--------|----------|
| 标记完成 | ❌ | ✅ |
| 拖拽改期 | ❌ | ❌（未来可选） |
| 进编辑页 | ❌ 默认不链（可选：整行 tap → 详情，**非 MVP**） |
| 搜索 | ✅ | ✅ |
| 切换 截止/跨度 | ✅ | — |
| 新建待办 | FAB（Layout 已有） | FAB |

**MVP 交互集 = 搜索 + 视图切换 + 滚动**，满足「减少交互次数、纯甘特展示」。

---

## 组件拆分

| 文件 | 职责 |
|------|------|
| `TimelineOverview.tsx` | 总览：日期分组块 + 空档占位 |
| `TimelineView.tsx` | 容器：总览 / 跨度甘特路由 |
| `TimelineGanttChart.tsx` | 横向甘特（跨度视图） |
| `TimelineViewModeToggle.tsx` | 截止 / 跨度 Segmented Control |
| `timeline-utils.ts` | 日期窗口、排序、分组、条位置计算（纯函数，可单测） |

**删除或瘦身**：

- `TimelineTodoItem.tsx` — 由 `TimelineRow` 替代
- `TimelineView` 内 `draggable`、`useUpdateTodoDueDate`、`onToggleComplete` 全部移除

---

## TodosPage 改动

```tsx
// /todos/timeline 分支
const { data: todos = [] } = useTodos('assigned')  // 固定 assigned
const [mode, setMode] = useTimelineMode()          // localStorage 封装

<TimelineViewModeToggle value={mode} onChange={setMode} />
<TimelineView todos={filteredTodos} mode={mode} />
```

列表路由（`/todos`、`/todos/assigned` 等）行为不变。

---

## 边界情况

| 场景 | 行为 |
|------|------|
| 无待办 | 居中「暂无待办」 |
| 仅有无日期 | 只显示无日期分区 |
| 全部已完成 | 仍展示，整页低 opacity |
| 跨月跨度条 | 窗口自动扩展，条按比例缩短 |
| `startDate > dueDate` | 渲染时 swap，保证 left ≤ right |
| 搜索无结果 | 「无匹配待办」 |

---

## 性能

- MVP：待办量 < 100 直接渲染
- 若后续 > 100：对行列表加虚拟滚动（`@tanstack/react-virtual`，项目若已有则复用）
- 不在 MVP 范围

---

## 验收标准

1. `/todos/timeline` 仅展示分配给当前成员的待办
2. 截止视图：同截止日 N 条 → N 行，无合并
3. 跨度视图：每待办一行，有条形跨度；无 `startDate` 时为单日条
4. 无拖拽、无 checkbox、无描述块、无日期 Card 套娃
5. 切换视图模式 persisted 到 localStorage
6. 375px 宽可用：spine 52px + 标题区可 truncate
7. `npm run build` 通过；列表视图行为无回归

---

## 与既有 spec 的关系

- 替换 `2026-06-28-multi-theme-ui-design.md` 中「时间轴 = Bento Section Card 分组」的呈现方式
- 仍使用 `todos` theme token；仅放弃时间轴区域的 Bento 大 Card 模式
- 原 `2026-06-26` spec 中「时间轴支持拖拽改期」**在本视图禁用**（列表/详情保留改期能力）

---

## 参考

- UI UX Pro Max：Soft UI Evolution（轻阴影、语义色）；数据视图优先密度 over Bento
- 项目组件：shadcn `ToggleGroup`、`Input`（搜索）

---

**请审阅本文档。确认无误后回复「spec 通过」，再进入 implementation plan 与代码改动。**
