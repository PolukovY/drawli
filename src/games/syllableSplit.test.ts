import { describe, expect, it } from 'vitest'
import { splitIntoSyllables } from './syllableSplit'

describe('splitIntoSyllables', () => {
  it('splits Ukrainian words the open-syllable way', () => {
    expect(splitIntoSyllables('Кошеня', 'uk')).toEqual(['Ко', 'ше', 'ня'])
    expect(splitIntoSyllables('Молоко', 'uk')).toEqual(['Мо', 'ло', 'ко'])
    expect(splitIntoSyllables('Вікно', 'uk')).toEqual(['Ві', 'кно'])
    expect(splitIntoSyllables('Поїзд', 'uk')).toEqual(['По', 'їзд'])
  })

  it('leaves a one-vowel Ukrainian word whole', () => {
    expect(splitIntoSyllables('Стіл', 'uk')).toEqual(['Стіл'])
  })

  it('splits English words, doubling consonants apart and blends together', () => {
    expect(splitIntoSyllables('Rabbit', 'en')).toEqual(['Rab', 'bit'])
  })

  it('folds a trailing silent e into English words\' last syllable', () => {
    expect(splitIntoSyllables('Cake', 'en')).toEqual(['Cake'])
  })

  it('splits Spanish words, keeping onset blends and splitting invalid clusters', () => {
    expect(splitIntoSyllables('CARTA', 'es')).toEqual(['CAR', 'TA'])
    expect(splitIntoSyllables('PROBLEMA', 'es')).toEqual(['PRO', 'BLE', 'MA'])
  })

  it('never loses or duplicates a letter — the chunks always rebuild the word', () => {
    const words: [string, 'uk' | 'en' | 'es'][] = [
      ['Кошеня', 'uk'], ['Молоко', 'uk'], ['Вікно', 'uk'], ["М'яч", 'uk'],
      ['Rabbit', 'en'], ['Cake', 'en'], ['Butterfly', 'en'],
      ['CARTA', 'es'], ['PROBLEMA', 'es'], ['GATO', 'es'],
    ]
    for (const [word, language] of words) {
      expect(splitIntoSyllables(word, language).join('')).toBe(word)
    }
  })

  it('returns nothing for an empty word', () => {
    expect(splitIntoSyllables('', 'uk')).toEqual([])
  })
})
