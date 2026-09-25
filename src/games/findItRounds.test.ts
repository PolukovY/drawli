import { describe, expect, it } from 'vitest'
import { buildFindItRound } from './findItRounds'
import type { FindItAttributes } from './findItAttributes'

// Every color has a small and a big member, so a same-color and a
// same-size decoy (of a different color) both always exist for any target.
const items: FindItAttributes[] = [
  { id: 'a', color: 'red', size: 'small' },
  { id: 'b', color: 'red', size: 'big' },
  { id: 'c', color: 'yellow', size: 'small' },
  { id: 'd', color: 'yellow', size: 'big' },
  { id: 'e', color: 'gray', size: 'small' },
  { id: 'f', color: 'gray', size: 'big' },
  { id: 'g', color: 'blue', size: 'small' },
  { id: 'h', color: 'blue', size: 'big' },
]

describe('buildFindItRound', () => {
  it('returns null when there are fewer than 4 items', () => {
    expect(buildFindItRound(items.slice(0, 3), 1, 0)).toBeNull()
  })

  it('always includes the target among 4 choices', () => {
    const round = buildFindItRound(items, 1, 0)
    expect(round?.choices).toHaveLength(4)
    expect(round?.choices.map((c) => c.id)).toContain(round?.target.id)
  })

  it('is deterministic for a given seed', () => {
    expect(buildFindItRound(items, 42, 1)).toEqual(buildFindItRound(items, 42, 1))
  })

  it('includes a same-color decoy at tier 1 when one exists', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const round = buildFindItRound(items, seed, 1)!
      const sameColorDecoys = round.choices.filter(
        (c) => c.id !== round.target.id && c.color === round.target.color,
      )
      expect(sameColorDecoys.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('includes both a same-color and a same-size decoy at tier 2 when both exist', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const round = buildFindItRound(items, seed, 2)!
      const others = round.choices.filter((c) => c.id !== round.target.id)
      const sameColor = others.some((c) => c.color === round.target.color)
      const sameSize = others.some((c) => c.size === round.target.size)
      expect(sameColor).toBe(true)
      expect(sameSize).toBe(true)
    }
  })
})
