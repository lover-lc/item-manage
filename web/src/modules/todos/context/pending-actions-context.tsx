import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { useCurrentMember } from '../../../shared/hooks/use-current-member'
import { useNotifications } from '../hooks/use-notifications'
import { useTodos } from '../hooks/use-todos'
import { buildPendingActionItems, type PendingActionItem } from '../lib/pending-actions'
import PendingActionsModal from '../components/PendingActionsModal'

type PendingActionsContextValue = {
  pendingItems: PendingActionItem[]
  hasPendingActions: boolean
  openPendingModal: () => void
  dismissPendingModal: () => void
}

const PendingActionsContext = createContext<PendingActionsContextValue | null>(null)

export function PendingActionsProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const queryClient = useQueryClient()
  const { currentMemberId } = useCurrentMember()
  const { data: todos = [], isFetched: todosFetched } = useTodos()
  const { data: notifications = [], isFetched: notificationsFetched } = useNotifications()
  const [sessionDismissed, setSessionDismissed] = useState(false)

  const inTodosModule = location.pathname.startsWith('/todos')

  const pendingItems = useMemo(
    () => buildPendingActionItems(todos, notifications, currentMemberId),
    [todos, notifications, currentMemberId],
  )

  const hasPendingActions = pendingItems.length > 0
  const dataReady = todosFetched && notificationsFetched

  const viewingPendingDetail = useMemo(() => {
    const match = location.pathname.match(/^\/todos\/([^/]+)\/edit$/)
    if (!match) return false
    return pendingItems.some((item) => item.todoId === match[1])
  }, [location.pathname, pendingItems])

  useEffect(() => {
    if (!inTodosModule) {
      setSessionDismissed(false)
    }
  }, [inTodosModule])

  useEffect(() => {
    setSessionDismissed(false)
    void queryClient.invalidateQueries({ queryKey: ['todos'] })
    void queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }, [currentMemberId, queryClient])

  const shouldShowModal =
    inTodosModule &&
    dataReady &&
    hasPendingActions &&
    !viewingPendingDetail &&
    !sessionDismissed

  const value = useMemo(
    () => ({
      pendingItems,
      hasPendingActions,
      openPendingModal: () => {
        setSessionDismissed(false)
      },
      dismissPendingModal: () => {
        setSessionDismissed(true)
      },
    }),
    [pendingItems, hasPendingActions],
  )

  return (
    <PendingActionsContext.Provider value={value}>
      {children}
      <PendingActionsModal
        open={shouldShowModal}
        items={pendingItems}
        onDismiss={value.dismissPendingModal}
      />
    </PendingActionsContext.Provider>
  )
}

export function usePendingActions() {
  const ctx = useContext(PendingActionsContext)
  if (!ctx) {
    throw new Error('usePendingActions must be used within PendingActionsProvider')
  }
  return ctx
}
