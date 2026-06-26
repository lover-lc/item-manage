import type { SortField, SortOrder } from '../store/ui-store'
import { dailyCost as calcDailyCost, usedDays } from './cost-calculator'
import { parseISODate } from './date-utils'
import type { Area, Item } from './types'

export function computeItemDailyCost(item: Item, today: Date = new Date()): number {
  const startDate = parseISODate(item.startDate)
  const endDate = item.endDate ? parseISODate(item.endDate) : today
  const days = usedDays(startDate, endDate)
  return calcDailyCost(item.purchasePrice, days)
}

export function filterItems(
  items: Item[],
  areaFilterId: string | null,
  categoryFilterId: string | null,
): Item[] {
  return items.filter((item) => {
    if (areaFilterId && item.areaId !== areaFilterId) return false
    if (categoryFilterId && item.categoryId !== categoryFilterId) return false
    return true
  })
}

export function sortItems(
  items: Item[],
  sortField: SortField,
  sortOrder: SortOrder,
  today: Date = new Date(),
): Item[] {
  const sorted = [...items].sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case 'name':
        cmp = a.name.localeCompare(b.name, 'zh-CN')
        break
      case 'createdAt':
        cmp = a.createdAt.localeCompare(b.createdAt)
        break
      case 'dailyCost':
        cmp = computeItemDailyCost(a, today) - computeItemDailyCost(b, today)
        break
      case 'purchasePrice':
        cmp = a.purchasePrice - b.purchasePrice
        break
      case 'startDate':
        cmp = a.startDate.localeCompare(b.startDate)
        break
    }
    return sortOrder === 'asc' ? cmp : -cmp
  })
  return sorted
}

export function itemsForArea(items: Item[], areaId: string): Item[] {
  return items.filter((item) => item.areaId === areaId)
}

export function displayedAreas(
  areas: Area[],
  areaFilterId: string | null,
): Area[] {
  if (areaFilterId) {
    return areas.filter((area) => area.id === areaFilterId)
  }
  return areas
}

export const SORT_FIELD_LABELS: Record<SortField, string> = {
  name: '名称',
  createdAt: '创建时间',
  dailyCost: '每日成本',
  purchasePrice: '买入价格',
  startDate: '开始使用时间',
}

export const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  asc: '升序',
  desc: '降序',
}
