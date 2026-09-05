import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkRateLimit, _resetRateLimitForTests } from '../rateLimit.mjs'

test('allows requests up to capacity, then refuses', () => {
  _resetRateLimitForTests()
  const key = 'client-a'
  for (let i = 0; i < 5; i += 1) {
    assert.equal(checkRateLimit(key, { capacity: 5, refillPerMinute: 0 }).allowed, true)
  }
  const blocked = checkRateLimit(key, { capacity: 5, refillPerMinute: 0 })
  assert.equal(blocked.allowed, false)
  assert.ok(blocked.retryAfterMs > 0)
})

test('tracks separate clients independently', () => {
  _resetRateLimitForTests()
  const a = checkRateLimit('client-a', { capacity: 1, refillPerMinute: 0 })
  const b = checkRateLimit('client-b', { capacity: 1, refillPerMinute: 0 })
  assert.equal(a.allowed, true)
  assert.equal(b.allowed, true) // b's bucket is untouched by a's usage
})

test('refills over time', async () => {
  _resetRateLimitForTests()
  const key = 'client-c'
  assert.equal(checkRateLimit(key, { capacity: 1, refillPerMinute: 6000 }).allowed, true) // 100/sec
  assert.equal(checkRateLimit(key, { capacity: 1, refillPerMinute: 6000 }).allowed, false)
  await new Promise((resolve) => setTimeout(resolve, 20))
  assert.equal(checkRateLimit(key, { capacity: 1, refillPerMinute: 6000 }).allowed, true)
})
