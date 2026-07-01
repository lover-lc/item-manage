import { memo, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, Color, EdgesGeometry, LineBasicMaterial } from 'three'
import type { Group } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { isBuiltinModelRef } from '../../lib/builtin-models'
import { computeModelRootLocalBounds, type LocalBounds } from '../../lib/container-bounds'
import { useContainerMeshDrag } from '../../hooks/use-container-mesh-drag'
import BuiltinModel from './BuiltinModel'
import CustomModel from './CustomModel'
import type { Container } from '../../types/scene-types'
import { DRAG_THRESHOLD_PX } from '../../lib/scene-controls'
import { useSceneStore } from '../../store/scene-store'

interface Container3DProps {
  container: Container
  onClick: (id: string) => void
}

function Container3D({ container, onClick }: Container3DProps) {
  const groupRef = useRef<Group>(null)
  const modelRootRef = useRef<Group>(null)
  const isEditMode = useSceneStore((s) => s.isEditMode)
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId)
  const longPressPendingContainerId = useSceneStore((s) => s.longPressPendingContainerId)
  const dragReadyContainerId = useSceneStore((s) => s.dragReadyContainerId)
  const draggingContainerId = useSceneStore((s) => s.draggingContainerId)
  const setSelectedObjectId = useSceneStore((s) => s.setSelectedObjectId)
  const setDraftTransform = useSceneStore((s) => s.setDraftTransform)
  const setContainerGroupRef = useSceneStore((s) => s.setContainerGroupRef)
  const setContainerModelRootRef = useSceneStore((s) => s.setContainerModelRootRef)
  const setPointerOnSceneObject = useSceneStore((s) => s.setPointerOnSceneObject)
  const setActiveContainerGestureId = useSceneStore((s) => s.setActiveContainerGestureId)
  const initScaleSession = useSceneStore((s) => s.initScaleSession)
  const setSelectionBounds = useSceneStore((s) => s.setSelectionBounds)
  const selectionBoundsById = useSceneStore((s) => s.selectionBoundsById)
  const draftTransformsById = useSceneStore((s) => s.draftTransformsById)

  const { position, modelRef } = container
  const draft = draftTransformsById[container.id]
  const { x, y, z, rotationY, scale } = draft ?? position

  const isSelected = selectedObjectId === container.id
  const isPendingLongPress = longPressPendingContainerId === container.id
  const showDragReadyBorder =
    isSelected &&
    (dragReadyContainerId === container.id || draggingContainerId === container.id)
  const isCustomGlb = useMemo(() => modelRef.endsWith('.glb'), [modelRef])
  const selectionBox: LocalBounds | null = isSelected
    ? (selectionBoundsById[container.id] ?? null)
    : null

  function ensureDraft() {
    const store = useSceneStore.getState()
    if (store.draftTransformsById[container.id]) return
    setDraftTransform(container.id, { ...container.position })
    initScaleSession(container.id, container.position.scale)
  }

  function selectContainer() {
    const store = useSceneStore.getState()
    setSelectedObjectId(container.id)

    const existingDraft = store.draftTransformsById[container.id]
    const absoluteScale = existingDraft?.scale ?? container.position.scale

    if (!existingDraft) {
      setDraftTransform(container.id, { ...container.position })
    }
    initScaleSession(container.id, absoluteScale)
  }

  const { handleMeshPointerDown } = useContainerMeshDrag(
    container.id,
    isEditMode,
    ensureDraft,
    selectContainer,
  )

  function handleClick() {
    const { pointerDragDistance, isCameraDragging } = useSceneStore.getState()
    if (isCameraDragging || pointerDragDistance >= DRAG_THRESHOLD_PX) {
      return
    }

    if (isEditMode) {
      selectContainer()
      return
    }
    onClick(container.id)
  }

  function scheduleClearContainerGesture() {
    requestAnimationFrame(() => {
      const store = useSceneStore.getState()
      if (store.activeContainerGestureId === container.id) {
        store.setActiveContainerGestureId(null)
      }
    })
  }

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    setPointerOnSceneObject(true)
    setActiveContainerGestureId(container.id)
    useSceneStore.getState().resetPointerDrag()
    if (isEditMode) {
      handleMeshPointerDown(e)
    }
  }

  function handlePointerUp() {
    setPointerOnSceneObject(false)
    scheduleClearContainerGesture()
  }

  useFrame((state) => {
    const group = groupRef.current
    if (!group) return
    if (isPendingLongPress) {
      const pulse = 1 + 0.03 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 6))
      group.scale.setScalar(scale * pulse)
    } else {
      group.scale.setScalar(scale)
    }
  })

  useEffect(() => {
    setContainerGroupRef(container.id, groupRef)
    setContainerModelRootRef(container.id, modelRootRef)
  }, [container.id, setContainerGroupRef, setContainerModelRootRef])

  useEffect(() => {
    if (!isSelected) {
      setSelectionBounds(container.id, null)
      return
    }

    const modelRoot = modelRootRef.current
    if (!modelRoot) return

    const compute = () => {
      const bounds = computeModelRootLocalBounds(modelRoot)
      if (bounds) setSelectionBounds(container.id, bounds)
    }

    compute()
    const t1 = window.setTimeout(compute, 100)
    const t2 = window.setTimeout(compute, 500)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [isSelected, modelRef, container.id, setSelectionBounds])

  const edgesGeometry = useMemo(() => {
    if (!selectionBox) return null
    const [sx, sy, sz] = selectionBox.size
    return new EdgesGeometry(new BoxGeometry(sx, sy, sz))
  }, [selectionBox])

  const selectionEdgeMaterial = useMemo(
    () => new LineBasicMaterial({ color: new Color('#22c55e') }),
    [],
  )

  useEffect(() => {
    selectionEdgeMaterial.color.set(showDragReadyBorder ? '#ef4444' : '#22c55e')
  }, [showDragReadyBorder, selectionEdgeMaterial])

  const modelContent = isBuiltinModelRef(modelRef) ? (
    <BuiltinModel modelRef={modelRef} />
  ) : isCustomGlb ? (
    <CustomModel url={modelRef} />
  ) : (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#9E9E9E" />
    </mesh>
  )

  return (
    <group
      ref={groupRef}
      position={[x, y + 0.01, z]}
      rotation={[0, rotationY, 0]}
      scale={scale}
    >
      <group
        ref={modelRootRef}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
      >
        {modelContent}
      </group>

      {isSelected && selectionBox && edgesGeometry ? (
        <group
          position={selectionBox.center}
          scale={showDragReadyBorder ? [1.02, 1.02, 1.02] : [1, 1, 1]}
        >
          <lineSegments
            geometry={edgesGeometry}
            material={selectionEdgeMaterial}
            userData={{ ignoreBounds: true }}
          />
        </group>
      ) : null}
    </group>
  )
}

export default memo(Container3D, (prev, next) =>
  prev.container === next.container &&
  prev.onClick === next.onClick
)
