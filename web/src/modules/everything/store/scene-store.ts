import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { RefObject } from 'react'
import type { Group } from 'three'
import type { JoystickMoveInput, JoystickTarget } from '../lib/scene-controls'
import type { ScreenRect } from '../lib/projection-utils'

interface SceneState {
  selectedContainerId: string | null
  setSelectedContainerId: (id: string | null) => void

  showItemsModal: boolean
  setShowItemsModal: (show: boolean) => void

  isCameraDragging: boolean
  setCameraDragging: (dragging: boolean) => void

  pointerDragDistance: number
  setPointerDragDistance: (distance: number) => void
  resetPointerDrag: () => void

  joystickInput: JoystickMoveInput
  setJoystickInput: (input: JoystickMoveInput) => void

  /** 触屏摇杆目标：镜头 / 容器 */
  joystickTarget: JoystickTarget
  setJoystickTarget: (target: JoystickTarget) => void

  /** 右侧高度键 -1/0/1 */
  heightInput: number
  setHeightInput: (input: number) => void

  isEditMode: boolean
  setEditMode: (enabled: boolean) => void

  selectedObjectId: string | null
  setSelectedObjectId: (id: string | null) => void

  isDraggingObject: boolean
  setDraggingObject: (dragging: boolean) => void

  hoveredObjectId: string | null
  setHoveredObjectId: (id: string | null) => void

  showModelSelectionModal: boolean
  setShowModelSelectionModal: (show: boolean) => void

  containerGroupRefs: Record<string, RefObject<Group | null>>
  setContainerGroupRef: (id: string, ref: RefObject<Group | null>) => void

  containerModelRootRefs: Record<string, RefObject<Group | null>>
  setContainerModelRootRef: (id: string, ref: RefObject<Group | null>) => void

  draggingContainerId: string | null
  setDraggingContainerId: (id: string | null) => void

  /** 长按等待中（缩放脉冲动画） */
  longPressPendingContainerId: string | null
  setLongPressPendingContainerId: (id: string | null) => void

  /** 长按完成、可开始拖拽（红框 + 已震动） */
  dragReadyContainerId: string | null
  setDragReadyContainerId: (id: string | null) => void

  /** 当前指针手势始于容器 mesh，用于避免松手时地板 click 误取消选中 */
  activeContainerGestureId: string | null
  setActiveContainerGestureId: (id: string | null) => void

  pointerOnSceneObject: boolean
  setPointerOnSceneObject: (onObject: boolean) => void

  draftTransformsById: Record<
    string,
    {
      x: number
      y: number
      z: number
      rotationY: number
      scale: number
    }
  >
  setDraftTransform: (
    id: string,
    transform: { x: number; y: number; z: number; rotationY: number; scale: number },
  ) => void
  clearDraftTransforms: () => void

  /** 编辑会话中标记待删除的容器，保存后才真正删除 */
  pendingDeleteContainerIds: string[]
  markContainersForDelete: (ids: string[]) => void
  unmarkContainerForDelete: (id: string) => void
  clearPendingDeletes: () => void

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

  /** 实时屏幕包围盒（拖拽手柄跟随） */
  controlsScreenRect: ScreenRect | null
  setControlsScreenRect: (rect: ScreenRect | null) => void

  /** 选中时快照，旋转/缩放控件固定于此 */
  controlsAnchorRect: ScreenRect | null
  setControlsAnchorRect: (rect: ScreenRect | null) => void

  /** 选中时的绝对 scale 基准，滑块 1.0 对应该值 */
  scaleSessionBaseById: Record<string, number>
  /** 当前编辑会话相对缩放系数 0.5~2.0，默认 1.0 */
  scaleFactorById: Record<string, number>
  initScaleSession: (id: string, absoluteScale: number) => void
  setScaleFactor: (id: string, factor: number) => void
  clearScaleSessions: () => void

  /** 选中物体本地包围盒（不含 scale，用于投影/选框） */
  selectionBoundsById: Record<string, { center: [number, number, number]; size: [number, number, number] }>
  setSelectionBounds: (id: string, bounds: { center: [number, number, number]; size: [number, number, number] } | null) => void

