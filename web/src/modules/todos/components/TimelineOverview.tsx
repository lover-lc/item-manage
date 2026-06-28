import { useMemo } from 'react'
import {
  buildOverviewSegments,
  OVERVIEW_SPINE_WIDTH,
  type OverviewDateGroupSegment,
  type OverviewGapSegment,
} from '../lib/timeline-utils'
import type { TodoItem } from '../types/todo-types'
import { cn } from '@/lib/utils'

type TimelineOverviewProps = {
  todos: TodoItem[]
}

function SpineLine() {
  return (
    <div
      className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-border/70"
      aria-hidden
    />
  )
}

function OverviewTodoRow({ todo }: { todo: TodoItem }) {
  const isCompleted = todo.status === 'completed'

  return (
    <div
      className={cn(
        'flex h-8 items-center border-b border-border/50 px-3 hover:bg-muted/20',
        isCompleted && 'opacity-45',
      )}
    >
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
  )
}

function OverviewDateGroup({ group }: { group: OverviewDateGroupSegment }) {
  const { spine } = group
  const dotClass = spine.isOverdue
    ? 'bg-status-expired'
    : spine.isToday
      ? 'bg-primary'
      : 'bg-muted-foreground/55'

  return (
    <div className="flex">
      <div
        className="relative shrink-0"
        style={{ width: OVERVIEW_SPINE_WIDTH }}
      >
        <SpineLine />
        <div className="relative z-10 px-1 pb-1 pt-2 text-center">
          <p
            className={cn(
              'text-xs font-semibold leading-none tabular-nums',
              spine.accentClass,
            )}
          >
            {spine.label}
          </p>
          {spine.sublabel ? (
            <p className={cn('mt-0.5 text-[10px] leading-none', spine.accentClass)}>
              {spine.sublabel}
            </p>
          ) : null}
          <span
            className={cn('mx-auto mt-1.5 block size-2 rounded-full', dotClass)}
            aria-hidden
          />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {group.todos.map((todo) => (
          <OverviewTodoRow key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  )
}

function OverviewGapRow({ gap }: { gap: OverviewGapSegment }) {
  if (gap.kind === 'small') {
    return (
      <div className="flex" style={{ height: 16 }}>
        <div className="relative shrink-0" style={{ width: OVERVIEW_SPINE_WIDTH }}>
          <SpineLine />
        </div>
        <div className="min-w-0 flex-1" />
      </div>
    )
  }

  return (
    <div className="flex min-h-6">
      <div
        className="relative shrink-0"
        style={{ width: OVERVIEW_SPINE_WIDTH }}
      >
        <SpineLine />
        {gap.monthAnchor ? (
          <p className="relative z-10 px-0.5 pt-1 text-center text-[10px] leading-none text-muted-foreground">
            {gap.monthAnchor}
          </p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 items-center px-3 py-1">
        <p className="text-[11px] text-muted-foreground">{gap.label}</p>
      </div>
    </div>
  )
}

function NoDateSection({ items }: { items: TodoItem[] }) {
  if (items.length === 0) return null

  return (
    <section>
      <div className="border-t border-dashed border-border/80 px-3 py-2">
        <p className="text-xs text-muted-foreground">无日期</p>
      </div>
      {items.map((todo) => (
        <OverviewTodoRow key={todo.id} todo={todo} />
      ))}
    </section>
  )
}

export default function TimelineOverview({ todos }: TimelineOverviewProps) {
  const { segments, noDate } = useMemo(
    () => buildOverviewSegments(todos),
    [todos],
  )

  if (segments.length === 0 && noDate.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">暂无待办</p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      {segments.map((segment, index) => {
        if (segment.type === 'date-group') {
          return <OverviewDateGroup key={segment.spine.dateKey} group={segment} />
        }

        return (
          <OverviewGapRow
            key={`${segment.fromDate}-${segment.toDate}-${segment.kind}-${index}`}
            gap={segment}
          />
        )
      })}
      <NoDateSection items={noDate} />
    </div>
  )
}
