import { formatDailyCost } from '../lib/cost-calculator'
import type { ItemStatus } from '../lib/item-status'
import { ItemStatusPill } from './item-form-layout'
import type { ItemFieldsCostStats } from './ItemFields'

export type ItemHeroProps = {
  mode: 'view' | 'edit'
  name: string
  onNameChange?: (value: string) => void
  status?: ItemStatus
  costStats?: ItemFieldsCostStats
}

export default function ItemHero({
  mode,
  name,
  onNameChange,
  status,
  costStats,
}: ItemHeroProps) {
  const isEdit = mode === 'edit'

  return (
    <section className="overflow-hidden rounded-card bg-bg-card shadow-card">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        {isEdit ? (
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange?.(e.target.value)}
            placeholder="物品名称"
            className="min-w-0 flex-1 bg-transparent text-lg font-semibold leading-snug text-text outline-none placeholder:text-text-tertiary"
          />
        ) : (
          <h2 className="min-w-0 flex-1 text-lg font-semibold leading-snug text-text">
            {name}
          </h2>
        )}
        {status ? <ItemStatusPill status={status} /> : null}
      </div>
      {costStats ? <ItemHeroMetrics costStats={costStats} /> : null}
    </section>
  )
}

function ItemHeroMetrics({ costStats }: { costStats: ItemFieldsCostStats }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-bg-hover border-t border-bg-hover">
      <HeroMetric label="已使用" value={`${costStats.days} 天`} />
      <HeroMetric
        label="每日成本"
        value={formatDailyCost(costStats.dailyCost)}
        highlight
      />
      <HeroMetric
        label="单价"
        value={costStats.unitPrice ?? '—'}
        highlight={costStats.unitPrice != null}
      />
    </div>
  )
}

function HeroMetric({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="px-2 py-3 text-center">
      <p className="text-[10px] text-text-secondary">{label}</p>
      <p
        className={[
          'mt-0.5 truncate text-sm font-medium',
          highlight ? 'text-cost' : 'text-text',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}
