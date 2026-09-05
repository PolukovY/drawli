import { describe, expect, it } from 'vitest'
import { checkGateAnswer, groupPhotosByDay, makeGateQuestion } from './photoUtils'
import type { ChildPhoto } from '../../storage/types'
import { PHOTO_EFFECTS, EFFECT_COLLECTIONS, effectById } from './effects'
import { MAX_DECORATIONS, STICKERS } from './stickers'

function photoAt(id: string, iso: string): ChildPhoto {
  return {
    id,
    createdAt: iso,
    originalImage: new Blob(),
    processedImage: new Blob(),
    thumbnail: new Blob(),
    width: 640,
    height: 480,
    selectedEffect: null,
    decorations: [],
  }
}

describe('groupPhotosByDay', () => {
  const now = new Date('2024-06-10T12:00:00Z')

  it('buckets by calendar day relative to now', () => {
    const groups = groupPhotosByDay([
      photoAt('a', '2024-06-10T08:00:00Z'),
      photoAt('b', '2024-06-09T08:00:00Z'),
      photoAt('c', '2024-06-01T08:00:00Z'),
    ], now)

    expect(groups.map((g) => g.key)).toEqual(['today', 'yesterday', 'earlier'])
    expect(groups[0].photos.map((p) => p.id)).toEqual(['a'])
    expect(groups[1].photos.map((p) => p.id)).toEqual(['b'])
    expect(groups[2].photos.map((p) => p.id)).toEqual(['c'])
  })

  it('drops empty groups instead of showing a blank header', () => {
    const groups = groupPhotosByDay([photoAt('a', '2024-06-10T08:00:00Z')], now)
    expect(groups).toHaveLength(1)
    expect(groups[0].key).toBe('today')
  })

  it('returns nothing for an empty gallery', () => {
    expect(groupPhotosByDay([], now)).toEqual([])
  })
})

describe('parental gate', () => {
  it('generates single-digit addends', () => {
    for (let i = 0; i < 50; i += 1) {
      const q = makeGateQuestion(Math.random)
      expect(q.a).toBeGreaterThanOrEqual(2)
      expect(q.a).toBeLessThanOrEqual(8)
      expect(q.b).toBeGreaterThanOrEqual(2)
      expect(q.b).toBeLessThanOrEqual(8)
    }
  })

  it('accepts the correct sum and rejects everything else', () => {
    const question = { a: 4, b: 3 }
    expect(checkGateAnswer(question, '7')).toBe(true)
    expect(checkGateAnswer(question, ' 7 ')).toBe(true)
    expect(checkGateAnswer(question, '8')).toBe(false)
    expect(checkGateAnswer(question, '')).toBe(false)
    expect(checkGateAnswer(question, 'seven')).toBe(false)
  })
})

describe('photo effects', () => {
  it('has a "no effect" option first', () => {
    expect(PHOTO_EFFECTS[0].id).toBe('none')
    expect(PHOTO_EFFECTS[0].filter).toBe('none')
  })

  it('has unique ids', () => {
    const ids = PHOTO_EFFECTS.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers every listed collection at least once', () => {
    const used = new Set(PHOTO_EFFECTS.map((e) => e.collection))
    for (const collection of EFFECT_COLLECTIONS) {
      expect(used.has(collection.id)).toBe(true)
    }
  })

  it('falls back to "no effect" for an unknown or null id', () => {
    expect(effectById(null).id).toBe('none')
    expect(effectById('does-not-exist').id).toBe('none')
  })
})

describe('stickers', () => {
  it('offers 15-20 stickers, per the feature spec', () => {
    expect(STICKERS.length).toBeGreaterThanOrEqual(15)
    expect(STICKERS.length).toBeLessThanOrEqual(20)
  })

  it('has no duplicate stickers', () => {
    expect(new Set(STICKERS).size).toBe(STICKERS.length)
  })

  it('caps decorations within the sticker count', () => {
    expect(MAX_DECORATIONS).toBeLessThanOrEqual(STICKERS.length)
    expect(MAX_DECORATIONS).toBeGreaterThanOrEqual(5)
  })
})
