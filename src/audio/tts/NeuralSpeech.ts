import type { TtsLocale, TtsStyle } from './TtsProvider'
import { ttsCacheKey } from './cacheKey'

/**
 * The optional cloud layer in front of the browser's own speech synthesis.
 * Every function here is safe to call whether or not a backend is actually
 * deployed: with no `VITE_TTS_ENDPOINT` configured, `fetchNeuralAudio`
 * returns null immediately and nothing about the app changes — the system
 * voice (`../speech.ts`) is what every child hears today, and stays what
 * everyone hears until a backend is deployed and pointed at.
 *
 * Nothing here ever holds a provider API key: this file only ever talks to
 * this app's own backend endpoint over HTTPS, the same way any other fetch
 * call does. The key lives on the server (`server/`), read from an
 * environment variable, never shipped to a browser.
 */

const CACHE_NAME = 'drawli-neural-tts-v1'
/** Never actually fetched — a stable, private key for the Cache Storage entry. */
const CACHE_ORIGIN = 'https://neural-tts.drawli.internal'
const MODEL_VERSION = 'v1'
const REQUEST_TIMEOUT_MS = 6000

export interface NeuralSpeakRequest {
  text: string
  locale: TtsLocale
  voice?: string
  speed?: number
  style?: TtsStyle
}

function endpoint(): string | undefined {
  const value = import.meta.env.VITE_TTS_ENDPOINT
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/** Whether a backend has actually been pointed at — the whole feature is inert without one. */
export function isNeuralConfigured(): boolean {
  return Boolean(endpoint())
}

async function openCache(): Promise<Cache | null> {
  if (typeof caches === 'undefined') return null
  try { return await caches.open(CACHE_NAME) } catch { return null }
}

/**
 * The audio for this exact request — same text, locale, voice and speed —
 * from the local cache if it has been said before, or the backend if not.
 * Resolves to null on anything going wrong at all: offline, a slow or dead
 * backend, a bad response, no endpoint configured. Never throws, and never
 * caches a failure, so the next tap is a fresh attempt rather than a word
 * stuck permanently "not available".
 */
export async function fetchNeuralAudio(request: NeuralSpeakRequest): Promise<Blob | null> {
  const base = endpoint()
  if (!base || !request.text.trim()) return null

  const key = await ttsCacheKey({
    text: request.text,
    locale: request.locale,
    voice: request.voice,
    speed: request.speed,
    modelVersion: MODEL_VERSION,
  }).catch(() => null)
  if (!key) return null

  const cacheUrl = `${CACHE_ORIGIN}/${key}`
  const cache = await openCache()

  if (cache) {
    const hit = await cache.match(cacheUrl).catch(() => undefined)
    if (hit) return hit.blob()
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, modelVersion: MODEL_VERSION }),
      signal: controller.signal,
    })
    if (!response.ok) return null

    const blob = await response.blob()
    if (cache) {
      // The exact bytes the backend sent, under a synthetic request the
      // browser is never actually asked to fetch — Cache Storage used as a
      // plain content-addressed blob store.
      await cache.put(cacheUrl, new Response(blob, { headers: response.headers })).catch(() => undefined)
    }
    return blob
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

let pooledAudio: HTMLAudioElement | null = null

function audioElement(): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  if (!pooledAudio) pooledAudio = new Audio()
  return pooledAudio
}

/**
 * iOS only allows audio to start inside the call stack of an actual tap; a
 * neural clip arrives after a network round trip, well outside that window.
 * The fix is to spend the tap immediately, on this one pooled element — a
 * silent, instantly-paused play() — so that later, once the real clip is
 * ready, changing this same element's `src` and calling play() again is not
 * asking for a new permission, only continuing to use one already granted.
 *
 * Call this synchronously from the click handler itself, before anything
 * asynchronous happens — `speak()`/`speakWord()` in `../speech.ts` do this
 * automatically whenever a neural backend is configured.
 */
export function unlockAudioForGesture(): void {
  const audio = audioElement()
  if (!audio) return
  audio.muted = true
  const attempt = audio.play()
  if (attempt && typeof attempt.then === 'function') {
    attempt.catch(() => undefined).finally(() => {
      audio.pause()
      audio.muted = false
    })
  }
}

/** Plays a fetched clip on the same element `unlockAudioForGesture` primed. */
export async function playNeuralAudio(blob: Blob): Promise<void> {
  const audio = audioElement()
  if (!audio) throw new Error('no audio element available')
  const url = URL.createObjectURL(blob)
  const cleanup = () => URL.revokeObjectURL(url)
  audio.addEventListener('ended', cleanup, { once: true })
  audio.src = url
  try {
    await audio.play()
  } catch (error) {
    cleanup()
    throw error
  }
}
