import { useEffect, useRef } from 'react'
import { useDeleteAllContainers } from './use-containers'
import { useSceneStore } from '../store/scene-store'

const MIGRATION_KEY = 'everything-migration-empty-room-v1'

/** 一次性清空历史 demo 容器，保留 items（container_id → NULL） */
export function useEmptyRoomMigration() {
  const deleteAllContainers = useDeleteAllContainers()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current || localStorage.getItem(MIGRATION_KEY)) return
    ran.current = true

    deleteAllContainers
      .mutateAsync()
      .then(() => {
        localStorage.setItem(MIGRATION_KEY, '1')
        const store = useSceneStore.getState()
        store.clearDraftTransforms()
        store.setSelectedObjectId(null)
        store.setEditMode(false)
      })
      .catch((err) => {
        console.error('清空历史容器失败:', err)
        ran.current = false
      })
  }, [deleteAllContainers])
}
