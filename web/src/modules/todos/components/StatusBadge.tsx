import type { TodoStatus } from '../types/todo-types'
import { TODO_STATUS_LABELS } from '../types/todo-types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_VARIANTS: Record<TodoStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_accept: 'bg-amber-100 text-amber-800',
  accepted: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  in_progress: 'bg-primary/10 text-primary',
  pending_review: 'bg-purple-100 text-purple-800',
  completed: 'bg-emerald-100 text-emerald-800',
  returned: 'bg-orange-100 text-orange-800',
}

type StatusBadgeProps = {
  status: TodoStatus
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('rounded-full font-medium', STATUS_VARIANTS[status], className)}
    >
      {TODO_STATUS_LABELS[status]}
    </Badge>
  )
}
