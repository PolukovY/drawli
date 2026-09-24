import { describe, expect, it } from 'vitest'
import { difficultyTier } from './difficultyTier'

describe('difficultyTier', () => {
  const tiers = [
    { from: 0, value: 5 },
    { from: 2, value: 9 },
  ]

  it('uses the first tier for early rounds', () => {
    expect(difficultyTier(0, tiers)).toBe(5)
    expect(difficultyTier(1, tiers)).toBe(5)
  })

  it('steps up once a later tier is reached', () => {
    expect(difficultyTier(2, tiers)).toBe(9)
    expect(difficultyTier(10, tiers)).toBe(9)
  })

  it('supports more than two tiers', () => {
    const three = [
      { from: 0, value: 'easy' },
      { from: 2, value: 'medium' },
      { from: 4, value: 'hard' },
    ]
    expect(difficultyTier(0, three)).toBe('easy')
    expect(difficultyTier(3, three)).toBe('medium')
    expect(difficultyTier(5, three)).toBe('hard')
  })

  it('falls back to the first tier when the round is before it', () => {
    const startsLate = [
      { from: 1, value: 'a' },
      { from: 3, value: 'b' },
    ]
    expect(difficultyTier(0, startsLate)).toBe('a')
  })
})
