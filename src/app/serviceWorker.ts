import { registerSW } from 'virtual:pwa-register'

const HOUR = 60 * 60 * 1000

/**
 * An installed PWA can sit open on a tablet for days, so a new build would
 * otherwise never reach the child — that is how a device ends up showing an
 * older version of the app. The worker checks for updates on every launch,
 * when the app comes back to the foreground, and hourly, then reloads itself
 * as soon as a new build is ready.
 */
export function registerServiceWorker() {
  if (import.meta.env.DEV) return

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      void updateSW(true)
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return

      const check = () => { void registration.update() }

      window.setInterval(check, HOUR)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
    },
  })
}
