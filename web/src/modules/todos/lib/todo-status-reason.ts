import type { TodoStatus, TodoStatusLog } from '../types/todo-types'

export type ReasonStatus = 'rejected' | 'returned'

export function isReasonStatus(status: TodoStatus): status is ReasonStatus {
  return status === 'rejected' || status === 'returned'
}

export function getStatusReasonLabel(status: ReasonStatus): string {
  return status === 'rejected' ? '拒绝理由' : '驳回理由'
}

export function getLatestStatusReason(
  logs: TodoStatusLog[],
  status: ReasonStatus,
): TodoStatusLog | null {
  return (
    logs.find((log) => log.toStatus === status && log.reason?.trim()) ?? null
  )
}

export function pickStatusReasonsForTodos(
  todos: { id: string; status: TodoStatus }[],
  logs: TodoStatusLog[],
): Map<string, string> {
  const result = new Map<string, string>()

  for (const todo of todos) {
    if (!isReasonStatus(todo.status)) continue
    const match = logs
      .filter((log) => log.todoItemId === todo.id && log.toStatus === todo.status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    if (match?.reason?.trim()) {
      result.set(todo.id, match.reason.trim())
    }
  }

  return result
}
