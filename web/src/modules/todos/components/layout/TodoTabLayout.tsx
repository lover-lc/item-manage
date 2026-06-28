import {
  Calendar,
  CheckSquare,
  Home,
  List,
  Plus,
} from 'lucide-react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import NotificationCenter from '../NotificationCenter'
import MemberSwitcher from '../../../portal/components/MemberSwitcher'
import BackToHomeButton from '../../../../shared/components/BackToHomeButton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/todos', label: '待办', icon: Home, end: true },
  { to: '/todos/timeline', label: '时间轴', icon: Calendar, end: false },
  { to: '/todos/assigned', label: '分配给我', icon: CheckSquare, end: false },
  { to: '/todos/lists', label: '清单', icon: List, end: false },
] as const

export default function TodoTabLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border bg-card/80 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <BackToHomeButton />
          <div className="flex items-center gap-1">
            <MemberSwitcher />
            <NotificationCenter />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px)+3.5rem)]">
        <Outlet />
      </main>

      <Button
        size="icon-lg"
        className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+0.75rem)] right-4 z-30 size-12 rounded-full shadow-lg"
        asChild
      >
        <Link to="/todos/new" aria-label="新建待办">
          <Plus className="size-6" />
        </Link>
      </Button>

      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 pb-safe-bottom backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="size-5" strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
