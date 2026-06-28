import { Plus } from 'lucide-react'
import { useState } from 'react'
import SwipeRow from '../../../shared/components/ui/SwipeRow'
import type { TodoList } from '../types/todo-types'

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
        aria-labelledby="todo-list-prompt-title"
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card bg-bg-card p-6 shadow-lg"
      >
        <h2 id="todo-list-prompt-title" className="text-lg font-medium text-text">
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

type TodoListManageProps = {
  lists: TodoList[]
  todoCounts: Record<string, number>
  onAdd: (name: string) => Promise<void>
  onRename: (id: string, name: string) => Promise<void>
  onDeleteRequest: (list: TodoList) => void
  isLoading?: boolean
}

export default function TodoListManage({
  lists,
  todoCounts,
  onAdd,
  onRename,
  onDeleteRequest,
  isLoading = false,
}: TodoListManageProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [listToRename, setListToRename] = useState<TodoList | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (!listToRename) return
    setIsSubmitting(true)
    try {
      await onRename(listToRename.id, name)
      setListToRename(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text-secondary">清单</h2>
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
      ) : lists.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">暂无清单</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {lists.map((list) => {
            const count = todoCounts[list.id] ?? 0
            return (
              <li key={list.id}>
                <SwipeRow
                  onDelete={() => onDeleteRequest(list)}
                  onContentClick={() => setListToRename(list)}
                >
                  <div className="flex items-center gap-2 px-4 py-3">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: list.color ?? '#2c3e50' }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-text">
                      {list.name}
                    </span>
                    <span className="shrink-0 text-sm text-text-secondary">
                      {count} 项
                    </span>
                  </div>
                </SwipeRow>
              </li>
            )
          })}
        </ul>
      )}

      {showAddDialog ? (
        <NamePromptDialog
          title="新建清单"
          message="请输入新清单名称"
          confirmLabel="添加"
          onCancel={() => setShowAddDialog(false)}
          onConfirm={handleAdd}
          isPending={isSubmitting}
        />
      ) : null}

      {listToRename ? (
        <NamePromptDialog
          title="重命名清单"
          message="请输入新的清单名称"
          defaultValue={listToRename.name}
          confirmLabel="保存"
          onCancel={() => setListToRename(null)}
          onConfirm={handleRename}
          isPending={isSubmitting}
        />
      ) : null}
    </>
  )
}
