import type { TodoItem, TodoPriority } from '../types/todo-types'
import {
  formatMonthGroupLabel,
  formatWeekLabel,
  getOverviewGroupKey,
  getWeekMonday,
  type GanttGranularity,
} from './gantt-scale'

export type TimelineMode = 'due' | 'span'

export type DateSpineMeta = {
  dateKey: string
  label: string
  sublabel?: string
  accentClass: string
  isToday: boolean
  isOverdue: boolean
}

export type DueTimelineRow = {
  todo: TodoItem
  showSpine: boolean
  spine: DateSpineMeta | null
  isTodayGroup: boolean
}

export type OverviewGapSegment = {
  type: 'gap'
  kind: 'small' | 'medium' | 'large'
  fromDate: string
  toDate: string
  label: string
  monthAnchor?: string
}

export type OverviewDateGroupSegment = {
  type: 'date-group'
  spine: DateSpineMeta
  todos: TodoItem[]
}

export type OverviewSegment = OverviewDateGroupSegment | OverviewGapSegment

export const OVERVIEW_SPINE_WIDTH = 56

export type SpanBarLayout = {
  left: number
  width: number
  dueLabel: string
}

export type SpanTimelineRow = {
  todo: TodoItem
  bar: SpanBarLayout | null
}

export type TimelineWindow = {
  start: string
  end: string
}

export const GANTT_DAY_WIDTH = 40
export const GANTT_LABEL_WIDTH = 96
export const GANTT_ROW_HEIGHT = 32

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const

export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function daysBetween(start: string, end: string): number {
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const startMs = Date.UTC(sy, sm - 1, sd)
  const endMs = Date.UTC(ey, em - 1, ed)
  return Math.round((endMs - startMs) / 86400000)
}

export function effectiveStart(todo: TodoItem): string {
  return todo.startDate ?? todo.dueDate ?? todo.createdAt.slice(0, 10)
}

export function effectiveEnd(todo: TodoItem): string {
  return todo.dueDate ?? effectiveStart(todo)
}

export function normalizedSpan(todo: TodoItem): { start: string; end: string } {
  let start = effectiveStart(todo)
  let end = effectiveEnd(todo)
  if (start > end) {
    ;[start, end] = [end, start]
  }
  return { start, end }
}

export function formatDueLabel(dueDate: string): string {
  const due = new Date(`${dueDate}T00:00:00`)
  return `${due.getMonth() + 1}/${due.getDate()}`
}

export function formatSpineMeta(dueDate: string, today = getTodayIso()): DateSpineMeta {
  const tomorrow = addDays(today, 1)
  const due = new Date(`${dueDate}T00:00:00`)
  const month = due.getMonth() + 1
  const day = due.getDate()
  const weekday = WEEKDAYS[due.getDay()]
  const label = `${month}/${day}`

  if (dueDate < today) {
    return {
      dateKey: dueDate,
      label,
      sublabel: '逾期',
      accentClass: 'text-status-expired',
      isToday: false,
      isOverdue: true,
    }
  }
  if (dueDate === today) {
    return {
      dateKey: dueDate,
      label,
      sublabel: '今天',
      accentClass: 'text-primary',
      isToday: true,
      isOverdue: false,
    }
  }
  if (dueDate === tomorrow) {
    return {
      dateKey: dueDate,
      label,
      sublabel: '明天',
      accentClass: 'text-muted-foreground',
      isToday: false,
      isOverdue: false,
    }
  }

  return {
    dateKey: dueDate,
    label,
    sublabel: weekday,
    accentClass: 'text-muted-foreground',
    isToday: false,
    isOverdue: false,
  }
}

function compareTodos(a: TodoItem, b: TodoItem): number {
  const aDone = a.status === 'completed' ? 1 : 0
  const bDone = b.status === 'completed' ? 1 : 0
  if (aDone !== bDone) return aDone - bDone
  return a.title.localeCompare(b.title, 'zh-CN')
}

export function partitionTodos(todos: TodoItem[]): {
  dated: TodoItem[]
  noDate: TodoItem[]
} {
  const dated: TodoItem[] = []
  const noDate: TodoItem[] = []
  for (const todo of todos) {
    if (todo.dueDate) dated.push(todo)
    else noDate.push(todo)
  }
  dated.sort((a, b) => {
    const dueCmp = a.dueDate!.localeCompare(b.dueDate!)
    if (dueCmp !== 0) return dueCmp
    return compareTodos(a, b)
  })
  noDate.sort(compareTodos)
  return { dated, noDate }
}

function getPrimaryMonthAnchor(
  prevDate: string,
  gapStart: string,
  gapEnd: string,
): string | undefined {
  let current = gapStart
  while (current <= gapEnd) {
    if (current.slice(0, 7) !== prevDate.slice(0, 7)) {
      const month = Number(current.split('-')[1])
      return `${month} 月`
    }
    current = addDays(current, 1)
  }
  return undefined
}

