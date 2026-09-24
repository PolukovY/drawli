import { describe, expect, it } from 'vitest'
import { lookalikesOf } from './confusableLetters'

describe('lookalikesOf', () => {
  it('returns the other letters in a lookalike group', () => {
    expect(lookalikesOf('en', 'C')).toEqual(['G'])
    expect(lookalikesOf('en', 'G')).toEqual(['C'])
  })

  it('returns an empty list for a letter with no known lookalike', () => {
    expect(lookalikesOf('en', 'A')).toEqual([])
  })

  it('covers Ukrainian groups too', () => {
    expect(lookalikesOf('uk', 'Ш')).toEqual(['Щ'])
    expect(lookalikesOf('uk', 'Я')).toEqual([])
  })
})
