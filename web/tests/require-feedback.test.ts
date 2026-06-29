import { describe, expect, it } from 'vitest'
import { deriveRequireFeedback } from '../src/modules/todos/lib/require-feedback'

describe('deriveRequireFeedback', () => {
  it('requires feedback when assignee is another member', () => {
    expect(deriveRequireFeedback('b', 'a')).toBe(true)
  })

  it('does not require feedback when assignee is self', () => {
    expect(deriveRequireFeedback('a', 'a')).toBe(false)
  })

  it('returns false when ids are missing', () => {
    expect(deriveRequireFeedback('', 'a')).toBe(false)
    expect(deriveRequireFeedback('a', null)).toBe(false)
  })
})
