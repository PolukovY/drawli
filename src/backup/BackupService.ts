import { db } from '../storage/DrawliDatabase'
import type { Achievement, AppSettings, ExerciseProgress, SavedDrawing } from '../storage/types'

export const BACKUP_VERSION = 1

export interface BackupDrawing extends Omit<SavedDrawing, 'thumbnail'> {
  /** Blobs cannot ride in JSON, so thumbnails travel as data URLs. */
  thumbnail?: string
}

export interface BackupFile {
  version: number
  exportedAt: string
  settings: AppSettings | null
  progress: ExerciseProgress[]
  drawings: BackupDrawing[]
  achievements: Achievement[]
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob | undefined> {
  try {
    const response = await fetch(dataUrl)
    return await response.blob()
  } catch {
    return undefined
  }
}

export async function exportBackup(): Promise<BackupFile> {
  const [settings, progress, drawings, achievements] = await Promise.all([
    db.settings.get('app'),
    db.progress.toArray(),
    db.drawings.toArray(),
    db.achievements.toArray(),
  ])

  const packed: BackupDrawing[] = await Promise.all(
    drawings.map(async ({ thumbnail, ...rest }) => ({
      ...rest,
      thumbnail: thumbnail ? await blobToDataUrl(thumbnail) : undefined,
    })),
  )

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settings ?? null,
    progress,
    drawings: packed,
    achievements,
  }
}

export function backupFilename(date = new Date()): string {
  return `drawli-backup-${date.toISOString().slice(0, 10)}.json`
}

export function downloadBackup(backup: BackupFile) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = backupFilename()
  link.click()
  URL.revokeObjectURL(url)
}

/** Nothing is written until the user confirms, so parsing stays side-effect free. */
export function parseBackup(raw: string): BackupFile | null {
  try {
    const parsed = JSON.parse(raw) as Partial<BackupFile>
    if (typeof parsed !== 'object' || parsed === null) return null
    if (parsed.version !== BACKUP_VERSION) return null
    if (!Array.isArray(parsed.drawings) || !Array.isArray(parsed.progress)) return null
    return {
      version: BACKUP_VERSION,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      settings: parsed.settings ?? null,
      progress: parsed.progress,
      drawings: parsed.drawings,
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    }
  } catch {
    return null
  }
}

/** Replace, never merge — and only after an explicit confirmation upstream. */
export async function restoreBackup(backup: BackupFile): Promise<void> {
  const drawings: SavedDrawing[] = await Promise.all(
    backup.drawings.map(async ({ thumbnail, ...rest }) => ({
      ...rest,
      thumbnail: thumbnail ? await dataUrlToBlob(thumbnail) : undefined,
    })),
  )

  await db.transaction('rw', db.settings, db.progress, db.drawings, db.achievements, async () => {
    await Promise.all([
      db.settings.clear(),
      db.progress.clear(),
      db.drawings.clear(),
      db.achievements.clear(),
    ])
    if (backup.settings) await db.settings.put(backup.settings)
    if (backup.progress.length) await db.progress.bulkPut(backup.progress)
    if (drawings.length) await db.drawings.bulkPut(drawings)
    if (backup.achievements.length) await db.achievements.bulkPut(backup.achievements)
  })
}

export async function resetEverything(): Promise<void> {
  await db.transaction('rw', db.settings, db.progress, db.drawings, db.achievements, async () => {
    await Promise.all([
      db.settings.clear(),
      db.progress.clear(),
      db.drawings.clear(),
      db.achievements.clear(),
    ])
  })
}
