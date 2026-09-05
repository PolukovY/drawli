import { describe, expect, it } from 'vitest'
import { ttsCacheKey } from './cacheKey'

describe('ttsCacheKey', () => {
  const base = { text: 'яблуко', locale: 'uk-UA', voice: 'v1', speed: 0.9, modelVersion: 'v1' }

  it('is deterministic for the same input', async () => {
    expect(await ttsCacheKey(base)).toBe(await ttsCacheKey({ ...base }))
  })

  it('changes when the text changes', async () => {
    expect(await ttsCacheKey(base)).not.toBe(await ttsCacheKey({ ...base, text: 'веселка' }))
  })

  it('changes when the locale changes — es-ES and es-MX must never share a cache slot', async () => {
    const es = { ...base, text: 'manzana', locale: 'es-ES' }
    expect(await ttsCacheKey(es)).not.toBe(await ttsCacheKey({ ...es, locale: 'es-MX' }))
  })

  it('changes when the voice, speed or model version changes', async () => {
    const key = await ttsCacheKey(base)
    expect(await ttsCacheKey({ ...base, voice: 'v2' })).not.toBe(key)
    expect(await ttsCacheKey({ ...base, speed: 1.1 })).not.toBe(key)
    expect(await ttsCacheKey({ ...base, modelVersion: 'v2' })).not.toBe(key)
  })

  it('produces a hex sha256 digest (64 hex characters)', async () => {
    expect(await ttsCacheKey(base)).toMatch(/^[0-9a-f]{64}$/)
  })
})
