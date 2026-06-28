import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BentoGrid } from '@/components/ui/bento-grid'
import { cn } from '@/lib/utils'

type AppCardProps = {
  title: string
  description: string
  to: string
  icon: ReactNode
  stats: { label: string; value: number | string }[]
  accentColor?: string
}

export default function AppCard({
  title,
  description,
  to,
  icon,
  stats,
  accentColor = '#007AFF',
}: AppCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative col-span-3 flex flex-col overflow-hidden rounded-[20px] bg-card text-card-foreground transition duration-200',
        'shadow-card hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-90"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 18%, white), transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-3 p-5">
        <div
          className="flex size-12 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          {icon}
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-muted/70 px-3 py-2.5"
            >
              <p className="text-xl font-semibold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

export function PortalAppGrid({ children }: { children: ReactNode }) {
  return (
    <BentoGrid className="grid-cols-1 auto-rows-auto gap-4">{children}</BentoGrid>
  )
}
