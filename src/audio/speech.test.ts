import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rankVoicesFor, type VoiceLike } from './speech'

/**
 * These prove the actual bug this file was rewritten to fix: a same-language
 * voice from the wrong region must never outrank the right one just because
 * it happens to sound better, and a language with no voice installed must
 * stay silent rather than let the platform guess.
 */
describe('rankVoicesFor: locale correctness', () => {
  const v = (overrides: Partial<VoiceLike>): VoiceLike => ({
    name: 'voice', lang: 'en-US', localService: true, default: false, ...overrides,
  })

  it('picks es-ES over a better-sounding es-MX or es-US voice', () => {
    const pool = [
      v({ name: 'Paulina (Enhanced)', lang: 'es-MX', localService: false }), // network + premium name
      v({ name: 'Juan (Enhanced)', lang: 'es-US', localService: false }),
      v({ name: 'Mónica', lang: 'es-ES', localService: true }), // plain compact voice
    ]
    const ranked = rankVoicesFor('es', pool)
    expect(ranked[0].lang).toBe('es-ES')
    expect(ranked[0].name).toBe('Mónica')
  })

  it('still prefers the better-quality voice once two candidates share a region', () => {
    const pool = [
      v({ name: 'Mónica', lang: 'es-ES', localService: true }),
      v({ name: 'Mónica (Enhanced)', lang: 'es-ES', localService: false }),
    ]
    const ranked = rankVoicesFor('es', pool)
    expect(ranked[0].name).toBe('Mónica (Enhanced)')
  })

  it('orders es-ES, then es-MX, then es-US, then generic es, each its own tier', () => {
    const pool = [
      v({ name: 'generic', lang: 'es' }),
      v({ name: 'us', lang: 'es-US' }),
      v({ name: 'mx', lang: 'es-MX' }),
      v({ name: 'es', lang: 'es-ES' }),
    ]
    expect(rankVoicesFor('es', pool).map((x) => x.name)).toEqual(['es', 'mx', 'us', 'generic'])
  })

  it('can never hand Ukrainian text a Russian voice, structurally', () => {
    const pool = [
      v({ name: 'Milena', lang: 'ru-RU', localService: false }), // would win on quality alone
      v({ name: 'Lesya', lang: 'uk-UA', localService: true }),
    ]
    const ranked = rankVoicesFor('uk', pool)
    expect(ranked).toHaveLength(1)
    expect(ranked[0].lang).toBe('uk-UA')
    expect(ranked.some((voice) => voice.lang.startsWith('ru'))).toBe(false)
  })

  it('returns nothing for a language the device has no voice for at all', () => {
    const pool = [v({ name: 'only-english', lang: 'en-US' })]
    expect(rankVoicesFor('uk', pool)).toEqual([])
  })

  it('keeps joke voices out of the way unless nothing else matches', () => {
    const pool = [
      v({ name: 'Eddy', lang: 'es-ES' }),
      v({ name: 'Mónica', lang: 'es-ES' }),
    ]
    const ranked = rankVoicesFor('es', pool)
    expect(ranked[0].name).toBe('Mónica')
    expect(ranked.at(-1)?.name).toBe('Eddy')

    // But a joke voice is still better than total silence if it is literally
    // the only thing installed for the language.
    expect(rankVoicesFor('es', [v({ name: 'Eddy', lang: 'es-ES' })])).toHaveLength(1)
  })

  it('keeps the app’s existing British-before-American order for English', () => {
    const pool = [v({ name: 'us', lang: 'en-US' }), v({ name: 'gb', lang: 'en-GB' })]
    expect(rankVoicesFor('en', pool).map((x) => x.name)).toEqual(['gb', 'us'])
  })
})

/**
 * The rest of the module talks to `speechSynthesis` directly, so these mock
 * just enough of the Web Speech API to drive it — jsdom does not implement
 * it at all. Every test re-imports the module fresh (`vi.resetModules`)
 * because its voice list, enabled flag and per-language choices are
 * deliberately module-level state, the same as the real singleton the app
 * shares across every screen.
 */
class FakeUtterance {
  text: string
  lang = ''
  voice: SpeechSynthesisVoice | null = null
  rate = 1
  pitch = 1
  volume = 1
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) { this.text = text }
}

function makeVoice(overrides: Partial<VoiceLike>): SpeechSynthesisVoice {
  return { name: 'voice', lang: 'en-US', localService: true, default: false, voiceURI: 'voice', ...overrides } as SpeechSynthesisVoice
}

