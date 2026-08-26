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

function pickVoice(value: VoiceLang): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) refreshVoices()
  for (const tag of TAGS[value]) {
    const match = voices.find((voice) => voice.lang.toLowerCase().startsWith(tag.toLowerCase()))
    if (match) return match
  }
  return undefined
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
    // A shade above neutral reads as friendly rather than official.
    utterance.pitch = 1.08
    utterance.volume = 1
    speech.speak(utterance)
  } catch { /* a device that will not speak is not an error */ }
}
