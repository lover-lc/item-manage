import { Outlet } from 'react-router-dom'

/** Everything 模块根布局：禁止移动端长按弹出系统菜单 */
export default function EverythingLayout() {
  return (
    <div
      className="min-h-screen w-full select-none touch-none"
      style={{ WebkitTouchCallout: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Outlet />
    </div>
  )
}
