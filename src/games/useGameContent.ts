import { useEffect, useMemo, useState } from 'react'
import {
  loadArticles, loadIndex, loadWords, type WordLanguage,
} from '../exercise/ExerciseLoader'
import type { CategorySummary, ExerciseSummary } from '../exercise/Exercise'

/** Lines, waves and polygons are not things a word game can name. */
const ABSTRACT_CATEGORIES = new Set(['motor', 'shapes'])

export interface GameContent {
  /** Recognisable pictures only. */
  pictures: ExerciseSummary[]
  /** Every picture, including shapes — useful for counting and memory. */
  allPictures: ExerciseSummary[]
  /** Drawing categories, for games that sort pictures into groups. */
  categories: CategorySummary[]
  words: Record<string, string>
  articles: Record<string, string>
  letters: string[]
  ready: boolean
}

/** Everything a game needs from the catalogue, loaded once and shared. */
export function useGameContent(language: WordLanguage): GameContent {
  const [pictures, setPictures] = useState<ExerciseSummary[]>([])
  const [allPictures, setAllPictures] = useState<ExerciseSummary[]>([])
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [letters, setLetters] = useState<string[]>([])
  const [words, setWords] = useState<Record<string, string>>({})
  const [articles, setArticles] = useState<Record<string, string>>({})

  useEffect(() => {
    void loadIndex()
      .then((index) => {
        const drawingCategories = index.categories.filter((c) => c.kind === 'draw')
        const drawing = drawingCategories.map((c) => c.id)
        setCategories(drawingCategories)
        const namable = new Set(drawing.filter((id) => !ABSTRACT_CATEGORIES.has(id)))
        setAllPictures(index.exercises.filter((e) => drawing.includes(e.category)))
        setPictures(index.exercises.filter((e) => namable.has(e.category)))
        setLetters(
          index.exercises
            .filter((e) => e.category === `letters_${language}` && e.glyph)
            .map((e) => e.glyph as string),
        )
      })
      .catch(() => undefined)
  }, [language])

  useEffect(() => {
    void loadWords().then((all) => setWords(all[language] ?? {})).catch(() => undefined)
    if (language === 'uk') { setArticles({}); return }
    void loadArticles().then((all) => setArticles(all[language] ?? {})).catch(() => undefined)
  }, [language])

  // Memoized: a fresh object on every render makes every useMemo downstream
  // recompute, which re-seeds the round list and re-renders forever.
  return useMemo(
    () => ({
      pictures,
      allPictures,
      categories,
      words,
      articles,
      letters,
      ready: pictures.length > 0 && Object.keys(words).length > 0,
    }),
    [pictures, allPictures, categories, words, articles, letters],
  )
}
