/**
 * The tutor's voice. Built on the browser's own speech synthesis rather than
 * recorded audio: nothing to download, nothing to cache, and it keeps working
 * offline — the same bargain the sound effects make. A neural layer can sit
 * in front of this (see `./tts/NeuralSpeech.ts`); this module is always the
 * floor it falls back to, and the only thing that ever touches
 * `speechSynthesis` directly.
 *
 * Nothing here ever throws or blocks. A tablet with no Ukrainian voice
 * installed simply stays quiet; the lesson on screen is unchanged.
 */
import type { TtsLocale } from './tts/TtsProvider'
import { fetchNeuralAudio, isNeuralConfigured, playNeuralAudio, unlockAudioForGesture } from './tts/NeuralSpeech'

export type VoiceLang = 'uk' | 'en' | 'es'

/**
 * BCP-47 tags to look for, best first: an exact regional match always wins
 * over a same-language voice from a different region, however that other
 * voice happens to sound. Getting this order backwards is what let Spanish
 * quietly turn into Mexican or American Spanish — see `rankVoicesFor`.
 *
 * English keeps the app's existing preference (British before American)
 * unchanged; Ukrainian and Spanish are pinned to the exact locale asked for.
 */
const TAGS: Record<VoiceLang, string[]> = {
  uk: ['uk-UA', 'uk'],
  en: ['en-GB', 'en-US', 'en'],
  es: ['es-ES', 'es-MX', 'es-US', 'es'],
}

/**
 * The pace a language is comfortable at before any character or explicit
 * override touches it. English keeps the value the app always used — nothing
 * about it changes. Ukrainian and Spanish get their own, slightly slower
 * baseline instead of inheriting English's, which is what let a Ukrainian
 * line and an English one come out at the same speed regardless of language.
 */
const LANGUAGE_RATE: Record<VoiceLang, number> = {
  uk: 0.9,
  en: 0.95,
  es: 0.9,
}

/**
 * Most devices carry exactly one Ukrainian voice, so a list of system voices
 * alone is not a choice. Characters are the second half of it: the same voice
 * slowed down and dropped an octave is a bear, sped up and raised is a mouse.
 * Together they give a child something to pick.
 *
 * Rates here are relative to `NATURAL_RATE`, not absolute — `speak()` scales
 * them onto whichever language is actually talking.
 */
export interface VoiceCharacter {
  id: string
  pitch: number
  rate: number
}

/** What every `VoiceCharacter.rate` and `SpeakOptions.rate` is measured against. */
const NATURAL_RATE = 0.95

export const CHARACTERS: VoiceCharacter[] = [
  { id: 'natural', pitch: 1, rate: NATURAL_RATE },
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
/** The child's pick, kept separately per language — a voice chosen for
 *  Ukrainian must not follow the app when it switches to Spanish, and must
 *  still be there when it switches back. */
const choiceByLang: Partial<Record<VoiceLang, string>> = {}
let voices: SpeechSynthesisVoice[] = []

const synth = (): SpeechSynthesis | null =>
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null

/**
 * Voices arrive asynchronously in every browser and synchronously in none, so
 * the list is refreshed on the event and re-read on demand. iOS in particular
 * can report zero voices for a beat after the page loads, and again reports a
 * stale list until `voiceschanged` fires after installing a new voice pack in
 * Settings — the reason this is never trusted as a one-shot read.
 */
function refreshVoices() {
  const api = synth()
  if (!api) return
  try { voices = api.getVoices() } catch { voices = [] }
}

/**
 * Force a re-read right now, for a parent who just downloaded a better voice
 * in the device's own Settings and does not want to fully quit the app to see
 * it — `voiceschanged` normally covers this, but is not guaranteed to fire on
 * every platform for every kind of voice-list change.
 */
export function refreshVoicesNow() {
  refreshVoices()
}

let listenerAttached = false
function attachVoiceListener() {
  if (listenerAttached) return
  const api = synth()
  if (!api) return
  refreshVoices()
  api.addEventListener?.('voiceschanged', refreshVoices)
  listenerAttached = true
}
attachVoiceListener()

/**
 * iOS Safari has a known habit of leaving `speechSynthesis` in a stuck,
 * silently-paused state after a PWA is backgrounded and reopened — the queue
 * looks normal but nothing plays until something calls `resume()`. Cheap and
 * harmless to call when it was not actually needed, so it runs every time the
 * app comes back to the foreground rather than trying to detect the stuck
 * state first.
 */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      try { synth()?.resume() } catch { /* nothing to resume */ }
    }
  })
}

