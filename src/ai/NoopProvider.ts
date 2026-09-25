import type {
  DistractorRequest,
  DrawingPrompt,
  DrawingPromptRequest,
  GeneratedText,
  HintRequest,
  LocalAIService,
  StoryRequest,
  VariationRequest,
} from './LocalAIService'

/**
 * Always-available, never-downloads-anything implementation. Every method
 * rejects, so callers hit their existing deterministic fallback exactly as
 * if `LocalAIService` never existed. `useLocalAI()` returns this whenever
 * `isSupported()` is false, before `load()` is ever called, or after a real
 * provider errors out.
 */
export class NoopProvider implements LocalAIService {
  readonly status = 'unavailable' as const

  isSupported(): boolean {
    return false
  }

  async load(): Promise<boolean> {
    return false
  }

  unload(): void {}

  abort(): void {}

  async generateDistractors(_req: DistractorRequest): Promise<string[]> {
    throw new Error('local AI unavailable')
  }

  async generateHint(_req: HintRequest): Promise<string> {
    throw new Error('local AI unavailable')
  }

  async generateVariation(_req: VariationRequest): Promise<GeneratedText> {
    throw new Error('local AI unavailable')
  }

  async generateDrawingPrompt(_req: DrawingPromptRequest): Promise<DrawingPrompt> {
    throw new Error('local AI unavailable')
  }

  async generateStory(_req: StoryRequest): Promise<string> {
    throw new Error('local AI unavailable')
  }
}
