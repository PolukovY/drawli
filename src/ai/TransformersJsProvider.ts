import type {
  DistractorRequest,
  DrawingPrompt,
  DrawingPromptRequest,
  GeneratedText,
  HintRequest,
  LocalAIService,
  LocalAIStatus,
  StoryRequest,
  VariationRequest,
} from './LocalAIService'
import { DEFAULT_MAX_NEW_TOKENS } from './model'
import { parseDistractorArray, sanitizeShortText } from './textSafety'
import type { ChatMessage, WorkerEvent } from './workerProtocol'

interface Pending {
  resolve: (text: string) => void
  reject: (error: Error) => void
}

/**
 * Runs Transformers.js inside a dedicated Web Worker (its own recommended
 * pattern) so a multi-second generation never freezes the UI thread. Talks to
 * it over the small typed protocol in `workerProtocol.ts`. One provider =
 * one worker = one model in memory; `unload()` frees it.
 */
export class TransformersJsProvider implements LocalAIService {
  status: LocalAIStatus = 'idle'

  private worker: Worker | null = null
  private nextId = 1
  private pending = new Map<number, Pending>()
  private loadPromise: Promise<boolean> | null = null
  private onLoadProgress?: (pct: number) => void
  private onLoadSettled?: (ok: boolean) => void

  isSupported(): boolean {
    return typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined'
  }

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./aiWorker.ts', import.meta.url), { type: 'module' })
      this.worker.onmessage = (event: MessageEvent<WorkerEvent>) => { this.handleEvent(event.data) }
      // A worker-level failure (e.g. the module itself failed to evaluate)
      // never reaches onmessage — without this, a pending load()/generateText()
      // promise would simply hang forever instead of rejecting cleanly.
      this.worker.onerror = (event: ErrorEvent) => {
        this.handleEvent({ type: 'error', message: event.message || 'worker error' })
      }
    }
    return this.worker
  }

  private handleEvent(event: WorkerEvent): void {
    switch (event.type) {
      case 'progress':
        this.onLoadProgress?.(event.pct)
        return
      case 'ready':
        this.status = 'ready'
        this.onLoadSettled?.(true)
        return
      case 'result': {
        const entry = this.pending.get(event.id)
        if (!entry) return
        this.pending.delete(event.id)
        entry.resolve(event.text)
        return
      }
      case 'error': {
        if (event.id !== undefined) {
          const entry = this.pending.get(event.id)
          if (entry) {
            this.pending.delete(event.id)
            entry.reject(new Error(event.message))
          }
          return
        }
        this.status = 'error'
        console.error('[LocalAI] model load failed:', event.message)
        this.onLoadSettled?.(false)
        return
      }
    }
  }

  async load(onProgress?: (pct: number) => void): Promise<boolean> {
    if (this.status === 'ready') return true
    if (!this.isSupported()) {
      this.status = 'unavailable'
      return false
    }
    if (this.loadPromise) return this.loadPromise

    this.status = 'loading'
    this.onLoadProgress = onProgress
    const worker = this.ensureWorker()
    this.loadPromise = new Promise<boolean>((resolve) => {
      this.onLoadSettled = (ok) => {
        this.loadPromise = null
        resolve(ok)
      }
      worker.postMessage({ type: 'load' })
    })
    return this.loadPromise
  }

  unload(): void {
    this.worker?.postMessage({ type: 'unload' })
    this.worker?.terminate()
    this.worker = null
    this.status = 'idle'
    for (const entry of this.pending.values()) entry.reject(new Error('local AI unloaded'))
    this.pending.clear()
  }

  abort(): void {
    const worker = this.worker
    for (const id of this.pending.keys()) {
      worker?.postMessage({ type: 'abort', id })
    }
    this.pending.clear()
  }

  private generateText(messages: ChatMessage[], maxNewTokens = DEFAULT_MAX_NEW_TOKENS): Promise<string> {
    if (this.status !== 'ready') return Promise.reject(new Error('local AI not ready'))
    const worker = this.ensureWorker()
    const id = this.nextId++
    return new Promise<string>((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      worker.postMessage({ type: 'generate', id, messages, maxNewTokens })
    })
  }

  async generateDrawingPrompt(req: DrawingPromptRequest): Promise<DrawingPrompt> {
    const languageName = req.language === 'uk' ? 'Ukrainian' : 'English'
    const text = await this.generateText([
      {
        role: 'system',
        content: `You suggest one simple, safe, one-sentence drawing idea for a young child learning to draw. Reply in ${languageName}, with only the idea itself, under 12 words, no preamble.`,
      },
      { role: 'user', content: req.theme ? `Give a drawing idea about ${req.theme}.` : 'Give a drawing idea.' },
    ])
    return { text: sanitizeShortText(text) }
  }

  async generateHint(req: HintRequest): Promise<string> {
    const text = await this.generateText([
      {
        role: 'system',
        content: 'You give one short, gentle hint (under 15 words) for a young child playing a learning game. Never state the answer directly.',
      },
      { role: 'user', content: `The child is stuck on: ${req.context}. Give one short hint.` },
    ])
    return sanitizeShortText(text)
  }

  async generateVariation(req: VariationRequest): Promise<GeneratedText> {
    const text = await this.generateText([
      { role: 'system', content: 'You write one short, cheerful sentence for a young child, under 15 words.' },
      { role: 'user', content: req.prompt },
    ])
    return { text: sanitizeShortText(text) }
  }

  async generateStory(req: StoryRequest): Promise<string> {
    const text = await this.generateText([
      {
        role: 'system',
        content: 'You write one very short, happy story for a young child: 2-3 simple sentences, under 40 words total.',
      },
      { role: 'user', content: `Topic: ${req.topic}` },
    ], 160)
    return sanitizeShortText(text)
  }

  async generateDistractors(req: DistractorRequest): Promise<string[]> {
    const build = (strict: boolean): ChatMessage[] => [
      { role: 'system', content: 'You reply with only valid JSON, nothing else.' },
      {
        role: 'user',
        content: strict
          ? `Reply again with ONLY a JSON array of exactly ${req.count} short, different ${req.category} names (not "${req.correctAnswer}"). No other text.`
          : `List exactly ${req.count} different, simple ${req.category} names a young child would know, other than "${req.correctAnswer}". Reply with only a JSON array of strings, nothing else.`,
      },
    ]

    const first = await this.generateText(build(false))
    try {
      return parseDistractorArray(first, req.count, req.correctAnswer)
    } catch {
      const retry = await this.generateText(build(true))
      return parseDistractorArray(retry, req.count, req.correctAnswer)
    }
  }
}
