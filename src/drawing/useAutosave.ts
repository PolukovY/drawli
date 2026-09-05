import { useCallback, useEffect, useRef } from 'react'

const DEFAULT_DELAY = 2000
/** However busy the child is, the drawing is on disk at least this often. */
const DEFAULT_MAX_WAIT = 10000

/**
 * Debounced autosave that never drops the last change.
 *
 * A plain setTimeout loses work in three ways a child will hit within a week:
 * leaving the screen before the timer fires, the tablet being locked, and iOS
 * killing a backgrounded tab without ever sending `visibilitychange`. So the
 * pending write is flushed on unmount, on hide, and on `pagehide`.
 *
 * The debounce is long because a save is not cheap: the whole drawing and its
 * thumbnail go to IndexedDB every time. At four hundred milliseconds every
 * stroke wrote its own copy — a dozen strokes, a dozen full documents — which
 * on a tablet is felt as the pencil stuttering. The ceiling is what makes the
 * longer wait safe: a child who draws without pausing still gets a save every
 * ten seconds, and everything above still flushes the moment they stop.
 */
export function useAutosave<T>(
  save: (payload: T) => Promise<void> | void,
  delay = DEFAULT_DELAY,
  maxWait = DEFAULT_MAX_WAIT,
) {
  const timer = useRef<number | null>(null)
  const pending = useRef<T | null>(null)
  /** When the change now waiting to be written first appeared. */
  const waitingSince = useRef(0)
  const saveRef = useRef(save)
  saveRef.current = save

  const write = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    waitingSince.current = 0
    const payload = pending.current
    if (payload === null) return
    pending.current = null
    void saveRef.current(payload)
  }, [])

  const flush = write

  const schedule = useCallback((payload: T) => {
    pending.current = payload
    const now = Date.now()
    if (!waitingSince.current) waitingSince.current = now

    // Each new stroke pushes the write back, but never past the ceiling.
    const wait = Math.max(0, Math.min(delay, waitingSince.current + maxWait - now))
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(write, wait)
  }, [delay, maxWait, write])

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    // pagehide fires where visibilitychange does not: iOS killing the tab,
    // bfcache, and the app being swiped away.
    const onPageHide = () => flush()

    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onPageHide)
      // Leaving the screen must not cancel the write in flight.
      flush()
    }
  }, [flush])

  return { schedule, flush }
}
