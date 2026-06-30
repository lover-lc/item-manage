import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from 'lucide-react'
import { useSaveSceneConfig } from '../hooks/use-scene-config'
import { useCreateContainersBatch } from '../hooks/use-containers'
import { useAreas } from '../../items/hooks/use-areas'
import { DEFAULT_SCENE_CONFIG, getDemoContainers } from '../lib/demo-scene'

export default function SetupPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { save: saveScene } = useSaveSceneConfig()
  const { mutateAsync: createContainers } = useCreateContainersBatch()
  const { data: areas } = useAreas()

  const handleLoadDemo = async () => {
    setLoading(true)
    setError(null)

    try {
      const clientRoomArea = areas?.find((a) => a.name.includes('客厅'))
      const areaId = clientRoomArea?.id || areas?.[0]?.id

      if (!areaId) {
        throw new Error('未找到区域，请先在物品管理中创建区域')
      }

      await saveScene(DEFAULT_SCENE_CONFIG)
      await createContainers(getDemoContainers(areaId))
      navigate('/everything')
    } catch (err) {
      setError(err instanceof Error ? err.message : '初始化失败')
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-bg">
      <div className="mx-4 w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Box className="h-10 w-10 text-primary" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-text">欢迎使用空间管理</h1>
        <p className="mb-8 text-text-secondary">
          通过3D视角直观地管理家中物品的位置
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <button
          onClick={handleLoadDemo}
          disabled={loading}
          className="w-full rounded-button bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '初始化中...' : '加载演示场景'}
        </button>

        <p className="mt-4 text-xs text-text-secondary">
          将创建包含8个容器的演示场景
        </p>
      </div>
    </div>
  )
}
