import { ArrowUpDown, Check, FolderKanban, Tag } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { TodoList, TodoTag } from '../types/todo-types'
import type { TodoItem } from '../types/todo-types'
import {
  listsWithTodos,
  tagsWithTodos,
  TODO_SORT_FIELD_LABELS,
  TODO_SORT_ORDER_LABELS,
} from '../lib/todo-filter'
import {
  useTodoUiStore,
  type TodoSortField,
  type TodoSortOrder,
} from '../store/todo-ui-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TodoFilterBarProps = {
  lists: TodoList[]
  tags: TodoTag[]
  todos: TodoItem[]
}

function MenuPanel({
  open,
  onClose,
  children,
  align = 'left',
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        'absolute top-full z-20 mt-1 max-h-[70vh] min-w-44 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg',
        align === 'left' ? 'left-0' : 'right-0',
      )}
    >
      {children}
    </div>
  )
}

function MenuItem({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50"
    >
      <span className="flex size-4 shrink-0 items-center justify-center rounded border border-border">
        {selected ? <Check className="size-3 text-primary" /> : null}
      </span>
      <span>{label}</span>
    </button>
  )
}

export default function TodoFilterBar({ lists, tags, todos }: TodoFilterBarProps) {
  const [listOpen, setListOpen] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const showCompleted = useTodoUiStore((s) => s.showCompleted)
  const setShowCompleted = useTodoUiStore((s) => s.setShowCompleted)
  const listFilterIds = useTodoUiStore((s) => s.listFilterIds)
  const tagFilterIds = useTodoUiStore((s) => s.tagFilterIds)
  const sortField = useTodoUiStore((s) => s.sortField)
  const sortOrder = useTodoUiStore((s) => s.sortOrder)
  const toggleListFilter = useTodoUiStore((s) => s.toggleListFilter)
  const toggleTagFilter = useTodoUiStore((s) => s.toggleTagFilter)
  const setSortField = useTodoUiStore((s) => s.setSortField)
  const setSortOrder = useTodoUiStore((s) => s.setSortOrder)

  const filterableLists = useMemo(
    () => listsWithTodos(lists, todos),
    [lists, todos],
  )
  const filterableTags = useMemo(
    () => tagsWithTodos(tags, todos),
    [tags, todos],
  )

  const sortFields = Object.keys(TODO_SORT_FIELD_LABELS) as TodoSortField[]
  const sortOrders: TodoSortOrder[] = ['asc', 'desc']

  function closeAll() {
    setListOpen(false)
    setTagOpen(false)
    setSortOpen(false)
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-border/60 pb-2">
      <Button
        type="button"
        size="sm"
        variant={showCompleted ? 'default' : 'outline'}
        className="h-7 text-xs"
        onClick={() => setShowCompleted(!showCompleted)}
      >
        已完成
      </Button>

      <div className="relative">
        <Button
          type="button"
          size="sm"
          variant={listFilterIds.length > 0 ? 'default' : 'outline'}
          className="h-7 gap-1 text-xs"
          onClick={() => {
            closeAll()
            setListOpen((v) => !v)
          }}
        >
          <FolderKanban className="size-3.5" />
          清单
        </Button>
        <MenuPanel open={listOpen} onClose={() => setListOpen(false)}>
          {filterableLists.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">无可筛清单</p>
          ) : (
            filterableLists.map((list) => (
              <MenuItem
                key={list.id}
                label={list.name}
                selected={listFilterIds.includes(list.id)}
                onClick={() => toggleListFilter(list.id)}
              />
            ))
          )}
        </MenuPanel>
      </div>

      <div className="relative">
        <Button
          type="button"
          size="sm"
          variant={tagFilterIds.length > 0 ? 'default' : 'outline'}
          className="h-7 gap-1 text-xs"
          onClick={() => {
            closeAll()
            setTagOpen((v) => !v)
          }}
        >
          <Tag className="size-3.5" />
          标签
        </Button>
        <MenuPanel open={tagOpen} onClose={() => setTagOpen(false)}>
          {filterableTags.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">无可筛标签</p>
          ) : (
            filterableTags.map((tag) => (
              <MenuItem
                key={tag.id}
                label={tag.name}
                selected={tagFilterIds.includes(tag.id)}
                onClick={() => toggleTagFilter(tag.id)}
              />
            ))
          )}
        </MenuPanel>
      </div>

      <div className="relative ml-auto">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={() => {
            closeAll()
            setSortOpen((v) => !v)
          }}
        >
          <ArrowUpDown className="size-3.5" />
          排序
        </Button>
        <MenuPanel open={sortOpen} onClose={() => setSortOpen(false)} align="right">
          <p className="px-3 py-1 text-[10px] font-medium uppercase text-muted-foreground">
            字段
          </p>
          {sortFields.map((field) => (
            <MenuItem
              key={field}
              label={TODO_SORT_FIELD_LABELS[field]}
              selected={sortField === field}
              onClick={() => setSortField(field)}
            />
          ))}
          <p className="mt-1 border-t border-border px-3 py-1 text-[10px] font-medium uppercase text-muted-foreground">
            顺序
          </p>
          {sortOrders.map((order) => (
            <MenuItem
              key={order}
              label={TODO_SORT_ORDER_LABELS[order]}
              selected={sortOrder === order}
              onClick={() => setSortOrder(order)}
            />
          ))}
        </MenuPanel>
      </div>
    </div>
  )
}
