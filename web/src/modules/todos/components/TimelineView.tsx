import { useMemo, useState } from 'react'
import { useUpdateTodoDueDate } from '../hooks/use-todos'
import type { TodoItem } from '../types/todo-types'
import TimelineTodoItem from './TimelineTodoItem'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type DateGroup = {
  dateKey: string
  label: string
  sublabel?: string
  accentClass: string
  dotClass: string
  items: TodoItem[]
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const

function formatDateLabel(dueDate: string, today: string): Pick<DateGroup, 'label' | 'sublabel' | 'accentClass' | 'dotClass'> {
  const tomorrow = new Date(`${today}T00:00:00`)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)

  const due = new Date(`${dueDate}T00:00:00`)
  const month = due.getMonth() + 1
  const day = due.getDate()
  const weekday = WEEKDAYS[due.getDay()]
  const sublabel = `${month}月${day}日`

  if (dueDate < today) {
    return {
      label: '逾期',
      sublabel,
      accentClass: 'text-status-expired',
      dotClass: 'border-status-expired bg-status-expired',
    }
  }
  if (dueDate === today) {
    return {
      label: '今天',
      sublabel: `${month}月${day}日 ${weekday}`,
      accentClass: 'text-primary',
      dotClass: 'border-primary bg-primary',
    }
  }
  if (dueDate === tomorrowStr) {
    return {
      label: '明天',
      sublabel: `${month}月${day}日 ${weekday}`,
      accentClass: 'text-text',
      dotClass: 'border-primary/60 bg-bg-card',
    }
  }

  return {
    label: `${month}月${day}日`,
    sublabel: weekday,
    accentClass: 'text-text-secondary',
    dotClass: 'border-text-tertiary bg-bg-card',
  }
}

function groupByDueDate(todos: TodoItem[]): DateGroup[] {
  const today = new Date().toISOString().slice(0, 10)
  const map = new Map<string, TodoItem[]>()
  const noDate: TodoItem[] = []

  for (const todo of todos) {
    if (!todo.dueDate) {
      noDate.push(todo)
      continue
    }
    const list = map.get(todo.dueDate) ?? []
    list.push(todo)
    map.set(todo.dueDate, list)
  }

  const dated = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, items]) => {
      const meta = formatDateLabel(dateKey, today)
      const sorted = [...items].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1
        if (a.status !== 'completed' && b.status === 'completed') return -1
        return a.title.localeCompare(b.title, 'zh-CN')
      })
      return { dateKey, ...meta, items: sorted }
    })

  if (noDate.length > 0) {
    const sorted = [...noDate].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (a.status !== 'completed' && b.status === 'completed') return -1
      return a.title.localeCompare(b.title, 'zh-CN')
    })
    dated.push({
      dateKey: 'no-date',
      label: '无截止日期',
      accentClass: 'text-text-tertiary',
      dotClass: 'border-bg-hover bg-bg-card',
      items: sorted,
    })
  }

  return dated
}

type TimelineViewProps = {
  todos: TodoItem[]
  onToggleComplete?: (todo: TodoItem) => void
}

export default function TimelineView({ todos, onToggleComplete }: TimelineViewProps) {
  const groups = useMemo(() => groupByDueDate(todos), [todos])
  const updateDueDate = useUpdateTodoDueDate()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  function handleDrop(targetDate: string) {
    if (!draggingId || targetDate === 'no-date') return
    updateDueDate.mutate({ id: draggingId, dueDate: targetDate })
    setDraggingId(null)
  }

  if (groups.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-text-secondary">暂无待办</p>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      {groups.map((group) => (
        <Card
          key={group.dateKey}
          className={cn(
            'overflow-hidden rounded-[20px] border-border/60 shadow-card',
            group.dateKey !== 'no-date' && 'bg-[#F5F5F7]/50',
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(group.dateKey)}
        >
          <CardHeader className="flex-row items-start gap-3 space-y-0 px-4 pb-2 pt-4">
            <div
              className={cn(
                'mt-1 size-3.5 shrink-0 rounded-full border-2',
                group.dotClass,
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className={cn('text-base font-semibold leading-tight', group.accentClass)}>
                {group.label}
              </p>
              {group.sublabel ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{group.sublabel}</p>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="space-y-2 px-3 pb-3 pt-0">
            {group.items.map((todo) => (
              <div
                key={todo.id}
                draggable
                onDragStart={() => setDraggingId(todo.id)}
                onDragEnd={() => setDraggingId(null)}
                className={cn(
                  'overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-shadow',
                  draggingId === todo.id ? 'opacity-60 shadow-md' : 'hover:shadow-md',
                )}
              >
                <TimelineTodoItem
                  todo={todo}
                  onToggleComplete={onToggleComplete}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
