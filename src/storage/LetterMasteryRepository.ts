import { db } from './DrawliDatabase'

const MAX_LEVEL = 2

function keyFor(language: string, letter: string): string {
  return `${language}:${letter}`
}

/** The guide level to show for a letter that has never been practiced. */
export async function getLetterLevel(language: string, letter: string): Promise<number> {
  const row = await db.letterMastery.get(keyFor(language, letter))
  return row?.level ?? 0
}

/** Called once a letter is fully traced (every step of its exercise done). */
export async function advanceLetterMastery(language: string, letter: string): Promise<number> {
  const id = keyFor(language, letter)
  return db.transaction('rw', db.letterMastery, async () => {
    const existing = await db.letterMastery.get(id)
    const level = Math.min((existing?.level ?? 0) + 1, MAX_LEVEL)
    await db.letterMastery.put({ id, language, letter, level, lastPracticedAt: new Date().toISOString() })
    return level
  })
}

/** Called when the child asks to see the guide again on a letter that had already advanced. */
export async function regressLetterMastery(language: string, letter: string): Promise<number> {
  const id = keyFor(language, letter)
  return db.transaction('rw', db.letterMastery, async () => {
    const existing = await db.letterMastery.get(id)
    const level = Math.max((existing?.level ?? 0) - 1, 0)
    await db.letterMastery.put({ id, language, letter, level, lastPracticedAt: new Date().toISOString() })
    return level
  })
}
