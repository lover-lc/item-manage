import { create } from 'zustand'

export type SortField =
  | 'name'
  | 'createdAt'
  | 'dailyCost'
  | 'purchasePrice'
  | 'startDate'

export type SortOrder = 'asc' | 'desc'

interface UiState {
  areaFilterId: string | null
  categoryFilterId: string | null
  sortField: SortField
  sortOrder: SortOrder
  setAreaFilterId: (id: string | null) => void
  setCategoryFilterId: (id: string | null) => void
  setSortField: (field: SortField) => void
  setSortOrder: (order: SortOrder) => void
}

export const useUiStore = create<UiState>((set) => ({
  areaFilterId: null,
  categoryFilterId: null,
  sortField: 'name',
  sortOrder: 'asc',
  setAreaFilterId: (id) => set({ areaFilterId: id }),
  setCategoryFilterId: (id) => set({ categoryFilterId: id }),
  setSortField: (field) => set({ sortField: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
}))
