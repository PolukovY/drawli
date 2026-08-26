/**
 * The tutor's voice. Built on the browser's own speech synthesis rather than
 * recorded audio: nothing to download, nothing to cache, and it keeps working
 * offline — the same bargain the sound effects make.
 *
 * Nothing here ever throws or blocks. A tablet with no Ukrainian voice
 * installed simply stays quiet; the lesson on screen is unchanged.
 */
export type VoiceLang = 'uk' | 'en' | 'es'

/** BCP-47 tags to look for, best first: a regional voice beats a generic one. */
const TAGS: Record<VoiceLang, string[]> = {
  uk: ['uk-UA', 'uk'],
  en: ['en-GB', 'en-US', 'en'],
  es: ['es-ES', 'es-MX', 'es'],
}

let enabled = false
let lang: VoiceLang = 'uk'
let voices: SpeechSynthesisVoice[] = []

const synth = (): SpeechSynthesis | null =>
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null

/**
 * Voices arrive asynchronously in every browser and synchronously in none, so
 * the list is refreshed on the event and re-read on every utterance.
 */
function refreshVoices() {
  const api = synth()
  if (!api) return
  try { voices = api.getVoices() } catch { voices = [] }
}

const api = synth()
if (api) {
  refreshVoices()
  api.addEventListener?.('voiceschanged', refreshVoices)
}

export function setVoiceEnabled(value: boolean) {
  enabled = value
  if (!value) stopSpeaking()
}

export function setVoiceLang(value: VoiceLang) {
  lang = value
}

/** Whether this device can actually say something in the chosen language. */
export function hasVoiceFor(value: VoiceLang): boolean {
  if (!synth()) return false
  if (voices.length === 0) refreshVoices()
  return voices.some((voice) => TAGS[value].some((tag) => voice.lang.toLowerCase().startsWith(tag.toLowerCase())))
}

/**
 * macOS ships a shelf of joke voices — Eddy, Grandma, Bad News, Zarvox — and
 * they sit in the list beside the real ones. Picking the first match by
 * language handed Spanish to "Eddy", which is a cartoon, not a tutor.
 */
const NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|eddy|flo|good news|grandma|grandpa|hysterical|jester|junior|kathy|organ|pipe organ|princess|ralph|reed|rocko|sandy|shelley|superstar|trinoids|whisper|wobble|zarvox)\b/i

/** Higher is better: network voices first, then anything marked premium. */
function score(voice: SpeechSynthesisVoice, tag: string): number {
  let value = 0
  // Network voices (Google, Microsoft) are the natural-sounding ones.
  if (!voice.localService) value += 6
  if (/premium|enhanced|neural|natural/i.test(voice.name)) value += 4
  if (voice.lang.toLowerCase() === tag.toLowerCase()) value += 2
  if (voice.default) value += 1
  return value
}

function pickVoice(value: VoiceLang): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) refreshVoices()

  for (const tag of TAGS[value]) {
    const candidates = voices.filter(
      (voice) => voice.lang.toLowerCase().startsWith(tag.toLowerCase()) && !NOVELTY.test(voice.name),
    )
    if (candidates.length === 0) continue
    return candidates.reduce((best, voice) => (score(voice, tag) > score(best, tag) ? voice : best))
  }

  // Every voice for this language is a joke voice: better a cartoon than
  // silence, since the words themselves are still the lesson.
  for (const tag of TAGS[value]) {
    const fallback = voices.find((voice) => voice.lang.toLowerCase().startsWith(tag.toLowerCase()))
    if (fallback) return fallback
  }
  return undefined
}

/**
 * How good the best available voice is. Ukrainian on most devices has only a
 * compact system voice, which sounds flat next to the network ones English and
 * Spanish get — worth telling a parent, since the device can download better.
 */
export function voiceQuality(value: VoiceLang): 'none' | 'basic' | 'good' {
  const voice = pickVoice(value)
  if (!voice) return 'none'
  if (!voice.localService || /premium|enhanced|neural|natural/i.test(voice.name)) return 'good'
  return 'basic'
}

export function stopSpeaking() {
  try { synth()?.cancel() } catch { /* nothing to cancel */ }
}

interface SpeakOptions {
  /** Say it in a language other than the chosen one — used for the praise mix. */
  lang?: VoiceLang
  /** Slower for instructions, normal for praise. */
  rate?: number
}

/**
 * Say one short line. A second call cuts the first off: a four-year-old who
 * taps Next twice should hear the new step, not a queue of old ones.
 */
export function speak(text: string, options: SpeakOptions = {}) {
  const speech = synth()
  if (!enabled || !speech || !text) return

  const value = options.lang ?? lang
  const voice = pickVoice(value)

  try {
    speech.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voice?.lang ?? TAGS[value][0]
    if (voice) utterance.voice = voice
    utterance.rate = options.rate ?? 0.95
    // Left at neutral on purpose: raising the pitch made the compact system
    // voices — the only ones Ukrainian has on most devices — sound tinny.
    utterance.pitch = 1
    utterance.volume = 1
    speech.speak(utterance)
  } catch { /* a device that will not speak is not an error */ }
}
