import { describe, expect, it } from 'vitest'
import { GAMES } from '../../games/catalogue'
import { buildAuditRows, lastPlayedLabel } from './auditUtils'
import type { GameStats } from '../../storage/types'

describe('buildAuditRows', () => {
  it('includes every catalogue game, zero-filled when never played', () => {
    const rows = buildAuditRows([])
    expect(rows.length).toBe(GAMES.length)
    for (const row of rows) {
      expect(row.playCount).toBe(0)
      expect(row.starsEarned).toBe(0)
      expect(row.lastPlayedAt).toBeNull()
    }
  })

  it('ranks the most-played game first', () => {
    const [a, b] = GAMES
    const stats: GameStats[] = [
      { gameId: a.id, playCount: 3, starsEarned: 4, lastPlayedAt: '2024-01-01T00:00:00Z' },
      { gameId: b.id, playCount: 9, starsEarned: 2, lastPlayedAt: '2024-01-02T00:00:00Z' },
    ]
    const rows = buildAuditRows(stats)
    expect(rows[0].game.id).toBe(b.id)
    expect(rows[1].game.id).toBe(a.id)
  })

  it('breaks a play-count tie by stars earned', () => {
    const [a, b] = GAMES
    const stats: GameStats[] = [
      { gameId: a.id, playCount: 5, starsEarned: 2, lastPlayedAt: '2024-01-01T00:00:00Z' },
      { gameId: b.id, playCount: 5, starsEarned: 8, lastPlayedAt: '2024-01-01T00:00:00Z' },
    ]
    const rows = buildAuditRows(stats)
    expect(rows[0].game.id).toBe(b.id)
  })
})

describe('lastPlayedLabel', () => {
  const now = new Date('2024-06-10T12:00:00Z')

  it('labels a null timestamp as never played', () => {
    expect(lastPlayedLabel(null, now)).toBe('never')
  })

  it('labels the same calendar day as today', () => {
    expect(lastPlayedLabel('2024-06-10T08:00:00Z', now)).toBe('today')
  })

  it('labels the previous calendar day as yesterday', () => {
    expect(lastPlayedLabel('2024-06-09T23:00:00Z', now)).toBe('yesterday')
  })

  it('labels anything older as earlier', () => {
    expect(lastPlayedLabel('2024-06-01T08:00:00Z', now)).toBe('earlier')
  })
})
