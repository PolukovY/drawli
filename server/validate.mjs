/**
 * Everything the /api/speak endpoint refuses before it ever asks a paid
 * provider to generate anything. This app speaks single words and short
 * phrases to a small child, never a paragraph — a request that does not fit
 * that shape is refused, not truncated, so nothing surprising ever gets
 * generated and billed for.
 */

export const MAX_TEXT_LENGTH = 200
export const ALLOWED_LOCALES = new Set(['uk-UA', 'es-ES', 'en-GB', 'en-US'])
export const ALLOWED_STYLES = new Set(['child-friendly', 'neutral', 'educational'])
export const MIN_SPEED = 0.5
export const MAX_SPEED = 1.5

/** @returns {string | null} the problem, or null if the request is well-formed. */
export function validateSpeakRequest(body) {
  if (typeof body !== 'object' || body === null) return 'request body must be a JSON object'

  const { text, locale, voice, speed, style } = body

  if (typeof text !== 'string' || text.trim().length === 0) return 'text is required'
  if (text.length > MAX_TEXT_LENGTH) return `text must be ${MAX_TEXT_LENGTH} characters or fewer`
  // A crude but effective guard: this endpoint speaks words and short
  // sentences, never markup or code that a provider should never execute.
  if (/[<>{}]/.test(text)) return 'text contains characters this endpoint does not accept'

  if (typeof locale !== 'string' || !ALLOWED_LOCALES.has(locale)) {
    return `locale must be one of: ${[...ALLOWED_LOCALES].join(', ')}`
  }

  if (voice !== undefined && (typeof voice !== 'string' || voice.length > 100)) {
    return 'voice must be a short string'
  }

  if (speed !== undefined) {
    if (typeof speed !== 'number' || Number.isNaN(speed) || speed < MIN_SPEED || speed > MAX_SPEED) {
      return `speed must be a number between ${MIN_SPEED} and ${MAX_SPEED}`
    }
  }

  if (style !== undefined && !ALLOWED_STYLES.has(style)) {
    return `style must be one of: ${[...ALLOWED_STYLES].join(', ')}`
  }

  return null
}
