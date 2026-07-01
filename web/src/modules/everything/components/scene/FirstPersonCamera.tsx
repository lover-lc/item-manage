import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  buildMoveVector,
  DRAG_THRESHOLD_PX,
  isDragGesture,
  OBJECT_MOVE_SPEED,
} from '../../lib/scene-controls'
import {
  DEFAULT_EYE_HEIGHT,
  FPS_LOOK_SENSITIVITY,
  FPS_PITCH_MAX,
  FPS_PITCH_MIN,
  FPS_WHEEL_SENSITIVITY,
  ROOM_BOUND_Y_MAX,
  ROOM_BOUND_Y_MIN,
  ROOM_MOVE_BOUND_X,
  ROOM_MOVE_BOUND_Z,
  ROOM_ROTATE_BOUND_X,
  ROOM_ROTATE_BOUND_Z,
} from '../../lib/room-constants'
import { useSceneStore } from '../../store/scene-store'
import { useSelectedObjectMove } from '../../hooks/use-selected-object-move'
import { useTouchPrimaryDevice } from '../../hooks/use-touch-primary-device'

const _euler = new THREE.Euler(0, 0, 0, 'YXZ')
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _delta = new THREE.Vector3()

export default function FirstPersonCamera() {
  const { camera, gl } = useThree()
  const keysRef = useRef<Record<string, boolean>>({})
  const yawRef = useRef(0)
  const pitchRef = useRef(0)
  const lookActiveRef = useRef(false)
  const lookPendingRef = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)

  const isTouchPrimary = useTouchPrimaryDevice()
  const cameraState = useSceneStore((s) => s.cameraState)
  const saveCameraState = useSceneStore((s) => s.saveCameraState)
  const joystickInput = useSceneStore((s) => s.joystickInput)
  const setCameraDragging = useSceneStore((s) => s.setCameraDragging)
  const isCameraDragging = useSceneStore((s) => s.isCameraDragging)

  useSelectedObjectMove(keysRef)

  function applyRotation() {
    _euler.set(pitchRef.current, yawRef.current, 0)
    camera.rotation.copy(_euler)
  }

  function syncAnglesFromCamera() {
    _euler.setFromQuaternion(camera.quaternion, 'YXZ')
    yawRef.current = _euler.y
    pitchRef.current = THREE.MathUtils.clamp(_euler.x, FPS_PITCH_MIN, FPS_PITCH_MAX)
    applyRotation()
  }

  useEffect(() => {
    if (cameraState) {
      camera.position.set(...cameraState.position)
      camera.rotation.set(...cameraState.rotation)
      syncAnglesFromCamera()
    } else {
      camera.position.set(0, DEFAULT_EYE_HEIGHT, 0)
      yawRef.current = 0
      pitchRef.current = 0
      applyRotation()
    }
  }, [camera, cameraState])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        keysRef.current[' '] = true
        return
      }
      keysRef.current[e.key.toLowerCase()] = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        keysRef.current[' '] = false
        return
      }
      keysRef.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    const canvas = gl.domElement

    function canStartLook(): boolean {
      const store = useSceneStore.getState()
      if (store.pointerOnSceneObject) return false
      if (store.draggingContainerId) return false
      return true
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      if (target.closest('[data-scene-ui]')) return

      lookPendingRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId }
    }

    function onPointerMove(e: PointerEvent) {
      if (lookActiveRef.current && lastPointerRef.current) {
        const dx = e.clientX - lastPointerRef.current.x
        const dy = e.clientY - lastPointerRef.current.y
        lastPointerRef.current = { x: e.clientX, y: e.clientY }

        yawRef.current -= dx * FPS_LOOK_SENSITIVITY
        pitchRef.current = THREE.MathUtils.clamp(
          pitchRef.current - dy * FPS_LOOK_SENSITIVITY,
          FPS_PITCH_MIN,
          FPS_PITCH_MAX,
        )
        applyRotation()
        return
      }

      const pending = lookPendingRef.current
      if (!pending || pending.pointerId !== e.pointerId) return
      if (!canStartLook()) {
        lookPendingRef.current = null
        return
      }

      if (
        isDragGesture(
          { x: pending.x, y: pending.y },
          { x: e.clientX, y: e.clientY },
          DRAG_THRESHOLD_PX,
        )
      ) {
        lookActiveRef.current = true
        lookPendingRef.current = null
        lastPointerRef.current = { x: e.clientX, y: e.clientY }
        setCameraDragging(true)
        canvas.setPointerCapture(e.pointerId)
      }
    }

    function endLook(e: PointerEvent) {
      lookPendingRef.current = null
      if (!lookActiveRef.current) return
      lookActiveRef.current = false
      lastPointerRef.current = null
      setCameraDragging(false)
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId)
      }
      saveCameraState(
        [camera.position.x, camera.position.y, camera.position.z],
        [camera.rotation.x, camera.rotation.y, camera.rotation.z],
      )
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      camera.getWorldDirection(_forward)
      _forward.y = 0
      if (_forward.lengthSq() < 1e-6) return
      _forward.normalize()
      camera.position.addScaledVector(_forward, -e.deltaY * FPS_WHEEL_SENSITIVITY * 0.01)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', endLook)
    canvas.addEventListener('pointercancel', endLook)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endLook)
      canvas.removeEventListener('pointercancel', endLook)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [camera, gl, saveCameraState, setCameraDragging])

  useFrame(() => {
    const store = useSceneStore.getState()
    const objectEditActive = store.isEditMode && Boolean(store.selectedObjectId)

    const boundX = isCameraDragging ? ROOM_ROTATE_BOUND_X : ROOM_MOVE_BOUND_X
    const boundZ = isCameraDragging ? ROOM_ROTATE_BOUND_Z : ROOM_MOVE_BOUND_Z

    const keys = keysRef.current
    const useJoystickForCamera =
      !isTouchPrimary || !store.isEditMode || store.joystickTarget === 'camera'

    const move = buildMoveVector(
      objectEditActive
        ? { w: false, a: false, s: false, d: false }
        : {
            w: Boolean(keys.w),
            a: Boolean(keys.a),
            s: Boolean(keys.s),
            d: Boolean(keys.d),
          },
      useJoystickForCamera ? joystickInput : { x: 0, y: 0 },
    )

    if (move.x !== 0 || move.z !== 0) {
      camera.getWorldDirection(_forward)
      _forward.y = 0
      _forward.normalize()

      _right.crossVectors(_forward, camera.up).normalize()

      _delta.set(0, 0, 0)
      _delta.addScaledVector(_forward, -move.z * OBJECT_MOVE_SPEED)
      _delta.addScaledVector(_right, move.x * OBJECT_MOVE_SPEED)
      camera.position.add(_delta)
    }

    if (keys[' ']) {
      camera.position.y += OBJECT_MOVE_SPEED
    }
    if (keys.control) {
      camera.position.y -= OBJECT_MOVE_SPEED
    }

    if (
      isTouchPrimary &&
      (!store.isEditMode || store.joystickTarget === 'camera') &&
      Math.abs(store.heightInput) > 0.01
    ) {
      camera.position.y += store.heightInput * OBJECT_MOVE_SPEED
    }

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -boundX, boundX)
    camera.position.y = THREE.MathUtils.clamp(
      camera.position.y,
      ROOM_BOUND_Y_MIN,
      ROOM_BOUND_Y_MAX,
    )
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -boundZ, boundZ)

    if (!isCameraDragging) {
      saveCameraState(
        [camera.position.x, camera.position.y, camera.position.z],
        [camera.rotation.x, camera.rotation.y, camera.rotation.z],
      )
    }
  })

  return null
}
