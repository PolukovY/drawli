/**
 * The last stop before a generation reaches a child: strip formatting noise,
 * cap length, and reject anything on a short denylist. This is a basic guard,
 * not a content-moderation system — everything here already had to pass a
 * small instruction-tuned model's own alignment first. Any failure here means
 * the caller's `catch` falls back to its existing deterministic content; the
 * child never sees raw or malformed model output.
 */

const MAX_LENGTH = 400

// Deliberately short: this exists to catch an obviously bad generation, not
// to be a general profanity filter. Extend only with real, observed failures.
const DENYLIST = ['kill', 'die', 'blood', 'gun', 'hate', 'stupid', 'ugly']

export function sanitizeShortText(raw: string): string {
  const cleaned = raw.replace(/["*_#`]/g, '').replace(/\s+/g, ' ').trim()
  if (!cleaned) throw new Error('empty generation')
  const capped = cleaned.length > MAX_LENGTH ? cleaned.slice(0, MAX_LENGTH) : cleaned
  const lower = capped.toLowerCase()
  if (DENYLIST.some((word) => lower.includes(word))) throw new Error('generation failed a safety check')
  return capped
}

/**
 * Pulls a JSON array of strings out of a generation that may have wrapped it
 * in prose or code fences, then filters to `count` clean, unique entries that
 * aren't the correct answer. Throws if it can't find enough — the caller
 * retries once with a stricter prompt, then falls back to deterministic content.
 */
export function parseDistractorArray(raw: string, count: number, correctAnswer: string): string[] {
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('no JSON array found in generation')
  const parsed: unknown = JSON.parse(match[0])
  if (!Array.isArray(parsed)) throw new Error('generation was not a JSON array')

  const excluded = correctAnswer.trim().toLowerCase()
  const seen = new Set<string>()
  const clean: string[] = []
  for (const item of parsed) {
    if (typeof item !== 'string') continue
    const word = item.trim()
    if (!word || word.length > 24) continue
    const lower = word.toLowerCase()
    if (lower === excluded || seen.has(lower)) continue
    if (DENYLIST.some((bad) => lower.includes(bad))) continue
    seen.add(lower)
    clean.push(word)
    if (clean.length === count) break
  }
  if (clean.length < count) throw new Error('not enough valid distractors in generation')
  return clean
}
