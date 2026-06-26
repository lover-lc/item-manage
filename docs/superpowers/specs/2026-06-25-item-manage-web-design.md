# 物品整理 Web App 设计文档

**日期**: 2026-06-25  
**平台**: Web / PWA（浏览器 + 可「添加到主屏幕」）  
**替代方案**: 取代 iOS 原生 App 作为唯一维护目标  
**远程仓库**: https://gitee.com/WLL1011/item-manage

## 背景与目标

用户确认：

- **分类**：方案 A（镜像区域模式），**必填**；列表仍**按区域分组**；卡片**增加显示分类**；支持**按分类筛选**；**搜索包含分类名**；区域与分类管理合并为 **「管理」Tab**
- **平台**：改为**网页实现**，零成本长期使用，无 iOS 7 天签名续签问题

本设计在保留 iOS 版全部 Phase 1 + Phase 2 功能的基础上，新增分类维度，并以 Web PWA 为唯一交付目标。

## 技术方案

### 技术栈

| 层级 | 选型 | 理由 |
|------|------|------|
| 框架 | React 19 + TypeScript | 生态成熟，组件化清晰 |
| 构建 | Vite | 快速 HMR，静态产物适合 Pages 部署 |
| 路由 | React Router | Tab + 详情/表单页导航 |
| 样式 | Tailwind CSS 4 | 移动优先布局，极简风格 |
| 远程存储 | Supabase PostgreSQL | 多设备同步；与 desktop-pet-cc 同一项目 |
| 查询缓存 | TanStack Query | 自动缓存、乐观更新 |
| UI 状态 | Zustand | 筛选、排序等临时状态 |
| Auth | Supabase Auth | 1 个共享账号，RLS 按 user_id 隔离 |
| PWA | vite-plugin-pwa | 离线缓存壳、可添加到主屏幕 |
| 测试 | Vitest | 成本计算、校验逻辑单元测试 |
| 部署 | GitHub Pages | 零成本静态托管，`base: '/item-manage/'`，GitHub Actions |

### 架构

```
web/
├── src/
│   ├── lib/             # supabase、types、成本计算、校验、排序、搜索
│   ├── hooks/           # use-items、use-areas、use-categories、use-auth
│   ├── components/      # 通用 UI（卡片、表单、日期选择器等）
│   ├── pages/           # 物品列表、搜索、管理、详情、表单、登录
│   ├── store/           # Zustand（筛选、排序）
│   └── App.tsx          # Tab 导航 + 路由
├── supabase/migrations/ # 数据库表结构 + RLS
├── public/
│   └── manifest.json    # PWA 清单
└── index.html
```

**数据流**：UI → React Query → Supabase Client → PostgreSQL（RLS）。环境变量与 `desktop-pet-cc` 相同。

### 与 iOS 版关系

- `ItemManage/`（Swift）**暂停维护**，保留在仓库作参考
- 新功能仅在 `web/` 实现
- iOS 数据**不迁移**；JSON 导出/导入用于 Web 端备份

---

## 数据模型

### Item（物品）

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string (UUID) | 是 | 主键 |
| name | string | 是 | 物品名称 |
| purchasePrice | number | 是 | 买入价格（≥ 0） |
| startDate | string (ISO date) | 是 | 开始使用时间（YYYY-MM-DD） |
| endDate | string \| null | 否 | 用完时间 |
| expiryDate | string \| null | 否 | 过期时间 |
| areaId | string | 是 | 所属区域 FK |
| categoryId | string | 是 | 所属分类 FK |
| specificLocation | string | 是 | 具体位置描述 |
| createdAt | string (ISO datetime) | 是 | 创建时间 |
| updatedAt | string (ISO datetime) | 是 | 更新时间 |

**派生字段（不存库）**：

- `usedDays`、`dailyCost`、`isExpired`、`isExpiringSoon`、`isUsedUp`、`displayStatus` — 逻辑与 iOS 版一致

### Area（区域）

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 主键 |
| name | string | 是 | 区域名称 |
| isSystemReserved | boolean | 否 | 系统保留标记 |
| createdAt | string | 是 | 创建时间 |

### Category（分类）— 新增

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 主键 |
| name | string | 是 | 分类名称 |
| isSystemReserved | boolean | 否 | 系统保留「未分类」 |
| createdAt | string | 是 | 创建时间 |

