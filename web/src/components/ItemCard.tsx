import { AlertTriangle, MinusCircle, XCircle } from 'lucide-react'
import { formatDailyCost } from '../lib/cost-calculator'
import { getItemStatus, type ItemStatus } from '../lib/item-status'
import { parseISODate } from '../lib/date-utils'
import { highlightNameParts } from '../lib/search'
import type { Item } from '../lib/types'

interface ItemCardProps {
  item: Item
  dailyCost: number
  highlightQuery?: string
}

function StatusIcon({ status }: { status: ItemStatus }) {
  switch (status) {
    case 'usedUp':
      return <MinusCircle className="size-4 text-status-usedUp" aria-label="已用完" />
    case 'expired':
      return <XCircle className="size-4 text-status-expired" aria-label="已过期" />
    case 'expiringSoon':
      return (
        <AlertTriangle className="size-4 text-status-expiring" aria-label="即将过期" />
      )
    default:
      return null
  }
}

function ItemName({
  name,
  highlightQuery,
}: {
  name: string
  highlightQuery?: string
}) {
  const parts = highlightQuery ? highlightNameParts(name, highlightQuery) : null

  if (!parts) {
    return <span className="truncate">{name}</span>
  }

  return (
    <span className="truncate">
      {parts.before}
      <mark className="rounded bg-primary/15 font-semibold text-text">
        {parts.match}
      </mark>
      {parts.after}
    </span>
  )
}

export default function ItemCard({ item, dailyCost, highlightQuery }: ItemCardProps) {
  const categoryName = item.category?.name ?? '—'
  const location = item.specificLocation.trim() || '—'

  const status = getItemStatus({
    endDate: item.endDate ? parseISODate(item.endDate) : null,
    expiryDate: item.expiryDate ? parseISODate(item.expiryDate) : null,
    today: new Date(),
  })

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text">
          <ItemName name={item.name} highlightQuery={highlightQuery} />
        </p>
        <p className="truncate text-sm text-text-secondary">{categoryName}</p>
        <p className="truncate text-sm text-text-tertiary">{location}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="text-sm font-semibold text-cost">
          {formatDailyCost(dailyCost)}
        </span>
        <StatusIcon status={status} />
      </div>
    </div>
  )
}
