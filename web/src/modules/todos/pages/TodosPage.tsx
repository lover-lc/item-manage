import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useLocation } from 'react-router-dom'
import { useRealtimeTodos } from '../../../shared/hooks/use-realtime'
import TimelineView from '../components/TimelineView'
import TodoCard from '../components/TodoCard'
import {
  useTodoLists,
  useTodos,
  useToggleTodoComplete,
} from '../hooks/use-todos'
import type { TodoItem } from '../types/todo-types'

function TodoListGroup({
  title,
  color,
  items,
  onToggleComplete,
}: {
  title: string
  color?: string | null
  items: TodoItem[]
  onToggleComplete: (todo: TodoItem) => void
}) {
  if (items.length === 0) return null

  const active = items.filter((t) => t.status !== 'completed')
  const completed = items.filter((t) => t.status === 'completed')
  const ordered = [...active, ...completed]

  return (
    <section>
      <div className="mb-1 flex items-center gap-2 px-1">
        {color ? (
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        ) : null}
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      </div>
      <Card className="overflow-hidden py-0 shadow-card">
        <ul className="divide-y divide-border">
        {ordered.map((todo) => (
          <li key={todo.id}>
            <TodoCard todo={todo} onToggleComplete={onToggleComplete} />
          </li>
        ))}
        </ul>
      </Card>
    </section>
  )
}

export default function TodosPage() {
  const location = useLocation()
  const isTimeline = location.pathname.endsWith('/timeline')

  const filter: 'assigned' | 'created' | 'all' = location.pathname.endsWith('/assigned')
    ? 'assigned'
    : location.pathname.endsWith('/created')
      ? 'created'
      : 'all'

  const { data: todos = [], isLoading } = useTodos(
    filter === 'all' ? undefined : filter,
  )
  const { data: lists = [] } = useTodoLists()
  const toggleComplete = useToggleTodoComplete()
  const [search, setSearch] = useState('')

  useRealtimeTodos()

  const filteredTodos = useMemo(() => {
    if (!search.trim()) return todos
    const q = search.trim().toLowerCase()
    return todos.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q),
    )
  }, [todos, search])

  const grouped = useMemo(() => {
    const map = new Map<string, TodoItem[]>()
    for (const list of lists) {
      map.set(list.id, [])
    }
    for (const todo of filteredTodos) {
      const arr = map.get(todo.listId) ?? []
      arr.push(todo)
      map.set(todo.listId, arr)
    }
    return map
  }, [lists, filteredTodos])

  function handleToggle(todo: TodoItem) {
    void toggleComplete.mutateAsync({ id: todo.id, status: todo.status })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-text-secondary">
        加载中…
      </div>
    )
  }

  if (isTimeline) {
    return (
      <div className="px-4 py-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索待办…"
          className="mb-3 shadow-sm"
        />
        <TimelineView todos={filteredTodos} onToggleComplete={handleToggle} />
      </div>
    )
  }

  return (
    <div className="px-4 py-3">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索待办…"
        className="mb-3 shadow-sm"
      />

      {lists.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-secondary">
          暂无清单，请先创建清单
        </p>
      ) : (
        <div className="space-y-5">
          {lists.map((list) => {
            const items = grouped.get(list.id) ?? []
            if (items.length === 0 && filter !== 'all') return null

            return (
              <TodoListGroup
                key={list.id}
                title={list.name}
                color={list.color}
                items={items}
                onToggleComplete={handleToggle}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
