import { Box3, Matrix4, Vector3 } from 'three'
import type { Object3D } from 'three'

export interface LocalBounds {
  center: [number, number, number]
  size: [number, number, number]
}

const _tempBox = new Box3()
const _invRoot = new Matrix4()
const _corner = new Vector3()
const _center = new Vector3()
const _size = new Vector3()

/** 仅基于 modelRoot 几何的本地包围盒（不受父级 scale/rotation 影响） */
export function computeModelRootLocalBounds(modelRoot: Object3D): LocalBounds | null {
  const box = new Box3()
  let found = false

  modelRoot.updateWorldMatrix(true, true)
  _invRoot.copy(modelRoot.matrixWorld).invert()

  modelRoot.traverse((node) => {
    if (node.userData?.ignoreBounds) return
    if (node.type === 'LineSegments') return

    const mesh = node as Object3D & {
      isMesh?: boolean
      geometry?: { boundingBox: Box3 | null; computeBoundingBox: () => void }
    }
    if (!mesh.isMesh || !mesh.geometry) return

    mesh.geometry.computeBoundingBox()
    if (!mesh.geometry.boundingBox) return

    _tempBox.copy(mesh.geometry.boundingBox)
    const { min, max } = _tempBox
    for (const x of [min.x, max.x]) {
      for (const y of [min.y, max.y]) {
        for (const z of [min.z, max.z]) {
          _corner.set(x, y, z).applyMatrix4(node.matrixWorld).applyMatrix4(_invRoot)
          box.expandByPoint(_corner)
        }
      }
    }
    found = true
  })

  if (!found || box.isEmpty()) return null

  box.getCenter(_center)
  box.getSize(_size)

  const pad = 1.05
  return {
    center: [_center.x, _center.y, _center.z],
    size: [
      Math.max(0.05, _size.x * pad),
      Math.max(0.05, _size.y * pad),
      Math.max(0.05, _size.z * pad),
    ],
  }
}

/** @deprecated 使用 computeModelRootLocalBounds */
export function computeModelLocalBounds(
  modelRoot: Object3D,
  containerGroup: Object3D,
): LocalBounds | null {
  void containerGroup
  return computeModelRootLocalBounds(modelRoot)
}

/** 获取模型世界空间中心 */
export function getModelWorldCenter(
  modelRoot: Object3D,
  containerGroup: Object3D,
): Vector3 {
  const bounds = computeModelRootLocalBounds(modelRoot)
  if (!bounds) {
    const v = new Vector3()
    containerGroup.getWorldPosition(v)
    return v
  }

  containerGroup.updateWorldMatrix(true, true)
  return new Vector3(...bounds.center).applyMatrix4(containerGroup.matrixWorld)
}
