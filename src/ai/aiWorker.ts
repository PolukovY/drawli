/// <reference lib="webworker" />
import { env, pipeline, type TextGenerationPipeline } from '@huggingface/transformers'
import { MODEL_DTYPE, MODEL_ID } from './model'
import type { WorkerCommand, WorkerEvent } from './workerProtocol'

// Always fetch from the Hugging Face hub, cached by the browser's own Cache
// Storage — never bundled with the app (see vite.config.ts: the workbox
// precache globs never touch these files, so the first install stays small).
env.allowLocalModels = false
env.useBrowserCache = true
// Single-threaded WASM: the threaded build needs cross-origin isolation
// (COOP/COEP headers), which GitHub Pages does not offer. This is the
// documented way to opt out and keep the WASM path working everywhere.
if (env.backends.onnx?.wasm) env.backends.onnx.wasm.numThreads = 1

let generator: TextGenerationPipeline | null = null
let abortedId = -1

function post(event: WorkerEvent): void {
  postMessage(event)
}

async function load(): Promise<void> {
  if (generator) {
    post({ type: 'ready' })
    return
  }
  try {
    generator = await pipeline('text-generation', MODEL_ID, {
      dtype: MODEL_DTYPE,
      device: 'wasm',
      progress_callback: (progress: { status: string; progress?: number }) => {
        if (progress.status === 'progress' && typeof progress.progress === 'number') {
          post({ type: 'progress', pct: Math.round(progress.progress) })
        }
      },
    })
    post({ type: 'ready' })
  } catch (error) {
    generator = null
    post({ type: 'error', message: error instanceof Error ? error.message : 'model load failed' })
  }
}

self.onmessage = async (event: MessageEvent<WorkerCommand>) => {
  const command = event.data
  switch (command.type) {
    case 'load':
      await load()
      return
    case 'unload':
      generator = null
      return
    case 'abort':
      abortedId = command.id
      return
    case 'generate': {
      const { id, messages, maxNewTokens } = command
      if (!generator) {
        post({ type: 'error', id, message: 'model not loaded' })
        return
      }
      try {
        const output = await generator(messages, {
          max_new_tokens: maxNewTokens,
          do_sample: false,
        })
        if (abortedId === id) return
        const last = Array.isArray(output) ? output[0] : output
        const generatedMessages = (last as { generated_text: unknown }).generated_text
        const finalMessage = Array.isArray(generatedMessages)
          ? generatedMessages[generatedMessages.length - 1]
          : undefined
        const text = typeof finalMessage === 'object' && finalMessage && 'content' in finalMessage
          ? String((finalMessage as { content: unknown }).content)
          : String(generatedMessages ?? '')
        post({ type: 'result', id, text: text.trim() })
      } catch (error) {
        if (abortedId === id) return
        post({ type: 'error', id, message: error instanceof Error ? error.message : 'generation failed' })
      }
      return
    }
  }
}
