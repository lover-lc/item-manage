import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus } from 'lucide-react'
import { useState } from 'react'
import SwipeRow from '../../../shared/components/ui/SwipeRow'
import { cn } from '@/lib/utils'
import type { Area, Category, Unit } from '../lib/types'
import { SYSTEM_RESERVED_NAME } from '../lib/seed-defaults'

export type ManageEntityType = 'area' | 'category' | 'unit'
export type ManageEntity = Area | Category | Unit

const TYPE_LABELS: Record<ManageEntityType, string> = {
  area: '区域',
  category: '分类',
  unit: '计量单位',
}

function NamePromptDialog({
  title,
  message,
  defaultValue = '',
  confirmLabel,
  onCancel,
  onConfirm,
  isPending,
}: {
  title: string
  message: string
  defaultValue?: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: (name: string) => void
  isPending?: boolean
}) {
  const [name, setName] = useState(defaultValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-prompt-title"
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card bg-bg-card p-6 shadow-lg"
      >
        <h2 id="name-prompt-title" className="text-lg font-medium text-text">
          {title}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">{message}</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="mt-4 w-full rounded-button border border-bg-hover bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary/30"
        />
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
            type="submit"
            disabled={isPending || !name.trim()}
            className="rounded-button bg-primary px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? '保存中…' : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

function SortableManageRow({
  entity,
  type,
  count,
  onRename,
  onDelete,
  onToggleDisabled,
}: {
  entity: ManageEntity
  type: ManageEntityType
  count: number
  onRename?: () => void
  onDelete?: () => void
  onToggleDisabled?: () => void
}) {
  const isDisabled =
    type === 'unit' && 'isDisabled' in entity && entity.isDisabled === true
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entity.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li ref={setNodeRef} style={style} className={cn(isDragging && 'z-10')}>
      <SwipeRow
        deleteDisabled={!onDelete}
        onDelete={onDelete}
        onContentClick={onRename}
      >
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-3',
            isDragging && 'shadow-md ring-1 ring-bg-hover',
          )}
        >
          <button
            type="button"
            className="shrink-0 touch-none rounded p-1 text-text-tertiary hover:bg-bg-hover"
            aria-label="拖动排序"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-4" />
          </button>
          <span
            className={[
              'min-w-0 flex-1 truncate text-sm',
              isDisabled ? 'text-status-expired' : 'text-text',
            ].join(' ')}
          >
            {entity.name}
            {isDisabled ? (
              <span className="ml-2 text-xs font-normal text-status-expired">
                已停用
              </span>
            ) : null}
          </span>
          <span className="shrink-0 text-sm text-text-secondary">{count} 件</span>
          {type === 'unit' && onToggleDisabled ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleDisabled()
              }}
              className="shrink-0 rounded-button px-2 py-1 text-xs text-text-secondary hover:bg-bg-hover"
            >
              {isDisabled ? '启用' : '停用'}
            </button>
          ) : null}
        </div>
      </SwipeRow>
    </li>
  )
}

interface ManageListProps {
  type: ManageEntityType
  entities: ManageEntity[]
  itemCounts: Record<string, number>
  onAdd: (name: string) => Promise<void>
  onRename: (id: string, name: string) => Promise<void>
  onDeleteRequest: (entity: ManageEntity) => void
  onToggleDisabled?: (entity: ManageEntity) => void
  onReorder: (orderedIds: string[]) => void
  isLoading?: boolean
}

export default function ManageList({
  type,
  entities,
  itemCounts,
  onAdd,
  onRename,
  onDeleteRequest,
  onToggleDisabled,
  onReorder,
  isLoading = false,
}: ManageListProps) {
  const typeLabel = TYPE_LABELS[type]

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [entityToRename, setEntityToRename] = useState<ManageEntity | null>(
    null,
  )
  const [showSystemDeleteAlert, setShowSystemDeleteAlert] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function attemptDelete(entity: ManageEntity) {
    if (entity.isSystemReserved || entity.name === SYSTEM_RESERVED_NAME) {
      setShowSystemDeleteAlert(true)
      return
    }
    onDeleteRequest(entity)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = entities.findIndex((entity) => entity.id === active.id)
    const newIndex = entities.findIndex((entity) => entity.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    onReorder(arrayMove(entities.map((entity) => entity.id), oldIndex, newIndex))
  }

  async function handleAdd(name: string) {
    setIsSubmitting(true)
    try {
      await onAdd(name)
      setShowAddDialog(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRename(name: string) {
    if (!entityToRename) return
    setIsSubmitting(true)
    try {
      await onRename(entityToRename.id, name)
      setEntityToRename(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text-secondary">{typeLabel}</h2>
        <button
          type="button"
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1 rounded-button px-2 py-1.5 text-sm text-primary hover:bg-bg-hover"
        >
          <Plus className="size-4" strokeWidth={2} />
          新建
        </button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-text-secondary">加载中…</p>
      ) : entities.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">
          暂无{typeLabel}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={entities.map((entity) => entity.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="mt-3 space-y-2">
              {entities.map((entity) => {
                const count = itemCounts[entity.id] ?? 0
                const isSystem = entity.isSystemReserved

                return (
                  <SortableManageRow
                    key={entity.id}
                    entity={entity}
                    type={type}
                    count={count}
                    onRename={
                      isSystem ? undefined : () => setEntityToRename(entity)
                    }
                    onDelete={
                      isSystem ? undefined : () => attemptDelete(entity)
                    }
                    onToggleDisabled={
                      type === 'unit' && onToggleDisabled && !isSystem
                        ? () => onToggleDisabled(entity)
                        : undefined
                    }
                  />
                )
              })}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {showAddDialog ? (
        <NamePromptDialog
          title={`新建${typeLabel}`}
          message={`请输入新${typeLabel}名称`}
          confirmLabel="添加"
          onCancel={() => setShowAddDialog(false)}
          onConfirm={handleAdd}
          isPending={isSubmitting}
        />
      ) : null}

      {entityToRename ? (
        <NamePromptDialog
          title={`重命名${typeLabel}`}
          message={`请输入新的${typeLabel}名称`}
          defaultValue={entityToRename.name}
          confirmLabel="保存"
          onCancel={() => setEntityToRename(null)}
          onConfirm={handleRename}
          isPending={isSubmitting}
        />
      ) : null}

      {showSystemDeleteAlert ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="system-delete-title"
            className="w-full max-w-sm rounded-card bg-bg-card p-6 shadow-lg"
          >
            <h2
              id="system-delete-title"
              className="text-lg font-medium text-text"
            >
              无法删除
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              「{SYSTEM_RESERVED_NAME}」是系统保留{typeLabel}，无法删除。
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSystemDeleteAlert(false)}
                className="rounded-button px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export type { ManageListProps }
