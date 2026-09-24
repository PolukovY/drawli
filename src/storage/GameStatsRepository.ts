import { db } from './DrawliDatabase'
import type { GameStats } from './types'

/**
 * Called once when a game screen opens, from `GameShell`. Wrapped in a
 * transaction (rather than a bare get-then-put) so it can never race with
 * `addGameStars` and silently drop one of the two updates.
 */
export async function recordGamePlay(gameId: string): Promise<void> {
  await db.transaction('rw', db.gameStats, async () => {
    const existing = await db.gameStats.get(gameId)
    const lastPlayedAt = new Date().toISOString()
    if (existing) {
      await db.gameStats.put({ ...existing, playCount: existing.playCount + 1, lastPlayedAt })
    } else {
      await db.gameStats.put({ gameId, playCount: 1, starsEarned: 0, lastPlayedAt })
    }
  })
}

/** Called whenever a game's own `earned` stars total goes up mid-session. */
export async function addGameStars(gameId: string, delta: number): Promise<void> {
  if (delta <= 0) return
  await db.transaction('rw', db.gameStats, async () => {
    const existing = await db.gameStats.get(gameId)
    if (existing) {
      await db.gameStats.put({ ...existing, starsEarned: existing.starsEarned + delta })
    } else {
      await db.gameStats.put({ gameId, playCount: 0, starsEarned: delta, lastPlayedAt: new Date().toISOString() })
    }
  })
}

export async function listGameStats(): Promise<GameStats[]> {
  return db.gameStats.toArray()
}
