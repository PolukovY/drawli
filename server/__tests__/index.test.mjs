import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../index.mjs'

function fakeCache() {
  const store = new Map()
  return {
    async get(key) { return store.get(key) ?? null },
    async set(key, value) { store.set(key, value) },
    _store: store,
  }
}

async function withServer(app, run) {
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const { port } = server.address()
  try {
    await run(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

test('POST /api/speak: validates before ever touching the provider', async () => {
  let called = false
  const provider = { id: 'fake', async synthesize() { called = true; return { audio: new ArrayBuffer(0), contentType: 'audio/mpeg' } } }
  const app = createApp({ provider, cache: fakeCache(), rateLimit: () => ({ allowed: true, retryAfterMs: 0 }) })

  await withServer(app, async (base) => {
    const res = await fetch(`${base}/api/speak`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hola', locale: 'es-MX' }), // not in the allow-list
    })
    assert.equal(res.status, 400)
    assert.equal(called, false)
  })
})

test('POST /api/speak: synthesizes once, then serves the second identical request from cache', async () => {
  let calls = 0
  const provider = {
    id: 'fake',
    async synthesize() {
      calls += 1
      return { audio: new TextEncoder().encode('fake-audio-bytes').buffer, contentType: 'audio/mpeg' }
    },
  }
  const cache = fakeCache()
  const app = createApp({ provider, cache, rateLimit: () => ({ allowed: true, retryAfterMs: 0 }) })

  await withServer(app, async (base) => {
    const body = JSON.stringify({ text: 'apple', locale: 'en-US' })
    const first = await fetch(`${base}/api/speak`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    assert.equal(first.status, 200)
    assert.equal(first.headers.get('content-type'), 'audio/mpeg')
    assert.match(first.headers.get('cache-control') ?? '', /immutable/)

    const second = await fetch(`${base}/api/speak`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    assert.equal(second.status, 200)
    assert.equal(calls, 1) // the second request never reached the provider
  })
})

test('POST /api/speak: a rate-limited client gets 429 with Retry-After, not a synthesis attempt', async () => {
  let called = false
  const provider = { id: 'fake', async synthesize() { called = true; return { audio: new ArrayBuffer(0), contentType: 'audio/mpeg' } } }
  const app = createApp({ provider, cache: fakeCache(), rateLimit: () => ({ allowed: false, retryAfterMs: 4200 }) })

  await withServer(app, async (base) => {
    const res = await fetch(`${base}/api/speak`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'apple', locale: 'en-US' }),
    })
    assert.equal(res.status, 429)
    assert.equal(res.headers.get('retry-after'), '5')
    assert.equal(called, false)
  })
})

test('POST /api/speak: a provider failure is a 502 with no internal detail leaked', async () => {
  const provider = { id: 'fake', async synthesize() { throw new Error('upstream API key rejected: sk-secretvalue') } }
  const app = createApp({ provider, cache: fakeCache(), rateLimit: () => ({ allowed: true, retryAfterMs: 0 }) })

  await withServer(app, async (base) => {
    const res = await fetch(`${base}/api/speak`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'apple', locale: 'en-US' }),
    })
    assert.equal(res.status, 502)
    const body = await res.json()
    assert.ok(!JSON.stringify(body).includes('sk-secretvalue'))
  })
})

test('POST /api/speak: 501 with no provider configured, never a crash', async () => {
  const app = createApp({ provider: null, cache: fakeCache(), rateLimit: () => ({ allowed: true, retryAfterMs: 0 }) })
  await withServer(app, async (base) => {
    const res = await fetch(`${base}/api/speak`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'apple', locale: 'en-US' }),
    })
    assert.equal(res.status, 501)
  })
})

test('GET /api/health reports the active provider id', async () => {
  const app = createApp({ provider: { id: 'azure' }, cache: fakeCache(), rateLimit: () => ({ allowed: true, retryAfterMs: 0 }) })
  await withServer(app, async (base) => {
    const res = await fetch(`${base}/api/health`)
    assert.deepEqual(await res.json(), { ok: true, provider: 'azure' })
  })
})