export function setVoiceEnabled(value: boolean) {
  enabled = value
  if (!value) stopSpeaking()
}

export function setVoiceLang(value: VoiceLang) {
  lang = value
}

/** Which of the options below the child picked for this language; unknown ids fall back. */
export function setVoiceChoice(forLang: VoiceLang, value: string | undefined) {
  if (value === undefined) delete choiceByLang[forLang]
  else choiceByLang[forLang] = value
}

/** Loads every language's remembered choice at once — settings coming back from disk. */
export function setVoiceChoices(map: Partial<Record<VoiceLang, string | undefined>>) {
  for (const key of Object.keys(map) as VoiceLang[]) setVoiceChoice(key, map[key])
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

/** The option in force: the stored choice for this language, or the best voice as it comes. */
export function currentVoiceOption(value: VoiceLang = lang): VoiceOption | undefined {
  const options = listVoiceOptions(value)
  const chosen = choiceByLang[value]
  return options.find((option) => option.id === chosen) ?? options[0]
}

/** Whether this device can actually say something in the chosen language. */
export function hasVoiceFor(value: VoiceLang): boolean {
  if (!synth()) return false
  if (voices.length === 0) refreshVoices()
  return rankedVoices(value).length > 0
}

/**
 * macOS ships a shelf of joke voices — Eddy, Grandma, Bad News, Zarvox — and
 * they sit in the list beside the real ones. Picking the first match by
 * language handed Spanish to "Eddy", which is a cartoon, not a tutor.
 */
const NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|eddy|flo|good news|grandma|grandpa|hysterical|jester|junior|kathy|organ|pipe organ|princess|ralph|reed|rocko|sandy|shelley|superstar|trinoids|whisper|wobble|zarvox)\b/i

/** The bare shape ranking needs — lets the logic below be tested without a real `SpeechSynthesisVoice`. */
export interface VoiceLike {
  name: string
  lang: string
  localService: boolean
  default: boolean
}

/** Higher is better, among voices that already match the same region. */
function qualityScore(voice: VoiceLike): number {
  let value = 0
  // Network voices (Google, Microsoft, Apple's cloud voices) are the
  // natural-sounding ones; a locally synthesised one is the compact fallback.
  if (!voice.localService) value += 6
  if (/premium|enhanced|neural|natural/i.test(voice.name)) value += 4
  if (voice.default) value += 1
  return value
}

/**
 * Every voice that speaks this language, best first — ranked region before
 * quality, not the other way around. A voice's *region* is decided first
 * (`uk-UA` beats generic `uk`; `es-ES` beats `es-MX` beats `es-US`), and only
 * once two voices are tied on region does how good either sounds break the
 * tie.
 *
 * The previous version scored region and quality into one number together,
 * so a nicer-sounding `es-MX` voice could outrank a plainer `es-ES` one —
 * exactly the "quietly becomes Mexican Spanish" failure this exists to rule
 * out. A locale match is a correctness requirement, not a preference to be
 * traded against audio quality.
 */
export function rankVoicesFor<T extends VoiceLike>(value: VoiceLang, pool: readonly T[]): T[] {
  const seen = new Set<string>()
  const serious: { voice: T; tier: number; quality: number }[] = []
  const novelty: T[] = []

  TAGS[value].forEach((tag, tier) => {
    for (const voice of pool) {
      if (!voice.lang.toLowerCase().startsWith(tag.toLowerCase())) continue
      if (seen.has(voice.name)) continue
      seen.add(voice.name)
      if (NOVELTY.test(voice.name)) novelty.push(voice)
      else serious.push({ voice, tier, quality: qualityScore(voice) })
    }
  })

  serious.sort((a, b) => a.tier - b.tier || b.quality - a.quality)
  return [...serious.map((entry) => entry.voice), ...novelty]
}

