import { useState } from 'react'
import { useAreas } from '../../../items/hooks/use-areas'
import { useContainers } from '../../hooks/use-containers'
import { useSceneStore, isContainerPendingDelete } from '../../store/scene-store'

const ALL_AREAS_VALUE = '__all__'

interface ClearAreaModalProps {
  open: boolean
  onClose: () => void
}

export default function ClearAreaModal({ open, onClose }: ClearAreaModalProps) {
  const { data: areas = [] } = useAreas()
  const { data: containers = [] } = useContainers()
  const pendingDeleteContainerIds = useSceneStore((s) => s.pendingDeleteContainerIds)
  const markContainersForDelete = useSceneStore((s) => s.markContainersForDelete)

  const [selectedAreaId, setSelectedAreaId] = useState<string>(ALL_AREAS_VALUE)

  if (!open) return null

  const visibleContainers = containers.filter(
    (c) => !isContainerPendingDelete(c.id, pendingDeleteContainerIds),
  )

  const targetCount =
    selectedAreaId === ALL_AREAS_VALUE
      ? visibleContainers.length
      : visibleContainers.filter((c) => c.areaId === selectedAreaId).length

  function handleConfirm() {
    const ids =
      selectedAreaId === ALL_AREAS_VALUE
        ? visibleContainers.map((c) => c.id)
        : visibleContainers.filter((c) => c.areaId === selectedAreaId).map((c) => c.id)

    if (ids.length > 0) {
      markContainersForDelete(ids)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      data-scene-ui
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-lg bg-bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-text">清空区域</h2>

        <label className="mt-4 block text-sm font-medium text-text">区域</label>
        <select
          value={selectedAreaId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
          className="mt-1 w-full rounded-button border border-bg-hover bg-bg px-3 py-2 text-sm text-text"
        >
          <option value={ALL_AREAS_VALUE}>全部区域</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>

        <p className="mt-3 text-sm text-text-secondary">
          将标记移除 {targetCount} 个容器
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-button px-4 py-2 text-sm text-text hover:bg-bg-hover"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={targetCount === 0}
            className="rounded-button bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-40"
          >
            清空
          </button>
        </div>
      </div>
    </div>
  )
}
