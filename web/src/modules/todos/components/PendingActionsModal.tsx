import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { PendingActionItem } from '../lib/pending-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type PendingActionsModalProps = {
  open: boolean
  items: PendingActionItem[]
  onDismiss: () => void
}

export default function PendingActionsModal({
  open,
  items,
  onDismiss,
}: PendingActionsModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[min(90svh,640px)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle>有待办需要处理</DialogTitle>
        </DialogHeader>

        <ul className="flex-1 overflow-y-auto">
          {items.map((item) => (
            <li key={item.key} className="border-b border-border last:border-0">
              <Link
                to={`/todos/${item.todoId}/edit`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-border px-4 py-3">
          <Button type="button" variant="outline" className="w-full" onClick={onDismiss}>
            稍后处理
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
