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
 * What the app knows about a newer build:
 *
 * - `none`    nothing to do
 * - `ready`   a new version is downloaded and waiting; the app keeps running
 *             the one the child started with
 * - `applying` the child pressed Update and the swap is under way
 */
export type UpdateStatus = 'none' | 'ready' | 'applying'

let status: UpdateStatus = 'none'
const watchers = new Set<(value: UpdateStatus) => void>()
/** Hands the waiting worker the page. Set once the worker registers. */
let takeOver: ((reload?: boolean) => Promise<void>) | null = null

/** Survives the reload an update causes, so the app can say what happened. */
const UPDATED_KEY = 'drawli.sw.updated'
/** One automatic hand-over per launch: a bad build must not loop. */
const APPLIED_KEY = 'drawli.sw.applied'
/** The build the child was using last time, to notice a swap that just happened. */
const BUILD_KEY = 'drawli.build'
/** How long the hand-over gets before the button reloads the page itself. */
const HANDOVER_MS = 3000

const session = {
  get(key: string) {
    try { return sessionStorage.getItem(key) } catch { return null }
  },
  set(key: string, value: string) {
    try { sessionStorage.setItem(key, value) } catch { /* private mode */ }
  },
  clear(key: string) {
    try { sessionStorage.removeItem(key) } catch { /* nothing to clear */ }
  },
}

function setStatus(next: UpdateStatus) {
  if (status === next) return
  status = next
  for (const watcher of watchers) watcher(next)
}

export function updateStatus(): UpdateStatus { return status }

export function watchUpdate(watcher: (value: UpdateStatus) => void): () => void {
  watchers.add(watcher)
  return () => { watchers.delete(watcher) }
}

/**
 * Whether this launch is running a different build than the last one did.
 *
 * Read once, here, rather than when a component asks: an update that the
 * browser applied on its own — which is what happens when the app is simply
 * closed and reopened — leaves no other trace, and the child should still be
 * told the app changed under them.
 */
function buildChanged(): boolean {
  try {
    const seen = localStorage.getItem(BUILD_KEY)
    if (seen === BUILD_ID) return false
    localStorage.setItem(BUILD_KEY, BUILD_ID)
    // No previous id means a fresh install, which is not an update.
    return Boolean(seen)
  } catch {
    return false
  }
}

let justUpdated = Boolean(session.get(UPDATED_KEY)) || buildChanged()
session.clear(UPDATED_KEY)

/** True once, right after an update swapped the app under the child's feet. */
export function takeJustUpdated(): boolean {
  const value = justUpdated
  justUpdated = false
  return value
}

/**
 * Move the page onto the waiting build, and reload it exactly once.
 *
 * The reload is owned here rather than left to the worker library, which
 * reloads on its own when asked to hand over: with a fallback timer as well,
 * two of them would be racing to navigate the same page. The library is asked
 * to hand over and nothing more; when the page turns over is decided here.
 *
 * The timer is not a nicety. There is not always a worker to hand over to — a
 * page that has just registered its first one, or a build that activated by
 * itself — and without it the button would sit on "Updating…" forever, which
 * is exactly what it did before the timer existed.
 */
function handOver() {
  if (!takeOver) return
  session.set(UPDATED_KEY, '1')

  let done = false
  const reload = () => {
    if (done) return
    done = true
    window.location.reload()
  }

  navigator.serviceWorker?.addEventListener('controllerchange', reload, { once: true })
  void takeOver(false)
  window.setTimeout(reload, HANDOVER_MS)
}

/** The Update button. */
export function applyUpdate() {
  if (!takeOver || status === 'applying') return
  setStatus('applying')
  handOver()
}

/**
 * An installed PWA can sit open on a tablet for days, so a new build would
 * otherwise never reach the child — that is how a device ends up showing an
 * older version of the app. The worker checks for updates on every launch,
 * when the app comes back to the foreground, and hourly.
 *
 * Finding one no longer reloads the app. A child in the middle of a picture
 * gets a banner and decides; ignoring it costs nothing, because the version
 * that was downloaded takes over on its own the next time the app is opened.
 */
export function registerServiceWorker() {
  if (import.meta.env.DEV) return

  void pruneStaleCaches()

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Downloaded and waiting. Nothing changes on screen until asked.
      setStatus('ready')
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return
      takeOver = updateSW

      // A version left waiting from an earlier session: this launch is the
      // "next time the app is opened" that the banner promised, so take it
      // now, before the child has drawn anything to lose.
      if (registration.waiting && !session.get(APPLIED_KEY)) {
        session.set(APPLIED_KEY, '1')
        handOver()
        return
      }

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
