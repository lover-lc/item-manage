# 待办协作 UX 增强设计

**日期**: 2026-06-28  
**状态**: 已确认

## 背景

家庭待办 A→B 协作场景需要更清晰的角色区分，以及对待确认/待验收/已驳回/催办类事项的强制处理流程。

## 已确认决策（2026-06-28 更新）

| 项 | 决策 |
|----|------|
| 需要反馈 | 负责人 ≠ 当前成员 → 强制 `requireFeedback=true`，无开关；负责人 = 自己 → `false` |
| 编辑改负责人 | 自动同步 `requireFeedback` |
| 强制弹窗 | 仅列表入口，去掉「请先完成以下 N 项」；点击跳转详情 |
| 详情页操作 | 同意/拒绝、验收/驳回、重新提交完成 |
| 弹窗与详情 | 查看待处理待办详情时隐藏 Modal，返回列表后再显示 |
| 处理完成后 | 自动返回 `/todos`，若仍有待办则再次弹出列表 |

## 1. 保存失败滚动

- 必填字段：标题、所属清单、负责人
- 校验失败：滚到第一个错误字段、`focus`、边框高亮、字段下显示错误文案
- 服务端错误：滚到表单顶部错误区

## 2. 卡片角色标签

相对当前成员：

| 类型 | 条件 | 标签 |
|------|------|------|
| 自有 | creator = assignee = 我 | 无 |
| 我派发 | creator = 我，assignee ≠ 我 | `→ {负责人名}` + 头像 |
| 分配给我 | assignee = 我，creator ≠ 我 | `← {创建人名}` + 头像 |

## 3. 强制待办队列（PendingActionsGate）

挂载于 `TodoTabLayout`，进入 `/todos` 时若队列非空则全屏 Modal（无关闭按钮、不可点遮罩关闭）。

队列项来源：

| 角色 | 状态 | 操作 |
|------|------|------|
| 负责人 | `pending_accept` | 同意 / 拒绝（填理由） |
| 负责人 | `returned` | 勾选重新提交完成 |
| 创建人 | `pending_review` | 验收通过 / 驳回（填理由） |
| 任一 | 未读 `reminder` 且关联待办仍待处理 | 完成对应待办操作 |

全部处理完后 Modal 关闭，露出正常界面。

## 4. 通知中心

- 队列非空：点铃铛打开同一强制 Modal（非 Popover）
- 队列空：保持 Popover
- 待处理通知不可删除；禁用「全部已读」当队列非空
- 待办操作完成后自动 mark read 关联通知

## 组件结构

```
lib/pending-actions.ts       — 队列计算、是否可删通知
components/PendingActionsModal.tsx
components/TodoRelationBadge.tsx
TodoFormPage                   — 字段 ref + 滚动
TodoCard / gantt-shared        — 关系标签
TodoTabLayout                  — Gate 挂载
NotificationCenter             — 铃铛分支
```

## 测试

- `pending-actions.test.ts`：队列计算、关系标签逻辑
- 现有测试保持通过
