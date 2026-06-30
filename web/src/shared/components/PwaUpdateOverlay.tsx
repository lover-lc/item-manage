import { useEffect, useState } from 'react'
import { subscribePwaUpdate, type PwaUpdateState } from '../lib/pwa-update'

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}

export default function PwaUpdateOverlay() {
  const [state, setState] = useState<PwaUpdateState>({ phase: 'idle', progress: 0 })

  useEffect(() => subscribePwaUpdate(setState), [])

  if (state.phase === 'idle') return null

  const label =
    state.phase === 'checking'
      ? '正在检查更新…'
      : state.phase === 'downloading'
        ? '正在下载新版本…'
        : state.phase === 'applying'
          ? '正在应用更新…'
          : '即将完成…'

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 px-6 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-xl border border-border bg-card p-6 shadow-lg">
        <p className="text-center text-sm font-medium text-foreground">{label}</p>
        <ProgressBar progress={state.progress} />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {Math.round(state.progress)}%
        </p>
      </div>
    </div>
  )
}
