import type { WordLanguage } from '../exercise/ExerciseLoader'

const VOWEL_CHARS: Record<WordLanguage, string> = {
  uk: 'АЕЄИІЇОУЮЯ',
  en: 'AEIOUY',
  es: 'AEIOUÁÉÍÓÚÜ',
}

/**
 * Two-letter consonant blends that stay together at the start of a
 * syllable rather than splitting across two — "pro-ble-ma", not "prob-le-ma".
 */
const ONSET_CLUSTERS: Partial<Record<WordLanguage, ReadonlySet<string>>> = {
  en: new Set(['BL', 'BR', 'CH', 'CL', 'CR', 'DR', 'FL', 'FR', 'GL', 'GR', 'PH', 'PL', 'PR', 'SC', 'SH', 'SK', 'SL', 'SM', 'SN', 'SP', 'ST', 'SW', 'TH', 'TR', 'TW', 'WH', 'WR']),
  es: new Set(['BL', 'BR', 'CH', 'CL', 'CR', 'DR', 'FL', 'FR', 'GL', 'GR', 'LL', 'PL', 'PR', 'RR', 'TR']),
}

function isVowel(ch: string, language: WordLanguage): boolean {
  return VOWEL_CHARS[language].includes(ch.toUpperCase())
}

/**
 * Splits a word into syllables for reading practice. This is a teaching
 * approximation, not a dictionary lookup:
 *
 * - Ukrainian follows the open-syllable convention Ukrainian primers use —
 *   every consonant between two vowels moves to the *following* syllable
 *   ("ко-ше-ня", "ві-кно"), and each vowel letter is its own syllable (no
 *   grouping into diphthongs, since Ukrainian mostly doesn't have them).
 * - English and Spanish group a run of vowel letters into one syllable (a
 *   stand-in for real diphthongs), keep a short list of unsplittable onset
 *   blends together ("pro-ble-ma"), and otherwise split a consonant run
 *   down the middle ("rab-bit", "car-ta").
 *
 * English also folds a trailing silent "e" into the last syllable instead
 * of scanning it as a vowel of its own — the same simplification the
 * syllable-*counting* game already makes, so the two stay consistent (both
 * miss words like "apple" that are two syllables despite the silent e).
 */
export function splitIntoSyllables(word: string, language: WordLanguage): string[] {
  if (!word) return []
  const upper = word.toUpperCase()
  const scanLen = language === 'en' && /[^AEIOUY]E$/u.test(upper) ? word.length - 1 : word.length

  const nuclei: { start: number; end: number }[] = []
  let i = 0
  while (i < scanLen) {
    if (!isVowel(upper[i], language)) { i += 1; continue }
    let end = i + 1
    if (language !== 'uk') {
      while (end < scanLen && isVowel(upper[end], language)) end += 1
    }
    nuclei.push({ start: i, end })
    i = end
  }

  if (nuclei.length <= 1) return [word]

  const clusters = ONSET_CLUSTERS[language]
  const boundaries: number[] = []
  for (let n = 0; n < nuclei.length - 1; n += 1) {
    const consStart = nuclei[n].end
    const consEnd = nuclei[n + 1].start
    const runLength = consEnd - consStart

    if (runLength <= 1 || language === 'uk') {
      boundaries.push(consStart)
    } else if (runLength === 2) {
      const pair = upper.slice(consStart, consEnd)
      boundaries.push(clusters?.has(pair) ? consStart : consStart + 1)
    } else {
      const tail = upper.slice(consEnd - 2, consEnd)
      boundaries.push(clusters?.has(tail) ? consEnd - 2 : consEnd - 1)
    }
  }

  const chunks: string[] = []
  let start = 0
  for (const boundary of boundaries) {
    chunks.push(word.slice(start, boundary))
    start = boundary
  }
  chunks.push(word.slice(start))
  return chunks
}
