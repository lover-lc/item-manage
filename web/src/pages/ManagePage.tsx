import { useQueryClient } from '@tanstack/react-query'
import { HelpCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import DeleteConfirmSheet, {
  type DeleteAction,
  type ManageEntity,
  type ManageEntityType,
} from '../components/DeleteConfirmSheet'
import ManageList from '../components/ManageList'
import {
  useAreas,
  useCreateArea,
  useDeleteArea,
  useUpdateArea,
} from '../hooks/use-areas'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../hooks/use-categories'
import { useAuth } from '../hooks/use-auth'
import {
  useBatchDeleteItems,
  useBatchUpdateItemsArea,
  useBatchUpdateItemsCategory,
  useItems,
} from '../hooks/use-items'
import {
  exportBackup,
  importBackup,
  parseBackupJson,
  validateBackupData,
} from '../lib/backup'
import { SYSTEM_RESERVED_NAME } from '../lib/seed-defaults'
import { supabase } from '../lib/supabase'
import type { Item } from '../lib/types'

type ManageMode = 'area' | 'category'

function EmptyDeleteDialog({
  entityName,
  typeLabel,
  onCancel,
  onConfirm,
  isPending,
}: {
  entityName: string
  typeLabel: string
  onCancel: () => void
  onConfirm: () => void
  isPending?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="empty-delete-title"
        className="w-full max-w-sm rounded-card bg-bg-card p-6 shadow-lg"
      >
        <h2 id="empty-delete-title" className="text-lg font-medium text-text">
          删除{typeLabel}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          确定要删除「{entityName}」吗？此操作无法撤销。
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

function countItemsByField(
  items: Item[],
  field: 'areaId' | 'categoryId',
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const item of items) {
    const id = item[field]
    counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}

function findUncategorized(entities: ManageEntity[]): ManageEntity | undefined {
  return entities.find(
    (e) => e.isSystemReserved && e.name === SYSTEM_RESERVED_NAME,
  )
}

export default function ManagePage() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id
  const importInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<ManageMode>('area')
  const [entityToDelete, setEntityToDelete] = useState<ManageEntity | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const { data: areas = [], isLoading: areasLoading } = useAreas()
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories()
  const { data: items = [] } = useItems()

  const createArea = useCreateArea()
  const updateArea = useUpdateArea()
  const deleteArea = useDeleteArea()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const batchUpdateItemsArea = useBatchUpdateItemsArea()
  const batchUpdateItemsCategory = useBatchUpdateItemsCategory()
  const batchDeleteItems = useBatchDeleteItems()

  const areaCounts = useMemo(
    () => countItemsByField(items, 'areaId'),
    [items],
  )
  const categoryCounts = useMemo(
    () => countItemsByField(items, 'categoryId'),
    [items],
  )

  const deleteItemCount = entityToDelete
    ? mode === 'area'
      ? (areaCounts[entityToDelete.id] ?? 0)
      : (categoryCounts[entityToDelete.id] ?? 0)
    : 0

  const deleteTargets = useMemo(() => {
    if (!entityToDelete) return []
    const list = mode === 'area' ? areas : categories
    return list.filter(
      (e) => !e.isSystemReserved && e.id !== entityToDelete.id,
    )
  }, [entityToDelete, mode, areas, categories])

  const uncategorized = useMemo(() => {
    const list = mode === 'area' ? areas : categories
    return findUncategorized(list)
  }, [mode, areas, categories])

  useEffect(() => {
    setEntityToDelete(null)
  }, [mode])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(timer)
  }, [toast])

  function handleDeleteRequest(entity: ManageEntity) {
    setEntityToDelete(entity)
  }

  async function deleteEntityOnly(id: string) {
    if (mode === 'area') {
      await deleteArea.mutateAsync(id)
    } else {
      await deleteCategory.mutateAsync(id)
    }
  }

  async function handleEmptyDelete() {
    if (!entityToDelete) return
    setIsDeleting(true)
    try {
      await deleteEntityOnly(entityToDelete.id)
      setEntityToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleDeleteWithItems(
    action: DeleteAction,
    targetId?: string,
  ) {
    if (!entityToDelete) return

    const itemIds =
      mode === 'area'
        ? items.filter((i) => i.areaId === entityToDelete.id).map((i) => i.id)
        : items
            .filter((i) => i.categoryId === entityToDelete.id)
            .map((i) => i.id)

    setIsDeleting(true)
    try {
      switch (action) {
        case 'moveToOther':
          if (!targetId) return
          if (mode === 'area') {
            await batchUpdateItemsArea.mutateAsync({
              itemIds,
              areaId: targetId,
            })
          } else {
            await batchUpdateItemsCategory.mutateAsync({
              itemIds,
              categoryId: targetId,
            })
          }
          break
        case 'deleteAllItems':
          await batchDeleteItems.mutateAsync(itemIds)
          break
        case 'moveToUncategorized':
          if (!uncategorized) return
          if (mode === 'area') {
            await batchUpdateItemsArea.mutateAsync({
              itemIds,
              areaId: uncategorized.id,
            })
          } else {
            await batchUpdateItemsCategory.mutateAsync({
              itemIds,
              categoryId: uncategorized.id,
            })
          }
          break
      }

      await deleteEntityOnly(entityToDelete.id)
      setEntityToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  function showHelp() {
    window.alert('引导页即将推出')
  }

  async function handleExport() {
    if (!supabase || !userId) {
      window.alert('未登录或未配置 Supabase')
      return
    }

    setIsExporting(true)
    try {
      await exportBackup(supabase, userId)
      setToast('导出成功')
    } catch (err) {
      window.alert(String((err as Error)?.message || '导出失败'))
    } finally {
      setIsExporting(false)
    }
  }

  function handleImportClick() {
    importInputRef.current?.click()
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !supabase || !userId) return

    const confirmed = window.confirm('导入将覆盖云端所有数据，是否继续？')
    if (!confirmed) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const parsed = parseBackupJson(text)
      const validation = validateBackupData(parsed)
      if (!validation.ok) {
        throw new Error('备份文件格式无效')
      }

      await importBackup(supabase, userId, validation.data)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['areas'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['items'] }),
      ])
      setToast('导入成功')
    } catch (err) {
      window.alert(String((err as Error)?.message || '导入失败'))
    } finally {
      setIsImporting(false)
    }
  }

  const typeLabel = mode === 'area' ? '区域' : '分类'

  return (
    <>
      <header className="border-b border-bg-hover bg-bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={showHelp}
            aria-label="帮助"
            className="flex size-9 shrink-0 items-center justify-center rounded-button text-text-secondary hover:bg-bg-hover"
          >
            <HelpCircle className="size-5" strokeWidth={1.75} />
          </button>
          <h1 className="flex-1 text-center text-lg font-medium text-text">
            管理
          </h1>
          <div className="size-9 shrink-0" aria-hidden="true" />
        </div>
      </header>

      <div className="px-4 py-4">
        <div
          role="tablist"
          aria-label="管理类型"
          className="flex rounded-button bg-bg-hover p-1"
        >
          {(['area', 'category'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => setMode(tab)}
              className={[
                'flex-1 rounded-button py-2 text-sm font-medium transition-colors',
                mode === tab
                  ? 'bg-bg-card text-text shadow-sm'
                  : 'text-text-secondary hover:text-text',
              ].join(' ')}
            >
              {tab === 'area' ? '区域' : '分类'}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {mode === 'area' ? (
            <ManageList
              type="area"
              entities={areas}
              itemCounts={areaCounts}
              onAdd={async (name) => {
                await createArea.mutateAsync({ name })
              }}
              onRename={async (id, name) => {
                await updateArea.mutateAsync({ id, name })
              }}
              onDeleteRequest={handleDeleteRequest}
              isLoading={areasLoading}
            />
          ) : (
            <ManageList
              type="category"
              entities={categories}
              itemCounts={categoryCounts}
              onAdd={async (name) => {
                await createCategory.mutateAsync({ name })
              }}
              onRename={async (id, name) => {
                await updateCategory.mutateAsync({ id, name })
              }}
              onDeleteRequest={handleDeleteRequest}
              isLoading={categoriesLoading}
            />
          )}
        </div>

        <section className="mt-8 border-t border-bg-hover pt-6">
          <h2 className="text-sm font-medium text-text-secondary">数据备份</h2>
          <p className="mt-1 text-xs text-text-tertiary">
            导出 JSON 备份，或从备份文件全量恢复数据
          </p>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || isImporting || !userId}
              className="flex-1 rounded-button border border-bg-hover px-4 py-2.5 text-sm text-text hover:bg-bg-hover disabled:opacity-50"
            >
              {isExporting ? '导出中…' : '导出数据'}
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              disabled={isExporting || isImporting || !userId}
              className="flex-1 rounded-button border border-bg-hover px-4 py-2.5 text-sm text-text hover:bg-bg-hover disabled:opacity-50"
            >
              {isImporting ? '导入中…' : '导入数据'}
            </button>
          </div>
        </section>
      </div>

      {entityToDelete && deleteItemCount === 0 ? (
        <EmptyDeleteDialog
          entityName={entityToDelete.name}
          typeLabel={typeLabel}
          onCancel={() => setEntityToDelete(null)}
          onConfirm={handleEmptyDelete}
          isPending={isDeleting}
        />
      ) : null}

      {entityToDelete && deleteItemCount > 0 ? (
        <DeleteConfirmSheet
          open
          onClose={() => setEntityToDelete(null)}
          type={mode as ManageEntityType}
          entity={entityToDelete}
          itemCount={deleteItemCount}
          targets={deleteTargets}
          onConfirm={handleDeleteWithItems}
          isPending={isDeleting}
        />
      ) : null}

      {toast ? (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-button bg-text px-4 py-2 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </>
  )
}
