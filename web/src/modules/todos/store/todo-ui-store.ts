import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReminderPreset } from '../lib/reminder-presets'

export type TodoSortField = 'dueDate' | 'createdAt' | 'title'
export type TodoSortOrder = 'asc' | 'desc'

type TodoUiState = {
  showCompleted: boolean
  listFilterIds: string[]
  tagFilterIds: string[]
  sortField: TodoSortField
  sortOrder: TodoSortOrder
  lastUsedListId: string | null
  reminderPresets: ReminderPreset[]
  setShowCompleted: (value: boolean) => void
  toggleListFilter: (id: string) => void
  toggleTagFilter: (id: string) => void
  clearListFilters: () => void
  clearTagFilters: () => void
  clearFilters: () => void
  setSortField: (field: TodoSortField) => void
  setSortOrder: (order: TodoSortOrder) => void
  setLastUsedListId: (id: string | null) => void
  addReminderPreset: (preset: ReminderPreset) => void
  updateReminderPreset: (id: string, patch: Partial<Pick<ReminderPreset, 'name' | 'kind' | 'offsetMinutes' | 'fixedTime'>>) => void
  removeReminderPreset: (id: string) => void
}

export const useTodoUiStore = create<TodoUiState>()(
  persist(
    (set, get) => ({
      showCompleted: false,
      listFilterIds: [],
      tagFilterIds: [],
      sortField: 'dueDate',
      sortOrder: 'asc',
      lastUsedListId: null,
      reminderPresets: [],
      setShowCompleted: (value) => set({ showCompleted: value }),
      toggleListFilter: (id) => {
        const current = get().listFilterIds
        set({
          listFilterIds: current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id],
        })
      },
      toggleTagFilter: (id) => {
        const current = get().tagFilterIds
        set({
          tagFilterIds: current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id],
        })
      },
      clearListFilters: () => set({ listFilterIds: [] }),
      clearTagFilters: () => set({ tagFilterIds: [] }),
      clearFilters: () => set({ listFilterIds: [], tagFilterIds: [] }),
      setSortField: (field) => set({ sortField: field }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setLastUsedListId: (id) => set({ lastUsedListId: id }),
      addReminderPreset: (preset) =>
        set({ reminderPresets: [...get().reminderPresets, preset] }),
      updateReminderPreset: (id, patch) =>
        set({
          reminderPresets: get().reminderPresets.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        }),
      removeReminderPreset: (id) =>
        set({
          reminderPresets: get().reminderPresets.filter((p) => p.id !== id),
        }),
    }),
    { name: 'todo-ui-preferences' },
  ),
)
