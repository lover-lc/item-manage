import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Eraser, Plus, Save, Trash2, Pencil, X } from 'lucide-react'
import {
  useDeleteContainersBatch,
  useUpdateContainersBatch,
} from '../../hooks/use-containers'
import { useTouchPrimaryDevice } from '../../hooks/use-touch-primary-device'
import {
  hasUnsavedEditChanges,
  useSceneStore,
} from '../../store/scene-store'
import ClearAreaModal from '../ui/ClearAreaModal'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function EditorToolbar() {
  const isEditMode = useSceneStore((s) => s.isEditMode)
  const setEditMode = useSceneStore((s) => s.setEditMode)
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId)
  const setSelectedObjectId = useSceneStore((s) => s.setSelectedObjectId)
  const draftTransformsById = useSceneStore((s) => s.draftTransformsById)
  const pendingDeleteContainerIds = useSceneStore((s) => s.pendingDeleteContainerIds)
  const markContainersForDelete = useSceneStore((s) => s.markContainersForDelete)
  const clearPendingDeletes = useSceneStore((s) => s.clearPendingDeletes)
  const clearDraftTransforms = useSceneStore((s) => s.clearDraftTransforms)
  const clearScaleSessions = useSceneStore((s) => s.clearScaleSessions)
  const resetEditSession = useSceneStore((s) => s.resetEditSession)
  const setShowModelSelectionModal = useSceneStore((s) => s.setShowModelSelectionModal)
  const setControlsScreenRect = useSceneStore((s) => s.setControlsScreenRect)
  const setControlsAnchorRect = useSceneStore((s) => s.setControlsAnchorRect)

  const updateContainersBatch = useUpdateContainersBatch()
  const deleteContainersBatch = useDeleteContainersBatch()
  const queryClient = useQueryClient()
  const isTouchPrimary = useTouchPrimaryDevice()

  const [showClearModal, setShowClearModal] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const canRemoveSelection = Boolean(selectedObjectId)
  const hasUnsavedChanges = hasUnsavedEditChanges({
    draftTransformsById,
    pendingDeleteContainerIds,
  })
  const isSaving = updateContainersBatch.isPending || deleteContainersBatch.isPending

  const buttonClass = isTouchPrimary
    ? 'inline-flex items-center justify-center rounded-button p-2 text-sm'
    : 'inline-flex items-center gap-1.5 rounded-button px-3 py-2 text-sm'

  async function handleSave() {
    const idsToDelete = [...pendingDeleteContainerIds]
    const updates = Object.entries(draftTransformsById)
      .filter(([id]) => !pendingDeleteContainerIds.includes(id))
      .map(([id, t]) => ({
        id,
        position_3d: t,
      }))

    if (idsToDelete.length > 0) {
      await deleteContainersBatch.mutateAsync(idsToDelete)
    }
    if (updates.length > 0) {
      await updateContainersBatch.mutateAsync(updates)
    }

    await queryClient.refetchQueries({ queryKey: ['containers'] })

    clearDraftTransforms()
    clearScaleSessions()
    clearPendingDeletes()
    setEditMode(false)
    setSelectedObjectId(null)
    setControlsScreenRect(null)
    setControlsAnchorRect(null)
  }

  function handleCancel() {
    resetEditSession()
    setEditMode(false)
  }

  function handleRemoveSelected() {
    if (!selectedObjectId) return
    markContainersForDelete([selectedObjectId])
    setShowRemoveConfirm(false)
  }

  return (
    <>
      <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2" data-scene-ui>
        <div
          className={[
            'flex items-center rounded-xl border border-bg-hover bg-bg-card/90 shadow-lg backdrop-blur',
            isTouchPrimary ? 'gap-1 p-1.5' : 'gap-2 p-2',
          ].join(' ')}
        >
          <button
            type="button"
            onClick={() => {
              if (isEditMode) return
              setEditMode(true)
            }}
            disabled={isEditMode}
            aria-label="编辑"
            title="编辑"
            className={[
              buttonClass,
              'text-text',
              isEditMode ? 'opacity-40' : 'hover:bg-bg-hover',
            ].join(' ')}
          >
            <Pencil className="size-4" />
            {!isTouchPrimary && '编辑'}
          </button>

          {isEditMode && (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                aria-label="取消"
                title="取消"
                className={[buttonClass, 'text-text hover:bg-bg-hover disabled:opacity-40'].join(' ')}
              >
                <X className="size-4" />
                {!isTouchPrimary && '取消'}
              </button>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!hasUnsavedChanges || isSaving}
                aria-label="保存"
                title={hasUnsavedChanges ? '保存改动' : '没有改动'}
                className={[
                  buttonClass,
                  hasUnsavedChanges ? 'bg-primary text-white hover:bg-primary/90' : 'text-text opacity-40',
                ].join(' ')}
              >
                <Save className="size-4" />
                {!isTouchPrimary && '保存'}
              </button>

              <div className="h-6 w-px bg-bg-hover" />

              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                aria-label="清空"
                title="清空"
                className={[buttonClass, 'text-text hover:bg-bg-hover'].join(' ')}
              >
                <Eraser className="size-4" />
                {!isTouchPrimary && '清空'}
              </button>

              <button
                type="button"
                onClick={() => setShowModelSelectionModal(true)}
                aria-label="添加容器"
                title="添加容器"
                className={[buttonClass, 'text-text hover:bg-bg-hover'].join(' ')}
              >
                <Plus className="size-4" />
                {!isTouchPrimary && '添加容器'}
              </button>

              <button
                type="button"
                onClick={() => setShowRemoveConfirm(true)}
                disabled={!canRemoveSelection}
                aria-label="移除容器"
                title="移除容器"
                className={[
                  buttonClass,
                  'text-red-500',
                  !canRemoveSelection ? 'opacity-40' : 'hover:bg-bg-hover',
                ].join(' ')}
              >
                <Trash2 className="size-4" />
                {!isTouchPrimary && '移除容器'}
              </button>
            </>
          )}
        </div>
      </div>

      <ClearAreaModal open={showClearModal} onClose={() => setShowClearModal(false)} />

      <ConfirmDialog
        open={showRemoveConfirm}
        title="移除容器"
        confirmLabel="移除"
        destructive
        onConfirm={handleRemoveSelected}
        onCancel={() => setShowRemoveConfirm(false)}
      />
    </>
  )
}
