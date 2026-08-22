import { db } from './DrawliDatabase'
import type { ExerciseProgress } from './types'

export async function getProgress(exerciseId: string): Promise<ExerciseProgress | undefined> {
  return db.progress.get(exerciseId)
}

export async function listProgress(): Promise<ExerciseProgress[]> {
  return db.progress.toArray()
}

export async function markStarted(exerciseId: string, currentStep: number): Promise<void> {
  const now = new Date().toISOString()
  const existing = await db.progress.get(exerciseId)
  if (existing?.status === 'COMPLETED') {
    await db.progress.put({ ...existing, currentStep, updatedAt: now })
    return
  }
  await db.progress.put({
    exerciseId,
    status: 'IN_PROGRESS',
    currentStep,
    timesCompleted: existing?.timesCompleted ?? 0,
    startedAt: existing?.startedAt ?? now,
    completedAt: existing?.completedAt,
    updatedAt: now,
  })
}

/** Returns the star award: 10 the first time, 2 for every repeat. */
export async function markCompleted(exerciseId: string, totalSteps: number): Promise<number> {
  const now = new Date().toISOString()
  const existing = await db.progress.get(exerciseId)
  const firstTime = existing?.status !== 'COMPLETED'

  await db.progress.put({
    exerciseId,
    status: 'COMPLETED',
    currentStep: totalSteps,
    timesCompleted: (existing?.timesCompleted ?? 0) + 1,
    startedAt: existing?.startedAt ?? now,
    completedAt: now,
    updatedAt: now,
  })

  return firstTime ? 10 : 2
}
