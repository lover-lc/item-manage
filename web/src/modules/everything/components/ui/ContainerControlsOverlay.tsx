import { useEffect, useRef, useState } from 'react'
import { useSceneStore } from '../../store/scene-store'
import {
  OVERLAY_EDGE_MARGIN,
  placeRotateControl,
  placeScaleControl,
  SCALE_CONTROL_SIZE,
} from '../../lib/overlay-layout'

const SCALE_MIN = 0.5
const SCALE_MAX = 2.0
const SCALE_STEP = 0.02

function useViewportSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    function update() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return size
}

export default function ContainerControlsOverlay() {
  const controlsAnchorRect = useSceneStore((s) => s.controlsAnchorRect)
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId)
  const isEditMode = useSceneStore((s) => s.isEditMode)
  const draggingContainerId = useSceneStore((s) => s.draggingContainerId)
  const scaleFactorById = useSceneStore((s) => s.scaleFactorById)
  const setScaleFactor = useSceneStore((s) => s.setScaleFactor)
  const rotationAnimationId = useRef<number | null>(null)
  const viewport = useViewportSize()

  useEffect(() => {
    return () => {
      if (rotationAnimationId.current) {
        cancelAnimationFrame(rotationAnimationId.current)
      }
    }
  }, [])

  function stopRotate() {
    if (rotationAnimationId.current) {
      cancelAnimationFrame(rotationAnimationId.current)
      rotationAnimationId.current = null
    }
  }

  function startRotateLeft() {
    stopRotate()
    const rotate = () => {
      const id = useSceneStore.getState().selectedObjectId
      if (!id) return
      const current = useSceneStore.getState().draftTransformsById[id]
      if (!current) return
      useSceneStore.getState().setDraftTransform(id, {
        ...current,
        rotationY: current.rotationY - 0.05,
      })
      rotationAnimationId.current = requestAnimationFrame(rotate)
    }
    rotate()
  }

  function startRotateRight() {
    stopRotate()
    const rotate = () => {
      const id = useSceneStore.getState().selectedObjectId
      if (!id) return
      const current = useSceneStore.getState().draftTransformsById[id]
      if (!current) return
      useSceneStore.getState().setDraftTransform(id, {
        ...current,
        rotationY: current.rotationY + 0.05,
      })
      rotationAnimationId.current = requestAnimationFrame(rotate)
    }
    rotate()
  }

  function updateScaleFactor(factor: number) {
    if (!selectedObjectId) return
    setScaleFactor(selectedObjectId, factor)
  }

  const anchorRect = controlsAnchorRect?.visible ? controlsAnchorRect : null

  if (!isEditMode || !selectedObjectId || !anchorRect) {
    return null
  }

  const scaleFactor = scaleFactorById[selectedObjectId] ?? 1
  const isDragging = draggingContainerId === selectedObjectId
  const rotatePlacement = placeRotateControl(anchorRect, viewport)
  const scalePlacement = placeScaleControl(anchorRect, viewport)

  return (
    <div data-scene-ui>
      {!isDragging && (
        <div
          data-scene-ui
          className="pointer-events-auto fixed z-50 flex -translate-x-1/2 gap-2 rounded-lg bg-black/80 p-2 shadow-lg"
          style={{
            left: rotatePlacement.left,
            top: rotatePlacement.top,
            maxWidth: `calc(100vw - ${OVERLAY_EDGE_MARGIN * 2}px)`,
          }}
        >
          <button
            type="button"
            aria-label="向左旋转"
            onPointerDown={startRotateLeft}
            onPointerUp={stopRotate}
            onPointerLeave={stopRotate}
            className="flex h-10 w-10 items-center justify-center rounded bg-white/20 text-xl text-white hover:bg-white/30"
          >
            ↺
          </button>
          <button
            type="button"
            aria-label="向右旋转"
            onPointerDown={startRotateRight}
            onPointerUp={stopRotate}
            onPointerLeave={stopRotate}
            className="flex h-10 w-10 items-center justify-center rounded bg-white/20 text-xl text-white hover:bg-white/30"
          >
            ↻
          </button>
        </div>
      )}

      {!isDragging && (
        <div
          data-scene-ui
          className="pointer-events-auto fixed z-50 flex flex-col items-center rounded-lg bg-black/80 p-2 shadow-lg"
          style={{
            left: scalePlacement.left,
            top: scalePlacement.top,
            width: SCALE_CONTROL_SIZE.width,
            height: SCALE_CONTROL_SIZE.height,
            maxHeight: `calc(100vh - ${OVERLAY_EDGE_MARGIN * 2}px)`,
          }}
        >
          <input
            type="range"
            aria-label="缩放"
            aria-valuetext={`相对缩放 ${scaleFactor.toFixed(2)} 倍`}
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={SCALE_STEP}
            value={scaleFactor}
            onChange={(e) => updateScaleFactor(parseFloat(e.target.value))}
            className="min-h-0 flex-1 cursor-pointer"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
          <span className="mt-1 shrink-0 text-xs text-white">{scaleFactor.toFixed(2)}x</span>
        </div>
      )}
    </div>
  )
}
