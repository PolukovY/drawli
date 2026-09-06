import { describe, expect, it } from 'vitest'
import { PHOTO_SCENES, sceneById } from './scenes'

describe('photo scenes', () => {
  it('offers many scenes, per "багато шаблонів"', () => {
    expect(PHOTO_SCENES.length).toBeGreaterThanOrEqual(8)
  })

  it('has unique ids', () => {
    const ids = PHOTO_SCENES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps every slot fully inside the scene square', () => {
    for (const scene of PHOTO_SCENES) {
      expect(scene.slot.x).toBeGreaterThanOrEqual(0)
      expect(scene.slot.y).toBeGreaterThanOrEqual(0)
      expect(scene.slot.x + scene.slot.w).toBeLessThanOrEqual(1)
      expect(scene.slot.y + scene.slot.h).toBeLessThanOrEqual(1)
      expect(scene.slot.w).toBeGreaterThan(0)
      expect(scene.slot.h).toBeGreaterThan(0)
    }
  })

  it('keeps every prop centered inside the scene square with a positive size', () => {
    for (const scene of PHOTO_SCENES) {
      for (const prop of scene.props) {
        expect(prop.x).toBeGreaterThanOrEqual(0)
        expect(prop.x).toBeLessThanOrEqual(1)
        expect(prop.y).toBeGreaterThanOrEqual(0)
        expect(prop.y).toBeLessThanOrEqual(1)
        expect(prop.size).toBeGreaterThan(0)
      }
    }
  })

  it('gives every scene at least one prop and a preview emoji', () => {
    for (const scene of PHOTO_SCENES) {
      expect(scene.props.length).toBeGreaterThan(0)
      expect(scene.previewEmoji.length).toBeGreaterThan(0)
    }
  })

  it('finds a scene by id, and falls back to null otherwise', () => {
    expect(sceneById('toyroom')?.id).toBe('toyroom')
    expect(sceneById('does-not-exist')).toBeNull()
    expect(sceneById(null)).toBeNull()
  })
})
