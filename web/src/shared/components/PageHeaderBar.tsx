import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ActionVariant = 'default' | 'outline' | 'secondary' | 'ghost'

export type HeaderAction =
  | {
      kind: 'button'
      label: string
      onClick: () => void
      variant?: ActionVariant
      disabled?: boolean
      icon?: ReactNode
    }
  | {
      kind: 'link'
      label: string
      to: string
      variant?: ActionVariant
      icon?: ReactNode
    }

function HeaderActionControl({ action }: { action: HeaderAction }) {
  const variant = action.variant ?? 'outline'

  if (action.kind === 'link') {
    return (
      <Button variant={variant} size="sm" className="min-h-8" asChild>
        <Link to={action.to}>
          {action.icon}
          {action.label}
        </Link>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className="min-h-8"
      onClick={action.onClick}
      disabled={action.disabled}
    >
      {action.icon}
      {action.label}
    </Button>
  )
}

export default function PageHeaderBar({
  leading,
  title,
  trailing,
  trailingSecondary,
  embedded = false,
}: {
  leading?: HeaderAction
  title?: ReactNode
  trailing?: HeaderAction
  trailingSecondary?: HeaderAction
  embedded?: boolean
}) {
  const slotClass = 'flex min-w-[4.5rem] shrink-0 items-center'

  return (
    <header
      className={
        embedded
          ? 'mb-3 border-b border-border pb-2.5'
          : 'sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-sm'
      }
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`${slotClass} justify-start`}>
          {leading ? <HeaderActionControl action={leading} /> : null}
        </div>
        {title != null ? (
          <h1 className="min-w-0 flex-1 truncate text-center text-lg font-medium text-foreground">
            {title}
          </h1>
        ) : (
          <div className="min-w-0 flex-1" />
        )}
        <div className={`${slotClass} justify-end gap-1`}>
          {trailingSecondary ? <HeaderActionControl action={trailingSecondary} /> : null}
          {trailing ? <HeaderActionControl action={trailing} /> : null}
        </div>
      </div>
    </header>
  )
}