function rankedVoices(value: VoiceLang): SpeechSynthesisVoice[] {
  if (voices.length === 0) refreshVoices()
  return rankVoicesFor(value, voices)
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

/** Why `pickVoice` landed where it did — the diagnostics screen's reason column. */
export interface VoiceSelection {
  voice?: SpeechSynthesisVoice
  /** Which TAGS entry the picked voice matched, or 'none' when the device has nothing for this language at all. */
  tier: 'exact' | 'fallback-region' | 'generic' | 'none'
  candidateCount: number
}

export function describeVoiceSelection(value: VoiceLang): VoiceSelection {
  const ranked = rankedVoices(value)
  const voice = pickVoice(value)
  if (!voice) return { tier: 'none', candidateCount: ranked.length }

  const tags = TAGS[value]
  const matchedTier = tags.findIndex((tag) => voice.lang.toLowerCase().startsWith(tag.toLowerCase()))
  const tier = matchedTier <= 0 ? 'exact' : matchedTier === tags.length - 1 ? 'generic' : 'fallback-region'
  return { voice, tier, candidateCount: ranked.length }
}

/**
 * The utterance being spoken, held until it ends. A local variable is dropped
 * the moment speak() returns, and a browser that collects it mid-sentence cuts
 * the tutor off — or, on some Android builds, wedges the synthesizer for the
 * rest of the session, which no amount of tapping recovers from.
 */
let speaking: SpeechSynthesisUtterance | null = null
/** A speak() request waiting out the cancel/speak race below. */
let pendingTimer: number | null = null

export function stopSpeaking() {
  speaking = null
  if (pendingTimer !== null) {
    window.clearTimeout(pendingTimer)
    pendingTimer = null
  }
  try { synth()?.cancel() } catch { /* nothing to cancel */ }
}

/** A tablet put down mid-sentence should not leave the engine talking. */
if (typeof document !== 'undefined') {
  const quieten = () => { if (document.visibilityState === 'hidden') stopSpeaking() }
  document.addEventListener('visibilitychange', quieten)
  window.addEventListener('pagehide', stopSpeaking)
}

interface SpeakOptions {
  /** Say it in a language other than the chosen one — used for the praise mix. */
  lang?: VoiceLang
  /** Slower for instructions, normal for praise. Measured against NATURAL_RATE,
   *  same as a VoiceCharacter's own rate — 0.9 here means "90% of whichever
   *  character is speaking", not "90% of the language's own baseline". */
  rate?: number
  /** Try one option out without selecting it first. */
  option?: VoiceOption
}

/**
 * WebKit is known to drop an utterance outright when `speak()` follows
 * `cancel()` in the same tick — the new line simply never starts. Waiting one
 * short beat before the real `speak()` call sidesteps that, and doubles as
 * the fix for a fast double-tap: a second call arriving inside the wait
 * cancels the first timer rather than queuing behind it, so three quick taps
 * on the same word produce one clean utterance instead of three overlapping
 * ones.
 */
const SPEAK_SETTLE_MS = 60

/** Built once a voice is known to exist; shared by the tutor's shaped voice and the plain word-drill one below. */
function buildUtterance(text: string, value: VoiceLang, voice: SpeechSynthesisVoice | undefined, rate: number, pitch: number) {
  const utterance = new SpeechSynthesisUtterance(text)
  speaking = utterance
  const release = () => { if (speaking === utterance) speaking = null }
  utterance.onend = release
  utterance.onerror = release
  utterance.lang = voice?.lang ?? TAGS[value][0]
  if (voice) utterance.voice = voice
  utterance.rate = rate
  utterance.pitch = pitch
  utterance.volume = 1
  return utterance
}

function speakShaped(text: string, value: VoiceLang, options: SpeakOptions) {
  const speech = synth()
  if (!speech) return

  const ranked = rankedVoices(value)
  // True to the file's own promise: a language with no voice at all stays
  // quiet rather than letting the platform guess an unrelated one.
  if (ranked.length === 0) return

  const shape = options.option ?? currentVoiceOption(value)
  const voice = options.option
    ? ranked.find((candidate) => candidate.name === options.option?.voiceName)
    : (pickVoice(value) ?? ranked[0])

  // The character sets the shape relative to NATURAL_RATE; the language sets
  // the actual pace it is relative to. A bear stays proportionally slower
  // than natural in every language, but "natural" itself is now 0.9 for
  // Ukrainian and Spanish rather than borrowing English's 0.95.
  const characterFactor = (shape?.rate ?? NATURAL_RATE) / NATURAL_RATE
  const overrideFactor = options.rate ? options.rate / NATURAL_RATE : 1
  const rate = LANGUAGE_RATE[value] * characterFactor * overrideFactor

  try {
    speech.speak(buildUtterance(text, value, voice, rate, shape?.pitch ?? 1))
  } catch { /* a device that will not speak is not an error */ }
}

/**
 * The exact locale a neural request asks for — independent of whatever the
 * system happens to have installed, and always the region actually wanted:
 * Ukraine, Spain, and English kept at the app's own existing preference.
 */
const NEURAL_LOCALE: Record<VoiceLang, TtsLocale> = {
  uk: 'uk-UA',
  es: 'es-ES',
  en: TAGS.en[0],
}

/**
 * Neural first, system voice as the offline/unconfigured/failed fallback —
 * and always exactly one of the two, never both. A cloud clip that arrives
 * after the system voice has already started would be a second voice
 * talking over the first; the system path only ever runs once neural has
 * been given its chance and has not come back with anything.
 */
async function speakHybrid(text: string, value: VoiceLang, systemFallback: () => void) {
  if (isNeuralConfigured()) {
    const blob = await fetchNeuralAudio({ text, locale: NEURAL_LOCALE[value] }).catch(() => null)
    if (blob) {
      try {
        await playNeuralAudio(blob)
        return
      } catch {
        // Autoplay refused, decoding failed, whatever — the lesson still
        // gets a voice, just the local one.
      }
    }
  }
  systemFallback()
}

function queueSpeak(text: string, value: VoiceLang, systemFallback: () => void) {
  if (pendingTimer !== null) window.clearTimeout(pendingTimer)
  try { synth()?.cancel() } catch { /* nothing queued yet */ }

  pendingTimer = window.setTimeout(() => {
    pendingTimer = null
    void speakHybrid(text, value, systemFallback)
  }, SPEAK_SETTLE_MS)
}

/**
 * Say one short line. A second call cuts the first off: a four-year-old who
 * taps Next twice should hear the new step, not a queue of old ones.
 */
export function speak(text: string, options: SpeakOptions = {}) {
  if (!enabled || !text) return
  const value = options.lang ?? lang
  if (isNeuralConfigured()) unlockAudioForGesture()
  queueSpeak(text, value, () => speakShaped(text, value, options))
}

/**
 * The same voice-selection this file already does for the tutor, without the
 * tutor's mascot shaping — flat pitch, an explicit rate rather than a
 * character's — for the games where hearing the word said aloud is the whole
 * exercise rather than optional narration: "Listen and spell", the odd word
 * out by ear, clapping out syllables. Those must speak on their own schedule
 * regardless of whether the tutor's voice is switched on, the same way they
 * always have; what changes is that they now ask for the best locale-correct
 * voice this file already knows how to find, instead of building a bare
 * utterance and letting the platform hand back whatever it defaults to for
 * that language.
 */
export function speakWord(text: string, value: VoiceLang, rate = LANGUAGE_RATE[value]) {
  if (!text) return
  if (isNeuralConfigured()) unlockAudioForGesture()
  queueSpeak(text, value, () => {
    const speech = synth()
    if (!speech) return
    const voice = pickVoice(value)
    if (!voice && rankedVoices(value).length === 0) return
    try {
      speech.speak(buildUtterance(text, value, voice, rate, 1))
    } catch { /* a device that will not speak is not an error */ }
  })
}

/**
 * Several short words read out one after another — the odd-word-out game
 * needs all four spoken before the child can pick. Cancelling once up front
 * and then handing the queue several utterances in a row is exactly what the
 * native engine's own queue is for; cancelling between each one would only
 * ever let the last word through. System voice only, even with a neural
 * backend configured: four separate network fetches, timed to play back to
 * back without a gap, is not a problem worth solving for one small game.
 */
export function speakSequence(words: readonly string[], value: VoiceLang, rate = LANGUAGE_RATE[value]) {
  const list = words.filter(Boolean)
  if (list.length === 0) return
  if (pendingTimer !== null) window.clearTimeout(pendingTimer)
  try { synth()?.cancel() } catch { /* nothing queued yet */ }

  pendingTimer = window.setTimeout(() => {
    pendingTimer = null
    const speech = synth()
    if (!speech) return
    const voice = pickVoice(value)
    if (!voice && rankedVoices(value).length === 0) return
    try {
      for (const word of list) speech.speak(buildUtterance(word, value, voice, rate, 1))
    } catch { /* a device that will not speak is not an error */ }
  }, SPEAK_SETTLE_MS)
}
