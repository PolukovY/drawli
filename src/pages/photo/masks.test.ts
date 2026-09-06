import { describe, expect, it } from 'vitest'
import { ANIMAL_MASKS, MASK_SCALE } from './masks'

describe('animal masks', () => {
  it('offers a real handful of animals to become', () => {
    expect(ANIMAL_MASKS.length).toBeGreaterThanOrEqual(10)
  })

  it('has no duplicate masks', () => {
    expect(new Set(ANIMAL_MASKS).size).toBe(ANIMAL_MASKS.length)
  })

  it('is scaled up enough to plausibly cover a face', () => {
    expect(MASK_SCALE).toBeGreaterThan(1.5)
  })
})
