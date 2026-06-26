import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

function formatAuthError(message: string): string {
  if (message.toLowerCase().includes('invalid login credentials')) {
    return '用户名或密码错误'
  }
  return message
}

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!hasSupabaseConfig || !supabase) {
      const msg = '未配置 Supabase 环境变量，请先配置 .env.local'
      setError(msg)
      return { error: msg }
    }

    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        const msg = formatAuthError(signInError.message)
        setError(msg)
        return { error: msg }
      }
      return { error: null }
    } catch (err) {
      const msg = formatAuthError(String((err as Error)?.message || '操作失败'))
      setError(msg)
      return { error: msg }
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    setError(null)
    await supabase.auth.signOut()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const user: User | null = session?.user ?? null

  return (
    <AuthContext.Provider
      value={{ user, session, loading, error, signIn, signOut, clearError }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
