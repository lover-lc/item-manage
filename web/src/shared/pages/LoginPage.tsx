import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const { session, isLoading, isConfigured, householdEmail, signIn } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && session) {
    return <Navigate to="/portal" replace />
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    setIsSubmitting(true)
    try {
      await signIn(password.trim())
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('Invalid login credentials')
          ? '密码错误，请重试'
          : String((err as Error)?.message || '登录失败')
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold">家庭应用</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          请输入家庭密码以继续使用
        </p>

        {!isConfigured ? (
          <Card className="mt-8 shadow-card">
            <CardContent className="px-4 py-3 text-sm text-muted-foreground">
              未配置 Supabase。请在本地创建 <code className="text-foreground">web/.env.local</code>{' '}
              并填写 URL 与 Publishable Key。
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="household-email">账号</Label>
              <Input
                id="household-email"
                type="email"
                value={householdEmail}
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="household-password">密码</Label>
              <Input
                id="household-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="家庭密码"
                disabled={isSubmitting || isLoading}
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              className="min-h-11 w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? '登录中…' : '登录'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
