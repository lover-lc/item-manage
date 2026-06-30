import { registerSW } from 'virtual:pwa-register'

function reloadForUpdate() {
  window.location.reload()
}

async function checkRemoteVersion() {
  if (import.meta.env.DEV) return

  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`,
      { cache: 'no-store' },
    )
    if (!response.ok) return

    const data = (await response.json()) as { version?: string }
    if (data.version && data.version !== __APP_VERSION__) {
      reloadForUpdate()
    }
  } catch {
    // Offline or transient network errors should not block app usage.
  }
}

function scheduleUpdateChecks(registration: ServiceWorkerRegistration) {
  const check = () => {
    void registration.update().catch(() => {})
    void checkRemoteVersion()
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
  })
  window.addEventListener('focus', check)
  window.setInterval(check, 60 * 60 * 1000)
}

export function initPwaUpdate() {
  if (import.meta.env.DEV) return

  void checkRemoteVersion()

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (registration) scheduleUpdateChecks(registration)
    },
  })
}
