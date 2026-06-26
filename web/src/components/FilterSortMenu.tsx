import { ArrowUpDown, Check, SlidersHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Area, Category } from '../lib/types'
import {
  SORT_FIELD_LABELS,
  SORT_ORDER_LABELS,
} from '../lib/sort-filter'
import {
  useUiStore,
  type SortField,
  type SortOrder,
} from '../store/ui-store'

interface FilterSortMenuProps {
  areas: Area[]
  categories: Category[]
  sortOnly?: boolean
}

function MenuPanel({
  open,
  onClose,
  children,
  align = 'left',
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  align?: 'left' | 'right'
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={[
        'absolute top-full z-20 mt-1 min-w-44 rounded-card bg-bg-card py-1 shadow-lg ring-1 ring-black/5',
        align === 'left' ? 'left-0' : 'right-0',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

function MenuItem({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text hover:bg-bg-hover"
    >
      <span className="size-4 shrink-0">
        {selected ? <Check className="size-4" /> : null}
      </span>
      <span>{label}</span>
    </button>
  )
}

function MenuDivider() {
  return <div className="my-1 border-t border-bg-hover" />
}

function MenuSectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 py-1.5 text-xs font-medium text-text-tertiary">{children}</p>
  )
}

export default function FilterSortMenu({
  areas,
  categories,
  sortOnly = false,
}: FilterSortMenuProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const areaFilterId = useUiStore((s) => s.areaFilterId)
  const categoryFilterId = useUiStore((s) => s.categoryFilterId)
  const sortField = useUiStore((s) => s.sortField)
  const sortOrder = useUiStore((s) => s.sortOrder)
  const setAreaFilterId = useUiStore((s) => s.setAreaFilterId)
  const setCategoryFilterId = useUiStore((s) => s.setCategoryFilterId)
  const setSortField = useUiStore((s) => s.setSortField)
  const setSortOrder = useUiStore((s) => s.setSortOrder)

  const sortFields = Object.keys(SORT_FIELD_LABELS) as SortField[]
  const sortOrders: SortOrder[] = ['asc', 'desc']

  return (
    <div className="flex items-center gap-1">
      {!sortOnly ? (
        <div className="relative">
          <button
            type="button"
            aria-label="筛选"
            onClick={() => {
              setSortOpen(false)
              setFilterOpen((v) => !v)
            }}
            className="rounded-button p-2 text-text-secondary hover:bg-bg-hover hover:text-text"
          >
            <SlidersHorizontal className="size-5" strokeWidth={1.75} />
          </button>
          <MenuPanel open={filterOpen} onClose={() => setFilterOpen(false)}>
            <MenuSectionTitle>区域</MenuSectionTitle>
            <MenuItem
              label="全部"
              selected={areaFilterId === null}
              onClick={() => setAreaFilterId(null)}
            />
            {areas.map((area) => (
              <MenuItem
                key={area.id}
                label={area.name}
                selected={areaFilterId === area.id}
                onClick={() => setAreaFilterId(area.id)}
              />
            ))}
            <MenuDivider />
            <MenuSectionTitle>分类</MenuSectionTitle>
            <MenuItem
              label="全部"
              selected={categoryFilterId === null}
              onClick={() => setCategoryFilterId(null)}
            />
            {categories.map((category) => (
              <MenuItem
                key={category.id}
                label={category.name}
                selected={categoryFilterId === category.id}
                onClick={() => setCategoryFilterId(category.id)}
              />
            ))}
          </MenuPanel>
        </div>
      ) : null}

      <div className="relative">
        <button
          type="button"
          aria-label="排序"
          onClick={() => {
            setFilterOpen(false)
            setSortOpen((v) => !v)
          }}
          className="rounded-button p-2 text-text-secondary hover:bg-bg-hover hover:text-text"
        >
          <ArrowUpDown className="size-5" strokeWidth={1.75} />
        </button>
        <MenuPanel open={sortOpen} onClose={() => setSortOpen(false)}>
          {sortFields.map((field) => (
            <MenuItem
              key={field}
              label={SORT_FIELD_LABELS[field]}
              selected={sortField === field}
              onClick={() => setSortField(field)}
            />
          ))}
          <MenuDivider />
          {sortOrders.map((order) => (
            <MenuItem
              key={order}
              label={SORT_ORDER_LABELS[order]}
              selected={sortOrder === order}
              onClick={() => setSortOrder(order)}
            />
          ))}
        </MenuPanel>
      </div>
    </div>
  )
}
