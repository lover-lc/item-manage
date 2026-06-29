import { ChevronDown } from 'lucide-react'
import { useCurrentMember } from '../../../shared/hooks/use-current-member'
import MemberAvatar from '../../../shared/components/MemberAvatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function MemberSwitcher() {
  const { currentMember, members, setCurrentMemberId } = useCurrentMember()

  if (!currentMember) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="max-w-[9rem] gap-2 px-3">
          <MemberAvatar member={currentMember} size="sm" />
          <span className="truncate">{currentMember.name}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[10rem]">
        {members.map((member) => (
          <DropdownMenuItem
            key={member.id}
            onClick={() => setCurrentMemberId(member.id)}
            className="gap-2"
          >
            <MemberAvatar member={member} size="sm" />
            {member.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
