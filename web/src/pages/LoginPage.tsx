import { useState, type FormEvent } from 'react'
import { hasSupabaseConfig } from '../lib/supabase'
import { useAuth } from '../hooks/use-auth'

export default function LoginPage() {
  const { signIn, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!hasSupabaseConfig) return

    setBusy(true)
    clearError()
    await signIn(email, password)
    setBusy(false)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm rounded-card bg-bg-card p-8 shadow-sm">
        <h1 className="text-center text-2xl font-medium tracking-tight text-text">
          物品整理
        </h1>
        <p className="mt-2 text-center text-sm text-text-secondary">
          家庭物品管理
        </p>

        {!hasSupabaseConfig ? (
          <p className="mt-6 rounded-button bg-bg-hover px-4 py-3 text-sm text-text-secondary">
            未配置 Supabase 环境变量，请先配置 .env.local
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm text-text-secondary"
              >
                邮箱
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-button border border-bg-hover bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm text-text-secondary"
              >
                密码
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-button border border-bg-hover bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
              />
            </div>

            {error ? (
              <p className="text-sm text-status-expired">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-button bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-light disabled:opacity-60"
            >
              {busy ? '登录中…' : '登录'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
