export type SoundPosition = 'start' | 'middle' | 'end'

/**
 * Where a letter's sound sits in a word — 'start' (the first character),
 * 'end' (the last), or 'middle' (strictly between). Returns null when the
 * letter doesn't appear at all, or when it appears in more than one of
 * those three zones: a word like that makes a bad round for a game asking
 * "where is it?", since more than one answer would be defensible.
 */
export function findSoundPosition(word: string, letter: string): SoundPosition | null {
  if (!word || !letter) return null
  const upperWord = word.toUpperCase()
  const upperLetter = letter.toUpperCase()
  const positions = new Set<SoundPosition>()

  for (let i = 0; i < upperWord.length; i += 1) {
    if (upperWord[i] !== upperLetter) continue
    if (i === 0) positions.add('start')
    else if (i === upperWord.length - 1) positions.add('end')
    else positions.add('middle')
  }

  if (positions.size !== 1) return null
  const [only] = positions
  return only
}
