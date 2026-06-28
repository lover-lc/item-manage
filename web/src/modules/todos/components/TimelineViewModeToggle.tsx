import type { TimelineMode } from '../lib/timeline-utils'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TimelineViewModeToggleProps = {
  value: TimelineMode
  onChange: (mode: TimelineMode) => void
}

const options: { value: TimelineMode; label: string }[] = [
  { value: 'due', label: '总览' },
  { value: 'span', label: '跨度' },
]

export default function TimelineViewModeToggle({
  value,
  onChange,
}: TimelineViewModeToggleProps) {
  return (
    <div
      className="mb-3 inline-flex h-8 rounded-lg border border-border bg-muted/40 p-0.5"
      role="group"
      aria-label="时间轴视图模式"
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? 'default' : 'ghost'}
          className={cn(
            'h-7 min-w-16 rounded-md px-3 text-xs',
            value !== option.value && 'text-muted-foreground',
          )}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
