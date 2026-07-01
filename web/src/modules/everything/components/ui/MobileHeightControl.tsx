import { useTouchPrimaryDevice } from '../../hooks/use-touch-primary-device'
import { useSceneStore } from '../../store/scene-store'

const BUTTON_SIZE = 48

export default function MobileHeightControl() {
  const isTouchPrimary = useTouchPrimaryDevice()
  const isEditMode = useSceneStore((s) => s.isEditMode)
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId)
  const joystickTarget = useSceneStore((s) => s.joystickTarget)
  const setHeightInput = useSceneStore((s) => s.setHeightInput)

  if (!isTouchPrimary) {
    return null
  }

  function stopHeight() {
    setHeightInput(0)
  }

  function startHeight(direction: 1 | -1) {
    setHeightInput(direction)
  }

  const controlsContainer =
    isEditMode && Boolean(selectedObjectId) && joystickTarget === 'container'
  const targetLabel = controlsContainer ? '容器' : '镜头'

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2" data-scene-ui>
      <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
        {targetLabel}高度
      </span>
      <div className="pointer-events-auto flex touch-none flex-col overflow-hidden rounded-xl border border-white/20 bg-black/30 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          aria-label={`升高${targetLabel}`}
          onPointerDown={(e) => {
            e.stopPropagation()
            startHeight(1)
          }}
          onPointerUp={stopHeight}
          onPointerLeave={stopHeight}
          onPointerCancel={stopHeight}
          className="flex items-center justify-center bg-white/10 text-lg text-white active:bg-white/25"
          style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
        >
          ▲
        </button>
        <div className="h-px bg-white/15" />
        <button
          type="button"
          aria-label={`降低${targetLabel}`}
          onPointerDown={(e) => {
            e.stopPropagation()
            startHeight(-1)
          }}
          onPointerUp={stopHeight}
          onPointerLeave={stopHeight}
          onPointerCancel={stopHeight}
          className="flex items-center justify-center bg-white/10 text-lg text-white active:bg-white/25"
          style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
        >
          ▼
        </button>
      </div>
    </div>
  )
}
