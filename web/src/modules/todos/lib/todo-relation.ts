import type { TodoItem } from '../types/todo-types'

export type TodoRelation = 'self' | 'outbound' | 'inbound'

export function getTodoRelation(
  todo: Pick<TodoItem, 'creatorId' | 'assigneeId'>,
  memberId: string | null,
): TodoRelation | null {
  if (!memberId) return null
  if (todo.creatorId === memberId && todo.assigneeId === memberId) return 'self'
  if (todo.creatorId === memberId && todo.assigneeId !== memberId) return 'outbound'
  if (todo.assigneeId === memberId && todo.creatorId !== memberId) return 'inbound'
  return null
}

export function getTodoRelationTargetId(
  relation: TodoRelation,
  todo: Pick<TodoItem, 'creatorId' | 'assigneeId'>,
): string | null {
  if (relation === 'outbound') return todo.assigneeId
  if (relation === 'inbound') return todo.creatorId
  return null
}
