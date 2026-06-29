import {
  Calendar,
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  LayoutPanelLeft,
  ListChecks,
  ListTodo,
  Plus,
  Settings2,
  UserCheck,
  UserRoundCheck,
} from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import NotificationCenter from '../NotificationCenter'
import MemberSwitcher from '../../../portal/components/MemberSwitcher'
import AppTabBar, { tabBarBottomOffset } from '../../../../shared/components/AppTabBar'
import { Button } from '@/components/ui/button'

const tabs = [
  { to: '/todos', label: '待办', icon: ListTodo, activeIcon: ListChecks, end: true },
  {
    to: '/todos/timeline',
    label: '时间轴',
    icon: Calendar,
    activeIcon: CalendarDays,
    end: false,
  },
  {
    to: '/todos/assigned',
    label: '分配给我',
    icon: UserCheck,
    activeIcon: UserRoundCheck,
    end: false,
  },
  {
    to: '/todos/manage',
    label: '管理',
    icon: Settings2,
    activeIcon: FolderKanban,
    end: false,
  },
  {
    to: '/portal',
    label: '主页',
    icon: LayoutDashboard,
    activeIcon: LayoutPanelLeft,
    end: true,
  },
] as const

export default function TodoTabLayout() {
  return (
    <div className="flex min-h-svh flex-col">
        <header className="border-b border-border bg-card/80 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center justify-end gap-1">
            <MemberSwitcher />
            <NotificationCenter />
          </div>
        </header>

        <main
          className="flex min-h-0 flex-1 flex-col"
          style={{ paddingBottom: `calc(${tabBarBottomOffset} + 3.5rem)` }}
        >
          <Outlet />
        </main>

        <Button
          size="icon-lg"
          className="fixed right-4 z-30 size-12 rounded-full shadow-lg"
          style={{ bottom: `calc(${tabBarBottomOffset} + 0.75rem)` }}
          asChild
        >
          <Link to="/todos/new" aria-label="新建待办">
            <Plus className="size-6" />
          </Link>
        </Button>

        <AppTabBar tabs={tabs} labelClassName="text-[10px]" />
    </div>
  )
}
