import type { WordLanguage } from '../exercise/ExerciseLoader'

/**
 * Letters that look alike to a beginning reader — used to make the wrong
 * choices harder to rule out at a glance once a game moves past its easy
 * rounds. Only the uppercase glyphs the app actually shows are covered.
 */
const GROUPS: Record<WordLanguage, string[][]> = {
  uk: [['И', 'Н'], ['Ш', 'Щ'], ['Г', 'Ґ'], ['Б', 'В'], ['Е', 'Є']],
  en: [['C', 'G'], ['E', 'F'], ['M', 'N'], ['O', 'Q'], ['P', 'R'], ['U', 'V']],
  es: [['C', 'G'], ['E', 'F'], ['M', 'N'], ['O', 'Q'], ['P', 'R'], ['U', 'V']],
}

/** The other letters in `letter`'s lookalike group, if it has one. */
export function lookalikesOf(language: WordLanguage, letter: string): string[] {
  const group = GROUPS[language].find((g) => g.includes(letter))
  return group ? group.filter((l) => l !== letter) : []
}
