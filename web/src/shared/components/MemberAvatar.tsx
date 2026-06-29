import type { FamilyMember } from '../hooks/use-family-members'
import { cn } from '@/lib/utils'

type MemberAvatarProps = {
  member: Pick<FamilyMember, 'name' | 'color' | 'avatarUrl'>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClass = {
  sm: 'size-5 text-[10px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
} as const

export default function MemberAvatar({
  member,
  size = 'md',
  className,
}: MemberAvatarProps) {
  const initial = member.name.trim().slice(0, 1) || '?'

  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt=""
        className={cn('shrink-0 rounded-full object-cover', sizeClass[size], className)}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white',
        sizeClass[size],
        className,
      )}
      style={{ backgroundColor: member.color }}
      aria-hidden
    >
      {initial}
    </span>
  )
}
