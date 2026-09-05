/**
 * The server's own copy of `src/audio/tts/TtsProvider.ts`. Duplicated
 * deliberately: this package is a separate deployable and should not need
 * the main app's `src/` tree available at deploy time for a five-field
 * interface. Keep the two in sync by hand if either ever changes.
 */
export interface TtsRequest {
  text: string
  locale: string
  voice?: string
  speed?: number
  style?: 'child-friendly' | 'neutral' | 'educational'
}

export interface TtsResult {
  audio: ArrayBuffer
  contentType: string
}

export interface TtsProvider {
  readonly id: string
  synthesize(request: TtsRequest): Promise<TtsResult>
}
