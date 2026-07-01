import { describe, expect, test } from 'vitest'
import {
  applyCameraDepthMove,
  applyCameraRelativePlanarMove,
  applyHeightMove,
  buildMoveVector,
  clampContainerPosition,
  exceedsLongPressCancelDistance,
  isDragGesture,
  LONG_PRESS_CANCEL_PX,
  LONG_PRESS_MS,
  pointerDistance,
  shouldUseJoystick,
} from '../src/modules/everything/lib/scene-controls'
import { PerspectiveCamera } from 'three'

describe('scene controls utils', () => {
  test('builds keyboard movement vector for WASD', () => {
    const move = buildMoveVector(
      { w: true, a: false, s: false, d: true },
      { x: 0, y: 0 },
    )

    expect(move.z).toBeCloseTo(-0.707)
    expect(move.x).toBeCloseTo(0.707)
  })

  test('merges joystick vector with keyboard vector', () => {
    const move = buildMoveVector(
      { w: false, a: false, s: false, d: false },
      { x: 0.4, y: -0.6 },
    )

    expect(move.x).toBeCloseTo(0.4)
    expect(move.z).toBeCloseTo(-0.6)
  })

  test('clamps container position inside room', () => {
    const clamped = clampContainerPosition(100, -1, 100)
    expect(clamped.x).toBeLessThanOrEqual(9.8)
    expect(clamped.y).toBe(0)
    expect(clamped.z).toBeLessThanOrEqual(9.8)
  })

  test('moves container relative to camera forward', () => {
    const camera = new PerspectiveCamera()
    camera.position.set(0, 1.6, 0)
    camera.rotation.set(0, 0, 0, 'YXZ')
    camera.updateMatrixWorld()

    const transform = { x: 0, y: 0, z: 0, rotationY: 0, scale: 1 }
    const next = applyCameraRelativePlanarMove(
      transform,
      camera,
      { x: 0, z: -1 },
      0.1,
    )

    expect(next.z).toBeLessThan(0)
    expect(next.x).toBeCloseTo(0, 5)
  })

  test('moves container along camera depth', () => {
    const camera = new PerspectiveCamera()
    camera.position.set(0, 1.6, 0)
    camera.rotation.set(0, 0, 0, 'YXZ')
    camera.updateMatrixWorld()

    const transform = { x: 0, y: 0, z: 0, rotationY: 0, scale: 1 }
    const next = applyCameraDepthMove(transform, camera, -1, 0.1)

    expect(next.z).toBeLessThan(0)
  })

  test('moves container along height axis', () => {
    const transform = { x: 0, y: 1, z: 0, rotationY: 0, scale: 1 }
    const up = applyHeightMove(transform, 1, 0.1)
    const down = applyHeightMove(transform, -1, 0.1)

    expect(up.y).toBeCloseTo(1.1)
    expect(down.y).toBeCloseTo(0.9)
  })

  test('treats movement over threshold as drag', () => {
    expect(isDragGesture({ x: 10, y: 10 }, { x: 16, y: 10 }, 5)).toBe(true)
    expect(isDragGesture({ x: 10, y: 10 }, { x: 13, y: 12 }, 5)).toBe(false)
  })

  test('measures pointer distance', () => {
    expect(pointerDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  test('cancels long press when finger moves too far', () => {
    expect(exceedsLongPressCancelDistance({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(false)
    expect(exceedsLongPressCancelDistance({ x: 0, y: 0 }, { x: 11, y: 0 })).toBe(true)
    expect(LONG_PRESS_CANCEL_PX).toBe(10)
    expect(LONG_PRESS_MS).toBe(400)
  })

  test('uses joystick on touch-primary devices', () => {
    expect(shouldUseJoystick(true)).toBe(true)
    expect(shouldUseJoystick(false)).toBe(false)
  })
})
