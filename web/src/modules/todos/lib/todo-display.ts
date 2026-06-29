import type { TodoItem } from '../types/todo-types'

/** 协商中列表/卡片展示标题（提案优先） */
export function getTodoDisplayTitle(todo: TodoItem): string {
  if (
    (todo.status === 'pending_accept' || todo.status === 'returned') &&
    todo.negotiationSnapshot?.title
  ) {
    return todo.negotiationSnapshot.title
  }
  return todo.title
}
