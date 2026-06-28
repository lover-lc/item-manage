import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TodoItem } from '../types/todo-types'
import { TODO_PRIORITY_LABELS } from '../types/todo-types'

type TimelineTodoItemProps = {
  todo: TodoItem
  onToggleComplete?: (todo: TodoItem) => void
}

export default function TimelineTodoItem({
  todo,
  onToggleComplete,
}: TimelineTodoItemProps) {
  const isCompleted = todo.status === 'completed'

  return (
    <div className="flex items-start gap-3 px-3 py-3">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggleComplete?.(todo)
        }}
        aria-label={isCompleted ? '标记为未完成' : '标记为完成'}
        className={[
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          isCompleted
            ? 'border-primary bg-primary'
            : 'border-text-tertiary/80 bg-transparent hover:border-primary',
        ].join(' ')}
      >
        {isCompleted ? <Check className="size-3 text-white" strokeWidth={3} /> : null}
      </button>

      <Link to={`/todos/${todo.id}/edit`} className="min-w-0 flex-1">
        <p
          className={[
            'text-[15px] font-medium leading-snug',
            isCompleted ? 'text-text-tertiary line-through' : 'text-text',
          ].join(' ')}
        >
          {todo.title}
        </p>
        {todo.description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-tertiary">
            {todo.description}
          </p>
        ) : null}
        {todo.priority ? (
          <span className="mt-2 inline-block rounded-full bg-bg px-2 py-0.5 text-[11px] text-text-secondary">
            {TODO_PRIORITY_LABELS[todo.priority]}
          </span>
        ) : null}
      </Link>
    </div>
  )
}
