import type { ScreenRect } from './projection-utils'

export const OVERLAY_EDGE_MARGIN = 8

export const ROTATE_CONTROL_SIZE = { width: 104, height: 56 }
export const SCALE_CONTROL_SIZE = { width: 56, height: 160 }

export interface ControlPlacement {
  left: number
  top: number
}

export interface ViewportSize {
  width: number
  height: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** 旋转条：默认在选框下方，空间不足时翻到上方，并限制在屏幕内 */
export function placeRotateControl(
  anchor: ScreenRect,
  viewport: ViewportSize,
  size = ROTATE_CONTROL_SIZE,
  margin = OVERLAY_EDGE_MARGIN,
): ControlPlacement {
  const gap = 12
  let top = anchor.bottom + gap
  if (top + size.height > viewport.height - margin) {
    top = anchor.top - gap - size.height
  }

  const halfW = size.width / 2
  const left = clamp(
    anchor.centerX,
    margin + halfW,
    viewport.width - margin - halfW,
  )
  top = clamp(top, margin, viewport.height - margin - size.height)

  return { left, top }
}

/** 缩放条：默认在选框右侧，空间不足时翻到左侧，并限制在屏幕内 */
export function placeScaleControl(
  anchor: ScreenRect,
  viewport: ViewportSize,
  size = SCALE_CONTROL_SIZE,
  margin = OVERLAY_EDGE_MARGIN,
): ControlPlacement {
  const gap = 12
  let left = anchor.right + gap
  if (left + size.width > viewport.width - margin) {
    left = anchor.left - gap - size.width
  }

  let top = anchor.centerY - size.height / 2
  top = clamp(top, margin, viewport.height - margin - size.height)
  left = clamp(left, margin, viewport.width - margin - size.width)

  return { left, top }
}
