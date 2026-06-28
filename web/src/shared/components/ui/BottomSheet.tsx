import type { ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={cn(
          'max-h-[85svh] gap-0 rounded-t-2xl border-t p-0 pb-safe-bottom',
          className,
        )}
      >
        {title ? (
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="text-center text-base font-medium">
              {title}
            </SheetTitle>
          </SheetHeader>
        ) : null}
        <div className="overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
