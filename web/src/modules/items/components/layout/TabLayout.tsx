import { Home, Search, SlidersHorizontal } from 'lucide-react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/items', label: '物品', icon: Home, end: true },
  { to: '/items/search', label: '搜索', icon: Search, end: false },
  { to: '/items/manage', label: '管理', icon: SlidersHorizontal, end: false },
] as const

export default function TabLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border bg-card/80 px-4 py-2 backdrop-blur-sm">
        <Link to="/portal" className="text-xs font-medium text-primary">
          返回门户
        </Link>
      </header>
      <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 pb-safe-bottom backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors',
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
