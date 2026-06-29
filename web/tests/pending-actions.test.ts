import { describe, expect, it } from 'vitest'
import {
  buildPendingActionItems,
  getPendingActionKind,
  isNotificationDeletable,
} from '../src/modules/todos/lib/pending-actions'
import { getTodoRelation } from '../src/modules/todos/lib/todo-relation'
import type { TodoItem, TodoNotification } from '../src/modules/todos/types/todo-types'

const todo = (overrides: Partial<TodoItem>): TodoItem => ({
  id: 't1',
  title: '测试待办',
  description: null,
  listId: 'l1',
  privateListId: null,
  sharedListId: null,
  creatorId: 'a',
  assigneeId: 'b',
  priority: null,
  startDate: null,
  dueDate: null,
  requireFeedback: true,
  status: 'pending_accept',
  awaitingMemberId: 'b',
  negotiationSnapshot: null,
  creatorAgreedAt: '2026-01-01',
  assigneeAgreedAt: null,
  recurrenceRule: null,
  parentRecurrenceId: null,
  completedAt: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  ...overrides,
})

const notification = (
  overrides: Partial<TodoNotification>,
): TodoNotification => ({
  id: 'n1',
  recipientId: 'b',
  type: 'assigned',
  todoItemId: 't1',
  message: '分配了待办',
  isRead: false,
  createdAt: '2026-01-01',
  ...overrides,
})

describe('getTodoRelation', () => {
  it('detects outbound and inbound todos', () => {
    expect(getTodoRelation(todo({ creatorId: 'a', assigneeId: 'b' }), 'a')).toBe(
      'outbound',
    )
    expect(getTodoRelation(todo({ creatorId: 'a', assigneeId: 'b' }), 'b')).toBe(
      'inbound',
    )
    expect(getTodoRelation(todo({ creatorId: 'a', assigneeId: 'a' }), 'a')).toBe(
      'self',
    )
  })
})

describe('buildPendingActionItems', () => {
  it('queues pending accept for assignee', () => {
    const items = buildPendingActionItems(
      [todo({ status: 'pending_accept' })],
      [],
      'b',
    )
    expect(items).toHaveLength(1)
    expect(items[0]?.kind).toBe('pending_accept')
  })

  it('queues returned todos for assignee', () => {
    const items = buildPendingActionItems(
      [todo({ status: 'returned', awaitingMemberId: 'b' })],
      [],
      'b',
    )
    expect(items[0]?.kind).toBe('returned')
  })

  it('skips negotiation when not awaiting current member', () => {
    const items = buildPendingActionItems(
      [todo({ status: 'pending_accept', awaitingMemberId: 'a' })],
      [],
      'b',
    )
    expect(items).toHaveLength(0)
  })

  it('queues rejected todos for creator', () => {
    const items = buildPendingActionItems(
      [todo({ status: 'rejected', awaitingMemberId: null })],
      [],
      'a',
    )
    expect(items).toHaveLength(1)
    expect(items[0]?.kind).toBe('rejected')
  })

  it('queues pending review for creator', () => {
    const items = buildPendingActionItems(
      [todo({ status: 'pending_review' })],
      [],
      'a',
    )
    expect(items[0]?.kind).toBe('pending_review')
  })

  it('locks assigned notifications while action pending', () => {
    const items = buildPendingActionItems(
      [todo({ status: 'pending_accept' })],
      [notification({ type: 'assigned' })],
      'b',
    )
    expect(items[0]?.notificationIds).toContain('n1')
    expect(
      isNotificationDeletable(notification({ type: 'assigned' }), [todo()], 'b'),
    ).toBe(false)
  })
})

describe('getPendingActionKind', () => {
  it('returns null when no action required', () => {
    expect(getPendingActionKind(todo({ status: 'in_progress' }), 'b')).toBeNull()
  })
})
