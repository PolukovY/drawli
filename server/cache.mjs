import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

/**
 * The server-side half of the cache key scheme described in
 * `src/audio/tts/cacheKey.ts` — same five inputs, same order, so the two
 * sides never need to agree on anything beyond "hash these fields". The
 * frontend's copy uses Web Crypto (`crypto.subtle`); this one uses Node's
 * `node:crypto`, since a backend has no reason to route through the
 * browser-shaped API. Kept in sync by hand — five short fields, unlikely to
 * drift, and each side has its own test proving the format.
 */
export function cacheKeyFor({ text, locale, voice, speed, modelVersion }) {
  const parts = [text.trim(), locale, voice ?? 'default', (speed ?? 1).toFixed(2), modelVersion ?? 'v1']
  return createHash('sha256').update(parts.join('|')).digest('hex')
}

/**
 * One file of audio bytes plus a sidecar recording its content type, on
 * local disk. This is the reference implementation, meant for a single
 * instance or local development — swap it for S3/R2/GCS behind the same two
 * functions before running more than one instance, since two processes each
 * writing their own disk would not share a cache at all.
 */
export function createDiskCache(rootDir) {
  const pathFor = (key) => join(rootDir, key.slice(0, 2), key)

  return {
    async get(key) {
      const base = pathFor(key)
      try {
        const [audio, meta] = await Promise.all([
          readFile(`${base}.audio`),
          readFile(`${base}.json`, 'utf8'),
        ])
        return { audio, contentType: JSON.parse(meta).contentType }
      } catch {
        return null
      }
    },

    async set(key, { audio, contentType }) {
      const base = pathFor(key)
      await mkdir(dirname(base), { recursive: true })
      await Promise.all([
        writeFile(`${base}.audio`, audio),
        writeFile(`${base}.json`, JSON.stringify({ contentType, cachedAt: new Date().toISOString() })),
      ])
    },
  }
}
