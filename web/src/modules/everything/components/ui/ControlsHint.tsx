import { useSceneStore } from '../../store/scene-store'

export default function ControlsHint() {
  const isPointerLocked = useSceneStore((s) => s.isPointerLocked)

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {!isPointerLocked && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="rounded-lg bg-black/80 px-6 py-4 text-white backdrop-blur">
            <p className="mb-2 text-lg font-semibold">点击屏幕开始探索</p>
            <div className="space-y-1 text-sm text-gray-300">
              <p>WASD - 移动</p>
              <p>鼠标 - 视角</p>
              <p>ESC - 退出</p>
              <p>点击容器 - 查看物品</p>
            </div>
          </div>
        </div>
      )}

      {isPointerLocked && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-4 w-4">
            <div className="absolute left-1/2 top-0 h-2 w-0.5 -translate-x-1/2 bg-white" />
            <div className="absolute bottom-0 left-1/2 h-2 w-0.5 -translate-x-1/2 bg-white" />
            <div className="absolute left-0 top-1/2 h-0.5 w-2 -translate-y-1/2 bg-white" />
            <div className="absolute right-0 top-1/2 h-0.5 w-2 -translate-y-1/2 bg-white" />
          </div>
        </div>
      )}
    </div>
  )
}
