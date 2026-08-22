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
