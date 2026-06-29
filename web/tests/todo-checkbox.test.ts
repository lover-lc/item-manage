import { describe, expect, it } from 'vitest'
import {
  getTodoCheckboxAction,
  isTodoCheckboxChecked,
} from '../src/modules/todos/services/todo-service'
import type { TodoItem } from '../src/modules/todos/types/todo-types'

const baseTodo: Pick<
  TodoItem,
  'status' | 'creatorId' | 'assigneeId' | 'requireFeedback' | 'awaitingMemberId'
> = {
  status: 'in_progress',
  creatorId: 'creator',
  assigneeId: 'assignee',
  requireFeedback: false,
  awaitingMemberId: null,
}

describe('isTodoCheckboxChecked', () => {
  it('is checked only for completed', () => {
    expect(isTodoCheckboxChecked('completed')).toBe(true)
    expect(isTodoCheckboxChecked('pending_review')).toBe(false)
    expect(isTodoCheckboxChecked('in_progress')).toBe(false)
  })
})

describe('getTodoCheckboxAction', () => {
  it('lets assignee complete in-progress todos', () => {
    expect(getTodoCheckboxAction(baseTodo, 'assignee')).toBe('complete')
  })

  it('prompts assignee to remind creator while pending review', () => {
    expect(
      getTodoCheckboxAction(
        { ...baseTodo, status: 'pending_review', requireFeedback: true },
        'assignee',
      ),
    ).toBe('remind')
  })

  it('lets creator verify pending review todos', () => {
    expect(
      getTodoCheckboxAction(
        { ...baseTodo, status: 'pending_review', requireFeedback: true },
        'creator',
      ),
    ).toBe('verify')
  })

  it('blocks unchecking feedback-required completed todos', () => {
    expect(
      getTodoCheckboxAction(
        { ...baseTodo, status: 'completed', requireFeedback: true },
        'assignee',
      ),
    ).toBe('none')
  })

  it('allows unchecking simple completed todos', () => {
    expect(
      getTodoCheckboxAction(
        { ...baseTodo, status: 'completed', requireFeedback: false },
        'assignee',
      ),
    ).toBe('uncomplete')
  })

  it('lets awaiting member accept pending accept todos', () => {
    expect(
      getTodoCheckboxAction(
        {
          ...baseTodo,
          status: 'pending_accept',
          awaitingMemberId: 'assignee',
        },
        'assignee',
      ),
    ).toBe('accept')
  })

  it('blocks accept when not awaiting member', () => {
    expect(
      getTodoCheckboxAction(
        {
          ...baseTodo,
          status: 'pending_accept',
          awaitingMemberId: 'creator',
        },
        'assignee',
      ),
    ).toBe('none')
  })

  it('blocks complete on returned when not awaiting member', () => {
    expect(
      getTodoCheckboxAction(
        {
          ...baseTodo,
          status: 'returned',
          awaitingMemberId: 'creator',
        },
        'assignee',
      ),
    ).toBe('none')
  })
})
