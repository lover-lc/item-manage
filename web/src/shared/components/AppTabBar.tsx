import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

export const TAB_BAR_CONTENT_HEIGHT = '3.5rem'

export const tabBarBottomOffset = `calc(${TAB_BAR_CONTENT_HEIGHT} + env(safe-area-inset-bottom, 0px))`

export type AppTabItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Solid-style icon shown when the tab is active. */
  activeIcon?: LucideIcon
  end?: boolean
  /** Called when the tab is tapped while already active (e.g. focus search). */
  onRepeatActive?: () => void
}

type AppTabBarProps = {
  tabs: readonly AppTabItem[]
  labelClassName?: string
}

function TabBarIcon({
  icon: Icon,
  activeIcon: ActiveIcon,
  active,
}: {
  icon: LucideIcon
  activeIcon?: LucideIcon
  active: boolean
}) {
  if (!active) {
    return (
      <Icon
        className="size-5 transition-all duration-200"
        strokeWidth={1.75}
        aria-hidden
      />
    )
  }

  const SolidIcon = ActiveIcon ?? Icon

  return (
    <SolidIcon
      className="size-[26px] scale-105 transition-all duration-200"
      strokeWidth={2}
      fill="currentColor"
      stroke="currentColor"
      aria-hidden
    />
  )
}

export default function AppTabBar({ tabs, labelClassName }: AppTabBarProps) {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg">
        {tabs.map(({ to, label, icon, activeIcon, end, onRepeatActive }) => {
          const isActive = end
            ? location.pathname === to
            : location.pathname.startsWith(to)

          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={(event) => {
                if (isActive && onRepeatActive) {
                  event.preventDefault()
                  onRepeatActive()
                }
              }}
              className={({ isActive: navActive }) =>
                cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors duration-200',
                  labelClassName ?? 'text-xs',
                  navActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              {({ isActive: navActive }) => (
                <>
                  <TabBarIcon
                    icon={icon}
                    activeIcon={activeIcon}
                    active={navActive}
                  />
                  <span className={cn('transition-all', navActive && 'font-semibold')}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
      <div className="pb-safe-bottom" aria-hidden="true" />
    </nav>
  )
}
