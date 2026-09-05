/**
 * A token bucket per IP address, entirely in memory. Enough to stop this
 * endpoint being used as a free, unlimited TTS proxy by anyone who finds the
 * URL — it is not enough on its own for a production deployment running more
 * than one instance, since each instance would keep its own count. Swap the
 * `Map` below for Redis/Upstash (or your platform's own rate-limit primitive)
 * before running this behind a load balancer with more than one instance.
 */

const buckets = new Map()

/** @returns {{ allowed: boolean, retryAfterMs: number }} */
export function checkRateLimit(key, { capacity = 20, refillPerMinute = 20 } = {}) {
  const now = Date.now()
  const refillPerMs = refillPerMinute / 60000

  const bucket = buckets.get(key) ?? { tokens: capacity, updatedAt: now }
  const elapsed = now - bucket.updatedAt
  const refreshed = Math.min(capacity, bucket.tokens + elapsed * refillPerMs)

  if (refreshed < 1) {
    buckets.set(key, { tokens: refreshed, updatedAt: now })
    const msPerToken = 1 / refillPerMs
    return { allowed: false, retryAfterMs: Math.ceil((1 - refreshed) * msPerToken) }
  }

  buckets.set(key, { tokens: refreshed - 1, updatedAt: now })
  return { allowed: true, retryAfterMs: 0 }
}

/** Test-only: a fresh process would have an empty map anyway. */
export function _resetRateLimitForTests() {
  buckets.clear()
}
