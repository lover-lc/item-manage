import { useMemo } from 'react'
import {
  buildSpanViewRows,
  buildWindowDates,
  daysBetween,
  formatDueLabel,
  getTodayIso,
  PRIORITY_COLORS,
  type TimelineWindow,
} from '../../lib/timeline-utils'
import type { TodoItem } from '../../types/todo-types'
import { cn } from '@/lib/utils'
import TodoRelationBadge from '../TodoRelationBadge'

export const GANTT_LABEL_WIDTH = 96
export const GANTT_DAY_WIDTH_COMPACT = 28
export const GANTT_DAY_WIDTH_STANDARD = 40
export const GANTT_DAY_WIDTH_LOOSE = 56
export const GANTT_ROW_HEIGHT = 32
export const GANTT_BAR_HEIGHT = 14

export function useGanttData(todos: TodoItem[]) {
  const today = getTodayIso()
  return useMemo(() => buildSpanViewRows(todos, today), [todos, today])
}

export function isWeekend(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return weekday === 0 || weekday === 6
}

export function computeBarPixelsAtWidth(
  todo: TodoItem,
  window: TimelineWindow,
  dayWidth: number,
): { left: number; width: number } {
  const start = todo.startDate ?? todo.dueDate ?? todo.createdAt.slice(0, 10)
  const end = todo.dueDate ?? start

  if (!todo.startDate) {
    const dayIndex = daysBetween(window.start, end)
    return {
      left: dayIndex * dayWidth + (dayWidth - 8) / 2,
      width: 8,
    }
  }

  const offsetDays = daysBetween(window.start, start)
  const durationDays = daysBetween(start, end) + 1
  return {
    left: offsetDays * dayWidth + 2,
    width: Math.max(durationDays * dayWidth - 4, 6),
  }
}

export function computeTodayOffsetAtWidth(
  window: TimelineWindow,
  today: string,
  dayWidth: number,
): number | null {
  if (today < window.start || today > window.end) return null
  const dayIndex = daysBetween(window.start, today)
  return dayIndex * dayWidth + dayWidth / 2
}

export function getBarColor(
  todo: TodoItem,
  today: string,
  semantic = false,
): string {
  const isCompleted = todo.status === 'completed'
  const isPendingReview = todo.status === 'pending_review'
  const isOverdue =
    !isCompleted && !isPendingReview && todo.dueDate != null && todo.dueDate < today
  const isDueToday = !isCompleted && !isPendingReview && todo.dueDate === today

  if (semantic) {
    if (isCompleted) return 'bg-muted-foreground/35'
    if (isPendingReview) return 'bg-purple-500/80'
    if (isOverdue) return 'bg-status-expired'
    if (isDueToday) return 'bg-primary'
    return 'bg-primary/60'
  }

  if (isPendingReview) return 'bg-purple-500/75'
  if (isOverdue) return 'bg-status-expired'
  return 'bg-primary/75'
}

export function GanttTodoTitle({ todo }: { todo: TodoItem }) {
  const isCompleted = todo.status === 'completed'
  const isPendingReview = todo.status === 'pending_review'

  return (
    <div className="flex min-w-0 flex-1 items-center">
      {todo.priority ? (
        <span
          className="mr-1.5 h-3 w-0.5 shrink-0 rounded-full"
          style={{ backgroundColor: PRIORITY_COLORS[todo.priority] }}
          aria-hidden
        />
      ) : null}
      <p
        className={cn(
          'min-w-0 truncate text-sm',
          isCompleted
            ? 'text-muted-foreground line-through'
            : isPendingReview
              ? 'text-purple-700 dark:text-purple-300'
              : 'text-foreground',
        )}
        title={todo.title}
      >
        {todo.title}
      </p>
      <TodoRelationBadge todo={todo} compact className="ml-1 shrink-0" />
    </div>
  )
}

export function GanttLabelCell({ todo }: { todo: TodoItem }) {
  return (
    <div
      className="sticky left-0 z-10 flex shrink-0 items-center border-r border-border/50 bg-card px-2"
      style={{ width: GANTT_LABEL_WIDTH }}
    >
      <GanttTodoTitle todo={todo} />
    </div>
  )
}

export function GanttNoDateSection({ items }: { items: TodoItem[] }) {
  if (items.length === 0) return null

  return (
    <section>
      <div className="border-t border-dashed border-border/80 px-3 py-2">
        <p className="text-xs text-muted-foreground">无日期</p>
      </div>
      {items.map((todo) => {
        const isCompleted = todo.status === 'completed'
        return (
          <div
            key={todo.id}
            className={cn(
              'flex h-8 items-center border-b border-border/50 px-3',
              isCompleted && 'opacity-45',
            )}
          >
            <p
              className={cn(
                'min-w-0 truncate text-sm',
                isCompleted
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground',
              )}
            >
              {todo.title}
            </p>
          </div>
        )
      })}
    </section>
  )
}

export function GanttEmptyState() {
  return (
    <p className="py-12 text-center text-sm text-muted-foreground">暂无待办</p>
  )
}

export function useWindowDates(window: TimelineWindow) {
  return useMemo(() => buildWindowDates(window), [window])
}

export function formatMonthLabel(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number)
  return `${year}年${month}月`
}

export function getIsoWeekKey(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  )
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export function formatWeekLabel(weekKey: string): string {
  const [year, week] = weekKey.split('-W')
  return `${year} 第 ${Number(week)} 周`
}

export function countTasksPerDay(
  dated: { todo: TodoItem }[],
  dates: string[],
): number[] {
  const counts = new Map<string, number>()
  for (const date of dates) counts.set(date, 0)
  for (const { todo } of dated) {
    const key = todo.dueDate
    if (key && counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return dates.map((d) => counts.get(d) ?? 0)
}

export { formatDueLabel, getTodayIso, buildWindowDates }
