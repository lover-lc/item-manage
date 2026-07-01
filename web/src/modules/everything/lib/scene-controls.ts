import type { Camera } from 'three'
import { Vector3 } from 'three'
import {
  ROOM_HEIGHT,
  ROOM_MOVE_BOUND_X,
  ROOM_MOVE_BOUND_Z,
} from './room-constants'

export const DRAG_THRESHOLD_PX = 7
export const LONG_PRESS_MS = 400
export const LONG_PRESS_CANCEL_PX = 10
export const OBJECT_MOVE_SPEED = 0.1

export interface KeyboardMoveInput {
  w: boolean
  a: boolean
  s: boolean
  d: boolean
}

export interface JoystickMoveInput {
  x: number
  y: number
}

export interface MoveVector {
  x: number
  z: number
}

export interface ContainerTransform {
  x: number
  y: number
  z: number
  rotationY: number
  scale: number
}

const _forward = new Vector3()
const _right = new Vector3()
const _delta = new Vector3()

export function clampContainerPosition(x: number, y: number, z: number) {
  return {
    x: Math.max(-ROOM_MOVE_BOUND_X, Math.min(ROOM_MOVE_BOUND_X, x)),
    y: Math.max(0, Math.min(ROOM_HEIGHT, y)),
    z: Math.max(-ROOM_MOVE_BOUND_Z, Math.min(ROOM_MOVE_BOUND_Z, z)),
  }
}

export function buildMoveVector(
  keys: KeyboardMoveInput,
  joystick: JoystickMoveInput,
): MoveVector {
  let x = joystick.x
  let z = joystick.y

  if (keys.w) z -= 1
  if (keys.s) z += 1
  if (keys.a) x -= 1
  if (keys.d) x += 1

  const length = Math.hypot(x, z)
  if (length > 1) {
    x /= length
    z /= length
  }

  return { x, z }
}

/** 沿镜头水平方向移动容器（WASD / 移动端平面拖拽等） */
export function applyCameraRelativePlanarMove(
  transform: ContainerTransform,
  camera: Camera,
  move: MoveVector,
  speed: number,
): ContainerTransform {
  if (move.x === 0 && move.z === 0) return transform

  camera.getWorldDirection(_forward)
  _forward.y = 0
  if (_forward.lengthSq() < 1e-6) return transform
  _forward.normalize()
  _right.crossVectors(_forward, camera.up).normalize()

  _delta.set(0, 0, 0)
  _delta.addScaledVector(_forward, -move.z * speed)
  _delta.addScaledVector(_right, move.x * speed)

  const clamped = clampContainerPosition(
    transform.x + _delta.x,
    transform.y + _delta.y,
    transform.z + _delta.z,
  )
  return { ...transform, ...clamped }
}

/** 沿视线深度移动容器（移动端摇杆 Y） */
export function applyCameraDepthMove(
  transform: ContainerTransform,
  camera: Camera,
  depthInput: number,
  speed: number,
): ContainerTransform {
  if (Math.abs(depthInput) < 0.01) return transform

  camera.getWorldDirection(_forward)
  _forward.normalize()
  _delta.copy(_forward).multiplyScalar(-depthInput * speed)

  const clamped = clampContainerPosition(
    transform.x + _delta.x,
    transform.y + _delta.y,
    transform.z + _delta.z,
  )
  return { ...transform, ...clamped }
}

export function pointerDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function isDragGesture(
  start: { x: number; y: number },
  current: { x: number; y: number },
  threshold = DRAG_THRESHOLD_PX,
): boolean {
  return pointerDistance(start, current) >= threshold
}

export function exceedsLongPressCancelDistance(
  start: { x: number; y: number },
  current: { x: number; y: number },
): boolean {
  return pointerDistance(start, current) > LONG_PRESS_CANCEL_PX
}

export type JoystickTarget = 'camera' | 'container'

export function applyHeightMove(
  transform: ContainerTransform,
  heightInput: number,
  speed: number,
): ContainerTransform {
  if (Math.abs(heightInput) < 0.01) return transform

  const clamped = clampContainerPosition(
    transform.x,
    transform.y + heightInput * speed,
    transform.z,
  )
  return { ...transform, ...clamped }
}

export function shouldUseJoystick(isTouchPrimaryDevice: boolean): boolean {
  return isTouchPrimaryDevice
}