### 实体关系

```
Area    ←──(1:N)──→ Item ←──(N:1)──→ Category
```

- 删除区域 / 分类时，若有关联物品，弹窗三选一：**迁到其他** / **删除全部物品** / **移至「未分类」**
- 「未分类」在 Area 与 Category 各保留一份，系统保留、不可删除、不出现在添加/编辑 Picker 中

### 首次登录 Seed

用户首次登录后，若该账号下无区域数据，应用自动创建：

**预置区域**：客厅、卧室、厨房、卫生间、储藏室、未分类（系统）

**预置分类**：日用品、食品、宠物用品、清洁用品、未分类（系统）

---

## UI 与导航

### Tab 结构（3 个）

```
├── 物品（Tab 1）     house 图标
├── 搜索（Tab 2）     magnifyingglass 图标
└── 管理（Tab 3）     slider.horizontal.3 或 gear 图标
    ├── 区域管理（Segment / 子 Tab）
    └── 分类管理（Segment / 子 Tab）
```

「管理」页内用 **Segmented Control** 切换「区域 | 分类」，各自独立列表与 CRUD，交互镜像 iOS `AreaManageView`。

### 物品列表（首页）

**分组**：按**区域** Section 展示（含 0 件空区域）

**卡片布局**：

```
┌─────────────────────────────────────┐
│ 物品名称                   ¥12.50/天 │
│ 卧室 > 衣柜第二层 · 宠物用品    🟡   │
└─────────────────────────────────────┘
```

- 副标题格式：`{区域} > {具体位置} · {分类}`
- 右侧：每日成本（橙色）+ 状态图标（已用完 > 已过期 > 即将过期）

**工具栏**：

- 「+」→ 添加物品表单
- **筛选 Menu**：区域（全部 / 各区域）+ 分类（全部 / 各分类）；两个维度 **AND** 组合
- **排序 Menu**：名称、创建时间、每日成本、买入价格、开始使用时间 × 升/降序；默认名称升序

**空状态**：

- 无物品：「点击 + 添加第一个物品」
- 筛选无结果：「当前筛选条件下没有物品」

**交互**：点击进入详情；列表项支持删除（滑动或删除按钮，Web 用 swipe 或行内删除图标）

### 物品详情

与 iOS 一致：基本信息、位置（区域 + 具体位置 + **分类**）、时间、成本统计、状态；支持编辑、标记已用完、删除确认。

### 添加/编辑表单

**分段**：

1. **基本信息**：名称、价格
2. **位置与分类**：区域 Picker（可快速新建）、**分类 Picker（可快速新建）**、具体位置
3. **时间信息**：开始时间、用完时间（Toggle）、过期时间（Toggle）

**日期选择器**：年月日滚轮，从左到右 **年 | 月(01–12) | 日(01–31)**（沿用 iOS 版 YMD 交互）

**校验**：

- 名称非空
- 价格 ≥ 0
- 必须选择区域和分类
- 开始时间不能晚于用完时间

### 搜索

- 实时搜索，范围：**物品名称、区域名称、分类名称、具体位置**
- 支持排序（同列表）
- 关键词高亮（名称匹配部分加粗）

### 管理页 — 区域 / 分类

各自支持：

- 查看列表及物品数量
- 添加、重命名
- 删除（有物品时三选一 Sheet）
- 系统保留项不可删
- 导航栏「帮助」→ 多页 Onboarding（可复用 iOS 文案并补充分类说明）

---

## 业务规则（与 iOS 对齐）

### 每日成本

```
已用完：usedDays = endDate - startDate（天）
使用中：usedDays = 今天 - startDate（天）
dailyCost = purchasePrice / usedDays
```

- 当天购买当天使用：usedDays = 1
- 价格为 0：显示 ¥0.00/天
- 日期精确到天，存 ISO date 字符串

### 状态优先级

已用完 > 已过期 > 即将过期（7 天内）> 使用中

### 排序与筛选

- 筛选：区域 ID + 分类 ID，均为可选「全部」
- 列表 Section 仍展示所有区域（筛选时只显示匹配区域 Section）

---

## 数据持久化与备份

### Supabase

