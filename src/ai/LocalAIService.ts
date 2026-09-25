/**
 * Provider-agnostic surface every game talks to. Games (and the parent-mode
 * settings screen) import only this interface plus `useLocalAI()` — never a
 * concrete provider or anything from `@huggingface/transformers` directly, so
 * swapping the runtime or model later touches one file (`TransformersJsProvider.ts`).
 *
 * `NoopProvider` implements this identically but never downloads or runs
 * anything; it is what every game gets when AI is unsupported, not yet
 * downloaded, or has failed. No game may depend on AI to function — every
 * method here backs a feature that already has a deterministic path.
 */

export type LocalAIStatus = 'unavailable' | 'idle' | 'loading' | 'ready' | 'error'

export interface DistractorRequest {
  /** The correct answer, so it's never accidentally repeated as a distractor. */
  correctAnswer: string
  /** What kind of thing to invent, e.g. "animal", "fruit", "color". */
  category: string
  count: number
}

export interface HintRequest {
  /** What the child is stuck on, in plain words, e.g. "the word CAT". */
  context: string
}

export interface VariationRequest {
  /** A short instruction for what kind of line to produce. */
  prompt: string
}

export interface GeneratedText {
  text: string
}

export interface DrawingPromptRequest {
  /** Optional theme to steer toward, e.g. "animals". Omit for anything. */
  theme?: string
  /** Language to write the idea in. Defaults to English. */
  language?: 'uk' | 'en'
}

export interface DrawingPrompt {
  text: string
}

export interface StoryRequest {
  topic: string
}

export interface LocalAIService {
  readonly status: LocalAIStatus
  isSupported(): boolean
  load(onProgress?: (pct: number) => void): Promise<boolean>
  unload(): void
  abort(): void
  generateDistractors(req: DistractorRequest): Promise<string[]>
  generateHint(req: HintRequest): Promise<string>
  generateVariation(req: VariationRequest): Promise<GeneratedText>
  generateDrawingPrompt(req: DrawingPromptRequest): Promise<DrawingPrompt>
  generateStory(req: StoryRequest): Promise<string>
}
