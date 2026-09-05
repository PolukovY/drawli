import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

class FakeCache {
  store = new Map<string, Response>()
  async match(url: string) {
    const hit = this.store.get(url)
    return hit ? hit.clone() : undefined
  }
  async put(url: string, response: Response) {
    this.store.set(url, response.clone())
  }
}

class FakeCacheStorage {
  private caches = new Map<string, FakeCache>()
  async open(name: string) {
    if (!this.caches.has(name)) this.caches.set(name, new FakeCache())
    return this.caches.get(name) as unknown as Cache
  }
}

describe('NeuralSpeech', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('caches', new FakeCacheStorage())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('is not configured, and fetches nothing, without an endpoint', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const { isNeuralConfigured, fetchNeuralAudio } = await import('./NeuralSpeech')

    expect(isNeuralConfigured()).toBe(false)
    const result = await fetchNeuralAudio({ text: 'яблуко', locale: 'uk-UA' })
    expect(result).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('fetches once, then serves the same request from cache without a second network call', async () => {
    vi.stubEnv('VITE_TTS_ENDPOINT', 'https://tts.example/api/speak')
    const audioBytes = new Uint8Array([1, 2, 3, 4])
    const fetchSpy = vi.fn(async () => new Response(audioBytes, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } }))
    vi.stubGlobal('fetch', fetchSpy)

    const { isNeuralConfigured, fetchNeuralAudio } = await import('./NeuralSpeech')
    expect(isNeuralConfigured()).toBe(true)

    const request = { text: 'manzana', locale: 'es-ES' as const }
    const first = await fetchNeuralAudio(request)
    expect(first).not.toBeNull()
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    const second = await fetchNeuralAudio(request)
    expect(second).not.toBeNull()
    expect(fetchSpy).toHaveBeenCalledTimes(1) // still one — served from cache
  })

  it('never caches, and returns null for, a failed backend response', async () => {
    vi.stubEnv('VITE_TTS_ENDPOINT', 'https://tts.example/api/speak')
    const fetchSpy = vi.fn(async () => new Response('nope', { status: 500 }))
    vi.stubGlobal('fetch', fetchSpy)

    const { fetchNeuralAudio } = await import('./NeuralSpeech')
    const request = { text: 'tortuga', locale: 'es-ES' as const }
    expect(await fetchNeuralAudio(request)).toBeNull()
    expect(await fetchNeuralAudio(request)).toBeNull()
    expect(fetchSpy).toHaveBeenCalledTimes(2) // no cached failure short-circuiting the retry
  })

  it('returns null rather than throwing when the network call itself fails', async () => {
    vi.stubEnv('VITE_TTS_ENDPOINT', 'https://tts.example/api/speak')
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))

    const { fetchNeuralAudio } = await import('./NeuralSpeech')
    await expect(fetchNeuralAudio({ text: 'apple', locale: 'en-GB' })).resolves.toBeNull()
  })

  it('keeps es-ES and es-MX in separate cache entries', async () => {
    vi.stubEnv('VITE_TTS_ENDPOINT', 'https://tts.example/api/speak')
    const fetchSpy = vi.fn(async () => new Response(new Uint8Array([9]), { status: 200 }))
    vi.stubGlobal('fetch', fetchSpy)

    const { fetchNeuralAudio } = await import('./NeuralSpeech')
    await fetchNeuralAudio({ text: 'rojo', locale: 'es-ES' })
    await fetchNeuralAudio({ text: 'rojo', locale: 'es-MX' })
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})
