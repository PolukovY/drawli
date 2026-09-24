import { db } from './DrawliDatabase'
import type { LearningStats } from './types'

function keyFor(gameId: string, itemId: string): string {
  return `${gameId}:${itemId}`
}

/** Called when a round shows an item, whether or not the child gets it right. */
export async function recordItemSeen(gameId: string, itemId: string): Promise<void> {
  const id = keyFor(gameId, itemId)
  await db.transaction('rw', db.learningStats, async () => {
    const existing = await db.learningStats.get(id)
    const lastSeenAt = new Date().toISOString()
    if (existing) {
      await db.learningStats.put({ ...existing, seenCount: existing.seenCount + 1, lastSeenAt })
    } else {
      await db.learningStats.put({ id, gameId, itemId, seenCount: 1, missCount: 0, lastSeenAt })
    }
  })
}

/** Called on a wrong pick, for the item that was actually being asked about. */
export async function recordItemMissed(gameId: string, itemId: string): Promise<void> {
  const id = keyFor(gameId, itemId)
  await db.transaction('rw', db.learningStats, async () => {
    const existing = await db.learningStats.get(id)
    if (existing) {
      await db.learningStats.put({ ...existing, missCount: existing.missCount + 1 })
    } else {
      await db.learningStats.put({
        id, gameId, itemId, seenCount: 0, missCount: 1, lastSeenAt: new Date().toISOString(),
      })
    }
  })
}

/** Every item's practice history for one game, keyed by item id. */
export async function listLearningStats(gameId: string): Promise<Record<string, LearningStats>> {
  const rows = await db.learningStats.where('gameId').equals(gameId).toArray()
  const byItem: Record<string, LearningStats> = {}
  for (const row of rows) byItem[row.itemId] = row
  return byItem
}
