import { useEffect, useState } from 'react'
import {
  formatRangeFilterLabel,
  isIsoDate,
  isValidGanttRangeFilter,
  type GanttRange,
} from '../../lib/gantt-scale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type GanttToolbarProps = {
  range: GanttRange
  onApplyRange: (range: GanttRange) => void
}

export default function GanttToolbar({ range, onApplyRange }: GanttToolbarProps) {
  const [draftStart, setDraftStart] = useState(range.start)
  const [draftEnd, setDraftEnd] = useState(range.end)

  const orderValid =
    !isIsoDate(draftStart) ||
    !isIsoDate(draftEnd) ||
    draftStart <= draftEnd
  const canApply = isValidGanttRangeFilter(draftStart, draftEnd)
  const isDirty = draftStart !== range.start || draftEnd !== range.end

  useEffect(() => {
    setDraftStart(range.start)
    setDraftEnd(range.end)
  }, [range.start, range.end])

  function handleApply() {
    if (!canApply || !orderValid) return
    onApplyRange({ start: draftStart, end: draftEnd })
  }

  return (
    <div className="mb-2 shrink-0 rounded-lg border border-border/60 bg-card/80 px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs font-medium text-muted-foreground">时间范围</span>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            起
            <Input
              type="date"
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
              className="h-8 w-[128px] text-xs"
            />
          </label>
          <span className="text-xs text-muted-foreground">—</span>
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            止
            <Input
              type="date"
              value={draftEnd}
              onChange={(e) => setDraftEnd(e.target.value)}
              className="h-8 w-[128px] text-xs"
            />
          </label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 px-3 text-xs"
            disabled={!canApply || !orderValid || !isDirty}
            onClick={handleApply}
          >
            应用
          </Button>
        </div>
        {!orderValid ? (
          <span className="text-[10px] text-destructive">起始不能晚于截止</span>
        ) : null}
        <span className="text-xs tabular-nums text-muted-foreground">
          当前 {formatRangeFilterLabel(range)}
        </span>
      </div>
    </div>
  )
}
