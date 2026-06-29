import TimelineGanttChart from './TimelineGanttChart'
import TimelineOverview from './TimelineOverview'
import type { GanttGranularity, GanttRange } from '../lib/gantt-scale'
import type { TimelineMode } from '../lib/timeline-utils'
import type { TodoItem } from '../types/todo-types'
import { cn } from '@/lib/utils'

type TimelineViewProps = {
  todos: TodoItem[]
  mode: TimelineMode
  granularity: GanttGranularity
  range: GanttRange
  onApplyRange: (range: GanttRange) => void
}

export default function TimelineView({
  todos,
  mode,
  granularity,
  range,
  onApplyRange,
}: TimelineViewProps) {
  if (todos.length === 0) {
    return (
      <p className="flex flex-1 items-center justify-center py-12 text-center text-sm text-muted-foreground">
        暂无待办
      </p>
    )
  }

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', mode === 'span' && 'h-full')}>
      {mode === 'span' ? (
        <TimelineGanttChart
          todos={todos}
          granularity={granularity}
          range={range}
          onApplyRange={onApplyRange}
        />
      ) : (
        <TimelineOverview todos={todos} granularity={granularity} />
      )}
    </div>
  )
}