  resetEditSession: () => void
}

export const useSceneStore = create<SceneState>()(
  subscribeWithSelector((set) => ({
    selectedContainerId: null,
    setSelectedContainerId: (id) => set({ selectedContainerId: id }),

    showItemsModal: false,
    setShowItemsModal: (show) => set({ showItemsModal: show }),

    isCameraDragging: false,
    setCameraDragging: (dragging) => set({ isCameraDragging: dragging }),

    pointerDragDistance: 0,
    setPointerDragDistance: (distance) => set({ pointerDragDistance: distance }),
    resetPointerDrag: () => set({ pointerDragDistance: 0 }),

    joystickInput: { x: 0, y: 0 },
    setJoystickInput: (input) => set({ joystickInput: input }),

    joystickTarget: 'camera',
    setJoystickTarget: (target) => set({ joystickTarget: target }),

    heightInput: 0,
    setHeightInput: (input) => set({ heightInput: input }),

    isEditMode: false,
    setEditMode: (enabled) =>
      set(
        enabled
          ? { isEditMode: true }
          : {
              isEditMode: false,
              joystickTarget: 'camera',
              heightInput: 0,
              joystickInput: { x: 0, y: 0 },
            },
      ),

    selectedObjectId: null,
    setSelectedObjectId: (id) =>
      set(
        id === null
          ? {
              selectedObjectId: null,
              joystickTarget: 'camera',
              heightInput: 0,
              joystickInput: { x: 0, y: 0 },
            }
          : { selectedObjectId: id },
      ),

    isDraggingObject: false,
    setDraggingObject: (dragging) => set({ isDraggingObject: dragging }),

    hoveredObjectId: null,
    setHoveredObjectId: (id) => set({ hoveredObjectId: id }),

    showModelSelectionModal: false,
    setShowModelSelectionModal: (show) => set({ showModelSelectionModal: show }),

    containerGroupRefs: {},
    setContainerGroupRef: (id, ref) =>
      set((state) => ({
        containerGroupRefs: {
          ...state.containerGroupRefs,
          [id]: ref,
        },
      })),

    containerModelRootRefs: {},
    setContainerModelRootRef: (id, ref) =>
      set((state) => ({
        containerModelRootRefs: {
          ...state.containerModelRootRefs,
          [id]: ref,
        },
      })),

    draggingContainerId: null,
    setDraggingContainerId: (id) => set({ draggingContainerId: id }),

    longPressPendingContainerId: null,
    setLongPressPendingContainerId: (id) => set({ longPressPendingContainerId: id }),

    dragReadyContainerId: null,
    setDragReadyContainerId: (id) => set({ dragReadyContainerId: id }),

    activeContainerGestureId: null,
    setActiveContainerGestureId: (id) => set({ activeContainerGestureId: id }),

    pointerOnSceneObject: false,
    setPointerOnSceneObject: (onObject) => set({ pointerOnSceneObject: onObject }),

    draftTransformsById: {},
    setDraftTransform: (id, transform) =>
      set((prev) => ({
        draftTransformsById: { ...prev.draftTransformsById, [id]: transform },
      })),
    clearDraftTransforms: () =>
      set({
        draftTransformsById: {},
        scaleSessionBaseById: {},
        scaleFactorById: {},
        selectionBoundsById: {},
      }),

    pendingDeleteContainerIds: [],
  markContainersForDelete: (ids) =>
      set((state) => {
        const next = new Set(state.pendingDeleteContainerIds)
        for (const id of ids) next.add(id)

        const draftTransformsById = { ...state.draftTransformsById }
        const scaleSessionBaseById = { ...state.scaleSessionBaseById }
        const scaleFactorById = { ...state.scaleFactorById }
        const selectionBoundsById = { ...state.selectionBoundsById }
        for (const id of ids) {
          delete draftTransformsById[id]
          delete scaleSessionBaseById[id]
          delete scaleFactorById[id]
          delete selectionBoundsById[id]
        }

        const removingSelection =
          state.selectedObjectId !== null && ids.includes(state.selectedObjectId)

        return {
          pendingDeleteContainerIds: [...next],
          draftTransformsById,
          scaleSessionBaseById,
          scaleFactorById,
          selectionBoundsById,
          selectedObjectId: removingSelection ? null : state.selectedObjectId,
          controlsScreenRect: removingSelection ? null : state.controlsScreenRect,
          controlsAnchorRect: removingSelection ? null : state.controlsAnchorRect,
        }
      }),
    unmarkContainerForDelete: (id) =>
      set((state) => ({
        pendingDeleteContainerIds: state.pendingDeleteContainerIds.filter((x) => x !== id),
      })),
    clearPendingDeletes: () => set({ pendingDeleteContainerIds: [] }),

    isSceneLoading: true,
    setSceneLoading: (loading) => set({ isSceneLoading: loading }),

    cameraState: null,
    saveCameraState: (position, rotation) =>
      set({ cameraState: { position, rotation } }),
    clearCameraState: () => set({ cameraState: null }),

    controlsScreenRect: null,
    setControlsScreenRect: (rect) => set({ controlsScreenRect: rect }),

    controlsAnchorRect: null,
    setControlsAnchorRect: (rect) => set({ controlsAnchorRect: rect }),

    scaleSessionBaseById: {},
    scaleFactorById: {},
    initScaleSession: (id, absoluteScale) =>
      set((state) => ({
        scaleSessionBaseById: { ...state.scaleSessionBaseById, [id]: absoluteScale },
        scaleFactorById: { ...state.scaleFactorById, [id]: 1 },
      })),
    setScaleFactor: (id, factor) =>
      set((state) => {
        const base = state.scaleSessionBaseById[id] ?? 1
        const clamped = Math.max(0.5, Math.min(2, factor))
        const draft = state.draftTransformsById[id]
        if (!draft) return state
        return {
          scaleFactorById: { ...state.scaleFactorById, [id]: clamped },
          draftTransformsById: {
            ...state.draftTransformsById,
            [id]: { ...draft, scale: base * clamped },
          },
        }
      }),
    clearScaleSessions: () => set({ scaleSessionBaseById: {}, scaleFactorById: {} }),

    selectionBoundsById: {},
    setSelectionBounds: (id, bounds) =>
      set((state) => {
        if (!bounds) {
          const next = { ...state.selectionBoundsById }
          delete next[id]
          return { selectionBoundsById: next }
        }
        return {
          selectionBoundsById: { ...state.selectionBoundsById, [id]: bounds },
        }
      }),

    resetEditSession: () =>
      set({
        draftTransformsById: {},
        scaleSessionBaseById: {},
        scaleFactorById: {},
        selectionBoundsById: {},
        pendingDeleteContainerIds: [],
        selectedObjectId: null,
        controlsScreenRect: null,
        controlsAnchorRect: null,
        draggingContainerId: null,
        longPressPendingContainerId: null,
        dragReadyContainerId: null,
        activeContainerGestureId: null,
        heightInput: 0,
        joystickInput: { x: 0, y: 0 },
        joystickTarget: 'camera',
      }),
  })),
)

export function openContainerModal(containerId: string) {
  const store = useSceneStore.getState()
  store.setSelectedContainerId(containerId)
  store.setShowItemsModal(true)
}

export function closeContainerModal() {
  const store = useSceneStore.getState()
  store.setSelectedContainerId(null)
  store.setShowItemsModal(false)
}

export function hasUnsavedEditChanges(state: Pick<SceneState, 'draftTransformsById' | 'pendingDeleteContainerIds'>) {
  return (
    Object.keys(state.draftTransformsById).length > 0 ||
    state.pendingDeleteContainerIds.length > 0
  )
}

export function isContainerPendingDelete(
  containerId: string,
  pendingDeleteContainerIds: string[],
) {
  return pendingDeleteContainerIds.includes(containerId)
}
