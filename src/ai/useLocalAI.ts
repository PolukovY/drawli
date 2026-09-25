import { useCallback, useState } from 'react'
import type { LocalAIService, LocalAIStatus } from './LocalAIService'
import { NoopProvider } from './NoopProvider'
import { TransformersJsProvider } from './TransformersJsProvider'

// One provider for the whole app: `load()` downloads/starts the model once,
// and every game that calls `useLocalAI()` afterward sees it already ready.
const transformersProvider = new TransformersJsProvider()
const service: LocalAIService = transformersProvider.isSupported() ? transformersProvider : new NoopProvider()

/** The shared provider directly, for the rare non-component caller. */
export function localAIService(): LocalAIService {
  return service
}

/**
 * Games and the parent-mode settings screen call `load()` before their first
 * `generate*` call; every method already rejects cleanly if that's skipped or
 * fails, so nothing here is required for a game to work.
 */
export function useLocalAI() {
  const [status, setStatus] = useState<LocalAIStatus>(() => service.status)
  const [progress, setProgress] = useState(0)

  const load = useCallback(async () => {
    if (service.status === 'ready') {
      setStatus('ready')
      return true
    }
    setStatus('loading')
    setProgress(0)
    const ok = await service.load((pct) => { setProgress(pct) })
    setStatus(service.status)
    return ok
  }, [])

  const unload = useCallback(() => {
    service.unload()
    setStatus(service.status)
    setProgress(0)
  }, [])

  return { service, status, progress, load, unload, isSupported: service.isSupported() }
}
