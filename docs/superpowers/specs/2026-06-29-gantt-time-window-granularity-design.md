# 甘特图时间窗 + 日/周/月粒度设计

**日期**: 2026-06-29  
**类型**: 待办时间轴甘特重构（纯 UI，业务逻辑不变）  
**基于**: `2026-06-28-todo-timeline-gantt-design.md`  
**状态**: 已实现（2026-06-29）

---

## 用户确认摘要

| # | 决策 | 选择 |
|---|------|------|
| 1 | 实验变体 | **A — 移除 A–J**，收敛为单一正式甘特图 |
| 2 | 日/周/月含义 | **列宽单位**；切换粒度 **全量展示** 范围内所有列，**不分页** |
| 9 | 导航 | **无 ◀▶ 翻页**；横向滚动浏览全部列 |
| 10 | 「今天」按钮 | **仅滚动定位** 到 today 列，**不改变** 日期范围 |
| 3 | 截止时间范围 | **C — 联动**：范围 = 可见窗口，并按交叉规则过滤待办 |
| 4 | 窗口外条形 | **C — 显示交叉任务**；窗外段 **虚线 + 半透明** |
| 5 | 列宽语义 | **无固定默认窗口**；三档粒度代表 **列的单位宽度** |
| 6 | 总览模式 | **B — 总览也支持日/周/月分组**（与甘特共用粒度切换） |
| 7 | 持久化 | **写入 localStorage** |
| 8 | 首次进入范围 | **B — 以今天为中心推算**，仅 localStorage 为空时生效 |

---

## 目标与非目标

### 目标

1. 甘特图采用 **固定时间窗** 模式：用户选定起止日期，范围内 **全量渲染** 当前粒度所有列，超出视口时 **横向滚动**
2. 支持 **日 / 周 / 月** 三档列粒度，条形宽度按任务跨度与列单位换算
3. 支持 **自定义截止时间范围**（起止日期选择器）
4. 总览视图与甘特 **共用粒度切换**，总览按粒度分组
5. 偏好持久化到 localStorage

### 非目标

- 不保留 A–J 实验变体及 `GanttVariantPicker`
- 不在甘特内拖拽改期、勾选完成
- 不改 Supabase 表结构、hooks、RLS
- 不引入甘特库或新 npm 依赖
- **不做 ◀▶ 翻页 / 窗口平移**（粒度切换 ≠ 分页）
- 总览模式 **不** 按甘特日期范围过滤（仅分组方式变化；数据仍为全部「分配给我」待办）

---

## 现状与变更范围

### 移除

| 文件/符号 | 说明 |
|-----------|------|
| `GanttVariantPicker.tsx` | 10 变体选择器 |
| `gantt-types.ts` 中 `GANTT_VARIANTS` | A–J 元数据 |
| `use-gantt-variant.ts` | 变体持久化 hook |
| `GanttChartBody.tsx` 中 `VariantA`–`VariantJ` | 合并为单一 `GanttChart` |

### 新增 / 重构

| 文件 | 职责 |
|------|------|
| `hooks/use-gantt-prefs.ts` | 粒度、范围、localStorage 读写 |
| `components/gantt/GanttToolbar.tsx` | 日期范围选择 + [今天] 滚动定位 |
| `components/TimelineGranularityToggle.tsx` | 日/周/月 Segmented Control（总览 + 甘特共用） |
| `components/gantt/GanttChart.tsx` | 单一甘特实现（替代多 Variant） |
| `lib/gantt-scale.ts` | 列生成、条形像素、today 列偏移（纯函数，可单测） |
| `lib/timeline-utils.ts` | 扩展 `buildOverviewSegments(granularity)` 支持周/月分组 |

---

## 信息架构

### 时间轴页控件层级

```
TodosPage（/todos/timeline）
├── 搜索框
├── TodoFilterBar
├── TimelineViewModeToggle          [ 总览 ] [ 跨度 ]
├── TimelineGranularityToggle       [ 日 ] [ 周 ] [ 月 ]   ← 两种模式共用
├── （仅跨度模式）
│     GanttToolbar
│     ├── 起止日期选择 + [应用]
│     └── [今天]  ← 滚动到 today 列，不改范围
└── TimelineView
      ├── TimelineOverview（总览，受 granularity 影响分组）
      └── GanttChart（跨度，受 granularity + range 影响）
```

---

## 核心概念

### 1. 列粒度（Column Unit）

三档粒度决定 **每一列代表的时间单位**，而非窗口大小：

| 粒度 | 1 列 = | 示例：10 天任务条形 |
|------|--------|---------------------|
| `day` | 1 自然日 | 10 列宽 |
| `week` | 1 ISO 周（周一至周日） | 10 ÷ 7 ≈ **1.43 列** |
| `month` | 1 自然月 | **< 1 列**（按经过的自然月天数比例） |

列在 UI 上的物理宽度固定（沿用 `GANTT_DAY_WIDTH_STANDARD = 40px` 为基准单位宽；周/月列同宽，仅语义不同）。

**全量展示**：在选定范围内，按当前粒度 **一次性生成并渲染全部列**（日 = 每天一列，周 = 每周一列，月 = 每月一列）。列数可能很多，通过 **横向滚动** 浏览，**不提供 ◀▶ 翻页**。

