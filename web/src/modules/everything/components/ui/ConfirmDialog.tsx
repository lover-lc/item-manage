interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      data-scene-ui
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-lg bg-bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        {message ? <p className="mt-2 text-sm text-text-secondary">{message}</p> : null}
        <div className={[message ? 'mt-6' : 'mt-4', 'flex justify-end gap-2'].join(' ')}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-button px-4 py-2 text-sm text-text hover:bg-bg-hover disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={[
              'rounded-button px-4 py-2 text-sm text-white disabled:opacity-50',
              destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
