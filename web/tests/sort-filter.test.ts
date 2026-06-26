import { describe, expect, it } from 'vitest'
import {
  computeItemDailyCost,
  filterItems,
  sortItems,
} from '../src/lib/sort-filter'
import type { Item } from '../src/lib/types'

const today = new Date('2026-06-26')

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: '1',
    name: '物品A',
    purchasePrice: 100,
    startDate: '2026-06-01',
    endDate: null,
    expiryDate: null,
    areaId: 'area-1',
    categoryId: 'cat-1',
    specificLocation: '柜子',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...overrides,
  }
}

describe('filterItems', () => {
  const items = [
    makeItem({ id: '1', areaId: 'area-1', categoryId: 'cat-1' }),
    makeItem({ id: '2', areaId: 'area-2', categoryId: 'cat-1' }),
    makeItem({ id: '3', areaId: 'area-1', categoryId: 'cat-2' }),
  ]

  it('returns all items when no filters', () => {
    expect(filterItems(items, null, null)).toHaveLength(3)
  })

  it('filters by area', () => {
    expect(filterItems(items, 'area-1', null)).toHaveLength(2)
  })

  it('filters by category', () => {
    expect(filterItems(items, null, 'cat-1')).toHaveLength(2)
  })

  it('combines area and category with AND', () => {
    expect(filterItems(items, 'area-1', 'cat-1')).toHaveLength(1)
    expect(filterItems(items, 'area-1', 'cat-1')[0].id).toBe('1')
  })
})

describe('sortItems', () => {
  it('sorts by name ascending', () => {
    const items = [
      makeItem({ id: '1', name: '香蕉' }),
      makeItem({ id: '2', name: '苹果' }),
    ]
    const sorted = sortItems(items, 'name', 'asc', today)
    expect(sorted.map((i) => i.name)).toEqual(['苹果', '香蕉'])
  })

  it('sorts by purchase price descending', () => {
    const items = [
      makeItem({ id: '1', purchasePrice: 50 }),
      makeItem({ id: '2', purchasePrice: 200 }),
    ]
    const sorted = sortItems(items, 'purchasePrice', 'desc', today)
    expect(sorted.map((i) => i.purchasePrice)).toEqual([200, 50])
  })
})

describe('computeItemDailyCost', () => {
  it('uses end date when item is used up', () => {
    const item = makeItem({
      purchasePrice: 100,
      startDate: '2026-06-01',
      endDate: '2026-06-10',
    })
    expect(computeItemDailyCost(item, today)).toBe(10)
  })

  it('uses today when item is still active', () => {
    const item = makeItem({
      purchasePrice: 100,
      startDate: '2026-06-01',
      endDate: null,
    })
    expect(computeItemDailyCost(item, today)).toBe(3.85)
  })
})
