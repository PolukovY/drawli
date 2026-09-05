/**
 * What any cloud voice — ElevenLabs, Azure Neural, Google Cloud TTS, OpenAI,
 * whatever sounds best for Ukrainian and Spain-Spanish once someone has
 * actually listened to the candidates — plugs into. Nothing else in this app
 * talks to a specific vendor's SDK or REST shape directly; everything goes
 * through this one interface, so swapping a provider is writing one new file
 * that implements it, not a rewrite.
 *
 * Used server-side only. The frontend never imports a concrete provider or
 * holds an API key — see `src/audio/tts/NeuralSpeech.ts` for what it does
 * instead (calls this app's own backend endpoint, which is the one thing
 * that is allowed to know a key).
 */
export type TtsLocale = 'uk-UA' | 'es-ES' | 'en-GB' | 'en-US' | string

export type TtsStyle = 'child-friendly' | 'neutral' | 'educational'

export interface TtsRequest {
  text: string
  locale: TtsLocale
  /** Provider-specific voice id; omitted lets the provider pick its default for the locale. */
  voice?: string
  /** Roughly 1.0 = the provider's own natural pace. */
  speed?: number
  style?: TtsStyle
}

export interface TtsResult {
  audio: ArrayBuffer
  contentType: string
}

export interface TtsProvider {
  /** A short id used in logs and cache keys — never the vendor's API key. */
  readonly id: string
  synthesize(request: TtsRequest): Promise<TtsResult>
}
