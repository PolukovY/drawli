import type { VocabularyIndex, VocabWord } from './Vocabulary'

/**
 * Vocabulary pictures live in their own tree, but a good few of them are the
 * exercise library's own thumbnails — pointed at directly rather than copied,
 * so a redraw of an exercise reaches this game too. `image` already carries
 * whichever prefix it needs ("exercises/…" or "vocabulary/…"), so loading it
 * is just BASE_URL plus the path, unlike `assetUrl` in ExerciseLoader which
 * always assumes "exercises/".
 */
export function vocabularyMediaUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}

let indexPromise: Promise<VocabularyIndex> | null = null
const themeCache = new Map<string, Promise<VocabWord[]>>()

export function loadVocabularyIndex(): Promise<VocabularyIndex> {
  if (!indexPromise) {
    indexPromise = fetch(vocabularyMediaUrl('vocabulary/index.json')).then((r) => {
      if (!r.ok) throw new Error(`vocabulary index ${r.status}`)
      return r.json() as Promise<VocabularyIndex>
    })
  }
  return indexPromise
}

export function loadVocabularyTheme(themeId: string): Promise<VocabWord[]> {
  let promise = themeCache.get(themeId)
  if (!promise) {
    promise = fetch(vocabularyMediaUrl(`vocabulary/${themeId}.json`)).then((r) => {
      if (!r.ok) throw new Error(`vocabulary theme ${themeId} ${r.status}`)
      return r.json() as Promise<VocabWord[]>
    })
    themeCache.set(themeId, promise)
  }
  return promise
}
