import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { artSvg } from './svg-render.mjs'
import { FARM } from './vocabulary/farm.mjs'
import { BEACH } from './vocabulary/beach.mjs'
import { SCHOOL } from './vocabulary/school.mjs'

/**
 * The vocabulary game's word banks. Two kinds of theme:
 *
 * - A whole exercise category, reused as-is: the child already has a picture
 *   and a name in three languages for every one of these, so the theme costs
 *   nothing new to build.
 * - A cross-theme list: some of the words already exist as pictures in other
 *   categories (a cow belongs to "animals" and to "farm" both), and the rest
 *   are drawn here for the first time, in the exact style `artSvg` already
 *   knows how to shade — a list of coloured regions and the ink lines that
 *   outline them, the same shape the exercise library itself is built from.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const exercisesDir = resolve(root, 'public/exercises')
const outDir = resolve(root, 'public/vocabulary')

const CATEGORY_THEMES = [
  { id: 'animals', art: '🐘', category: 'animals' },
  { id: 'home', art: '🏠', category: 'home' },
  { id: 'nature', art: '🌳', category: 'nature' },
  { id: 'food', art: '🍎', category: 'food' },
  { id: 'transport', art: '🚗', category: 'transport' },
]

const CROSS_THEMES = [
  { id: 'farm', art: '🐄', reuse: ['pig', 'cow', 'sheep', 'chick', 'duck', 'tractor', 'corn', 'carrot', 'bunny', 'bee'], custom: FARM },
  { id: 'beach', art: '🏖️', reuse: ['sun', 'shell', 'palm', 'umbrella', 'crab', 'fish', 'boat', 'icecream', 'watermelon', 'ball'], custom: BEACH },
  { id: 'school', art: '🎒', reuse: ['book', 'backpack', 'chair', 'clock', 'apple', 'bus'], custom: SCHOOL },
]

/** The exercise library's own tiers collapse to three: how many other
 *  pictures a word has to be told apart from is what makes it hard, not the
 *  step count a drawing needs. */
const DIFFICULTY_TIER = { VERY_EASY: 1, EASY: 1, MEDIUM: 2, ADVANCED: 3 }

const titleCase = (word) => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word

async function main() {
  const index = JSON.parse(await readFile(resolve(exercisesDir, 'index.json'), 'utf8'))
  const words = JSON.parse(await readFile(resolve(exercisesDir, 'words.json'), 'utf8'))
  const byId = new Map(index.exercises.map((e) => [e.id, e]))

  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  const themeIndex = []

  // Exercise thumbnails are already namespaced by exercise id in index.json
  // ("dog/thumbnail.svg"); reused straight through so nothing is duplicated
  // on disk.
  const imageFor = (id) => `exercises/${byId.get(id).thumbnail}`

  const reusedWord = (id) => {
    const exercise = byId.get(id)
    if (!exercise) throw new Error(`vocabulary reuse: no exercise "${id}"`)
    if (!words.uk[id] || !words.en[id]) throw new Error(`vocabulary reuse: "${id}" has no word text`)
    return {
      id,
      difficulty: DIFFICULTY_TIER[exercise.difficulty] ?? 2,
      image: imageFor(id),
      text: { uk: words.uk[id], en: words.en[id], es: words.es[id] ? titleCase(words.es[id]) : words.en[id] },
    }
  }

  async function writeCustomTheme(themeId, entries) {
    const dir = resolve(outDir, themeId)
    await mkdir(dir, { recursive: true })
    const words = []
    for (const entry of entries) {
      const file = `${entry.id}.svg`
      await writeFile(resolve(dir, file), artSvg(entry.regions, entry.steps ?? []))
      words.push({
        id: entry.id,
        difficulty: entry.difficulty,
        image: `vocabulary/${themeId}/${file}`,
        text: entry.title,
      })
    }
    return words
  }

  for (const theme of CATEGORY_THEMES) {
    const ids = index.exercises.filter((e) => e.category === theme.category).map((e) => e.id)
    const list = ids.map((id) => reusedWord(id))
    list.sort((a, b) => a.difficulty - b.difficulty)
    await writeFile(resolve(outDir, `${theme.id}.json`), `${JSON.stringify(list, null, 2)}\n`)
    themeIndex.push({ id: theme.id, titleKey: `vocabulary.theme.${theme.id}`, art: theme.art, count: list.length })
  }

  for (const theme of CROSS_THEMES) {
    const reused = theme.reuse.map((id) => reusedWord(id))
    const custom = await writeCustomTheme(theme.id, theme.custom)
    const list = [...reused, ...custom]
    list.sort((a, b) => a.difficulty - b.difficulty)
    await writeFile(resolve(outDir, `${theme.id}.json`), `${JSON.stringify(list, null, 2)}\n`)
    themeIndex.push({ id: theme.id, titleKey: `vocabulary.theme.${theme.id}`, art: theme.art, count: list.length })
  }

  await writeFile(resolve(outDir, 'index.json'), `${JSON.stringify({ version: 1, themes: themeIndex }, null, 2)}\n`)

  const summary = themeIndex.map((t) => `${t.id}=${t.count}`).join(' ')
  console.log(`generated ${themeIndex.length} vocabulary themes, ${themeIndex.reduce((n, t) => n + t.count, 0)} words (${summary})`)
}

await main()
