import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '../../store/scene-store'

const MOVE_SPEED = 0.1
const ROOM_HALF = 9.5

export default function FirstPersonCamera() {
  const { camera } = useThree()
  const setPointerLocked = useSceneStore((s) => s.setPointerLocked)
  const isPointerLocked = useSceneStore((s) => s.isPointerLocked)
  const cameraState = useSceneStore((s) => s.cameraState)
  const saveCameraState = useSceneStore((s) => s.saveCameraState)
  const keysRef = useRef<Record<string, boolean>>({})

  useEffect(() => {
    if (cameraState) {
      camera.position.set(...cameraState.position)
      camera.rotation.set(...cameraState.rotation)
    } else {
      camera.position.set(0, 1.6, 5)
    }
  }, [camera, cameraState])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!isPointerLocked) return

    const keys = keysRef.current
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, camera.up).normalize()

    if (keys.w) camera.position.addScaledVector(forward, MOVE_SPEED)
    if (keys.s) camera.position.addScaledVector(forward, -MOVE_SPEED)
    if (keys.a) camera.position.addScaledVector(right, -MOVE_SPEED)
    if (keys.d) camera.position.addScaledVector(right, MOVE_SPEED)

    camera.position.y = Math.max(0.5, Math.min(camera.position.y, 2.5))
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -ROOM_HALF, ROOM_HALF)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -ROOM_HALF, ROOM_HALF)

    saveCameraState(
      [camera.position.x, camera.position.y, camera.position.z],
      [camera.rotation.x, camera.rotation.y, camera.rotation.z],
    )
  })

  return (
    <PointerLockControls
      onLock={() => setPointerLocked(true)}
      onUnlock={() => setPointerLocked(false)}
    />
  )
}
