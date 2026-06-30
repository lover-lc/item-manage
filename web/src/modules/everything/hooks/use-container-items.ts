import { useItems } from '../../items/hooks/use-items'
import type { Item } from '../../items/lib/types'

export function useContainerItems(containerId: string | null) {
  const { data: allItems, isLoading, error } = useItems()

  const items: Item[] = containerId
    ? (allItems ?? []).filter((item) => item.containerId === containerId)
    : []

  return {
    items,
    isLoading,
    error,
    isEmpty: items.length === 0,
  }
}
