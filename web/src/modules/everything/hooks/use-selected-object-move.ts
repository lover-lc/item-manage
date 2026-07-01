import { type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  applyCameraRelativePlanarMove,
  applyHeightMove,
  buildMoveVector,
  OBJECT_MOVE_SPEED,
} from '../lib/scene-controls'
import { useSceneStore } from '../store/scene-store'
import { useTouchPrimaryDevice } from './use-touch-primary-device'

/** 编辑模式下 WASD / 触屏摇杆 驱动选中容器移动 */
export function useSelectedObjectMove(keysRef: RefObject<Record<string, boolean>>) {
  const { camera } = useThree()
  const isTouchPrimary = useTouchPrimaryDevice()

  useFrame(() => {
    const store = useSceneStore.getState()
    if (!store.isEditMode || !store.selectedObjectId) return
    if (isTouchPrimary && store.joystickTarget !== 'container') return

    let draft = store.draftTransformsById[store.selectedObjectId]
    if (!draft) return

    const keys = keysRef.current ?? {}
    let next = draft

    if (!isTouchPrimary) {
      const wasdMove = buildMoveVector(
        {
          w: Boolean(keys.w),
          a: Boolean(keys.a),
          s: Boolean(keys.s),
          d: Boolean(keys.d),
        },
        { x: 0, y: 0 },
      )
      next = applyCameraRelativePlanarMove(next, camera, wasdMove, OBJECT_MOVE_SPEED)
    } else {
      const planar = buildMoveVector(
        { w: false, a: false, s: false, d: false },
        store.joystickInput,
      )
      next = applyCameraRelativePlanarMove(next, camera, planar, OBJECT_MOVE_SPEED)
      next = applyHeightMove(next, store.heightInput, OBJECT_MOVE_SPEED)
    }

    if (next.x !== draft.x || next.y !== draft.y || next.z !== draft.z) {
      store.setDraftTransform(store.selectedObjectId, next)
    }
  })
}
