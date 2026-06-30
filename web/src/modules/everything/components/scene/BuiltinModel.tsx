import { useMemo } from 'react'
import { BoxGeometry, MeshStandardMaterial } from 'three'
import { getBuiltinModel } from '../../lib/builtin-models'
import type { BuiltinModelType } from '../../types/scene-types'

interface BuiltinModelProps {
  modelRef: BuiltinModelType
  onClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export default function BuiltinModel({
  modelRef,
  onClick,
  onPointerOver,
  onPointerOut,
}: BuiltinModelProps) {
  const config = getBuiltinModel(modelRef)

  const geometry = useMemo(
    () => new BoxGeometry(...config.size),
    [config.size],
  )
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: config.color,
        roughness: 0.7,
        metalness: 0.2,
      }),
    [config.color],
  )

  return (
    <group>
      <mesh
        geometry={geometry}
        material={material}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      />
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#000000" wireframe />
      </mesh>
    </group>
  )
}
