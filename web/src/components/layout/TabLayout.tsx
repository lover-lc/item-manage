import { Home, Search, SlidersHorizontal } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/', label: '物品', icon: Home, end: true },
  { to: '/search', label: '搜索', icon: Search, end: false },
  { to: '/manage', label: '管理', icon: SlidersHorizontal, end: false },
] as const

export default function TabLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-bg">
      <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-bg-hover bg-bg-card pb-safe-bottom">
        <div className="mx-auto flex h-14 max-w-lg">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-text-secondary',
                ].join(' ')
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
