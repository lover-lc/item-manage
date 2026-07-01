import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SceneErrorBoundary } from '../components/ErrorBoundary'
import SceneCanvas from '../components/scene/SceneCanvas'
import ControlsHint from '../components/ui/ControlsHint'
import ContainerItemsModal from '../components/ui/ContainerItemsModal'
import WebGLUnsupportedPage from '../components/WebGLUnsupportedPage'
import EditorToolbar from '../components/editor/EditorToolbar'
import ModelSelectionModal from '../components/ui/ModelSelectionModal'
import ContainerControlsOverlay from '../components/ui/ContainerControlsOverlay'
import MobileJoystick from '../components/ui/MobileJoystick'
import MobileHeightControl from '../components/ui/MobileHeightControl'
import { useEmptyRoomMigration } from '../hooks/use-empty-room-migration'
import { useHasScene } from '../hooks/use-scene-config'
import { useSceneStore } from '../store/scene-store'
import { isWebGLSupported } from '../lib/webgl-check'
import { useAreas } from '../../items/hooks/use-areas'
import { validateAreaZones } from '../lib/area-zones'

export default function SceneViewPage() {
  const navigate = useNavigate()
  const { hasScene, loading } = useHasScene()
  const { data: areas = [] } = useAreas()
  const zoneIssuesLoggedRef = useRef(false)
  useEmptyRoomMigration()

  useEffect(() => {
    if (zoneIssuesLoggedRef.current || areas.length === 0) return
    const issues = validateAreaZones(areas)
    if (issues.length > 0) {
      console.warn('[区域围栏配置] 校验未通过:', issues)
      zoneIssuesLoggedRef.current = true
    }
  }, [areas])

  useEffect(() => {
    const key = 'everything-migration-fps-camera-v1'
    if (localStorage.getItem(key)) return
    useSceneStore.getState().clearCameraState()
    localStorage.setItem(key, '1')
  }, [])

  useEffect(() => {
    const key = 'everything-migration-room-20m-v1'
    if (localStorage.getItem(key)) return
    useSceneStore.getState().clearCameraState()
    localStorage.setItem(key, '1')
  }, [])

  useEffect(() => {
    if (!loading && !hasScene) {
      navigate('/everything/setup')
    }
  }, [hasScene, loading, navigate])

  if (!isWebGLSupported()) {
    return <WebGLUnsupportedPage />
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-secondary">加载中...</p>
      </div>
    )
  }

  return (
    <SceneErrorBoundary>
      <SceneCanvas />
      <EditorToolbar />
      <ContainerControlsOverlay />
      <MobileJoystick />
      <MobileHeightControl />
      <ControlsHint />
      <ContainerItemsModal />
      <ModelSelectionModal />
    </SceneErrorBoundary>
  )
}
