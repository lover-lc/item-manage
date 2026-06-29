import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const fieldInputClass =
  'w-full rounded-button border border-bg-hover bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary'

export type TodoActionDialogProps =
  | {
      mode: 'confirm_complete'
      open: boolean
      todoTitle: string
      onCancel: () => void
      onConfirm: () => void
      isPending?: boolean
    }
  | {
      mode: 'reject_reason'
      open: boolean
      title: string
      placeholder?: string
      reason: string
      onReasonChange: (value: string) => void
      onCancel: () => void
      onConfirm: () => void
      isPending?: boolean
    }

export default function TodoActionDialog(props: TodoActionDialogProps) {
  if (props.mode === 'confirm_complete') {
    return (
      <Dialog open={props.open} onOpenChange={(open) => !open && props.onCancel()}>
        <DialogContent className="max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>提交验收</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            完成后将提交给创建人验收
          </p>
          <p className="font-medium text-foreground">{props.todoTitle}</p>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={props.onCancel} disabled={props.isPending}>
              取消
            </Button>
            <Button type="button" onClick={props.onConfirm} disabled={props.isPending}>
              {props.isPending ? '提交中…' : '确认提交'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onCancel()}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
        </DialogHeader>
        <textarea
          value={props.reason}
          onChange={(e) => props.onReasonChange(e.target.value)}
          placeholder={props.placeholder ?? '请填写理由'}
          className={fieldInputClass}
          rows={3}
          autoFocus
        />
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={props.onCancel} disabled={props.isPending}>
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={props.onConfirm}
            disabled={props.isPending || !props.reason.trim()}
          >
            {props.isPending ? '提交中…' : '确认驳回'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
