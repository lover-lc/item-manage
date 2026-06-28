import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TodoItem } from '../types/todo-types'
import { TODO_PRIORITY_LABELS } from '../types/todo-types'

type TodoCardProps = {
  todo: TodoItem
  onToggleComplete?: (todo: TodoItem) => void
}

function formatDueLabel(dueDate: string, isOverdue: boolean): string {
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  if (dueDate === today) return '今天'
  if (dueDate === tomorrow) return '明天'
  if (isOverdue) return dueDate.slice(5).replace('-', '/')
  return dueDate.slice(5).replace('-', '/')
}

export default function TodoCard({ todo, onToggleComplete }: TodoCardProps) {
  const isCompleted = todo.status === 'completed'
  const isOverdue =
    !isCompleted &&
    todo.dueDate != null &&
    todo.dueDate < new Date().toISOString().slice(0, 10)

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggleComplete?.(todo)
        }}
        aria-label={isCompleted ? '标记为未完成' : '标记为完成'}
        className={[
          'flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          isCompleted
            ? 'border-primary bg-primary'
            : 'border-text-tertiary bg-transparent hover:border-primary',
        ].join(' ')}
      >
        {isCompleted ? <Check className="size-3.5 text-white" strokeWidth={3} /> : null}
      </button>

      <Link to={`/todos/${todo.id}/edit`} className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={[
                'truncate text-[17px] leading-snug',
                isCompleted ? 'text-text-tertiary line-through' : 'text-text',
              ].join(' ')}
            >
              {todo.title}
            </p>
            {todo.description ? (
              <p className="mt-0.5 truncate text-sm text-text-tertiary">
                {todo.description}
              </p>
            ) : null}
            {todo.priority ? (
              <p className="mt-0.5 text-xs text-text-tertiary">
                {TODO_PRIORITY_LABELS[todo.priority]}优先级
              </p>
            ) : null}
          </div>
          {todo.dueDate ? (
            <span
              className={[
                'shrink-0 text-[15px]',
                isOverdue ? 'text-status-expired' : 'text-text-tertiary',
              ].join(' ')}
            >
              {formatDueLabel(todo.dueDate, isOverdue)}
            </span>
          ) : null}
        </div>
      </Link>
    </div>
  )
}
