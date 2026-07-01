import { Vector3 } from 'three'
import type { Object3D, Camera } from 'three'
import type { LocalBounds } from './container-bounds'

export interface ScreenPosition {
  x: number
  y: number
  visible: boolean
}

export interface ScreenRect {
  centerX: number
  centerY: number
  top: number
  bottom: number
  left: number
  right: number
  visible: boolean
}

const _corner = new Vector3()

function projectPoint(point: Vector3, camera: Camera): { x: number; y: number; visible: boolean } {
  const projected = point.clone().project(camera)
  const visible =
    projected.z < 1 &&
    projected.x >= -1.5 &&
    projected.x <= 1.5 &&
    projected.y >= -1.5 &&
    projected.y <= 1.5
  return {
    x: (projected.x * 0.5 + 0.5) * window.innerWidth,
    y: (-(projected.y * 0.5) + 0.5) * window.innerHeight,
    visible,
  }
}

/** 将 containerGroup 本地包围盒投影为屏幕矩形 */
export function getScreenRectFromLocalBounds(
  bounds: LocalBounds,
  containerGroup: Object3D,
  camera: Camera,
): ScreenRect {
  containerGroup.updateWorldMatrix(true, true)
  camera.updateMatrixWorld()

  const [cx, cy, cz] = bounds.center
  const [hx, hy, hz] = bounds.size.map((s) => s / 2)

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let anyVisible = false

  for (const dx of [-1, 1] as const) {
    for (const dy of [-1, 1] as const) {
      for (const dz of [-1, 1] as const) {
        _corner.set(cx + dx * hx, cy + dy * hy, cz + dz * hz)
        _corner.applyMatrix4(containerGroup.matrixWorld)
        const { x, y, visible } = projectPoint(_corner, camera)
        if (visible) anyVisible = true
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (!Number.isFinite(minX)) {
    return { centerX: 0, centerY: 0, top: 0, bottom: 0, left: 0, right: 0, visible: false }
  }

  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    top: minY,
    bottom: maxY,
    left: minX,
    right: maxX,
    visible: anyVisible,
  }
}

export function getScreenPositionFromPoint(point: Vector3, camera: Camera): ScreenPosition {
  camera.updateMatrixWorld()
  const { x, y, visible } = projectPoint(point, camera)
  return { x, y, visible }
}

export function getScreenPosition(object3D: Object3D, camera: Camera): ScreenPosition {
  object3D.updateWorldMatrix(true, true)
  const vector = new Vector3()
  object3D.getWorldPosition(vector)
  return getScreenPositionFromPoint(vector, camera)
}
