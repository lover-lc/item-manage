import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import {
  buildColumns,
  buildDisplayRange,
  computeBarLayout,
  computeTodayColumnOffset,
  filterTodosByRangeFilter,
  formatColumnHeader,
  isTodayInDisplayRange,
  isValidGanttRange,
  parseRangeFilter,
  spansIntersectRange,
  sumTimelineWidth,
  type GanttGranularity,
  type GanttRange,
} from '../../lib/gantt-scale'
import {
  effectiveStart,
  getTodayIso,
  normalizedSpan,
  partitionTodos,
} from '../../lib/timeline-utils'
import type { TodoItem } from '../../types/todo-types'
import {
  GANTT_BAR_HEIGHT,
  GANTT_LABEL_WIDTH,
  GANTT_ROW_HEIGHT,
  GanttEmptyState,
  GanttLabelCell,
  GanttNoDateSection,
  getBarColor,
  isWeekend,
} from './gantt-shared'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type GanttChartHandle = {
  scrollToToday: () => void
}

type GanttChartProps = {
  todos: TodoItem[]
  granularity: GanttGranularity
  range: GanttRange
  onScrollToToday?: () => void
}

function scrollToTodayColumn(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  todayOffset: number | null,
  labelWidth: number,
) {
  if (todayOffset == null || !scrollRef.current) return
  const target = todayOffset + labelWidth - scrollRef.current.clientWidth / 2
  scrollRef.current.scrollLeft = Math.max(0, target)
}

const GanttChart = forwardRef<GanttChartHandle, GanttChartProps>(function GanttChart(
  { todos, granularity, range, onScrollToToday },
  ref,
) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = getTodayIso()

  const rangeFilter = useMemo(() => parseRangeFilter(range), [range])
  const displayRange = useMemo(
    () => buildDisplayRange(rangeFilter, granularity, today),
    [rangeFilter, granularity, today],
  )
  const todayVisible = isTodayInDisplayRange(displayRange, today)

  const { visibleTodos, noDate } = useMemo(() => {
    const { dated, noDate: undated } = partitionTodos(todos)
    const filtered = filterTodosByRangeFilter(dated, rangeFilter)
    const inView = isValidGanttRange(displayRange)
      ? filtered.filter((todo) => todoIntersectsDisplay(todo, displayRange))
      : filtered
    const sorted = [...inView].sort((a, b) => {
      const aDone = a.status === 'completed' ? 1 : 0
      const bDone = b.status === 'completed' ? 1 : 0
      if (aDone !== bDone) return aDone - bDone
      const startCmp = effectiveStart(a).localeCompare(effectiveStart(b))
      if (startCmp !== 0) return startCmp
      const dueCmp = (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
      if (dueCmp !== 0) return dueCmp
      return a.title.localeCompare(b.title, 'zh-CN')
    })
    return { visibleTodos: sorted, noDate: undated }
  }, [todos, rangeFilter, displayRange])

  const columns = useMemo(
    () => buildColumns(granularity, displayRange),
    [granularity, displayRange],
  )

  const timelineWidth = sumTimelineWidth(columns)
  const columnOffsets = useMemo(() => {
    let offset = 0
    return columns.map((column) => {
      offset += column.widthPx
      return offset
    })
  }, [columns])
  const todayOffset = computeTodayColumnOffset(columns, today, displayRange)

  useImperativeHandle(ref, () => ({
    scrollToToday: () => scrollToTodayColumn(scrollRef, todayOffset, GANTT_LABEL_WIDTH),
  }))

  useEffect(() => {
    scrollToTodayColumn(scrollRef, todayOffset, GANTT_LABEL_WIDTH)
  }, [todayOffset, timelineWidth, granularity, displayRange.start, displayRange.end])

  if (columns.length === 0 && noDate.length === 0) {
    return <GanttEmptyState />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <div style={{ minWidth: GANTT_LABEL_WIDTH + timelineWidth }}>
          <div
            className="sticky top-0 z-20 flex border-b border-border/60 bg-card"
            style={{ height: GANTT_ROW_HEIGHT }}
          >
            <div
              className="sticky left-0 z-30 flex shrink-0 items-center justify-center border-r border-border/50 bg-card px-1"
              style={{ width: GANTT_LABEL_WIDTH }}
            >
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn('h-7 px-2 text-xs', !todayVisible && 'opacity-40')}
                disabled={!todayVisible}
                onClick={() => onScrollToToday?.()}
              >
                今天
              </Button>
            </div>
            <div className="relative flex shrink-0" style={{ width: timelineWidth }}>
              {columns.map((column) => {
                const header = formatColumnHeader(column, granularity, today)
                return (
                  <div
                    key={column.key}
                    className={cn(
                      'flex shrink-0 flex-col items-center justify-center border-r border-border/30 px-0.5 text-[10px] tabular-nums',
                      granularity === 'day' &&
                        isWeekend(column.start) &&
                        'bg-muted/20',
                      header.isToday
                        ? 'font-semibold text-primary'
                        : 'text-muted-foreground',
                    )}
                    style={{ width: column.widthPx, height: GANTT_ROW_HEIGHT }}
                  >
                    <span className="truncate">{header.label}</span>
                    {header.sublabel ? (
                      <span className="truncate text-[9px] leading-none">
                        {header.sublabel}
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative">
            {todayOffset != null ? (
              <span
                className="pointer-events-none absolute bottom-0 top-0 z-[1] w-px bg-primary/40"
                style={{ left: GANTT_LABEL_WIDTH + todayOffset }}
                aria-hidden
              />
            ) : null}
            {columns.map((column, colIndex) => (
              <span
                key={`grid-${column.key}`}
                className="pointer-events-none absolute bottom-0 top-0 z-[1] border-r border-border/20"
                style={{
                  left: GANTT_LABEL_WIDTH + columnOffsets[colIndex]!,
                }}
                aria-hidden
              />
            ))}

            {visibleTodos.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                此范围内无待办
              </p>
            ) : (
              visibleTodos.map((todo, rowIndex) => {
                const bar = computeBarLayout(todo, columns, displayRange, rangeFilter)
                const isCompleted = todo.status === 'completed'
                return (
                  <div
                    key={todo.id}
                    className={cn(
                      'relative flex border-b border-border/50 hover:bg-muted/20',
                      rowIndex % 2 === 1 && 'bg-muted/10',
                      isCompleted && 'opacity-45',
                    )}
                    style={{ height: GANTT_ROW_HEIGHT }}
                  >
                    <GanttLabelCell todo={todo} />
                    <div
                      className="relative shrink-0"
                      style={{ width: timelineWidth, height: GANTT_ROW_HEIGHT }}
                    >
                      <span
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2',
                          bar.isDot ? 'rounded-full' : 'rounded-sm',
                          getBarColor(todo, today),
                          bar.clipStart && 'border-l border-dashed border-foreground/40 opacity-70',
                          bar.clipEnd && 'border-r border-dashed border-foreground/40 opacity-70',
                        )}
                        style={{
                          left: bar.leftPx,
                          width: bar.widthPx,
                          height: bar.isDot ? 8 : GANTT_BAR_HEIGHT,
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
      <GanttNoDateSection items={noDate} />
    </div>
  )
})

export default GanttChart

function todoIntersectsDisplay(todo: TodoItem, displayRange: GanttRange): boolean {
  if (!todo.dueDate || !isValidGanttRange(displayRange)) return false
  const { start, end } = normalizedSpan(todo)
  return spansIntersectRange(start, end, displayRange)
}