function installFakeSpeechApi(voices: SpeechSynthesisVoice[]) {
  const spoken: FakeUtterance[] = []
  const fakeSynth = {
    getVoices: () => voices,
    speak: (u: FakeUtterance) => spoken.push(u),
    cancel: vi.fn(),
    resume: vi.fn(),
    speaking: false,
    pending: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  Object.defineProperty(window, 'speechSynthesis', { value: fakeSynth, configurable: true, writable: true })
  return { fakeSynth, spoken }
}

describe('speak() / speakWord()', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('says nothing for a language with no matching voice, rather than guessing one', async () => {
    const { spoken } = installFakeSpeechApi([makeVoice({ name: 'en', lang: 'en-US' })])
    const speech = await import('./speech')
    speech.setVoiceEnabled(true)
    speech.speakWord('привіт', 'uk')
    await vi.runAllTimersAsync()
    expect(spoken).toHaveLength(0)
  })

  it('picks the exact-locale voice and applies the language’s own rate', async () => {
    const { spoken } = installFakeSpeechApi([
      makeVoice({ name: 'uk', lang: 'uk-UA' }),
      makeVoice({ name: 'en', lang: 'en-US', default: true }),
    ])
    const speech = await import('./speech')
    speech.setVoiceEnabled(true)
    speech.speak('привіт', { lang: 'uk' })
    await vi.runAllTimersAsync()

    expect(spoken).toHaveLength(1)
    expect(spoken[0].voice?.lang).toBe('uk-UA')
    expect(spoken[0].rate).toBeCloseTo(0.9, 5) // the language's own baseline, not English's 0.95
  })

  it('leaves English exactly as it always sounded: rate 0.95 untouched, and an explicit override behaves the same as before', async () => {
    const { spoken } = installFakeSpeechApi([makeVoice({ name: 'en', lang: 'en-US' })])
    const speech = await import('./speech')
    speech.setVoiceEnabled(true)
    speech.setVoiceLang('en')

    speech.speak('hello')
    await vi.runAllTimersAsync()
    expect(spoken[0].rate).toBeCloseTo(0.95, 5)

    speech.speak('slow down please', { rate: 0.9 })
    await vi.runAllTimersAsync()
    expect(spoken[1].rate).toBeCloseTo(0.9, 5) // same formula as before the rewrite
  })

  it('debounces rapid repeats into a single utterance carrying only the last text', async () => {
    const { fakeSynth, spoken } = installFakeSpeechApi([makeVoice({ name: 'uk', lang: 'uk-UA' })])
    const speech = await import('./speech')
    speech.setVoiceEnabled(true)

    speech.speakWord('один', 'uk')
    speech.speakWord('два', 'uk')
    speech.speakWord('три', 'uk')
    await vi.runAllTimersAsync()

    expect(spoken).toHaveLength(1)
    expect(spoken[0].text).toBe('три')
    expect(fakeSynth.cancel).toHaveBeenCalled()
  })

  it('a fresh tap after one finishes still speaks (not stuck off after the first debounce)', async () => {
    const { spoken } = installFakeSpeechApi([makeVoice({ name: 'uk', lang: 'uk-UA' })])
    const speech = await import('./speech')
    speech.setVoiceEnabled(true)

    speech.speakWord('раз', 'uk')
    await vi.runAllTimersAsync()
    speech.speakWord('два', 'uk')
    await vi.runAllTimersAsync()

    expect(spoken.map((u) => u.text)).toEqual(['раз', 'два'])
  })

  it('says every word in a sequence, in order, for the odd-word-out game', async () => {
    const { spoken } = installFakeSpeechApi([makeVoice({ name: 'uk', lang: 'uk-UA' })])
    const speech = await import('./speech')
    speech.speakSequence(['кіт', 'пес', 'миша', 'слон'], 'uk')
    await vi.runAllTimersAsync()
    expect(spoken.map((u) => u.text)).toEqual(['кіт', 'пес', 'миша', 'слон'])
  })

  it('keeps a voice choice for each language independently', async () => {
    installFakeSpeechApi([
      makeVoice({ name: 'uk-a', lang: 'uk-UA' }),
      makeVoice({ name: 'uk-b', lang: 'uk-UA' }),
      makeVoice({ name: 'es-a', lang: 'es-ES' }),
      makeVoice({ name: 'es-b', lang: 'es-ES' }),
    ])
    const speech = await import('./speech')

    const ukOptions = speech.listVoiceOptions('uk')
    const esOptions = speech.listVoiceOptions('es')
    speech.setVoiceChoice('uk', ukOptions[1].id)
    speech.setVoiceChoice('es', esOptions[1].id)

    expect(speech.currentVoiceOption('uk')?.id).toBe(ukOptions[1].id)
    expect(speech.currentVoiceOption('es')?.id).toBe(esOptions[1].id)

    // Switching the app's active language never overwrites the other one.
    speech.setVoiceLang('es')
    expect(speech.currentVoiceOption('uk')?.id).toBe(ukOptions[1].id)
  })

  it('stopSpeaking cancels a request still waiting out its debounce', async () => {
    const { fakeSynth, spoken } = installFakeSpeechApi([makeVoice({ name: 'uk', lang: 'uk-UA' })])
    const speech = await import('./speech')
    speech.setVoiceEnabled(true)

    speech.speakWord('привіт', 'uk')
    speech.stopSpeaking()
    await vi.runAllTimersAsync()

    expect(spoken).toHaveLength(0)
    expect(fakeSynth.cancel).toHaveBeenCalled()
  })

  it('never speaks while the tutor voice is turned off', async () => {
    const { spoken } = installFakeSpeechApi([makeVoice({ name: 'uk', lang: 'uk-UA' })])
    const speech = await import('./speech')
    speech.setVoiceEnabled(false)
    speech.speak('привіт', { lang: 'uk' })
    await vi.runAllTimersAsync()
    expect(spoken).toHaveLength(0)
  })
})
