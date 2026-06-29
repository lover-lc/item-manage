import { describe, expect, it } from 'vitest'
import { buildListGroups, listFormToPlacements } from '../src/modules/todos/lib/todo-list-placement'
import type { TodoItem, TodoList } from '../src/modules/todos/types/todo-types'

const lists: TodoList[] = [
  {
    id: 'private-1',
    name: '私人',
    ownerId: 'm1',
    color: null,
    sortOrder: 0,
    visibility: 'private',
    createdAt: '2026-01-01',
  },
  {
    id: 'shared-1',
    name: '共享',
    ownerId: 'm1',
    color: null,
    sortOrder: 1,
    visibility: 'shared',
    createdAt: '2026-01-01',
  },
]

const item: TodoItem = {
  id: 't1',
  title: '测试',
  description: null,
  listId: 'private-1',
  creatorId: 'm1',
  assigneeId: 'm2',
  priority: null,
  startDate: null,
  dueDate: null,
  requireFeedback: false,
  status: 'in_progress',
  awaitingMemberId: null,
  negotiationSnapshot: null,
  creatorAgreedAt: null,
  assigneeAgreedAt: null,
  recurrenceRule: null,
  parentRecurrenceId: null,
  completedAt: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

describe('listFormToPlacements', () => {
  it('maps shared list selection to shared placement only', () => {
    expect(listFormToPlacements('shared-1', lists)).toEqual({
      privateListId: '',
      sharedListId: 'shared-1',
    })
  })

  it('maps private list selection to private placement only', () => {
    expect(listFormToPlacements('private-1', lists)).toEqual({
      privateListId: 'private-1',
      sharedListId: null,
    })
  })
})

describe('buildListGroups', () => {
  it('places shared todos only in shared group', () => {
    const groups = buildListGroups([item], lists, 'm1', {
      memberLists: new Map([['t1:m1', 'private-1']]),
      sharedLists: new Map([['t1', ['shared-1']]]),
    })

    expect(groups.find((g) => g.list.id === 'private-1')?.items).toHaveLength(0)
    expect(groups.find((g) => g.list.id === 'shared-1')?.items).toHaveLength(1)
  })
})
