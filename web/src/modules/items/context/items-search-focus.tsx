import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'

type ItemsSearchFocusContextValue = {
  registerFocusHandler: (handler: () => void) => void
  focusSearch: () => void
}

const ItemsSearchFocusContext = createContext<ItemsSearchFocusContextValue | null>(
  null,
)

export function ItemsSearchFocusProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<(() => void) | null>(null)

  const registerFocusHandler = useCallback((handler: () => void) => {
    handlerRef.current = handler
  }, [])

  const focusSearch = useCallback(() => {
    handlerRef.current?.()
  }, [])

  const value = useMemo(
    () => ({ registerFocusHandler, focusSearch }),
    [registerFocusHandler, focusSearch],
  )

  return (
    <ItemsSearchFocusContext.Provider value={value}>
      {children}
    </ItemsSearchFocusContext.Provider>
  )
}

export function useItemsSearchFocus() {
  const ctx = useContext(ItemsSearchFocusContext)
  if (!ctx) {
    throw new Error('useItemsSearchFocus must be used within ItemsSearchFocusProvider')
  }
  return ctx
}
