import TimelineGanttChart from './TimelineGanttChart'
import TimelineOverview from './TimelineOverview'
import type { TimelineMode } from '../lib/timeline-utils'
import type { TodoItem } from '../types/todo-types'

type TimelineViewProps = {
  todos: TodoItem[]
  mode: TimelineMode
}

export default function TimelineView({ todos, mode }: TimelineViewProps) {
  if (todos.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">暂无待办</p>
    )
  }

  if (mode === 'span') {
    return <TimelineGanttChart todos={todos} />
  }

  return <TimelineOverview todos={todos} />
}