export function buildGapBetween(
  prevDate: string,
  nextDate: string,
): OverviewGapSegment[] {
  const gapDays = daysBetween(prevDate, nextDate) - 1
  if (gapDays <= 0) return []

  const gapStart = addDays(prevDate, 1)
  const gapEnd = addDays(nextDate, -1)

  if (gapDays <= 3) {
    return [
      {
        type: 'gap',
        kind: 'small',
        fromDate: gapStart,
        toDate: gapEnd,
        label: '',
      },
    ]
  }

  if (gapDays <= 14) {
    const label =
      gapStart === gapEnd
        ? `${formatDueLabel(gapStart)} · 无待办`
        : `${formatDueLabel(gapStart)} — ${formatDueLabel(gapEnd)} · 无待办`
    return [
      {
        type: 'gap',
        kind: 'medium',
        fromDate: gapStart,
        toDate: gapEnd,
        label,
      },
    ]
  }

  const weeks = Math.max(1, Math.round(gapDays / 7))
  return [
    {
      type: 'gap',
      kind: 'large',
      fromDate: gapStart,
      toDate: gapEnd,
      label: `约 ${weeks} 周无安排`,
      monthAnchor: getPrimaryMonthAnchor(prevDate, gapStart, gapEnd),
    },
  ]
}

export function formatWeekSpineMeta(weekKey: string, anchorDate: string, today = getTodayIso()): DateSpineMeta {
  const monday = getWeekMonday(anchorDate)
  const sunday = addDays(monday, 6)
  const containsToday = today >= monday && today <= sunday
  const isOverdue = sunday < today

  return {
    dateKey: weekKey,
    label: formatWeekLabel(weekKey),
    sublabel: containsToday ? '本周' : `${formatDueLabel(monday)}`,
    accentClass: isOverdue
      ? 'text-status-expired'
      : containsToday
        ? 'text-primary'
        : 'text-muted-foreground',
    isToday: containsToday,
    isOverdue,
  }
}

export function formatMonthSpineMeta(monthKey: string, today = getTodayIso()): DateSpineMeta {
  const [year, month] = monthKey.split('-').map(Number)
  const monthStart = `${monthKey}-01`
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const monthEndDate = `${monthKey}-${String(lastDay).padStart(2, '0')}`
  const containsToday = today >= monthStart && today <= monthEndDate
  const isOverdue = monthEndDate < today

  return {
    dateKey: monthKey,
    label: formatMonthGroupLabel(monthKey),
    sublabel: containsToday ? '本月' : undefined,
    accentClass: isOverdue
      ? 'text-status-expired'
      : containsToday
        ? 'text-primary'
        : 'text-muted-foreground',
    isToday: containsToday,
    isOverdue,
  }
}

function buildCoarseGapBetween(
  prevDate: string,
  nextDate: string,
  granularity: GanttGranularity,
): OverviewGapSegment[] {
  const gapDays = daysBetween(prevDate, nextDate) - 1
  if (gapDays <= 0) return []

  const gapStart = addDays(prevDate, 1)
  const gapEnd = addDays(nextDate, -1)

  if (granularity === 'week') {
    const label =
      gapStart === gapEnd
        ? `${formatDueLabel(gapStart)} · 无待办`
        : `${formatDueLabel(gapStart)} — ${formatDueLabel(gapEnd)} · 无待办`
    return [
      {
        type: 'gap',
        kind: 'medium',
        fromDate: gapStart,
        toDate: gapEnd,
        label,
      },
    ]
  }

  const startMonth = Number(gapStart.split('-')[1])
  const endMonth = Number(gapEnd.split('-')[1])
  const label = `${startMonth} 月 — ${endMonth} 月 · 无待办`
  return [
    {
      type: 'gap',
      kind: 'medium',
      fromDate: gapStart,
      toDate: gapEnd,
      label,
    },
  ]
}

export function buildOverviewSegments(
  todos: TodoItem[],
  granularity: GanttGranularity = 'day',
  today = getTodayIso(),
): {
  segments: OverviewSegment[]
  noDate: TodoItem[]
} {
  const { dated, noDate } = partitionTodos(todos)
  const groups: { dateKey: string; todos: TodoItem[] }[] = []
  let current: { dateKey: string; todos: TodoItem[] } | null = null

  for (const todo of dated) {
    const dateKey = getOverviewGroupKey(todo.dueDate!, granularity)
    if (current && current.dateKey === dateKey) {
      current.todos.push(todo)
    } else {
      if (current) groups.push(current)
      current = { dateKey, todos: [todo] }
    }
  }
  if (current) groups.push(current)

  const segments: OverviewSegment[] = []
  for (let index = 0; index < groups.length; index++) {
    const group = groups[index]!
    const spine =
      granularity === 'day'
        ? formatSpineMeta(group.dateKey, today)
        : granularity === 'week'
          ? formatWeekSpineMeta(group.dateKey, group.todos[0]!.dueDate!, today)
          : formatMonthSpineMeta(group.dateKey, today)

    segments.push({
      type: 'date-group',
      spine,
      todos: group.todos,
    })

    const next = groups[index + 1]
    if (next) {
      const prevLastDue = group.todos[group.todos.length - 1]!.dueDate!
      const nextFirstDue = next.todos[0]!.dueDate!
      if (granularity === 'day') {
        segments.push(...buildGapBetween(prevLastDue, nextFirstDue))
      } else {
        segments.push(...buildCoarseGapBetween(prevLastDue, nextFirstDue, granularity))
      }
    }
  }

  return { segments, noDate }
}