- 表：`areas`、`categories`、`items`（均含 `user_id`）
- RLS：`auth.uid() = user_id`
- 1 个共享账号，多设备登录同一邮箱密码即可同步

### 导出 / 导入（Phase 1 Web 必做）

- **导出**：下载 `item-manage-backup.json`（含 areas、categories、items）
- **导入**：选择 JSON 文件 → **弹窗明确告知将全量覆盖现有数据** → 用户点击确认后才执行导入（取消则不改动）
- **策略**：全量覆盖（不合并）；合并导入作为后续增强
- 入口：管理 Tab 底部或设置区

### 数据安全说明

- 数据存 Supabase 云端；须登录方可读写
- 未登录用户无法访问（RLS）
- 不加密（与 iOS 版一致）；建议定期 JSON 导出备份

---

## PWA 与部署

### PWA

- `manifest.json`：名称「物品整理」、theme-color、icons
- Service Worker：缓存静态资源，支持弱网/offline 打开壳
- iOS Safari：用户手动「添加到主屏幕」后全屏使用

### 部署

- 构建产物 `web/dist/` 部署到 **Gitee Pages**
- `base: '/item-manage/'`
- 零服务器成本

### 使用方式

1. 浏览器打开 Gitee Pages URL，使用共享账号登录
2. （可选）添加到主屏幕，当作 App 使用
3. 定期导出 JSON 备份

---

## 测试策略

### 单元测试（Vitest）

- `ItemCostCalculator`：成本、天数、边界（当天购买、价格为 0）
- `ItemFormValidator`：校验规则
- 搜索/filter 纯函数

### 手动测试清单

- 首次打开 Seed 数据
- CRUD 物品 / 区域 / 分类
- 删除区域/分类三选一
- 双维度筛选
- 搜索含分类名
- 导出再导入后数据完整
- 移动端 Safari / Chrome 布局

---

## 开发优先级

### Phase 1 — Web MVP

1. 项目脚手架（Vite + React + TS + Tailwind）
2. Supabase migration + 登录 + 首次登录 Seed + CRUD
3. 物品列表（区域分组、卡片含分类、筛选、排序）
4. 物品详情 + 表单 + YMD 日期选择器
5. 搜索
6. 管理 Tab（区域 + 分类）
7. JSON 导出 / 导入
8. PWA + Pages 部署说明

### Phase 2 — 体验完善

1. Onboarding 多页引导
2. 删除确认、动画、空状态插画
3. 深色模式
4. 响应式 polish

### 不做（YAGNI）

- iOS 数据自动迁移 / iOS 新功能
- 微信小程序
- CSV 格式（JSON 足够）
- 多账号共享组（当前 1 个共享账号足够）

---

## 风险与限制

| 风险 | 缓解 |
|------|------|
| 离线无法写入 | Phase 1 接受；Toast 提示 |
| 共享账号密码泄露 | 强密码 + RLS 阻止未登录访问 |
| iOS PWA 能力弱于原生 | 接受；核心 CRUD 足够 |
| Supabase 免费套餐超限 | 单用户数据量极小，风险低 |

---

## 已确认决策汇总

| 主题 | 决策 |
|------|------|
| 平台 | Web PWA，取代 iOS 为唯一维护目标 |
| 分类 | 必填，镜像 Area 模式 |
| 列表分组 | 按区域 |
| 卡片 | 副标题增加分类（`区域 > 位置 · 分类`） |
| 筛选 | 区域 + 分类，AND 组合 |
| 搜索 | 含分类名 |
| 管理 Tab | 区域 + 分类 Segmented 合并 |
| 预置分类 | 日用品、食品、宠物用品、清洁用品 + 未分类 |
| 存储 | Supabase 云端（同 desktop-pet-cc 项目） |
| Auth | 1 个共享账号 + RLS |
| 备份 | JSON 导出/导入；导入前二次确认后全量覆盖 |
| 部署 | Gitee Pages，零成本 |
| iOS 数据 | 不迁移 |

---

## 总结

Web 版在功能上 **≥ iOS Phase 1+2 + 分类**，通过 Supabase 实现多设备同步，通过 PWA + Gitee Pages 实现零成本长期使用。iOS 代码保留但不迭代；用户登录共享账号后通过浏览器或主屏幕快捷方式日常使用。
