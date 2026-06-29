import { Bell } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../hooks/use-notifications'
import { useTodos } from '../hooks/use-todos'
import { usePendingActions } from '../context/pending-actions-context'
import { isNotificationDeletable } from '../lib/pending-actions'
import { useCurrentMember } from '../../../shared/hooks/use-current-member'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

export default function NotificationCenter() {
  const navigate = useNavigate()
  const location = useLocation()
  const inTodosModule = location.pathname.startsWith('/todos')
  const { currentMemberId } = useCurrentMember()
  const { data: notifications = [] } = useNotifications()
  const { data: todos = [] } = useTodos()
  const unreadCount = useUnreadNotificationCount()
  const { hasPendingActions, openPendingModal } = usePendingActions()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const deleteNotification = useDeleteNotification()

  if (hasPendingActions) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative"
        aria-label="通知"
        onClick={() => {
          openPendingModal()
          if (!inTodosModule) navigate('/todos')
        }}
      >
        <Bell className="size-5" />
        <Badge
          variant="destructive"
          className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
        >
          !
        </Badge>
      </Button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label="通知">
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-medium">通知</span>
          {unreadCount > 0 ? (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              全部已读
            </Button>
          ) : null}
        </div>
        <Separator />
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">暂无通知</p>
        ) : (
          <ul className="max-h-[24rem] overflow-y-auto">
            {notifications.map((n) => {
              const canDelete = isNotificationDeletable(n, todos, currentMemberId)

              return (
                <li
                  key={n.id}
                  className={[
                    'border-b border-border px-3 py-2.5 text-sm last:border-0',
                    n.isRead ? 'text-muted-foreground' : 'bg-muted/50',
                  ].join(' ')}
                >
                  {n.todoItemId ? (
                    <Link
                      to={`/todos/${n.todoItemId}/edit`}
                      onClick={() => {
                        if (!n.isRead) markRead.mutate(n.id)
                      }}
                      className="block hover:text-foreground"
                    >
                      {n.message}
                    </Link>
                  ) : (
                    <span>{n.message}</span>
                  )}
                  {canDelete ? (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto p-0 text-xs text-muted-foreground"
                      onClick={() => deleteNotification.mutate(n.id)}
                    >
                      删除
                    </Button>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">需先处理关联待办</p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
