import type { Area, AreaVertex } from '../../items/lib/types'
import { ROOM_DEPTH, ROOM_WIDTH } from './room-constants'

export type WorldPoint2D = { x: number; z: number }

/** 户型平面左下角 (0,0) → 世界 XZ（房间中心为原点） */
export function planToWorld(planX: number, planY: number): WorldPoint2D {
  return {
    x: planX - ROOM_WIDTH / 2,
    z: planY - ROOM_DEPTH / 2,
  }
}

export function worldToPlan(worldX: number, worldZ: number): AreaVertex {
  return [worldX + ROOM_WIDTH / 2, worldZ + ROOM_DEPTH / 2]
}

export function getAreaWorldVertices(area: Area): AreaVertex[] | null {
  if (!area.vertices || area.vertices.length < 3) return null
  return area.vertices.map(([planX, planY]) => {
    const { x, z } = planToWorld(planX, planY)
    return [x, z] as AreaVertex
  })
}

/** 射线法判断点是否在多边形内（世界 XZ 坐标） */
export function pointInPolygon(point: WorldPoint2D, polygon: AreaVertex[]): boolean {
  if (polygon.length < 3) return false

  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i]
    const [xj, zj] = polygon[j]
    const intersect =
      zi > point.z !== zj > point.z &&
      point.x < ((xj - xi) * (point.z - zi)) / (zj - zi + Number.EPSILON) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function segmentsIntersect(
  a1: AreaVertex,
  a2: AreaVertex,
  b1: AreaVertex,
  b2: AreaVertex,
): boolean {
  const cross = (p: AreaVertex, q: AreaVertex, r: AreaVertex) =>
    (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])

  const d1 = cross(a1, a2, b1)
  const d2 = cross(a1, a2, b2)
  const d3 = cross(b1, b2, a1)
  const d4 = cross(b1, b2, a2)

  if (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  ) {
    return true
  }

  return false
}

export function polygonsOverlap(a: AreaVertex[], b: AreaVertex[]): boolean {
  if (a.length < 3 || b.length < 3) return false

  for (const poly of [a, b]) {
    const other = poly === a ? b : a
    for (const vertex of poly) {
      if (pointInPolygon({ x: vertex[0], z: vertex[1] }, other)) return true
    }
  }

  for (let i = 0; i < a.length; i++) {
    const a1 = a[i]
    const a2 = a[(i + 1) % a.length]
    for (let j = 0; j < b.length; j++) {
      const b1 = b[j]
      const b2 = b[(j + 1) % b.length]
      if (segmentsIntersect(a1, a2, b1, b2)) return true
    }
  }

  return false
}

function isVertexInRoom(planX: number, planY: number): boolean {
  return planX >= 0 && planX <= ROOM_WIDTH && planY >= 0 && planY <= ROOM_DEPTH
}

export function findAreaAtWorldPoint(areas: Area[], worldX: number, worldZ: number): Area | null {
  const point = { x: worldX, z: worldZ }
  for (const area of areas) {
    const worldPoly = getAreaWorldVertices(area)
    if (!worldPoly) continue
    if (pointInPolygon(point, worldPoly)) return area
  }
  return null
}

export type AreaZoneValidationIssue = {
  areaId: string
  areaName: string
  message: string
}

export function validateAreaZones(areas: Area[]): AreaZoneValidationIssue[] {
  const issues: AreaZoneValidationIssue[] = []
  const configured = areas.filter((a) => a.vertices && a.vertices.length >= 3)

  for (const area of configured) {
    const verts = area.vertices!
    if (verts.length < 3) {
      issues.push({
        areaId: area.id,
        areaName: area.name,
        message: '顶点数量不足（至少 3 个）',
      })
      continue
    }

    for (const [planX, planY] of verts) {
      if (!isVertexInRoom(planX, planY)) {
        issues.push({
          areaId: area.id,
          areaName: area.name,
          message: `顶点 (${planX}, ${planY}) 超出房间范围 0~${ROOM_WIDTH}`,
        })
        break
      }
    }
  }

  for (let i = 0; i < configured.length; i++) {
    const aWorld = getAreaWorldVertices(configured[i])!
    for (let j = i + 1; j < configured.length; j++) {
      const bWorld = getAreaWorldVertices(configured[j])!
      if (polygonsOverlap(aWorld, bWorld)) {
        issues.push({
          areaId: configured[i].id,
          areaName: configured[i].name,
          message: `与区域「${configured[j].name}」重叠`,
        })
        issues.push({
          areaId: configured[j].id,
          areaName: configured[j].name,
          message: `与区域「${configured[i].name}」重叠`,
        })
      }
    }
  }

  return issues
}

export function getConfiguredAreas(areas: Area[]): Area[] {
  return areas.filter((a) => a.vertices && a.vertices.length >= 3)
}
