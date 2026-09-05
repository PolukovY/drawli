import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraFacing = 'user' | 'environment'
export type CameraError = 'denied' | 'unavailable' | null

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>
  facing: CameraFacing
  error: CameraError
  /** True once a frame is actually flowing, so the shutter isn't offered too early. */
  ready: boolean
  flip: () => void
  retry: () => void
}

/**
 * Wraps getUserMedia so the page never touches a MediaStream directly. Runs
 * only while a screen wants it: the flow steps that don't need the camera
 * unmount this and the light goes off, same as closing any camera app.
 */
export function useCamera(active: boolean): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facing, setFacing] = useState<CameraFacing>('user')
  const [error, setError] = useState<CameraError>(null)
  const [ready, setReady] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setReady(false)
  }, [])

  useEffect(() => {
    if (!active) {
      stop()
      return
    }

    let cancelled = false
    setError(null)

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('unavailable')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
        if (!cancelled) setReady(true)
      } catch {
        if (!cancelled) setError('denied')
      }
    }

    stop()
    void start()

    return () => {
      cancelled = true
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, facing, attempt, stop])

  const flip = useCallback(() => {
    setFacing((f) => (f === 'user' ? 'environment' : 'user'))
  }, [])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])

  return { videoRef, facing, error, ready, flip, retry }
}
