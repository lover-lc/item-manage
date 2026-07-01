import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from 'lucide-react'
import { useSaveSceneConfig } from '../hooks/use-scene-config'
import { useDeleteAllContainers } from '../hooks/use-containers'
import { DEFAULT_SCENE_CONFIG } from '../lib/demo-scene'
import { useSceneStore } from '../store/scene-store'

export default function SetupPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { save: saveScene } = useSaveSceneConfig()
  const deleteAllContainers = useDeleteAllContainers()

  async function handleCreateEmptyRoom() {
    setLoading(true)
    setError(null)

    try {
      await deleteAllContainers.mutateAsync()
      await saveScene({
        ...DEFAULT_SCENE_CONFIG,
        lastModified: Date.now(),
      })

      const store = useSceneStore.getState()
      store.clearDraftTransforms()
      store.setEditMode(false)
      store.setSelectedObjectId(null)
      store.clearCameraState()

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
          从空房间开始，在 3D 场景中放置和管理容器
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <button
          onClick={() => void handleCreateEmptyRoom()}
          disabled={loading}
          className="w-full rounded-button bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '创建中...' : '创建空房间'}
        </button>

        <p className="mt-4 text-xs text-text-secondary">
          将创建 20×20m 空房间，不含任何容器；已有容器会被清空，关联物品的容器归属将置空
        </p>
      </div>
    </div>
  )
}
