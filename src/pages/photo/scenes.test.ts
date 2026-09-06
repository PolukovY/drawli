import { describe, expect, it } from 'vitest'
import { PHOTO_SCENES, sceneById } from './scenes'

describe('photo scenes', () => {
  it('has unique ids', () => {
    const ids = PHOTO_SCENES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps every slot fully inside the canvas', () => {
    for (const scene of PHOTO_SCENES) {
      expect(scene.slot.x).toBeGreaterThanOrEqual(0)
      expect(scene.slot.y).toBeGreaterThanOrEqual(0)
      expect(scene.slot.x + scene.slot.w).toBeLessThanOrEqual(1)
      expect(scene.slot.y + scene.slot.h).toBeLessThanOrEqual(1)
      expect(scene.slot.w).toBeGreaterThan(0)
      expect(scene.slot.h).toBeGreaterThan(0)
    }
  })

  it('keeps every prop position inside the canvas', () => {
    for (const scene of PHOTO_SCENES) {
      for (const prop of scene.props) {
        expect(prop.x).toBeGreaterThanOrEqual(0)
        expect(prop.x).toBeLessThanOrEqual(1)
        expect(prop.y).toBeGreaterThanOrEqual(0)
        expect(prop.y).toBeLessThanOrEqual(1)
      }
    }
  })

  it('falls back to null for an unknown or null id', () => {
    expect(sceneById(null)).toBeNull()
    expect(sceneById('does-not-exist')).toBeNull()
  })

  it('finds a known scene by id', () => {
    expect(sceneById('party')?.id).toBe('party')
  })
})
