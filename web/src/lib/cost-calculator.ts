import { daysBetween, startOfDay } from './date-utils'

export function usedDays(from: Date, to: Date): number {
  const startDay = startOfDay(from)
  const endDay = startOfDay(to)
  const days = daysBetween(startDay, endDay)
  return Math.max(days, 0) + 1
}

export function dailyCost(price: number, usedDaysCount: number): number {
  if (usedDaysCount <= 0) return 0
  if (price === 0) return 0
  const result = price / usedDaysCount
  return Math.round(result * 100) / 100
}

export function formatDailyCost(cost: number): string {
  const formatted = cost.toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${formatted.replace('CN¥', '¥')}/天`
}
