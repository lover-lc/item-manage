import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import FirstPersonCamera from './FirstPersonCamera'
import Environment from './Environment'
import Container3D from './Container3D'
import { useContainers } from '../../hooks/use-containers'
import { openContainerModal, useSceneStore } from '../../store/scene-store'
import LoadingScreen from '../ui/LoadingScreen'

export default function SceneCanvas() {
  const { data: containers, isLoading } = useContainers()
  const setSceneLoading = useSceneStore((s) => s.setSceneLoading)

  const onCreated = () => {
    setSceneLoading(false)
  }

  if (isLoading) {
    return <LoadingScreen message="加载场景中..." />
  }

  return (
    <div className="h-screen w-screen">
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        onCreated={onCreated}
      >
        <Suspense fallback={null}>
          <FirstPersonCamera />
          <Environment />

          {containers?.map((container) => (
            <Container3D
              key={container.id}
              container={container}
              onClick={openContainerModal}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  )
}
