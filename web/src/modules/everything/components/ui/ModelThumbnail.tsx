import { memo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import { resolveModelUrl } from '../../lib/model-url'
import { DRAG_THRESHOLD_PX, isDragGesture } from '../../lib/scene-controls'

function PreviewModel({ url }: { url: string }) {
  const { scene } = useGLTF(resolveModelUrl(url))
  return <primitive object={scene.clone()} />
}

function PreviewScene({ modelRef }: { modelRef: string }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 4, 3]} intensity={0.9} />
      <Bounds fit clip margin={1.2}>
        <PreviewModel url={modelRef} />
      </Bounds>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </>
  )
}

interface ModelThumbnailProps {
  modelRef: string
  onSelect?: () => void
}

function ModelThumbnail({ modelRef, onSelect }: ModelThumbnailProps) {
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation()
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation()
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (!start || !onSelect) return
    if (!isDragGesture(start, { x: e.clientX, y: e.clientY }, DRAG_THRESHOLD_PX)) {
      onSelect()
    }
  }

  return (
    <div
      className="h-28 w-full overflow-hidden bg-bg-hover"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Canvas
        camera={{ position: [2.5, 1.8, 2.5], fov: 35 }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      >
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#ccc" wireframe />
            </mesh>
          }
        >
          <PreviewScene modelRef={modelRef} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default memo(ModelThumbnail)
