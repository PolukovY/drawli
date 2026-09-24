import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, Achievement, ChildPhoto, ExerciseProgress, GameStats, SavedDrawing } from './types'

export class DrawliDatabase extends Dexie {
  drawings!: EntityTable<SavedDrawing, 'id'>
  progress!: EntityTable<ExerciseProgress, 'exerciseId'>
  settings!: EntityTable<AppSettings, 'id'>
  achievements!: EntityTable<Achievement, 'id'>
  photos!: EntityTable<ChildPhoto, 'id'>
  gameStats!: EntityTable<GameStats, 'gameId'>

  constructor() {
    super('drawli')
    this.version(1).stores({
      drawings: 'id, exerciseId, status, updatedAt',
      progress: 'exerciseId, status, updatedAt',
      settings: 'id',
      achievements: 'id, type',
    })
    // Photo Studio's gallery, added later — a fresh store, so the existing
    // tables are simply restated rather than migrated.
    this.version(2).stores({
      drawings: 'id, exerciseId, status, updatedAt',
      progress: 'exerciseId, status, updatedAt',
      settings: 'id',
      achievements: 'id, type',
      photos: 'id, createdAt',
    })
    // Games audit: how often each game gets played, added later — again a
    // fresh store restated alongside the existing ones rather than migrated.
    this.version(3).stores({
      drawings: 'id, exerciseId, status, updatedAt',
      progress: 'exerciseId, status, updatedAt',
      settings: 'id',
      achievements: 'id, type',
      photos: 'id, createdAt',
      gameStats: 'gameId',
    })
  }
}

export const db = new DrawliDatabase()
