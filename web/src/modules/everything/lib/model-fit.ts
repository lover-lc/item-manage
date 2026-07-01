import { Box3, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getBuiltinModel, isBuiltinModelRef } from './builtin-models'
import { MODEL_TARGET_WIDTH } from './room-constants'
import { resolveModelUrl } from './model-url'

export function computeBuiltinModelFitScale(modelRef: string): number {
  if (!isBuiltinModelRef(modelRef)) return 1
  const { size } = getBuiltinModel(modelRef)
  const maxHorizontal = Math.max(size[0], size[2])
  if (maxHorizontal <= MODEL_TARGET_WIDTH) return 1
  return MODEL_TARGET_WIDTH / maxHorizontal
}

export async function computeGlbModelFitScale(modelRef: string): Promise<number> {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(resolveModelUrl(modelRef))
  const box = new Box3().setFromObject(gltf.scene)
  const size = new Vector3()
  box.getSize(size)
  const maxHorizontal = Math.max(size.x, size.z)
  if (maxHorizontal <= 0 || maxHorizontal <= MODEL_TARGET_WIDTH) return 1
  return MODEL_TARGET_WIDTH / maxHorizontal
}

export async function computeModelFitScale(
  modelRef: string,
  modelType: 'builtin' | 'custom',
): Promise<number> {
  if (modelType === 'builtin') {
    return computeBuiltinModelFitScale(modelRef)
  }
  if (modelRef.endsWith('.glb')) {
    return computeGlbModelFitScale(modelRef)
  }
  return 1
}
