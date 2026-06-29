import type { FamilyMember } from '../../../shared/hooks/use-family-members'
import {
  getStatusReasonLabel,
  type ReasonStatus,
} from '../lib/todo-status-reason'
import type { TodoStatusLog } from '../types/todo-types'
import { cn } from '@/lib/utils'

type TodoStatusReasonBannerProps = {
  status: ReasonStatus
  log?: TodoStatusLog
  reasonText?: string
  members?: FamilyMember[]
  className?: string
  compact?: boolean
}

function formatReasonTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TodoStatusReasonBanner({
  status,
  log,
  reasonText,
  members = [],
  className,
  compact = false,
}: TodoStatusReasonBannerProps) {
  const reason = (reasonText ?? log?.reason)?.trim()
  if (!reason) return null

  const operator = log ? members.find((m) => m.id === log.operatorId) : undefined
  const label = getStatusReasonLabel(status)
  const tone =
    status === 'rejected'
      ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'
      : 'border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200'

  if (compact) {
    return (
      <p className={cn('text-xs leading-relaxed', className)}>
        <span className="font-medium">{label}：</span>
        <span className="text-muted-foreground">{reason}</span>
      </p>
    )
  }

  return (
    <div
      className={cn('rounded-card border px-4 py-3', tone, className)}
      role="note"
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{reason}</p>
      {operator && log ? (
        <p className="mt-2 text-xs opacity-80">
          {operator.name} · {formatReasonTime(log.createdAt)}
        </p>
      ) : null}
    </div>
  )
}
