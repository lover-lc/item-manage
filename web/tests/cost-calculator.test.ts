import { describe, expect, it } from 'vitest'
import {
  dailyCost,
  formatDailyCost,
  usedDays,
} from '../src/lib/cost-calculator'
import { parseISODate } from '../src/lib/date-utils'

describe('usedDays', () => {
  it('returns 1 for same-day use', () => {
    const date = new Date()
    expect(usedDays(date, date)).toBe(1)
  })

  it('counts inclusive days across a date range', () => {
    const start = parseISODate('2026-06-01')
    const end = parseISODate('2026-06-10')
    expect(usedDays(start, end)).toBe(10)
  })
})

describe('dailyCost', () => {
  it('returns 0 when price is 0', () => {
    expect(dailyCost(0, 5)).toBe(0)
  })

  it('divides price by used days', () => {
    expect(dailyCost(100, 4)).toBe(25)
  })

  it('returns full price for same-day purchase', () => {
    expect(dailyCost(50, 1)).toBe(50)
  })
})

describe('formatDailyCost', () => {
  it('formats cost as yen per day', () => {
    expect(formatDailyCost(12.5)).toBe('¥12.50/天')
  })
})