export function buildDueViewRows(todos: TodoItem[], today = getTodayIso()): DueTimelineRow[] {
  const { dated } = partitionTodos(todos)
  const rows: DueTimelineRow[] = []
  let prevDate: string | null = null

  for (const todo of dated) {
    const dueDate = todo.dueDate!
    const showSpine = dueDate !== prevDate
    const spine = showSpine ? formatSpineMeta(dueDate, today) : null
    rows.push({
      todo,
      showSpine,
      spine,
      isTodayGroup: dueDate === today,
    })
    prevDate = dueDate
  }

  return rows
}

export function computeSpanWindow(datedTodos: TodoItem[], today = getTodayIso()): TimelineWindow {
  if (datedTodos.length === 0) {
    return { start: addDays(today, -7), end: addDays(today, 7) }
  }

  let minStart = effectiveStart(datedTodos[0]!)
  let maxEnd = effectiveEnd(datedTodos[0]!)

  for (const todo of datedTodos) {
    const { start, end } = normalizedSpan(todo)
    if (start < minStart) minStart = start
    if (end > maxEnd) maxEnd = end
  }

  let windowStart = addDays(minStart, -3)
  let windowEnd = addDays(maxEnd, 3)

  if (daysBetween(windowStart, windowEnd) + 1 < 14) {
    windowEnd = addDays(windowStart, 13)
  }

  if (today < windowStart) windowStart = today
  if (today > windowEnd) windowEnd = today

  return { start: windowStart, end: windowEnd }
}

export function computeBarLayout(
  todo: TodoItem,
  window: TimelineWindow,
): SpanBarLayout {
  const { start, end } = normalizedSpan(todo)
  const windowDays = daysBetween(window.start, window.end) + 1
  const offsetDays = daysBetween(window.start, start)
  const durationDays = daysBetween(start, end) + 1

  const left = (offsetDays / windowDays) * 100
  const width = Math.max((durationDays / windowDays) * 100, 2)

  return {
    left,
    width,
    dueLabel: todo.dueDate ? formatDueLabel(todo.dueDate) : formatDueLabel(end),
  }
}

export function buildWindowDates(window: TimelineWindow): string[] {
  const dates: string[] = []
  let current = window.start
  while (current <= window.end) {
    dates.push(current)
    current = addDays(current, 1)
  }
  return dates
}

export function computeBarPixels(
  todo: TodoItem,
  window: TimelineWindow,
): { left: number; width: number } {
  const { start, end } = normalizedSpan(todo)
  const dayWidth = GANTT_DAY_WIDTH

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

export function computeTodayOffset(window: TimelineWindow, today = getTodayIso()): number | null {
  if (today < window.start || today > window.end) return null
  const dayIndex = daysBetween(window.start, today)
  return dayIndex * GANTT_DAY_WIDTH + GANTT_DAY_WIDTH / 2
}

export function buildSpanViewRows(todos: TodoItem[], today = getTodayIso()): {
  dated: SpanTimelineRow[]
  noDate: TodoItem[]
  window: TimelineWindow
} {
  const { dated, noDate } = partitionTodos(todos)
  const datedSorted = [...dated].sort((a, b) => {
    const aDone = a.status === 'completed' ? 1 : 0
    const bDone = b.status === 'completed' ? 1 : 0
    if (aDone !== bDone) return aDone - bDone

    const startCmp = effectiveStart(a).localeCompare(effectiveStart(b))
    if (startCmp !== 0) return startCmp

    const dueCmp = (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
    if (dueCmp !== 0) return dueCmp

    return a.title.localeCompare(b.title, 'zh-CN')
  })

  const window = computeSpanWindow(datedSorted, today)

  return {
    dated: datedSorted.map((todo) => ({
      todo,
      bar: computeBarLayout(todo, window),
    })),
    noDate,
    window,
  }
}

export const PRIORITY_COLORS: Record<TodoPriority, string> = {
  high: '#DC2626',
  medium: '#F59E0B',
  low: '#94A3B8',
}
