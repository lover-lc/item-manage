import { create } from 'zustand'

interface SceneState {
  selectedContainerId: string | null
  setSelectedContainerId: (id: string | null) => void

  showItemsModal: boolean
  setShowItemsModal: (show: boolean) => void

  isPointerLocked: boolean
  setPointerLocked: (locked: boolean) => void

  isSceneLoading: boolean
  setSceneLoading: (loading: boolean) => void

  cameraState: {
    position: [number, number, number]
    rotation: [number, number, number]
  } | null
  saveCameraState: (
    position: [number, number, number],
    rotation: [number, number, number],
  ) => void
  clearCameraState: () => void
}

export const useSceneStore = create<SceneState>((set) => ({
  selectedContainerId: null,
  setSelectedContainerId: (id) => set({ selectedContainerId: id }),

  showItemsModal: false,
  setShowItemsModal: (show) => set({ showItemsModal: show }),

  isPointerLocked: false,
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),

  isSceneLoading: true,
  setSceneLoading: (loading) => set({ isSceneLoading: loading }),

  cameraState: null,
  saveCameraState: (position, rotation) =>
    set({ cameraState: { position, rotation } }),
  clearCameraState: () => set({ cameraState: null }),
}))

export function openContainerModal(containerId: string) {
  const store = useSceneStore.getState()
  store.setSelectedContainerId(containerId)
  store.setShowItemsModal(true)
  store.setPointerLocked(false)
  if (document.pointerLockElement) {
    document.exitPointerLock()
  }
}

export function closeContainerModal() {
  const store = useSceneStore.getState()
  store.setSelectedContainerId(null)
  store.setShowItemsModal(false)
}
