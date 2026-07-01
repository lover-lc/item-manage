import { describe, expect, test } from 'vitest'
import {
  OVERLAY_EDGE_MARGIN,
  placeRotateControl,
  placeScaleControl,
  ROTATE_CONTROL_SIZE,
  SCALE_CONTROL_SIZE,
} from '../src/modules/everything/lib/overlay-layout'
import type { ScreenRect } from '../src/modules/everything/lib/projection-utils'

const viewport = { width: 400, height: 800 }

function anchor(overrides: Partial<ScreenRect> = {}): ScreenRect {
  return {
    centerX: 200,
    centerY: 400,
    top: 300,
    bottom: 500,
    left: 100,
    right: 300,
    visible: true,
    ...overrides,
  }
}

describe('overlay layout', () => {
  test('places rotate control below anchor by default', () => {
    const placement = placeRotateControl(anchor(), viewport)
    expect(placement.top).toBe(500 + 12)
    expect(placement.left).toBe(200)
  })

  test('flips rotate control above when bottom overflows', () => {
    const placement = placeRotateControl(
      anchor({ bottom: viewport.height - 20, top: viewport.height - 120 }),
      viewport,
    )
    expect(placement.top).toBe(viewport.height - 120 - 12 - ROTATE_CONTROL_SIZE.height)
  })

  test('clamps rotate control horizontally near screen edge', () => {
    const placement = placeRotateControl(
      anchor({ centerX: 10, left: 0, right: 20 }),
      viewport,
    )
    expect(placement.left).toBeGreaterThanOrEqual(
      OVERLAY_EDGE_MARGIN + ROTATE_CONTROL_SIZE.width / 2,
    )
  })

  test('places scale control to the right by default', () => {
    const placement = placeScaleControl(anchor(), viewport)
    expect(placement.left).toBe(300 + 12)
    expect(placement.top).toBe(400 - SCALE_CONTROL_SIZE.height / 2)
  })

  test('flips scale control to the left when right overflows', () => {
    const placement = placeScaleControl(
      anchor({ right: viewport.width - 10, left: viewport.width - 80 }),
      viewport,
    )
    expect(placement.left).toBe(viewport.width - 80 - 12 - SCALE_CONTROL_SIZE.width)
  })
})
