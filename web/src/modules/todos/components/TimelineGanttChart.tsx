import { useEffect, useMemo, useRef } from 'react'
import {
  buildSpanViewRows,
  buildWindowDates,
  computeBarPixels,
  computeTodayOffset,
  formatDueLabel,
  GANTT_DAY_WIDTH,
  GANTT_LABEL_WIDTH,
  GANTT_ROW_HEIGHT,
  getTodayIso,
  PRIORITY_COLORS,
} from '../lib/timeline-utils'
import type { TodoItem } from '../types/todo-types'
import { cn } from '@/lib/utils'

type TimelineGanttChartProps = {
  todos: TodoItem[]
}

function isWeekend(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return weekday === 0 || weekday === 6
}

function GanttRow({
  todo,
  bar,
  timelineWidth,
  today,
}: {
  todo: TodoItem
  bar: { left: number; width: number }
  timelineWidth: number
  today: string
}) {
  const isCompleted = todo.status === 'completed'
  const isOverdue =
    !isCompleted && todo.dueDate != null && todo.dueDate < today
  const hasSpan = Boolean(todo.startDate)

  return (
    <div
      className={cn(
        'flex border-b border-border/50 hover:bg-muted/20',
        isCompleted && 'opacity-45',
      )}
      style={{ height: GANTT_ROW_HEIGHT }}
    >
      <div
        className="sticky left-0 z-10 flex shrink-0 items-center border-r border-border/50 bg-card px-2"
        style={{ width: GANTT_LABEL_WIDTH }}
      >
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
            isCompleted ? 'text-muted-foreground line-through' : 'text-foreground',
          )}
          title={todo.title}
        >
          {todo.title}
        </p>
      </div>

      <div
        className="relative shrink-0"
        style={{ width: timelineWidth, height: GANTT_ROW_HEIGHT }}
      >
        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2',
            hasSpan ? 'rounded-sm' : 'rounded-full',
            isOverdue ? 'bg-status-expired' : 'bg-primary/75',
          )}
          style={{ left: bar.left, width: bar.width, height: hasSpan ? 10 : 8 }}
        />
      </div>
    </div>
  )
}

export default function TimelineGanttChart({ todos }: TimelineGanttChartProps) {
  const today = getTodayIso()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { dated, noDate, window } = useMemo(
    () => buildSpanViewRows(todos, today),
    [todos, today],
  )

  const dates = useMemo(() => buildWindowDates(window), [window])
  const timelineWidth = dates.length * GANTT_DAY_WIDTH
  const todayOffset = useMemo(
    () => computeTodayOffset(window, today),
    [window, today],
  )

  useEffect(() => {
    if (todayOffset == null || !scrollRef.current) return
    const target = todayOffset + GANTT_LABEL_WIDTH - scrollRef.current.clientWidth / 2
    scrollRef.current.scrollLeft = Math.max(0, target)
  }, [todayOffset, timelineWidth])

  if (dated.length === 0 && noDate.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">暂无待办</p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      {dated.length > 0 ? (
        <div ref={scrollRef} className="overflow-x-auto">
          <div style={{ minWidth: GANTT_LABEL_WIDTH + timelineWidth }}>
            <div
              className="sticky top-0 z-20 flex border-b border-border/60 bg-card"
              style={{ height: GANTT_ROW_HEIGHT }}
            >
              <div
                className="sticky left-0 z-30 shrink-0 border-r border-border/50 bg-card"
                style={{ width: GANTT_LABEL_WIDTH }}
              />
              <div className="relative flex shrink-0" style={{ width: timelineWidth }}>
                {dates.map((date) => {
                  const isToday = date === today
                  return (
                    <div
                      key={date}
                      className={cn(
                        'flex shrink-0 flex-col items-center justify-center border-r border-border/30 text-[10px] tabular-nums',
                        isWeekend(date) && 'bg-muted/20',
                        isToday ? 'font-semibold text-primary' : 'text-muted-foreground',
                      )}
                      style={{ width: GANTT_DAY_WIDTH, height: GANTT_ROW_HEIGHT }}
                    >
                      <span>{formatDueLabel(date)}</span>
                      {isToday ? (
                        <span className="text-[9px] leading-none">今天</span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative">
              {todayOffset != null ? (
                <span
                  className="pointer-events-none absolute bottom-0 top-0 z-[5] w-px bg-primary/40"
                  style={{ left: GANTT_LABEL_WIDTH + todayOffset }}
                  aria-hidden
                />
              ) : null}
              {dated.map(({ todo }) => (
                <GanttRow
                  key={todo.id}
                  todo={todo}
                  bar={computeBarPixels(todo, window)}
                  timelineWidth={timelineWidth}
                  today={today}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {noDate.length > 0 ? (
        <section>
          <div className="border-t border-dashed border-border/80 px-3 py-2">
            <p className="text-xs text-muted-foreground">无日期</p>
          </div>
          {noDate.map((todo) => {
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
      ) : null}
    </div>
  )
}
