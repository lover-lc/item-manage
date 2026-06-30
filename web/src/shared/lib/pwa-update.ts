import { registerSW } from 'virtual:pwa-register'

export type PwaUpdatePhase = 'idle' | 'checking' | 'downloading' | 'applying' | 'reloading'

export type PwaUpdateState = {
  phase: PwaUpdatePhase
  progress: number
}

const UPDATE_LOCK_KEY = 'pwa-update-in-progress'

type Listener = (state: PwaUpdateState) => void

let listeners: Listener[] = []
let currentState: PwaUpdateState = { phase: 'idle', progress: 0 }
let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined
let updateFlowRunning = false

function emit(state: PwaUpdateState) {
  currentState = state
  for (const listener of listeners) listener(state)
}

export function subscribePwaUpdate(listener: Listener): () => void {
  listeners.push(listener)
  listener(currentState)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function animateProgress(from: number, to: number, durationMs: number) {
  const start = performance.now()
  while (true) {
    const elapsed = performance.now() - start
    const ratio = Math.min(1, elapsed / durationMs)
    emit({
      phase: currentState.phase,
      progress: from + (to - from) * ratio,
    })
    if (ratio >= 1) break
    await sleep(32)
  }
}

async function runUpdateFlow() {
  if (updateFlowRunning) return
  if (sessionStorage.getItem(UPDATE_LOCK_KEY)) return
  if (!updateSW) return

  updateFlowRunning = true
  sessionStorage.setItem(UPDATE_LOCK_KEY, '1')

  try {
    emit({ phase: 'checking', progress: 0 })
    await animateProgress(0, 15, 400)

    emit({ phase: 'downloading', progress: 15 })
    await animateProgress(15, 70, 800)

    emit({ phase: 'applying', progress: 70 })
    await animateProgress(70, 95, 500)

    emit({ phase: 'reloading', progress: 95 })
    await animateProgress(95, 100, 300)

    await updateSW(true)
  } catch {
    sessionStorage.removeItem(UPDATE_LOCK_KEY)
    updateFlowRunning = false
    emit({ phase: 'idle', progress: 0 })
  }
}

async function checkRemoteVersion(registration?: ServiceWorkerRegistration) {
  if (import.meta.env.DEV) return

  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`,
      { cache: 'no-store' },
    )
    if (!response.ok) return

    const data = (await response.json()) as { version?: string }
    if (data.version && data.version !== __APP_VERSION__) {
      await registration?.update().catch(() => {})
    }
  } catch {
    // Offline or transient network errors should not block app usage.
  }
}

function scheduleUpdateChecks(registration: ServiceWorkerRegistration) {
  const check = () => {
    void registration.update().catch(() => {})
    void checkRemoteVersion(registration)
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
  })
  window.addEventListener('focus', check)
  window.setInterval(check, 60 * 60 * 1000)
}

export function initPwaUpdate() {
  if (import.meta.env.DEV) return

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      void runUpdateFlow()
    },
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        scheduleUpdateChecks(registration)
        void checkRemoteVersion(registration)
      }
    },
  })
}
