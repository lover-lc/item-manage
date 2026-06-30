import { useState } from 'react'
import { Html } from '@react-three/drei'
import { isBuiltinModelRef } from '../../lib/builtin-models'
import BuiltinModel from './BuiltinModel'
import type { Container } from '../../types/scene-types'

interface Container3DProps {
  container: Container
  onClick: (id: string) => void
}

export default function Container3D({ container, onClick }: Container3DProps) {
  const [hovered, setHovered] = useState(false)

  const { position, modelRef } = container
  const { x, y, z, rotationY, scale } = position

  if (!isBuiltinModelRef(modelRef)) {
    return (
      <group position={[x, y + 0.3, z]}>
        <mesh onClick={() => onClick(container.id)}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#9E9E9E" />
        </mesh>
        <Html distanceFactor={10} position={[0, 0.6, 0]}>
          <div className="rounded bg-black/80 px-2 py-1 text-xs text-white">
            {container.name}
          </div>
        </Html>
      </group>
    )
  }

  return (
    <group
      position={[x, y + 0.01, z]}
      rotation={[0, rotationY, 0]}
      scale={scale}
    >
      <BuiltinModel
        modelRef={modelRef}
        onClick={() => onClick(container.id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />

      {hovered && (
        <Html distanceFactor={10} position={[0, 1, 0]}>
          <div className="rounded bg-black/80 px-2 py-1 text-sm text-white">
            {container.name}
          </div>
        </Html>
      )}
    </group>
  )
}
