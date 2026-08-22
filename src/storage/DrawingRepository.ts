import { db } from './DrawliDatabase'
import type { DrawingDocument, SavedDrawing } from './types'

/**
 * Screens that list drawings need to know when one is written. Autosave can
 * land a moment after the child has already navigated away, so a screen that
 * only reads on mount shows yesterday's picture.
 */
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribeDrawings(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  for (const listener of listeners) listener()
}

export async function getDrawing(id: string): Promise<SavedDrawing | undefined> {
  return db.drawings.get(id)
}

export async function findInProgress(exerciseId: string): Promise<SavedDrawing | undefined> {
  const rows = await db.drawings.where('exerciseId').equals(exerciseId).toArray()
  // Most recent wins: a child can have several unfinished sheets of the same
  // kind, and the one they were last on is the one they mean to continue.
  return rows
    .filter((d) => d.status === 'IN_PROGRESS')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
}

export async function latestInProgress(): Promise<SavedDrawing | undefined> {
  const rows = await db.drawings.where('status').equals('IN_PROGRESS').toArray()
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
}

export async function listDrawings(): Promise<SavedDrawing[]> {
  const rows = await db.drawings.toArray()
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function saveDrawing(drawing: SavedDrawing): Promise<void> {
  await db.drawings.put(drawing)
  notify()
}

export async function upsertDrawing(params: {
  id: string
  exerciseId: string
  currentStep: number
  document: DrawingDocument
  stepBaselines?: number[]
  status?: SavedDrawing['status']
  thumbnail?: Blob
}): Promise<void> {
  const now = new Date().toISOString()
  const existing = await db.drawings.get(params.id)
  await db.drawings.put({
    id: params.id,
    exerciseId: params.exerciseId,
    status: params.status ?? existing?.status ?? 'IN_PROGRESS',
    currentStep: params.currentStep,
    stepBaselines: params.stepBaselines ?? existing?.stepBaselines,
    document: params.document,
    thumbnail: params.thumbnail ?? existing?.thumbnail,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  })
  notify()
}

export async function deleteDrawing(id: string): Promise<void> {
  await db.drawings.delete(id)
  notify()
}
