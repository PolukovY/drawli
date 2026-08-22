import { db } from './DrawliDatabase'
import type { DrawingDocument, SavedDrawing } from './types'

export async function getDrawing(id: string): Promise<SavedDrawing | undefined> {
  return db.drawings.get(id)
}

export async function findInProgress(exerciseId: string): Promise<SavedDrawing | undefined> {
  const rows = await db.drawings.where('exerciseId').equals(exerciseId).toArray()
  return rows.find((d) => d.status === 'IN_PROGRESS')
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
}

export async function deleteDrawing(id: string): Promise<void> {
  await db.drawings.delete(id)
}
