import { describe, expect, it } from 'vitest'
import { findSoundPosition } from './soundPosition'

describe('findSoundPosition', () => {
  it('finds a sound at the start', () => {
    expect(findSoundPosition('Зима', 'З')).toBe('start')
  })

  it('finds a sound at the end', () => {
    expect(findSoundPosition('Віз', 'З')).toBe('end')
  })

  it('finds a sound in the middle', () => {
    expect(findSoundPosition('Коза', 'З')).toBe('middle')
  })

  it('is case-insensitive', () => {
    expect(findSoundPosition('зима', 'з')).toBe('start')
    expect(findSoundPosition('Зима', 'з')).toBe('start')
  })

  it('returns null when the letter is missing', () => {
    expect(findSoundPosition('Кіт', 'З')).toBeNull()
  })

  it('returns null when the letter appears in more than one zone', () => {
    // 'а' is both the first letter and a middle letter — an ambiguous round.
    expect(findSoundPosition('Ананас', 'а')).toBeNull()
  })

  it('treats every occurrence in the same zone as unambiguous', () => {
    // Every 'а' in "Барабан" falls strictly between the first and last letter.
    expect(findSoundPosition('Барабан', 'а')).toBe('middle')
  })

  it('returns null for an empty word or letter', () => {
    expect(findSoundPosition('', 'З')).toBeNull()
    expect(findSoundPosition('Зима', '')).toBeNull()
  })
})