### 2. 时间窗（Window）

- `rangeStart` / `rangeEnd`（ISO 日期字符串，含起止日）
- 横轴渲染 `[rangeStart, rangeEnd]` 内 **当前粒度的全部列**
- 用户通过日期选择器设定；点击「应用」后更新范围并重算列与待办

### 3. 首次进入默认范围（localStorage 为空时）

以 **今天** 为中心，按当前粒度推算，**写入 localStorage 后不再自动重置**：

| 粒度 | 默认 rangeStart | 默认 rangeEnd |
|------|-----------------|---------------|
| `day` | today − 7 天 | today + 7 天 |
| `week` | 本周周一 − 2 周 | 本周周日 + 2 周 |
| `month` | 上月 1 日 | 下月最后一天 |

切换粒度 **不** 自动重置范围；列数随粒度重算，仍全量渲染 + 横向滚动。

### 4. 「今天」按钮

**仅滚动定位**，不改变 `rangeStart` / `rangeEnd`：

| 条件 | 行为 |
|------|------|
| today ∈ `[rangeStart, rangeEnd]` | 横向滚动使 today 所在列 **居中**（复用 `scrollToToday`） |
| today ∉ 当前范围 | 按钮 **disabled** 或点击无效果（不自动改范围） |

打开甘特时：若 today 在范围内，**自动** 执行一次 scroll-to-today（与现有行为一致）。

---

## 待办过滤与条形渲染

### 过滤规则

任务 **normalizedSpan**（`startDate ?? dueDate ?? createdAt` 至 `dueDate`）与 `[rangeStart, rangeEnd]` **有任何日期交叉** 即显示。

无 `dueDate` 的待办：不参与甘特行，仍在底部「无日期」分区（与现有一致）。

### 条形分段渲染（4C）

对每个可见任务，将 span 映射到窗口坐标：

| 区段 | 样式 |
|------|------|
| 与 `[rangeStart, rangeEnd]` 交集部分 | 实心、`getBarColor()` 正常色 |
| 超出 rangeStart 左侧部分 | 若 start < rangeStart：左端 **虚线边框 + opacity-50** |
| 超出 rangeEnd 右侧部分 | 若 end > rangeEnd：右端 **虚线边框 + opacity-50** |

无 `startDate` 的截止点：仍为 **8px 圆点**，不随列宽放大。

跨月/跨周长条：按 `gantt-scale.ts` 分段累加各列内偏移与宽度（见算法节）。

---

## 列与条形算法（`gantt-scale.ts`）

### 生成列数组

```ts
type GanttGranularity = 'day' | 'week' | 'month'

type GanttColumn = {
  key: string          // '2026-06-28' | '2026-W26' | '2026-06'
  start: string        // 列覆盖区间起（ISO）
  end: string          // 列覆盖区间止（ISO）
  widthPx: number      // 固定 40
}
```

- **day**：`rangeStart` 到 `rangeEnd` 逐日一列
- **week**：覆盖范围内每个 ISO 周一一列；首尾列 `start`/`end` 可截断到 range 边界
- **month**：覆盖范围内每个自然月一列；首尾列截断到 range 边界

### 条形像素（有 startDate）

1. 取 `normalizedSpan(todo)` → `{ start, end }`
2. 对每列计算交集天数 `overlapDays`
3. `leftPx` = 第一列起始偏移（列内按天比例）+ 前面完整列宽之和
4. `widthPx` = 各列交集宽度之和
5. 若 `start < rangeStart`：左端标记 `clipStart: true`（虚线/半透明）
6. 若 `end > rangeEnd`：右端标记 `clipEnd: true`

**月列内比例**：列内第 d 天位置 = `(d - 1) / daysInMonth` × columnWidth

**周列内比例**：列内第 d 天位置 = `(d - 1) / 7` × columnWidth

### 条形像素（无 startDate，仅 dueDate）

- 定位到 `dueDate` 所在列内天位置，宽 8px 圆点

---

## 甘特 UI 规范

### GanttToolbar

```
起 [ date input ]  止 [ date input ]  [ 应用 ]    [ 今天 ]
```

- 粒度切换在 `TimelineGranularityToggle`，Toolbar **不重复**
- 日期控件：原生 `<input type="date">` 或 shadcn 等价，移动端友好
- 校验：`rangeStart <= rangeEnd`；否则禁用「应用」并提示
- 范围标签（可选）：`6/22 — 7/6`，只读展示当前范围
- 「今天」：见 §4，仅 scroll，不改范围

### 甘特表

- 左栏 sticky 标题列 96px（沿用 `GANTT_LABEL_WIDTH`）
- 顶栏 sticky：粒度决定表头文案
  - day：`6/28` + 今天标签
  - week：`6/23–6/29` 或 `第 26 周`
  - month：`2026年6月`
- 行高 32px；今天贯穿竖线（today 在窗口内时）
- 周末列：`bg-muted/20`（仅 day 粒度）

### 移除变体后的视觉基准

