import type { Exercise, ExerciseIndex } from './Exercise'

/** Paths must resolve under the Pages base ("/drawli/"), never from the root. */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}exercises/${path}`
}

let indexPromise: Promise<ExerciseIndex> | null = null
const exerciseCache = new Map<string, Promise<Exercise>>()
const svgCache = new Map<string, Promise<string>>()

/** The library only ever needs the manifest; steps and SVGs load on demand. */
export function loadIndex(): Promise<ExerciseIndex> {
  if (!indexPromise) {
    indexPromise = fetch(assetUrl('index.json')).then((r) => {
      if (!r.ok) throw new Error(`exercise index ${r.status}`)
      return r.json() as Promise<ExerciseIndex>
    })
  }
  return indexPromise
}

export function loadExercise(id: string): Promise<Exercise> {
  let promise = exerciseCache.get(id)
  if (!promise) {
    promise = fetch(assetUrl(`${id}/exercise.json`)).then((r) => {
      if (!r.ok) throw new Error(`exercise ${id} ${r.status}`)
      return r.json() as Promise<Exercise>
    })
    exerciseCache.set(id, promise)
  }
  return promise
}

/** SVG markup is inlined, not <img>-loaded: the player restyles and hit-tests it. */
export function loadSvg(exerciseId: string, file: string): Promise<string> {
  const key = `${exerciseId}/${file}`
  let promise = svgCache.get(key)
  if (!promise) {
    promise = fetch(assetUrl(key)).then((r) => {
      if (!r.ok) throw new Error(`svg ${key} ${r.status}`)
      return r.text()
    })
    svgCache.set(key, promise)
  }
  return promise
}

export type WordLanguage = 'uk' | 'en' | 'es'

let wordsPromise: Promise<Record<WordLanguage, Record<string, string>>> | null = null

/** Picture names per language — including Spanish, which the UI itself has not. */
export function loadWords(): Promise<Record<WordLanguage, Record<string, string>>> {
  if (!wordsPromise) {
    wordsPromise = fetch(assetUrl('words.json')).then((r) => {
      if (!r.ok) throw new Error(`words ${r.status}`)
      return r.json() as Promise<Record<WordLanguage, Record<string, string>>>
    })
  }
  return wordsPromise
}

let articlesPromise: Promise<Record<'en' | 'es', Record<string, string>>> | null = null

/** Articles per picture: 'a' / 'an' for English, 'el' / 'la' for Spanish. */
export function loadArticles(): Promise<Record<'en' | 'es', Record<string, string>>> {
  if (!articlesPromise) {
    articlesPromise = fetch(assetUrl('articles.json')).then((r) => {
      if (!r.ok) throw new Error(`articles ${r.status}`)
      return r.json() as Promise<Record<'en' | 'es', Record<string, string>>>
    })
  }
  return articlesPromise
}

export interface PaintRegion {
  id: string
  color: string
  number: number
}

let regionsPromise: Promise<Record<string, PaintRegion[]>> | null = null

/** Which colour belongs to which region — the key to colour-by-numbers. */
export function loadRegions(): Promise<Record<string, PaintRegion[]>> {
  if (!regionsPromise) {
    regionsPromise = fetch(assetUrl('regions.json')).then((r) => {
      if (!r.ok) throw new Error(`regions ${r.status}`)
      return r.json() as Promise<Record<string, PaintRegion[]>>
    })
  }
  return regionsPromise
}
