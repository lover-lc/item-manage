import { describe, expect, test } from 'vitest'
import type { Area } from '../src/modules/items/lib/types'
import {
  findAreaAtWorldPoint,
  planToWorld,
  pointInPolygon,
  polygonsOverlap,
  validateAreaZones,
  worldToPlan,
} from '../src/modules/everything/lib/area-zones'

function area(id: string, name: string, vertices: Area['vertices']): Area {
  return {
    id,
    name,
    isSystemReserved: false,
    vertices,
    createdAt: '2026-01-01T00:00:00Z',
  }
}

describe('area-zones', () => {
  test('maps plan coordinates to world XZ', () => {
    expect(planToWorld(0, 0)).toEqual({ x: -10, z: -10 })
    expect(planToWorld(20, 20)).toEqual({ x: 10, z: 10 })
    expect(worldToPlan(0, 0)).toEqual([10, 10])
  })

  test('detects point inside rectangle polygon', () => {
    const polygon = [
      [-5, -5],
      [5, -5],
      [5, 5],
      [-5, 5],
    ] as [number, number][]

    expect(pointInPolygon({ x: 0, z: 0 }, polygon)).toBe(true)
    expect(pointInPolygon({ x: 6, z: 0 }, polygon)).toBe(false)
  })

  test('finds area at world point', () => {
    const areas = [
      area('a1', '客厅', [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ]),
      area('a2', '卧室', [
        [10, 0],
        [20, 0],
        [20, 10],
        [10, 10],
      ]),
    ]

    expect(findAreaAtWorldPoint(areas, -5, -5)?.id).toBe('a1')
    expect(findAreaAtWorldPoint(areas, 5, -5)?.id).toBe('a2')
    expect(findAreaAtWorldPoint(areas, 0, 5)).toBeNull()
  })

  test('detects overlapping polygons', () => {
    const a = [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ] as [number, number][]
    const b = [
      [1, 1],
      [3, 1],
      [3, 3],
      [1, 3],
    ] as [number, number][]

    expect(polygonsOverlap(a, b)).toBe(true)
  })

  test('reports overlap validation issues', () => {
    const areas = [
      area('a1', '客厅', [
        [0, 0],
        [12, 0],
        [12, 10],
        [0, 10],
      ]),
      area('a2', '卧室', [
        [10, 0],
        [20, 0],
        [20, 10],
        [10, 10],
      ]),
    ]

    const issues = validateAreaZones(areas)
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.some((i) => i.message.includes('重叠'))).toBe(true)
  })
})
