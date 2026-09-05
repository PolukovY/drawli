/**
 * The key a piece of generated audio is stored and looked up under, on both
 * sides: the browser's Cache Storage here, and the backend's own cache
 * (`server/cache.mjs`) for the exact same request. Built from everything that
 * can change what the audio actually sounds like, so a changed voice or a
 * changed model version can never be served stale audio recorded under the
 * old one — and the same word never pays to be generated twice.
 */
export interface TtsCacheInput {
  text: string
  locale: string
  voice?: string
  speed?: number
  modelVersion?: string
}

/** `crypto.subtle` needs a secure context (https, or localhost) — true for
 *  GitHub Pages and for every local dev server this project uses. */
export async function ttsCacheKey(input: TtsCacheInput): Promise<string> {
  const parts = [
    input.text.trim(),
    input.locale,
    input.voice ?? 'default',
    (input.speed ?? 1).toFixed(2),
    input.modelVersion ?? 'v1',
  ]
  const encoded = new TextEncoder().encode(parts.join('|'))
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
