import type { WordLanguage } from '../exercise/ExerciseLoader'

/** One word to learn: a picture, and its name in every language the game plays in. */
export interface VocabWord {
  id: string
  /** 1 easiest, 3 hardest — how early it turns up and how many pictures it competes against. */
  difficulty: 1 | 2 | 3
  /** Relative to BASE_URL, already namespaced ("exercises/dog/thumbnail.svg" or "vocabulary/farm/rooster.svg"). */
  image: string
  text: Record<WordLanguage, string>
}

export interface VocabTheme {
  id: string
  titleKey: string
  /** An emoji, the same convention the games catalogue uses for its cards. */
  art: string
  count: number
}

export interface VocabularyIndex {
  version: 1
  themes: VocabTheme[]
}
