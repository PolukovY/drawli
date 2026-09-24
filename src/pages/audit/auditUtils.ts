import { GAMES, type GameEntry } from '../../games/catalogue'
import type { GameStats } from '../../storage/types'

export interface AuditRow {
  game: GameEntry
  playCount: number
  starsEarned: number
  lastPlayedAt: string | null
}

/**
 * Every catalogue game, joined with its stats — zero-filled for a game never
 * played, so the audit list always shows the full catalogue, not just the
 * games a stats row happens to exist for. Ranked most-played first, ties
 * broken by stars earned.
 */
export function buildAuditRows(stats: GameStats[]): AuditRow[] {
  const byId = new Map(stats.map((s) => [s.gameId, s]))
  return GAMES
    .map((game) => {
      const stat = byId.get(game.id)
      return {
        game,
        playCount: stat?.playCount ?? 0,
        starsEarned: stat?.starsEarned ?? 0,
        lastPlayedAt: stat?.lastPlayedAt ?? null,
      }
    })
    .sort((a, b) => b.playCount - a.playCount || b.starsEarned - a.starsEarned)
}

export type LastPlayedLabel = 'today' | 'yesterday' | 'earlier' | 'never'

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** "Сьогодні" / "Учора" / an actual date / "ще жодного разу" — same day-bucketing as the photo gallery. */
export function lastPlayedLabel(iso: string | null, now: Date = new Date()): LastPlayedLabel {
  if (!iso) return 'never'
  const day = startOfDay(new Date(iso))
  const today = startOfDay(now)
  if (day === today) return 'today'
  if (day === today - 24 * 60 * 60 * 1000) return 'yesterday'
  return 'earlier'
}
