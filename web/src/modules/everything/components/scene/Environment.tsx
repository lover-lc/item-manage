export default function Environment() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[0, 2.8, 0]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <hemisphereLight args={['#FFFFFF', '#888888', 0.4]} />
    </>
  )
}
