/** Typed postMessage protocol between the main thread and `aiWorker.ts`. */

export interface ChatMessage {
  role: 'system' | 'user'
  content: string
}

export interface LoadCommand {
  type: 'load'
}

export interface GenerateCommand {
  type: 'generate'
  id: number
  messages: ChatMessage[]
  maxNewTokens: number
}

export interface AbortCommand {
  type: 'abort'
  id: number
}

export interface UnloadCommand {
  type: 'unload'
}

export type WorkerCommand = LoadCommand | GenerateCommand | AbortCommand | UnloadCommand

export interface ProgressEvent {
  type: 'progress'
  pct: number
}

export interface ReadyEvent {
  type: 'ready'
}

export interface ResultEvent {
  type: 'result'
  id: number
  text: string
}

export interface ErrorEvent {
  type: 'error'
  id?: number
  message: string
}

export type WorkerEvent = ProgressEvent | ReadyEvent | ResultEvent | ErrorEvent
