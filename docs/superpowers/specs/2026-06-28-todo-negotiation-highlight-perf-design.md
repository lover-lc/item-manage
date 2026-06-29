# 待办协商高亮、提案模式与性能优化

## 确认结论（2026-06-28）

| 项 | 决策 |
|----|------|
| 1 | 1A：自己指派给自己不高亮；仅指派给他人且协商中 |
| 2 | 2A：`rejected` 时创建者显示相对快照的变更高亮 |
| 3 | 3C：处理后清除铃铛 `!` 与通知未读 |
| 4 | 4A：`submit` 不写主字段，待确认方看 snapshot vs 主字段 diff |
| 5 | 5A：协商中列表标题读 `negotiation_snapshot` |
| 6 | 6A：性能 P0（列表去掉同步 ensureMemberPrivateList）+ P1（详情 placeholderData） |

## 变更高亮

- `shouldShowNegotiationHighlights(todo, memberId)` 控制是否标色
- `getHighlightBaseline(todo, memberId)`：驳回→快照；待确认方→DB 主字段
- 待确认方表单加载提案（snapshot）；日期字段分别高亮

## 提案模式

- `submit`：仅更新 `negotiation_snapshot`、同意时间、`awaiting_member_id`、清单（创建者）
- `agree` 双方达成一致：将 snapshot 合并入主字段（含标签）
- 列表/卡片：`pending_accept` / `returned` 显示 snapshot 标题

## 待办数量标识

- 操作成功后：`markTodoNotificationsRead` + 乐观更新 `todos` / `todo` 缓存

## 性能

- P0：列表 fetch 不再 N 次 `ensureMemberPrivateList`
- P1：`useTodo` 使用列表缓存 `placeholderData`
