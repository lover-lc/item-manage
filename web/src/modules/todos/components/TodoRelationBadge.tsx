import MemberAvatar from '../../../shared/components/MemberAvatar'
import { useCurrentMember } from '../../../shared/hooks/use-current-member'
import { useFamilyMembers } from '../../../shared/hooks/use-family-members'
import {
  getTodoRelation,
  getTodoRelationTargetId,
} from '../lib/todo-relation'
import type { TodoItem } from '../types/todo-types'
import { cn } from '@/lib/utils'

type TodoRelationBadgeProps = {
  todo: Pick<TodoItem, 'creatorId' | 'assigneeId'>
  className?: string
  compact?: boolean
}

export default function TodoRelationBadge({
  todo,
  className,
  compact = false,
}: TodoRelationBadgeProps) {
  const { currentMemberId } = useCurrentMember()
  const { data: members = [] } = useFamilyMembers()
  const relation = getTodoRelation(todo, currentMemberId)

  if (!relation || relation === 'self') return null

  const targetId = getTodoRelationTargetId(relation, todo)
  const member = members.find((m) => m.id === targetId)
  if (!member) return null

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-full bg-muted/80 px-1.5 py-0.5 text-[10px] text-muted-foreground',
        className,
      )}
    >
      <MemberAvatar member={member} size="sm" className="!size-3.5 !text-[8px]" />
      <span className="truncate">
        {relation === 'outbound' ? '→' : '←'}
        {!compact ? ` ${member.name}` : ''}
      </span>
    </span>
  )
}
