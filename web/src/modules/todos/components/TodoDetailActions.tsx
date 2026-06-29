import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarkTodoNotificationsRead } from '../hooks/use-notifications'
import {
  useConfirmNegotiation,
  useTodoStatusAction,
} from '../hooks/use-todos'
import {
  canConfirmNegotiation,
  canRejectNegotiation,
  isNegotiationStatus,
} from '../lib/negotiation'
import { getPendingActionKind } from '../lib/pending-actions'
import type { TodoItem } from '../types/todo-types'
import { Button } from '@/components/ui/button'

const fieldInputClass =
  'w-full rounded-button border border-bg-hover bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary'

type TodoDetailActionsProps = {
  todo: TodoItem
  currentMemberId: string | null
}

function FloatingActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg flex-col gap-3">{children}</div>
    </div>
  )
}

export default function TodoDetailActions({
  todo,
  currentMemberId,
}: TodoDetailActionsProps) {
  const navigate = useNavigate()
  const statusAction = useTodoStatusAction()
  const confirmNegotiation = useConfirmNegotiation()
  const markTodoNotificationsRead = useMarkTodoNotificationsRead()
  const [reasonMode, setReasonMode] = useState<'reject' | 'return' | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const negotiationKind = getPendingActionKind(todo, currentMemberId)
  const showNegotiationFloat =
    negotiationKind === 'pending_accept' || negotiationKind === 'returned'
  const canConfirm = canConfirmNegotiation(todo, currentMemberId)
  const canReject = canRejectNegotiation(todo, currentMemberId)

  async function finishAction() {
    await markTodoNotificationsRead.mutateAsync(todo.id)
    setReasonMode(null)
    setReason('')
    setError(null)
    navigate('/todos')
  }

  async function runStatusAction(
    action: 'verify' | 'return' | 'reject',
    options?: { reason?: string; role: 'creator' | 'assignee' },
  ) {
    setIsPending(true)
    setError(null)
    try {
      await statusAction.mutateAsync({
        id: todo.id,
        action,
        reason: options?.reason,
        role: options?.role ?? 'assignee',
        currentStatus: todo.status,
      })
      await finishAction()
    } catch (err) {
      setError(String((err as Error).message || '操作失败'))
    } finally {
      setIsPending(false)
    }
  }

  async function handleConfirm() {
    setIsPending(true)
    setError(null)
    try {
      await confirmNegotiation.mutateAsync({ id: todo.id, todo })
      await finishAction()
    } catch (err) {
      setError(String((err as Error).message || '操作失败'))
    } finally {
      setIsPending(false)
    }
  }

  function handleReasonSubmit() {
    if (!reason.trim()) {
      setError('请填写理由')
      return
    }
    if (reasonMode === 'reject') {
      void runStatusAction('reject', { reason: reason.trim(), role: 'assignee' })
      return
    }
    void runStatusAction('return', { reason: reason.trim(), role: 'creator' })
  }

  if (showNegotiationFloat && (canConfirm || canReject)) {
    return (
      <FloatingActionBar>
        {reasonMode === 'reject' ? (
          <>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请填写拒绝理由"
              className={fieldInputClass}
              rows={3}
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isPending}
                onClick={() => {
                  setReasonMode(null)
                  setReason('')
                  setError(null)
                }}
              >
                返回
              </Button>
              <Button
                type="button"
                className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                disabled={isPending}
                onClick={handleReasonSubmit}
              >
                确认拒绝
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-3">
            {canConfirm ? (
              <Button
                type="button"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isPending}
                onClick={() => void handleConfirm()}
              >
                同意
              </Button>
            ) : null}
            {canReject ? (
              <Button
                type="button"
                className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                disabled={isPending}
                onClick={() => {
                  setReasonMode('reject')
                  setReason('')
                  setError(null)
                }}
              >
                拒绝
              </Button>
            ) : null}
          </div>
        )}
        {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}
      </FloatingActionBar>
    )
  }

  if (negotiationKind === 'pending_review') {
    return (
      <section className="overflow-hidden rounded-card bg-bg-card">
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-text">请验收负责人提交的完成结果</p>
          {reasonMode ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请填写理由"
                className={fieldInputClass}
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={isPending}
                  onClick={() => {
                    setReasonMode(null)
                    setReason('')
                    setError(null)
                  }}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  disabled={isPending}
                  onClick={handleReasonSubmit}
                >
                  确认
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => void runStatusAction('verify', { role: 'creator' })}
              >
                验收通过
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setReasonMode('return')
                  setReason('')
                  setError(null)
                }}
              >
                驳回
              </Button>
            </div>
          )}
          {error ? <p className="mt-2 text-xs text-status-expired">{error}</p> : null}
        </div>
      </section>
    )
  }

  return null
}

export function hasFloatingDetailActions(
  todo: Pick<
    TodoItem,
    'creatorId' | 'assigneeId' | 'status' | 'awaitingMemberId'
  >,
  memberId: string | null,
): boolean {
  const kind = getPendingActionKind(todo, memberId)
  if (kind !== 'pending_accept' && kind !== 'returned') return false
  return canConfirmNegotiation(todo, memberId) || canRejectNegotiation(todo, memberId)
}

export function isNegotiationEditableView(
  todo: Pick<TodoItem, 'status' | 'creatorId' | 'assigneeId'>,
  memberId: string | null,
): boolean {
  if (!memberId) return false
  if (isNegotiationStatus(todo.status)) {
    return todo.creatorId === memberId || todo.assigneeId === memberId
  }
  if (todo.status === 'rejected' && todo.creatorId === memberId) return true
  return false
}
