import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import {
  ROOM_DEPTH,
  ROOM_FLOOR_COLOR,
  ROOM_HALF_DEPTH,
  ROOM_HALF_WIDTH,
  ROOM_HEIGHT,
  ROOM_WALL_COLOR,
  ROOM_WALL_FADE_DISTANCE,
  ROOM_WALL_FADE_OPACITY,
  ROOM_WIDTH,
} from '../../lib/room-constants'
import { DRAG_THRESHOLD_PX } from '../../lib/scene-controls'
import { useSceneStore } from '../../store/scene-store'

function fadeOpacity(distanceToWall: number): number {
  if (distanceToWall >= ROOM_WALL_FADE_DISTANCE) return 1
  return (
    ROOM_WALL_FADE_OPACITY +
    (1 - ROOM_WALL_FADE_OPACITY) * (distanceToWall / ROOM_WALL_FADE_DISTANCE)
  )
}

function applyWallOpacity(material: THREE.MeshStandardMaterial, opacity: number) {
  material.opacity = opacity
  material.transparent = opacity < 1
  material.depthWrite = opacity >= 1
  material.needsUpdate = true
}

export default function Room() {
  const { camera } = useThree()
  const northRef = useRef<THREE.MeshStandardMaterial>(null)
  const southRef = useRef<THREE.MeshStandardMaterial>(null)
  const eastRef = useRef<THREE.MeshStandardMaterial>(null)
  const westRef = useRef<THREE.MeshStandardMaterial>(null)
  const ceilingRef = useRef<THREE.MeshStandardMaterial>(null)

  const wallMaterialProps = useMemo(
    () => ({ color: ROOM_WALL_COLOR, roughness: 0.9 }),
    [],
  )

  const floorMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ROOM_FLOOR_COLOR, roughness: 0.85 }),
    [],
  )

  function handleFloorClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    const store = useSceneStore.getState()
    if (!store.isEditMode) return
    if (store.isCameraDragging || store.pointerDragDistance >= DRAG_THRESHOLD_PX) return
    if (store.draggingContainerId) return
    if (store.activeContainerGestureId) return
    store.setSelectedObjectId(null)
    store.setControlsScreenRect(null)
    store.setControlsAnchorRect(null)
  }

  useFrame(() => {
    const { x, z } = camera.position
    const distNorth = z + ROOM_HALF_DEPTH
    const distSouth = ROOM_HALF_DEPTH - z
    const distWest = x + ROOM_HALF_WIDTH
    const distEast = ROOM_HALF_WIDTH - x

    if (northRef.current) applyWallOpacity(northRef.current, fadeOpacity(distNorth))
    if (southRef.current) applyWallOpacity(southRef.current, fadeOpacity(distSouth))
    if (westRef.current) applyWallOpacity(westRef.current, fadeOpacity(distWest))
    if (eastRef.current) applyWallOpacity(eastRef.current, fadeOpacity(distEast))
    if (ceilingRef.current) applyWallOpacity(ceilingRef.current, 1)
  })

  return (
    <group>
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={handleFloorClick}
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_HALF_DEPTH]} receiveShadow castShadow>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.1]} />
        <meshStandardMaterial ref={northRef} {...wallMaterialProps} />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_HALF_DEPTH]} receiveShadow castShadow>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.1]} />
        <meshStandardMaterial ref={southRef} {...wallMaterialProps} />
      </mesh>

      <mesh position={[ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial ref={eastRef} {...wallMaterialProps} />
      </mesh>

      <mesh position={[-ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial ref={westRef} {...wallMaterialProps} />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial ref={ceilingRef} {...wallMaterialProps} />
      </mesh>
    </group>
  )
}
