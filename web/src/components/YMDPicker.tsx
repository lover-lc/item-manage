import { useCallback, useEffect, useMemo, useRef } from 'react'
import { parseISODate, toISODate } from '../lib/date-utils'

const ITEM_HEIGHT = 40
const PADDING_ITEMS = 2

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function parseValue(iso: string): { year: number; month: number; day: number } {
  const date = parseISODate(iso)
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  }
}

interface ScrollColumnProps {
  items: number[]
  value: number
  onChange: (value: number) => void
  format: (value: number) => string
  label: string
}

function ScrollColumn({ items, value, onChange, format, label }: ScrollColumnProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrolling = useRef(false)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToValue = useCallback(
    (target: number, smooth = false) => {
      const el = ref.current
      if (!el) return
      const index = items.indexOf(target)
      if (index < 0) return
      scrolling.current = true
      el.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: smooth ? 'smooth' : 'instant',
      })
      window.setTimeout(() => {
        scrolling.current = false
      }, smooth ? 200 : 0)
    },
    [items],
  )

  useEffect(() => {
    scrollToValue(value)
  }, [value, scrollToValue])

  function handleScroll() {
    if (scrolling.current) return
    const el = ref.current
    if (!el) return

    if (scrollTimer.current) clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => {
      const index = Math.round(el.scrollTop / ITEM_HEIGHT)
      const clamped = Math.max(0, Math.min(index, items.length - 1))
      const next = items[clamped]
      el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' })
      if (next !== value) onChange(next)
    }, 80)
  }

  return (
    <div className="relative flex-1">
      <span className="sr-only">{label}</span>
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-[200px] overflow-y-auto scroll-smooth snap-y snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
        {items.map((item) => (
          <div
            key={item}
            className="flex h-10 snap-center items-center justify-center text-base text-text"
          >
            {format(item)}
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
      </div>
    </div>
  )
}

interface YMDPickerProps {
  value: string
  onChange: (value: string) => void
  yearMin?: number
  yearMax?: number
}

export default function YMDPicker({
  value,
  onChange,
  yearMin = 1970,
  yearMax = 2100,
}: YMDPickerProps) {
  const { year, month, day } = parseValue(value)

  const years = useMemo(
    () => Array.from({ length: yearMax - yearMin + 1 }, (_, i) => yearMin + i),
    [yearMin, yearMax],
  )
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])
  const maxDay = daysInMonth(year, month)
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => i + 1),
    [maxDay],
  )

  const clampedDay = Math.min(day, maxDay)

  function emit(y: number, m: number, d: number) {
    const max = daysInMonth(y, m)
    const safeDay = Math.min(d, max)
    onChange(toISODate(new Date(y, m - 1, safeDay)))
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 border-y border-bg-hover bg-bg-hover/30" style={{ height: ITEM_HEIGHT }} />
      <div className="flex items-stretch px-2">
        <ScrollColumn
          label="年"
          items={years}
          value={year}
          onChange={(y) => emit(y, month, clampedDay)}
          format={(v) => String(v)}
        />
        <ScrollColumn
          label="月"
          items={months}
          value={month}
          onChange={(m) => emit(year, m, clampedDay)}
          format={(v) => String(v).padStart(2, '0')}
        />
        <ScrollColumn
          label="日"
          items={days}
          value={clampedDay}
          onChange={(d) => emit(year, month, d)}
          format={(v) => String(v).padStart(2, '0')}
        />
      </div>
      <div className="flex px-2 pb-2 text-center text-xs text-text-tertiary">
        <span className="flex-1">年</span>
        <span className="flex-1">月</span>
        <span className="flex-1">日</span>
      </div>
    </div>
  )
}
