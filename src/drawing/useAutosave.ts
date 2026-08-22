import { useCallback, useEffect, useRef } from 'react'

const DEFAULT_DELAY = 400

/**
 * Debounced autosave that never drops the last change.
 *
 * A plain setTimeout loses work in three ways a child will hit within a week:
 * leaving the screen before the timer fires, the tablet being locked, and iOS
 * killing a backgrounded tab without ever sending `visibilitychange`. So the
 * pending write is flushed on unmount, on hide, and on `pagehide`.
 */
export function useAutosave<T>(save: (payload: T) => Promise<void> | void, delay = DEFAULT_DELAY) {
  const timer = useRef<number | null>(null)
  const pending = useRef<T | null>(null)
  const saveRef = useRef(save)
  saveRef.current = save

  const flush = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    const payload = pending.current
    if (payload === null) return
    pending.current = null
    void saveRef.current(payload)
  }, [])

  const schedule = useCallback((payload: T) => {
    pending.current = payload
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      timer.current = null
      const next = pending.current
      pending.current = null
      if (next !== null) void saveRef.current(next)
    }, delay)
  }, [delay])

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
