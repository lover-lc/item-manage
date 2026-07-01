import { useEffect, useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { Raycaster, Plane, Vector3, Vector2 } from 'three'
import { clampContainerPosition } from '../lib/scene-controls'
import { useSceneStore } from '../store/scene-store'
import { useContainers } from './use-containers'

/** Canvas 内监听拖拽触发的容器移动（沿相机视角平面，XYZ） */
export function useContainerDragController() {
  const { camera, gl } = useThree()
  const { data: containers = [] } = useContainers()

  const raycasterRef = useRef(new Raycaster())
  const planeRef = useRef(new Plane())
  const mouseRef = useRef(new Vector2())
  const intersectionRef = useRef(new Vector3())
  const cameraDirRef = useRef(new Vector3())
  const dragOffsetRef = useRef<Vector3 | null>(null)
  const containerPosRef = useRef(new Vector3())

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const store = useSceneStore.getState()
      const containerId = store.draggingContainerId
      if (!containerId) return

      const rect = gl.domElement.getBoundingClientRect()
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const draft = store.draftTransformsById[containerId]
      const container = containers.find((c) => c.id === containerId)
      if (!container || !draft) return

      containerPosRef.current.set(draft.x, draft.y, draft.z)
      camera.getWorldDirection(cameraDirRef.current)
      planeRef.current.setFromNormalAndCoplanarPoint(
        cameraDirRef.current,
        containerPosRef.current,
      )

      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const hit = raycasterRef.current.ray.intersectPlane(
        planeRef.current,
        intersectionRef.current,
      )
      if (!hit) return

      if (!dragOffsetRef.current) {
        dragOffsetRef.current = intersectionRef.current.clone().sub(containerPosRef.current)
      }

      const next = intersectionRef.current.clone().sub(dragOffsetRef.current)
      const clamped = clampContainerPosition(next.x, next.y, next.z)

      store.setDraftTransform(containerId, {
        ...draft,
        x: clamped.x,
        y: clamped.y,
        z: clamped.z,
      })
    },
    [camera, gl, containers],
  )

  const handlePointerUp = useCallback(() => {
    dragOffsetRef.current = null
    const store = useSceneStore.getState()
    store.setDraggingContainerId(null)
    store.setDragReadyContainerId(null)
    store.setLongPressPendingContainerId(null)
    store.setActiveContainerGestureId(null)
  }, [])

  useEffect(() => {
    const unsubscribe = useSceneStore.subscribe(
      (state) => state.draggingContainerId,
      (draggingId) => {
        dragOffsetRef.current = null

        if (!draggingId) {
          window.removeEventListener('pointermove', handlePointerMove)
          window.removeEventListener('pointerup', handlePointerUp)
          window.removeEventListener('pointercancel', handlePointerUp)
          return
        }

        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUp)
        window.addEventListener('pointercancel', handlePointerUp)
      },
    )

    return () => {
      unsubscribe()
      dragOffsetRef.current = null
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])
}
