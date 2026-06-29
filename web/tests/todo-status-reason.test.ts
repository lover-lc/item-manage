import { describe, expect, it } from 'vitest'
import {
  getLatestStatusReason,
  getStatusReasonLabel,
  pickStatusReasonsForTodos,
} from '../src/modules/todos/lib/todo-status-reason'
import type { TodoStatusLog } from '../src/modules/todos/types/todo-types'

const logs: TodoStatusLog[] = [
  {
    id: '1',
    todoItemId: 'a',
    fromStatus: 'pending_review',
    toStatus: 'returned',
    operatorId: 'creator',
    reason: '  还需要补充截图  ',
    createdAt: '2026-06-28T10:00:00Z',
  },
  {
    id: '2',
    todoItemId: 'b',
    fromStatus: 'pending_accept',
    toStatus: 'rejected',
    operatorId: 'assignee',
    reason: '时间冲突',
    createdAt: '2026-06-27T10:00:00Z',
  },
]

describe('todo-status-reason', () => {
  it('labels reject and return differently', () => {
    expect(getStatusReasonLabel('rejected')).toBe('拒绝理由')
    expect(getStatusReasonLabel('returned')).toBe('驳回理由')
  })

  it('finds latest matching reason for detail view', () => {
    expect(getLatestStatusReason(logs, 'returned')?.reason?.trim()).toBe('还需要补充截图')
  })

  it('maps reasons onto todos by current status', () => {
    const map = pickStatusReasonsForTodos(
      [
        { id: 'a', status: 'returned' },
        { id: 'b', status: 'rejected' },
        { id: 'c', status: 'in_progress' },
      ],
      logs,
    )
    expect(map.get('a')).toBe('还需要补充截图')
    expect(map.get('b')).toBe('时间冲突')
    expect(map.has('c')).toBe(false)
  })
})
