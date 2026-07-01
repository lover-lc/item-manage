import { useEffect, useRef, useState } from 'react'
import { useSceneStore } from '../../store/scene-store'
import { AVAILABLE_MODELS } from '../../lib/available-models'
import { computeModelFitScale } from '../../lib/model-fit'
import { findAreaAtWorldPoint } from '../../lib/area-zones'
import { useCreateContainer } from '../../hooks/use-containers'
import { useAreas } from '../../../items/hooks/use-areas'
import ModelThumbnail from './ModelThumbnail'

export default function ModelSelectionModal() {
  const showModal = useSceneStore((s) => s.showModelSelectionModal)
  const setShowModal = useSceneStore((s) => s.setShowModelSelectionModal)
  const initScaleSession = useSceneStore((s) => s.initScaleSession)
  const createContainer = useCreateContainer()
  const { data: areas = [] } = useAreas()
  const [loadingModelId, setLoadingModelId] = useState<string | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState<string>('')
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const wasOpenRef = useRef(false)
  const isLoading = createContainer.isPending || loadingModelId !== null

  const selectableAreas = areas.filter((a) => !a.isSystemReserved)
  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) ?? null

  useEffect(() => {
    if (showModal && !wasOpenRef.current) {
      const { cameraState } = useSceneStore.getState()
      const [camX, , camZ] = cameraState?.position ?? [0, 0, 0]
      const currentArea = findAreaAtWorldPoint(areas, camX, camZ)
      setSelectedAreaId(currentArea?.id ?? '')
      setSelectedModelId(null)
    }
    wasOpenRef.current = showModal
  }, [showModal, areas])

  useEffect(() => {
    if (!showModal) return

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowModal(false)
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [showModal, setShowModal])

  if (!showModal) return null

  async function handleConfirm() {
    if (!selectedModel || !selectedAreaId) return

    setLoadingModelId(selectedModel.id)

    try {
      const fitScale = await computeModelFitScale(selectedModel.modelRef, selectedModel.modelType)
      const [camX, camY, camZ] = useSceneStore.getState().cameraState?.position ?? [0, 1.6, 0]

      const newContainer = await createContainer.mutateAsync({
        name: selectedModel.name,
        areaId: selectedAreaId,
        position: { x: camX, y: camY, z: camZ, rotationY: 0, scale: fitScale },
        modelRef: selectedModel.modelRef,
        modelType: selectedModel.modelType,
      })

      setShowModal(false)

      const store = useSceneStore.getState()
      store.setSelectedObjectId(newContainer.id)
      store.setDraftTransform(newContainer.id, { ...newContainer.position })
      initScaleSession(newContainer.id, newContainer.position.scale)
    } catch (error) {
      console.error('创建容器失败:', error)
    } finally {
      setLoadingModelId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" data-scene-ui>
      <div className="mx-4 w-full max-w-lg rounded-lg bg-bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">选择容器类型</h2>

        <label htmlFor="container-area-select" className="mb-1 block text-sm font-medium text-text">
          所属区域 <span className="text-red-500">*</span>
        </label>
        <select
          id="container-area-select"
          value={selectedAreaId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
          className="mb-4 w-full rounded-button border border-bg-hover bg-bg px-3 py-2 text-sm text-text"
        >
          <option value="">请选择区域</option>
          {selectableAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4">
          {AVAILABLE_MODELS.map((model) => {
            const isSelected = selectedModelId === model.id
            return (
              <div
                key={model.id}
                className={[
                  'flex flex-col overflow-hidden rounded-lg border-2',
                  isSelected ? 'border-primary' : 'border-bg-hover',
                ].join(' ')}
              >
                <ModelThumbnail
                  modelRef={model.modelRef}
                  onSelect={() => setSelectedModelId(model.id)}
                />
                <button
                  type="button"
                  onClick={() => setSelectedModelId(model.id)}
                  disabled={isLoading}
                  className="flex-1 p-3 text-left hover:bg-bg-hover disabled:opacity-50"
                >
                  <span className="font-medium">{model.name}</span>
                  {model.description && (
                    <p className="mt-0.5 text-sm text-text-secondary">{model.description}</p>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={isLoading}
            className="flex-1 rounded-button border border-bg-hover px-4 py-2 text-sm text-text hover:bg-bg-hover disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isLoading || !selectedAreaId || !selectedModel}
            className="flex-1 rounded-button bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}
