import { useEffect, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import {
  DRAG_THRESHOLD_PX,
  exceedsLongPressCancelDistance,
  isDragGesture,
  LONG_PRESS_MS,
} from '../lib/scene-controls'
import { useSceneStore } from '../store/scene-store'

function vibrateDragReady() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(15)
  }
}

/** 编辑模式下在容器 mesh 上长按后拖拽移动（iOS 式） */
export function useContainerMeshDrag(
  containerId: string,
  isEditMode: boolean,
  ensureDraft: () => void,
  onSelect: () => void,
) {
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    longPressTimerRef.current = null
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
    }
  }, [isEditMode, containerId])

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  function clearPendingLongPress() {
    clearLongPressTimer()
    const store = useSceneStore.getState()
    if (store.longPressPendingContainerId === containerId) {
      store.setLongPressPendingContainerId(null)
    }
  }

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (!isEditMode) return

    onSelect()

    const start = {
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY,
    }

    const store = useSceneStore.getState()
    store.setDragReadyContainerId(null)
    store.setLongPressPendingContainerId(containerId)

    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null
      const current = useSceneStore.getState()
      if (current.longPressPendingContainerId !== containerId) return
      current.setLongPressPendingContainerId(null)
      current.setDragReadyContainerId(containerId)
      vibrateDragReady()
    }, LONG_PRESS_MS)

    function onMove(ev: PointerEvent) {
      const current = { x: ev.clientX, y: ev.clientY }
      const state = useSceneStore.getState()

      if (
        state.longPressPendingContainerId === containerId &&
        exceedsLongPressCancelDistance(start, current)
      ) {
        clearPendingLongPress()
        return
      }

      if (
        state.dragReadyContainerId === containerId &&
        isDragGesture(start, current, DRAG_THRESHOLD_PX) &&
        !state.draggingContainerId
      ) {
        ensureDraft()
        state.setDraggingContainerId(containerId)
        detach()
      }
    }

    function onUp() {
      const state = useSceneStore.getState()
      const wasDragReady = state.dragReadyContainerId === containerId
      if (!state.draggingContainerId) {
        clearPendingLongPress()
        if (wasDragReady) {
          state.setDragReadyContainerId(null)
          onSelect()
        } else if (state.dragReadyContainerId === containerId) {
          state.setDragReadyContainerId(null)
        }
      }
      detach()
    }

    function detach() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return { handleMeshPointerDown: handlePointerDown }
}
