import { useState } from 'react'
import { useTouchPrimaryDevice } from '../../hooks/use-touch-primary-device'
import { useSceneStore } from '../../store/scene-store'

export default function ControlsHint() {
  const isTouchPrimary = useTouchPrimaryDevice()
  const [dismissed, setDismissed] = useState(false)
  const isEditMode = useSceneStore((s) => s.isEditMode)
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId)

  if (dismissed) return null

  const objectSelected = isEditMode && Boolean(selectedObjectId)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 flex justify-center px-4">
      <div className="pointer-events-auto max-w-md rounded-lg bg-black/75 px-4 py-3 text-white backdrop-blur">
        <p className="mb-2 text-sm font-semibold">操作说明</p>
        <div className="space-y-1 text-xs text-gray-300">
          {isTouchPrimary ? (
            isEditMode && selectedObjectId ? (
              <>
                <p>长按容器 - 拖拽移动</p>
                <p>左摇杆 - 平面移动（可切换镜头/容器）</p>
                <p>右侧 ▲▼ - 高度</p>
                <p>拖空白 - 旋转视角</p>
                <p>点地面 - 取消选中</p>
              </>
            ) : isEditMode ? (
              <>
                <p>点击容器 - 选中编辑</p>
                <p>左摇杆 - 移动镜头</p>
                <p>右侧 ▲▼ - 镜头高度</p>
                <p>拖空白 - 旋转视角</p>
              </>
            ) : (
              <>
                <p>单指拖拽 - 旋转视角</p>
                <p>左下摇杆 - 移动</p>
                <p>右侧 ▲▼ - 镜头高度</p>
                <p>点击容器 - 查看物品</p>
              </>
            )
          ) : objectSelected ? (
            <>
              <p>WASD - 移动容器</p>
              <p>长按容器 - 拖拽移动</p>
              <p>拖空白 - 旋转视角</p>
              <p>Space/Ctrl/滚轮 - 移动镜头</p>
              <p>点地面 - 取消选中</p>
            </>
          ) : (
            <>
              <p>鼠标拖拽 - 旋转视角</p>
              <p>滚轮 - 镜头前后</p>
              <p>WASD - 移动镜头</p>
              <p>Space / Ctrl - 镜头升降</p>
              <p>点击容器 - 查看物品</p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-2 text-xs text-primary hover:underline"
        >
          知道了
        </button>
      </div>
    </div>
  )
}
