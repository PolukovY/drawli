import express from 'express'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cacheKeyFor, createDiskCache } from './cache.mjs'
import { checkRateLimit } from './rateLimit.mjs'
import { validateSpeakRequest } from './validate.mjs'
import { createAzureTtsProvider } from './providers/AzureTtsProvider.mjs'
import { createOpenAiTtsProvider } from './providers/OpenAiTtsProvider.mjs'

/**
 * The one endpoint the frontend is allowed to know about:
 * `POST /api/speak`. See ../README (root) and ./README.md for what this is,
 * why it exists, and how to deploy it — this file is deliberately just the
 * wiring, so the pieces it wires together (validate/rateLimit/cache/provider)
 * stay independently readable and testable.
 *
 * MODEL_VERSION bumps whenever a change here would make previously-cached
 * audio wrong to keep serving (a different default voice, a different
 * provider) — bumping it starts every cache key over, which is the cheap,
 * correct way to invalidate without walking the existing cache.
 */
const MODEL_VERSION = 'v1'

function resolveProvider() {
  const name = (process.env.TTS_PROVIDER ?? '').toLowerCase()

  if (name === 'azure' || (!name && process.env.AZURE_SPEECH_KEY)) {
    const apiKey = process.env.AZURE_SPEECH_KEY
    const region = process.env.AZURE_SPEECH_REGION
    if (!apiKey || !region) throw new Error('AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are both required for the Azure provider')
    return createAzureTtsProvider({ apiKey, region })
  }

  if (name === 'openai' || (!name && process.env.OPENAI_API_KEY)) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY is required for the OpenAI provider')
    return createOpenAiTtsProvider({ apiKey })
  }

  return null
}

export function createApp({ provider = resolveProvider(), cache = createDiskCache(defaultCacheDir()), rateLimit = checkRateLimit } = {}) {
  const app = express()
  app.use(express.json({ limit: '8kb' })) // a request here is a word or a sentence, never anything larger

  app.post('/api/speak', async (req, res) => {
    if (!provider) {
      res.status(501).json({ error: 'no TTS provider configured on this server' })
      return
    }

    const problem = validateSpeakRequest(req.body)
    if (problem) {
      res.status(400).json({ error: problem })
      return
    }

    // Never trust a single header alone in front of a real proxy — this is
    // the reference shape; a production deployment should pin this to
    // whatever its actual load balancer/CDN is known to set.
    const clientKey = req.ip ?? req.socket.remoteAddress ?? 'unknown'
    const limit = rateLimit(clientKey)
    if (!limit.allowed) {
      res.set('Retry-After', String(Math.ceil(limit.retryAfterMs / 1000)))
      res.status(429).json({ error: 'too many requests' })
      return
    }

    const { text, locale, voice, speed, style } = req.body
    const key = cacheKeyFor({ text, locale, voice, speed, modelVersion: MODEL_VERSION })

    try {
      const cached = await cache.get(key)
      if (cached) {
        sendAudio(res, cached.audio, cached.contentType)
        return
      }

      const result = await provider.synthesize({ text, locale, voice, speed, style })
      await cache.set(key, { audio: Buffer.from(result.audio), contentType: result.contentType })
      sendAudio(res, Buffer.from(result.audio), result.contentType)
    } catch (error) {
      // The provider's own error text can carry account/billing detail that
      // has no business reaching a client, and this request may carry
      // whatever a child was asked to say — neither belongs in a log line
      // meant for anyone but this process's own operator.
      console.error('tts synthesis failed:', error instanceof Error ? error.message : error)
      res.status(502).json({ error: 'speech synthesis failed' })
    }
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, provider: provider?.id ?? null })
  })

  return app
}

function sendAudio(res, audio, contentType) {
  res.set('Content-Type', contentType)
  // The cache key already changes if any input that could change the audio
  // does, so a hit is safe to treat as permanent.
  res.set('Cache-Control', 'public, max-age=31536000, immutable')
  res.send(audio)
}

function defaultCacheDir() {
  return join(dirname(fileURLToPath(import.meta.url)), '.cache')
}

if (process.env.NODE_ENV !== 'test' && process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 8787)
  createApp().listen(port, () => {
    console.log(`drawli TTS backend listening on :${port}`)
  })
}
