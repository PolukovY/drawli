import { registerSW } from 'virtual:pwa-register'

const HOUR = 60 * 60 * 1000

/** Caches this build owns; anything else with these prefixes is last build's. */
const RUNTIME_CACHES = ['drawli-catalogue', 'drawli-exercises']

export const BUILD_ID = __BUILD_ID__

/**
 * Runtime caches are named after the build. Sweeping the ones from older
 * builds is what makes a redeploy actually reach the tablet: the shell always
 * updated, but the exercise cache kept serving yesterday's artwork.
 *
 * Only the browser's cache storage is touched. Drawings, stars and settings
 * live in IndexedDB and are never part of this.
 */
export async function pruneStaleCaches(): Promise<void> {
  if (!('caches' in window)) return
  const names = await caches.keys()
  await Promise.all(
    names
      .filter((name) => RUNTIME_CACHES.some((prefix) => name.startsWith(`${prefix}-`)))
      .filter((name) => !name.endsWith(`-${BUILD_ID}`))
      .map((name) => caches.delete(name)),
  )
}

/**
 * The "refresh the app" button: throw away every cache and the worker itself,
 * then load again from the network. Nothing in IndexedDB is touched, so the
 * child keeps every drawing and star.
 */
export async function refreshApp(): Promise<void> {
  if ('caches' in window) {
    const names = await caches.keys()
    await Promise.all(names.map((name) => caches.delete(name)))
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  }

  // A plain reload can still be answered by the page that is already in memory,
  // so ask for the entry point again with a cache-busting query.
  const url = new URL(window.location.href)
  url.searchParams.set('fresh', String(Date.now()))
  window.location.replace(url.toString())
}

/**
 * An installed PWA can sit open on a tablet for days, so a new build would
 * otherwise never reach the child — that is how a device ends up showing an
 * older version of the app. The worker checks for updates on every launch,
 * when the app comes back to the foreground, and hourly, then reloads itself
 * as soon as a new build is ready.
 */
export function registerServiceWorker() {
  if (import.meta.env.DEV) return

  void pruneStaleCaches()

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
      // An installed app is often reopened without ever going hidden first.
      window.addEventListener('focus', check)
    },
  })
}
