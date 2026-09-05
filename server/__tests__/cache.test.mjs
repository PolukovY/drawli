import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cacheKeyFor, createDiskCache } from '../cache.mjs'

test('cacheKeyFor is deterministic and sensitive to every field', () => {
  const base = { text: 'apple', locale: 'en-US', voice: 'v1', speed: 1, modelVersion: 'v1' }
  assert.equal(cacheKeyFor(base), cacheKeyFor({ ...base }))
  assert.notEqual(cacheKeyFor(base), cacheKeyFor({ ...base, locale: 'en-GB' }))
  assert.notEqual(cacheKeyFor(base), cacheKeyFor({ ...base, speed: 0.9 }))
  assert.match(cacheKeyFor(base), /^[0-9a-f]{64}$/)
})

test('disk cache: a miss returns null, a set makes the next get a hit', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'drawli-tts-cache-'))
  try {
    const cache = createDiskCache(dir)
    const key = cacheKeyFor({ text: 'tortuga', locale: 'es-ES' })

    assert.equal(await cache.get(key), null)

    const audio = Buffer.from([1, 2, 3, 4, 5])
    await cache.set(key, { audio, contentType: 'audio/mpeg' })

    const hit = await cache.get(key)
    assert.ok(hit)
    assert.equal(hit.contentType, 'audio/mpeg')
    assert.deepEqual(Uint8Array.from(hit.audio), Uint8Array.from(audio))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
