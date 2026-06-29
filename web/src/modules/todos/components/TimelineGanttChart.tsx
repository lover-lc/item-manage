import { useRef } from 'react'
import type { GanttGranularity, GanttRange } from '../lib/gantt-scale'
import type { TodoItem } from '../types/todo-types'
import GanttChart, { type GanttChartHandle } from './gantt/GanttChart'
import GanttToolbar from './gantt/GanttToolbar'

type TimelineGanttChartProps = {
  todos: TodoItem[]
  granularity: GanttGranularity
  range: GanttRange
  onApplyRange: (range: GanttRange) => void
}

export default function TimelineGanttChart({
  todos,
  granularity,
  range,
  onApplyRange,
}: TimelineGanttChartProps) {
  const chartRef = useRef<GanttChartHandle>(null)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <GanttToolbar range={range} onApplyRange={onApplyRange} />
      <GanttChart
        ref={chartRef}
        todos={todos}
        granularity={granularity}
        range={range}
        onScrollToToday={() => chartRef.current?.scrollToToday()}
      />
    </div>
  )
}
