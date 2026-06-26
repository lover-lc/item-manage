import { Package, Plus, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import FilterSortMenu from '../components/FilterSortMenu'
import ItemCard from '../components/ItemCard'
import { useAreas } from '../hooks/use-areas'
import { useCategories } from '../hooks/use-categories'
import { useDeleteItem, useItems } from '../hooks/use-items'
import {
  computeItemDailyCost,
  displayedAreas,
  filterItems,
  itemsForArea,
  sortItems,
} from '../lib/sort-filter'
import type { Item } from '../lib/types'
import { useUiStore } from '../store/ui-store'

function DeleteConfirmDialog({
  item,
  onCancel,
  onConfirm,
  isPending,
}: {
  item: Item
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="w-full max-w-sm rounded-card bg-bg-card p-6 shadow-lg"
      >
        <h2 id="delete-dialog-title" className="text-lg font-medium text-text">
          删除物品
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          确定要删除「{item.name}」吗？此操作无法撤销。
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-button px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-button bg-status-expired px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? '删除中…' : '删除'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ItemRow({
  item,
  dailyCost,
  onDelete,
}: {
  item: Item
  dailyCost: number
  onDelete: (item: Item) => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [offsetX, setOffsetX] = useState(0)
  const touchStartX = useRef(0)
  const swiped = useRef(false)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    swiped.current = false
  }

  function handleTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientX - touchStartX.current
    if (delta < -10) swiped.current = true
    setOffsetX(Math.max(Math.min(delta, 0), -72))
  }

  function handleTouchEnd() {
    setOffsetX(offsetX < -36 ? -72 : 0)
  }

  return (
    <div ref={rowRef} className="relative overflow-hidden rounded-card">
      <div className="absolute inset-y-0 right-0 flex w-[72px] items-center justify-center bg-status-expired">
        <button
          type="button"
          aria-label="删除"
          onClick={() => onDelete(item)}
          className="p-3 text-white"
        >
          <Trash2 className="size-5" />
        </button>
      </div>
      <div
        className="relative bg-bg-card transition-transform duration-150"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center hover:bg-bg-hover">
          <Link
            to={`/items/${item.id}`}
            className="min-w-0 flex-1 px-4 py-3"
            onClick={(e) => {
              if (swiped.current) e.preventDefault()
            }}
          >
            <ItemCard item={item} dailyCost={dailyCost} />
          </Link>
          <button
            type="button"
            aria-label="删除"
            onClick={() => onDelete(item)}
            className="shrink-0 px-3 py-3 text-text-tertiary hover:text-status-expired"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ItemsPage() {
  const { data: areas = [], isLoading: areasLoading } = useAreas()
  const { data: categories = [] } = useCategories()
  const { data: allItems = [], isLoading: itemsLoading } = useItems()
  const deleteItem = useDeleteItem()

  const areaFilterId = useUiStore((s) => s.areaFilterId)
  const categoryFilterId = useUiStore((s) => s.categoryFilterId)
  const sortField = useUiStore((s) => s.sortField)
  const sortOrder = useUiStore((s) => s.sortOrder)

  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)

  const hasActiveFilter = areaFilterId !== null || categoryFilterId !== null

  const filteredItems = useMemo(
    () => filterItems(allItems, areaFilterId, categoryFilterId),
    [allItems, areaFilterId, categoryFilterId],
  )

  const sections = useMemo(() => {
    return displayedAreas(areas, areaFilterId).map((area) => ({
      area,
      items: sortItems(itemsForArea(filteredItems, area.id), sortField, sortOrder),
    }))
  }, [areas, areaFilterId, filteredItems, sortField, sortOrder])

  const hasMatchingItems = filteredItems.length > 0
  const isLoading = areasLoading || itemsLoading

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    await deleteItem.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <>
      <header className="border-b border-bg-hover bg-bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <FilterSortMenu areas={areas} categories={categories} />
          <h1 className="flex-1 text-center text-lg font-medium text-text">物品</h1>
          <Link
            to="/items/new"
            aria-label="添加物品"
            className="rounded-button p-2 text-primary hover:bg-bg-hover"
          >
            <Plus className="size-5" strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      <div className="px-4 py-4">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-text-secondary">加载中…</p>
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Package className="size-12 text-text-tertiary" strokeWidth={1.25} />
            <p className="mt-4 font-medium text-text">暂无物品</p>
            <p className="mt-1 text-sm text-text-secondary">点击 + 添加第一个物品</p>
          </div>
        ) : hasActiveFilter && !hasMatchingItems ? (
          <div className="flex flex-col items-center py-16 text-center">
            <SlidersHorizontal className="size-12 text-text-tertiary" strokeWidth={1.25} />
            <p className="mt-4 font-medium text-text">暂无物品</p>
            <p className="mt-1 text-sm text-text-secondary">当前筛选条件下没有物品</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map(({ area, items }) => (
              <section key={area.id}>
                <h2 className="mb-2 px-1 text-sm font-medium text-text-secondary">
                  {area.name} ({items.length})
                </h2>
                {items.length === 0 ? (
                  <p className="rounded-card bg-bg-card px-4 py-6 text-center text-sm text-text-tertiary">
                    暂无物品
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="group">
                        <ItemRow
                          item={item}
                          dailyCost={computeItemDailyCost(item)}
                          onDelete={setDeleteTarget}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      {deleteTarget ? (
        <DeleteConfirmDialog
          item={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          isPending={deleteItem.isPending}
        />
      ) : null}
    </>
  )
}
