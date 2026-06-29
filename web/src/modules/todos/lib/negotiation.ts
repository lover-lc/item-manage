import type { TodoItem, TodoStatus } from '../types/todo-types'

export function isNegotiationStatus(status: TodoStatus): boolean {
  return status === 'pending_accept' || status === 'returned'
}

export function getNegotiationOtherParty(
  todo: Pick<TodoItem, 'creatorId' | 'assigneeId'>,
  memberId: string,
): string {
  return todo.creatorId === memberId ? todo.assigneeId : todo.creatorId
}

export function isAwaitingMember(
  todo: Pick<TodoItem, 'awaitingMemberId'>,
  memberId: string | null,
): boolean {
  return Boolean(memberId && todo.awaitingMemberId === memberId)
}

export function canEditNegotiationContent(
  todo: Pick<TodoItem, 'status' | 'creatorId' | 'assigneeId'>,
  memberId: string | null,
): boolean {
  if (!memberId) return false
  if (todo.status === 'pending_accept' || todo.status === 'returned') {
    return todo.creatorId === memberId || todo.assigneeId === memberId
  }
  if (todo.status === 'rejected' && todo.creatorId === memberId) return true
  return false
}

export function canConfirmNegotiation(
  todo: Pick<TodoItem, 'status' | 'awaitingMemberId' | 'creatorId' | 'assigneeId'>,
  memberId: string | null,
): boolean {
  if (!memberId || !isNegotiationStatus(todo.status)) return false
  return isAwaitingMember(todo, memberId)
}

export function canRejectNegotiation(
  todo: Pick<TodoItem, 'status' | 'awaitingMemberId' | 'assigneeId'>,
  memberId: string | null,
): boolean {
  if (!memberId || todo.status !== 'pending_accept') return false
  return todo.assigneeId === memberId && isAwaitingMember(todo, memberId)
}
