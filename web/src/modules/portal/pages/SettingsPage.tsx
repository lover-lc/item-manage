import { ArrowLeft, Bell, BellOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import BackToHomeButton from '../../../shared/components/BackToHomeButton'
import { usePushSubscription } from '../../todos/hooks/use-push-subscription'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { isSupported, permission, subscribe, unsubscribe } = usePushSubscription()

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-bg-hover bg-bg-card px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-button p-1 text-text-secondary hover:bg-bg-hover"
            aria-label="返回"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-medium text-text">设置</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 p-4">
        <section className="rounded-card border border-bg-hover bg-bg-card p-4">
          <h2 className="text-sm font-medium text-text-secondary">家庭成员</h2>
          <p className="mt-2 text-sm text-text-secondary">
            成员与头像请在待办模块的「管理 → 成员」中维护。
          </p>
          <Link
            to="/todos/manage"
            className="mt-3 inline-block text-sm text-primary"
          >
            前往成员管理
          </Link>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-text-secondary">通知</h2>
          <div className="rounded-card border border-bg-hover bg-bg-card p-4">
            {!isSupported ? (
              <p className="text-sm text-text-secondary">当前浏览器不支持推送通知</p>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  {permission === 'granted' ? (
                    <Bell className="size-4 text-status-active" />
                  ) : (
                    <BellOff className="size-4 text-text-secondary" />
                  )}
                  浏览器推送通知
                </div>
                {permission === 'granted' ? (
                  <button
                    type="button"
                    onClick={() => void unsubscribe()}
                    className="text-sm text-text-secondary"
                  >
                    关闭
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void subscribe()}
                    className="text-sm text-primary"
                  >
                    启用
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="flex justify-center pt-2">
          <BackToHomeButton />
        </div>
      </main>
    </div>
  )
}
