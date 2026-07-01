import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { computeModelRootLocalBounds } from '../../lib/container-bounds'
import { getScreenRectFromLocalBounds } from '../../lib/projection-utils'
import { useContainerDragController } from '../../hooks/use-container-drag-controller'
import { useSceneStore } from '../../store/scene-store'

/** Canvas 内追踪选中容器屏幕包围盒，供外部 2D 控件 overlay 使用 */
export default function ContainerControlsTracker() {
  const { camera } = useThree()
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId)
  const isEditMode = useSceneStore((s) => s.isEditMode)
  const containerGroupRefs = useSceneStore((s) => s.containerGroupRefs)
  const selectionBoundsById = useSceneStore((s) => s.selectionBoundsById)
  const setControlsScreenRect = useSceneStore((s) => s.setControlsScreenRect)
  const setControlsAnchorRect = useSceneStore((s) => s.setControlsAnchorRect)
  const setSelectionBounds = useSceneStore((s) => s.setSelectionBounds)
  const containerModelRootRefs = useSceneStore((s) => s.containerModelRootRefs)

  const lastLiveKey = useRef('')
  const anchorForIdRef = useRef<string | null>(null)

  useContainerDragController()

  useFrame(() => {
    if (!isEditMode || !selectedObjectId) {
      if (lastLiveKey.current || anchorForIdRef.current) {
        lastLiveKey.current = ''
        anchorForIdRef.current = null
        setControlsScreenRect(null)
        setControlsAnchorRect(null)
      }
      return
    }

    if (anchorForIdRef.current !== selectedObjectId) {
      anchorForIdRef.current = selectedObjectId
      setControlsAnchorRect(null)
    }

    const groupRef = containerGroupRefs[selectedObjectId]
    if (!groupRef?.current) {
      setControlsScreenRect(null)
      return
    }

    let bounds = selectionBoundsById[selectedObjectId]
    const modelRoot = containerModelRootRefs[selectedObjectId]?.current
    if (!bounds && modelRoot) {
      const computed = computeModelRootLocalBounds(modelRoot)
      if (computed) {
        bounds = computed
        setSelectionBounds(selectedObjectId, computed)
      }
    }

    if (!bounds) {
      setControlsScreenRect(null)
      return
    }

    const rect = getScreenRectFromLocalBounds(bounds, groupRef.current, camera)
    const liveKey = `${rect.centerX.toFixed(0)}:${rect.centerY.toFixed(0)}:${rect.visible}`
    if (liveKey !== lastLiveKey.current) {
      lastLiveKey.current = liveKey
      setControlsScreenRect(rect)
    }

    const anchor = useSceneStore.getState().controlsAnchorRect
    if (!anchor && rect.visible) {
      setControlsAnchorRect(rect)
    }
  })

  return null
}
