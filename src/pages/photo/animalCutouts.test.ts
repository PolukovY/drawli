import { describe, expect, it } from 'vitest'
import { ANIMAL_CUTOUTS, cutoutById } from './animalCutouts'

describe('animal cutouts', () => {
  it('offers a real handful of animals', () => {
    expect(ANIMAL_CUTOUTS.length).toBeGreaterThanOrEqual(6)
  })

  it('has unique ids', () => {
    const ids = ANIMAL_CUTOUTS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps every face hole fully inside the canvas', () => {
    for (const cutout of ANIMAL_CUTOUTS) {
      const { cx, cy, r } = cutout.faceSlot
      expect(cx - r).toBeGreaterThanOrEqual(0)
      expect(cy - r).toBeGreaterThanOrEqual(0)
      expect(cx + r).toBeLessThanOrEqual(1)
      expect(cy + r).toBeLessThanOrEqual(1)
      expect(r).toBeGreaterThan(0)
    }
  })

  it('gives every cutout a preview emoji', () => {
    for (const cutout of ANIMAL_CUTOUTS) {
      expect(cutout.previewEmoji.length).toBeGreaterThan(0)
    }
  })

  it('finds a cutout by id, and falls back to null otherwise', () => {
    expect(cutoutById('lion')?.id).toBe('lion')
    expect(cutoutById('does-not-exist')).toBeNull()
    expect(cutoutById(null)).toBeNull()
  })
})
