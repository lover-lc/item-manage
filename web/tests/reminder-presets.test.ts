import { describe, expect, it } from 'vitest'
import {
  resolveReminderAt,
  type ReminderPreset,
} from '../src/modules/todos/lib/reminder-presets'

const customPresets: ReminderPreset[] = [
  {
    id: 'custom:test',
    name: '测试',
    kind: 'offset',
    offsetMinutes: 30,
  },
]

describe('resolveReminderAt', () => {
  it('returns null when no reminder selected', () => {
    expect(resolveReminderAt({ type: 'none' }, '2026-07-01', customPresets)).toBeNull()
  })

  it('resolves builtin offset preset from due date', () => {
    const at = resolveReminderAt(
      { type: 'preset', presetId: 'builtin:1h' },
      '2026-07-01',
      customPresets,
    )
    expect(at).toBe(new Date('2026-07-01T22:59:59').toISOString())
  })

  it('resolves fixed preset on due date', () => {
    const at = resolveReminderAt(
      { type: 'preset', presetId: 'builtin:due_9am' },
      '2026-07-01',
      customPresets,
    )
    expect(at).toBe(new Date('2026-07-01T09:00:00').toISOString())
  })

  it('resolves custom member preset', () => {
    const at = resolveReminderAt(
      { type: 'preset', presetId: 'custom:test' },
      '2026-07-01',
      customPresets,
    )
    expect(at).toBe(new Date('2026-07-01T23:29:59').toISOString())
  })

  it('uses explicit datetime selection', () => {
    const at = resolveReminderAt(
      { type: 'datetime', at: '2026-07-01T14:30' },
      null,
      customPresets,
    )
    expect(at).toBe(new Date('2026-07-01T14:30').toISOString())
  })

  it('requires due date for offset presets', () => {
    expect(
      resolveReminderAt({ type: 'preset', presetId: 'builtin:1d' }, null, customPresets),
    ).toBeNull()
  })
})
