import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, Achievement, ExerciseProgress, SavedDrawing } from './types'

export class DrawliDatabase extends Dexie {
  drawings!: EntityTable<SavedDrawing, 'id'>
  progress!: EntityTable<ExerciseProgress, 'exerciseId'>
  settings!: EntityTable<AppSettings, 'id'>
  achievements!: EntityTable<Achievement, 'id'>

  constructor() {
    super('drawli')
    this.version(1).stores({
      drawings: 'id, exerciseId, status, updatedAt',
      progress: 'exerciseId, status, updatedAt',
      settings: 'id',
      achievements: 'id, type',
    })
  }
}

export const db = new DrawliDatabase()
