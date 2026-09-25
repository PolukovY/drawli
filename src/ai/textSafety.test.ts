import { describe, expect, it } from 'vitest'
import { parseDistractorArray, sanitizeShortText } from './textSafety'

describe('sanitizeShortText', () => {
  it('trims and strips formatting noise', () => {
    expect(sanitizeShortText('  "Draw a *cat*"  ')).toBe('Draw a cat')
  })

  it('collapses internal whitespace', () => {
    expect(sanitizeShortText('Draw   a\n\ncat')).toBe('Draw a cat')
  })

  it('rejects an empty generation', () => {
    expect(() => sanitizeShortText('   ')).toThrow()
  })

  it('caps overly long generations', () => {
    const long = 'a'.repeat(500)
    expect(sanitizeShortText(long).length).toBe(400)
  })

  it('rejects text containing a denylisted word', () => {
    expect(() => sanitizeShortText('Draw a stupid dog')).toThrow()
  })
})

describe('parseDistractorArray', () => {
  it('extracts a clean JSON array embedded in prose', () => {
    const raw = 'Sure! Here you go: ["dog", "fish", "bird"] enjoy!'
    expect(parseDistractorArray(raw, 3, 'cat')).toEqual(['dog', 'fish', 'bird'])
  })

  it('excludes the correct answer, case-insensitively', () => {
    const raw = '["Cat", "dog", "fish"]'
    expect(parseDistractorArray(raw, 2, 'cat')).toEqual(['dog', 'fish'])
  })

  it('drops duplicates', () => {
    const raw = '["dog", "dog", "fish"]'
    expect(parseDistractorArray(raw, 2, 'cat')).toEqual(['dog', 'fish'])
  })

  it('throws when no JSON array is present', () => {
    expect(() => parseDistractorArray('sorry, I cannot help with that', 3, 'cat')).toThrow()
  })

  it('throws when there are not enough valid entries', () => {
    expect(() => parseDistractorArray('["dog"]', 3, 'cat')).toThrow()
  })
})
