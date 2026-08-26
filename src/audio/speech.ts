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

/**
 * Most devices carry exactly one Ukrainian voice, so a list of system voices
 * alone is not a choice. Characters are the second half of it: the same voice
 * slowed down and dropped an octave is a bear, sped up and raised is a mouse.
 * Together they give a child something to pick.
 */
export interface VoiceCharacter {
  id: string
  pitch: number
  rate: number
}

export const CHARACTERS: VoiceCharacter[] = [
  { id: 'natural', pitch: 1, rate: 0.95 },
  { id: 'merry', pitch: 1.3, rate: 1.05 },
  { id: 'bear', pitch: 0.7, rate: 0.82 },
  { id: 'mouse', pitch: 1.6, rate: 1.12 },
  { id: 'storyteller', pitch: 1.05, rate: 0.78 },
  { id: 'calm', pitch: 0.9, rate: 0.88 },
  { id: 'robot', pitch: 0.6, rate: 1 },
]

export interface VoiceOption {
  /** Stored in settings: the system voice and the character it is shaped by. */
  id: string
  voiceName: string
  characterId: string
  pitch: number
  rate: number
}

let enabled = false
let lang: VoiceLang = 'uk'
let choiceId: string | undefined
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

/** Which of the options below the child picked; unknown ids fall back. */
export function setVoiceChoice(value: string | undefined) {
  choiceId = value
}

const optionId = (voiceName: string, characterId: string) => `${voiceName}#${characterId}`

/**
 * Up to ten voices to choose from: every system voice for the language on its
 * own, then the best one wearing the other characters.
 */
export function listVoiceOptions(value: VoiceLang, limit = 10): VoiceOption[] {
  const ranked = rankedVoices(value)
  if (ranked.length === 0) return []

  const natural = CHARACTERS[0]
  const options: VoiceOption[] = ranked.slice(0, 4).map((voice) => ({
    id: optionId(voice.name, natural.id),
    voiceName: voice.name,
    characterId: natural.id,
    pitch: natural.pitch,
    rate: natural.rate,
  }))

  const best = ranked[0]
  for (const character of CHARACTERS.slice(1)) {
    if (options.length >= limit) break
    options.push({
      id: optionId(best.name, character.id),
      voiceName: best.name,
      characterId: character.id,
      pitch: character.pitch,
      rate: character.rate,
    })
  }

  return options.slice(0, limit)
}

/** The option in force: the stored choice, or the best voice as it comes. */
export function currentVoiceOption(value: VoiceLang = lang): VoiceOption | undefined {
  const options = listVoiceOptions(value)
  return options.find((option) => option.id === choiceId) ?? options[0]
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

/** Every voice that speaks this language, best first, joke voices last. */
function rankedVoices(value: VoiceLang): SpeechSynthesisVoice[] {
  if (voices.length === 0) refreshVoices()

  const seen = new Set<string>()
  const serious: { voice: SpeechSynthesisVoice; rank: number }[] = []
  const novelty: SpeechSynthesisVoice[] = []

  TAGS[value].forEach((tag, tagIndex) => {
    for (const voice of voices) {
      if (!voice.lang.toLowerCase().startsWith(tag.toLowerCase())) continue
      if (seen.has(voice.name)) continue
      seen.add(voice.name)
      // Earlier tags are the preferred regions, so they win ties.
      if (NOVELTY.test(voice.name)) novelty.push(voice)
      else serious.push({ voice, rank: score(voice, tag) - tagIndex })
    }
  })

  return [...serious.sort((a, b) => b.rank - a.rank).map((entry) => entry.voice), ...novelty]
}

function pickVoice(value: VoiceLang): SpeechSynthesisVoice | undefined {
  const chosen = currentVoiceOption(value)
  const ranked = rankedVoices(value)
  return ranked.find((voice) => voice.name === chosen?.voiceName) ?? ranked[0]
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
  /** Try one option out without selecting it first. */
  option?: VoiceOption
}

/**
 * Say one short line. A second call cuts the first off: a four-year-old who
 * taps Next twice should hear the new step, not a queue of old ones.
 */
export function speak(text: string, options: SpeakOptions = {}) {
  const speech = synth()
  if (!enabled || !speech || !text) return

  const value = options.lang ?? lang
  const shape = options.option ?? currentVoiceOption(value)
  const voice = options.option
    ? rankedVoices(value).find((candidate) => candidate.name === options.option?.voiceName)
    : pickVoice(value)

  try {
    speech.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voice?.lang ?? TAGS[value][0]
    if (voice) utterance.voice = voice
    // The character sets the shape; an explicit rate (a slower instruction)
    // scales it rather than replacing it, so a bear stays a slow bear.
    const baseRate = shape?.rate ?? 0.95
    utterance.rate = options.rate ? baseRate * (options.rate / 0.95) : baseRate
    utterance.pitch = shape?.pitch ?? 1
    utterance.volume = 1
    speech.speak(utterance)
  } catch { /* a device that will not speak is not an error */ }
}