以原 **Variant A（网格 + 斑马纹 + 14px 条）** 为默认皮肤，保留：
- 网格竖线
- 斑马纹行
- 语义色条（逾期/今天/完成）— 来自 `getBarColor`

不保留：热力图、双行头实验、卡片行、周折叠迷你甘特等变体特性。

---

## 总览模式（6B）

### 共用粒度

`TimelineGranularityToggle` 置于 `TimelineViewModeToggle` 下方，**总览与甘特均可见**。

### 分组规则

| 粒度 | 分组键 | Spine 展示 |
|------|--------|------------|
| `day` | `dueDate` | 现有 `formatSpineMeta`（6/28、今天、逾期…） |
| `week` | ISO 周 `YYYY-Www` | `第 N 周` + 该周周一日期；组内待办按 dueDate 排序 |
| `month` | `YYYY-MM` | `2026年6月`；组内待办按 dueDate 排序 |

### 空档占位

在 **day** 粒度下沿用现有 `buildGapBetween` 逻辑。

**week / month** 粒度：组间空档简化为 **medium/large 一档**（不插入 small 16px 占位），标签示例：
- week：`6/10 — 6/16 · 无待办`
- month：`5 月 — 7 月 · 无待办`

### 数据范围

总览 **不过滤** 甘特日期范围，仍展示全部已过滤（搜索 + TodoFilterBar）的待办。

---

## 持久化

### localStorage 键

`todo-gantt-prefs`

```json
{
  "granularity": "day",
  "rangeStart": "2026-06-22",
  "rangeEnd": "2026-07-06"
}
```

- `granularity`：总览 + 甘特共用
- `rangeStart` / `rangeEnd`：仅甘特使用；切换至总览时不丢失

### 与现有键共存

| 键 | 用途 |
|----|------|
| `todo-timeline-mode` | `due` / `span`（不变） |
| `todo-gantt-prefs` | 粒度 + 范围（新） |
| ~~`todo-gantt-variant`~~ | 删除 |

---

## 组件与数据流

```
useGanttPrefs()
  ├── granularity, setGranularity
  ├── rangeStart, rangeEnd, setRange
  └── persisted to localStorage

TodosPage
  ├── TimelineGranularityToggle(granularity)
  └── TimelineView(mode, granularity, ganttPrefs?)

TimelineView
  ├── mode=due  → TimelineOverview(todos, granularity)
  └── mode=span → GanttChart(todos, granularity, range, onRangeChange)
```

---

## 边界情况

| 场景 | 行为 |
|------|------|
| 窗口内无交叉待办 | 甘特区显示「此范围内无待办」；无日期分区仍展示 |
| 任务 span 完全在窗外 | 不显示 |
| 任务 span 部分在窗内 | 显示，窗外段虚线半透明 |
| `startDate > dueDate` | `normalizedSpan` swap（现有逻辑） |
| 月模式窗口跨 2 个月 | 2 列；长条按各月天数比例分配宽度 |
| 切换粒度 | 列重算（全量），范围不变，条形按新粒度重绘 |
| range 仅 1 天 | 合法，单列 |
| today 不在范围内 | 「今天」按钮 disabled |
| 范围很大（如 90 天 × day） | 全量渲染 + 横向滚动（MVP 不做虚拟列） |
| 搜索后无结果 | 「无匹配待办」（页面级，不变） |

---

## 测试

新增 `web/tests/gantt-scale.test.ts`：

1. `buildColumns('day', range)` 列数 = daysBetween + 1
2. `buildColumns('week', range)` 首尾周截断正确
3. `computeBarPixels` — 10 天任务：day=10 列宽，week≈1.43 列，month<1 列
4. 交叉过滤：`span` 与 range 有 1 天重叠 → 包含
5. `computeTodayColumnOffset` — today 在范围内返回正确 scroll 偏移
6. `defaultRange('week')` 以 today 为中心 ±2 周

扩展 overview 测试（可选）：week 分组键正确。

---

## 验收标准

1. `/todos/timeline` 跨度模式 **无** A–J 变体选择器
2. 日/周/月切换后，表头与条形宽度符合列单位语义（10 天任务：日 10 列、周 ~1.5 列、月 <1 列）
3. 日期范围选择 + 应用后，窗口与过滤联动
4. 窗外条形段为虚线/半透明
5. 范围内 **全量列** 渲染，无 ◀▶ 翻页；可横向滚动
6. 「今天」仅滚动定位，不改日期范围；today 不在范围内时按钮 disabled
7. 总览模式按粒度分组（日/周/月）
8. 偏好写入 `todo-gantt-prefs`；刷新后恢复
9. 首次进入（无 prefs）按 §3 默认范围
10. `npm run build` 通过；列表视图无回归

---

## 与既有 spec 的关系

- **替换** `2026-06-28-todo-timeline-gantt-design.md` 中「跨度视图」的固定 40px/日滚动窗口描述
- **保留** 总览/跨度双模式、纯展示、assigned 数据源、无交互改期
- **废弃** 开发阶段 A–J 变体实验（`gantt-types` 中 10 项）

---

**请审阅本文档。确认无误后回复「spec 通过」，再进入 implementation plan 与代码改动。**
